import Link from "next/link";
import {prisma} from "../lib/db";
import {requireUser} from "../lib/auth";
import {BMO_HEADLINES,BMO_TENSION_METIERS,MARKET_OPPORTUNITIES,MARKET_SOURCES,OFFER_HEADLINES,OFFER_SECTOR_EVOLUTION} from "../lib/externalMarketTrends";
import {DivergingBars,HorizontalBars} from "../components/InsightCharts";
export const dynamic="force-dynamic";

function trendTone(direction:string){return direction==="up"?"marketUp":direction==="down"?"marketDown":direction==="alert"?"marketAlert":"marketStable"}
function opportunityTone(strength:string){return strength==="fort"?"opportunityStrong":strength==="moyen"?"opportunityMedium":"opportunityExplore"}

const OCCUPATION_KEYWORDS:Record<string,string[]>={
 health:["aide a domicile","auxiliaire de vie","infirmier","infirmiere","aide-soignant","aide soignant","aide-soignante","aide soignante","sage-femme","sage femme","medecin","soignant","soignante","educateur specialise","educatrice specialisee","assistant de vie","assistante de vie","ash","ehpad","medico-social"],
 construction:["conducteur de travaux","conductrice de travaux","chef de chantier","cheffe de chantier","macon","electricien","electricienne","plombier","plombiere","couvreur","couvreuse","menuisier","menuisiere","second oeuvre","gros oeuvre","btp"],
 "industry-logistics":["technicien de maintenance","technicienne de maintenance","responsable maintenance","supply chain","logisticien","logisticienne","responsable logistique","chef d'equipe logistique","production industrielle","responsable production","entrepot","transport logistique"],
 "high-volume":["hotellerie","restauration","cuisinier","cuisiniere","serveur","serveuse","receptionniste","maitre d'hotel","gouvernant","gouvernante","tourisme","saisonnier"],
 "different-profiles":[],
 "ai-white-collar":["intelligence artificielle generative","chatgpt","llm","automatisation des processus","machine learning","data scientist","data analyst","prompt engineering","agent ia","agents ia","assistant ia","assistants ia"]
};
const SECTOR_KEYWORDS:Record<string,string[]>={
 health:["sante","e-sante","healthtech","hopital","hospitalier","clinique","patient","medical","medico-social","ehpad","mutuelle","pharmacie","pharma"],
 construction:["construction","btp","batiment","chantier","immobilier","second oeuvre","gros oeuvre","travaux publics"],
 "industry-logistics":["industrie","industriel","usine","manufacturing","logistique","transport","supply chain","entrepot","production industrielle"],
 "high-volume":["hotellerie","hotel","restauration","restaurant","tourisme","voyage","hospitality","saisonnier"],
 "ai-white-collar":["intelligence artificielle","ia generative","chatgpt","llm","automatisation","machine learning","data","digital"]
};
const TRANSFERABLE:Record<string,string[]>={
 health:["relation client","accompagnement","ecoute","coordination","planning","administratif","gestion de dossier","experience utilisateur","gestion de projet","crm","qualite"],
 construction:["gestion de projet","coordination","planning","budget","fournisseur","operations","maintenance","terrain","qualite","securite"],
 "industry-logistics":["operations","planning","stock","supply","production","maintenance","qualite","process","coordination","erp","excel"],
 "high-volume":["service client","accueil","vente","planning","management","equipe","operationnel","relation client","anglais","evenementiel"],
 "ai-white-collar":["digital","data","marketing","seo","crm","automatisation","process","analyse","contenu","developpement","projet","rh"]
};
const STRONG_TRANSFER:Record<string,string[]>={
 health:["gestion de dossier","experience utilisateur","crm","qualite"],
 construction:["maintenance","terrain","securite","fournisseur"],
 "industry-logistics":["erp","stock","supply","production","maintenance","process"],
 "high-volume":["accueil","service client","operationnel","evenementiel"],
 "ai-white-collar":["automatisation","data","seo","developpement","crm"]
};
function norm(v:string){return v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")}
function parseSkills(v:string){return v.split(/[,;|\n]/).map(s=>s.trim()).filter(Boolean)}
function candidateText(c:{skills:string;rawText:string;summary:string}){return norm(`${c.skills} ${c.summary||""} ${c.rawText||""}`)}
function escapeRegExp(v:string){return v.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}
function containsTerm(text:string,term:string){const t=norm(term).trim();if(!t)return false;return new RegExp(`(^|[^a-z0-9])${escapeRegExp(t)}([^a-z0-9]|$)`,"i").test(text)}
function matchedTerms(id:string,text:string,source:Record<string,string[]>){return (source[id]||[]).filter(k=>containsTerm(text,k))}
function bridgeScore(direct:string[],sector:string[],transfer:string[],strong:string[]){
 if(direct.length)return Math.min(100,58+Math.min(22,(direct.length-1)*11)+Math.min(12,sector.length*6)+Math.min(8,transfer.length*2));
 if(sector.length)return Math.min(74,38+Math.min(18,(sector.length-1)*9)+Math.min(12,strong.length*6)+Math.min(6,transfer.length*2));
 if(strong.length>=2)return Math.min(49,27+Math.min(12,(strong.length-2)*6)+Math.min(10,transfer.length*2));
 return Math.min(24,strong.length*10+Math.min(14,transfer.length*3));
}
function fitLevel(direct:string[],sector:string[],strong:string[]){
 if(direct.length)return "metier";
 if(sector.length)return "sectoriel";
 if(strong.length>=2)return "passerelle";
 return "faible";
}
function fitLabel(level:string){return level==="metier"?"métier démontré":level==="sectoriel"?"expérience sectorielle":level==="passerelle"?"passerelle fonctionnelle forte":"passerelle faible"}
function roleSuggestions(id:string,text:string){
 const roles:string[]=[];
 const hasProject=containsTerm(text,"gestion de projet")||containsTerm(text,"product owner")||containsTerm(text,"chef de projet")||containsTerm(text,"pmo");
 const hasProduct=containsTerm(text,"product owner")||containsTerm(text,"product manager")||containsTerm(text,"produit");
 const hasCrm=containsTerm(text,"crm")||containsTerm(text,"hubspot")||containsTerm(text,"salesforce");
 const hasDigital=containsTerm(text,"digital")||containsTerm(text,"numerique")||containsTerm(text,"web");
 const hasOps=containsTerm(text,"operations")||containsTerm(text,"supply chain")||containsTerm(text,"erp")||containsTerm(text,"maintenance");
 if(id==="health"){if(hasProject&&hasDigital)roles.push("Chef de projet digital santé");if(hasProduct)roles.push("Product Owner e-santé");if(hasCrm)roles.push("CRM / expérience patient");}
 if(id==="construction"){if(hasProject&&hasDigital)roles.push("Chef de projet digital BTP");if(hasProject)roles.push("PMO / coordination de projets construction");if(hasCrm)roles.push("CRM / transformation digitale BTP");}
 if(id==="industry-logistics"){if(hasProject&&hasOps)roles.push("Chef de projet transformation industrielle");if(hasOps)roles.push("PMO opérations / supply chain");if(hasDigital&&hasOps)roles.push("Digitalisation des processus industriels");}
 if(id==="high-volume"){if(hasProject&&hasDigital)roles.push("Chef de projet digital hôtellerie-tourisme");if(hasCrm)roles.push("CRM / expérience client");if(hasOps)roles.push("Transformation des opérations de service");}
 if(id==="ai-white-collar"){if(hasProject)roles.push("Chef de projet IA métier");if(hasProduct)roles.push("Product Owner IA");if(containsTerm(text,"automatisation")||containsTerm(text,"automation"))roles.push("Consultant transformation / automatisation");}
 return roles;
}

export default async function MarketObservatory(){
 const user=await requireUser();
 const candidates=await prisma.candidate.findMany({where:{organizationId:user.organizationId},select:{id:true,fullName:true,skills:true,rawText:true,summary:true,experienceYears:true,location:true,availability:true}});
 const profiles=candidates.map(c=>{const text=candidateText(c);return {...c,text,skillList:parseSkills(c.skills)}});
 const marketFit=MARKET_OPPORTUNITIES.map(o=>{
  if(o.id==="different-profiles")return {...o,compatible:0,rate:0,reposition:[] as any[],counts:{metier:0,sectoriel:0,passerelle:0}};
  const all=profiles.map(c=>{
   const direct=matchedTerms(o.id,c.text,OCCUPATION_KEYWORDS);
   const sector=matchedTerms(o.id,c.text,SECTOR_KEYWORDS).filter(x=>!direct.includes(x));
   const transfer=matchedTerms(o.id,c.text,TRANSFERABLE).filter(x=>!direct.includes(x)&&!sector.includes(x));
   const strong=matchedTerms(o.id,c.text,STRONG_TRANSFER);
   const level=fitLevel(direct,sector,strong);
   const score=bridgeScore(direct,sector,transfer,strong);
   return {id:c.id,name:c.fullName,score,direct,sector,transfer,strong,level,roles:roleSuggestions(o.id,c.text),skills:c.skillList.slice(0,6),experienceYears:c.experienceYears,location:c.location,availability:c.availability};
  }).sort((a,b)=>b.score-a.score);
  const counts={metier:all.filter(c=>c.level==="metier").length,sectoriel:all.filter(c=>c.level==="sectoriel").length,passerelle:all.filter(c=>c.level==="passerelle").length};
  const reposition=all.filter(c=>c.level!=="faible"&&c.score>=27);
  const compatible=counts.metier;
  const rate=candidates.length?Math.round(compatible/candidates.length*100):0;
  return {...o,compatible,rate,reposition,counts};
 });
 const actionable=marketFit.filter(x=>x.compatible>0).sort((a,b)=>b.compatible-a.compatible);
 const repositionCount=new Set(marketFit.flatMap(x=>x.reposition.map((c:any)=>c.id))).size;
 return <>
  <div className="hero"><div><div className="eyebrow">V3.3 · OBSERVATOIRE GÉNÉRAL</div><h1>Du signal marché aux passerelles réellement crédibles.</h1><p className="muted">Le vivier est désormais séparé entre métier démontré, expérience sectorielle et passerelle fonctionnelle forte. Les compétences générales seules ne suffisent plus à faire remonter un candidat.</p></div><div className="actions"><Link className="btn secondary" href="/talent">Observatoire Talent</Link><Link className="btn secondary" href="/jobs">Missions</Link></div></div>
  <div className="marketContextHero"><div><div className="eyebrow">MARCHÉ EXTERNE · FRANCE · 2026</div><h2>Trois angles pour comprendre l’emploi</h2><p><strong>BMO</strong> mesure les intentions d’embauche. <strong>Les offres diffusées</strong> montrent le marché observé. Les études complémentaires éclairent les transformations de fond.</p></div><div className="marketSource"><strong>Lecture croisée Host Talent AI</strong><span>France Travail BMO 2026 + offres T1 2026 + publications statistiques + Indeed Hiring Lab</span><span>Derniers chiffres intégrés : juillet 2026</span></div></div>
  <div className="sectionDivider">Intentions d’embauche · BMO 2026</div>
  <div className="marketTrendGrid">{BMO_HEADLINES.map(x=><div className={`marketTrendCard ${trendTone(x.direction)}`} key={x.id}><div className="marketTrendTop"><span className="marketDot"/><span>{x.title}</span></div><div className="marketValue">{x.value}</div><p>{x.context}</p><div className="marketImplication"><strong>Lecture cabinet</strong><span>{x.implication}</span></div></div>)}</div>
  <div className="grid sectionGrid"><HorizontalBars title="Métiers en tension dans BMO 2026" description="Part des projets de recrutement jugés difficiles." items={BMO_TENSION_METIERS}/><div className="card sectionCard"><div className="eyebrow">SIGNAL STRUCTUREL</div><h2>Le manque de profils adéquats reste central</h2><p className="muted">76,5 % des employeurs ayant suspendu, abandonné ou partiellement réussi un recrutement citent l’absence de candidats adéquats. 43,3 % ont élargi leur recherche à des profils différents.</p></div></div>
  <div className="sectionDivider">Marché observé · offres diffusées T1 2026</div>
  <div className="marketTrendGrid">{OFFER_HEADLINES.map(x=><div className={`marketTrendCard ${trendTone(x.direction)}`} key={x.id}><div className="marketTrendTop"><span className="marketDot"/><span>{x.title}</span></div><div className="marketValue">{x.value}</div><p>{x.context}</p><div className="marketImplication"><strong>Lecture cabinet</strong><span>{x.implication}</span></div></div>)}</div>
  <div className="grid sectionGrid"><DivergingBars title="Évolution sectorielle des offres" description="Variation annuelle des offres diffusées par France Travail au 1er trimestre 2026." items={OFFER_SECTOR_EVOLUTION}/><div className="card sectionCard"><div className="eyebrow">CONTRATS & GÉOGRAPHIE</div><h2>Un marché plus flexible et territorial</h2><p className="muted">63,0 % des offres portent encore sur des contrats durables, mais cette part recule de 6,6 points. 60 départements sur 100 sont en baisse ; Paris recule de 7,0 %.</p></div></div>
  <div className="sectionDivider">Marché externe × vivier interne</div>
  <div className="card sectionCard"><div className="sectionHeader"><div><div className="eyebrow">CAPACITÉ COMMERCIALE IMMÉDIATE</div><h2>Quelle est la profondeur réelle du vivier ?</h2><p className="muted">Les volumes distinguent maintenant les candidats du métier, ceux ayant déjà une proximité sectorielle et les passerelles fonctionnelles suffisamment fortes pour mériter une revue humaine.</p></div></div><div className="kpiGrid"><div className="card kpiCard"><div className="muted">CV analysés</div><div className="score">{candidates.length}</div></div><div className="card kpiCard"><div className="muted">Marchés avec vivier métier</div><div className="score">{actionable.length}</div></div><div className="card kpiCard"><div className="muted">Profils crédibles à examiner</div><div className="score">{repositionCount}</div></div></div><div className="tableWrap"><table><thead><tr><th>Marché</th><th>Métier démontré</th><th>Expérience sectorielle</th><th>Passerelle forte</th><th>Lecture</th></tr></thead><tbody>{marketFit.filter(x=>x.id!=="different-profiles").map(x=><tr key={x.id}><td><strong>{x.market}</strong></td><td><strong>{x.counts.metier}</strong></td><td>{x.counts.sectoriel}</td><td>{x.counts.passerelle}</td><td>{x.counts.metier>=5?"Vivier métier exploitable.":x.counts.metier>0?"Vivier métier à qualifier.":x.counts.sectoriel>0?"Pas de métier direct, mais proximité sectorielle exploitable.":x.counts.passerelle>0?"Passerelles ciblées à valider.":"Sourcing préalable recommandé."}</td></tr>)}</tbody></table></div></div>
  <div className="sectionDivider">Candidats à repositionner</div>
  <div className="card sectionCard"><div className="sectionHeader"><div><div className="eyebrow">COMPÉTENCES TRANSFÉRABLES</div><h2>Métier, secteur ou vraie passerelle ?</h2><p className="muted">V3.3 écarte les rapprochements fondés uniquement sur des compétences universelles comme coordination ou gestion de projet. Une passerelle sans expérience sectorielle doit comporter plusieurs marqueurs fonctionnels spécifiques.</p></div></div><div className="opportunityGrid">{marketFit.filter(x=>x.id!=="different-profiles"&&x.reposition.length>0).map(x=><div className="opportunityCard" key={`reposition-${x.id}`}><div className="opportunityHeader"><strong>{x.market}</strong><span>{x.counts.metier} métier · {x.counts.sectoriel} secteur · {x.counts.passerelle} passerelle</span></div><p className="opportunitySignal">{x.signal}</p>{x.reposition.slice(0,5).map((c:any)=><div className="opportunityPlay" key={c.id}><span>Potentiel {c.score}/100 · {fitLabel(c.level)}</span><p><Link href={`/candidates/${c.id}`}><strong>{c.name}</strong></Link>{c.experienceYears?` · ${c.experienceYears} ans d’expérience`:""}{c.location?` · ${c.location}`:""}</p>{c.direct.length>0&&<p className="small muted"><strong>Preuves métier :</strong> {c.direct.slice(0,3).join(", ")}. {c.transfer.length?`Transférables : ${c.transfer.slice(0,4).join(", ")}.`:""}</p>}{!c.direct.length&&c.sector.length>0&&<p className="small muted"><strong>Proximité sectorielle :</strong> {c.sector.slice(0,3).join(", ")}. {c.transfer.length?`Compétences fonctionnelles : ${c.transfer.slice(0,4).join(", ")}.`:""}</p>}{c.level==="passerelle"&&<p className="small muted"><strong>Aucune expérience sectorielle détectée.</strong> Marqueurs transférables spécifiques : {c.strong.slice(0,4).join(", ")}.</p>}{c.roles.length>0&&<p className="small muted">Fonctions cohérentes avec le CV à examiner : {c.roles.slice(0,3).join(" · ")}.</p>}</div>)}</div>)}</div>{repositionCount===0&&<div className="opsPanel"><strong>Aucune passerelle suffisamment crédible pour le moment.</strong><p className="muted">Les compétences générales seules sont désormais volontairement exclues de cette sélection.</p></div>}</div>
  <div className="card sectionCard marketOpportunitySection"><div className="sectionHeader"><div><div className="eyebrow">DÉVELOPPEMENT COMMERCIAL</div><h2>Marchés à tester pour le cabinet</h2></div></div><div className="opportunityGrid">{marketFit.map(x=><div className={`opportunityCard ${opportunityTone(x.strength)}`} key={x.id}><div className="opportunityHeader"><strong>{x.market}</strong><span>{x.strength==="fort"?"Priorité forte":x.strength==="moyen"?"À explorer":"Exploratoire"}</span></div><p className="opportunitySignal">{x.signal}</p><div className="opportunityReason"><span>Pourquoi maintenant</span><p>{x.why}</p></div><div className="opportunityPlay"><span>Offre à tester</span><p>{x.play}</p></div>{x.id!=="different-profiles"&&<div className="opportunityPlay"><span>Vivier qualifié</span><p><strong>{x.counts.metier} métier</strong> · {x.counts.sectoriel} sectoriel · {x.counts.passerelle} passerelle forte</p></div>}</div>)}</div></div>
  <div className="card sectionCard"><div className="sectionHeader"><div><div className="eyebrow">SOURCES</div><h2>Études intégrées à l’Observatoire</h2></div></div><div className="opportunityGrid">{MARKET_SOURCES.map(s=><a className="opportunityCard" key={s.id} href={s.url} target="_blank" rel="noreferrer"><div className="opportunityHeader"><strong>{s.title}</strong><span>{s.kind}</span></div><p className="opportunitySignal">{s.scope}</p><div className="opportunityPlay"><span>Mise à jour</span><p>{s.publishedAt} · consulter la source ↗</p></div></a>)}</div></div>
  <div className="grid sectionGrid"><div className="card"><div className="eyebrow">BOUCLE STRATÉGIQUE</div><h2>Marché → profondeur du vivier → candidat → action</h2><p className="muted">La priorité n’est plus de maximiser le nombre de rapprochements, mais de faire ressortir les quelques passerelles suffisamment crédibles pour justifier l’ouverture du CV.</p><Link href="/talent" className="btn secondary">Analyser le vivier en détail</Link></div><div className="card"><div className="eyebrow">MÉTHODE</div><h2>Trois preuves, trois niveaux.</h2><p className="muted">Métier démontré : intitulés ou compétences métier explicites. Expérience sectorielle : environnement du secteur détecté dans le CV. Passerelle forte : plusieurs marqueurs fonctionnels spécifiques. Les signaux faibles restent hors de la sélection.</p></div></div>
 </>;
}
