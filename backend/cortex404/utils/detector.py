"""
detector.py — Core computer-vision pipeline for Cortex404 OMR reading.

Full pipeline
─────────────
  1. load_image        bytes → BGR ndarray
  2. preprocess        BGR → binary (ink=white on black BG)
  3. find_anchors      binary → 4 corner points [TL, TR, BL, BR]
  4. dewarp            perspective-correct to standard A4 pixel space
  5. decode_qr         warped → sheet_code string
  6. detect_answers    warped + bubble_coords → per-question fill ratios
  7. score_sheet       fill ratios + answer key → graded result dict

All coordinate arithmetic uses the canonical warped-image space defined
in config.py (OUT_W × OUT_H at 150 DPI).  PDF-point bubble coordinates
from the manifest are converted to pixels via SCALE_X / SCALE_Y.
"""

import cv2
import numpy as np
from pyzbar import pyzbar as _pyzbar
from typing import Optional

from cortex404.config import Config

cfg = Config


# ─────────────────────────────────────────────────────────────────────────────
# 1. Image loading
# ─────────────────────────────────────────────────────────────────────────────

def load_image(data: bytes) -> np.ndarray:
    arr = np.frombuffer(data, np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Could not decode the uploaded image. Ensure it is a JPEG or PNG.")
    return img


# ─────────────────────────────────────────────────────────────────────────────
# 2. Preprocessing
# ─────────────────────────────────────────────────────────────────────────────

def preprocess(img: np.ndarray) -> np.ndarray:
    """
    Returns a binary image where ink / dark regions are WHITE (255)
    and the paper background is BLACK (0).

    Adaptive thresholding is used so the result is robust to uneven
    lighting, shadows from phone angle, and flash hotspots.
    """
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Mild blur removes JPEG artefacts without smearing ink edges
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)

    # Adaptive threshold: ink appears dark → inverted so ink = 255
    binary = cv2.adaptiveThreshold(
        blurred, 255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY_INV,
        blockSize=51,   # large block handles gradual shadow gradients
        C=10,
    )

    # Small morphological close: fills tiny gaps inside the anchor squares
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    binary = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel, iterations=1)

    return binary


# ─────────────────────────────────────────────────────────────────────────────
# 3. Anchor detection
# ─────────────────────────────────────────────────────────────────────────────

def find_anchors(binary: np.ndarray) -> list[tuple[int, int]]:
    """
    Locate the four solid black corner squares printed on every OMR sheet.
    Returns [TL, TR, BL, BR] as (cx, cy) integer tuples in the
    original (un-warped) image coordinate space.

    Strategy
    --------
    • Find all external contours in the binary image.
    • Filter by area (relative to full image) and shape (square, solid).
    • Of all candidates, assign one to each corner by minimising
      squared distance to the image corners.
    """
    h, w = binary.shape[:2]
    total_area = h * w

    contours, _ = cv2.findContours(
        binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
    )

    candidates: list[tuple[int, int]] = []

    for cnt in contours:
        area = cv2.contourArea(cnt)

        # ── Area gate ────────────────────────────────────────────
        if not (cfg.ANCHOR_MIN_AREA_FRAC * total_area
                < area <
                cfg.ANCHOR_MAX_AREA_FRAC * total_area):
            continue

        # ── Shape gate: must be roughly square ───────────────────
        bx, by, bw, bh = cv2.boundingRect(cnt)
        aspect = max(bw, bh) / (min(bw, bh) + 1e-9)
        if aspect > cfg.ANCHOR_MAX_ASPECT:
            continue

        # ── Solidity gate: filled squares are highly solid ────────
        hull_area = cv2.contourArea(cv2.convexHull(cnt))
        if hull_area < 1:
            continue
        if area / hull_area < cfg.ANCHOR_MIN_SOLIDITY:
            continue

        cx = bx + bw // 2
        cy = by + bh // 2
        candidates.append((cx, cy))

    if len(candidates) < 4:
        raise ValueError(
            f"Anchor detection failed: found {len(candidates)} candidates "
            f"(need ≥ 4). Check that all four corner marks are visible, "
            f"unobscured, and the sheet is well-lit."
        )

    # Assign one candidate to each corner (TL, TR, BL, BR)
    image_corners = [(0, 0), (w, 0), (0, h), (w, h)]
    assigned: list[tuple[int, int]] = []
    used: set[int] = set()

    for ic_x, ic_y in image_corners:
        best_i = min(
            (i for i in range(len(candidates)) if i not in used),
            key=lambda i: (candidates[i][0] - ic_x) ** 2
                        + (candidates[i][1] - ic_y) ** 2,
        )
        used.add(best_i)
        assigned.append(candidates[best_i])

    return assigned  # [TL, TR, BL, BR]


