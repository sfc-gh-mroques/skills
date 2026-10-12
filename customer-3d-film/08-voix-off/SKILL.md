# 08 — Voix off française (texte, voix, mixage, contrôle)

Entrée : `dist/<client>-film.mp4` (export de `05-build-verification` §5). Sortie : `dist/<client>-film-voix.mp4`.
Ordre : **texte → génération → mixage → contrôle automatique → écoute utilisateur**.

## 1. Écrire le texte (`voiceover.json`)

```json
{ "voice": "Thomas", "rate": 178, "video_offset": 1.5,
  "segments": [ { "t": 0.8, "end": 14.5, "id": "objectif", "text": "…" }, … ] }
```
- `t` = début du chapitre dans `T` (timeline.js) + 0,5 s ; `end` = début du suivant − 0,5 s.
  `video_offset` = noir ajouté en tête par `render-mp4.mjs` (`--pad`, 1,5 s).
- **Partir du vocabulaire du codir, pas du nôtre** : interroger Glean (`mcp_glean_chat`) sur
  « enjeux, priorités du comité de direction, vocabulaire des dirigeants, bénéfices attendus » du client,
  et reprendre leurs mots exacts (ex. « santé du réseau », « potentiel non capté », « signaux faibles », « next best action »).
- **Vérifier le statut des chiffres** : Glean distingue souvent chiffres réels et **périmètre simulé de POV**.
  Un chiffre simulé ne se prononce pas (« tout le réseau » plutôt que « N sites ») et se signale à
  l'utilisateur s'il est aussi affiché à l'écran. Idem pour un lieu non confirmé par les sources.
- Chaque logiciel source est associé à ce qu'il apporte (« <donnée> dans A, <donnée> dans B, <donnée> dans C »).
- Écrire pour l'oreille : montants en toutes lettres, marques en écriture phonétique, phrases courtes.
- La voix **complète** l'écran, ne le relit pas.

### Remplir les fenêtres (sinon : blancs de 3–4 s, jugés « pas continus »)
- Viser **~16 caractères par seconde de fenêtre**, soit **fenêtre − 1 s** de parole.
  `longueur cible ≈ (end − t − 1) × 16`. Un premier jet à ~10 car/s donne ~60 % de silence.
- Ne pas dépasser ~17 car/s : au-delà, le mixage accélère (atempo) et ça s'entend dès ×1,15.
  Si un segment sort à ×1,15 ou plus, **raccourcir le texte et régénérer**, ne pas accepter l'accélération.
- Calcul rapide après écriture :
  `python3 -c "import json;[print(s['id'],round(len(s['text'])/16,1),'/',round(s['end']-s['t'],1)) for s in json.load(open('voiceover.json'))['segments']]"`

## 2. Générer la voix

### A. macOS `say` (immédiat, robotique)
`python3 tools/voiceover.py voiceover.json dist/<client>-film.mp4 dist/<client>-film-voix.mp4` (voix `Thomas`).

### B. Chatterbox Multilingual (local, naturel, MIT) — recommandé
```bash
mkdir -p "$WORK_DIR/tts_local" && cd "$WORK_DIR/tts_local"
uv venv -p 3.11 .venv && uv pip install -p .venv/bin/python chatterbox-tts "pyarrow<17" "setuptools<81" soundfile librosa -U tqdm
cp ~/.snowflake/cortex/skills/customer-3d-film/scripts/{speak_batch.py,fetch_ref.py,check_asr.py,check_mix.py} .
.venv/bin/python fetch_ref.py            # extrait 4 voix FR de Multilingual LibriSpeech (CC-BY 4.0)
nohup .venv/bin/python speak_batch.py <projet>/voiceover.json <projet>/vo_chatterbox --ref ref_mls_1406.wav > /tmp/cb.log 2>&1 &
grep audio /tmp/cb.log                   # suivre : "<id>  X s audio · Y s compute"
```
- **Choisir la voix selon le genre demandé, en mesurant la hauteur (F0)**, jamais au hasard :
  `librosa.pyin` sur chaque `ref_mls_*.wav` → médiane < 150 Hz = homme, > 180 Hz = femme.
  Mesuré : **1406 = 97 Hz (homme, grave, recommandé)**, 296 = 137 Hz (homme), 12977 = 208 Hz (femme), 10179 = 202 Hz (femme).
- Toujours une référence **française** (sinon accent anglais).
- Temps : ~4 à 20 s de calcul par seconde d'audio sur GPU Apple (≈ 10–15 min pour 14 segments) ;
  le premier segment est le plus lent (préchauffage). Mac en veille = segment à 1 900 s : garder le Mac éveillé
  (`caffeinate -i` devant la commande).
- **Dérives à surveiller** dans le log : un segment beaucoup plus long que prévu (ex. 15,9 s pour ~9 s attendues)
  = répétition/hallucination → régénérer `--only <id>` (aléatoire : 1 à 3 essais suffisent).
- Pièges d'installation : `pyarrow ≥ 17` exige NumPy 2 (Chatterbox impose 1.26) ; `perth` exige `setuptools<81`
  (`pkg_resources`), sinon `'NoneType' object is not callable` ; `tqdm` trop ancien casse `transformers` ;
  poids CUDA → `torch.load(map_location=mps)` (géré dans `speak_batch.py`) ; ESM/HF : télécharger le parquet MLS
  directement (`hf_hub_download`), la lib `datasets` résout une version cassée.

## 3. Mixer
`python3 tools/voiceover.py voiceover.json dist/<client>-film.mp4 dist/<client>-film-voix.mp4 --wavdir vo_chatterbox`
- Rogne les silences de bord **avec marge** (0,15 s avant, 0,3 s après, fondu d'entrée) : un rognage sec à −45 dB
  **coupait les fins de phrases** (syllabes finales douces, consonnes finales).
- Accélère (atempo ≤ 1,25) uniquement si un segment déborde ; place à `t + video_offset` ; loudnorm −16 LUFS ;
  remux vidéo sans réencodage.
- Lire le tableau affiché : `durée/fenêtre` et `rate` par segment.

## 4. Contrôler automatiquement (avant de montrer)
```bash
.venv/bin/python check_asr.py <projet>/voiceover.json <projet>/vo_chatterbox          # WAV bruts : phrase complète ?
.venv/bin/python check_mix.py <projet>/voiceover.json <projet>/dist/<client>-film-voix.mp4   # MP4 final, chapitre par chapitre
```
Whisper-small transcrit ; `KO` = fin de phrase absente → régénérer (`check_asr`) ou revoir le rognage (`check_mix`).
Les noms propres mal transcrits (« Urex », « Full ») sont normaux ; seuls comptent les derniers mots.

## 5. Livrer
- Ouvrir : `open -a "QuickTime Player" dist/<client>-film-voix.mp4`.
- Rapport : durée de voix totale / durée du film (viser ≥ 70 %), segments accélérés, pauses > 3 s restantes,
  chiffres simulés ou lieux non confirmés encore visibles à l'écran.
- Crédit si publication : « Voice reference from Multilingual LibriSpeech (Pratap et al., 2020), CC-BY 4.0 ».
  Chatterbox ajoute un filigrane audio inaudible (Perth).
- Garder les versions : `voiceover.v1.json`, `vo_chatterbox_<variante>/`, un MP4 par variante.
