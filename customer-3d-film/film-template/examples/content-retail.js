// ════════════════════════════════════════════════════════════════════════════
// EXEMPLE — réseau fictif de jardineries (test d'adaptation à un autre secteur, contenu seul).
// Pour l'essayer : cp examples/content-retail.js src/content.js && npm run build
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
const CLIENT = 'Verdalia';              // nom affiché du client
const ACCOUNT = 'VERDALIA';             // nom du compte Snowflake (en capitales)
const NETWORK = `Réseau ${CLIENT}`;   // « Réseau <client> »
const SITES = 60;                     // nombre de sites (doit correspondre aux sites de la carte : 9 villes + OTHERS)
const SITE = 'Magasin';                  // nom générique d'une entité du réseau (agence, magasin, usine…)
const SITES_W = 'magasins';              // pluriel en minuscules
const HERO_CITY = 'Valombre';          // ville du site héros
const HERO = `${SITE} ${HERO_CITY}`;  // « Site Belmont »
const HQ_CITY = 'Mirandol';          // ville du siège
const DIRECTOR = 'Camille Roy';       // le personnage (fictif)
const DIRECTOR_SHORT = 'C. Roy';
const DIRECTOR_INITIALS = 'CR';
const ROLE_DIRECTOR = 'Directrice';    // son rôle (« Directeur », « Directrice »…)
const A = 'Caisse', B = 'Stocks', Cc = 'Paie';   // les logiciels du client (vraies marques)

