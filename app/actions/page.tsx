import Link from "next/link";
import {prisma} from "../lib/db";
import {requireUser} from "../lib/auth";
import ActivityButtons from "../ActivityButtons";

export const dynamic="force-dynamic";
function dueFor(a:{dueAt:Date|null;createdAt:Date;type:string},candidateHours:number,interviewHours:number){if(a.dueAt)return a.dueAt;const h=["INTERVIEW","POST_INTERVIEW"].includes(a.type)?interviewHours:candidateHours;return new Date(a.createdAt.getTime()+h*3600000)}
function typeLabel(t:string){return({RECEIPT:"Accusé de réception",CONTACT:"Prise de contact",FOLLOW_UP:"Relance / suivi",INTERVIEW:"Entretien / RDV",POST_INTERVIEW:"Suivi post-entretien",NOTE:"Note interne"} as Record<string,string>)[t]||t}

export default async function ActionsPage(){
 const user=await requireUser();const now=new Date();
 const [org,activities,shares]=await Promise.all([
  prisma.organization.findUnique({where:{id:user.organizationId}}),
  prisma.candidateActivity.findMany({where:{organizationId:user.organizationId,status:"PLANNED"},include:{candidate:true,match:{include:{job:true}}},orderBy:{createdAt:"asc"}}),
  prisma.clientShare.findMany({where:{organizationId:user.organizationId,active:true,expiresAt:{gt:now}},include:{job:true,feedbacks:true},orderBy:{createdAt:"asc"}})
 ]);
 if(!org)return null;
 const prepared=activities.map(a=>({...a,effectiveDue:dueFor(a,org.candidateResponseSlaHours,org.interviewFollowupSlaHours)})).sort((a,b)=>a.effectiveDue.getTime()-b.effectiveDue.getTime());
 const overdue=prepared.filter(a=>a.effectiveDue<now),upcoming=prepared.filter(a=>a.effectiveDue>=now);
 const clientLimit=org.clientFeedbackSlaHours*3600000;
 const clientRisks=shares.filter(s=>s.feedbacks.length===0&&now.getTime()-s.createdAt.getTime()>clientLimit);
 return <>
  <div className="hero"><div><div className="eyebrow">V2.2 · CENTRE D'ACTIONS</div><h1>Orchestration relationnelle</h1><p className="muted">Une file de travail universelle, indépendante de la messagerie ou de l'ATS utilisé par le cabinet.</p></div><div className="actions">{user.role==="ADMIN"&&<Link className="btn secondary" href="/admin/automation">Configurer modèles, SLA et connecteurs</Link>}</div></div>
  <div className="grid"><div className="card"><div className="muted">Actions planifiées</div><div className="score">{prepared.length}</div></div><div className="card"><div className="muted">SLA dépassés</div><div className="score">{overdue.length}</div></div><div className="card"><div className="muted">Retours client à relancer</div><div className="score">{clientRisks.length}</div></div></div>
  <div className="card" style={{marginTop:16}}><h2>Priorités et relances</h2><p className="muted">Quand aucune échéance n'est saisie, Host Talent AI applique le SLA du cabinet : {org.candidateResponseSlaHours} h pour les échanges candidat et {org.interviewFollowupSlaHours} h après entretien.</p>{prepared.length===0?<p className="muted">Aucune action relationnelle planifiée.</p>:prepared.map(a=>{const late=a.effectiveDue<now;return <div className="listRow" key={a.id}><div><strong>{a.candidate.fullName} · {typeLabel(a.type)}</strong><div className={late?"warningText":"muted small"}>{a.match?.job.title||"Hors mission"} · {a.channel} · échéance {a.effectiveDue.toLocaleString("fr-FR")}{late?" · SLA dépassé":""}</div>{a.subject&&<div className="small">{a.subject}</div>}</div><ActivityButtons id={a.id} canDispatch={a.type!=="NOTE"}/></div>})}</div>
  <div className="card" style={{marginTop:16}}><h2>SLA retour client</h2><p className="muted">Alerte après {org.clientFeedbackSlaHours} h sans retour sur un portail client actif.</p>{clientRisks.length===0?<p className="muted">Aucun portail client sans retour au-delà du SLA.</p>:clientRisks.map(s=><div className="listRow" key={s.id}><div><strong>{s.job.title}</strong><div className="warningText small">Aucun retour client depuis {s.createdAt.toLocaleString("fr-FR")}</div></div><Link className="btn secondary" href={`/jobs/${s.jobId}/shares`}>Ouvrir le portail</Link></div>)}</div>
 </>;
}
