---
name: draft-email
description: >
  Rédige et crée un brouillon d'email (Gmail) à partir d'un destinataire, d'un objet et d'un contenu.
  Applique par défaut un template HTML professionnel et soigné, et reste en brouillon jusqu'à validation explicite.
---

# Objectif

Préparer un email professionnel — souvent un récapitulatif de données —
à envoyer à un contact, sans envoi automatique tant que l'utilisateur n'a pas validé.

# Entrées attendues

- **Destinataire(s)** (email ; peut provenir du skill get-meeting-attendees)
- **Objet** (déduit du contenu si non fourni)
- **Contenu / données à inclure** (texte, tableau, KPIs)
- **CC** éventuels, **format** (HTML par défaut)

# Procédure

1. Rassembler les données à communiquer (si issues de Cortex Analyst : reprendre les chiffres exacts, arrondir les € au K et les pourcentages à 1 décimale).
2. Construire le corps HTML avec le template professionnel (voir gabarit ci-dessous).
3. Appeler **Gmail → `gmail_create_draft`** avec :
   - `to`, `cc` (si fourni)
   - `subject` — **ENCODAGE RFC 2047 OBLIGATOIRE, SANS EXCEPTION** : le champ subject souffre d'un bug d'encodage côté connecteur. La SEULE solution qui fonctionne est d'encoder le sujet en RFC 2047 base64 UTF-8. Tu DOIS encoder, même si le sujet contient des accents. Ne JAMAIS passer le sujet en texte brut, ne JAMAIS retirer les accents, ne JAMAIS utiliser de l'ASCII « pour être safe ». Le format est : `=?UTF-8?B?<base64 des bytes UTF-8 du sujet>?=`. Procédure : (1) écrire le sujet normalement avec tous ses accents, (2) convertir en bytes UTF-8, (3) encoder ces bytes en base64, (4) entourer du wrapper `=?UTF-8?B?` ... `?=`. Exemple : « Réunion Évolution données » → `=?UTF-8?B?UsOpdW5pb24gw4l2b2x1dGlvbiBkb25uw6llcw==?=`. C'est un IMPÉRATIF — tout autre choix produira du mojibake.
   - `body` = HTML, `isHtml: true`. Inclure `<meta charset="UTF-8">` dans le `<head>`.
4. **Par défaut, créer un brouillon** (jamais d'envoi direct).
5. Confirmer la création et proposer : envoyer, ajouter des destinataires en copie, modifier le texte/la mise en forme.

# Gabarit HTML

- En-tête : dégradé bleu marine → bleu (#0a2540 → #1a6ce7), titre + sous-titre.
- Corps : salutation nominative, phrase de contexte.
- Cartes KPI (optionnel) : 3 blocs colorés (valeur clé + libellé).
- Tableau de données : en-têtes bleu marine, lignes alternées (#ffffff / #f8fafc), valeurs notables mises en évidence (rouge #c2410c, vert #166534).
- Encadré « Points clés » : bordure gauche bleue, liste à puces.
- Signature : nom complet de l'utilisateur.
- Pied de page : bandeau bleu marine avec le nom de l'entreprise de l'utilisateur (si connu).

# Sortie

- Confirmation du brouillon créé (destinataire + objet)
- Rappel qu'aucun envoi n'a été effectué
- Options de suite (envoi / CC / retouches)

# Bonnes pratiques

- Ne jamais envoyer sans confirmation explicite.
- Signer avec le nom réel de l'utilisateur.
- Respecter la langue de la demande.
- Ne pas dupliquer les mêmes chiffres en double dans le texte et le tableau.
- **Encodage** : le sujet doit toujours être passé en RFC 2047 base64 UTF-8 (`=?UTF-8?B?...?=`) pour contourner un bug d'encodage du connecteur. Le body HTML doit déclarer `<meta charset="UTF-8">` dans le `<head>` (le body n'est pas affecté par le bug).
