import { createHash, randomBytes } from "crypto";

export function createCandidateSurveyToken(){return randomBytes(24).toString("base64url");}
export function hashCandidateSurveyToken(token:string){return createHash("sha256").update(token).digest("hex");}
export function candidateSurveyExpiry(days=14){return new Date(Date.now()+days*86400000);}

export function experienceLabel(value:number){
 if(value>=4.5)return"Excellente";
 if(value>=4)return"Très bonne";
 if(value>=3)return"Correcte";
 if(value>=2)return"À améliorer";
 return"Critique";
}

export function npsBucket(value:number){return value>=9?"PROMOTER":value>=7?"PASSIVE":"DETRACTOR";}
