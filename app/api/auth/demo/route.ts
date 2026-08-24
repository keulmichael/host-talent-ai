import { NextResponse } from "next/server";
import { randomBytes, randomUUID } from "crypto";
import { prisma } from "../../../lib/db";
import { SESSION_COOKIE, hashPassword, hashSessionToken } from "../../../lib/auth";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

const jobs = [
  { title:"Responsable CRM & Marketing Automation", clientName:"Maison Nova", location:"Paris", description:"Piloter le CRM, les scénarios lifecycle et l'automatisation marketing.", mustHave:"CRM; marketing automation; Salesforce", shouldHave:"HubSpot; segmentation; reporting", optional:"SQL; CDP" },
  { title:"Consultant IA & Automatisation", clientName:"Nexa Conseil", location:"Paris / hybride", description:"Déployer des agents IA et automatiser des processus métiers.", mustHave:"IA générative; automatisation; API", shouldHave:"n8n; Make; Python", optional:"RAG; LangChain" },
  { title:"Lead SEO / GEO", clientName:"Altitude Digital", location:"Paris", description:"Piloter la visibilité organique et la recherche générative.", mustHave:"SEO; stratégie; analytics", shouldHave:"GEO; Search Console; management", optional:"Python; Looker Studio" },
  { title:"Chef de projet Data", clientName:"Orion Services", location:"Boulogne-Billancourt", description:"Coordonner les projets data et les équipes métiers/techniques.", mustHave:"gestion de projet; data; SQL", shouldHave:"Power BI; Agile; stakeholder management", optional:"Python; cloud" },
  { title:"Talent Acquisition Manager", clientName:"PeopleLab", location:"Paris", description:"Structurer le recrutement et améliorer l'expérience candidat.", mustHave:"recrutement; sourcing; ATS", shouldHave:"analytics RH; marque employeur; management", optional:"automatisation; IA" }
];

const candidates = [
  {name:"Camille Renaud",email:"camille.renaud@example.test",location:"Paris",years:7,skills:["CRM","marketing automation","Salesforce","HubSpot","segmentation","reporting"]},
  {name:"Thomas Leroy",email:"thomas.leroy@example.test",location:"Paris",years:6,skills:["IA générative","automatisation","API","n8n","Python","RAG"]},
  {name:"Sofia Benali",email:"sofia.benali@example.test",location:"Paris",years:8,skills:["SEO","stratégie","analytics","GEO","Search Console","management"]},
  {name:"Julien Moreau",email:"julien.moreau@example.test",location:"Lyon",years:9,skills:["gestion de projet","data","SQL","Power BI","Agile","cloud"]},
  {name:"Élodie Garnier",email:"elodie.garnier@example.test",location:"Paris",years:5,skills:["recrutement","sourcing","ATS","marque employeur","analytics RH"]},
  {name:"Nicolas Faure",email:"nicolas.faure@example.test",location:"Nanterre",years:4,skills:["CRM","Salesforce","reporting","SQL"]},
  {name:"Sarah Cohen",email:"sarah.cohen@example.test",location:"Paris",years:6,skills:["IA générative","API","Make","automatisation","LangChain"]},
  {name:"Mehdi Roux",email:"mehdi.roux@example.test",location:"Paris",years:5,skills:["SEO","Search Console","analytics","Looker Studio"]},
  {name:"Laura Petit",email:"laura.petit@example.test",location:"Versailles",years:7,skills:["data","SQL","Power BI","stakeholder management","Agile"]},
  {name:"Hugo Bernard",email:"hugo.bernard@example.test",location:"Paris",years:8,skills:["recrutement","sourcing","ATS","management","automatisation"]},
  {name:"Inès Martin",email:"ines.martin@example.test",location:"Paris",years:3,skills:["HubSpot","segmentation","CRM","marketing automation"]},
  {name:"Alexandre Dubois",email:"alexandre.dubois@example.test",location:"Clichy",years:6,skills:["Python","API","data","SQL","automatisation"]}
];

