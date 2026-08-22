import {detectSkills} from "./extract";

type TalentJob={id:string;title:string;mustHave:string;shouldHave:string;optional?:string;createdAt:Date};
type TalentCandidate={id:string;skills:string;rawText?:string;experienceYears:number|null;location:string|null;createdAt:Date;matches:{score:number;job:{id:string;title:string;mustHave:string;shouldHave:string}}[]};

const STOP=new Set(["ans","annees","experience","minimum","requis","souhaite","souhaitable","maitrise","bonne","connaissance","professionnel","niveau","expertise","profil","poste","mission","avec","pour","dans","des","les","une","sur","and","the"]);
function norm(s:string){return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9+#.\-/ ]/g," ").replace(/\s+/g," ").trim()}
const CANONICAL:[string,string[]][]=[
 ["CRM",["crm","customer relationship management"]],
 ["Marketing Automation",["marketing automation","automation marketing","automatisation marketing","marketing automatise"]],
 ["IA générative / LLM",["ia generative","intelligence artificielle generative","genai","llm","openai","gpt"]],
 ["Automatisation",["automatisation","automation","workflow automatise","n8n","make"]],
 ["Data / BI",["data","business intelligence","power bi","powerbi","tableau","sql"]],
 ["SEO / GEO",["seo","referencement naturel","geo","generative engine optimization"]],
 ["Cloud / DevOps",["devops","cloud","aws","azure","docker","kubernetes"]],
 ["Développement web",["javascript","typescript","react","next.js","nextjs","node.js","nodejs","php"]],
 ["RH / Recrutement",["recrutement","recruitment","talent acquisition","ressources humaines","rh"]],
 ["Sales / RevOps",["revops","sales operations","sales ops","business development","commercial"]],
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
 for(const c of candidates){const skills=new Set(terms(c.skills||c.rawText||""));candidateSkills.set(c.id,skills);for(const s of skills)skillCounts.set(s,(skillCounts.get(s)||0)+1);if(c.location)locationCounts.set(c.location,(locationCounts.get(c.location)||0)+1)}
 for(const j of jobs){const skills=new Set(terms(`${j.mustHave}\n${j.shouldHave}\n${j.optional||""}`));jobSkills.set(j.id,skills);for(const s of skills)demandCounts.set(s,(demandCounts.get(s)||0)+1)}
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

// Compatibilité avec les premiers écrans V2.6.
export function buildTalentTrends(candidates:TalentCandidate[],jobTexts:string[]){const jobs:TalentJob[]=jobTexts.map((text,i)=>({id:`legacy-${i}`,title:`Mission ${i+1}`,mustHave:text,shouldHave:"",createdAt:new Date()}));return buildTalentObservatory(candidates,jobs)}
