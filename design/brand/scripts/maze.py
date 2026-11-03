"""Small 'real' mazes: perfect mazes (one path between any two cells) carved by a seeded
depth-first search, drawn as walls on the die face. Entrance top-left, exit bottom-right."""
import json, os, random, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from geo import rrect, to_d
from shapely.geometry import LineString
from shapely.ops import unary_union


def carve(n, seed):
    rnd = random.Random(seed)
    seen = {(0, 0)}
    stack = [(0, 0)]
    open_ = set()  # passages between cells, as frozensets
    while stack:
        x, y = stack[-1]
        nb = [(x + dx, y + dy) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))
              if 0 <= x + dx < n and 0 <= y + dy < n and (x + dx, y + dy) not in seen]
        if not nb:
            stack.pop()
            continue
        nx, ny = rnd.choice(nb)
        open_.add(frozenset({(x, y), (nx, ny)}))
        seen.add((nx, ny))
        stack.append((nx, ny))
    return open_


def walls(n, open_, lo=11, hi=89):
    c = (hi - lo) / n
    X = lambda i: lo + i * c
    segs = []
    # outer border, with a gap at the top of cell (0,0) and the bottom of cell (n-1,n-1)
    segs.append([(X(1), X(0)), (X(n), X(0)), (X(n), X(n))])
    segs.append([(X(n - 1), X(n)), (X(0), X(n)), (X(0), X(0))])
    for x in range(n):
        for y in range(n):
            if x + 1 < n and frozenset({(x, y), (x + 1, y)}) not in open_:
                segs.append([(X(x + 1), X(y)), (X(x + 1), X(y + 1))])
            if y + 1 < n and frozenset({(x, y), (x, y + 1)}) not in open_:
                segs.append([(X(x), X(y + 1)), (X(x + 1), X(y + 1))])
    return segs, c


def maze_geom(n, seed, wall_ratio=0.3):
    segs, c = walls(n, carve(n, seed))
    w = c * wall_ratio
    g = unary_union([LineString(s).buffer(w / 2, cap_style="square", join_style="mitre") for s in segs])
    return g.intersection(rrect(3, 3, 97, 97, 5))


if __name__ == "__main__":
    here = os.path.dirname(os.path.abspath(__file__))
    cands = {}
    html = '<body style="margin:0;background:#0A0A0C;padding:12px;display:grid;grid-template-columns:repeat(8,1fr);gap:12px;color:#888;font:11px monospace">'
    for n in (5, 6):
        for seed in range(1, 17):
            d = to_d(maze_geom(n, seed).simplify(0.05))
            cands[f"{n}-{seed}"] = d
            html += (f'<div><svg viewBox="0 0 100 100" width="110" height="110"><rect x="3" y="3" width="94" height="94" rx="5" fill="#8F74FF"/>'
                     f'<path fill="#0A0A0C" d="{d}"/></svg><svg viewBox="0 0 100 100" width="28" height="28"><rect x="3" y="3" width="94" height="94" rx="5" fill="#8F74FF"/>'
                     f'<path fill="#0A0A0C" d="{d}"/></svg><br>{n}-{seed}</div>')
    json.dump(cands, open(os.path.join(here, "maze_real.json"), "w"))
    open(os.path.join(here, "maze_real.html"), "w").write(html)
