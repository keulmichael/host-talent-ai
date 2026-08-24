import {NextResponse} from "next/server";
import {apiUser} from "../../../lib/auth";
import {prisma} from "../../../lib/db";
import {createPrequalificationToken} from "../../../lib/prequalificationToken";

const ELIGIBLE_STAGES=["SHORTLIST","CONTACTED","INTERVIEW"] as const;

export async function POST(req:Request){
 const user=await apiUser();if(!user)return NextResponse.json({error:"Authentification requise"},{status:401});
 const body=await req.json();
 const ids:string[]=Array.isArray(body.candidateIds)?Array.from(new Set<string>(body.candidateIds.map((v:unknown)=>String(v)))).slice(0,200):[];
 if(!ids.length)return NextResponse.json({error:"Aucun candidat sélectionné"},{status:400});
 const candidates=await prisma.candidate.findMany({where:{organizationId:user.organizationId,id:{in:ids},matches:{some:{organizationId:user.organizationId,stage:{in:[...ELIGIBLE_STAGES]}}}},select:{id:true,fullName:true}});
 if(!candidates.length)return NextResponse.json({error:"Aucun candidat sélectionné n’est encore en short-list ou en entretien"},{status:400});
 const origin=new URL(req.url).origin;
 const existing=await prisma.candidateActivity.findMany({where:{organizationId:user.organizationId,candidateId:{in:candidates.map(c=>c.id)},type:"PREQUALIFICATION_LINK",status:"PLANNED"},select:{candidateId:true}});
 const already=new Set(existing.map(a=>a.candidateId));
 const toCreate=candidates.filter(c=>!already.has(c.id));
 if(toCreate.length)await prisma.candidateActivity.createMany({data:toCreate.map(c=>({organizationId:user.organizationId,candidateId:c.id,createdById:user.id,type:"PREQUALIFICATION_LINK",channel:"LINK",status:"PLANNED",priority:"NORMAL",subject:"Lien disponibilité & rémunération généré"}))});
 const links=candidates.flatMap(c=>{const token=createPrequalificationToken(c.id);return token?[{candidateId:c.id,fullName:c.fullName,url:`${origin}/prequalification/${token}`}]:[];});
 if(!links.length)return NextResponse.json({error:"Impossible de sécuriser les liens de préqualification"},{status:500});
 return NextResponse.json({links});
}
