import {detectSkills} from "./extract";

type TalentJob={id:string;title:string;mustHave:string;shouldHave:string;optional?:string;createdAt:Date};
type TalentCandidate={id:string;skills:string;rawText?:string;experienceYears:number|null;location:string|null;createdAt:Date;matches:{score:number;job:{id:string;title:string;mustHave:string;shouldHave:string}}[]};

const STOP=new Set(["ans","annees","experience","minimum","requis","souhaite","souhaitable","maitrise","bonne","connaissance","professionnel","niveau","expertise","profil","poste","mission","avec","pour","dans","des","les","une","sur","and","the"]);
function norm(s:string){return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9+#.\-/ ]/g," ").replace(/\s+/g," ").trim()}

// Normalisation légère : elle rapproche les variantes évidentes sans enfermer
// l'Observatoire Talent dans une liste de secteurs. Les compétences détaillées
// reconnues par extract.ts restent visibles telles quelles.
const CANONICAL:[string,string[]][]=[
 ["CRM",["crm","customer relationship management"]],
 ["Marketing Automation",["marketing automation","automation marketing","automatisation marketing","marketing automatise"]],
 ["IA générative / LLM",["ia generative","intelligence artificielle generative","genai","llm","openai","gpt"]],
 ["Automatisation",["automatisation","automation","workflow automatise","n8n","make"]],
 ["Data / BI",["business intelligence","power bi","powerbi","tableau","data analysis","analyse de donnees"]],
 ["SEO / GEO",["seo","referencement naturel","geo","generative engine optimization"]],
 ["Cloud / DevOps",["devops","architecture cloud","cloud computing","aws","azure","docker","kubernetes"]],
 ["Développement web",["javascript","typescript","react","next.js","nextjs","node.js","nodejs","php"]],
 ["Recrutement",["recrutement","recruitment","talent acquisition"]],
 ["Développement commercial",["business development","business developer","developpement commercial"]],
 ["Comptabilité",["comptabilite generale","comptabilite fournisseurs","comptabilite clients","general ledger","accounts payable","accounts receivable"]],
 ["Contrôle de gestion / FP&A",["controle de gestion","controleur de gestion","fp&a","financial planning and analysis"]],
 ["Audit",["audit financier","auditeur financier","auditrice financiere"]],
 ["Juridique",["droit des affaires","droit des contrats","droit des societes","juriste affaires","juriste contrats","juriste corporate"]],
 ["Achats / Procurement",["achats directs","achats indirects","procurement","purchasing"]],
 ["Supply Chain",["supply chain","chaine logistique","supply planning"]],
 ["Logistique",["logistique","responsable logistique","gestion des stocks","inventory management"]],
 ["Production / Maintenance",["production industrielle","maintenance industrielle","technicien de maintenance","responsable maintenance"]],
 ["Qualité / QHSE",["assurance qualite","controle qualite","management de la qualite","qhse","hse"]],
 ["BTP / Travaux",["conduite de travaux","conducteur de travaux","chef de chantier","gestion de chantier"]],
 ["Santé / Soins",["soins infirmiers","aide-soignant","aide soignant","auxiliaire de vie","coordination des soins"]],
 ["Hôtellerie / Restauration",["hotellerie","restauration","chef de rang","receptionniste hotel","chef de cuisine"]],
 ["Retail",["retail","commerce de detail","responsable de magasin","directeur de magasin"]],
 ["Gestion de projet",["gestion de projet","project management","pilotage de projet"]],
 ["Management",["management d equipe","encadrement d equipe","pilotage d equipe"]],
 ["Salesforce",["salesforce"]],
 ["SAP",["sap"]],
 ["Python",["python"]]
];
function canonicalize(value:string){const n=norm(value);for(const [label,aliases] of CANONICAL)if(aliases.some(a=>n===norm(a)||n.includes(norm(a))))return label;return value.trim();}
export function terms(text:string){const detected=detectSkills(text).map(canonicalize);const fallback=norm(text).split(/[\n,;|•]+/).flatMap(x=>x.trim().split(/\s{2,}/)).map(canonicalize).filter(x=>x.length>=2&&x.length<=38&&!STOP.has(norm(x)));return Array.from(new Set([...detected,...fallback]));}
function top(map:Map<string,number>,limit=12){return [...map.entries()].sort((a,b)=>b[1]-a[1]).slice(0,limit).map(([name,count])=>({name,count}));}
function tensionLabel(ratio:number){if(ratio<1)return"Forte";if(ratio<2)return"Modérée";if(ratio<=4)return"Équilibrée";return"Abondance"}
function daysBetween(a:Date,b:Date){return Math.abs(a.getTime()-b.getTime())/86400000}

export function buildTalentObservatory(candidates:TalentCandidate[],jobs:TalentJob[]){
 const skillCounts=new Map<string,number>(),demandCounts=new Map<string,number>(),locationCounts=new Map<string,number>();
 const candidateSkills=new Map<string,Set<string>>(),jobSkills=new Map<string,Set<string>>();
 const exp=candidates.map(c=>c.experienceYears).filter((x):x is number=>typeof x==="number");
 // Toujours relire le CV brut en plus des compétences déjà structurées : les anciens
 // imports bénéficient ainsi du référentiel généraliste sans réimport ni migration.
 for(const c of candidates){const skills=new Set(terms(`${c.skills||""}\n${c.rawText||""}`));candidateSkills.set(c.id,skills);for(const s of skills)skillCounts.set(s,(skillCounts.get(s)||0)+1);if(c.location)locationCounts.set(c.location,(locationCounts.get(c.location)||0)+1)}
 for(const j of jobs){const skills=new Set(terms(`${j.title}\n${j.mustHave}\n${j.shouldHave}\n${j.optional||""}`));jobSkills.set(j.id,skills);for(const s of skills)demandCounts.set(s,(demandCounts.get(s)||0)+1)}
 const allSkills=Array.from(new Set([...skillCounts.keys(),...demandCounts.keys()]));
 const market=allSkills.map(name=>{
  const demand=demandCounts.get(name)||0, supply=skillCounts.get(name)||0;
  const relevantJobs=new Set(jobs.filter(j=>jobSkills.get(j.id)?.has(name)).map(j=>j.id));
  const qualified=candidates.filter(c=>candidateSkills.get(c.id)?.has(name)&&c.matches.some(m=>m.score>=70&&relevantJobs.has(m.job.id))).length;
  const ratio=demand?Math.round((qualified/demand)*10)/10:0;
  return{name,demand,supply,qualified,ratio,tension:demand?tensionLabel(ratio):"Non demandé"};
 }).filter(x=>x.demand>0||x.supply>=2).sort((a,b)=>b.demand-a.demand||a.ratio-b.ratio);
 const tensions=market.filter(x=>x.demand>0&&(x.tension==="Forte"||x.tension==="Modérée"));
 const gaps=market.filter(x=>x.demand>0).sort((a,b)=>(b.demand-b.qualified)-(a.demand-a.qualified)).slice(0,12);
 const underused=market.filter(x=>x.supply>=2&&x.demand===0).sort((a,b)=>b.supply-a.supply).slice(0,10);
 const expected=candidates.length*jobs.length;const actual=candidates.reduce((s,c)=>s+c.matches.length,0);const coverage=expected?Math.min(100,Math.round(actual/expected*100)):100;
 const dates=[...candidates.map(c=>c.createdAt),...jobs.map(j=>j.createdAt)].sort((a,b)=>a.getTime()-b.getTime());
 const historyDays=dates.length>1?Math.floor(daysBetween(dates[0],dates[dates.length-1])):0;const historySufficient=historyDays>=30;
 const signals:{level:"high"|"medium"|"info";title:string;detail:string;action:string}[]=[];
 for(const x of tensions.slice(0,4))signals.push({level:x.tension==="Forte"?"high":"medium",title:`${x.name} · tension ${x.tension.toLowerCase()}`,detail:`${x.demand} mission(s), ${x.supply} profil(s) porteurs de la compétence, dont ${x.qualified} avec une adéquation ≥ 70 sur une mission concernée.`,action:x.tension==="Forte"?"Prioriser le sourcing et requalifier les profils proches.":"Surveiller la couverture et développer le vivier qualifié."});
 for(const x of underused.slice(0,2))signals.push({level:"info",title:`${x.name} · potentiel sous-exploité`,detail:`${x.supply} profil(s) dans le vivier, sans demande structurée dans les missions actuelles.`,action:"Identifier des opportunités commerciales ou requalifier ce segment du vivier."});
 if(coverage<90)signals.unshift({level:"medium",title:"Matching incomplet",detail:`${coverage}% des couples candidat × mission disposent actuellement d'un matching.`,action:"Terminer le recalcul massif avant d'interpréter les tensions comme exhaustives."});
 const strong=candidates.filter(c=>c.matches.some(m=>m.score>=70)).length;
 return {candidateCount:candidates.length,jobCount:jobs.length,skillCount:allSkills.length,averageExperience:exp.length?Math.round(exp.reduce((a,b)=>a+b,0)/exp.length*10)/10:null,seniority:{junior:exp.filter(x=>x<3).length,confirmed:exp.filter(x=>x>=3&&x<7).length,senior:exp.filter(x=>x>=7).length,unknown:candidates.length-exp.length},topSkills:top(skillCounts),topLocations:top(locationCounts,8),market,tensions,gaps,underused,strongCandidates:strong,strongRate:candidates.length?Math.round(strong/candidates.length*100):0,matchCoverage:coverage,historyDays,historySufficient,signals:signals.slice(0,6)};
}

export function buildTalentTrends(candidates:TalentCandidate[],jobTexts:string[]){const jobs:TalentJob[]=jobTexts.map((text,i)=>({id:`legacy-${i}`,title:`Mission ${i+1}`,mustHave:text,shouldHave:"",createdAt:new Date()}));return buildTalentObservatory(candidates,jobs)}