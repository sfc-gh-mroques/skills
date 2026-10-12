import sys, glob, os
from PIL import Image, ImageDraw
d=sys.argv[1]; cols=int(sys.argv[2]) if len(sys.argv)>2 else 2; rows=int(sys.argv[3]) if len(sys.argv)>3 else 2
cw=int(sys.argv[4]) if len(sys.argv)>4 else 960
files=sorted(glob.glob(os.path.join(d,'t*.png'))+glob.glob(os.path.join(d,'f_*.png')))
per=cols*rows
for i in range(0,len(files),per):
    chunk=files[i:i+per]
    im0=Image.open(chunk[0]); ch=int(cw*im0.height/im0.width)
    sheet=Image.new('RGB',(cols*cw,rows*ch),(20,20,20))
    for k,f in enumerate(chunk):
        im=Image.open(f).convert('RGB').resize((cw,ch),Image.LANCZOS)
        x=(k%cols)*cw; y=(k//cols)*ch
        sheet.paste(im,(x,y))
        dr=ImageDraw.Draw(sheet); dr.rectangle([x,y,x+74,y+16],fill=(0,0,0)); dr.text((x+4,y+2),os.path.basename(f)[1:-4]+'s',fill=(255,255,0))
    out=os.path.join(d,f'sheet{i//per:02d}.jpg'); sheet.save(out,quality=88); print(out)
