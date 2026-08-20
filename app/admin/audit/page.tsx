import { prisma } from "../../lib/db";
import { requireAdmin } from "../../lib/auth";

export const dynamic="force-dynamic";

export default async function AuditPage(){
 const admin=await requireAdmin();
 const logs=await prisma.auditLog.findMany({where:{organizationId:admin.organizationId},include:{user:{select:{fullName:true,email:true}}},orderBy:{createdAt:"desc"},take:200});
 return <div className="card"><div className="sectionHeader"><div><div className="eyebrow">SÉCURITÉ</div><h1>Journal d'audit</h1><p className="muted">200 dernières actions enregistrées pour {admin.organization.name}.</p></div></div>{logs.length===0?<p className="muted">Aucune action enregistrée.</p>:<div className="tableWrap"><table><thead><tr><th>Date</th><th>Utilisateur</th><th>Action</th><th>Objet</th><th>Détails</th></tr></thead><tbody>{logs.map(log=><tr key={log.id}><td>{log.createdAt.toLocaleString("fr-FR")}</td><td>{log.user?.fullName||"Système"}<div className="muted small">{log.user?.email||""}</div></td><td><strong>{log.action}</strong></td><td>{log.entityType||"—"}{log.entityId&&<div className="muted small">{log.entityId}</div>}</td><td>{log.details||"—"}</td></tr>)}</tbody></table></div>}</div>;
}
