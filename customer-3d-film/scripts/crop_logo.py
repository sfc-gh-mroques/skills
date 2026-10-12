"""Rogne un logo à son contenu. Fond blanc uni → transparent si --white.
usage: python3 crop_logo.py in.png out.png [--white] [--margin 4]"""
import sys
from PIL import Image

a = sys.argv[1:]
src, dst = a[0], a[1]
white = '--white' in a
margin = int(a[a.index('--margin') + 1]) if '--margin' in a else 4
im = Image.open(src).convert('RGBA')
if white:
    im.putdata([(r, g, b, 0) if r > 245 and g > 245 and b > 245 else (r, g, b, al) for r, g, b, al in im.getdata()])
x0, y0, x1, y1 = im.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()
im = im.crop((max(0, x0 - margin), max(0, y0 - margin), min(im.width, x1 + margin), min(im.height, y1 + margin)))
im.save(dst)
print(dst, im.size)
