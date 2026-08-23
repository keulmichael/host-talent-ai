export type ExternalTrend={
  id:string;title:string;value:string;direction:"up"|"down"|"stable"|"alert";context:string;implication:string;sourceLine:string;
};
export type MarketOpportunity={
  id:string;market:string;signal:string;why:string;play:string;strength:"fort"|"moyen"|"exploratoire";
};

export const INDEED_2026_SOURCE={
  title:"Indeed Hiring Lab France — Le marché de l’emploi en 2026",
  publishedAt:"10 décembre 2025",
  url:"https://hiringlab.indeed.com/fr/blog/2025/12/10/le-marche-de-lemploi-en-2026-en-pleine-mutation-face-aux-nouveaux-equilibres-economiques/",
  scope:"France · tendances publiées fin 2025 pour 2026"
};

export const EXTERNAL_TRENDS:ExternalTrend[]=[
  {id:"offers-fr",title:"Offres d’emploi en France",value:"-15,1 %",direction:"down",context:"Évolution depuis fin novembre 2024.",implication:"Marché plus sélectif : la valeur se déplace vers la qualification et le ciblage plutôt que le volume.",sourceLine:"Indeed Hiring Lab, données Indeed France, novembre 2025."},
  {id:"health-home",title:"Soins à domicile",value:"+44,5 %",direction:"up",context:"Catégorie affichant la plus forte croissance citée par l’étude.",implication:"Pénurie durable et besoin de sourcing spécialisé : piste commerciale prioritaire pour les cabinets capables d’adresser la santé.",sourceLine:"Indeed Hiring Lab, comparaison avec le niveau de demande observé."},
  {id:"tech-dev",title:"Développement informatique",value:"-21,5 %",direction:"down",context:"Baisse du volume d’offres sur douze mois.",implication:"Moins d’ouvertures mais davantage de concurrence entre candidats : potentiel pour des services de sélection fine et de requalification.",sourceLine:"Indeed Hiring Lab, évolution par catégorie de métiers."},
  {id:"it-support",title:"Support informatique",value:"+71 %",direction:"alert",context:"Hausse moyenne des candidatures par offre entre 2023 et 2025.",implication:"Marché de volume candidat : opportunité d’automatiser tri, préqualification et expérience candidat.",sourceLine:"Indeed Hiring Lab, candidatures moyennes par offre."},
  {id:"hospitality",title:"Hôtellerie & tourisme",value:"+73 %",direction:"alert",context:"Hausse moyenne des candidatures par offre entre 2023 et 2025.",implication:"Fort flux de candidatures et rotation élevée : marché adapté aux process de recrutement industrialisés mais personnalisés.",sourceLine:"Indeed Hiring Lab, candidatures moyennes par offre."},
  {id:"ai-fr",title:"Offres mentionnant l’IA",value:"3,1 %",direction:"up",context:"Part des offres françaises contenant des termes liés à l’IA en octobre 2025.",implication:"Le besoin n’est plus réservé à la tech : les cabinets peuvent développer une expertise d’évaluation des compétences IA dans les métiers tertiaires.",sourceLine:"Indeed Hiring Lab, octobre 2025."},
  {id:"salary-transparency",title:"Transparence salariale",value:"45,2 %",direction:"up",context:"Part des offres affichant un salaire en France en octobre 2025.",implication:"La directive européenne de 2026 crée un besoin d’accompagnement sur les annonces, fourchettes et cohérence de rémunération.",sourceLine:"Indeed Hiring Lab, octobre 2025."},
  {id:"apprenticeship",title:"Offres d’apprentissage",value:"-32,3 %",direction:"down",context:"Volume janvier-octobre 2025 comparé à l’ensemble de 2024.",implication:"Accès au premier emploi plus difficile : opportunité pour des offres dédiées jeunes talents, passerelles et qualification de potentiel.",sourceLine:"Indeed Hiring Lab, offres uniques 2025."}
];

export const MARKET_OPPORTUNITIES:MarketOpportunity[]=[
  {id:"health",market:"Santé & soins à domicile",signal:"Demande durablement élevée et soins à domicile en forte croissance.",why:"Les difficultés de recrutement restent structurelles et moins sensibles au ralentissement général.",play:"Créer une verticale santé : sourcing spécialisé, vivier permanent, préqualification et suivi relationnel.",strength:"fort"},
  {id:"high-volume",market:"Hôtellerie, tourisme & services",signal:"+73 % de candidatures moyennes par offre dans l’hôtellerie-tourisme.",why:"Le problème devient moins l’attraction que la capacité à traiter rapidement un grand nombre de candidatures.",play:"Proposer recrutement volumique, qualification automatisée et SLA candidat.",strength:"fort"},
  {id:"ai-white-collar",market:"IA appliquée aux métiers tertiaires",signal:"Forte croissance des mentions IA en marketing, création, médias, juridique et RH.",why:"Les compétences hybrides métier + IA deviennent progressivement distinctives.",play:"Créer une offre de recrutement et d’évaluation « métier + IA » plutôt qu’une verticale purement tech.",strength:"fort"},
  {id:"senior",market:"Talents seniors",signal:"Taux d’emploi des 55–64 ans en France inférieur à la moyenne européenne.",why:"Le marché sous-utilise une population expérimentée alors que certains secteurs restent en tension.",play:"Positionner une offre de requalification, valorisation de l’expérience et matching senior-compétences.",strength:"moyen"},
  {id:"salary",market:"Conseil en transparence salariale",signal:"45,2 % des offres affichaient un salaire en octobre 2025 avant l’échéance réglementaire 2026.",why:"Les employeurs devront mieux structurer l’information salariale et leurs fourchettes.",play:"Ajouter audit d’annonce, benchmark interne et conseil sur la présentation de la rémunération.",strength:"moyen"}
];
