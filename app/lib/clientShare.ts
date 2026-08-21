import { createHash, randomBytes } from "crypto";

export function createClientShareToken(){return randomBytes(32).toString("base64url");}
export function hashClientShareToken(token:string){return createHash("sha256").update(token).digest("hex");}
export function shareExpiry(days=14){return new Date(Date.now()+days*24*60*60*1000);}
