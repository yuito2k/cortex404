"""
omr_template_generator.py  (v3)

Layout
──────
Page 1
  ┌─────────────────────────────────────────┐  ← page top
  │ [anchor] CORTEX404  exam info  [anchor] │
  │ [QR]  Roll | Reg | MCQ bubbles  [QR]   │  OMR_H = 315 pt
  │ [timing track]               [track]   │
  ├────────────── ✂ cut line ──────────────┤  ← CUT_Y
  │  Q1  ·  ·  ·  │  Q11  ·  ·  ·         │
  │  Q2            │  Q12                  │  2-column question area
  │  …             │  …                    │
  │  Q10           │  Q20                  │
  └─────────────────────────────────────────┘

Page 2  (only if more than 20 questions)
  ┌─────────────────────────────────────────┐
  │  [Instruction image — same height]      │  OMR_H
  ├─────────────────────────────────────────┤
  │  Q21           │  Q24                  │
  │  Q22           │  Q25                  │
  │  Q23           │                       │
  └─────────────────────────────────────────┘

Run:
    pip install reportlab qrcode[pil] --break-system-packages
    python omr_template_generator.py
"""

import json
import textwrap
from io import BytesIO
from pathlib import Path

import qrcode
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas

PAGE_W, PAGE_H = A4  # 595.27 × 841.89 pt

# ── Master layout constants ───────────────────────────────────────────────────
OMR_H = 315  # height of the OMR strip from page top
CUT_Y = PAGE_H - OMR_H  # y of cut line  (≈ 526.89)
CUT_LINE_Y = CUT_Y - 15  # cut line only, independent. Adjust 25 to taste
Q_TOP = CUT_LINE_Y - 20  # first question row top (≈ 516.89)
Q_BOT = 45  # bottom of question area
Q_SLOT_H = 62  # height per question slot (text + 2 option rows)
Q_FONT = 8.5  # question body font size
Q_LH = 11.0  # line height inside a question slot
Q_NUM_W = 16  # width reserved for "N." number prefix
Q_OPT_H = 10.5  # line height for option rows
MID_X = PAGE_W / 2  # 297.64 — center divider x
MARGIN_L = 50
MARGIN_R = PAGE_W - MARGIN_L  # 545.27
COL_GAP = 6  # gap each side of center divider
Q_L_X = MARGIN_L  # left col: left edge
Q_L_RX = MID_X - COL_GAP  # left col: right edge  (≈ 291.64)
Q_R_X = MID_X + COL_GAP  # right col: left edge  (≈ 303.64)
Q_R_RX = MARGIN_R  # right col: right edge

BRAND_GRAY = colors.HexColor("#6b6b6b")
RULE_GRAY = colors.HexColor("#cccccc")

# ── OMR bubble grid parameters ────────────────────────────────────────────────
GRID = {
    "y0": PAGE_H - 135,  # top of bubble grids  (≈ 706.89)
    "row_h": 16,  # vertical pitch between bubble centres
    "rows": 10,  # digits 0-9 per column
    "radius": 4.8,
    "roll_step": 16,  # horizontal pitch per roll-digit column
    "roll_cols": 6,
    "reg_step": 13,  # horizontal pitch per reg-digit column
    "reg_cols": 10,
    "sec_gap": 10,  # gap between major sections
    "mcq_lw": 16,  # width of the "No." label area
    "mcq_og": 12,  # option gap (A/B/C/D bubble centres)
    "mcq_rows": 10,  # questions per MCQ column group
}

TEMPLATE = {
    "version": "v3",
    "page": {"width": PAGE_W, "height": PAGE_H},
    "omr_h": OMR_H,
    "cut_y": CUT_Y,  # used by anchors + timing track
    "cut_line_y": CUT_LINE_Y,  # used by draw_cut_line only
    "anchor_size": 14,
    "anchor_margin": 18,
    "timing_track": {"x_inset": 34, "dash_w": 8, "dash_h": 4, "pitch": 9},
    "qr": {"size": 56, "top_gap": 44, "left_x": 55},
    "grid": GRID,
}


# ─────────────────────────────────────────────────────────────────────────────
# OMR section
# ─────────────────────────────────────────────────────────────────────────────


def _make_qr(code):
    img = qrcode.make(code, border=1).convert("RGB")
    buf = BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return ImageReader(buf)


