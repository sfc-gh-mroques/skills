"""Rogne un logo à sa boîte alpha puis le recentre dans un carré transparent (logos de pastilles).
usage: python3 square_logo.py in.png out.png [size=128] [pad=0.04]"""
import sys
from PIL import Image

src, dst = sys.argv[1], sys.argv[2]
size = int(sys.argv[3]) if len(sys.argv) > 3 else 128
pad = float(sys.argv[4]) if len(sys.argv) > 4 else 0.04
im = Image.open(src).convert('RGBA')
im = im.crop(im.getchannel('A').point(lambda a: 255 if a > 8 else 0).getbbox())
inner = int(size * (1 - 2 * pad))
im.thumbnail((inner, inner), Image.LANCZOS)
out = Image.new('RGBA', (size, size), (0, 0, 0, 0))
out.paste(im, ((size - im.width) // 2, (size - im.height) // 2), im)
out.save(dst)
print(dst, out.size)
