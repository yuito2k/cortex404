from os import getenv
from typing import Final

from dotenv import load_dotenv

load_dotenv()


class Config:
    PG_DB: Final = getenv("PG_DB", "")
    PG_HOST: Final = getenv("PG_HOST", "")
    PG_USER: Final = getenv("PG_USER", "")
    PG_PASS: Final = getenv("PG_PASS", "")
    PG_PORT: Final = getenv("PG_PORT", "")

    # ── Supabase ─────────────────────────────────────────────────────────
    SUPABASE_URL: Final = getenv("SUPABASE_URL", "")
    SUPABASE_SERVICE_KEY: Final = getenv("SUPABASE_SERVICE_KEY", "")

    # ── Output image dimensions (A4 at 150 DPI) ───────────────────────────
    # These define the canonical warped-image space all coordinates are
    # expressed in. Must match omr_template_generator.py PAGE_W / PAGE_H.
    OUT_W: Final    = 1240          # px  (595.27 pt × 150/72)
    OUT_H: Final    = 1754          # px  (841.89 pt × 150/72)
    PAGE_W: Final   = 595.27        # pt  — PDF page width
    PAGE_H: Final   = 841.89        # pt  — PDF page height

    # ── OMR strip geometry (must match omr_template_generator.py) ────────
    # The sheet is split: OMR strip (top OMR_H pt) + question area below.
    # The bottom anchor squares sit at CUT_Y, NOT at the page bottom.
    # This means the warp maps only the OMR strip, not the full page.
    OMR_H: Final          = 315.0
    CUT_Y: Final          = PAGE_H - OMR_H          # 526.89 pt
    ANCHOR_SIZE: Final    = 14.0
    ANCHOR_MARGIN: Final  = 18.0

    # Anchor CENTRE positions in PDF coordinates.
    # The perspective warp maps these 4 centres to the 4 corners of the
    # output image, so ALL coordinate maths must use these as the reference
    # frame — NOT the page corners.
    AX_LEFT: Final   = ANCHOR_MARGIN + ANCHOR_SIZE / 2          # 25.0  pt
    AX_RIGHT: Final  = PAGE_W - ANCHOR_MARGIN - ANCHOR_SIZE / 2 # 570.27 pt
    AY_TOP: Final    = PAGE_H - ANCHOR_MARGIN - ANCHOR_SIZE / 2 # 816.89 pt
    AY_BOTTOM: Final = CUT_Y  + ANCHOR_SIZE / 2                 # 533.89 pt

    # ── Anchor detection ─────────────────────────────────────────────────
    # Anchor squares are 14×14 pt solid black rectangles at page corners.
    # We filter contours by fraction of total image area so the detector
    # works regardless of how close/far the phone was held.
    ANCHOR_MIN_AREA_FRAC: Final  = 0.00005   # min fraction of total image area
    ANCHOR_MAX_AREA_FRAC: Final  = 0.012     # max fraction of total image area
    ANCHOR_MIN_SOLIDITY: Final   = 0.80      # filled squares are very solid
    ANCHOR_MAX_ASPECT: Final     = 1.9       # max(w,h)/min(w,h) — squares are ~1.0

    # ── Bubble detection ─────────────────────────────────────────────────
    # Radius used when sampling each bubble (in warped-image pixels).
    # Set slightly smaller than the actual bubble radius so we sample only
    # the interior and avoid clipping the circle outline.
    BUBBLE_RADIUS_FRAC: Final    = 0.60      # fraction of template radius to sample

    # Fill-ratio thresholds
    # FILL_THRESHOLD: raise for PDF screenshots (empty outlines read ~0.4–0.5),
    # lower to ~0.30 for real printed+photographed sheets where ink is heavy
    # and empty bubbles are near 0.05.  Calibrate from your first real print.
    FILL_THRESHOLD: Final  = 0.65   # bubble must exceed this to be considered filled
    MIN_DOMINANCE: Final   = 0.20   # filled bubble must beat second-best by this gap
    #                          (replaces the brittle DOUBLE_MARK_RATIO approach)

    # ── Server ───────────────────────────────────────────────────────────
    #HOST = os.getenv("HOST", "0.0.0.0")
    #PORT = int(os.getenv("PORT", 8000))

