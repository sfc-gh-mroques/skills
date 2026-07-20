---
name: get-meeting-attendees
description: >
  Retrouve les participants d'un meeting dans Google Calendar à partir d'un mot-clé de titre et/ou d'une date.
  Renvoie la liste des personnes (nom + email) en excluant l'utilisateur lui-même et les salles/ressources.
---

# Objectif

Identifier rapidement qui était présent à une réunion donnée pour enchaîner
sur une action (mail, relance, compte-rendu).

# Entrées attendues

- **Mot-clé du titre** (ex. « standup », « QBR », « kickoff », « sprint review ») — optionnel
- **Date ou fenêtre temporelle** (ex. « cet après-midi », « hier », « le 17/07 »)
- Interpréter les dates relatives selon le fuseau local de l'utilisateur.

# Procédure

1. Convertir la période demandée en bornes `timeMin` / `timeMax` (ISO 8601, fuseau local).
   - « cet après-midi » → 12:00 → 23:59 du jour courant.
   - « aujourd'hui » → 00:00 → 23:59 du jour courant.
2. Appeler l'outil **Google Calendar → `calendar_list_events`** avec :
   - `q` = mot-clé du titre (si fourni)
   - `timeMin`, `timeMax` = bornes calculées
   - `singleEvents: true`, `orderBy: "startTime"`
3. Si plusieurs événements correspondent, les lister et demander lequel cibler.
4. Extraire la liste `attendees` de l'événement retenu.
5. **Filtrer** :
   - Retirer l'utilisateur courant (`self: true`).
   - Retirer les ressources/salles (emails en `@resource.calendar.google.com`).
6. Restituer : nom (ou email si pas de nom), email, et rôle (organisateur le cas échéant).

# Sortie

- Titre du meeting + horaire (fuseau local)
- Liste des participants réels (nom + email), organisateur signalé
- Si aucun résultat : élargir la fenêtre ou proposer une recherche sans mot-clé.

# Bonnes pratiques

- Toujours confirmer la date interprétée si elle est relative.
- Ne jamais inclure les salles/ressources dans les « personnes ».
- Répondre dans la langue de la question.