function tokens(value:string){return value.toLowerCase().split(/[;,]/).map(v=>v.trim()).filter(Boolean)}
function scoreFor(job:typeof jobs[number], skills:string[]){
  const s=skills.map(x=>x.toLowerCase());
  const must=tokens(job.mustHave), should=tokens(job.shouldHave);
  const mustHits=must.filter(x=>s.some(y=>y.includes(x)||x.includes(y))).length;
  const shouldHits=should.filter(x=>s.some(y=>y.includes(x)||x.includes(y))).length;
  return Math.max(25,Math.min(96,35+mustHits*17+shouldHits*7));
}

export async function POST(){
  try{
    const cutoff=new Date(Date.now()-2*DAY);
    const stale=await prisma.organization.findMany({where:{id:{startsWith:"demo-"},createdAt:{lt:cutoff}},select:{id:true}});
    if(stale.length) await prisma.organization.deleteMany({where:{id:{in:stale.map(x=>x.id)}}});

    const organizationId=`demo-${randomUUID()}`;
    const organization=await prisma.organization.create({data:{id:organizationId,name:"Cabinet Démo · Host Talent AI"}});
    const user=await prisma.user.create({data:{organizationId:organization.id,email:`demo-${randomUUID()}@hosttalent.local`,fullName:"Recruteur Démo",passwordHash:hashPassword(randomBytes(24).toString("hex")),role:"RECRUITER"}});

    const createdJobs=[];
    for(const j of jobs) createdJobs.push(await prisma.job.create({data:{organizationId,...j,optional:j.optional}}));
    const createdCandidates=[];
    for(const c of candidates){
      const raw=`${c.name}\n${c.location}\n${c.years} ans d'expérience\nCompétences : ${c.skills.join(", ")}`;
      createdCandidates.push(await prisma.candidate.create({data:{organizationId,fullName:c.name,email:c.email,location:c.location,experienceYears:c.years,skills:c.skills.join(", "),rawText:raw,summary:`Profil fictif de démonstration avec ${c.years} ans d'expérience.`,dataSource:"DEMO",retentionUntil:new Date(Date.now()+DAY)}}));
    }

    for(let ji=0;ji<createdJobs.length;ji++){
      for(let ci=0;ci<createdCandidates.length;ci++){
        const candidate=candidates[ci], job=jobs[ji], score=scoreFor(job,candidate.skills);
        const must=tokens(job.mustHave); const lower=candidate.skills.map(x=>x.toLowerCase());
        const matched=must.filter(x=>lower.some(y=>y.includes(x)||x.includes(y)));
        const missing=must.filter(x=>!lower.some(y=>y.includes(x)||x.includes(y)));
        let stage="NEW";
        if((ji===0&&ci===0)||(ji===1&&ci===1)) stage="SHORTLIST";
        if(ji===2&&ci===2) stage="CONTACTED";
        if(ji===3&&ci===3) stage="INTERVIEW";
        await prisma.match.create({data:{organizationId,jobId:createdJobs[ji].id,candidateId:createdCandidates[ci].id,score,matched:matched.join(", ")||"Compétences transférables",missing:missing.join(", "),questions:missing.length?`Confirmer : ${missing.join(", ")}`:"Valider disponibilité et motivation",explanation:`Matching fictif de démonstration calculé à partir des compétences structurées.`,stage}});
      }
    }

    const token=randomBytes(32).toString("base64url");
    const expiresAt=new Date(Date.now()+DAY);
    await prisma.session.create({data:{userId:user.id,tokenHash:hashSessionToken(token),expiresAt}});
    const response=NextResponse.json({ok:true});
    response.cookies.set(SESSION_COOKIE,token,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",expires:expiresAt});
    return response;
  }catch(error){console.error("demo session",error);return NextResponse.json({error:"Impossible de démarrer la démonstration."},{status:500});}
}
