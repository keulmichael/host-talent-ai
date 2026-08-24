"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";

const steps=[
  {
    title:"Comprendre la mission",
    ai:"Host Talent AI structure le besoin client et prépare automatiquement les critères qui serviront au matching.",
    gain:"Vous partez d’un besoin exploitable immédiatement, sans relire manuellement tout le vivier.",
  },
  {
    title:"Voir les candidats détectés",
    ai:"Le moteur compare la mission à tous les CV du vivier, classe les correspondances et explique les écarts.",
    gain:"Vous réduisez le volume à quelques profils réellement pertinents au lieu d’examiner chaque CV.",
  },
  {
    title:"Examiner le meilleur profil",
    ai:"L’IA expose le score, les preuves trouvées et les points qui restent à confirmer. Elle ne prend pas la décision finale.",
    gain:"Le recruteur comprend immédiatement pourquoi un profil remonte et garde la maîtrise de la sélection.",
  },
  {
    title:"Passer à l’action",
    ai:"Short-list, contact, entretien et préqualification disponibilité/rémunération sont reliés au même dossier candidat.",
    gain:"Vous transformez l’analyse en workflow opérationnel sans ressaisie ni perte de contexte.",
  },
  {
    title:"Transformer le vivier en observatoire",
    ai:"Host Talent AI agrège les compétences, tensions et écarts entre missions et candidats disponibles.",
    gain:"Votre vivier devient une source d’intelligence commerciale pour détecter pénuries, opportunités et nouveaux marchés.",
  }
];

export default function DemoGuide({missionId,candidateId}:{missionId?:string|null;candidateId?:string|null}){
  const path=usePathname();
  const hrefs=[missionId?`/jobs/${missionId}`:"/jobs",missionId?`/jobs/${missionId}/compare`:"/jobs",candidateId?`/candidates/${candidateId}`:"/candidates","/pipeline","/talent"];
  let index=0;
  if(path.includes("/compare"))index=1;
  else if(candidateId&&path===`/candidates/${candidateId}`)index=2;
  else if(path.startsWith("/pipeline")||path.startsWith("/prequalifications"))index=3;
  else if(path.startsWith("/talent"))index=4;
  else if(path.startsWith("/jobs/"))index=0;
  const current=steps[index];
  const next=index<4?hrefs[index+1]:"/demo";
  const previous=index>0?hrefs[index-1]:"/demo";
  return <section className="card sectionCard" style={{marginBottom:18,border:"2px solid #c7d2fe",background:"linear-gradient(135deg,#fff,#f7f7ff)"}}>
    <div className="sectionHeader"><div><div className="eyebrow">DÉMONSTRATION GUIDÉE · ÉTAPE {index+1}/5</div><h2>{current.title}</h2><p className="muted">Scénario : votre client recherche un <strong>Responsable CRM & Marketing Automation</strong>. Voyons comment Host Talent AI exploite un vivier existant pour trouver et activer les meilleurs profils.</p></div><Link className="btn secondary" href="/">Explorer librement</Link></div>
    <div className="criteriaGrid" style={{marginTop:12}}>
      <div><strong>Ce que fait Host Talent AI</strong><p className="muted">{current.ai}</p></div>
      <div><strong>Ce que le cabinet y gagne</strong><p className="muted">{current.gain}</p></div>
    </div>
    <div className="actions" style={{marginTop:12}}><Link className="btn secondary" href={previous}>← Précédent</Link><Link className="btn" href={hrefs[index]}>Voir cette étape dans l’application</Link>{index<4?<Link className="btn secondary" href={next}>Suivant →</Link>:<Link className="btn secondary" href="/demo">Terminer la démo →</Link>}</div>
  </section>;
}
