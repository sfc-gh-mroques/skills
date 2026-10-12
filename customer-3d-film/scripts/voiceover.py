"""Voix off calée sur les chapitres, mixée sur le MP4 : macOS `say`, ou des WAV déjà générés (Chatterbox…).
usage: python3 tools/voiceover.py voiceover.json dist/film.mp4 dist/film-vo.mp4 [--wavdir dossier]
  --wavdir : prend <dossier>/<id>.wav (silences de bord retirés), accéléré (atempo ≤ 1,25) s'il déborde.
Le JSON : { voice, rate, video_offset, segments: [{ t, end, id, text }] } (t/end en secondes du film).
Chaque segment est généré, accéléré si besoin pour tenir dans [t, end], puis placé à t + video_offset."""
import json, subprocess, sys, os, tempfile

cfg_p, vin, vout = sys.argv[1:4]
wavdir = sys.argv[sys.argv.index('--wavdir') + 1] if '--wavdir' in sys.argv else None
cfg = json.load(open(cfg_p))
voice, base, off = cfg.get('voice', 'Thomas'), cfg.get('rate', 175), cfg.get('video_offset', 0)
tmp = tempfile.mkdtemp(prefix='vo_')

def dur(p):
    return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p]))

inputs, filters = [], []
for i, s in enumerate(cfg['segments']):
    win = s['end'] - s['t']
    rate = base
    if wavdir:
        # marge de 0,3 s + fondu : ne jamais manger une fin de mot qui s'éteint doucement
        trim = ('silenceremove=start_periods=1:start_threshold=-60dB:start_silence=0.15,areverse,'
                'silenceremove=start_periods=1:start_threshold=-60dB:start_silence=0.3,afade=t=in:d=0.12,areverse')
        p = os.path.join(tmp, f"{i:02d}_{s['id']}.wav")
        subprocess.check_call(['ffmpeg', '-y', '-loglevel', 'error', '-i', os.path.join(wavdir, f"{s['id']}.wav"), '-af', trim, p])
        d = dur(p)
        if d > win:
            k = min(1.25, d / win + 0.01)
            q = p.replace('.wav', '_f.wav')
            subprocess.check_call(['ffmpeg', '-y', '-loglevel', 'error', '-i', p, '-af', f'atempo={k:.3f}', q])
            p, rate, d = q, f'x{k:.2f}', dur(q)
        else:
            rate = 'x1.00'
    for _ in range(0 if wavdir else 8):
        p = os.path.join(tmp, f"{i:02d}_{s['id']}.aiff")
        subprocess.check_call(['say', '-v', voice, '-r', str(rate), '-o', p, s['text']])
        d = dur(p)
        if d <= win:
            break
        rate = int(rate * d / win) + 4
    flag = '' if d <= win else '  !! DÉBORDE'
    print(f"{s['id']:<12} {s['t']:6.1f}s  {d:5.1f}/{win:4.1f}s  rate {rate}{flag}")
    inputs += ['-i', p]
    ms = int((s['t'] + off) * 1000)
    filters.append(f"[{i + 1}:a]aresample=48000,adelay={ms}|{ms}[a{i}]")

n = len(cfg['segments'])
mix = ''.join(f'[a{i}]' for i in range(n))
fc = ';'.join(filters) + f';{mix}amix=inputs={n}:normalize=0:duration=longest:dropout_transition=0,loudnorm=I=-16:TP=-1.5:LRA=11,apad[vo]'
subprocess.check_call(['ffmpeg', '-y', '-loglevel', 'error', '-i', vin, *inputs, '-filter_complex', fc,
                       '-map', '0:v', '-map', '[vo]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest',
                       '-movflags', '+faststart', vout])
print('done', vout)
