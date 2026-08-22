import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { explainMatch } from "../../../lib/matching";
import { apiUser, audit } from "../../../lib/auth";

function clamp(n:number,min:number,max:number){return Math.max(min,Math.min(max,n));}

export async function POST(req:Request){
  try{
    const user=await apiUser();
    if(!user)return NextResponse.json({error:"Authentification requise"},{status:401});

    const body=await req.json().catch(()=>({}));
    const cursor=Math.max(0,Number(body.cursor)||0);
    const batchSize=clamp(Number(body.batchSize)||120,25,200);

    const [jobs,candidates]=await Promise.all([
      prisma.job.findMany({where:{organizationId:user.organizationId},orderBy:{id:"asc"}}),
      prisma.candidate.findMany({where:{organizationId:user.organizationId},orderBy:{id:"asc"}})
    ]);

    const total=jobs.length*candidates.length;
    if(total===0)return NextResponse.json({ok:true,done:true,cursor:0,total:0,processed:0,percent:100,jobs:jobs.length,candidates:candidates.length});

    const end=Math.min(total,cursor+batchSize);
    const items=[] as {job:(typeof jobs)[number];candidate:(typeof candidates)[number]}[];
    for(let i=cursor;i<end;i++){
      const jobIndex=Math.floor(i/candidates.length);
      const candidateIndex=i%candidates.length;
      const job=jobs[jobIndex],candidate=candidates[candidateIndex];
      if(job&&candidate)items.push({job,candidate});
    }

    const concurrency=20;
    for(let i=0;i<items.length;i+=concurrency){
      const slice=items.slice(i,i+concurrency);
      await Promise.all(slice.map(async({job,candidate})=>{
        const match=explainMatch(job,candidate);
        await prisma.match.upsert({
          where:{jobId_candidateId:{jobId:job.id,candidateId:candidate.id}},
          update:{score:match.score,matched:match.matched.join(", "),missing:match.missing.join(", "),questions:match.questions.join("\n"),explanation:match.explanation},
          create:{organizationId:user.organizationId,jobId:job.id,candidateId:candidate.id,score:match.score,matched:match.matched.join(", "),missing:match.missing.join(", "),questions:match.questions.join("\n"),explanation:match.explanation}
        });
      }));
    }

    const done=end>=total;
    if(done){
      await audit({organizationId:user.organizationId,userId:user.id,action:"ALL_MATCHES_RECOMPUTED_BATCHED",details:`${jobs.length} missions, ${candidates.length} candidats, ${total} matchings`});
    }

    return NextResponse.json({
      ok:true,
      done,
      cursor:end,
      total,
      processed:items.length,
      percent:Math.round(end/total*100),
      jobs:jobs.length,
      candidates:candidates.length
    });
  }catch(error){
    console.error(error);
    return NextResponse.json({error:"Impossible de recalculer ce lot de matchings"},{status:500});
  }
}
