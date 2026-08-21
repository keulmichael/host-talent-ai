import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { hashClientShareToken } from "../../../../../lib/clientShare";

const ALLOWED=new Set(["INTERESTED","INTERVIEW","HOLD","REJECTED"]);

export async function POST(req:Request,{params}:{params:Promise<{token:string}>}){
 const{token}=await params; const share=await prisma.clientShare.findUnique({where:{tokenHash:hashClientShareToken(token)},include:{job:true}});
 if(!share||!share.active||share.expiresAt<=new Date())return NextResponse.json({error:"Lien invalide ou expiré"},{status:404});
 const body=await req.json(); const decision=String(body.decision||""); if(!ALLOWED.has(decision))return NextResponse.json({error:"Avis invalide"},{status:400});
 const match=await prisma.match.findFirst({where:{id:String(body.matchId||""),jobId:share.jobId,organizationId:share.organizationId,stage:{in:["SHORTLIST","CONTACTED","INTERVIEW","CLIENT","OFFER","HIRED"]}}});
 if(!match)return NextResponse.json({error:"Profil non disponible dans ce partage"},{status:404});
 const feedback=await prisma.clientFeedback.create({data:{shareId:share.id,matchId:match.id,clientName:String(body.clientName||"").trim().slice(0,120)||null,decision,comment:String(body.comment||"").trim().slice(0,2000)||null}});
 return NextResponse.json({ok:true,id:feedback.id});
}
