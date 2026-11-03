"""The six die faces (gate, eye, keyhole, fire, maze, bricks) in a 100 x 100 face. Writes die_faces.json."""
import json, math, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from geo import rrect, arch, keyhole, circle, to_d, round_convex
from shapely.geometry import Polygon, Point, box
from shapely.ops import unary_union
from shapely import affinity

here = os.path.dirname(os.path.abspath(__file__))


def lens(cx, cy, w, h, vertical=True):
    if not vertical:
        w, h = h, w
    R = (w / 2 + h * h / (2 * w)) / 2
    d = R - w / 2
    g = Point(cx - d, cy).buffer(R, quad_segs=32).intersection(Point(cx + d, cy).buffer(R, quad_segs=32))
    return g if vertical else affinity.rotate(g, 90, origin=(cx, cy))


def chaikin(pts, n=4):
    for _ in range(n):
        q = []
        for i in range(len(pts)):
            p0, p1 = pts[i], pts[(i + 1) % len(pts)]
            q += [(0.75 * p0[0] + 0.25 * p1[0], 0.75 * p0[1] + 0.25 * p1[1]), (0.25 * p0[0] + 0.75 * p1[0], 0.25 * p0[1] + 0.75 * p1[1])]
        pts = q
    return pts


FACE = rrect(3, 3, 97, 97, 5)  # the face plate; symbols are clipped to it
faces = {}  # each: ink shapes drawn on a violet face (100 box)

# gate: arched doorway reaching the bottom edge (as on W2)
faces["gate"] = {"ink": arch(32, 68, 56, 101).intersection(FACE)}

# keyhole
faces["lock"] = {"ink": keyhole(50, 42, 13, 5.5, 12, 78)}

# bricks: mortar lines in running bond
mortar = [box(0, y - 2.4, 100, y + 2.4) for y in (25, 50, 75)]
for row, y0 in enumerate((0, 25, 50, 75)):
    xs = (50,) if row % 2 == 0 else (25, 75)
    for x in xs:
        mortar.append(box(x - 2.4, y0, x + 2.4, y0 + 25))
faces["bricks"] = {"ink": unary_union(mortar).intersection(FACE)}

# dragon eye: almond opening, violet iris, slit pupil (iris is face colour, so pupil is ink inside it)
alm = lens(50, 50, 80, 46, vertical=False)
iris = circle(50, 50, 17)
faces["eye"] = {"ink": unary_union([alm.difference(iris), lens(50, 50, 6.5, 30)])}

# fire: a flame with a leaning tip and a side tongue, inner core in face colour
F = [(0.5, 1.42), (0.86, 1.3), (1.0, 1.0), (0.94, 0.7), (0.76, 0.44), (0.64, -0.06), (0.5, 0.34), (0.4, 0.5),
     (0.3, 0.26), (0.12, 0.62), (0.0, 0.98), (0.14, 1.3)]
sc = 52
flame = Polygon([(50 + (x - 0.5) * sc, 14 + y * sc) for x, y in chaikin(F)])
core = Polygon([(50 + (x - 0.5) * sc * 0.42, 14 + (0.62 + y * 0.5) * sc) for x, y in
                chaikin([(0.5, 1.4), (0.92, 1.12), (0.86, 0.72), (0.56, 0.3), (0.5, 0.62), (0.2, 0.7), (0.08, 1.12)])])
faces["fire"] = {"ink": flame.difference(core)}

# layer lines: the 3D-print side (as on W2)
faces["layers"] = {"ink": unary_union([box(0, y, 100, y + 5.5) for y in (17, 37, 57, 77)])}

# maze: a real 6x6 maze (one path through, way in top-left, way out bottom-right), seen from above.
# A maze has no up or down, so it never looks crooked on top while the die turns.
from maze import maze_geom
faces["maze"] = {"ink": maze_geom(6, 3, wall_ratio=0.34)}

out = {k: to_d(v["ink"].intersection(FACE).simplify(0.05)) for k, v in faces.items()}
json.dump(out, open(os.path.join(here, "die_faces.json"), "w"))
print({k: len(v) for k, v in out.items()})
