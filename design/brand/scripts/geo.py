"""Shared logo geometry helpers (from round 3). Builds each mark with shapely booleans and writes
marks3.json: {id: {"d": full path, "c": compact path (<=24px), "vb": viewBox}}.
All marks are single evenodd paths in a 100x100 box."""
import json, math, sys
from shapely.geometry import box, Point, Polygon, LineString, MultiPolygon
from shapely.ops import unary_union
from shapely import affinity

Q = 16


def rrect(x0, y0, x1, y1, r):
    if r <= 0:
        return box(x0, y0, x1, y1)
    return box(x0 + r, y0 + r, x1 - r, y1 - r).buffer(r, quad_segs=Q)


def circle(cx, cy, r):
    return Point(cx, cy).buffer(r, quad_segs=Q)


def arch(x0, x1, spring, bottom):
    r = (x1 - x0) / 2
    return unary_union([box(x0, spring, x1, bottom), circle((x0 + x1) / 2, spring, r)])


def keyhole(cx, cy, r, top_hw, bot_hw, bot_y):
    trap = Polygon([(cx - top_hw, cy), (cx + top_hw, cy), (cx + bot_hw, bot_y), (cx - bot_hw, bot_y)])
    return unary_union([circle(cx, cy, r), trap])


def soften(g, r):
    """Round the concave corners (closing)."""
    return g.buffer(r, quad_segs=Q, join_style="round").buffer(-r, quad_segs=Q, join_style="round")


def round_convex(g, r):
    """Round the convex corners (opening)."""
    return g.buffer(-r, quad_segs=Q, join_style="round").buffer(r, quad_segs=Q, join_style="round")


def tower(x0, x1, top, merlon_h, bottom, door_w, door_spring, merlons=3, gap_ratio=0.7):
    w = x1 - x0
    m = w / (merlons + (merlons - 1) * gap_ratio)
    g = m * gap_ratio
    parts = [box(x0, top + merlon_h, x1, bottom)]
    for i in range(merlons):
        mx = x0 + i * (m + g)
        parts.append(box(mx, top, mx + m, top + merlon_h + 0.5))
    t = unary_union(parts)
    if door_w:
        cx = (x0 + x1) / 2
        t = t.difference(arch(cx - door_w / 2, cx + door_w / 2, door_spring, bottom + 1))
    return t


TILE = rrect(4, 4, 96, 96, 22)


def fmt(v):
    s = f"{v:.1f}".rstrip("0").rstrip(".")
    return "0" if s in ("-0", "") else s


def ring_d(coords):
    pts = list(coords)
    if pts[0] == pts[-1]:
        pts = pts[:-1]
    # drop collinear points to keep paths small
    out = []
    n = len(pts)
    for i in range(n):
        a, b, c = pts[i - 1], pts[i], pts[(i + 1) % n]
        cross = (b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0])
        if abs(cross) > 1e-6:
            out.append(b)
    s = "M" + fmt(out[0][0]) + " " + fmt(out[0][1])
    for x, y in out[1:]:
        s += "L" + fmt(x) + " " + fmt(y)
    return s + "Z"


def to_d(g):
    polys = [g] if isinstance(g, Polygon) else list(g.geoms)
    d = ""
    for p in polys:
        if p.is_empty:
            continue
        d += ring_d(p.exterior.coords)
        for h in p.interiors:
            d += ring_d(h.coords)
    return d


def fit(g, pad=6):
    """Scale+centre a geometry into the 100 box with padding."""
    x0, y0, x1, y1 = g.bounds
    s = (100 - 2 * pad) / max(x1 - x0, y1 - y0)
    g = affinity.scale(g, s, s, origin=(x0, y0))
    x0, y0, x1, y1 = g.bounds
    return affinity.translate(g, 50 - (x0 + x1) / 2, 50 - (y0 + y1) / 2)