def draw_anchors(c, t):
    """Solid corner squares at the four corners of the OMR strip."""
    s, m = t["anchor_size"], t["anchor_margin"]
    w, h, cy = t["page"]["width"], t["page"]["height"], t["cut_y"]
    c.setFillColor(colors.black)
    for x, y in [
        (m, h - m - s),  # top-left
        (w - m - s, h - m - s),  # top-right
        (m, cy),  # bottom-left  (sits on cut line)
        (w - m - s, cy),  # bottom-right
    ]:
        c.rect(x, y, s, s, fill=1, stroke=0)


def draw_timing_track(c, t):
    """Alternating dash pattern on left and right margins of the OMR strip."""
    tt = t["timing_track"]
    h, cy = t["page"]["height"], t["cut_y"]
    top = h - t["anchor_margin"] - t["anchor_size"] - 14
    bottom = cy + t["anchor_size"] + 6
    lx = tt["x_inset"]
    rx = t["page"]["width"] - tt["x_inset"] - tt["dash_w"]
    c.setFillColor(colors.black)
    y = top
    while y > bottom:
        c.rect(lx, y, tt["dash_w"], tt["dash_h"], fill=1, stroke=0)
        c.rect(rx, y, tt["dash_w"], tt["dash_h"], fill=1, stroke=0)
        y -= tt["pitch"]


def draw_qr_codes(c, t, sheet_code):
    q = t["qr"]
    h, w = t["page"]["height"], t["page"]["width"]
    qy = h - q["top_gap"] - q["size"]
    reader = _make_qr(sheet_code)
    c.drawImage(reader, q["left_x"], qy, q["size"], q["size"])
    c.drawImage(reader, w - q["left_x"] - q["size"], qy, q["size"], q["size"])


def draw_header(c, t, sheet_code, exam_title, student_name, student_id):
    h, w = t["page"]["height"], t["page"]["width"]
    cx = w / 2

    # ── Brand name: "CORTEX" black + "404" gray, precisely centred ──
    fn, fs = "Helvetica-Bold", 18
    cw = stringWidth("CORTEX", fn, fs)
    fw = stringWidth("404", fn, fs)
    sx = cx - (cw + fw) / 2
    c.setFont(fn, fs)
    c.setFillColor(colors.black)
    c.drawString(sx, h - 38, "CORTEX")
    c.setFillColor(BRAND_GRAY)
    c.drawString(sx + cw, h - 38, "404")

    # Tagline
    c.setFont("Helvetica", 6.5)
    c.setFillColor(BRAND_GRAY)
    c.drawCentredString(cx, h - 50, "L E A R N   ·   B U I L D   ·   E N G I N E E R")

    # Exam info
    c.setFillColor(colors.black)
    c.setFont("Helvetica-Bold", 12)
    c.drawCentredString(cx, h - 68, exam_title)

    c.setFont("Helvetica", 8.5)
    c.drawCentredString(cx, h - 81, "MCQ Answer Sheet")

    c.setFont("Helvetica", 7.5)
    c.setFillColor(BRAND_GRAY)
    c.drawCentredString(cx, h - 93, f"Sheet code:  {sheet_code}")

    # Name / ID line
    c.setFillColor(colors.black)
    c.setFont("Helvetica", 8.5)
    c.drawString(MARGIN_L, h - 110, f"Name: {student_name}")
    c.drawRightString(MARGIN_R, h - 110, f"Student ID: {student_id}")

    # Thin separator
    c.setStrokeColor(RULE_GRAY)
    c.setLineWidth(0.5)
    c.line(MARGIN_L, h - 118, MARGIN_R, h - 118)
    c.setStrokeColor(colors.black)
    c.setLineWidth(1)


def _draw_digit_grid(c, x0, y0, n_cols, step, g):
    """Draws one digit-bubble section; returns x after the last column."""
    for col in range(n_cols):
        cx = x0 + col * step + step / 2
        for digit in range(g["rows"]):
            cy = y0 - digit * g["row_h"] - g["row_h"] / 2
            c.circle(cx, cy, g["radius"], stroke=1, fill=0)
            c.setFont("Helvetica", 6.2)
            c.drawCentredString(cx, cy - 2.2, str(digit))
    return x0 + n_cols * step


