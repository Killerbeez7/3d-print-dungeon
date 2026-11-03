"""Text -> SVG outlines from the site's own Unbounded font, with the O's counter
swapped for a keyhole. Writes words4.json: {key: {"d", "w", "h", "vb"}}."""
import io, json, os, sys
import uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

REPO = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", ".."))
SRC = os.path.join(REPO, "node_modules/@fontsource-variable/unbounded/files/unbounded-latin-wght-normal.woff2")
MONO = os.path.join(REPO, "node_modules/@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2")
cache = {}


def font_at(wght, src=SRC):
    if (wght, src) in cache:
        return cache[(wght, src)]
    f = TTFont(src)
    inst = instancer.instantiateVariableFont(f, {"wght": wght})
    from fontTools.ttLib.removeOverlaps import removeOverlaps
    removeOverlaps(inst)
    inst.flavor = None
    buf = io.BytesIO()
    inst.save(buf)
    data = buf.getvalue()
    tt = TTFont(io.BytesIO(data))
    cache[(wght, src)] = (tt, data)
    return cache[(wght, src)]


def fmt(v):
    s = f"{v:.1f}".rstrip("0").rstrip(".")
    return "0" if s in ("-0", "") else s


def shape(text, wght, tracking=0, src=SRC):
    tt, data = font_at(wght, src)
    face = hb.Face(data)
    hbf = hb.Font(face)
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(hbf, buf, {})
    order = tt.getGlyphOrder()
    out, x = [], 0
    for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
        out.append((order[info.codepoint], x + pos.x_offset, info.cluster))
        x += pos.x_advance + tracking
    return tt, out, x - tracking


def contours(tt, gname, dx, upm_scale):
    gs = tt.getGlyphSet()
    pen = SVGPathPen(gs, ntos=fmt)
    tp = TransformPen(pen, (upm_scale, 0, 0, -upm_scale, dx * upm_scale, 0))
    gs[gname].draw(tp)
    d = pen.getCommands()
    parts = ["M" + p for p in d.split("M") if p.strip()]
    return parts


def bounds(tt, gname):
    gs = tt.getGlyphSet()
    bp = BoundsPen(gs)
    gs[gname].draw(bp)
    return bp.bounds


def keyhole_d(cx, cy_top, height, width):
    """Keyhole that fills a counter box: circle on top, taper below."""
    r = width / 2
    cy = cy_top + r
    bot = cy_top + height
    th = r * 0.42
    bh = r * 0.78
    import math
    yo = math.sqrt(r * r - th * th)
    return (f"M{fmt(cx - th)} {fmt(cy + yo)}L{fmt(cx - bh)} {fmt(bot)}H{fmt(cx + bh)}L{fmt(cx + th)} {fmt(cy + yo)}"
            f"A{fmt(r)} {fmt(r)} 0 1 0 {fmt(cx - th)} {fmt(cy + yo)}Z")


def word(text, wght, key_o=None, tracking=0, size=100, src=SRC, kfrac=0.62):
    """Returns path d with baseline at y=0, cap height ~ size*capratio. key_o: index of the O to swap,
    'counter' = keyhole replaces the counter, 'disc' = solid disc with keyhole cut."""
    tt, glyphs, adv = shape(text, wght, tracking, src)
    upm = tt["head"].unitsPerEm
    s = size / upm
    d = ""
    d_o = ""
    o_box = None
    o_seen = -1
    for gname, x, cluster in glyphs:
        is_o = text[cluster] in "Oo"
        if is_o:
            o_seen += 1
        parts = contours(tt, gname, x, s)
        if is_o and key_o is not None and o_seen == key_o[0]:
            mode = key_o[1]
            b = bounds(tt, gname)
            x0, y0, x1, y1 = (b[0] + x) * s, -b[3] * s, (b[2] + x) * s, -b[1] * s
            o_box = (x0, y0, x1, y1)
            # outer contour = the one with the largest extent (first in Unbounded)
            outer = parts[0]
            inner = parts[1]
            if mode == "counter":
                oh = y1 - y0
                d_o = outer + keyhole_d((x0 + x1) / 2, y0 + oh * 0.16, oh * 0.68, oh * 0.4)
            elif mode == "inner":
                ib = path_bbox(inner)
                ch = ib[3] - ib[1]
                d += outer + inner
                if kfrac == 0.62:  # round 4 size, unchanged
                    d_o = keyhole_d((ib[0] + ib[2]) / 2, ib[1] + ch * 0.2, ch * 0.62, ch * 0.36)
                else:  # centred in the counter, width follows height
                    d_o = keyhole_d((ib[0] + ib[2]) / 2, ib[1] + ch * (1 - kfrac) / 2, ch * kfrac, ch * kfrac * 0.6)
            elif mode == "disc":
                cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
                r = (y1 - y0) / 2 * 1.04
                d_o = (f"M{fmt(cx - r)} {fmt(cy)}A{fmt(r)} {fmt(r)} 0 1 0 {fmt(cx + r)} {fmt(cy)}A{fmt(r)} {fmt(r)} 0 1 0 {fmt(cx - r)} {fmt(cy)}Z"
                      + keyhole_d(cx, cy - r * 0.62, r * 1.25, r * 0.56))
            elif mode == "skip":
                pass
        else:
            d += "".join(parts)
    cap = tt["OS/2"].sCapHeight * s
    xh = tt["OS/2"].sxHeight * s
    return {"d": d, "o": d_o, "w": adv * s, "cap": cap, "xh": xh, "o_box": o_box}


def path_bbox(d):
    from fontTools.svgLib.path import parse_path
    from fontTools.pens.boundsPen import BoundsPen as _BP
    bp = _BP(None)
    parse_path(d, bp)
    return bp.bounds


def path_bbox_ctrl(d):
    import re
    nums = [float(n) for n in re.findall(r"-?\d+(?:\.\d+)?", d)]
    xs, ys = nums[0::2], nums[1::2]
    return (min(xs), min(ys), max(xs), max(ys))


