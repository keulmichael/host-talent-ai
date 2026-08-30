import Link from "next/link";
import {prisma} from "../lib/db";
import {requireUser} from "../lib/auth";
import {BMO_HEADLINES,BMO_TENSION_METIERS,MARKET_OPPORTUNITIES,MARKET_SOURCES,OFFER_HEADLINES,OFFER_SECTOR_EVOLUTION} from "../lib/externalMarketTrends";
import {DivergingBars,HorizontalBars} from "../components/InsightCharts";
export const dynamic="force-dynamic";

function trendTone(direction:string){return direction==="up"?"marketUp":direction==="down"?"marketDown":direction==="alert"?"marketAlert":"marketStable"}
function opportunityTone(strength:string){return strength==="fort"?"opportunityStrong":strength==="moyen"?"opportunityMedium":"opportunityExplore"}
const MARKET_KEYWORDS:Record<string,string[]>={
 health:["sante","soin","aide a domicile","auxiliaire de vie","infirm","aide-soignant","medical","medico","patient","clinique"],
 construction:["btp","construction","chantier","batiment","macon","electric","plomb","second oeuvre","conducteur de travaux","maintenance technique"],
 "industry-logistics":["industrie","industriel","maintenance","logistique","transport","supply chain","production","technicien","mecan","entrepot","qualite","operations"],
 "high-volume":["hotel","hotellerie","restauration","restaurant","cuisine","cuisinier","serveur","tourisme","saisonnier","accueil","service client"],
 "different-profiles":[],
 "ai-white-collar":["intelligence artificielle"," ia ","chatgpt","llm","automatisation","automation","prompt","copilot","machine learning","data","digital","marketing","rh","ressources humaines","seo","crm"]
};
const TRANSFERABLE:Record<string,string[]>={
 health:["relation client","accompagnement","ecoute","coordination","planning","administratif","gestion de dossier","service","qualite"],
 construction:["gestion de projet","coordination","planning","budget","fournisseur","operations","maintenance","terrain","qualite","securite"],
 "industry-logistics":["operations","planning","stock","supply","production","maintenance","qualite","process","coordination","erp","excel"],
 "high-volume":["service client","accueil","vente","planning","management","equipe","operationnel","relation client","anglais","evenementiel"],
 "ai-white-collar":["digital","data","marketing","seo","crm","automatisation","process","analyse","contenu","developpement","projet","rh"]
};
function norm(v:string){return v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")}
function parseSkills(v:string){return v.split(/[,;|\n]/).map(s=>s.trim()).filter(Boolean)}
function candidateText(c:{skills:string;rawText:string}){return norm(`${c.skills} ${c.rawText||""}`)}
function matchedTerms(id:string,text:string,source:Record<string,string[]>){return (source[id]||[]).filter(k=>text.includes(norm(k)))}
function potentialScore(direct:string[],transfer:string[]){return Math.min(100,direct.length*28+transfer.length*11)}

export default async function MarketObservatory(){
 const user=await requireUser();
 const candidates=await prisma.candidate.findMany({where:{organizationId:user.organizationId},select:{id:true,fullName:true,skills:true,rawText:true,summary:true,experienceYears:true,location:true,availability:true}});
 const profiles=candidates.map(c=>{
  const text=candidateText(c);
  return {...c,text,skillList:parseSkills(c.skills)};
 });
 const marketFit=MARKET_OPPORTUNITIES.map(o=>{
  if(o.id==="different-profiles") return {...o,compatible:0,rate:0,reposition:[] as any[]};
  const reposition=profiles.map(c=>{
   const direct=matchedTerms(o.id,c.text,MARKET_KEYWORDS);
   const transfer=matchedTerms(o.id,c.text,TRANSFERABLE).filter(x=>!direct.includes(x));
   const score=potentialScore(direct,transfer);
   return {id:c.id,name:c.fullName,score,direct,transfer,skills:c.skillList.slice(0,6),experienceYears:c.experienceYears,location:c.location,availability:c.availability};
  }).filter(c=>c.score>=22).sort((a,b)=>b.score-a.score);
  const compatible=reposition.filter(c=>c.direct.length>0).length;
  const rate=candidates.length?Math.round(compatible/candidates.length*100):0;
  return {...o,compatible,rate,reposition};
 });
 const actionable=marketFit.filter(x=>x.compatible>0).sort((a,b)=>b.compatible-a.compatible);
 const repositionCount=new Set(marketFit.flatMap(x=>x.reposition.map((c:any)=>c.id))).size;
 return <>
  <div className="hero"><div><div className="eyebrow">V3.1 · OBSERVATOIRE GÉNÉRAL</div><h1>Du signal marché aux candidats à repositionner.</h1><p className="muted">Host Talent AI croise le marché externe avec le vivier puis révèle les profils dont les compétences directes ou transférables peuvent ouvrir une nouvelle opportunité commerciale.</p></div><div className="actions"><Link className="btn secondary" href="/talent">Observatoire Talent</Link><Link className="btn secondary" href="/jobs">Missions</Link></div></div>

  <div className="marketContextHero"><div><div className="eyebrow">MARCHÉ EXTERNE · FRANCE · 2026</div><h2>Trois angles pour comprendre l’emploi</h2><p><strong>BMO</strong> mesure les intentions d’embauche. <strong>Les offres diffusées</strong> montrent le marché observé. Les études complémentaires éclairent les transformations de fond.</p></div><div className="marketSource"><strong>Lecture croisée Host Talent AI</strong><span>France Travail BMO 2026 + offres T1 2026 + publications statistiques + Indeed Hiring Lab</span><span>Derniers chiffres intégrés : juillet 2026</span></div></div>

  <div className="sectionDivider">Intentions d’embauche · BMO 2026</div>
  <div className="marketTrendGrid">{BMO_HEADLINES.map(x=><div className={`marketTrendCard ${trendTone(x.direction)}`} key={x.id}><div className="marketTrendTop"><span className="marketDot"/><span>{x.title}</span></div><div className="marketValue">{x.value}</div><p>{x.context}</p><div className="marketImplication"><strong>Lecture cabinet</strong><span>{x.implication}</span></div></div>)}</div>
  <div className="grid sectionGrid"><HorizontalBars title="Métiers en tension dans BMO 2026" description="Part des projets de recrutement jugés difficiles." items={BMO_TENSION_METIERS}/><div className="card sectionCard"><div className="eyebrow">SIGNAL STRUCTUREL</div><h2>Le manque de profils adéquats reste central</h2><p className="muted">76,5 % des employeurs ayant suspendu, abandonné ou partiellement réussi un recrutement citent l’absence de candidats adéquats. 43,3 % ont élargi leur recherche à des profils différents.</p></div></div>

  <div className="sectionDivider">Marché observé · offres diffusées T1 2026</div>
  <div className="marketTrendGrid">{OFFER_HEADLINES.map(x=><div className={`marketTrendCard ${trendTone(x.direction)}`} key={x.id}><div className="marketTrendTop"><span className="marketDot"/><span>{x.title}</span></div><div className="marketValue">{x.value}</div><p>{x.context}</p><div className="marketImplication"><strong>Lecture cabinet</strong><span>{x.implication}</span></div></div>)}</div>
  <div className="grid sectionGrid"><DivergingBars title="Évolution sectorielle des offres" description="Variation annuelle des offres diffusées par France Travail au 1er trimestre 2026." items={OFFER_SECTOR_EVOLUTION}/><div className="card sectionCard"><div className="eyebrow">CONTRATS & GÉOGRAPHIE</div><h2>Un marché plus flexible et territorial</h2><p className="muted">63,0 % des offres portent encore sur des contrats durables, mais cette part recule de 6,6 points. 60 départements sur 100 sont en baisse ; Paris recule de 7,0 %.</p></div></div>

  <div className="sectionDivider">Marché externe × vivier interne</div>
  <div className="card sectionCard"><div className="sectionHeader"><div><div className="eyebrow">CAPACITÉ COMMERCIALE IMMÉDIATE</div><h2>Quels marchés le cabinet peut-il déjà adresser ?</h2><p className="muted">Détection déterministe à partir des compétences et du contenu des CV. Le résultat révèle un potentiel à qualifier, sans décider de l’aptitude d’un candidat.</p></div></div><div className="kpiGrid"><div className="card kpiCard"><div className="muted">CV analysés</div><div className="score">{candidates.length}</div></div><div className="card kpiCard"><div className="muted">Marchés avec vivier</div><div className="score">{actionable.length}</div></div><div className="card kpiCard"><div className="muted">Profils repositionnables</div><div className="score">{repositionCount}</div></div></div><div className="tableWrap"><table><thead><tr><th>Marché externe</th><th>Priorité</th><th>CV directs</th><th>Part du vivier</th><th>Lecture commerciale</th></tr></thead><tbody>{marketFit.filter(x=>x.id!=="different-profiles").map(x=><tr key={x.id}><td><strong>{x.market}</strong></td><td>{x.strength==="fort"?"Forte":x.strength==="moyen"?"À explorer":"Exploratoire"}</td><td><strong>{x.compatible}</strong></td><td>{x.rate} %</td><td>{x.compatible>=5?"Vivier exploitable : marché à tester.":x.compatible>0?"Premiers profils présents : potentiel à qualifier.":x.reposition.length?"Pas de profil direct, mais compétences transférables détectées.":"Sourcing préalable recommandé."}</td></tr>)}</tbody></table></div></div>

  <div className="sectionDivider">Candidats à repositionner</div>
  <div className="card sectionCard"><div className="sectionHeader"><div><div className="eyebrow">COMPÉTENCES TRANSFÉRABLES</div><h2>Qui peut ouvrir un marché que le cabinet n’exploitait pas encore ?</h2><p className="muted">Le score de potentiel combine des indices métier directs et des compétences transférables. Il sert à prioriser une revue humaine du CV, pas à sélectionner automatiquement un candidat.</p></div></div><div className="opportunityGrid">{marketFit.filter(x=>x.id!=="different-profiles"&&x.reposition.length>0).map(x=><div className="opportunityCard" key={`reposition-${x.id}`}><div className="opportunityHeader"><strong>{x.market}</strong><span>{x.reposition.length} profil{x.reposition.length>1?"s":""}</span></div><p className="opportunitySignal">{x.signal}</p>{x.reposition.slice(0,5).map((c:any)=><div className="opportunityPlay" key={c.id}><span>Potentiel {c.score}/100 · {c.direct.length?"indices métier + transfert":"compétences transférables"}</span><p><Link href={`/candidates/${c.id}`}><strong>{c.name}</strong></Link>{c.experienceYears?` · ${c.experienceYears} ans d’expérience`:""}{c.location?` · ${c.location}`:""}</p><p className="small muted">{c.direct.length?`Indices directs : ${c.direct.slice(0,3).join(", ")}. `:""}{c.transfer.length?`Transférables : ${c.transfer.slice(0,4).join(", ")}.`:""}</p></div>)}</div>)}</div>{repositionCount===0&&<div className="opsPanel"><strong>Aucun repositionnement détecté pour le moment.</strong><p className="muted">Le vivier actuel ne présente pas encore assez d’indices directs ou transférables sur les marchés suivis.</p></div>}</div>

  <div className="card sectionCard marketOpportunitySection"><div className="sectionHeader"><div><div className="eyebrow">DÉVELOPPEMENT COMMERCIAL</div><h2>Marchés à tester pour le cabinet</h2></div></div><div className="opportunityGrid">{marketFit.map(x=><div className={`opportunityCard ${opportunityTone(x.strength)}`} key={x.id}><div className="opportunityHeader"><strong>{x.market}</strong><span>{x.strength==="fort"?"Priorité forte":x.strength==="moyen"?"À explorer":"Exploratoire"}</span></div><p className="opportunitySignal">{x.signal}</p><div className="opportunityReason"><span>Pourquoi maintenant</span><p>{x.why}</p></div><div className="opportunityPlay"><span>Offre à tester</span><p>{x.play}</p></div>{x.id!=="different-profiles"&&<div className="opportunityPlay"><span>Vivier détecté</span><p><strong>{x.compatible} CV directs</strong> · {x.reposition.length} profils à examiner · {x.rate} % du vivier en correspondance directe</p></div>}</div>)}</div></div>

  <div className="card sectionCard"><div className="sectionHeader"><div><div className="eyebrow">SOURCES</div><h2>Études intégrées à l’Observatoire</h2></div></div><div className="opportunityGrid">{MARKET_SOURCES.map(s=><a className="opportunityCard" key={s.id} href={s.url} target="_blank" rel="noreferrer"><div className="opportunityHeader"><strong>{s.title}</strong><span>{s.kind}</span></div><p className="opportunitySignal">{s.scope}</p><div className="opportunityPlay"><span>Mise à jour</span><p>{s.publishedAt} · consulter la source ↗</p></div></a>)}</div></div>

  <div className="grid sectionGrid"><div className="card"><div className="eyebrow">BOUCLE STRATÉGIQUE</div><h2>Marché → vivier → candidat → action</h2><p className="muted">L’Observatoire ne s’arrête plus au constat sectoriel : il permet maintenant de descendre jusqu’aux profils à examiner et de revenir à leur fiche candidat.</p><Link href="/talent" className="btn secondary">Analyser le vivier en détail</Link></div><div className="card"><div className="eyebrow">MÉTHODE</div><h2>Détecter sans surinterpréter.</h2><p className="muted">Le potentiel repose sur des indices textuels explicites et des compétences transférables prédéfinies. La disponibilité, l’intérêt du candidat, la réalité du poste et l’adéquation finale doivent être vérifiés par le recruteur.</p></div></div>
 </>;
}
