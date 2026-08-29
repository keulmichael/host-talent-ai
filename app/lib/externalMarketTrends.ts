export type ExternalTrend={
  id:string;title:string;value:string;direction:"up"|"down"|"stable"|"alert";context:string;implication:string;sourceLine:string;
};
export type MarketOpportunity={
  id:string;market:string;signal:string;why:string;play:string;strength:"fort"|"moyen"|"exploratoire";
};
export type MarketSource={id:string;title:string;publishedAt:string;url:string;scope:string;kind:string};
export type SectorSignal={id:string;label:string;value:number;meta:string};

export const MARKET_SOURCES:MarketSource[]=[
  {id:"bmo2026",title:"France Travail — Besoins en main-d'œuvre 2026",publishedAt:"2026",url:"https://statistiques.francetravail.org/bmo",scope:"France · projets de recrutement, difficultés, saisonnalité, métiers, régions",kind:"Intentions d'embauche"},
  {id:"offers2026",title:"France Travail — Offres d'emploi diffusées au 1er trimestre 2026",publishedAt:"juillet 2026",url:"https://statistiques.francetravail.org/offres/publication",scope:"France · 2,4 M d'offres · contrats, secteurs et départements",kind:"Marché observé"},
  {id:"ftstats",title:"France Travail — Statistiques, analyses et prospective",publishedAt:"mise à jour continue",url:"https://www.francetravail.org/statistiques-analyses/",scope:"Publications et analyses du marché du travail",kind:"Veille"},
  {id:"indeed2026",title:"Indeed Hiring Lab France — Le marché de l’emploi en 2026",publishedAt:"10 décembre 2025",url:"https://hiringlab.indeed.com/fr/blog/2025/12/10/le-marche-de-lemploi-en-2026-en-pleine-mutation-face-aux-nouveaux-equilibres-economiques/",scope:"France · tendances publiées fin 2025 pour 2026",kind:"Lecture complémentaire"}
];

export const INDEED_2026_SOURCE=MARKET_SOURCES.find(x=>x.id==="indeed2026")!;

export const BMO_HEADLINES:ExternalTrend[]=[
  {id:"bmo-projects",title:"Projets de recrutement 2026",value:"2,27 M",direction:"down",context:"2 274 951 projets annoncés, soit -6,5 % sur un an.",implication:"Le volume baisse : les cabinets doivent privilégier les segments où la tension et la valeur de conseil restent fortes.",sourceLine:"France Travail, BMO 2026."},
  {id:"bmo-recruiters",title:"Établissements recruteurs",value:"23,3 %",direction:"down",context:"Part des établissements envisageant de recruter, -0,8 point sur un an.",implication:"Prospection plus sélective : mieux cibler les entreprises ayant un besoin réel ou récurrent.",sourceLine:"France Travail, BMO 2026."},
  {id:"bmo-difficult",title:"Recrutements jugés difficiles",value:"43,8 %",direction:"alert",context:"Part des projets anticipés comme difficiles, en baisse de 6,3 points.",implication:"La tension reste élevée sur certains métiers : la spécialisation et le vivier restent différenciants.",sourceLine:"France Travail, BMO 2026."},
  {id:"bmo-seasonal",title:"Projets saisonniers",value:"32,2 %",direction:"up",context:"Part des projets saisonniers, +1,2 point.",implication:"Les cabinets peuvent construire des viviers réactivables et des campagnes saisonnières récurrentes.",sourceLine:"France Travail, BMO 2026."}
];

export const OFFER_HEADLINES:ExternalTrend[]=[
  {id:"ft-offers",title:"Offres diffusées au T1 2026",value:"2,4 M",direction:"down",context:"-5,4 % sur un an, soit environ 139 000 offres de moins.",implication:"Le marché se contracte : la qualification, la réactivité et la différenciation deviennent plus importantes que le volume.",sourceLine:"France Travail, Statistiques et indicateurs #26.009, juillet 2026."},
  {id:"durable",title:"Offres en contrats durables",value:"63,0 %",direction:"down",context:"CDI + CDD de plus de 6 mois ; part en baisse de 6,6 points sur un an.",implication:"Une part croissante du marché bascule vers des formes plus flexibles : opportunité pour les cabinets couvrant CDI, CDD et freelance.",sourceLine:"France Travail, offres diffusées, T1 2026."},
  {id:"departments",title:"Départements en baisse",value:"60 / 100",direction:"alert",context:"60 départements enregistrent une baisse annuelle des offres diffusées ; Paris recule de 7,0 %.",implication:"La dynamique devient très territoriale : le ciblage commercial doit intégrer la géographie et pas seulement le métier.",sourceLine:"France Travail, offres diffusées, T1 2026."}
];