# ─────────────────────────────────────────────────────────────────────────────
# 4. Perspective dewarp
# ─────────────────────────────────────────────────────────────────────────────

def dewarp(img: np.ndarray, anchors: list[tuple[int, int]]) -> np.ndarray:
    """
    Apply a perspective transform so the OMR sheet fills the canonical
    OUT_W × OUT_H space exactly, correcting tilt and keystoning.
    """
    tl, tr, bl, br = anchors

    src = np.array([tl, tr, bl, br], dtype=np.float32)
    dst = np.array([
        [0,          0],
        [cfg.OUT_W,  0],
        [0,          cfg.OUT_H],
        [cfg.OUT_W,  cfg.OUT_H],
    ], dtype=np.float32)

    M = cv2.getPerspectiveTransform(src, dst)
    return cv2.warpPerspective(img, M, (cfg.OUT_W, cfg.OUT_H))


# ─────────────────────────────────────────────────────────────────────────────
# 5. QR decode
# ─────────────────────────────────────────────────────────────────────────────

def decode_qr(warped: np.ndarray) -> Optional[str]:
    """
    Decode the sheet_code QR from the warped image.

    Uses coordinate-derived crops so the QR region is always exact
    regardless of image size, with Otsu binary preprocessing which
    outperforms colour decoding on real printed sheets.
    """
    # QR template geometry (must match omr_template_generator.py)
    QR_SIZE    = 56      # pt
    QR_TOP_GAP = 44      # pt
    QR_LEFT_X  = 55      # pt  (left QR x from page left)
    PAD        = 20      # px  padding around crop

    # Convert QR corners to warped-image pixel coordinates
    qr_y_pt = cfg.PAGE_H - QR_TOP_GAP - QR_SIZE   # bottom edge in PDF pts

    def _to_px(x_pt, y_pt):
        px = int((x_pt   - cfg.AX_LEFT)  / (cfg.AX_RIGHT  - cfg.AX_LEFT)  * cfg.OUT_W)
        py = int((cfg.AY_TOP - y_pt)     / (cfg.AY_TOP    - cfg.AY_BOTTOM) * cfg.OUT_H)
        return px, py

    _, py_top = _to_px(0, qr_y_pt + QR_SIZE)   # top edge
    _, py_bot = _to_px(0, qr_y_pt)              # bottom edge
    y1 = max(0, py_top - PAD)
    y2 = min(cfg.OUT_H, py_bot + PAD)

    # Left QR x bounds
    lx1, _ = _to_px(QR_LEFT_X,            0)
    lx2, _ = _to_px(QR_LEFT_X + QR_SIZE,  0)

    # Right QR x bounds
    right_x_pt = cfg.PAGE_W - QR_LEFT_X - QR_SIZE
    rx1, _ = _to_px(right_x_pt,            0)
    rx2, _ = _to_px(right_x_pt + QR_SIZE,  0)

    h, w = warped.shape[:2]

    def _decode_crop(x1, x2):
        crop = warped[y1:y2, max(0,x1-PAD):min(w,x2+PAD)]
        if crop.size == 0:
            return None
        gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
        _, bw = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        for img in (bw, gray, crop):
            for obj in _pyzbar.decode(img):
                if obj.type == "QRCODE":
                    return obj.data.decode("utf-8").strip()
        return None

    return _decode_crop(lx1, lx2) or _decode_crop(rx1, rx2)


