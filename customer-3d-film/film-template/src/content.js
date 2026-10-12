// ════════════════════════════════════════════════════════════════════════════
// CONTENU DU FILM — le seul fichier à modifier pour adapter le film à un client.
// Tous les textes, noms, chiffres et villes affichés viennent d'ici.
// (Le code ne contient plus de texte visible ; la géométrie et le minutage restent dans src/world et src/film.)
//
// Règles :
//  - Garder les clés (ids) ; ne changer que les valeurs.
//  - Les chaînes marquées « html » acceptent <br>, <em>…</em> (mot en couleur), &nbsp;.
//  - Les chiffres doivent rester cohérents : objectif − projeté = écart = somme des 3 leviers de l'agent.
//  - Tout le film est dans une seule langue (ici le français), accents compris.
// ════════════════════════════════════════════════════════════════════════════

// ── 1. Variables de base (réutilisées partout plus bas) ─────────────────────
const CLIENT = 'Client';              // nom affiché du client
const ACCOUNT = 'CLIENT';             // nom du compte Snowflake (en capitales)
const NETWORK = `Réseau ${CLIENT}`;   // « Réseau <client> »
const SITES = 60;                     // nombre de sites (doit correspondre aux sites de la carte : 9 villes + OTHERS)
const SITE = 'Site';                  // nom générique d'une entité du réseau (agence, magasin, usine…)
const SITES_W = 'sites';              // pluriel en minuscules
const HERO_CITY = 'Belmont';          // ville du site héros
const HERO = `${SITE} ${HERO_CITY}`;  // « Site Belmont »
const HQ_CITY = 'Castelmar';          // ville du siège
const DIRECTOR = 'Alex Martin';       // le personnage (fictif)
const DIRECTOR_SHORT = 'A. Martin';
const DIRECTOR_INITIALS = 'AM';
const ROLE_DIRECTOR = 'Directeur';    // son rôle (« Directeur », « Directrice »…)
const A = 'Source A', B = 'Source B', Cc = 'Source C';   // les logiciels du client (vraies marques)

// Trajectoire (ordres de grandeur illustratifs) — objectif − projeté = écart = L1 + L2 + L3
const OBJ = '2,40 M€', OBJ_NBSP = '2,40&nbsp;M€', PROJ = '2,15 M€', GAP = '250 K€';
const L1 = '160 K€', L2 = '55 K€', L3 = '35 K€';
const DEADLINE = 'décembre', DEADLINE_CAP = 'Décembre';
const KPI = 'Taux de réalisation', KPI_VALUE = '68,2', KPI_UNIT = ' %';   // l'indicateur suivi par tous
const QUESTION = 'Quel est le taux de réalisation du réseau ?';             // « même question, partout »

