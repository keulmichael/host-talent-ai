import Link from "next/link";
import {redirect} from "next/navigation";
import {requireUser} from "../lib/auth";
import {prisma} from "../lib/db";

export const dynamic="force-dynamic";

export default async function DemoLanding(){
  const user=await requireUser();
  if(!user.organizationId.startsWith("demo-"))redirect("/");
  const [mission,candidate]=await Promise.all([
    prisma.job.findFirst({where:{organizationId:user.organizationId,title:"Responsable CRM & Marketing Automation"},select:{id:true,title:true,clientName:true,location:true}}),
    prisma.candidate.findFirst({where:{organizationId:user.organizationId,fullName:"Camille Renaud"},select:{id:true,fullName:true}})
  ]);
  const missionHref=mission?`/jobs/${mission.id}`:"/jobs";
  const compareHref=mission?`/jobs/${mission.id}/compare`:"/jobs";
  const candidateHref=candidate?`/candidates/${candidate.id}`:"/candidates";
  return <>
    <section className="dashboardHero" style={{marginBottom:22}}>
      <div><div className="eyebrow">V2.8 · DÉMONSTRATION CABINET</div><h1>Découvrez Host Talent AI en 5 minutes</h1><p className="muted" style={{maxWidth:850}}>Vous êtes recruteur. Votre client <strong>{mission?.clientName||"Maison Nova"}</strong> recherche un <strong>Responsable CRM & Marketing Automation</strong>. Votre vivier contient déjà des candidats. L’objectif de cette démonstration est de voir comment Host Talent AI transforme ce vivier en sélection exploitable, puis en intelligence marché.</p></div>
      <div className="heroActions"><Link className="btn" href={missionHref}>Commencer la démonstration →</Link><Link className="btn secondary" href="/">Explorer librement</Link></div>
    </section>

    <section className="card sectionCard" style={{marginBottom:22}}><div className="eyebrow">LE SCÉNARIO</div><h2>Ce que vous allez voir</h2><p className="muted">Aucune configuration n’est nécessaire. Les missions, CV et scores sont fictifs et isolés de tout autre compte.</p>
      <div className="criteriaGrid" style={{marginTop:16}}>
        <div><strong>1 · Comprendre le besoin</strong><p className="muted">Ouvrez la mission client et voyez les critères utilisés par le moteur.</p></div>
        <div><strong>2 · Réduire le volume</strong><p className="muted">Comparez les candidats automatiquement rapprochés de cette mission.</p></div>
        <div><strong>3 · Comprendre un profil</strong><p className="muted">Ouvrez {candidate?.fullName||"le meilleur candidat"} et voyez preuves, score et points à confirmer.</p></div>
        <div><strong>4 · Passer à l’action</strong><p className="muted">Observez short-list, pipeline et préqualification disponibilité/rémunération.</p></div>
        <div><strong>5 · Exploiter le vivier</strong><p className="muted">Terminez par l’Observatoire Talent pour identifier tensions et potentiel commercial.</p></div>
      </div>
    </section>

    <section className="card sectionCard"><div className="eyebrow">PARCOURS RAPIDE</div><h2>Vous pouvez aussi accéder directement à une étape</h2><div className="criteriaGrid" style={{marginTop:14}}>
      <Link className="featureTile" href={missionHref}><strong>Étape 1 · Mission CRM</strong><span>Besoin client et critères structurés.</span><em>Ouvrir →</em></Link>
      <Link className="featureTile" href={compareHref}><strong>Étape 2 · Comparatif</strong><span>Classement et réduction du volume.</span><em>Comparer →</em></Link>
      <Link className="featureTile" href={candidateHref}><strong>Étape 3 · Profil recommandé</strong><span>Pourquoi le candidat remonte.</span><em>Examiner →</em></Link>
      <Link className="featureTile" href="/pipeline"><strong>Étape 4 · Pipeline</strong><span>Transformer la sélection en actions.</span><em>Voir →</em></Link>
      <Link className="featureTile" href="/talent"><strong>Étape 5 · Observatoire Talent</strong><span>Transformer le vivier en intelligence.</span><em>Observer →</em></Link>
    </div></section>

    <section className="workflowStrip" style={{marginTop:22}}><div><strong>Analyser</strong><span>Le vivier entier</span></div><b>→</b><div><strong>Prioriser</strong><span>Les meilleurs profils</span></div><b>→</b><div><strong>Décider</strong><span>Avec preuves et contexte</span></div><b>→</b><div><strong>Activer</strong><span>Pipeline et préqualification</span></div><b>→</b><div><strong>Observer</strong><span>Le marché de votre vivier</span></div></section>
  </>;
}
