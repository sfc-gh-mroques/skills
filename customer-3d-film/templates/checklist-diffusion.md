# Check-list de diffusion — à cocher avant d'envoyer le film à qui que ce soit hors de l'équipe

Le film est un support commercial **personnalisé** : il montre la marque du client, ses logiciels, des
chiffres et une voix synthétique. Chaque point ci-dessous a une raison concrète. Un point non coché =
on n'envoie pas (ou on envoie une version qui le respecte). Garder la liste cochée dans le dossier
projet (`diffusion.md`) avec la date et le nom de la personne qui a validé.

## 1. Licences du gabarit

- [ ] Les bibliothèques embarquées restent sous leur licence (Three.js MIT, GSAP licence « no charge » de
      GreenSock, polices Inter / Open Sans / IBM Plex Mono SIL OFL) : rien à afficher, mais ne pas les
      retirer du build ni s'en attribuer la paternité.

## 2. Marques et logos

- [ ] **Logo du client** : il est utilisé pour lui présenter un projet, pas pour une communication publique.
      Toute diffusion au-delà du client (salon, LinkedIn, site web, vidéo de référence) demande **l'accord
      écrit du client** (en général via son service communication).
- [ ] **Logos des éditeurs des sources** (A, B, C) : affichés tels quels, sans les déformer, recolorer ni
      les associer à une affirmation fausse (« partenaire », « certifié ») ; le film dit seulement que
      leurs données sont connectées. Pas d'usage public sans vérifier que l'éditeur l'accepte.
- [ ] **Logo et nom Snowflake** : version officielle, couleurs officielles ; respecter la charte de marque
      Snowflake (skill `snowflake-brand-guidelines`) si le film sort du cadre d'un rendez-vous client.
- [ ] Aucun logo de concurrent, de partenaire ou de client tiers qui ne serait pas dans le projet.

## 3. Chiffres et affirmations

- [ ] Chaque chiffre a une **source** notée dans `brief.md` : donnée publique (rapport annuel, site),
      donnée fournie par le client, **ou valeur simulée** (cas des POV / cahiers des charges : « 60 sites »,
      « 850 dossiers », etc. peuvent être des jeux de données fictifs). Les valeurs simulées ne sont pas
      présentées comme des faits sur le client.
- [ ] L'écran d'impact porte la mention **« Ordres de grandeur illustratifs, non garantis »**, et chaque
      tuile affiche son hypothèse de calcul.
- [ ] Les montants « objectif / projeté / écart / leviers » sont présentés comme un **scénario**, pas comme
      un engagement de résultat de Snowflake ; pas de ROI promis, pas de « garanti », « certain ».
- [ ] Les lieux (siège, villes, implantations) sont confirmés par une source ; un lieu non confirmé est
      retiré ou remplacé par un nom neutre.
- [ ] Les personnes à l'écran (directeur du site héros, collaborateurs, clients finaux) sont **fictives** :
      aucun vrai nom d'employé ni de client final du client, aucune photo de personne.

## 4. Confidentialité

- [ ] Aucune donnée interne Snowflake à l'écran ni dans la voix off : pas de citation Salesforce ou Gong,
      pas de montant de contrat, de consommation, de pipeline, de remise, pas de nom d'interlocuteur
      interne ou client, pas de verbatim d'appel.
- [ ] Aucune donnée réelle du client qui ne soit déjà publique ou explicitement fournie pour ce film
      (pas de capture d'écran de son environnement, pas d'extrait de base).
- [ ] Aucun élément de **roadmap** Snowflake, fonctionnalité non disponible (private preview non
      annoncée) ni date de sortie. En cas de doute sur le statut d'une fonctionnalité citée : la retirer.
- [ ] Le fichier ne contient pas d'information cachée : `python3 tools/residue.py` propre, pas de texte
      d'un autre client dans le HTML (titre d'onglet, commentaires, écrans peints dans la 3D).

## 5. Voix off

- [ ] Voix de synthèse (Chatterbox) : la référence de voix utilisée est sous licence compatible ; pour
      Multilingual LibriSpeech (CC-BY 4.0), **créditer** en cas de diffusion publique :
      « Voice reference from Multilingual LibriSpeech (Pratap et al., 2020), CC-BY 4.0 ».
- [ ] Ne jamais cloner la voix d'une personne réelle identifiable (collègue, dirigeant du client) sans son
      accord écrit.
- [ ] Les fichiers Chatterbox portent un **filigrane audio inaudible** (Perth) qui les identifie comme
      générés par IA : ne pas chercher à le retirer. Si le client demande, indiquer que la voix est synthétique.
- [ ] Le texte lu a été relu (Whisper, `check_asr.py`) : pas de chiffre déformé, pas de nom mal prononcé.

## 6. Partage

- [ ] Format adapté : **MP4** pour un codir (lecture garantie partout) ; HTML seulement pour une démo en
      direct sur une machine testée.
- [ ] Lien de partage **restreint** aux adresses du client concernées (Google Drive : « Accès limité »,
      jamais « Tous les utilisateurs disposant du lien »), avec date d'expiration si possible.
- [ ] Pas de publication sur YouTube, Vimeo public, réseaux sociaux ou site public.
- [ ] Le fichier envoyé est nommé sans mention interne (`<client>-film.mp4`, pas `v7-final-test`).

## 7. Validation avant envoi

- [ ] Revue « CEO brutally honest » faite (06) et correctifs retenus appliqués.
- [ ] Relecture complète du texte par une deuxième personne de l'équipe (orthographe, accents, chiffres).
- [ ] Le responsable du compte côté Snowflake a vu le film et valide l'envoi.
- [ ] Pour toute diffusion au-delà de l'audience prévue : **accord écrit du client**.

## 8. Accessibilité (recommandé)

- [ ] Sous-titres disponibles si la voix off porte un message absent de l'écran (fichier `.srt` généré
      depuis `voiceover.json`, ou incrustés à l'export).
- [ ] Contraste et taille des textes vérifiés sur un écran de salle de réunion (petits libellés ≥ 8 px à
      1280 px de large, cf. 04).
- [ ] Le film reste compréhensible sans le son (les titres portent le message).