// ── 2. Contenu détaillé ──────────────────────────────────────────────────────
export const K = {
  // page, affiche, lecteur
  meta: {
    title: `${CLIENT} — Piloter son réseau de ${SITES_W}`,          // titre de l'onglet (build.mjs)
    posterEyebrow: `${CLIENT} · Snowflake · Réseau de ${SITES_W}`,
    posterQuestion: 'Peut-on tenir l’objectif ?',
    loading: 'Préparation du film…',
    playLabel: 'Lancer le film',
    keys: 'ESPACE  lecture / pause   ·   ← →  chapitres   ·   F  plein écran',
    toggleLabel: 'Lecture ou pause',
    trackLabel: 'Position dans le film',
    fullscreenLabel: 'Plein écran',
    bootFail: 'Ce navigateur ne peut pas lancer le film 3D.',
    brandTag: 'Plateforme de données et d’IA',                        // sous le logo Snowflake
  },

  // chapitres affichés sur la barre de lecture (même ordre que T dans timeline.js)
  acts: ['L’objectif', 'Données éclatées', 'Connecter', 'Fiche client unique', 'Un seul réseau', 'Sécuriser',
    'Comprendre', 'Le métier', 'Nouvelle réglementation', 'Tous les usages', 'Tableau de bord', 'Agent IA',
    'Impact', 'Objectif atteignable'],

  // carte : villes nommées (lon, lat). hq = siège, hero = site héros ; tag = [longueur de tige, décalage x] de leur grande étiquette.
  // Les clés (hq, hero, city3…city9) sont référencées ailleurs : cityTags ci-dessous, sources.<id>.city,
  // et story.js (anneaux hq/hero). Pour ajouter/retirer une ville : changer ici ET dans cityTags.
  // Le nombre total de sites = villes nommées + OTHERS (src/world/country.js).
  cities: {
    hq: { name: HQ_CITY, role: `Siège ${CLIENT}`, ll: [5.72, 45.19], hq: true, tag: [3.4, 4.5] },
    hero: { name: HERO_CITY, role: HERO, ll: [5.05, 45.04], hero: true, tag: [2.2, -6.5] },
    city3: { name: 'Rivebelle', ll: [4.89, 44.93] },
    city4: { name: 'Montclair', ll: [4.84, 45.76] },
    city5: { name: 'Haute-Vallée', ll: [5.92, 45.57] },
    city6: { name: 'Lacroix', ll: [6.13, 45.9] },
    city7: { name: 'Saint-Aubel', ll: [3.09, 45.78] },
    city8: { name: 'Port-Neuf', ll: [4.39, 45.43] },
    city9: { name: 'Capitale', ll: [2.35, 48.86] },
  },
  // étiquette de ville : [clé, longueur de tige, décalage x] — décaler pour éviter les chevauchements
  // étiquettes de villes : [clé, longueur de tige, décalage x, visible sur la vue d'ensemble de la carte]
  // city3/5/6 sont masquées sur la vue d'ensemble (trop proches du siège et du site héros : vérifier avec tools/overlap.mjs)
  // mais réapparaissent au chapitre « Le métier » (beatCities).
  cityTags: [['city9', 0.6, 3, true], ['city4', 3.2, -2.5, true], ['city3', 1.6, -4.5, false], ['city5', 1.6, 4.6, false],
    ['city6', 3.2, 3.5, false], ['city7', 2.2, -3, true], ['city8', 7, -1, true]],

  // les sources : city = ville de la carte au-dessus de laquelle la plaque est posée ; cap = ce qu'elles savent (carte / bureau) ;
  // alt = message après l'action de l'agent ; screen = titre de l'écran du poste dans l'open space
  sources: {
    srcA: { city: 'city9', name: A, cap: 'dossiers clients · missions · facturation', capOffice: 'dossiers clients · facturation', alt: 'propositions envoyées ✓', screen: `${A} · Dossiers clients`, screenApp: `${A} · Production` },
    srcB: { city: 'city4', name: B, cap: 'temps passés · activité', capOffice: 'temps passés', alt: 'temps manquants signalés ✓', screen: `${B} · Feuille de temps` },
    srcC: { city: 'city7', name: Cc, cap: 'RH · paie', capOffice: 'RH · paie', screen: `${Cc} · Paie d’octobre` },
    excel: { city: 'city3', name: 'Excel', plate: 'Exports Excel', cap: 'consolidation manuelle', capOffice: 'tableaux de suivi', screen: 'Export_chiffre d’affaires_octobre.xlsx', sheet: 'Suivi_missions.xlsx' },
  },
  connected: 'connecté',

  // la fiche unique : un même client final écrit de trois façons
  record: {
    client: 'Dupont Industries', clientFull: 'Dupont Industries SAS', clientCode: 'CLI_003847', clientExcel: 'DUPONT IND',
    mission: 'Contrat annuel', missionFull: 'Contrat annuel 2026', missionCode: 'MIS-2847', missionExcel: 'ligne 847',
    how: '3 écritures → 1', quality: 'Fiches rapprochées', qualityValue: '99,4 %',
    labelClient: 'Client', labelMission: 'Mission',
  },

  // chaîne métier du site héros (chapitre « Comprendre ») : [clé, libellé, valeur]
  chain: [['client', 'Client', 'Dupont Industries SAS'], ['mission', 'Mission', 'Contrat annuel 2026'], ['collab', 'Collaborateur', 'Sophie Martin'],
    ['temps', 'Temps passé', '47 h · octobre'], ['factu', 'Facturation', '3 243 €'], ['recouv', 'Recouvrement', '847 € en attente'], ['echeance', 'Échéance', 'Renouvellement · 15 mai']],
  // ce que l'agent trouve (rouge) puis propose (vert), posé sur la chaîne ; les montants = leviers L1, L2, L3
  risks: [['temps', '12 missions', 'temps non saisis'], ['factu', '37 clients', 'prestations non facturées'], ['echeance', '16 clients', 'renouvellements à lancer']],
  options: [['factu', 'Propositions de facturation', `+${L1}`], ['temps', 'Temps manquants', `+${L2}`], ['echeance', 'Missions anticipées', `+${L3}`]],
  regTag: ['Nouvelle réglementation', '410 clients pas encore conformes'],

  // titres du film (html) — un par moment ; eyebrow = petite ligne au-dessus
  director: `${HERO}<i>·</i>${ROLE_DIRECTOR} ${DIRECTOR}`,
  steps: ['Connecter', 'Sécuriser', 'Comprendre', 'Agir'],
  stepDash: 'Tableau de bord', stepAgent: 'Agent IA',
  headlines: {
    o1: { h: `Objectif de chiffre d’affaires : ${OBJ_NBSP}.<br>Échéance : ${DEADLINE}.` },
    o2: { h: 'Peut-on tenir<br>l’<em>objectif</em>&nbsp;?', sub: 'Pour répondre, il faut relier chaque étape :<br>du temps passé jusqu’au recouvrement.' },
    p1: { h: 'Un réseau.<br><em>Des données éclatées.</em>', sub: `${SITES} ${SITES_W}. ${A}, ${B} et ${Cc} voient chacun une partie de l’histoire.` },
    c0: { h: '<em>Connecter</em> toutes vos données.', sub: `Tous les ${SITES_W}. Tous les logiciels.` },
    c1: { h: 'Connecter toutes vos données.', sub: 'Dossiers clients. Temps passés. Paie. Exports Excel.' },
    f1: { h: 'Une fiche client<br><em>unique</em>.', sub: 'Trois logiciels, trois écritures. Une seule vérité.' },
    n1: { h: `<span>${SITES} ${SITES_W}.</span><span><em>Un seul modèle de pilotage.</em></span>` },
    g1: { h: 'Chacun voit ce qu’il<br>a le <em>droit</em> de voir.', sub: `Les salaires ${Cc} restent confidentiels.` },
    x1: { h: 'Relier les données.<br><em>Comprendre le métier.</em>', sub: 'Client, mission, collaborateur, temps, facturation, recouvrement, échéance : un seul modèle.' },
    mt: { h: `Piloter le métier,<br><em>${SITE.toLowerCase()} par ${SITE.toLowerCase()}.</em>` },
    ei: { h: 'Nouvelle réglementation :<br><em>une opportunité.</em>', sub: `Repérée dans les données ${A}, pas dans un tableur.` },
    v1: { h: 'Un seul contexte. <em>Tous les usages.</em>', sub: 'Tableaux de bord, applications et IA partagent la même réalité.' },
    b1: { h: 'BI :<br><em>où en<br>est-on&nbsp;?</em>' },
    ag1: { h: '<span>L’IA analyse.</span> <span>Le directeur décide.</span><br><span>Les logiciels exécutent.</span>', sub: `Les actions approuvées repartent dans ${A} et ${B}.` },
    i0: { eyebrow: 'Ordres de grandeur illustratifs', h: 'Ce qui change<br>pour le <em>réseau</em>.' },
    z1: { h: 'Objectif de nouveau<br><em>atteignable.</em>', sub: `${OBJ}. ${DEADLINE_CAP}.` },
  },
  endLine: `Piloter ${SITES} ${SITES_W} avec une seule vérité.`,

  // pastille « objectif » en coin d'écran
  chip: { label: `Objectif · ${HERO}`, value: `${OBJ}<span>→</span>${DEADLINE}`, q: ['Objectif tenu ?', 'Inconnu'], risk: ['À risque', `Projeté ${PROJ} · écart ${GAP}`], plan: ['Plan approuvé', 'Objectif de nouveau atteignable'] },
  dsteps: ['Données', 'Relations', 'Métier'],

  // qui voit quoi : colonnes, rôles (cells : all = tout le réseau, own = son site, mine = les siens, agg = agrégés, null = aucun accès)
  gov: {
    title: 'Qui voit quoi', subtitle: 'Une seule règle, pour les personnes et pour l’IA',
    domains: ['Clients · missions', 'Temps passés', 'Chiffre d’affaires', 'Salaires'],
    roles: [
      { tag: 'DG', who: 'DG Groupe', scope: `Les ${SITES} ${SITES_W}`, sees: ['srcA', 'srcB', 'excel'], cells: ['all', 'all', 'all', 'agg'] },
      { tag: 'DC', who: `${ROLE_DIRECTOR} de ${SITE.toLowerCase()}`, scope: `Son ${SITE.toLowerCase()}`, sees: ['srcA', 'srcB', 'excel'], cells: ['own', 'own', 'own', 'agg'] },
      { tag: 'CO', who: 'Collaborateur', scope: 'Ses missions et ses temps', sees: ['srcB'], cells: ['mine', 'mine', null, null] },
      { tag: null, who: 'Agent IA', scope: 'Jamais plus que la personne qui demande', sees: ['srcA', 'srcB', 'excel'], inherit: true },
    ],
    cellLabels: { all: 'Réseau', own: SITE, mine: 'Les siens', agg: 'Agrégés' },
    inherit: 'Mêmes droits que la personne qui pose la question',
    noAccess: 'Aucun accès', legend: 'Salaires : montants individuels visibles du seul service paie',
  },

  // bandeau « un seul réseau »
  share: [NETWORK, `${SITES} ${SITES_W}`, '~30 000 clients', '~1 200 collaborateurs'],

  // fenêtre Snowflake « fiche client unique »
  trust: { section: 'Données', tabs: ['Sources', 'Fiche client unique'], live: 'En direct', account: 'Compte', accountName: ACCOUNT,
    inTools: 'Dans vos logiciels', sources: 'Sources connectées', sourcesLive: '4 en direct', out: 'Fiche client unique' },

  // villes mises en avant pendant chacune des trois cartes du chapitre « Le métier » (hq / hero / city…)
  beatCities: [['hero'], ['city6', 'city8', 'hero'], ['city3', 'city5']],
  // chapitre « Le métier » : trois cartes [sur-titre, titre, barres [libellé, %, texte, style], note html]
  beats: [
    ['Charge des collaborateurs · avril-mai', 'Avant la clôture', [['Sophie M.', 92, '128 %', 'hot'], ['Julien P.', 82, '114 %', 'hot'], ['Claire D.', 70, '97 %'], ['Marc T.', 54, '76 %'], ['Inès B.', 44, '61 %']], 'Rééquilibrer <b>3 dossiers</b> avant le 15 mai.'],
    [`Benchmark inter-${SITES_W}`, KPI, [['Lacroix · meilleur', 84, '84 %', 'best'], ['Médiane réseau', 76, '76 %'], [HERO_CITY, 68, '68 %', 'hot'], ['Port-Neuf · plus bas', 63, '63 %', 'hot']], 'Écart entre le meilleur et le moins bon : <b>21 points</b>.'],
    [`Déclarations ${Cc} · échéance du 5 novembre`, 'Déclarations sociales', [['Déposées', 97, `58 / ${SITES}`, 'best'], ['En cours · Rivebelle', 30, 'J-2'], ['En cours · Haute-Vallée', 30, 'J-2']], `<b>2 ${SITES_W}</b> relancés automatiquement.`],
  ],

  // chapitre « levier sectoriel / réglementaire »
  reg: { head: 'Analyse des dossiers clients', n1: ['410', 'clients pas encore conformes'], n2: ['500 K€', 'de missions d’accompagnement'],
    cal: [['Étape 1', 'Première obligation pour tous les clients'], ['Étape 2', 'Généralisation à tout le périmètre']] },

  // « même question, partout »
  question: QUESTION, sameQuestion: 'Même question, partout', oneContext: '<b>Snowflake</b> · un seul contexte métier, partagé',

  // impact : [titre, valeur html, hypothèse]
  impact: [
    [KPI, '+1 pt ≈ +1 M€ <small>de CA / an</small>', `Hypothèse : ~180 M€ de prestations par an sur les ${SITES} ${SITES_W} (1 200 collaborateurs).`],
    ['Consolidation mensuelle', '5 jours → <small>quelques minutes</small>', `Hypothèse : ${SITES} exports Excel rapprochés à la main chaque mois par le contrôle de gestion.`],
    ['Nouvelle réglementation', '500 K€ <small>de missions</small>', 'Hypothèse : 410 clients pas encore conformes × ~1 220 € d’accompagnement.'],
  ],
  impactNote: 'Ordres de grandeur illustratifs, non garantis.',

  // textes peints dans l'open space : mur d'accueil (logo texte + sous-titre), titre de l'écran principal
  office: { wall: ACCOUNT, wallSub: `${SITE} de ${HERO_CITY}`, screenTitle: `${HERO} · Tableau de bord` },

  // ── écrans des appareils ──
  // moniteur d'ouverture (application de la source A)
  monitor: {
    app: SITE, search: 'Rechercher un client, une mission…',
    tabsBefore: ['Accueil', 'Clients', 'Missions'], tabOn: SITE, tabsAfter: ['Équipe', 'Facturation', 'Rapports'],
    icon: 'C', kicker: SITE, title: `${HERO_CITY} · ${DIRECTOR}`,
    fields: [['Équipe', '14 collaborateurs'], ['Clients actifs', '312'], ['Dans le réseau depuis', 'janvier 2019']],
    badge: ['Objectif de chiffre d’affaires', `Atteignable · ${DEADLINE}`],
    commitTitle: 'Objectif de l’exercice', objLabel: 'Objectif', objValue: OBJ, objUnit: 'de chiffre d’affaires annuel',
    dueLabel: 'Échéance', dueValue: DEADLINE_CAP, dueUnit: 'fin d’exercice',
    rows: [['Facturé à fin octobre', '847 K€'], [KPI, `${KPI_VALUE}${KPI_UNIT}`]], status: ['Statut', 'À risque', 'Atteignable ✓'],
    activityTitle: 'Activité récente',
    activity: [['Revue réseau', `« ${HERO_CITY} doit sécuriser ${GAP} d’ici la fin de l’exercice. »`, true], ['Équipe', '2 recrutements en septembre'], ['Portefeuille', '37 clients à revoir avant facturation']],
  },
  // rapport BI
  bi: {
    name: 'BI', crumb: `Réseau  ›  Pilotage des ${SITES_W}`, live: 'En direct · données Snowflake',
    menu: ['Fichier', 'Exporter', 'Partager', 'S’abonner', 'Explorer'], title: 'Pilotage du réseau', period: `octobre · tous les ${SITES_W}`,
    kpis: [[KPI, KPI_VALUE, KPI_UNIT, '▼ 3,1 pts sur un mois'], ['CA projeté', '138', ' M€', `objectif 142 M€ · ${SITES} ${SITES_W}`], ['Taux d’activité', '72', ' %', '1 200 collaborateurs'], [`${SITE}s sous l’objectif`, '8', '', `sur ${SITES} ${SITES_W}`, 'warn']],
    tableTitle: `${SITE}s sous l’objectif`, head: [SITE, ROLE_DIRECTOR, 'Objectif', 'Projeté', 'Écart'],
    rows: [[HERO_CITY, DIRECTOR_SHORT, OBJ, PROJ, `−${GAP}`], ['Rivebelle', 'C. Leroy', '0,98 M€', '0,94 M€', '−40 K€'], ['Montclair', 'J. Moreau', '1,10 M€', '1,05 M€', '−50 K€']],
    monthsTitle: `${KPI} par mois`, months: ['mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.'], bars: [72, 74, 70, 68, 66, 71, 69, 62],
    capTitle: `Taux d’activité par ${SITE.toLowerCase()}`, cap: [[HERO_CITY, 72, '72 %', true], ['Rivebelle', 78, '78 %'], ['Montclair', 81, '81 %'], [HQ_CITY, 69, '69 %', true]],
    polesTitle: 'Temps passé non facturé par pôle', poles: [['Pôle A', 42, '42 %', true], ['Pôle B', 31, '31 %', true], ['Pôle C', 18, '18 %'], ['Conseil', 12, '12 %']],
    selTitle: `${SITE} sélectionné`, selName: HERO, selInfo: `Dir. ${DIRECTOR_SHORT} · 22 collaborateurs · 480 clients`,
    objLabel: 'Objectif', projLabel: 'Projeté', gapLabel: 'd’écart', obj: OBJ, proj: PROJ, gap: `−${GAP}`,
    filters: 'Filtres', tabOn: 'Synthèse', tabs: [`${SITE}s`, 'Facturation', 'Temps', 'Clients'],
  },
  // Snowflake Intelligence sur l'ordinateur portable
  snowUI: { side: ['Accueil', 'Projets', 'Données', 'IA', 'Supervision', 'Accès'], title: 'Snowflake Intelligence', ctx: `${NETWORK} · contexte métier`,
    asker: 'DG', answerLabel: `${KPI} · octobre · ${SITES} ${SITES_W}`, answer: `${KPI_VALUE}<u>${KPI_UNIT}</u>`, note: 'Une seule définition, partout' },
  // application de la source A sur la tablette : [libellé, valeur, unité, note, style]
  ops: { head: 'Mon tableau de bord', tiles: [[KPI, KPI_VALUE, KPI_UNIT, `octobre · ${SITES} ${SITES_W}`], ['Clients à facturer', '37', '', 'prestations en attente', 'warn'], ['Taux d’activité', '72', ' %', 'octobre', 'warn'], ['Missions en cours', '284', '', 'ce trimestre'], ['Échéance contractuelle', '16', '', 'avant le 15 mai'], ['Équipe', '14', '', 'collaborateurs']] },
  // assistants sur les téléphones
  assistant: { a1: 'Assistant IA', a2: `${CLIENT} Mobile`, pre: `Le ${KPI.toLowerCase()} du réseau est de`, value: `${KPI_VALUE}<u>${KPI_UNIT}</u>`, post: `en octobre, sur les ${SITES} ${SITES_W}.`, src: 'Snowflake · contexte métier partagé', write: 'Écrire à' },
  // l'agent : pourquoi → que faire → exécuté dans les logiciels
  agent: {
    title: 'Agent IA', ctx: `${NETWORK} · ${HERO}`, data: 'Données Snowflake', why: 'Pourquoi ?', what: 'Que faire ?',
    answer: `${HERO} : ${PROJ} projetés, ${GAP} d’écart.`,
    causes: [['37 clients : prestations non facturées', L1, `${A} × ${B} · temps valorisés non facturés`], ['12 missions : temps non saisis', L2, `${B} · feuilles de temps incomplètes`], ['16 clients : renouvellements à anticiper', L3, 'Échéancier · renouvellements de mai']],
    planTitle: `+${GAP} · retour à ${OBJ}`,
    options: [['Envoyer 37 propositions de facturation', `${A} · +${L1}`], ['Relancer les temps manquants de 12 missions', `${B} · +${L2}`], ['Anticiper les renouvellements de 16 clients', `${A} · +${L3}`]],
    approver: DIRECTOR_SHORT, approverInitials: DIRECTOR_INITIALS, approve: 'Approuver', approved: 'Approuvé ✓',
    execTitle: 'Écrit dans vos logiciels', exec: [['srcA', A, '37 propositions de facturation · 16 missions créées'], ['srcB', B, 'Temps manquants signalés · 12 missions']],
  },
};