// Trajectoire (ordres de grandeur illustratifs) — objectif − projeté = écart = L1 + L2 + L3
const OBJ = '6,80 M€', OBJ_NBSP = '6,80&nbsp;M€', PROJ = '6,42 M€', GAP = '380 K€';
const L1 = '210 K€', L2 = '120 K€', L3 = '50 K€';
const DEADLINE = 'juin', DEADLINE_CAP = 'Juin';
const KPI = 'Taux de disponibilité', KPI_VALUE = '91,4', KPI_UNIT = ' %';   // l'indicateur suivi par tous
const QUESTION = 'Quel est le taux de disponibilité du réseau ?';             // « même question, partout »

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
  acts: ['L’objectif', 'Données éclatées', 'Connecter', 'Fiche article unique', 'Un seul réseau', 'Sécuriser',
    'Comprendre', 'Le métier', 'Nouvelle réglementation', 'Tous les usages', 'Tableau de bord', 'Agent IA',
    'Impact', 'Objectif atteignable'],

  // carte : villes nommées (lon, lat). hq = siège, hero = site héros ; tag = [longueur de tige, décalage x] de leur grande étiquette.
  // Les clés (hq, hero, city3…city9) sont référencées ailleurs : cityTags ci-dessous, sources.<id>.city,
  // et story.js (anneaux hq/hero). Pour ajouter/retirer une ville : changer ici ET dans cityTags.
  // Le nombre total de sites = villes nommées + OTHERS (src/world/country.js).
  cities: {
    hq: { name: HQ_CITY, role: `Siège ${CLIENT}`, ll: [5.72, 45.19], hq: true, tag: [3.4, 8] },
    hero: { name: HERO_CITY, role: HERO, ll: [5.05, 45.04], hero: true, tag: [2.2, -4.6] },
    city3: { name: 'Brévannes', ll: [4.89, 44.93] },
    city4: { name: 'Saint-Ours', ll: [4.84, 45.76] },
    city5: { name: 'Les Aulnes', ll: [5.92, 45.57] },
    city6: { name: 'Bellefont', ll: [6.13, 45.9] },
    city7: { name: 'Roche-Blanche', ll: [3.09, 45.78] },
    city8: { name: 'Val-Doré', ll: [4.39, 45.43] },
    city9: { name: 'Paris', ll: [2.35, 48.86] },
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
    srcA: { city: 'city9', name: A, cap: 'ventes · paniers · fidélité', capOffice: 'ventes · fidélité', alt: 'promotions lancées ✓', screen: `${A} · Ventes du jour`, screenApp: `${A} · Tickets` },
    srcB: { city: 'city4', name: B, cap: 'stocks · commandes fournisseurs', capOffice: 'stocks', alt: 'réassorts commandés ✓', screen: `${B} · Réassort` },
    srcC: { city: 'city7', name: Cc, cap: 'RH · plannings', capOffice: 'RH · plannings', screen: `${Cc} · Plannings de mai` },
    excel: { city: 'city3', name: 'Excel', plate: 'Exports Excel', cap: 'consolidation manuelle', capOffice: 'tableaux de suivi', screen: 'Export_ventes_mai.xlsx', sheet: 'Suivi_ruptures.xlsx' },
  },
  connected: 'connecté',

  // la fiche unique : un même client final écrit de trois façons
  record: {
    client: 'Rosier Pierre de Ronsard', clientFull: 'Rosier « Pierre de Ronsard » 5 L', clientCode: 'ART_448120', clientExcel: 'ROSIER PDR 5L',
    mission: 'Fournisseur Pépinières du Lac', missionFull: 'Pépinières du Lac', missionCode: 'FRN-0912', missionExcel: 'PEPIN. LAC',
    how: '3 écritures → 1', quality: 'Articles rapprochés', qualityValue: '99,4 %',
    labelClient: 'Article', labelMission: 'Fournisseur',
  },

  // chaîne métier du site héros (chapitre « Comprendre ») : [clé, libellé, valeur]
  chain: [['client', 'Client', 'Carte fidélité · 2 140 achats'], ['mission', 'Article', 'Rosier 5 L'], ['collab', 'Vendeur', 'Léo Garnier'],
    ['temps', 'Stock', '4 en rayon · 18 en entrepôt'], ['factu', 'Vente', '29,90 €'], ['recouv', 'Marge', '41 %'], ['echeance', 'Saison', 'Pic · fin mai']],
  // ce que l'agent trouve (rouge) puis propose (vert), posé sur la chaîne ; les montants = leviers L1, L2, L3
  risks: [['temps', '94 articles', 'en rupture le week-end'], ['factu', '1 200 clients', 'sans relance de saison'], ['echeance', '3 rayons', 'mal implantés pour le pic']],
  options: [['temps', 'Réassorts anticipés', `+${L1}`], ['factu', 'Relances fidélité', `+${L2}`], ['echeance', 'Implantation de saison', `+${L3}`]],
  regTag: ['Nouvelle réglementation', '320 références à remplacer'],

  // titres du film (html) — un par moment ; eyebrow = petite ligne au-dessus
  director: `${HERO}<i>·</i>${ROLE_DIRECTOR} ${DIRECTOR}`,
  steps: ['Connecter', 'Sécuriser', 'Comprendre', 'Agir'],
  stepDash: 'Tableau de bord', stepAgent: 'Agent IA',
  headlines: {
    o1: { h: `Objectif de chiffre d’affaires : ${OBJ_NBSP}.<br>Échéance : ${DEADLINE}.` },
    o2: { h: 'Peut-on tenir<br>l’<em>objectif</em>&nbsp;?', sub: 'Pour répondre, il faut relier chaque étape :<br>du fournisseur jusqu’au ticket de caisse.' },
    p1: { h: 'Un réseau.<br><em>Des données éclatées.</em>', sub: `${SITES} ${SITES_W}. ${A}, ${B} et ${Cc} voient chacun une partie de l’histoire.` },
    c0: { h: '<em>Connecter</em> toutes vos données.', sub: `Tous les ${SITES_W}. Tous les logiciels.` },
    c1: { h: 'Connecter toutes vos données.', sub: 'Ventes. Stocks. Plannings. Exports Excel.' },
    f1: { h: 'Une fiche article<br><em>unique</em>.', sub: 'Trois logiciels, trois écritures. Une seule vérité.' },
    n1: { h: `<span>${SITES} ${SITES_W}.</span><span><em>Un seul modèle de pilotage.</em></span>` },
    g1: { h: 'Chacun voit ce qu’il<br>a le <em>droit</em> de voir.', sub: 'Les salaires restent confidentiels.' },
    x1: { h: 'Relier les données.<br><em>Comprendre le métier.</em>', sub: 'Client, article, vendeur, stock, vente, marge, saison : un seul modèle.' },
    mt: { h: `Piloter le métier,<br><em>${SITE.toLowerCase()} par ${SITE.toLowerCase()}.</em>` },
    ei: { h: 'Nouvelle réglementation :<br><em>une opportunité.</em>', sub: 'Repérée dans le catalogue et les ventes, pas dans un tableur.' },
    v1: { h: 'Un seul contexte. <em>Tous les usages.</em>', sub: 'Tableaux de bord, applications et IA partagent la même réalité.' },
    b1: { h: 'BI :<br><em>où en<br>est-on&nbsp;?</em>' },
    ag1: { h: '<span>L’IA analyse.</span> <span>La directrice décide.</span><br><span>Les logiciels exécutent.</span>', sub: `Les actions approuvées repartent dans ${A} et ${B}.` },
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
    domains: ['Ventes · clients', 'Stocks', 'Chiffre d’affaires', 'Salaires'],
    roles: [
      { tag: 'DG', who: 'DG Groupe', scope: `Les ${SITES} ${SITES_W}`, sees: ['srcA', 'srcB', 'excel'], cells: ['all', 'all', 'all', 'agg'] },
      { tag: 'DM', who: `${ROLE_DIRECTOR} de ${SITE.toLowerCase()}`, scope: `Son ${SITE.toLowerCase()}`, sees: ['srcA', 'srcB', 'excel'], cells: ['own', 'own', 'own', 'agg'] },
      { tag: 'VE', who: 'Vendeur', scope: 'Son rayon et ses ventes', sees: ['srcB'], cells: ['mine', 'mine', null, null] },
      { tag: null, who: 'Agent IA', scope: 'Jamais plus que la personne qui demande', sees: ['srcA', 'srcB', 'excel'], inherit: true },
    ],
    cellLabels: { all: 'Réseau', own: SITE, mine: 'Les siens', agg: 'Agrégés' },
    inherit: 'Mêmes droits que la personne qui pose la question',
    noAccess: 'Aucun accès', legend: 'Salaires : montants individuels visibles du seul service paie',
  },

  // bandeau « un seul réseau »
  share: [NETWORK, `${SITES} ${SITES_W}`, '~410 000 clients fidélité', '~1 900 collaborateurs'],

  // fenêtre Snowflake « fiche client unique »
  trust: { section: 'Données', tabs: ['Sources', 'Fiche article unique'], live: 'En direct', account: 'Compte', accountName: ACCOUNT,
    inTools: 'Dans vos logiciels', sources: 'Sources connectées', sourcesLive: '4 en direct', out: 'Fiche article unique' },

  // villes mises en avant pendant chacune des trois cartes du chapitre « Le métier » (hq / hero / city…)
  beatCities: [['hero'], ['city6', 'city8', 'hero'], ['city3', 'city5']],
  // chapitre « Le métier » : trois cartes [sur-titre, titre, barres [libellé, %, texte, style], note html]
  beats: [
    ['Plannings · week-end de l’Ascension', 'Avant le pic', [['Caisses', 92, '128 %', 'hot'], ['Pépinière', 82, '114 %', 'hot'], ['Animalerie', 70, '97 %'], ['Décoration', 54, '76 %'], ['Outillage', 44, '61 %']], 'Renforcer <b>3 équipes</b> avant samedi.'],
    [`Benchmark inter-${SITES_W}`, KPI, [['Bellefont · meilleur', 84, '84 %', 'best'], ['Médiane réseau', 76, '76 %'], [HERO_CITY, 68, '68 %', 'hot'], ['Val-Doré · plus bas', 63, '63 %', 'hot']], 'Écart entre le meilleur et le moins bon : <b>21 points</b>.'],
    ['Inventaires tournants · échéance du 31 mai', 'Inventaires', [['Déposées', 97, `58 / ${SITES}`, 'best'], ['En cours · Brévannes', 30, 'J-2'], ['En cours · Les Aulnes', 30, 'J-2']], `<b>2 ${SITES_W}</b> relancés automatiquement.`],
  ],

  // chapitre « levier sectoriel / réglementaire »
  reg: { head: 'Analyse du catalogue', n1: ['320', 'références à remplacer'], n2: ['450 K€', 'de ventes de produits alternatifs'],
    cal: [['Étape 1', 'Retrait des produits concernés'], ['Étape 2', 'Interdiction totale à la vente']] },

  // « même question, partout »
  question: QUESTION, sameQuestion: 'Même question, partout', oneContext: '<b>Snowflake</b> · un seul contexte métier, partagé',

  // impact : [titre, valeur html, hypothèse]
  impact: [
    [KPI, '+1 pt ≈ +2 M€ <small>de CA / an</small>', `Hypothèse : ~400 M€ de ventes par an sur les ${SITES} ${SITES_W}, ventes perdues ≈ ruptures.`],
    ['Consolidation mensuelle', '5 jours → <small>quelques minutes</small>', `Hypothèse : ${SITES} exports Excel rapprochés à la main chaque mois par le contrôle de gestion.`],
    ['Nouvelle réglementation', '450 K€ <small>de ventes</small>', 'Hypothèse : 320 références remplacées × ~1 400 € de ventes par an.'],
  ],
  impactNote: 'Ordres de grandeur illustratifs, non garantis.',

  // textes peints dans l'open space : mur d'accueil (logo texte + sous-titre), titre de l'écran principal
  office: { wall: ACCOUNT, wallSub: `${SITE} de ${HERO_CITY}`, screenTitle: `${HERO} · Tableau de bord` },

  // ── écrans des appareils ──
  // moniteur d'ouverture (application de la source A)
  monitor: {
    app: SITE, search: 'Rechercher un article, un client…',
    tabsBefore: ['Accueil', 'Ventes', 'Articles'], tabOn: SITE, tabsAfter: ['Équipe', 'Stocks', 'Rapports'],
    icon: 'V', kicker: SITE, title: `${HERO_CITY} · ${DIRECTOR}`,
    fields: [['Équipe', '31 collaborateurs'], ['Clients fidélité', '8 420'], ['Ouvert depuis', 'mars 2012']],
    badge: ['Objectif de chiffre d’affaires', `Atteignable · ${DEADLINE}`],
    commitTitle: 'Objectif de l’exercice', objLabel: 'Objectif', objValue: OBJ, objUnit: 'de chiffre d’affaires annuel',
    dueLabel: 'Échéance', dueValue: DEADLINE_CAP, dueUnit: 'fin de saison',
    rows: [['Vendu à fin avril', '2,61 M€'], [KPI, `${KPI_VALUE}${KPI_UNIT}`]], status: ['Statut', 'À risque', 'Atteignable ✓'],
    activityTitle: 'Activité récente',
    activity: [['Revue réseau', `« ${HERO_CITY} doit sécuriser ${GAP} d’ici la fin de la saison. »`, true], ['Équipe', '6 saisonniers en avril'], ['Rayons', '94 articles en rupture ce week-end']],
  },
  // rapport BI
  bi: {
    name: 'BI', crumb: `Réseau  ›  Pilotage des ${SITES_W}`, live: 'En direct · données Snowflake',
    menu: ['Fichier', 'Exporter', 'Partager', 'S’abonner', 'Explorer'], title: 'Pilotage du réseau', period: `avril · tous les ${SITES_W}`,
    kpis: [[KPI, KPI_VALUE, KPI_UNIT, '▼ 2,4 pts sur un mois'], ['CA projeté', '388', ' M€', `objectif 402 M€ · ${SITES} ${SITES_W}`], ['Panier moyen', '38', ' €', '▲ 1,20 € sur un an'], [`${SITE}s sous l’objectif`, '8', '', `sur ${SITES} ${SITES_W}`, 'warn']],
    tableTitle: `${SITE}s sous l’objectif`, head: [SITE, ROLE_DIRECTOR, 'Objectif', 'Projeté', 'Écart'],
    rows: [[HERO_CITY, DIRECTOR_SHORT, OBJ, PROJ, `−${GAP}`], ['Brévannes', 'N. Petit', '5,10 M€', '4,96 M€', '−140 K€'], ['Saint-Ours', 'H. Blanc', '7,30 M€', '7,22 M€', '−80 K€']],
    monthsTitle: `${KPI} par mois`, months: ['sept.', 'oct.', 'nov.', 'déc.', 'janv.', 'févr.', 'mars', 'avr.'], bars: [72, 74, 70, 68, 66, 71, 69, 62],
    capTitle: `Ruptures du week-end par ${SITE.toLowerCase()}`, cap: [[HERO_CITY, 72, '94 art.', true], ['Brévannes', 40, '51 art.'], ['Saint-Ours', 30, '38 art.'], [HQ_CITY, 60, '77 art.', true]],
    polesTitle: 'Ventes perdues par rayon', poles: [['Pépinière', 42, '42 %', true], ['Terreaux', 31, '31 %', true], ['Animalerie', 18, '18 %'], ['Déco', 12, '12 %']],
    selTitle: `${SITE} sélectionné`, selName: HERO, selInfo: `Dir. ${DIRECTOR_SHORT} · 31 collaborateurs · 8 420 clients fidélité`,
    objLabel: 'Objectif', projLabel: 'Projeté', gapLabel: 'd’écart', obj: OBJ, proj: PROJ, gap: `−${GAP}`,
    filters: 'Filtres', tabOn: 'Synthèse', tabs: [`${SITE}s`, 'Ventes', 'Stocks', 'Clients'],
  },
  // Snowflake Intelligence sur l'ordinateur portable
  snowUI: { side: ['Accueil', 'Projets', 'Données', 'IA', 'Supervision', 'Accès'], title: 'Snowflake Intelligence', ctx: `${NETWORK} · contexte métier`,
    asker: 'DG', answerLabel: `${KPI} · avril · ${SITES} ${SITES_W}`, answer: `${KPI_VALUE}<u>${KPI_UNIT}</u>`, note: 'Une seule définition, partout' },
  // application de la source A sur la tablette : [libellé, valeur, unité, note, style]
  ops: { head: 'Mon tableau de bord', tiles: [[KPI, KPI_VALUE, KPI_UNIT, `avril · ${SITES} ${SITES_W}`], ['Articles en rupture', '94', '', 'ce week-end', 'warn'], ['Panier moyen', '38', ' €', 'avril', 'warn'], ['Commandes fournisseurs', '284', '', 'en cours'], ['Pic de saison', '3', '', 'semaines'], ['Équipe', '31', '', 'collaborateurs']] },
  // assistants sur les téléphones
  assistant: { a1: 'Assistant IA', a2: `${CLIENT} Mobile`, pre: `Le ${KPI.toLowerCase()} du réseau est de`, value: `${KPI_VALUE}<u>${KPI_UNIT}</u>`, post: `en avril, sur les ${SITES} ${SITES_W}.`, src: 'Snowflake · contexte métier partagé', write: 'Écrire à' },
  // l'agent : pourquoi → que faire → exécuté dans les logiciels
  agent: {
    title: 'Agent IA', ctx: `${NETWORK} · ${HERO}`, data: 'Données Snowflake', why: 'Pourquoi ?', what: 'Que faire ?',
    answer: `${HERO} : ${PROJ} projetés, ${GAP} d’écart.`,
    causes: [['94 articles : ruptures le week-end', L1, `${A} × ${B} · ventes perdues estimées`], ['1 200 clients : pas de relance de saison', L2, `${A} · fidélité · achats de l’an dernier`], ['3 rayons : implantation hors saison', L3, 'Planogramme · pic de fin mai']],
    planTitle: `+${GAP} · retour à ${OBJ}`,
    options: [['Commander le réassort de 94 articles', `${B} · +${L1}`], ['Relancer 1 200 clients fidélité', `${A} · +${L2}`], ['Réimplanter 3 rayons avant le pic', `${B} · +${L3}`]],
    approver: DIRECTOR_SHORT, approverInitials: DIRECTOR_INITIALS, approve: 'Approuver', approved: 'Approuvé ✓',
    execTitle: 'Écrit dans vos logiciels', exec: [['srcB', B, '94 réassorts commandés · 3 implantations planifiées'], ['srcA', A, '1 200 relances fidélité programmées']],
  },
};