export const EXTERNAL_TRENDS:ExternalTrend[]=[
  ...BMO_HEADLINES,
  ...OFFER_HEADLINES,
  {id:"health-home",title:"Soins à domicile — signal Indeed",value:"+44,5 %",direction:"up",context:"Catégorie affichant la plus forte croissance citée par l’étude Indeed.",implication:"À croiser avec BMO : aides à domicile et auxiliaires de vie concentrent aussi de fortes difficultés de recrutement.",sourceLine:"Indeed Hiring Lab, France, 2025/2026."},
  {id:"it-support",title:"Support informatique — pression candidats",value:"+71 %",direction:"alert",context:"Hausse moyenne des candidatures par offre entre 2023 et 2025.",implication:"Marché de volume candidat : opportunité d’automatiser tri, préqualification et expérience candidat.",sourceLine:"Indeed Hiring Lab."},
  {id:"hospitality",title:"Hôtellerie & tourisme — pression candidats",value:"+73 %",direction:"alert",context:"Hausse moyenne des candidatures par offre entre 2023 et 2025.",implication:"À croiser avec BMO : le secteur conserve de forts volumes et une saisonnalité élevée.",sourceLine:"Indeed Hiring Lab."},
  {id:"ai-fr",title:"Offres mentionnant l’IA",value:"3,1 %",direction:"up",context:"Part des offres françaises contenant des termes liés à l’IA en octobre 2025.",implication:"Les cabinets peuvent développer une expertise d’évaluation des compétences IA dans les métiers tertiaires.",sourceLine:"Indeed Hiring Lab, octobre 2025."}
];

export const BMO_TENSION_METIERS:SectorSignal[]=[
  {id:"homecare",label:"Aides à domicile / auxiliaires de vie",value:62.3,meta:"69 485 projets · 62,3 % jugés difficiles"},
  {id:"nurses",label:"Infirmiers / sages-femmes",value:60.2,meta:"36 688 projets · 60,2 % difficiles"},
  {id:"cooks",label:"Cuisiniers",value:57.6,meta:"51 612 projets · 57,6 % difficiles"},
  {id:"care",label:"Aides-soignants",value:56.6,meta:"62 075 projets · 56,6 % difficiles"},
  {id:"household",label:"Ménage chez des particuliers",value:52.2,meta:"38 942 projets · 52,2 % difficiles"}
];

export const OFFER_SECTOR_EVOLUTION:SectorSignal[]=[
  {id:"construction",label:"Construction / BTP",value:10.4,meta:"277 050 offres · +10,4 % sur un an"},
  {id:"transport",label:"Transport & logistique",value:5.3,meta:"182 980 offres · +5,3 %"},
  {id:"industry",label:"Industrie",value:3.6,meta:"342 280 offres · +3,6 %"},
  {id:"it",label:"Systèmes d'information & télécom",value:-4.6,meta:"101 110 offres · -4,6 %"},
  {id:"hr",label:"Ressources humaines",value:-6.4,meta:"46 240 offres · -6,4 %"},
  {id:"hospitality-ft",label:"Hôtellerie / restauration / tourisme",value:-7.0,meta:"186 740 offres · -7,0 %"},
  {id:"health",label:"Santé",value:-16.2,meta:"172 910 offres · -16,2 %"},
  {id:"support",label:"Support à l'entreprise",value:-15.5,meta:"385 850 offres · -15,5 %"}
];

export const MARKET_OPPORTUNITIES:MarketOpportunity[]=[
  {id:"health",market:"Santé, soin & aide à domicile",signal:"BMO : 62,3 % des projets d’aides à domicile sont jugés difficiles ; aides-soignants 56,6 % et infirmiers/sages-femmes 60,2 %.",why:"Même avec un recul des offres publiées en santé, la difficulté structurelle de recrutement demeure forte sur les métiers de soin et d’accompagnement.",play:"Construire une verticale santé : vivier permanent, sourcing local, réactivation, préqualification et suivi des délais.",strength:"fort"},
  {id:"construction",market:"Construction & métiers techniques",signal:"Les offres BTP progressent de 10,4 % au T1 2026 ; conduite de chantier +11,5 % et second œuvre +13,8 %.",why:"C’est l’un des rares grands domaines en croissance dans les offres France Travail malgré la contraction générale.",play:"Tester une spécialisation métiers techniques/BTP avec cartographie géographique et vivier de compétences transférables.",strength:"fort"},
  {id:"industry-logistics",market:"Industrie, maintenance & logistique",signal:"Industrie +3,6 %, transport-logistique +5,3 % ; plusieurs sous-domaines industriels progressent à deux chiffres.",why:"Les volumes restent élevés et les besoins sont souvent spécifiques, locaux et difficiles à couvrir par du sourcing généraliste.",play:"Créer des viviers par bassin d’emploi et compétences techniques, avec matching mission × expérience.",strength:"fort"},
  {id:"high-volume",market:"Hôtellerie, restauration & saisonnier",signal:"BMO : 97 135 projets en aides de cuisine, 93 843 serveurs et 49 378 employés d’hôtellerie ; forte saisonnalité.",why:"Le flux reste massif malgré une baisse récente des offres publiées ; le besoin porte sur rapidité, disponibilité et réactivation saisonnière.",play:"Proposer recrutement volumique, viviers saisonniers et préqualification disponibilité/rémunération.",strength:"fort"},
  {id:"different-profiles",market:"Requalification de viviers existants",signal:"43,3 % des établissements ayant recruté en 2025 ont élargi leur recherche à des profils différents de ceux visés au départ.",why:"Le marché pousse les employeurs à accepter des compétences transférables et des parcours moins linéaires.",play:"Vendre une prestation de relecture intelligente du vivier : compétences adjacentes, potentiel transférable et profils sous-exploités.",strength:"fort"},
  {id:"ai-white-collar",market:"IA appliquée aux métiers tertiaires",signal:"Les mentions IA progressent alors que plusieurs fonctions tertiaires ralentissent.",why:"Dans un marché plus sélectif, les compétences hybrides métier + IA peuvent devenir un facteur de différenciation candidat.",play:"Créer une offre de recrutement et d’évaluation « métier + IA » plutôt qu’une verticale purement tech.",strength:"moyen"}
];
