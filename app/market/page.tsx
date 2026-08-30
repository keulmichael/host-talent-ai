import Link from "next/link";
import {prisma} from "../lib/db";
import {requireUser} from "../lib/auth";
import {BMO_HEADLINES,BMO_TENSION_METIERS,MARKET_OPPORTUNITIES,MARKET_SOURCES,OFFER_HEADLINES,OFFER_SECTOR_EVOLUTION} from "../lib/externalMarketTrends";
import {DivergingBars,HorizontalBars} from "../components/InsightCharts";
export const dynamic="force-dynamic";

function trendTone(direction:string){return direction==="up"?"marketUp":direction==="down"?"marketDown":direction==="alert"?"marketAlert":"marketStable"}
function opportunityTone(strength:string){return strength==="fort"?"opportunityStrong":strength==="moyen"?"opportunityMedium":"opportunityExplore"}

// V3.2: les indices directs décrivent des familles de métiers, pas de simples secteurs.
// Les termes trop génériques (ex. "soin", "service", "digital") ne peuvent plus créer seuls une compatibilité métier.
const OCCUPATION_KEYWORDS:Record<string,string[]>={
 health:["aide a domicile","auxiliaire de vie","infirmier","infirmiere","aide-soignant","aide soignant","aide-soignante","aide soignante","sage-femme","sage femme","medecin","soignant","soignante","educateur specialise","educatrice specialisee","assistant de vie","assistante de vie","ash","ehpad","medico-social"],
 construction:["conducteur de travaux","conductrice de travaux","chef de chantier","cheffe de chantier","macon","electricien","electricienne","plombier","plombiere","couvreur","couvreuse","menuisier","menuisiere","second oeuvre","gros oeuvre","btp"],
 "industry-logistics":["technicien de maintenance","technicienne de maintenance","responsable maintenance","supply chain","logisticien","logisticienne","responsable logistique","chef d'equipe logistique","production industrielle","responsable production","entrepot","transport logistique"],
 "high-volume":["hotellerie","restauration","cuisinier","cuisiniere","serveur","serveuse","receptionniste","maitre d'hotel","gouvernant","gouvernante","tourisme","saisonnier"],
 "different-profiles":[],
 "ai-white-collar":["intelligence artificielle generative","chatgpt","llm","automatisation des processus","machine learning","data scientist","data analyst","prompt engineering","agent ia","agents ia","assistant ia","assistants ia"]
};
const TRANSFERABLE:Record<string,string[]>={
 health:["relation client","accompagnement","ecoute","coordination","planning","administratif","gestion de dossier","experience utilisateur","gestion de projet","crm","qualite"],
 construction:["gestion de projet","coordination","planning","budget","fournisseur","operations","maintenance","terrain","qualite","securite"],
 "industry-logistics":["operations","planning","stock","supply","production","maintenance","qualite","process","coordination","erp","excel"],
 "high-volume":["service client","accueil","vente","planning","management","equipe","operationnel","relation client","anglais","evenementiel"],
 "ai-white-collar":["digital","data","marketing","seo","crm","automatisation","process","analyse","contenu","developpement","projet","rh"]
};
const SECTOR_ROLE_SUGGESTIONS:Record<string,string[]>={
 health:["Chef de projet digital santé","Product Owner e-santé","CRM / expérience patient","Transformation digitale santé"],
 construction:["Chef de projet digital BTP","PMO / coordination de projets construction","CRM / transformation digitale BTP"],
 "industry-logistics":["Chef de projet transformation industrielle","PMO opérations / supply chain","Digitalisation des processus industriels"],
 "high-volume":["Chef de projet digital hôtellerie-tourisme","CRM / expérience client","Transformation des opérations de service"],
 "ai-white-collar":["Chef de projet IA métier","Product Owner IA","Consultant transformation / automatisation"]
};
function norm(v:string){return v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")}
function parseSkills(v:string){return v.split(/[,;|\n]/).map(s=>s.trim()).filter(Boolean)}
function candidateText(c:{skills:string;rawText:string;summary:string}){return norm(`${c.skills} ${c.summary||""} ${c.rawText||""}`)}
function escapeRegExp(v:string){return v.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}
function containsTerm(text:string,term:string){const t=norm(term).trim();if(!t)return false;return new RegExp(`(^|[^a-z0-9])${escapeRegExp(t)}([^a-z0-9]|$)`,"i").test(text)}
function matchedTerms(id:string,text:string,source:Record<string,string[]>){return (source[id]||[]).filter(k=>containsTerm(text,k))}
function potentialScore(direct:string[],transfer:string[]){
 // Une compétence transférable seule ne peut jamais produire un score de compatibilité métier élevé.
 // La présence d'au moins un vrai indice métier ouvre une lecture "métier" ; sinon on reste sur un potentiel sectoriel.
 if(!direct.length)return Math.min(45,transfer.length*8);
 return Math.min(100,45+Math.min(35,(direct.length-1)*18)+Math.min(20,transfer.length*5));
}
function fitLevel(direct:string[],transfer:string[]){
 if(direct.length>=2)return "metier";
 if(direct.length===1)return "metier-a-confirmer";
 if(transfer.length>=2)return "sectoriel";
 return "faible";
}
function fitLabel(level:string){return level==="metier"?"compatibilité métier":level==="metier-a-confirmer"?"indice métier à confirmer":level==="sectoriel"?"potentiel sectoriel":"signal faible"}

export default async function MarketObservatory(){
 const user=await requireUser();
 const candidates=await prisma.candidate.findMany({where:{organizationId:user.organizationId},select:{id:true,fullName:true,skills:true,rawText:true,summary:true,experienceYears:true,location:true,availability:true}});
 const profiles=candidates.map(c=>{const text=candidateText(c);return {...c,text,skillList:parseSkills(c.skills)}});
 const marketFit=MARKET_OPPORTUNITIES.map(o=>{
  if(o.id==="different-profiles") return {...o,compatible:0,rate:0,reposition:[] as any[]};
  const reposition=profiles.map(c=>{
   const direct=matchedTerms(o.id,c.text,OCCUPATION_KEYWORDS);
   const transfer=matchedTerms(o.id,c.text,TRANSFERABLE).filter(x=>!direct.includes(x));
   const level=fitLevel(direct,transfer);
   const score=potentialScore(direct,transfer);
   return {id:c.id,name:c.fullName,score,direct,transfer,level,roles:SECTOR_ROLE_SUGGESTIONS[o.id]||[],skills:c.skillList.slice(0,6),experienceYears:c.experienceYears,location:c.location,availability:c.availability};
  }).filter(c=>c.score>=16).sort((a,b)=>b.score-a.score);
  const compatible=reposition.filter(c=>c.level==="metier"||c.level==="metier-a-confirmer").length;
  const rate=candidates.length?Math.round(compatible/candidates.length*100):0;
  return {...o,compatible,rate,reposition};
 });
 const actionable=marketFit.filter(x=>x.compatible>0).sort((a,b)=>b.compatible-a.compatible);
 const repositionCount=new Set(marketFit.flatMap(x=>x.reposition.map((c:any)=>c.id))).size;
 return <>
  <div className="hero"><div><div className="eyebrow">V3.2 · OBSERVATOIRE GÉNÉRAL</div><h1>Du signal marché aux candidats à repositionner.</h1><p className="muted">Host Talent AI distingue désormais la compatibilité avec un métier en tension du potentiel de transfert vers un secteur. Une compétence générique ne suffit plus à transformer un profil en candidat métier.</p></div><div className="actions"><Link className="btn secondary" href="/talent">Observatoire Talent</Link><Link className="btn secondary" href="/jobs">Missions</Link></div></div>

  <div className="marketContextHero"><div><div className="eyebrow">MARCHÉ EXTERNE · FRANCE · 2026</div><h2>Trois angles pour comprendre l’emploi</h2><p><strong>BMO</strong> mesure les intentions d’embauche. <strong>Les offres diffusées</strong> montrent le marché observé. Les études complémentaires éclairent les transformations de fond.</p></div><div className="marketSource"><strong>Lecture croisée Host Talent AI</strong><span>France Travail BMO 2026 + offres T1 2026 + publications statistiques + Indeed Hiring Lab</span><span>Derniers chiffres intégrés : juillet 2026</span></div></div>

  <div className="sectionDivider">Intentions d’embauche · BMO 2026</div>
  <div className="marketTrendGrid">{BMO_HEADLINES.map(x=><div className={`marketTrendCard ${trendTone(x.direction)}`} key={x.id}><div className="marketTrendTop"><span className="marketDot"/><span>{x.title}</span></div><div className="marketValue">{x.value}</div><p>{x.context}</p><div className="marketImplication"><strong>Lecture cabinet</strong><span>{x.implication}</span></div></div>)}</div>
  <div className="grid sectionGrid"><HorizontalBars title="Métiers en tension dans BMO 2026" description="Part des projets de recrutement jugés difficiles." items={BMO_TENSION_METIERS}/><div className="card sectionCard"><div className="eyebrow">SIGNAL STRUCTUREL</div><h2>Le manque de profils adéquats reste central</h2><p className="muted">76,5 % des employeurs ayant suspendu, abandonné ou partiellement réussi un recrutement citent l’absence de candidats adéquats. 43,3 % ont élargi leur recherche à des profils différents.</p></div></div>

  <div className="sectionDivider">Marché observé · offres diffusées T1 2026</div>
  <div className="marketTrendGrid">{OFFER_HEADLINES.map(x=><div className={`marketTrendCard ${trendTone(x.direction)}`} key={x.id}><div className="marketTrendTop"><span className="marketDot"/><span>{x.title}</span></div><div className="marketValue">{x.value}</div><p>{x.context}</p><div className="marketImplication"><strong>Lecture cabinet</strong><span>{x.implication}</span></div></div>)}</div>
  <div className="grid sectionGrid"><DivergingBars title="Évolution sectorielle des offres" description="Variation annuelle des offres diffusées par France Travail au 1er trimestre 2026." items={OFFER_SECTOR_EVOLUTION}/><div className="card sectionCard"><div className="eyebrow">CONTRATS & GÉOGRAPHIE</div><h2>Un marché plus flexible et territorial</h2><p className="muted">63,0 % des offres portent encore sur des contrats durables, mais cette part recule de 6,6 points. 60 départements sur 100 sont en baisse ; Paris recule de 7,0 %.</p></div></div>

  <div className="sectionDivider">Marché externe × vivier interne</div>
  <div className="card sectionCard"><div className="sectionHeader"><div><div className="eyebrow">CAPACITÉ COMMERCIALE IMMÉDIATE</div><h2>Quels marchés le cabinet peut-il déjà adresser ?</h2><p className="muted">Les CV directs correspondent désormais à une famille de métiers explicite. Les profils uniquement transférables sont comptés séparément dans la revue de repositionnement.</p></div></div><div className="kpiGrid"><div className="card kpiCard"><div className="muted">CV analysés</div><div className="score">{candidates.length}</div></div><div className="card kpiCard"><div className="muted">Marchés avec vivier métier</div><div className="score">{actionable.length}</div></div><div className="card kpiCard"><div className="muted">Profils à examiner</div><div className="score">{repositionCount}</div></div></div><div className="tableWrap"><table><thead><tr><th>Marché externe</th><th>Priorité</th><th>CV métier</th><th>Part du vivier</th><th>Lecture commerciale</th></tr></thead><tbody>{marketFit.filter(x=>x.id!=="different-profiles").map(x=><tr key={x.id}><td><strong>{x.market}</strong></td><td>{x.strength==="fort"?"Forte":x.strength==="moyen"?"À explorer":"Exploratoire"}</td><td><strong>{x.compatible}</strong></td><td>{x.rate} %</td><td>{x.compatible>=5?"Vivier métier exploitable : marché à tester.":x.compatible>0?"Premiers profils métier présents : potentiel à qualifier.":x.reposition.length?"Pas de profil métier direct ; potentiel sectoriel à examiner.":"Sourcing préalable recommandé."}</td></tr>)}</tbody></table></div></div>

  <div className="sectionDivider">Candidats à repositionner</div>
  <div className="card sectionCard"><div className="sectionHeader"><div><div className="eyebrow">COMPÉTENCES TRANSFÉRABLES</div><h2>Métier en tension ou potentiel sectoriel ?</h2><p className="muted">V3.2 sépare les preuves d’un métier des compétences transférables. Un profil digital peut ainsi être pertinent pour une entreprise de santé sans être présenté comme professionnel du soin.</p></div></div><div className="opportunityGrid">{marketFit.filter(x=>x.id!=="different-profiles"&&x.reposition.length>0).map(x=><div className="opportunityCard" key={`reposition-${x.id}`}><div className="opportunityHeader"><strong>{x.market}</strong><span>{x.reposition.length} profil{x.reposition.length>1?"s":""} à examiner</span></div><p className="opportunitySignal">{x.signal}</p>{x.reposition.slice(0,5).map((c:any)=><div className="opportunityPlay" key={c.id}><span>Potentiel {c.score}/100 · {fitLabel(c.level)}</span><p><Link href={`/candidates/${c.id}`}><strong>{c.name}</strong></Link>{c.experienceYears?` · ${c.experienceYears} ans d’expérience`:""}{c.location?` · ${c.location}`:""}</p>{c.direct.length>0?<p className="small muted">Preuves métier : {c.direct.slice(0,3).join(", ")}. {c.transfer.length?`Transférables : ${c.transfer.slice(0,4).join(", ")}.`:""}</p>:<p className="small muted"><strong>Aucune preuve du métier en tension.</strong> Compétences transférables : {c.transfer.slice(0,4).join(", ")}.</p>}{c.level==="sectoriel"&&c.roles.length>0&&<p className="small muted">Fonctions sectorielles à examiner : {c.roles.slice(0,3).join(" · ")}.</p>}</div>)}</div>)}</div>{repositionCount===0&&<div className="opsPanel"><strong>Aucun repositionnement détecté pour le moment.</strong><p className="muted">Le vivier actuel ne présente pas encore assez d’indices métier ou de compétences transférables sur les marchés suivis.</p></div>}</div>

  <div className="card sectionCard marketOpportunitySection"><div className="sectionHeader"><div><div className="eyebrow">DÉVELOPPEMENT COMMERCIAL</div><h2>Marchés à tester pour le cabinet</h2></div></div><div className="opportunityGrid">{marketFit.map(x=><div className={`opportunityCard ${opportunityTone(x.strength)}`} key={x.id}><div className="opportunityHeader"><strong>{x.market}</strong><span>{x.strength==="fort"?"Priorité forte":x.strength==="moyen"?"À explorer":"Exploratoire"}</span></div><p className="opportunitySignal">{x.signal}</p><div className="opportunityReason"><span>Pourquoi maintenant</span><p>{x.why}</p></div><div className="opportunityPlay"><span>Offre à tester</span><p>{x.play}</p></div>{x.id!=="different-profiles"&&<div className="opportunityPlay"><span>Vivier détecté</span><p><strong>{x.compatible} CV métier</strong> · {x.reposition.length} profils à examiner · {x.rate} % du vivier avec indice métier</p></div>}</div>)}</div></div>

  <div className="card sectionCard"><div className="sectionHeader"><div><div className="eyebrow">SOURCES</div><h2>Études intégrées à l’Observatoire</h2></div></div><div className="opportunityGrid">{MARKET_SOURCES.map(s=><a className="opportunityCard" key={s.id} href={s.url} target="_blank" rel="noreferrer"><div className="opportunityHeader"><strong>{s.title}</strong><span>{s.kind}</span></div><p className="opportunitySignal">{s.scope}</p><div className="opportunityPlay"><span>Mise à jour</span><p>{s.publishedAt} · consulter la source ↗</p></div></a>)}</div></div>

  <div className="grid sectionGrid"><div className="card"><div className="eyebrow">BOUCLE STRATÉGIQUE</div><h2>Marché → métier → transfert → candidat → action</h2><p className="muted">L’Observatoire distingue maintenant le métier réellement exercé du secteur dans lequel les compétences du candidat pourraient être valorisées.</p><Link href="/talent" className="btn secondary">Analyser le vivier en détail</Link></div><div className="card"><div className="eyebrow">MÉTHODE</div><h2>Détecter sans surinterpréter.</h2><p className="muted">Une compétence transférable ne constitue jamais une preuve métier. Les suggestions sectorielles servent à ouvrir une piste de revue humaine ; la disponibilité, l’intérêt, les qualifications réglementées et l’adéquation finale restent à vérifier.</p></div></div>
 </>;
}
