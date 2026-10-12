# Voix off française locale (Chatterbox Multilingual, MIT) sur le GPU Apple (mps).
# usage: .venv/bin/python speak_batch.py <voiceover.json> <dossier_sortie> [--ref voice_fr.wav] [--only id1,id2]
#                                       [--exaggeration 0.5] [--cfg 0.5] [--temperature 0.8]
# Écrit <dossier>/<id>.wav pour chaque segment du JSON (champ "text", ou "tts_text" s'il existe).
import json, os, sys, time, argparse
import torch, torchaudio as ta
from chatterbox.mtl_tts import ChatterboxMultilingualTTS

ap = argparse.ArgumentParser()
ap.add_argument('cfg'); ap.add_argument('out')
ap.add_argument('--ref', default=os.path.join(os.path.dirname(os.path.abspath(__file__)), 'voice_fr.wav'))
ap.add_argument('--only', default='')
ap.add_argument('--exaggeration', type=float, default=0.5)
ap.add_argument('--cfg', dest='cfgw', type=float, default=0.5)
ap.add_argument('--temperature', type=float, default=0.8)
a = ap.parse_args()

dev = 'mps' if torch.backends.mps.is_available() else 'cpu'
# the checkpoints are saved on CUDA: map them onto the local device
_load = torch.load
torch.load = lambda *x, **k: _load(*x, **{**k, 'map_location': torch.device(dev)})
t0 = time.time()
model = ChatterboxMultilingualTTS.from_pretrained(device=dev)
print(f'model on {dev} in {time.time() - t0:.0f}s', flush=True)

os.makedirs(a.out, exist_ok=True)
only = set(filter(None, a.only.split(',')))
for s in json.load(open(a.cfg))['segments']:
    if only and s['id'] not in only:
        continue
    t1 = time.time()
    wav = model.generate(s.get('tts_text', s['text']), language_id='fr', audio_prompt_path=a.ref,
                         exaggeration=a.exaggeration, cfg_weight=a.cfgw, temperature=a.temperature)
    p = os.path.join(a.out, f"{s['id']}.wav")
    ta.save(p, wav, model.sr)
    print(f"{s['id']:<12} {wav.shape[-1] / model.sr:5.1f}s audio · {time.time() - t1:5.0f}s compute", flush=True)
