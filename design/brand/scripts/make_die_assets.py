"""Die assets for the site: face paths (TS) and the still icon (SVG + PNG sources)."""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from geo import rrect, to_d
from shapely import affinity
from shapely.ops import unary_union
from shapely.geometry import Polygon
from shapely import wkt

here = os.path.dirname(os.path.abspath(__file__))
from die_faces import faces as FACES_G, FACE  # draws the six faces and writes die_faces.json

REPO = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", ".."))
F = json.load(open(os.path.join(here, "die_faces.json")))
order = ["gate", "eye", "lock", "fire", "maze", "bricks"]
ts = ("// Generated from the logo canvas (round 9). Symbols for the six sides of the die, drawn in a\n"
      "// 100 x 100 face; the face plate is a rounded square from 3 to 97. Do not edit by hand.\n"
      "export const DIE_FACES = {\n" + "".join(f'  {k}: "{F[k]}",\n' for k in order) + "} as const;\n"
      "export type DieFace = keyof typeof DIE_FACES;\n"
      "/** The gate's portcullis, in the face colour over the doorway; half raised at rest. */\n"
      f'export const PORTCULLIS = "{F["portcullis"]}";\n')
open(os.path.join(REPO, "src/features/shared/components/dieFaces.ts"), "w").write(ts)

# --- still icon: the resting pose drawn flat (top = maze, left = gate, right = eye)
T, UR, C, UL, LL, B = (50, 7), (87.24, 28.5), (50, 50), (12.76, 28.5), (12.76, 71.5), (50, 93)
def onto(g, o, u, v):
    ux, uy = (u[0] - o[0]) / 100, (u[1] - o[1]) / 100
    vx, vy = (v[0] - o[0]) / 100, (v[1] - o[1]) / 100
    return affinity.affine_transform(g, [ux, vx, uy, vy, o[0], o[1]])
def side(sym, bars=True):
    plate = FACE
    if not sym:
        return plate
    ink = FACES_G[sym]["ink"]
    if sym == "gate" and bars:  # the gate closed: portcullis down, half raised
        ink = ink.difference(FACES_G["portcullis"]["ink"])
    return plate.difference(ink)
def icon(top, left, right, bars=True):
    return unary_union([onto(side(top), UL, T, C), onto(side(left, bars), UL, C, LL), onto(side(right), C, UR, B)])
full = icon("maze", "gate", "eye")
# The tab icon is 16-32 px, where the portcullis bars turn to mush: it keeps the plain doorway.
compact = icon(None, "gate", None, bars=False)
paths = {"full": to_d(full.simplify(0.05)), "compact": to_d(compact.simplify(0.05))}
json.dump(paths, open(os.path.join(here, "die_icon.json"), "w"))
open(os.path.join(REPO, "public/assets/icons/pd-die-v4.svg"), "w").write(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">'
    f'<path fill="#8F74FF" fill-rule="evenodd" d="{paths["compact"]}"/></svg>\n')
print({k: len(v) for k, v in paths.items()})
