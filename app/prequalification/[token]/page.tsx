import {notFound} from "next/navigation";
import crypto from "crypto";
import {prisma} from "../../lib/db";
import PrequalificationForm from "./PrequalificationForm";
export const dynamic="force-dynamic";
function idFromToken(token:string){const secret=process.env.AUTH_SECRET||process.env.NEXTAUTH_SECRET||"";if(!secret)return null;const [id,sig]=token.split(".");if(!id||!sig)return null;const expected=crypto.createHmac("sha256",secret).update(id).digest("hex").slice(0,32);try{if(!crypto.timingSafeEqual(Buffer.from(sig),Buffer.from(expected)))return null;}catch{return null;}return id;}
export default async function Page({params}:{params:Promise<{token:string}>}){const {token}=await params;const id=idFromToken(token);if(!id)notFound();const c=await prisma.candidate.findUnique({where:{id},select:{fullName:true,availability:true,dailyRate:true,salaryExpectation:true}});if(!c)notFound();return <main style={{padding:"32px 20px"}}><PrequalificationForm token={token} initial={c}/></main>;}
