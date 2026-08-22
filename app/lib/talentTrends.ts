type TalentCandidate={id:string;skills:string;experienceYears:number|null;location:string|null;matches:{score:number;job:{id:string;title:string;mustHave:string;shouldHave:string}}[]};

const STOP=new Set(["ans","annees","experience","minimum","requis","souhaite","souhaitable","maitrise","bonne","connaissance","professionnel","niveau","expertise","profil","poste","mission","avec","pour","dans","des","les","une","sur","and","the"]);
function norm(s:string){return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9+#.\-/ ]/g," ").trim()}
export function terms(text:string){return Array.from(new Set(norm(text).split(/[\n,;|•]+/).flatMap(x=>x.trim().split(/\s{2,}/)).map(x=>x.trim()).filter(x=>x.length>=2&&x.length<=45&&!STOP.has(x))));}
function top(map:Map<string,number>,limit=12){return [...map.entries()].sort((a,b)=>b[1]-a[1]).slice(0,limit).map(([name,count])=>({name,count}));}
export function buildTalentTrends(candidates:TalentCandidate[],jobTexts:string[]){
 const skillCounts=new Map<string,number>(),demandCounts=new Map<string,number>(),locationCounts=new Map<string,number>();
 const exp=candidates.map(c=>c.experienceYears).filter((x):x is number=>typeof x==="number");
 for(const c of candidates){for(const s of terms(c.skills))skillCounts.set(s,(skillCounts.get(s)||0)+1);if(c.location)locationCounts.set(c.location,(locationCounts.get(c.location)||0)+1)}
 for(const text of jobTexts)for(const s of terms(text))demandCounts.set(s,(demandCounts.get(s)||0)+1);
 const gaps=[...demandCounts.entries()].map(([name,demand])=>({name,demand,supply:skillCounts.get(name)||0,gap:demand-(skillCounts.get(name)||0)})).filter(x=>x.demand>0).sort((a,b)=>b.gap-a.gap||b.demand-a.demand).slice(0,12);
 const underused=[...skillCounts.entries()].map(([name,supply])=>({name,supply,demand:demandCounts.get(name)||0})).filter(x=>x.supply>=2&&x.demand===0).sort((a,b)=>b.supply-a.supply).slice(0,10);
 const strong=candidates.filter(c=>c.matches.some(m=>m.score>=70)).length;
 return {candidateCount:candidates.length,averageExperience:exp.length?Math.round(exp.reduce((a,b)=>a+b,0)/exp.length*10)/10:null,seniority:{junior:exp.filter(x=>x<3).length,confirmed:exp.filter(x=>x>=3&&x<7).length,senior:exp.filter(x=>x>=7).length,unknown:candidates.length-exp.length},topSkills:top(skillCounts),topLocations:top(locationCounts,8),demand:top(demandCounts),gaps,underused,strongCandidates:strong,strongRate:candidates.length?Math.round(strong/candidates.length*100):0};
}
