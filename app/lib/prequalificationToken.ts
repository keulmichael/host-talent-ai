import crypto from "crypto";

function secret(){
  return process.env.PREQUALIFICATION_SECRET||process.env.AUTH_SECRET||process.env.NEXTAUTH_SECRET||process.env.DATABASE_URL||"";
}

export function createPrequalificationToken(candidateId:string){
  const s=secret();
  if(!s)return null;
  const sig=crypto.createHmac("sha256",s).update(candidateId).digest("hex").slice(0,32);
  return `${candidateId}.${sig}`;
}

export function candidateIdFromPrequalificationToken(token:string){
  const s=secret();
  if(!s)return null;
  const [id,sig]=token.split(".");
  if(!id||!sig)return null;
  const expected=crypto.createHmac("sha256",s).update(id).digest("hex").slice(0,32);
  try{
    const actualBuffer=Buffer.from(sig);
    const expectedBuffer=Buffer.from(expected);
    if(actualBuffer.length!==expectedBuffer.length||!crypto.timingSafeEqual(actualBuffer,expectedBuffer))return null;
  }catch{return null;}
  return id;
}
