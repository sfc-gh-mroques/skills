# Transcrit chaque segment (Whisper) et signale ceux dont la fin du texte manque.
import json, sys, re, unicodedata, torch
from transformers import pipeline
cfg, wavdir = sys.argv[1], sys.argv[2]
only = set(sys.argv[3].split(',')) if len(sys.argv) > 3 else None
asr = pipeline('automatic-speech-recognition', 'openai/whisper-small', device='mps' if torch.backends.mps.is_available() else 'cpu')
norm = lambda s: re.sub(r'[^a-z ]', ' ', unicodedata.normalize('NFD', s.lower()).encode('ascii', 'ignore').decode()).split()
bad = []
for s in json.load(open(cfg))['segments']:
    if only and s['id'] not in only: continue
    hyp = asr(f"{wavdir}/{s['id']}.wav", generate_kwargs={'language': 'french'})['text']
    ref, h = norm(s['text']), set(norm(hyp))
    tail = [w for w in ref[-4:] if len(w) > 2]
    hit = sum(w in h for w in tail) / max(1, len(tail))
    cov = sum(w in h for w in ref) / len(ref)
    ok = hit >= 0.5 and cov >= 0.75
    if not ok: bad.append(s['id'])
    print(f"{'OK ' if ok else 'KO '}{s['id']:11} cov={cov:.2f} fin={hit:.2f} | {hyp.strip()[-70:]}")
print('BAD', ','.join(bad))
