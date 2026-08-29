import Link from "next/link";
import {requireUser} from "../lib/auth";
import {BMO_HEADLINES,BMO_TENSION_METIERS,MARKET_OPPORTUNITIES,MARKET_SOURCES,OFFER_HEADLINES,OFFER_SECTOR_EVOLUTION} from "../lib/externalMarketTrends";
import {DivergingBars,HorizontalBars} from "../components/InsightCharts";
export const dynamic="force-dynamic";

function trendTone(direction:string){return direction==="up"?"marketUp":direction==="down"?"marketDown":direction==="alert"?"marketAlert":"marketStable"}
function opportunityTone(strength:string){return strength==="fort"?"opportunityStrong":strength==="moyen"?"opportunityMedium":"opportunityExplore"}

export default async function MarketObservatory(){
 await requireUser();
 return <>
  <div className="hero"><div><div className="eyebrow">V2.9 · OBSERVATOIRE GÉNÉRAL</div><h1>Lire le marché avant de choisir où recruter.</h1><p className="muted">L’Observatoire fusionne désormais intentions d’embauche, offres réellement diffusées et tendances complémentaires pour faire émerger les secteurs, métiers et territoires à surveiller.</p></div><div className="actions"><Link className="btn secondary" href="/talent">Observatoire Talent</Link><Link className="btn secondary" href="/jobs">Missions</Link></div></div>

  <div className="marketContextHero">
    <div><div className="eyebrow">MARCHÉ EXTERNE · FRANCE · 2026</div><h2>Trois angles pour comprendre l’emploi</h2><p><strong>BMO</strong> mesure ce que les employeurs prévoient de recruter. <strong>Les offres diffusées</strong> montrent ce qui arrive réellement sur le marché. Les études complémentaires apportent une lecture des transformations de fond. Le cabinet peut ainsi distinguer volume, tension et opportunité commerciale.</p></div>
    <div className="marketSource"><strong>Lecture croisée Host Talent AI</strong><span>France Travail BMO 2026 + offres T1 2026 + publications statistiques + Indeed Hiring Lab</span><span>Derniers chiffres intégrés : juillet 2026</span></div>
  </div>

  <div className="sectionDivider">Intentions d’embauche · BMO 2026</div>
  <div className="marketTrendGrid">{BMO_HEADLINES.map(x=><div className={`marketTrendCard ${trendTone(x.direction)}`} key={x.id}><div className="marketTrendTop"><span className="marketDot"/><span>{x.title}</span></div><div className="marketValue">{x.value}</div><p>{x.context}</p><div className="marketImplication"><strong>Lecture cabinet</strong><span>{x.implication}</span></div></div>)}</div>

  <div className="grid sectionGrid">
    <HorizontalBars title="Métiers en tension dans BMO 2026" description="Part des projets de recrutement jugés difficiles. Le volume de projets est indiqué sous chaque métier." items={BMO_TENSION_METIERS}/>
    <div className="card sectionCard"><div className="eyebrow">SIGNAL STRUCTUREL</div><h2>Le manque de profils adéquats reste central</h2><p className="muted">Parmi les employeurs ayant suspendu, abandonné ou seulement partiellement réussi un recrutement en 2025, <strong>76,5 %</strong> citent l’absence de candidats adéquats. En parallèle, <strong>43,3 %</strong> des établissements ayant recruté ont élargi leur recherche à des profils différents de ceux visés au départ.</p><div className="opsPanel"><strong>Implication pour un cabinet</strong><p className="muted">La valeur n’est pas seulement de trouver plus de CV : elle est aussi de détecter des compétences transférables, réactiver un vivier et argumenter des profils non évidents auprès du client.</p></div></div>
  </div>

  <div className="sectionDivider">Marché observé · offres diffusées T1 2026</div>
  <div className="marketTrendGrid">{OFFER_HEADLINES.map(x=><div className={`marketTrendCard ${trendTone(x.direction)}`} key={x.id}><div className="marketTrendTop"><span className="marketDot"/><span>{x.title}</span></div><div className="marketValue">{x.value}</div><p>{x.context}</p><div className="marketImplication"><strong>Lecture cabinet</strong><span>{x.implication}</span></div></div>)}</div>

  <div className="grid sectionGrid">
    <DivergingBars title="Évolution sectorielle des offres" description="Variation annuelle des offres diffusées par France Travail au 1er trimestre 2026. À gauche : recul ; à droite : croissance." items={OFFER_SECTOR_EVOLUTION}/>
    <div className="card sectionCard"><div className="eyebrow">CONTRATS & GÉOGRAPHIE</div><h2>Un marché plus flexible et plus territorial</h2><p className="muted">63,0 % des offres diffusées portent encore sur des contrats durables, mais cette part recule de 6,6 points en un an. Dans le même temps, 60 départements sur 100 affichent une baisse annuelle du volume d’offres ; Paris recule de 7,0 %.</p><div className="opsPanel"><strong>Implication pour un cabinet</strong><p className="muted">Le positionnement doit pouvoir varier selon le bassin d’emploi et le type de contrat : CDI, CDD, intérim ou freelance ne suivent plus exactement la même dynamique.</p></div></div>
  </div>

  <div className="card sectionCard marketOpportunitySection"><div className="sectionHeader"><div><div className="eyebrow">DÉVELOPPEMENT COMMERCIAL</div><h2>Marchés à tester pour le cabinet</h2><p className="muted">Les pistes ci-dessous ne sont pas des prévisions automatiques. Elles résultent du croisement entre volume d’embauche, tension, évolution des offres et comportements des employeurs.</p></div></div><div className="opportunityGrid">{MARKET_OPPORTUNITIES.map(x=><div className={`opportunityCard ${opportunityTone(x.strength)}`} key={x.id}><div className="opportunityHeader"><strong>{x.market}</strong><span>{x.strength==="fort"?"Priorité forte":x.strength==="moyen"?"À explorer":"Exploratoire"}</span></div><p className="opportunitySignal">{x.signal}</p><div className="opportunityReason"><span>Pourquoi maintenant</span><p>{x.why}</p></div><div className="opportunityPlay"><span>Offre à tester</span><p>{x.play}</p></div></div>)}</div></div>

  <div className="card sectionCard"><div className="sectionHeader"><div><div className="eyebrow">SOURCES</div><h2>Études intégrées à l’Observatoire</h2><p className="muted">Chaque source mesure une réalité différente. Elles sont affichées séparément pour éviter de confondre intentions, offres publiées et interprétations.</p></div></div><div className="opportunityGrid">{MARKET_SOURCES.map(s=><a className="opportunityCard" key={s.id} href={s.url} target="_blank" rel="noreferrer"><div className="opportunityHeader"><strong>{s.title}</strong><span>{s.kind}</span></div><p className="opportunitySignal">{s.scope}</p><div className="opportunityPlay"><span>Mise à jour</span><p>{s.publishedAt} · consulter la source ↗</p></div></a>)}</div></div>

  <div className="grid sectionGrid"><div className="card"><div className="eyebrow">DEUX OBSERVATOIRES</div><h2>Marché externe puis marché du cabinet</h2><p className="muted">L’Observatoire général détecte les mouvements externes. L’Observatoire Talent doit ensuite vérifier si votre propre vivier contient déjà les compétences permettant de répondre à ces marchés.</p><Link href="/talent" className="btn secondary">Comparer avec le vivier du cabinet</Link></div><div className="card"><div className="eyebrow">MÉTHODE</div><h2>Des signaux, pas des certitudes.</h2><p className="muted">BMO mesure des intentions ; les offres diffusées mesurent des publications ; les recommandations Host Talent AI sont une interprétation commerciale de ces données. Une baisse d’offres ne signifie donc pas automatiquement une baisse du besoin réel, et une forte tension ne garantit pas un marché rentable pour chaque cabinet.</p></div></div>
 </>;
}
