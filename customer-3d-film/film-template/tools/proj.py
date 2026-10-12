# Project world points through a film camera: python3 tools/proj.py '{"px":0,"py":134,"pz":256,"tx":0,"ty":0,"tz":-2,"fov":26}' [W H]
import sys, json, math
import numpy as np
cam = json.loads(sys.argv[1]); W = int(sys.argv[2]) if len(sys.argv) > 2 else 960; H = int(sys.argv[3]) if len(sys.argv) > 3 else 540
def project(cam, p, W=W, H=H):
    eye = np.array([cam['px'], cam['py'], cam['pz']], float); tgt = np.array([cam['tx'], cam['ty'], cam['tz']], float)
    f = tgt - eye; f /= np.linalg.norm(f); r = np.cross(f, [0, 1, 0]); r /= np.linalg.norm(r); u = np.cross(r, f)
    d = np.array(p, float) - eye; x, y, z = d @ r, d @ u, d @ f
    t = math.tan(math.radians(cam['fov']) / 2)
    nx, ny = x / (z * t * W / H), y / (z * t)
    return ((nx * 0.5 + 0.5 + cam.get('ox', 0)) * W, (-ny * 0.5 + 0.5 + cam.get('oy', 0)) * H)
if __name__ == '__main__':
    pts = {
        'plant.c': (0, 0, 1), 'plant.bl': (-56, 0, 29), 'plant.br': (56, 0, 29), 'plant.tl': (-56, 0, -27), 'plant.tr': (56, 0, -27), 'plant.top': (0, 9, -27),
        'hq': (-34, 12, -58), 'rnd': (20, 8, -58), 'partner': (66, 8, -58), 'supA': (-92, 10, -2), 'supB': (-92, 6, 62), 'cust': (92, 10, -2),
        'logi': (56, 6, 59.5), 'dist': (112, 6, 58.5), 'port': (-98, 4, -88), 'market': (112, 2, -98),
        'tbl.fl': (-158, 0, 110), 'tbl.fr': (158, 0, 110), 'tbl.bl': (-158, 0, -130), 'tbl.br': (158, 0, -130),
    }
    extra = json.loads(sys.argv[4]) if len(sys.argv) > 4 else {}
    pts.update({k: tuple(v) for k, v in extra.items()})
    for k, p in pts.items():
        x, y = project(cam, p); print(f'{k:10s} {x:7.0f} {y:7.0f}')