def _draw_mcq_group(c, x0, y0, q_start, n_rows, g):
    """Draws one MCQ column group; returns (next_x, coord_dict)."""
    coords = {}
    lx = x0 + g["mcq_lw"]
    for row in range(n_rows):
        qno = q_start + row
        cy = y0 - row * g["row_h"] - g["row_h"] / 2
        c.setFont("Helvetica", 7.5)
        c.setFillColor(colors.black)
        c.drawString(x0, cy - 2.8, str(qno))
        coords[qno] = {}
        for i, opt in enumerate(["A", "B", "C", "D"]):
            cx = lx + i * g["mcq_og"]
            c.circle(cx, cy, g["radius"], stroke=1, fill=0)
            c.setFont("Helvetica", 5.8)
            c.setFillAlpha(0.25)
            c.drawCentredString(cx, cy - 2.1, opt)
            c.setFillAlpha(1.0)
            coords[qno][opt] = (cx, cy)
    next_x = x0 + g["mcq_lw"] + 4 * g["mcq_og"] + g["sec_gap"]
    return next_x, coords


def draw_omr_grids(c, t, n_questions):
    """
    Draws roll/reg/MCQ bubble grids, horizontally centred.
    Returns (bubble_coords, grid_bottom_y).
    """
    g = t["grid"]
    y0 = g["y0"]
    n_mcq_groups = -(-n_questions // g["mcq_rows"])  # ceiling div

    # Total content width → centre it
    cw = (
        g["roll_cols"] * g["roll_step"]
        + g["sec_gap"]
        + g["reg_cols"] * g["reg_step"]
        + g["sec_gap"]
        + n_mcq_groups * (g["mcq_lw"] + 4 * g["mcq_og"] + g["sec_gap"])
    )
    x = (PAGE_W - cw) / 2

    grid_h = g["rows"] * g["row_h"]

    # ── Roll number ────────────────────────────────────────────────
    rw = g["roll_cols"] * g["roll_step"]
    c.setFont("Helvetica-Bold", 7.5)
    c.setFillColor(colors.black)
    c.drawCentredString(x + rw / 2, y0 + 5, "Roll Number")
    x = _draw_digit_grid(c, x, y0, g["roll_cols"], g["roll_step"], g)

    # Thin section divider
    c.setStrokeColor(RULE_GRAY)
    c.setLineWidth(0.5)
    c.line(x + g["sec_gap"] / 2, y0 + 12, x + g["sec_gap"] / 2, y0 - grid_h)
    c.setStrokeColor(colors.black)
    c.setLineWidth(1)
    x += g["sec_gap"]

    # ── Registration number ────────────────────────────────────────
    regw = g["reg_cols"] * g["reg_step"]
    c.setFont("Helvetica-Bold", 7.5)
    c.drawCentredString(x + regw / 2, y0 + 5, "Registration Number")
    x = _draw_digit_grid(c, x, y0, g["reg_cols"], g["reg_step"], g)

    # Thin section divider
    c.setStrokeColor(RULE_GRAY)
    c.setLineWidth(0.5)
    c.line(x + g["sec_gap"] / 2, y0 + 12, x + g["sec_gap"] / 2, y0 - grid_h)
    c.setStrokeColor(colors.black)
    c.setLineWidth(1)
    x += g["sec_gap"]

    # ── MCQ bubble groups ──────────────────────────────────────────
    bubble_coords = {}
    remaining, q_start = n_questions, 1
    while remaining > 0:
        n_rows = min(g["mcq_rows"], remaining)
        c.setFont("Helvetica-Bold", 7.5)
        c.setFillColor(colors.black)
        c.drawString(x + 8, y0 + 5, "No.")
        c.drawString(x + g["mcq_lw"] + 8, y0 + 5, "Answer")
        x, coords = _draw_mcq_group(c, x, y0, q_start, n_rows, g)
        bubble_coords.update(coords)
        q_start += n_rows
        remaining -= n_rows

    return bubble_coords, y0 - grid_h


def draw_cut_line(c, t):
    """Dashed cut line with scissors icon at the OMR/question boundary."""
    w, y = t["page"]["width"], t["cut_line_y"]  # ← was t["cut_y"]
    c.setDash(4, 3)
    c.setLineWidth(0.6)
    c.setStrokeColor(colors.black)
    c.line(MARGIN_L + 22, y, w - MARGIN_L, y)
    c.setDash()
    c.setLineWidth(1)
    # Scissors glyph
    sx = MARGIN_L + 11
    c.line(sx - 5, y - 5, sx + 5, y + 5)
    c.line(sx - 5, y + 5, sx + 5, y - 5)
    c.circle(sx - 6, y - 6, 2.5, stroke=1, fill=0)
    c.circle(sx - 6, y + 6, 2.5, stroke=1, fill=0)


# ─────────────────────────────────────────────────────────────────────────────
# Question section
# ─────────────────────────────────────────────────────────────────────────────


def _draw_question(c, x_l, x_r, y_top, qno, text, options):
    txt_x   = x_l + Q_NUM_W
    col_w   = x_r - x_l
    txt_w   = col_w - Q_NUM_W
    chars   = max(int(txt_w / (Q_FONT * 0.52)), 20)
    q_lines = textwrap.wrap(text, width=chars) or [text[:chars]]

    c.setFont("Helvetica-Bold", Q_FONT)
    c.setFillColor(colors.black)
    c.drawString(x_l, y_top - Q_LH, f"{qno}.")

    c.setFont("Helvetica", Q_FONT)
    y = y_top - Q_LH
    for line in q_lines:
        c.drawString(txt_x, y, line)
        y -= Q_LH

    opt_y  = y_top - Q_LH - len(q_lines) * Q_LH - 2
    half_w = col_w / 2
    opt_chars = max(int((half_w - 22) / (Q_FONT * 0.52)), 8)

    c.setFont("Helvetica", Q_FONT - 0.5)
    for pair_row in range(2):
        row_y = opt_y - pair_row * Q_OPT_H
        for col_idx in range(2):
            oi  = pair_row * 2 + col_idx
            lbl = ["A", "B", "C", "D"][oi]
            txt = str((options or ["—","—","—","—"])[:4][oi])
            if len(txt) > opt_chars:
                txt = txt[:opt_chars - 1] + "…"
            ox = x_l + col_idx * half_w
            c.setFont("Helvetica-Bold", Q_FONT - 0.5)
            c.drawString(ox, row_y, f"({lbl})")
            c.setFont("Helvetica", Q_FONT - 0.5)
            c.drawString(ox + 17, row_y, txt)

    # ── only these lines change ──────────────────────────
    slot_h   = Q_LH + len(q_lines) * Q_LH + 2 * Q_OPT_H + 10  # 10pt bottom padding
    slot_bot = y_top - slot_h
    c.setStrokeColor(RULE_GRAY)
    c.setLineWidth(0.3)
    c.line(x_l, slot_bot + 2, x_r, slot_bot + 2)
    c.setStrokeColor(colors.black)
    c.setLineWidth(1)
    return slot_h                                                # ← new
    # ────────────────────────────────────────────────────


def _old_draw_question(c, x_l, x_r, y_top, qno, text, options):
    """
    Render one MCQ question in its slot.
    options : [opt_A, opt_B, opt_C, opt_D]
    Layout  :
        N. Question text (wraps if needed)
           (A) opt_A   (B) opt_B
           (C) opt_C   (D) opt_D
    """
    txt_x = x_l + Q_NUM_W
    col_w = x_r - x_l
    txt_w = col_w - Q_NUM_W
    chars = max(int(txt_w / (Q_FONT * 0.52)), 20)
    q_lines = textwrap.wrap(text, width=chars) or [text[:chars]]

    # Question number (bold)
    c.setFont("Helvetica-Bold", Q_FONT)
    c.setFillColor(colors.black)
    c.drawString(x_l, y_top - Q_LH, f"{qno}.")

    # Question text lines
    c.setFont("Helvetica", Q_FONT)
    y = y_top - Q_LH
    for line in q_lines:
        c.drawString(txt_x, y, line)
        y -= Q_LH

    # ── Options: A/B on line 1, C/D on line 2 ────────────────────
    opt_y = y_top - Q_LH - len(q_lines) * Q_LH - 2  # first option row
    half_w = col_w / 2  # half column width
    opt_labels = ["A", "B", "C", "D"]
    opt_texts = (options or ["—", "—", "—", "—"])[:4]

    # Estimate max chars for each option cell (half column minus the "(X) " prefix)
    opt_chars = max(int((half_w - 22) / (Q_FONT * 0.52)), 8)

    c.setFont("Helvetica", Q_FONT - 0.5)
    for pair_row in range(2):  # row 0 → A,B ; row 1 → C,D
        row_y = opt_y - pair_row * Q_OPT_H
        for col_idx in range(2):  # col 0 → left ; col 1 → right
            oi = pair_row * 2 + col_idx
            lbl = opt_labels[oi]
            txt = str(opt_texts[oi])
            # Truncate if too long for the cell
            if len(txt) > opt_chars:
                txt = txt[: opt_chars - 1] + "…"
            ox = x_l + col_idx * half_w
            c.setFont("Helvetica-Bold", Q_FONT - 0.5)
            c.drawString(ox, row_y, f"({lbl})")
            c.setFont("Helvetica", Q_FONT - 0.5)
            c.drawString(ox + 17, row_y, txt)

    # Bottom separator rule
    slot_bot = y_top - Q_SLOT_H
    c.setStrokeColor(RULE_GRAY)
    c.setLineWidth(0.3)
    c.line(x_l, slot_bot + 2, x_r, slot_bot + 2)
    c.setStrokeColor(colors.black)
    c.setLineWidth(1)


def _get_question_height(text):
    """Predicts the exact height a question slot will take before drawing it."""
    col_w = Q_L_RX - Q_L_X
    txt_w = col_w - Q_NUM_W
    chars = max(int(txt_w / (Q_FONT * 0.52)), 20)
    q_lines = textwrap.wrap(text, width=chars) or [text[:chars]]
    return Q_LH + len(q_lines) * Q_LH + 2 * Q_OPT_H + 10

def draw_question_area(c, questions, y_top, y_bot):
    """Fills the left column first, then the right column, and tracks overflow."""
    c.setStrokeColor(RULE_GRAY)
    c.setLineWidth(0.5)
    c.line(MID_X, y_top + 2, MID_X, y_bot)
    c.setStrokeColor(colors.black)
    c.setLineWidth(1)

    left_qs = []
    right_qs = []
    idx = 0

    # 1. Fill Left Column
    y = y_top
    while idx < len(questions):
        q_h = _get_question_height(questions[idx][1])
        if y - q_h >= y_bot:
            left_qs.append(questions[idx])
            y -= q_h
            idx += 1
        else:
            break

    # 2. Fill Right Column
    y = y_top
    while idx < len(questions):
        q_h = _get_question_height(questions[idx][1])
        if y - q_h >= y_bot:
            right_qs.append(questions[idx])
            y -= q_h
            idx += 1
        else:
            break

    # Any remaining questions go to the next page
    overflow = questions[idx:]

    # 3. Render Left Column
    y = y_top
    for qno, text, opts in left_qs:
        slot_h = _draw_question(c, Q_L_X, Q_L_RX, y, qno, text, opts)
        y -= slot_h

    # 4. Render Right Column
    y = y_top
    for qno, text, opts in right_qs:
        slot_h = _draw_question(c, Q_R_X, Q_R_RX, y, qno, text, opts)
        y -= slot_h

    return overflow



def old_draw_question_area(c, questions, y_top, y_bot):
    """
    Fill two columns from y_top → y_bot with questions.
    Returns the list of (qno, text) tuples that didn't fit.
    """
    per_col = int((y_top - y_bot) / Q_SLOT_H)
    capacity = per_col * 2
    page_qs = questions[:capacity]
    overflow = questions[capacity:]

    # Even split: left col gets the ceiling half
    mid = (len(page_qs) + 1) // 2
    left_qs = page_qs[:mid]
    right_qs = page_qs[mid:]

    # Centre divider
    c.setStrokeColor(RULE_GRAY)
    c.setLineWidth(0.5)
    c.line(MID_X, y_top + 2, MID_X, y_bot)
    c.setStrokeColor(colors.black)
    c.setLineWidth(1)

    for i, (qno, text, opts) in enumerate(left_qs):
        _draw_question(c, Q_L_X, Q_L_RX, y_top - i * Q_SLOT_H, qno, text, opts)
    for i, (qno, text, opts) in enumerate(right_qs):
        _draw_question(c, Q_R_X, Q_R_RX, y_top - i * Q_SLOT_H, qno, text, opts)

    return overflow


# ─────────────────────────────────────────────────────────────────────────────
# Page 2 — instruction box
# ─────────────────────────────────────────────────────────────────────────────


def draw_instruction_box(c, t, image_path=None):
    """
    Fills the top OMR_H of page 2 with an instruction image.
    Falls back to a branded placeholder if no image is supplied.
    """
    h, w = t["page"]["height"], t["page"]["width"]
    bx = MARGIN_L
    bw = w - 2 * MARGIN_L
    # by = h - OMR_H  # bottom-left y of the box
    by = h - (h - t["cut_line_y"])  # instruction box bottom aligns with cut line
    bh = OMR_H - 6  # small top gap

    if image_path and Path(image_path).exists():
        c.drawImage(
            str(image_path), bx, by, bw, bh, preserveAspectRatio=True, anchor="c"
        )
    else:
        c.setStrokeColor(RULE_GRAY)
        c.setLineWidth(0.8)
        c.rect(bx, by, bw, bh)
        c.setFont("Helvetica-Bold", 11)
        c.setFillColor(BRAND_GRAY)
        c.drawCentredString(w / 2, by + bh / 2 + 6, "Instructions for Students")
        c.setFont("Helvetica", 9)
        c.drawCentredString(
            w / 2, by + bh / 2 - 10, "(Attach your instruction sheet here)"
        )
        c.setFillColor(colors.black)
        c.setStrokeColor(colors.black)
        c.setLineWidth(1)

    # Horizontal rule separating instruction box from questions below
    c.setStrokeColor(RULE_GRAY)
    c.setLineWidth(0.5)
    # c.line(MARGIN_L, by - 3, w - MARGIN_L, by - 3)
    c.line(MARGIN_L, t["cut_line_y"] - 3, w - MARGIN_L, t["cut_line_y"] - 3)
    c.setStrokeColor(colors.black)
    c.setLineWidth(1)


# ─────────────────────────────────────────────────────────────────────────────
# Main entry point
# ─────────────────────────────────────────────────────────────────────────────


def generate_sheet(
    filename,
    sheet_code,
    student_name,
    student_id,
    exam_title,
    questions,
    instruction_image_path=None,
):
    """
    Generate the full OMR + question PDF.

    Parameters
    ----------
    filename                : output PDF path
    sheet_code              : short unique code encoded in the QR (e.g. "CX4-7K2QQ9")
    student_name            : printed on the OMR header
    student_id              : printed on the OMR header
    exam_title              : e.g. "HSC Physics 1st Paper — Mock Test 04"
    questions               : list of (question_number, question_text) tuples
    instruction_image_path  : optional path to a pre-printed instruction image for page 2
    """
    t = TEMPLATE
    c = canvas.Canvas(filename, pagesize=(PAGE_W, PAGE_H))

    # ── PAGE 1 ──────────────────────────────────────────────────────────────
    draw_anchors(c, t)
    draw_timing_track(c, t)
    draw_qr_codes(c, t, sheet_code)
    draw_header(c, t, sheet_code, exam_title, student_name, student_id)
    bubble_coords, _ = draw_omr_grids(c, t, len(questions))
    draw_cut_line(c, t)
    overflow = draw_question_area(c, questions, Q_TOP, Q_BOT)

    # ── PAGE 2 (only if questions overflow page 1) ───────────────────────────
    if overflow:
        c.showPage()
        draw_instruction_box(c, t, instruction_image_path)
        draw_question_area(c, overflow, Q_TOP, Q_BOT)

    c.showPage()
    c.save()

    manifest = {
        **t,
        "sheet_code": sheet_code,
        # Stored as {"mcq": {qno: {opt: [x,y]}}} — the format detector.py reads
        "bubble_coords": {"mcq": bubble_coords},
    }
    mpath = filename.replace(".pdf", "_manifest.json")
    with open(mpath, "w") as f:
        json.dump(manifest, f, indent=2)

    return manifest


# ─────────────────────────────────────────────────────────────────────────────
# Demo
# ─────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    SAMPLE_QUESTIONS = [
        (
            1,
            "Which of the following is the SI unit of force?",
            ["Newton", "Joule", "Watt", "Pascal"],
        ),
        (
            2,
            "A body moves with uniform velocity. The net force acting on it is:",
            ["Maximum", "Zero", "Constant", "Variable"],
        ),
        (
            3,
            "The dimensional formula of momentum is:",
            ["MLT⁻¹", "MLT⁻²", "ML²T⁻¹", "M²LT⁻¹"],
        ),
        (
            4,
            "If the displacement of a body is zero, the distance covered is:",
            [
                "Also zero",
                "May not be zero",
                "Always negative",
                "Equal to displacement",
            ],
        ),
        (
            5,
            "Which law of motion defines force?",
            ["First law", "Second law", "Third law", "Zeroth law"],
        ),
        (
            6,
            "The rate of change of velocity is called:",
            ["Speed", "Momentum", "Acceleration", "Displacement"],
        ),
        (
            7,
            "Gravitational acceleration near the Earth's surface is approximately:",
            ["9.8 ms⁻²", "8.9 ms⁻²", "10.8 ms⁻²", "6.7 ms⁻²"],
        ),
        (
            8,
            "Which quantity has both magnitude and direction?",
            ["Speed", "Distance", "Temperature", "Velocity"],
        ),
        (
            9,
            "The unit of work done is same as the unit of:",
            ["Power", "Energy", "Force", "Momentum"],
        ),
        (
            10,
            "Kinetic energy of a body depends on its mass and:",
            ["Volume", "Speed", "Density", "Temperature"],
        ),
        (
            11,
            "Power is defined as the rate of doing:",
            ["Force", "Work", "Momentum", "Acceleration"],
        ),
        (
            12,
            "The principle of conservation of energy states that total energy is:",
            ["Always increasing", "Always decreasing", "Constant", "Zero"],
        ),
        (
            13,
            "A wave transfers energy without transferring:",
            ["Frequency", "Matter", "Wavelength", "Amplitude"],
        ),
        (
            14,
            "The frequency of a wave is inversely proportional to its:",
            ["Amplitude", "Speed", "Time period", "Wavelength"],
        ),
        (
            15,
            "Sound waves are examples of which type of wave?",
            ["Transverse", "Longitudinal", "Electromagnetic", "Surface"],
        ),
        (
            16,
            "The speed of light in vacuum is approximately:",
            ["3×10⁸ ms⁻¹", "3×10⁶ ms⁻¹", "3×10¹⁰ ms⁻¹", "3×10⁴ ms⁻¹"],
        ),
        (
            17,
            "Which phenomenon explains the bending of light at a boundary?",
            ["Reflection", "Diffraction", "Refraction", "Polarisation"],
        ),
        (
            18,
            "An object at the centre of curvature of a concave mirror forms an image that is:",
            [
                "Virtual & erect",
                "Real & same size",
                "Magnified & real",
                "Diminished & virtual",
            ],
        ),
        (
            19,
            "Ohm's law states that current is directly proportional to:",
            ["Resistance", "Voltage", "Power", "Charge"],
        ),
        (
            20,
            "The unit of electrical resistance is:",
            ["Ampere", "Volt", "Ohm", "Coulomb"],
        ),
        (
            21,
            "The energy stored in a capacitor is proportional to the square of:",
            ["Charge only", "Current", "Voltage", "Resistance"],
        ),
        (
            22,
            "Magnetic flux density is measured in units of:",
            ["Weber", "Tesla", "Henry", "Farad"],
        ),
        (
            23,
            "The phenomenon of electromagnetic induction was discovered by:",
            ["Maxwell", "Faraday", "Oersted", "Ampere"],
        ),
        (
            24,
            "Nuclear fission releases energy due to:",
            ["Mass excess", "Mass defect", "Charge excess", "Electron loss"],
        ),
        (
            25,
            "Which particle has no charge and is present in the nucleus?",
            ["Proton", "Electron", "Neutron", "Positron"],
        ),
    ]

    generate_sheet(
        "sample_sheet.pdf",
        sheet_code="CX4-7K2QQ9",
        student_name="Tahsin Rahman",
        student_id="STU-10452",
        exam_title="HSC Physics 1st Paper \u2013 Mock Test 04",
        questions=SAMPLE_QUESTIONS,
        instruction_image_path="/mnt/user-data/uploads/upscale_it_and_complete_it_202606162342.jpeg",
    )
    print("Done \u2192 sample_sheet.pdf")