# ─────────────────────────────────────────────────────────────────────────────
# 6. Bubble detection
# ─────────────────────────────────────────────────────────────────────────────

def _pt_to_px(x_pt: float, y_pt: float) -> tuple[int, int]:
    """
    Convert a PDF-point coordinate to a pixel coordinate in the warped image.

    WHY THIS IS NOT SIMPLY (x * SCALE_X, (PAGE_H - y) * SCALE_Y)
    ──────────────────────────────────────────────────────────────
    The perspective warp maps the 4 anchor CENTRES to the 4 corners of the
    output image (0,0) → (OUT_W, OUT_H).  The anchor centres are NOT at the
    page corners — they are inset by (anchor_margin + anchor_size/2) from
    the edges.  Using the page corners as the reference frame shifts every
    bubble sample point by ~400 px in Y, causing the detector to read
    completely wrong regions of the image (header text, QR code, etc.).

    The correct mapping is a linear interpolation between the anchor-centre
    positions in PDF space and the output-image pixel space:

        px = (x_pt  - AX_LEFT  ) / (AX_RIGHT  - AX_LEFT  ) * OUT_W
        py = (AY_TOP - y_pt    ) / (AY_TOP    - AY_BOTTOM ) * OUT_H
    """
    px = int((x_pt  - cfg.AX_LEFT)  / (cfg.AX_RIGHT  - cfg.AX_LEFT)  * cfg.OUT_W)
    py = int((cfg.AY_TOP - y_pt)    / (cfg.AY_TOP    - cfg.AY_BOTTOM) * cfg.OUT_H)
    return px, py


def _fill_ratio(binary: np.ndarray, cx: int, cy: int, radius: int) -> float:
    """
    Return the fraction of pixels inside a circle that are dark (ink).
    `binary` is an already-thresholded image (255 = ink, 0 = paper),
    computed once per sheet with global Otsu in detect_answers().
    """
    h, w = binary.shape
    mask = np.zeros((h, w), dtype=np.uint8)
    cv2.circle(mask, (cx, cy), radius, 255, -1)
    dark  = int(np.count_nonzero(binary[mask > 0]))
    total = int(np.count_nonzero(mask))
    return dark / (total + 1e-9)


def detect_answers(warped: np.ndarray, bubble_coords: dict) -> dict:
    """
    Sample every bubble in `bubble_coords["mcq"]` and determine which
    option (if any) the student filled in for each question.

    Returns
    -------
    {
      1: {
            "selected":    "B",
            "fill_ratios": {"A":0.04, "B":0.67, "C":0.05, "D":0.03},
            "confidence":  0.93,
            "status":      "ok",   # ok | skipped | double_mark
         },
      ...
    }
    """
    gray = cv2.cvtColor(warped, cv2.COLOR_BGR2GRAY)

    # Global Otsu threshold computed once for the whole sheet.
    # This is far more stable than per-bubble local Otsu when some
    # bubbles are empty (no contrast → local Otsu behaves randomly).
    _, binary = cv2.threshold(
        gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU
    )

    template_radius_pt = 4.8
    # Derive pixel scale from anchor span (X direction is most stable)
    scale_x = cfg.OUT_W / (cfg.AX_RIGHT - cfg.AX_LEFT)
    radius_px = max(int(template_radius_pt * scale_x * cfg.BUBBLE_RADIUS_FRAC), 5)

    results: dict = {}
    mcq: dict = bubble_coords.get("mcq", {})

    for qno_str, opts in mcq.items():
        qno  = int(qno_str)
        fill = {}

        for opt, coord in opts.items():
            x_pt, y_pt = coord[0], coord[1]
            px, py = _pt_to_px(x_pt, y_pt)
            fill[opt] = round(_fill_ratio(binary, px, py, radius_px), 4)

        sorted_opts = sorted(fill.items(), key=lambda kv: kv[1], reverse=True)
        best_opt,   best_ratio   = sorted_opts[0]
        _,          second_ratio = sorted_opts[1] if len(sorted_opts) > 1 else ("", 0.0)

        dominance = best_ratio - second_ratio   # absolute gap

        if best_ratio < cfg.FILL_THRESHOLD:
            status, selected = "skipped", None
        elif dominance < cfg.MIN_DOMINANCE:
            # Two or more bubbles are too similar → ambiguous / double-mark
            status, selected = "double_mark", None
        else:
            status, selected = "ok", best_opt

        confidence = round(dominance / (best_ratio + 1e-9), 3) if selected else 0.0

        results[qno] = {
            "selected":    selected,
            "fill_ratios": fill,
            "confidence":  confidence,
            "status":      status,
        }

    return results


