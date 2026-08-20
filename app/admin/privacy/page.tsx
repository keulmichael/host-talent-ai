import Link from "next/link";
import { prisma } from "../../lib/db";
import { requireAdmin } from "../../lib/auth";
import RetentionSettings from "./RetentionSettings";

export const dynamic="force-dynamic";

export default async function PrivacyPage(){
 const admin=await requireAdmin();
 const organization=await prisma.organization.findUnique({where:{id:admin.organizationId}});
 const now=new Date(); const d30=new Date(now.getTime()+30*86400000); const d90=new Date(now.getTime()+90*86400000);
 const [expired,soon30,soon90,withoutDate,stored]=await Promise.all([
  prisma.candidate.findMany({where:{organizationId:admin.organizationId,retentionUntil:{lt:now}},orderBy:{retentionUntil:"asc"},take:100}),
  prisma.candidate.count({where:{organizationId:admin.organizationId,retentionUntil:{gte:now,lte:d30}}}),
  prisma.candidate.count({where:{organizationId:admin.organizationId,retentionUntil:{gt:d30,lte:d90}}}),
  prisma.candidate.count({where:{organizationId:admin.organizationId,retentionUntil:null}}),
  prisma.candidate.count({where:{organizationId:admin.organizationId,filePathname:{not:null}}})
 ]);
 return <>
  <div className="hero"><div><div className="eyebrow">CONFIDENTIALITÉ · V1.7</div><h1>Conservation des données candidats</h1><p className="muted">Pilotage de la durée de conservation, des échéances et du stockage des CV pour {admin.organization.name}.</p></div></div>
  <div className="grid"><div className="card"><div className="muted">Échéances dépassées</div><div className="score">{expired.length}</div></div><div className="card"><div className="muted">Dans les 30 jours</div><div className="score">{soon30}</div></div><div className="card"><div className="muted">Entre 31 et 90 jours</div><div className="score">{soon90}</div></div><div className="card"><div className="muted">CV privés stockés</div><div className="score">{stored}</div></div></div>
  <div className="grid" style={{marginTop:16}}><div className="card"><h2>Politique par défaut</h2><p className="muted">Cette durée est appliquée aux nouveaux imports lorsqu'une autre durée n'est pas choisie. Elle ne remplace pas l'analyse juridique propre au cabinet.</p><RetentionSettings current={organization?.retentionMonths||24}/>{withoutDate>0&&<p className="warningText">{withoutDate} candidat(s) n'ont pas encore de date de conservation.</p>}</div><div className="card"><h2>Stockage privé</h2><p className="muted">Les nouveaux fichiers originaux sont stockés dans Vercel Blob uniquement si un store privé est connecté au projet. Le téléchargement passe par une route authentifiée et les accès sont journalisés.</p><p><strong>{process.env.BLOB_READ_WRITE_TOKEN?"Stockage Blob détecté":"Stockage Blob non configuré"}</strong></p></div></div>
  <div className="card" style={{marginTop:16}}><div className="sectionHeader"><div><h2>Profils à revoir</h2><p className="muted">Échéance de conservation dépassée. Aucun effacement n'est automatique : un administrateur doit vérifier le dossier puis agir depuis la fiche candidat.</p></div></div>{expired.length===0?<p className="muted">Aucune échéance dépassée.</p>:<div className="tableWrap"><table><thead><tr><th>Candidat</th><th>E-mail</th><th>Échéance</th><th>Origine</th><th>Fichier</th><th></th></tr></thead><tbody>{expired.map(c=><tr key={c.id}><td><strong>{c.fullName}</strong></td><td>{c.email||"—"}</td><td className="warningText">{c.retentionUntil?.toLocaleDateString("fr-FR")||"—"}</td><td>{c.dataSource}</td><td>{c.filePathname?"Privé":"Texte seulement"}</td><td><Link href={`/candidates/${c.id}`}>Examiner →</Link></td></tr>)}</tbody></table></div>}</div>
 </>;
}
