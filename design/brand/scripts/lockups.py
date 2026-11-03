"""Keyhole-O lockups built from the site's own fonts (Unbounded + Geist Mono).
Each lockup: {"vb": [x, y, w, h], "parts": [[d, role], ...]}, role = text | muted | accent."""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fontword import word, MONO, fmt

def tr(d, dx, dy, s=1.0):
    """Translate/scale a path made only of absolute M/L/H/V/Q/C/A/Z commands."""
    import re
    out, cmd, idx = [], None, 0
    toks = re.findall(r"[MLHVQCAZ]|-?\d+(?:\.\d+)?", d)
    i = 0
    while i < len(toks):
        t = toks[i]
        if t.isalpha():
            cmd = t; out.append(t); i += 1; idx = 0
            continue
        v = float(t)
        if cmd == "H":
            out.append(fmt(v * s + dx))
        elif cmd == "V":
            out.append(fmt(v * s + dy))
        elif cmd == "A":
            k = idx % 7
            out.append(fmt(v * s) if k in (0, 1) else (t if k in (2, 3, 4) else fmt(v * s + (dx if k == 5 else dy))))
        else:
            out.append(fmt(v * s + (dx if idx % 2 == 0 else dy)))
        idx += 1
        i += 1
    s2 = ""
    for o in out:
        if o.isalpha():
            s2 += o
        else:
            s2 += ("" if (s2 and s2[-1].isalpha()) else " ") + o
    return s2

L = {}
D = word("DUNGEON", 700, (0, "counter"))
Dring = word("DUNGEON", 700, (0, "inner"))
mono = word("3D PRINT", 500, src=MONO, tracking=120)
cap = D["cap"]  # 75

# O1: current layout, keyhole O in the accent colour
ms = 0.42
L["o1"] = {"vb": [-2, -cap - 46, D["w"] + 4, cap + 50],
           "parts": [[tr(mono["d"], 2, -cap - 14, ms), "muted"], [D["d"], "text"], [D["o"], "accent"]]}
# O2: the O keeps its counter; a keyhole sits inside it
L["o2"] = {"vb": [-2, -cap - 46, Dring["w"] + 4, cap + 50],
           "parts": [[tr(mono["d"], 2, -cap - 14, ms), "muted"], [Dring["d"], "text"], [Dring["o"], "accent"]]}
# O3: one line, PRINT light + DUNGEON bold
P4 = word("PRINT", 400)
gap = 26
L["o3"] = {"vb": [-2, -cap - 4, P4["w"] + gap + D["w"] + 4, cap + 8],
           "parts": [[P4["d"], "muted"], [tr(D["d"], P4["w"] + gap, 0), "text"], [tr(D["o"], P4["w"] + gap, 0), "accent"]]}
# O4: lowercase, friendlier
pl = word("print", 600)
dl = word("dungeon", 600, (0, "counter"))
gl = 22
L["o4"] = {"vb": [-2, -cap - 6, pl["w"] + gl + dl["w"] + 4, cap + 30],
           "parts": [[pl["d"], "muted"], [tr(dl["d"], pl["w"] + gl, 0), "text"], [tr(dl["o"], pl["w"] + gl, 0), "accent"]]}
# O5: stacked block, PRINT scaled to the width of DUNGEON
P7 = word("PRINT", 700, tracking=60)
sc = D["w"] / P7["w"]
lead = 18
L["o5"] = {"vb": [-2, -cap * sc - lead - cap - 4, D["w"] + 4, cap * sc + lead + cap + 8],
           "parts": [[tr(P7["d"], 0, -cap - lead, sc), "text"], [D["d"], "text"], [D["o"], "accent"]]}

# Round 5: the O stays a normal letter, the keyhole inside it takes the colour (three sizes)
for tag, kf in (("s", 0.62), ("m", 0.72), ("l", 0.82)):
    Dk = word("DUNGEON", 700, (0, "inner"), kfrac=kf)
    L["n" + tag] = {"vb": [-2, -cap - 46, Dk["w"] + 4, cap + 50],
                    "parts": [[tr(mono["d"], 2, -cap - 14, ms), "muted"], [Dk["d"], "text"], [Dk["o"], "accent"]]}
    L["nw" + tag] = {"vb": [-2, -cap - 4, Dk["w"] + 4, cap + 8], "parts": [[Dk["d"], "text"], [Dk["o"], "accent"]]}

# icons: the O on its own
O = word("O", 700, (0, "counter"))
Or = word("O", 700, (0, "inner"))
L["icon_solid"] = {"vb": [O["o_box"][0] - 2, O["o_box"][1] - 2, O["o_box"][2] - O["o_box"][0] + 4, O["o_box"][3] - O["o_box"][1] + 4], "d": O["o"]}
L["icon_ring"] = {"vb": L["icon_solid"]["vb"], "d": Or["d"] + Or["o"]}
json.dump(L, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "lockups4.json"), "w"))
print(sorted(L))
