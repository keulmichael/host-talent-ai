import { notFound } from "next/navigation";
import { prisma } from "../../lib/db";
import { hashCandidateSurveyToken } from "../../lib/candidateExperience";
import CandidateExperienceForm from "../../CandidateExperienceForm";

export const dynamic = "force-dynamic";

export default async function CandidateExperiencePage({params}:{params:Promise<{token:string}>}){
 const{token}=await params;
 const survey=await prisma.candidateSurvey.findUnique({where:{tokenHash:hashCandidateSurveyToken(token)},include:{organization:true,match:{include:{candidate:true,job:true}},response:true}});
 if(!survey||!survey.active||survey.expiresAt<new Date())notFound();
 await prisma.candidateSurvey.update({where:{id:survey.id},data:{viewCount:{increment:1},lastViewedAt:new Date()}}).catch(()=>undefined);
 if(survey.response)return <div className="loginWrap"><div className="card loginCard"><div className="eyebrow">EXPÉRIENCE CANDIDAT</div><h1>Merci, votre réponse a déjà été enregistrée.</h1><p className="muted">Ce lien ne permet qu'une seule réponse.</p></div></div>;
 return <div className="loginWrap"><div className="loginCard" style={{width:"min(720px,100%)"}}><CandidateExperienceForm surveyToken={token} candidateName={survey.match.candidate.fullName} jobTitle={survey.match.job.title} organizationName={survey.organization.name}/></div></div>;
}
