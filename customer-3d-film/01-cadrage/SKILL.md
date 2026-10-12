# 01 — Cadrage : la fiche client

Objectif : obtenir, **avant toute ligne de code**, une fiche client validée. Tout ce qui n'est pas
dans la fiche ne doit pas apparaître dans le film.

## 1. Collecter (dans cet ordre)

1. **Contexte existant** : y a-t-il un film précédent, une session d'agent précédente, un deck,
   des notes de RDV ? Les récupérer d'abord (par ex. les bots locaux de Cortex Code vivent dans
   `~/.snowflake/bots/bots/<id>/sessions.db`, SQLite, tables `sessions` et `messages`). Exporter en
   `session.md` + `attachments/` dans le dossier projet.
2. **Sources internes** (Glean, Salesforce, Gong si dispo) : métier du client, taille du réseau,
   logiciels utilisés, enjeux du moment, vocabulaire interne.
   Question Glean type : « enjeux business, priorités du comité de direction, chiffres clés, vocabulaire des
   dirigeants, bénéfices attendus — avec faits vérifiés ». **Marquer chaque chiffre réel ou simulé (POV)** et chaque
   lieu confirmé ou non : un chiffre de cadrage POV n'est pas un chiffre corporate.
3. **Questions à l'utilisateur** (une seule fois, groupées avec `ask_user_question`) — uniquement ce
   qui manque :
   - Audience exacte (codir ? DAF ? DSI ?) → par défaut **codir, valeur business**.
   - Langue à l'écran → par défaut celle de l'audience.
   - Les sources à montrer (et seulement celles-là).
   - Faut-il parler de data sharing / Marketplace / multi-cloud ? → par défaut **non**.
   - Logos fournis ? Sinon : les chercher, à défaut plaque texte générique.

## 2. Remplir `templates/fiche-client.md`

Champs indispensables :

| Champ | Exemple anonymisé | Piège |
| --- | --- | --- |
| Métier du client | réseau de N sites en régions | ne pas garder le contenu fictif du gabarit |
| Géographie | carte du pays, densité dans une région, siège dans une ville | positions réelles (lon/lat) |
| Site héros | « Site X », ville Y | doit être sur la carte |
| Personnage | prénom nom fictif, rôle (directeur de site) | fictif, crédible |
| Objectif chiffré | « X M€ de <indicateur>, échéance <mois> » | un seul chiffre, une échéance |
| Question d'ouverture | « Peut-on tenir l'objectif ? » | une question fermée, tendue |
| Sources | source A, B, C (chacune avec son rôle métier) | vraies marques, vrais logos |
| Douleur | exports Excel, ressaisies, chiffres qui divergent | concrète, montrable |
| Objet métier pivot | « la fiche client unique » (un client final fictif SAS) | un nom crédible |
| Rôles | direction réseau, directeur de site, collaborateur | 3–4 rôles max |
| Leviers (métier) | charge des équipes, benchmark entre sites, nouvelle obligation réglementaire, relances | chaque levier a un montant |
| Trajectoire | projection actuelle P vs objectif X → écart E = X − P | les leviers doivent combler l'écart |
| Leviers de l'agent IA | a + b + c = E | la somme tombe juste |
| Impact | tuiles (temps gagné, délai de clôture, marge…) | « ordres de grandeur illustratifs » |
| Fin | « Le client × Snowflake — <promesse en une ligne> » | reprend l'objectif |
| Exclusions | pas de Marketplace, pas de multi-cloud, pas de camions/usines | lister explicitement |

## 3. Valider

Présenter la fiche **sous forme de tableau** et attendre un « ok » explicite. Puis enregistrer
la fiche dans le dossier projet (`brief.md`) : elle sert de référence pour la revue CEO.

## Leçons

- **Tout le film est en français**, y compris les messages Snowflake (« Connecter · Sécuriser ·
  Comprendre · Agir ») : le gabarit l'est déjà, ne réintroduire aucun slogan en anglais.
- « Business value pour un codir » veut dire : chaque scène répond à « qu'est-ce que ça change pour
  mon objectif ? ». Une scène qui ne répond pas à ça est coupée.
