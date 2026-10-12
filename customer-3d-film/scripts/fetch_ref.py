# Extrait des voix françaises de Multilingual LibriSpeech (CC-BY 4.0) pour servir de référence de clonage.
# usage: python fetch_ref.py [speaker_id=12977]
import sys, io, soundfile as sf, pyarrow.parquet as pq
from huggingface_hub import hf_hub_download
want = sys.argv[1] if len(sys.argv) > 1 else '12977'
p = hf_hub_download('facebook/multilingual_librispeech', 'french/test-00000-of-00001.parquet', repo_type='dataset')
t = pq.read_table(p).to_pylist()
spk = {}
for r in t:
    a, s = r['audio'], str(r['speaker_id'])
    data, sr = sf.read(io.BytesIO(a['bytes']))
    d = len(data) / sr
    if 12 <= d <= 20 and s not in spk:
        spk[s] = (data, sr, d)
for s in [want] + [k for k in spk if k != want][:3]:
    if s in spk:
        data, sr, d = spk[s]; sf.write(f'ref_mls_{s}.wav', data, sr); print(f'ref_mls_{s}.wav', round(d, 1), 's')
print('speakers:', sorted(spk)[:30])
