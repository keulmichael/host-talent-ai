"use client";
import { useRouter } from "next/navigation";
import { ChangeEvent, useState } from "react";

type Result={name:string;ok:boolean;candidateId?:string;fullName?:string;error?:string};

export default function NewCandidatePage(){
 const router=useRouter();
 const[files,setFiles]=useState<File[]>([]);
 const[loading,setLoading]=useState(false);
 const[results,setResults]=useState<Result[]>([]);
 function select(e:ChangeEvent<HTMLInputElement>){setFiles(Array.from(e.target.files||[]));setResults([])}
 async function importAll(){
  if(!files.length)return;
  setLoading(true);setResults([]);
  const out:Result[]=[];
  for(const file of files){
   const fd=new FormData();fd.append("file",file);
   const res=await fetch("/api/candidates",{method:"POST",body:fd});
   const data=await res.json().catch(()=>({}));
   out.push(res.ok?{name:file.name,ok:true,candidateId:data.id,fullName:data.fullName}:{name:file.name,ok:false,error:data.error||"Import impossible"});
   setResults([...out]);
  }
  setLoading(false);
 }
 const success=results.filter(r=>r.ok).length;
 return <div className="card">
  <div className="eyebrow">IMPORT CV · MULTI-FICHIERS</div>
  <h1>Déposer les CV</h1>
  <p className="muted">Aucune fiche à remplir : sélectionne plusieurs PDF, DOCX ou TXT. Host Talent AI extrait automatiquement l'identité, l'e-mail, la localisation, l'expérience et les compétences, puis calcule les matchings avec les missions existantes.</p>
  <div className="field"><label>CV à importer<input type="file" multiple onChange={select} accept=".pdf,.docx,.txt" disabled={loading}/></label><span className="muted small">Plusieurs fichiers à la fois · 10 Mo maximum par CV.</span></div>
  {files.length>0&&<div className="card" style={{marginTop:16}}><strong>{files.length} CV sélectionné{files.length>1?"s":""}</strong><div className="muted small" style={{marginTop:8}}>{files.map(f=>f.name).join(" · ")}</div></div>}
  <div style={{display:"flex",gap:12,marginTop:18,flexWrap:"wrap"}}><button className="btn" onClick={importAll} disabled={loading||!files.length}>{loading?`Import en cours… (${results.length}/${files.length})`:`Importer et analyser ${files.length||"les"} CV`}</button>{results.length>0&&!loading&&<button className="btn secondary" onClick={()=>router.push("/candidates")}>Voir le vivier</button>}</div>
  {results.length>0&&<div style={{marginTop:22}}><h2>Résultats</h2>{results.map((r,i)=><div key={i} className="card" style={{marginTop:10,borderColor:r.ok?"rgba(46,160,100,.35)":"rgba(220,70,70,.35)"}}><strong>{r.ok?"✓":"✕"} {r.name}</strong><div className="muted small">{r.ok?`${r.fullName||"Candidat"} importé et analysé`:r.error}</div></div>)}{!loading&&<p className="muted">{success}/{results.length} CV importés avec succès.</p>}</div>}
 </div>;
}
