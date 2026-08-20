"use client";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function NewCandidatePage(){
 const router=useRouter();
 const[loading,setLoading]=useState(false);
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setLoading(true);
  const res=await fetch("/api/candidates",{method:"POST",body:new FormData(e.currentTarget)});
  const data=await res.json().catch(()=>({}));setLoading(false);
  if(res.ok) router.push(`/candidates/${data.id}`); else alert(data.error||"Import impossible");
 }
 return <div className="card"><div className="eyebrow">IMPORT SÉCURISÉ · V1.7</div><h1>Importer un candidat</h1><p className="muted">Le texte du CV sert au matching. Si le stockage privé Vercel Blob est activé, le fichier original est conservé séparément et n'est accessible qu'aux utilisateurs du cabinet.</p><form onSubmit={submit}>
  <div className="grid"><div className="field"><label>Nom<input name="fullName" required/></label></div><div className="field"><label>Localisation<input name="location"/></label></div></div>
  <div className="field"><label>CV PDF, DOCX ou TXT<input type="file" name="file" accept=".pdf,.docx,.txt"/></label><span className="muted small">10 Mo maximum.</span></div>
  <div className="field"><label>Ou texte du CV<textarea name="rawText"/></label></div>
  <div className="grid"><div className="field"><label>Origine du profil<select name="dataSource" defaultValue="CV_IMPORT"><option value="CV_IMPORT">CV reçu/importé</option><option value="DIRECT_APPLICATION">Candidature directe</option><option value="SOURCING">Sourcing</option><option value="REFERRAL">Cooptation / recommandation</option><option value="ATS_IMPORT">Import ATS/CRM</option><option value="OTHER">Autre</option></select></label></div><div className="field"><label>Durée de conservation<select name="retentionMonths" defaultValue="24"><option value="6">6 mois</option><option value="12">12 mois</option><option value="18">18 mois</option><option value="24">24 mois</option><option value="36">36 mois</option><option value="48">48 mois</option><option value="60">60 mois</option></select></label></div></div>
  <div className="field"><label>Note confidentialité / justification<textarea name="privacyNote" placeholder="Ex. candidature à la mission X, accord de conservation reçu, source du sourcing…"/></label></div>
  <button className="btn" disabled={loading}>{loading?"Analyse et import…":"Importer et analyser"}</button>
 </form></div>;
}
