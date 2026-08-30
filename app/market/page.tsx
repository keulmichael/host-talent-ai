import Link from "next/link";
import {prisma} from "../lib/db";
import {requireUser} from "../lib/auth";
import {BMO_HEADLINES,BMO_TENSION_METIERS,MARKET_OPPORTUNITIES,MARKET_SOURCES,OFFER_HEADLINES,OFFER_SECTOR_EVOLUTION} from "../lib/externalMarketTrends";
import {DivergingBars,HorizontalBars} from "../components/InsightCharts";
export const dynamic="force-dynamic";

function trendTone(direction:string){return direction==="up"?"marketUp":direction==="down"?"marketDown":direction==="alert"?"marketAlert":"marketStable"}
function opportunityTone(strength:string){return strength==="fort"?"opportunityStrong":strength==="moyen"?"opportunityMedium":"opportunityExplore"}
const MARKET_KEYWORDS:Record<string,string[]>={
 health:["sante","santé","soin","aide a domicile","aide à domicile","auxiliaire de vie","infirm","aide-soignant","medical","médical","medico","médico"],
 construction:["btp","construction","chantier","batiment","bâtiment","macon","maçon","electric","électric","plomb","second oeuvre","second œuvre","conducteur de travaux"],
 "industry-logistics":["industrie","industriel","maintenance","logistique","transport","supply chain","production","technicien","mecan","mécan","entrepot","entrepôt"],
 "high-volume":["hotel","hôtel","hotellerie","hôtellerie","restauration","restaurant","cuisine","cuisinier","serveur","tourisme","saisonnier"],
 "different-profiles":[],
 "ai-white-collar":["intelligence artificielle"," ia ","chatgpt","llm","automatisation","automation","prompt","copilot","machine learning","data","digital","marketing","rh","ressources humaines"]
};
function norm(v:string){return v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")}
function candidateText(c:{skills:string[];rawText:string|null}){return norm(`${c.skills.join(" ")} ${c.rawText||""}`)}
function marketFit(id:string,text:string){const words=(MARKET_KEYWORDS[id]||[]).map(norm);return words.length>0&&words.some(k=>text.includes(k))}

export default async function MarketObservatory(){
 const user=await requireUser();
 const candidates=await prisma.candidate.findMany({where:{organizationId:user.organizationId},select:{id:true,skills:true,rawText:true}});
 const candidateTexts=candidates.map(c=>({id:c.id,text:candidateText(c)}));
 const marketFit=MARKET_OPPORTUNITIES.map(o=>{
  const compatible=o.id==="different-profiles"?0:candidateTexts.filter(c=>marketFitFn(o.id,c.text)).length;
  const rate=candidates.length?Math.round(compatible/candidates.length*100):0;
  return {...o,compatible,rate};
 });
 function marketFitFn(id:string,text:string){const words=(MARKET_KEYWORDS[id]||[]).map(norm);return words.length>0&&words.some(k=>text.includes(k))}
 const actionable=marketFit.filter(x=>x.compatible>0).sort((a,b)=>b.compatible-a.compatible);
 return <>
  <div className="hero"><div><div className="eyebrow">V3.0 · OBSERVATOIRE GÉNÉRAL</div><h1>Lire le marché et mesurer immédiatement la capacité du vivier.</h1><p className="muted">L’Observatoire croise désormais les signaux externes France Travail / Indeed avec les compétences réellement présentes dans le vivier du cabinet.</p></div><div className="actions"><Link className="btn secondary" href="/talent">Observatoire Talent</Link><Link className="btn secondary" href="/jobs">Missions</Link></div></div>

  <div className="marketContextHero"><div><div className="eyebrow">MARCHÉ EXTERNE · FRANCE · 2026</div><h2>Trois angles pour comprendre l’emploi</h2><p><strong>BMO</strong> mesure ce que les employeurs prévoient de recruter. <strong>Les offres diffusées</strong> montrent ce qui arrive réellement sur le marché. Les études complémentaires apportent une lecture des transformations de fond.</p></div><div className="marketSource"><strong>Lecture croisée Host Talent AI</strong><span>France Travail BMO 2026 + offres T1 2026 + publications statistiques + Indeed Hiring Lab</span><span>Derniers chiffres intégrés : juillet 2026</span></div></div>

  <div className="sectionDivider">Intentions d’embauche · BMO 2026</div>
  <div className="marketTrendGrid">{BMO_HEADLINES.map(x=><div className={`marketTrendCard ${trendTone(x.direction)}`} key={x.id}><div className="marketTrendTop"><span className="marketDot"/><span>{x.title}</span></div><div className="marketValue">{x.value}</div><p>{x.context}</p><div className="marketImplication"><strong>Lecture cabinet</strong><span>{x.implication}</span></div></div>)}</div>

  <div className="grid sectionGrid"><HorizontalBars title="Métiers en tension dans BMO 2026" description="Part des projets de recrutement jugés difficiles. Le volume de projets est indiqué sous chaque métier." items={BMO_TENSION_METIERS}/><div className="card sectionCard"><div className="eyebrow">SIGNAL STRUCTUREL</div><h2>Le manque de profils adéquats reste central</h2><p className="muted">76,5 % des employeurs ayant suspendu, abandonné ou seulement partiellement réussi un recrutement citent l’absence de candidats adéquats. 43,3 % ont élargi leur recherche à des profils différents.</p><div className="opsPanel"><strong>Implication pour un cabinet</strong><p className="muted">La valeur se déplace aussi vers les compétences transférables, la réactivation du vivier et les profils non évidents.</p></div></div></div>

  <div className="sectionDivider">Marché observé · offres diffusées T1 2026</div>
  <div className="marketTrendGrid">{OFFER_HEADLINES.map(x=><div className={`marketTrendCard ${trendTone(x.direction)}`} key={x.id}><div className="marketTrendTop"><span className="marketDot"/><span>{x.title}</span></div><div className="marketValue">{x.value}</div><p>{x.context}</p><div className="marketImplication"><strong>Lecture cabinet</strong><span>{x.implication}</span></div></div>)}</div>
  <div className="grid sectionGrid"><DivergingBars title="Évolution sectorielle des offres" description="Variation annuelle des offres diffusées par France Travail au 1er trimestre 2026." items={OFFER_SECTOR_EVOLUTION}/><div className="card sectionCard"><div className="eyebrow">CONTRATS & GÉOGRAPHIE</div><h2>Un marché plus flexible et plus territorial</h2><p className="muted">63,0 % des offres portent encore sur des contrats durables, mais cette part recule de 6,6 points. 60 départements sur 100 sont en baisse ; Paris recule de 7,0 %.</p></div></div>

  <div className="sectionDivider">Marché externe × vivier interne</div>
  <div className="card sectionCard"><div className="sectionHeader"><div><div className="eyebrow">CAPACITÉ COMMERCIALE IMMÉDIATE</div><h2>Quels marchés le cabinet peut-il déjà adresser ?</h2><p className="muted">Détection déterministe par présence de compétences et termes métier dans les CV. Ce rapprochement signale un potentiel à vérifier humainement ; il ne certifie ni l’aptitude à un poste précis ni la disponibilité du candidat.</p></div></div><div className="kpiGrid"><div className="card kpiCard"><div className="muted">CV analysés</div><div className="score">{candidates.length}</div></div><div className="card kpiCard"><div className="muted">Marchés avec vivier détecté</div><div className="score">{actionable.length}</div></div><div className="card kpiCard"><div className="muted">Meilleur vivier sectoriel</div><div className="score">{actionable[0]?.compatible||0}</div><div className="small muted">{actionable[0]?.market||"Aucun signal"}</div></div></div><div className="tableWrap"><table><thead><tr><th>Marché externe</th><th>Priorité marché</th><th>CV compatibles détectés</th><th>Part du vivier</th><th>Lecture commerciale</th></tr></thead><tbody>{marketFit.filter(x=>x.id!=="different-profiles").map(x=><tr key={x.id}><td><strong>{x.market}</strong></td><td>{x.strength==="fort"?"Forte":x.strength==="moyen"?"À explorer":"Exploratoire"}</td><td><strong>{x.compatible}</strong></td><td>{x.rate} %</td><td>{x.compatible>=5?"Vivier déjà exploitable : marché à tester commercialement.":x.compatible>0?"Premiers profils présents : potentiel à qualifier.":"Pas de vivier détecté : sourcing nécessaire avant prospection spécialisée."}</td></tr>)}</tbody></table></div></div>

  <div className="card sectionCard marketOpportunitySection"><div className="sectionHeader"><div><div className="eyebrow">DÉVELOPPEMENT COMMERCIAL</div><h2>Marchés à tester pour le cabinet</h2><p className="muted">Les opportunités externes sont maintenant accompagnées d’un indicateur de capacité interne.</p></div></div><div className="opportunityGrid">{marketFit.map(x=><div className={`opportunityCard ${opportunityTone(x.strength)}`} key={x.id}><div className="opportunityHeader"><strong>{x.market}</strong><span>{x.strength==="fort"?"Priorité forte":x.strength==="moyen"?"À explorer":"Exploratoire"}</span></div><p className="opportunitySignal">{x.signal}</p><div className="opportunityReason"><span>Pourquoi maintenant</span><p>{x.why}</p></div><div className="opportunityPlay"><span>Offre à tester</span><p>{x.play}</p></div>{x.id!=="different-profiles"&&<div className="opportunityPlay"><span>Vivier détecté</span><p><strong>{x.compatible} CV</strong> · {x.rate} % du vivier actuel</p></div>}</div>)}</div></div>

  <div className="card sectionCard"><div className="sectionHeader"><div><div className="eyebrow">SOURCES</div><h2>Études intégrées à l’Observatoire</h2></div></div><div className="opportunityGrid">{MARKET_SOURCES.map(s=><a className="opportunityCard" key={s.id} href={s.url} target="_blank" rel="noreferrer"><div className="opportunityHeader"><strong>{s.title}</strong><span>{s.kind}</span></div><p className="opportunitySignal">{s.scope}</p><div className="opportunityPlay"><span>Mise à jour</span><p>{s.publishedAt} · consulter la source ↗</p></div></a>)}</div></div>

  <div className="grid sectionGrid"><div className="card"><div className="eyebrow">BOUCLE STRATÉGIQUE</div><h2>Marché → vivier → action commerciale</h2><p className="muted">Un marché externe attractif peut désormais être confronté immédiatement aux CV disponibles. L’Observatoire Talent reste l’espace de référence pour analyser finement tensions, matchings et compétences.</p><Link href="/talent" className="btn secondary">Analyser le vivier en détail</Link></div><div className="card"><div className="eyebrow">MÉTHODE</div><h2>Un signal de compatibilité, pas une décision.</h2><p className="muted">Le rapprochement sectoriel utilise uniquement les compétences et le texte des CV. Il sert à révéler un potentiel commercial. La qualification finale du candidat et du marché reste humaine.</p></div></div>
 </>;
}
