#!/usr/bin/env python3
"""Cut a sheet of logos (one PNG on a flat background) into separate transparent PNGs.

usage: python3 logo-tools/slice_logo_sheet.py SHEET.png BOXES.json OUT_DIR [--bg R,G,B]

BOXES.json   { "name": [x0, y0, x1, y1], ... }   pixel boxes around each logo; generous boxes are fine, the result is trimmed
--bg         the sheet's background colour; by default the colour of its top-left pixel

The logos are not redrawn: every pixel keeps its colour, the flat background becomes transparency (soft edge,
isolated specks removed). Two contact sheets (on white, on dark) are written into OUT_DIR so the cut can be checked by eye.
Never display a logo larger than the size printed here: that is its native size.
"""
import sys, json, os
import numpy as np
from PIL import Image

def smooth(x, lo, hi):
    t = np.clip((x - lo) / (hi - lo), 0, 1)
    return t * t * (3 - 2 * t)

def main():
    args = sys.argv[1:]
    bg_arg = None
    if '--bg' in args:
        i = args.index('--bg'); bg_arg = args[i + 1]; del args[i:i + 2]
    if len(args) != 3:
        print(__doc__); sys.exit(1)
    sheet_path, boxes_path, out = args
    im = np.asarray(Image.open(sheet_path).convert('RGB')).astype(np.float32)
    bg = np.array([float(v) for v in bg_arg.split(',')]) if bg_arg else im[0, 0].astype(np.float64)
    boxes = json.load(open(boxes_path))
    os.makedirs(out, exist_ok=True)
    try:
        from scipy import ndimage as ndi
    except ImportError:
        ndi = None
        print('note: scipy not found, isolated specks are not removed')
    for name, (x0, y0, x1, y1) in boxes.items():
        sub = im[y0:y1, x0:x1]
        d = np.sqrt(((sub - bg) ** 2).sum(-1))            # distance to the background colour
        a = smooth(d, 12, 46)                              # alpha: soft edge between "background" and "logo"
        if ndi is not None:                                # keep only the pixels connected to a clearly non-background area
            strong = d > 40
            lab, n = ndi.label(a > 0.02)
            keep = np.zeros_like(strong)
            for i in range(1, n + 1):
                comp = lab == i
                if (strong & comp).sum() > 12: keep |= comp
            a = a * keep
        aa = np.clip(a, 1e-3, 1)[..., None]
        fg = np.clip((sub - (1 - aa) * bg) / aa, 0, 255)   # un-mix the background out of the edge pixels
        rgba = np.dstack([fg, a * 255]).astype(np.uint8)
        ys, xs = np.where(a > 0.05)
        rgba = rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
        img = Image.fromarray(rgba, 'RGBA')
        img.save(os.path.join(out, f'{name}.png'), optimize=True)
        print(f'{name:14s} {img.size[0]} x {img.size[1]} px')
    names = list(boxes)
    cols = 5
    rows = (len(names) + cols - 1) // cols
    for colour, fn in (((255, 255, 255), '_check_on_white.png'), ((24, 28, 34), '_check_on_dark.png')):
        sheet = Image.new('RGB', (20 + cols * 295, 20 + rows * 200), colour)
        for i, nm in enumerate(names):
            logo = Image.open(os.path.join(out, f'{nm}.png'))
            sheet.paste(logo, (20 + (i % cols) * 295, 20 + (i // cols) * 200), logo)
        sheet.save(os.path.join(out, fn))

if __name__ == '__main__':
    main()
