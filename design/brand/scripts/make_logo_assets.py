"""Production logo assets: keep badge + '3D PRINT' + DUNGEON (clean E/G, dragon-eye O).
Writes src/features/shared/components/brandPaths.ts and the favicon SVG."""
import math, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import wordmark_letters as r6
from fontword import word, contours, MONO, path_bbox, fmt

REPO = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", ".."))
S = r6.S
CAP, LABEL_CAP, LABEL_GAP = 75, 21, 12
TOP = -(CAP + LABEL_GAP + LABEL_CAP)          # -108: label top = badge top
BOTTOM = 2                                    # room for the O and G overshoot

# --- DUNGEON letters: D, U, N straight from the font; E and G redrawn; O = the font's O
tt, glyphs = r6.tt, r6.glyphs
letters = ""
o_outer = o_inner = None
for gname, x, cl in glyphs:
    ch = "DUNGEON"[cl]
    if ch in "DUN":
        letters += "".join(contours(tt, gname, x, S))
    elif ch == "E":
        letters += r6.to_d(r6.E, x)
    elif ch == "G":
        letters += r6.to_d(r6.G, x)
    elif ch == "O":
        parts = contours(tt, gname, x, S)
        o_outer, o_inner = parts[0], parts[1]
letters += o_outer + o_inner  # the O ring (exact curves)
iris = o_inner                # the counter, filled

# pupil: a vertical lens (two arcs), centred in the counter
ib = path_bbox(o_inner)
cx, cy = (ib[0] + ib[2]) / 2, (ib[1] + ib[3]) / 2
w, h = (ib[2] - ib[0]) * 0.17, (ib[3] - ib[1]) * 0.9
R = (w / 2 + h * h / (2 * w)) / 2
pupil = (f"M{fmt(cx)} {fmt(cy - h / 2)}A{fmt(R)} {fmt(R)} 0 0 1 {fmt(cx)} {fmt(cy + h / 2)}"
         f"A{fmt(R)} {fmt(R)} 0 0 1 {fmt(cx)} {fmt(cy - h / 2)}Z")

# --- label: Geist Mono, left edge on DUNGEON's left edge, baseline 12 above the cap height
ink_left = path_bbox(letters)[0]
lab = word("3D PRINT", 500, src=MONO, tracking=160)
ls = LABEL_CAP / lab["cap"]
lb = path_bbox(lab["d"])
label = r6.tr(lab["d"], ink_left - lb[0] * ls, -CAP - LABEL_GAP, ls)

wb = path_bbox(letters)
VB_WORD = f"{fmt(wb[0])} {TOP} {fmt(wb[2] - wb[0])} {-TOP + BOTTOM}"

# --- badge: rounded tile with the keep window (tower, three merlons, arched door)
BADGE = ("M26 4H74A22 22 0 0 1 96 26V74A22 22 0 0 1 74 96H26A22 22 0 0 1 4 74V26A22 22 0 0 1 26 4Z"
         "M27 20H37.5V29H44.75V20H55.25V29H62.5V20H73V81H58V65A8 8 0 0 0 42 65V81H27Z")
# tile spans the block height (108); the extra BOTTOM units keep both SVGs the same height
VB_BADGE = f"4 4 92 {fmt(92 * (-TOP + BOTTOM) / -TOP)}"

ts = f'''// Generated from the logo canvas: "3D PRINT" + DUNGEON (the wordmark beside the die).
// DUNGEON is outlined from Unbounded with the E and G redrawn (no notch, no spur). Do not edit by hand.
export const WORDMARK_VIEWBOX = "{VB_WORD}";
export const LABEL_PATH = "{label}";
export const LETTERS_PATH = "{letters}";
/** Ink width of the "3D PRINT" line, in the same units (it starts on DUNGEON's left edge). */
export const LABEL_WIDTH = {round((lb[2] - lb[0]) * ls, 2)};
/** Width / height of the wordmark SVG, for sizing without layout shift. */
export const WORDMARK_RATIO = {round((wb[2] - wb[0]) / (-TOP + BOTTOM), 4)};
'''
open(os.path.join(REPO, "src/features/shared/components/brandPaths.ts"), "w").write(ts)

print("ratio", round((wb[2] - wb[0]) / (-TOP + BOTTOM), 4), "bytes", len(ts), "vb", VB_WORD, VB_BADGE)
