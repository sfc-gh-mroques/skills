# Transcrit l'audio du MP4 final chapitre par chapitre et vérifie que chaque phrase est complète.
import json, sys, re, unicodedata, subprocess, numpy as np, torch
from transformers import pipeline
cfg, mp4 = json.load(open(sys.argv[1])), sys.argv[2]
off = cfg.get('video_offset', 0)
pcm = np.frombuffer(subprocess.check_output(['ffmpeg','-v','0','-i',mp4,'-ac','1','-ar','16000','-f','f32le','-']), np.float32)
asr = pipeline('automatic-speech-recognition','openai/whisper-small',device='mps')
norm = lambda s: re.sub(r'[^a-z ]',' ',unicodedata.normalize('NFD',s.lower()).encode('ascii','ignore').decode()).split()
for s in cfg['segments']:
    a, b = int((s['t']+off-0.3)*16000), int((s['end']+off+0.8)*16000)
    hyp = asr({'raw':pcm[a:b].copy(),'sampling_rate':16000}, generate_kwargs={'language':'french'})['text']
    ref, h = norm(s['text']), set(norm(hyp)); tail=[w for w in ref[-4:] if len(w)>2]
    fin = sum(w in h for w in tail)/max(1,len(tail))
    print(f"{'OK ' if fin>=0.5 else 'KO '}{s['id']:11} fin={fin:.2f} | …{hyp.strip()[-55:]}")
