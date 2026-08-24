import {notFound} from "next/navigation";
import {prisma} from "../../lib/db";
import {candidateIdFromPrequalificationToken} from "../../lib/prequalificationToken";
import PrequalificationForm from "./PrequalificationForm";
export const dynamic="force-dynamic";
export default async function Page({params}:{params:Promise<{token:string}>}){const {token}=await params;const id=candidateIdFromPrequalificationToken(token);if(!id)notFound();const c=await prisma.candidate.findUnique({where:{id},select:{fullName:true,availability:true,dailyRate:true,salaryExpectation:true}});if(!c)notFound();return <main style={{padding:"32px 20px"}}><PrequalificationForm token={token} initial={c}/></main>;}
