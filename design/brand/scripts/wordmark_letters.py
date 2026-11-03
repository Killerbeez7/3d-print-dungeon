"""Round 6: DUNGEON with a redrawn E and G (no notch, no spur) and three keyhole-O treatments.
Writes lockups6.json in the same format as lockups4.json (size 100 = cap 75, baseline y = 0)."""
import json, math, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fontword import shape, contours, word, MONO, fmt
from lockups import tr
from fontTools.pens.basePen import BasePen
from shapely.geometry import Polygon, box, Point
from shapely.ops import unary_union
from shapely import affinity

S = 0.1  # font units -> lockup units


class Flatten(BasePen):
    def __init__(self):
        super().__init__(None)
        self.rings, self.cur = [], []

    def _moveTo(self, p):
        self.cur = [p]

    def _lineTo(self, p):
        self.cur.append(p)

    def _curveToOne(self, p1, p2, p3):
        p0 = self.cur[-1]
        for i in range(1, 17):
            t = i / 16
            self.cur.append(tuple((1 - t) ** 3 * a + 3 * (1 - t) ** 2 * t * b + 3 * (1 - t) * t ** 2 * c + t ** 3 * d
                                  for a, b, c, d in zip(p0, p1, p2, p3)))

    def _qCurveToOne(self, p1, p2):
        p0 = self.cur[-1]
        for i in range(1, 13):
            t = i / 12
            self.cur.append(tuple((1 - t) ** 2 * a + 2 * (1 - t) * t * b + t ** 2 * c for a, b, c in zip(p0, p1, p2)))

    def _closePath(self):
        self.rings.append(self.cur)
        self.cur = []

    _endPath = _closePath


def glyph_rings(ch, wght=700):
    tt, g, _ = shape(ch, wght)
    gs = tt.getGlyphSet()
    pen = Flatten()
    gs[g[0][0]].draw(pen)
    return [[(x, -y) for x, y in r] for r in pen.rings]  # y down, baseline 0


def ring_d(coords):
    pts = list(coords)
    if pts[0] == pts[-1]:
        pts = pts[:-1]
    return "M" + "L".join(f"{fmt(x * S)} {fmt(y * S)}" for x, y in pts) + "Z"


def to_d(g, dx=0):
    g = affinity.translate(g, dx, 0).simplify(0.6)
    polys = [g] if g.geom_type == "Polygon" else list(g.geoms)
    d = ""
    for p in polys:
        d += ring_d(p.exterior.coords)
        for h in p.interiors:
            d += ring_d(h.coords)
    return d


def round_convex(g, r):
    return g.buffer(-r, quad_segs=12, join_style="round").buffer(r, quad_segs=12, join_style="round")


# --- the O, as the font draws it (outer + counter)
o_rings = glyph_rings("O")
o_outer, o_inner = sorted((Polygon(r) for r in o_rings), key=lambda p: -p.area)
O_RING = o_outer.difference(o_inner)
ib = o_inner.bounds  # counter box
ob = o_outer.bounds

# --- E: straight spine, three arms (same weights and widths as the font's E)
E = Polygon([(47, -750), (739, -750), (739, -582), (269, -582), (269, -450), (711, -450), (711, -300),
             (269, -300), (269, -168), (744, -168), (744, 0), (47, 0)])

# --- G: the O's bowl (fitted to the G's width) with a clean aperture and crossbar, no spur
gx0, gx1 = 38, 910
sx = (gx1 - gx0) / (ob[2] - ob[0])
bowl = affinity.scale(O_RING, sx, 1, origin=(ob[0], 0))
bowl = affinity.translate(bowl, gx0 - ob[0], 0)
outer_g = affinity.translate(affinity.scale(o_outer, sx, 1, origin=(ob[0], 0)), gx0 - ob[0], 0)
cxg = (gx0 + gx1) / 2
aperture = box(cxg + 60, -471, 2000, -388)
bar = box(512, -388, 2000, -242).intersection(outer_g)
G = unary_union([bowl.difference(aperture), bar])
G = G.difference(box(cxg + 60, -471, 2000, -388))


def keyhole(cx, top, h, w, foot=1.6, r_round=10):
    """Classic keyhole: circle on top, flared slot below, softened corners."""
    r = w / 2
    cy = top + r
    bot = top + h
    neck = r * 0.42
    base = r * 0.82 * foot / 1.6
    yo = math.sqrt(r * r - neck * neck)
    slot = Polygon([(cx - neck, cy + yo * 0.6), (cx + neck, cy + yo * 0.6), (cx + base, bot), (cx - base, bot)])
    k = unary_union([Point(cx, cy).buffer(r, quad_segs=24), slot])
    return round_convex(k, r_round)


# glyph positions from the font's own shaping (keeps the original spacing)
tt, glyphs, adv = shape("DUNGEON", 700)
pos = {}
seen = {}
for gname, x, cl in glyphs:
    ch = "DUNGEON"[cl]
    seen[ch] = seen.get(ch, 0) + 1
    pos[(ch, seen[ch])] = x


def letters_d():
    d = ""
    for (ch, n), x in pos.items():
        if ch in "DUN":
            gn = [g for g, gx, _ in glyphs if gx == x][0]
            d += "".join(contours(tt, gn, x, S))
        elif ch == "E":
            d += to_d(E, x)
        elif ch == "G":
            d += to_d(G, x)
    return d


ox = pos[("O", 1)]
cx_o = (ob[0] + ob[2]) / 2
LET = letters_d()

# A: normal O (font's ring), refined violet keyhole centred in the counter
ch = ib[3] - ib[1]
kA = keyhole((ib[0] + ib[2]) / 2, ib[1] + ch * 0.15, ch * 0.72, ch * 0.42, r_round=8)
A_text = LET + to_d(O_RING, ox)
A_key = to_d(kA, ox)

# B and C: the O is solid; the keyhole is cut through it (B) or filled violet (C)
oh = ob[3] - ob[1]
kB = keyhole(cx_o, ob[1] + oh * 0.2, oh * 0.6, oh * 0.33, r_round=10)
B_text = LET + to_d(o_outer.difference(kB), ox)
C_text = LET + to_d(o_outer, ox)
C_key = to_d(kB, ox)

before = word("DUNGEON", 700, (0, "inner"), kfrac=0.72)
mono = word("3D PRINT", 500, src=MONO, tracking=120)
cap = 75
w = adv * S
ms = 0.42
top = [tr(mono["d"], 2, -cap - 14, ms), "muted"]
vb_full = [-2, -cap - 46, w + 4, cap + 50]
vb_word = [-2, -cap - 4, w + 4, cap + 8]
L = {
    "a": {"vb": vb_full, "parts": [top, [A_text, "text"], [A_key, "accent"]]},
    "b": {"vb": vb_full, "parts": [top, [B_text, "text"]]},
    "c": {"vb": vb_full, "parts": [top, [C_text, "text"], [C_key, "accent"]]},
    "wa": {"vb": vb_word, "parts": [[A_text, "text"], [A_key, "accent"]]},
    "wb": {"vb": vb_word, "parts": [[B_text, "text"]]},
    "wc": {"vb": vb_word, "parts": [[C_text, "text"], [C_key, "accent"]]},
    "before": {"vb": vb_word, "parts": [[before["d"], "text"], [before["o"], "accent"]]},
}
json.dump(L, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "lockups6.json"), "w"))
print({k: sum(len(p[0]) for p in v["parts"]) for k, v in L.items()})
