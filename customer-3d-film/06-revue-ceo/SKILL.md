# 06 — Revue « CEO du client », brutally honest

Un premier film adapté sans recul (textes remplacés, monde d'un autre secteur conservé) a été noté **4,5/10** par cette revue.
C'est l'étape qui fait le plus progresser le film : la faire **avant** de présenter au client.

## 1. Préparer le matériel

- 27 images (une toutes les 6 s) + images de fin, 3 planches-contact (05).
- `node tools/copy.mjs "6,12,…" > /tmp/<projet>_texte.txt` : tout le texte visible par instant.
- La fiche client (`brief.md`).
- `reference/planche-gabarit.jpg` (dans le skill) : niveau de finition attendu, à donner au sous-agent
  comme point de comparaison (lisibilité, taille des logos, densité de texte).

## 2. Lancer un sous-agent (type `generalPurpose`, readonly)

Prompt à adapter (remplacer les chevrons) :

> Tu es le CEO de <client>, <description du réseau>. On te présente un film de ~2:40 censé être
> montré à ton comité de direction pour expliquer ce que Snowflake change pour <objectif>. Regarde
> TOUTES les images de <dossier> (lis chaque PNG) et le texte visible <fichier>. Sois brutalement
> honnête, du point de vue d'un dirigeant pressé, pas d'un technicien. Évalue :
> 1. Est-ce que je me reconnais (métier, géographie, mes logiciels, mon vocabulaire) ?
> 2. Est-ce que je comprends la valeur pour MON objectif en une phrase ?
> 3. Jargon technique, features, anglais, éléments hors sujet (usines, camions, cloud, marketplace) ?
> 4. Cohérence des chiffres et crédibilité des montants.
> 5. Lisibilité (taille des textes et logos), rythme, moments morts, bugs visuels.
> 6. La fin : est-ce que j'ai envie d'agir ?
> Rends : une note /10, les 3 moments qui marchent, puis un TOP 10 des corrections classées par
> impact, chacune avec l'instant (s), le problème, et la correction concrète proposée.

## 3. Ce que la revue a typiquement trouvé (vérifier d'emblée)

1. Textes ou slogans en anglais pour un codir français → tout traduire.
2. Monde d'un autre secteur (usine, camions, port pour un réseau de services) → carte + bureau du client.
3. Sources décoratives qui ne sont pas celles du client → ne garder que les vraies.
4. Marketplace / data sharing / multi-cloud sans objet → supprimer les scènes.
5. Jargon produit → reformuler en bénéfice.
6. Logos minuscules → grands logos.
7. Objectif non chiffré ou chiffres incohérents → une trajectoire, un écart, des leviers qui le comblent.
8. Pas de personnage → un directeur de site nommé.
9. Agent IA qui « fait tout seul » → l'agent propose, l'humain valide, l'action revient dans les outils.
10. Impact présenté comme garanti → « ordres de grandeur illustratifs ».

## 4. Restituer à l'utilisateur

Note, top 10, puis **demander lesquels appliquer** (et les arbitrages structurants : langue,
suppressions de scènes). Appliquer ensuite tout ce qui est validé, rebuild, recapturer, et
re-scorer mentalement contre le même top 10.

Note : les sous-agents peuvent échouer (VPN : « IP … is not allowed », ou « internal error ») après
des modifications partielles. Faire alors l'état des lieux soi-même (build + captures) et continuer.