# ─────────────────────────────────────────────────────────────────────────────
# 7. Scoring
# ─────────────────────────────────────────────────────────────────────────────

_OPTIONS = ["A", "B", "C", "D"]


def score_sheet(
    detected:    dict,
    answer_key:  list[int],    # 0-indexed correct option per question
    question_ids: list[int],
) -> dict:
    """
    Compare detected selections against the answer key.

    Returns a rich result dict ready to be stored in omr_sheets and
    returned to the Nuxt front-end.
    """
    correct = wrong = skipped = flagged = 0
    question_results = []

    for idx, (qid, correct_idx) in enumerate(zip(question_ids, answer_key)):
        qno         = idx + 1
        det         = detected.get(qno, {})
        selected    = det.get("selected")
        status      = det.get("status", "skipped")
        correct_opt = _OPTIONS[correct_idx]

        if status == "double_mark":
            flagged += 1
            outcome  = "flagged"
        elif selected is None:
            skipped += 1
            outcome  = "skipped"
        elif selected == correct_opt:
            correct += 1
            outcome  = "correct"
        else:
            wrong += 1
            outcome  = "wrong"

        question_results.append({
            "qno":          qno,
            "question_id":  qid,
            "correct_opt":  correct_opt,
            "selected_opt": selected,
            "fill_ratios":  det.get("fill_ratios", {}),
            "outcome":      outcome,
            "confidence":   det.get("confidence", 0.0),
        })

    total = len(answer_key)
    return {
        "score":            correct,
        "total":            total,
        "correct_count":    correct,
        "wrong_count":      wrong,
        "skipped_count":    skipped,
        "flagged_count":    flagged,
        "percentage":       round(correct / total * 100, 2) if total else 0.0,
        "needs_review":     flagged > 0,
        "question_results": question_results,
    }


# ─────────────────────────────────────────────────────────────────────────────
# Public entry point
# ─────────────────────────────────────────────────────────────────────────────

def process_sheet(
    image_bytes:  bytes,
    manifest:     dict,
    answer_key:   list[int],
    question_ids: list[int],
) -> dict:
    """
    Full pipeline: raw image bytes → graded result dict.

    `manifest` must contain at minimum:
        {"sheet_code": "...", "bubble_coords": { "mcq": { "1": {"A":[x,y], ...}, ...} }}
    which is exactly what omr_sheets.bubble_coords stores.
    """
    img     = load_image(image_bytes)
    binary  = preprocess(img)
    anchors = find_anchors(binary)
    warped  = dewarp(img, anchors)

    # Try QR decode; fall back to manifest value (useful for re-processing)
    sheet_code = decode_qr(warped) or manifest.get("sheet_code", "unknown")

    detected = detect_answers(warped, manifest["bubble_coords"])
    result   = score_sheet(detected, answer_key, question_ids)
    result["sheet_code"] = sheet_code
    return result
