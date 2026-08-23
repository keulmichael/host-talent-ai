import {NextResponse} from "next/server";
import {prisma} from "../../../lib/db";
import crypto from "crypto";

function candidateIdFromToken(token:string){
 const secret=process.env.AUTH_SECRET||process.env.NEXTAUTH_SECRET||"";
 if(!secret)return null;
 const [id,sig]=token.split(".");
 if(!id||!sig)return null;
 const expected=crypto.createHmac("sha256",secret).update(id).digest("hex").slice(0,32);
 try{if(!crypto.timingSafeEqual(Buffer.from(sig),Buffer.from(expected)))return null;}catch{return null;}
 return id;
}
export async function GET(_:Request,{params}:{params:Promise<{token:string}>}){
 const {token}=await params;const id=candidateIdFromToken(token);if(!id)return NextResponse.json({error:"Lien invalide"},{status:404});
 const c=await prisma.candidate.findUnique({where:{id},select:{fullName:true,availability:true,dailyRate:true,salaryExpectation:true}});
 if(!c)return NextResponse.json({error:"Candidat introuvable"},{status:404});return NextResponse.json(c);
}
export async function PATCH(req:Request,{params}:{params:Promise<{token:string}>}){
 const {token}=await params;const id=candidateIdFromToken(token);if(!id)return NextResponse.json({error:"Lien invalide"},{status:404});
 const body=await req.json();const dailyRate=body.dailyRate?Number(body.dailyRate):null;const salaryExpectation=body.salaryExpectation?Number(body.salaryExpectation):null;
 if(dailyRate!=null&&(!Number.isFinite(dailyRate)||dailyRate<0))return NextResponse.json({error:"TJM invalide"},{status:400});
 if(salaryExpectation!=null&&(!Number.isFinite(salaryExpectation)||salaryExpectation<0))return NextResponse.json({error:"Salaire invalide"},{status:400});
 await prisma.candidate.update({where:{id},data:{availability:String(body.availability||"").trim().slice(0,120)||null,dailyRate:dailyRate==null?null:Math.round(dailyRate),salaryExpectation:salaryExpectation==null?null:Math.round(salaryExpectation)}});
 return NextResponse.json({ok:true});
}