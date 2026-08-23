import Link from "next/link";
import {requireUser} from "../lib/auth";
import {EXTERNAL_TRENDS,INDEED_2026_SOURCE,MARKET_OPPORTUNITIES} from "../lib/externalMarketTrends";
import {DivergingBars,HorizontalBars} from "../components/InsightCharts";
export const dynamic="force-dynamic";

function trendTone(direction:string){return direction==="up"?"marketUp":direction==="down"?"marketDown":direction==="alert"?"marketAlert":"marketStable"}
function opportunityTone(strength:string){return strength==="fort"?"opportunityStrong":strength==="moyen"?"opportunityMedium":"opportunityExplore"}
function pctValue(value:string){const n=Number(value.replace("%","").replace("+","").replace(/\s/g,"").replace(",","."));return Number.isFinite(n)?n:0}

export default async function MarketObservatory(){
 await requireUser();
 const offerTrendIds=new Set(["offers-fr","health-home","tech-dev","apprenticeship"]);
 const applicationPressureIds=new Set(["it-support","hospitality"]);
 const offerTrends=EXTERNAL_TRENDS.filter(x=>offerTrendIds.has(x.id)).map(x=>({label:x.title,value:pctValue(x.value),meta:x.context}));
 const applicationPressure=EXTERNAL_TRENDS.filter(x=>applicationPressureIds.has(x.id)).map(x=>({label:x.title,value:pctValue(x.value),meta:"Hausse des candidatures moyennes par offre"}));
 return <>
  <div className="hero"><div><div className="eyebrow">V2.7 · OBSERVATOIRE GÉNÉRAL</div><h1>Comprendre les mouvements du marché de l’emploi.</h1><p className="muted">Une lecture claire des tendances générales de l’emploi pour aider le cabinet à identifier de nouveaux marchés, adapter son positionnement et anticiper ses priorités commerciales.</p></div><div className="actions"><Link className="btn secondary" href="/talent">Observatoire Talent</Link><Link className="btn secondary" href="/jobs">Missions</Link></div></div>

  <div className="marketContextHero">
    <div><div className="eyebrow">MARCHÉ EXTERNE · FRANCE</div><h2>Tendances générales de l’emploi</h2><p>Ces signaux proviennent d’études publiques et servent à replacer l’activité du cabinet dans son environnement économique.</p></div>
    <div className="marketSource"><strong>{INDEED_2026_SOURCE.title}</strong><span>{INDEED_2026_SOURCE.scope}</span><span>Publié le {INDEED_2026_SOURCE.publishedAt}</span><a href={INDEED_2026_SOURCE.url} target="_blank" rel="noreferrer">Consulter l’étude source ↗</a></div>
  </div>

  <div className="grid sectionGrid">
    <DivergingBars title="Évolution du volume d’offres" description="Variations sectorielles publiées dans l’étude. Les barres à gauche indiquent une baisse, celles à droite une hausse." items={offerTrends}/>
    <HorizontalBars title="Pression des candidatures" description="Hausse moyenne des candidatures par offre entre 2023 et 2025 pour les secteurs cités." items={applicationPressure}/>
  </div>

  <div className="marketTrendGrid">{EXTERNAL_TRENDS.map(x=><div className={`marketTrendCard ${trendTone(x.direction)}`} key={x.id}><div className="marketTrendTop"><span className="marketDot"/><span>{x.title}</span></div><div className="marketValue">{x.value}</div><p>{x.context}</p><div className="marketImplication"><strong>Lecture cabinet</strong><span>{x.implication}</span></div></div>)}</div>

  <div className="card sectionCard marketOpportunitySection"><div className="sectionHeader"><div><div className="eyebrow">DÉVELOPPEMENT COMMERCIAL</div><h2>Pistes de nouveaux marchés pour le cabinet</h2><p className="muted">Ces pistes traduisent les tendances générales en opportunités de spécialisation, de sourcing ou d’offre de service. Elles doivent être validées avec le portefeuille réel du cabinet.</p></div></div><div className="opportunityGrid">{MARKET_OPPORTUNITIES.map(x=><div className={`opportunityCard ${opportunityTone(x.strength)}`} key={x.id}><div className="opportunityHeader"><strong>{x.market}</strong><span>{x.strength==="fort"?"Priorité forte":x.strength==="moyen"?"À explorer":"Exploratoire"}</span></div><p className="opportunitySignal">{x.signal}</p><div className="opportunityReason"><span>Pourquoi maintenant</span><p>{x.why}</p></div><div className="opportunityPlay"><span>Offre à tester</span><p>{x.play}</p></div></div>)}</div></div>

  <div className="grid sectionGrid"><div className="card"><div className="eyebrow">LECTURE STRATÉGIQUE</div><h2>À quoi sert cet Observatoire ?</h2><p className="muted">Il ne mesure pas le vivier du cabinet. Il observe le contexte externe : secteurs qui progressent ou ralentissent, pression des candidatures, transformation des compétences et nouveaux espaces commerciaux.</p><Link href="/talent" className="btn secondary">Voir le marché interne du cabinet</Link></div><div className="card"><div className="eyebrow">SOURCE & PRUDENCE</div><h2>Des signaux, pas des certitudes.</h2><p className="muted">Les chiffres affichés sont datés et sourcés. Les recommandations commerciales sont des interprétations de Host Talent AI et non des prévisions certaines. L’Observatoire pourra accueillir ensuite d’autres sources comme France Travail, Apec, Dares ou Insee.</p></div></div>
 </>;
}
