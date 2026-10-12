# quick numeric comcity9on of cameras: python3 tools/cams.py '{"name": {cam...}, ...}' ['{"pt": [x,y,z], ...}']
import sys, json, math
import numpy as np
def project(cam, p, W=960, H=540):
    eye = np.array([cam['px'], cam['py'], cam['pz']], float); tgt = np.array([cam['tx'], cam['ty'], cam['tz']], float)
    f = tgt - eye; f /= np.linalg.norm(f); r = np.cross(f, [0, 1, 0]); r /= np.linalg.norm(r); u = np.cross(r, f)
    d = np.array(p, float) - eye; x, y, z = d @ r, d @ u, d @ f
    t = math.tan(math.radians(cam['fov']) / 2)
    nx, ny = x / (z * t * W / H), y / (z * t)
    return ((nx * 0.5 + 0.5 + cam.get('ox', 0)) * W, (-ny * 0.5 + 0.5 + cam.get('oy', 0)) * H)
PTS = {'hall.fl': (-32.2,0,14.2), 'hall.fr': (32.2,0,14.2), 'hall.bl': (-32.2,0,-14.2), 'hall.br': (32.2,0,-14.2), 'hall.top': (0,9.6,-14.2), 'yard.f': (0,0,29),
 'hq': (-34, 12, -58), 'rnd': (20, 8, -58), 'partner': (66, 8, -58), 'supA': (-92, 10, -2), 'supB': (-92, 6, 62), 'cust': (92, 10, -2),
 'logi': (56, 6, 59.5), 'dist': (112, 6, 58.5), 'port': (-98, 4, -88), 'market': (112, 2, -98), 'tbl.bl': (-158, 0, -130), 'tbl.br': (158, 0, -130), 'tbl.fl': (-158,0,110), 'tbl.fr': (158,0,110)}
if __name__ == '__main__':
    cams = json.loads(sys.argv[1]); pts = dict(PTS)
    if len(sys.argv) > 2: pts = {k: tuple(v) for k, v in json.loads(sys.argv[2]).items()}
    for n, c in cams.items():
        print(n, json.dumps(c))
        print('  ' + '  '.join(f"{k}:({project(c,p)[0]:.0f},{project(c,p)[1]:.0f})" for k, p in pts.items()))
