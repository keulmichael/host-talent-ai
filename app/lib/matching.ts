import { aliasEvidence, detectNegatedSkills, detectSkills, normalize, splitList } from "./extract";

type CandidateLike = { rawText:string; skills:string; experienceYears:number|null; location:string|null };
type JobLike = { mustHave:string; shouldHave:string; optional:string; location:string|null };
type Confidence = "high"|"medium"|"low";
type CriterionResult = { criterion:string; hit:boolean; negated:boolean; confidence:Confidence; evidence:string; strength:number };

const SYNONYMS:Record<string,string[]> = {
 "intelligence artificielle generative":["intelligence artificielle generative","ia generative","genai","openai","llm","gpt"],
 "automatisation des processus":["automatisation des processus","automatisation","workflow automatise","workflows automatises","n8n","automation"],
 "analyse des besoins metiers":["analyse des besoins metiers","recueil des besoins","expression des besoins","cadrage fonctionnel","besoins metiers","audit de processus","analyse de processus"],
 "conception d assistants ou agents ia":["assistant ia","assistants ia","agent ia","agents ia","assistant conversationnel"],
 "gestion de projet digital":["gestion de projet digital","chef de projet digital","cheffe de projet digital","pilotage de projets web","pilotage de projet digital","product owner","coordination de projets","cadrage de projets crm","projets crm"],
 "n8n":["n8n"], "make":["make","make.com","integromat"],
 "api rest":["api rest","rest api","integration api","integrations api","connexion api"],
 "openai ou autres llm":["openai","llm","gpt","large language model"],
 "openai autres llm":["openai","llm","gpt","large language model"],
 "integration d outils saas":["integration d outils saas","integrations saas","saas","hubspot","salesforce","integration crm","integration api","connexion avec le crm"],
 "creation de workflows":["creation de workflows","workflow","workflows","n8n","automatisation","scenarios automatises","automatisation des relances"],
 "conseil aupres d entreprises":["consultant","consultante","conseil","accompagnement clients","accompagnement de pme","accompagnement des entreprises","ateliers clients"],
 "formation ou accompagnement des utilisateurs":["formation","accompagnement des utilisateurs","accompagnement au changement","ateliers utilisateurs"],
 "crm":["crm","hubspot","salesforce","salesforce marketing cloud","dynamics 365"],
 "marketing automation":["marketing automation","automation marketing","hubspot","salesforce marketing cloud","marketo","pardot","brevo","lead nurturing","scenarios de nurturing","parcours automatises"],
 "hubspot":["hubspot"], "salesforce":["salesforce","salesforce marketing cloud"],
 "segmentation":["segmentation","segmentations","segmentation clients","segmentation prospects","segmentation comportementale","segmentation par maturite"],
 "segmentation clients prospects":["segmentation clients","segmentation prospects","segmentation comportementale","segmentation par maturite","segmentations"],
 "lead nurturing":["lead nurturing","nurturing","scenarios de nurturing","parcours de nurturing"],
 "lead scoring":["lead scoring","scoring des leads","scoring marketing","scoring marketing commercial","score de maturite"],
 "reporting":["reporting","tableaux de bord","tableau de bord","dashboard","dashboards","kpi","suivi des kpi"],
 "analyse de donnees":["analyse de donnees","data analysis","sql","analytics","donnees crm"],
 "sql":["sql"],
 "campagnes multicanales":["campagnes multicanales","multicanal","emailing","email marketing","sms marketing","campagnes crm"],
 "cycle de vie client":["cycle de vie client","lifecycle","lifecycle marketing","fidelisation","reactivation"],
 "typescript":["typescript"], "next.js":["next.js","nextjs"],
 "seo geo":["seo","geo","referencement naturel","generative engine optimization"],
 "developpement web":["developpement web","developpeur web","next.js","typescript","javascript","php","react"]
};

function stripConstraint(c:string){return c.replace(/\b\d+\s+ans(?:\s+d['’ ]?experience)?/i,"").trim()}
function aliasesFor(c:string){const n=normalize(stripConstraint(c));if(SYNONYMS[n])return SYNONYMS[n];for(const [key,aliases] of Object.entries(SYNONYMS)){if(n.includes(key)||key.includes(n))return [...new Set([n,...aliases])]}return[n]}
function evidence(c:string,raw:string):CriterionResult{
 const n=normalize(stripConstraint(c));
 if(!n)return{criterion:c,hit:true,negated:false,confidence:"high",evidence:"critère non discriminant",strength:1};
 const aliases=aliasesFor(c);
 for(const a of aliases){const e=aliasEvidence(raw,a);if(e.positive){const exact=normalize(a)===n;return{criterion:c,hit:true,negated:false,confidence:"high",evidence:exact?`preuve directe : ${a}`:`preuve sémantique : ${a}`,strength:exact?1:.92};}}
 for(const a of aliases){const e=aliasEvidence(raw,a);if(e.negated)return{criterion:c,hit:false,negated:true,confidence:"high",evidence:`mention limitée/négative : ${a}`,strength:0};}
 const text=normalize(raw),stop=new Set(["avec","dans","pour","plus","experience","professionnel","professionnelle","autres","outils","creation","conception","gestion"]);
 const tokens=n.split(" ").filter(t=>t.length>=4&&!stop.has(t)),count=tokens.filter(t=>text.includes(t)).length,r=tokens.length?count/tokens.length:0;
 if(tokens.length>=2&&r>=.67)return{criterion:c,hit:true,negated:false,confidence:"medium",evidence:"correspondance conceptuelle partielle",strength:.72};
 return{criterion:c,hit:false,negated:false,confidence:"low",evidence:"preuve insuffisante dans le CV",strength:0};
}
function weightedRatio(xs:CriterionResult[]){return xs.length?xs.reduce((s,x)=>s+(x.hit?x.strength:0),0)/xs.length:1}
export function explainMatch(job:JobLike,candidate:CandidateLike){
 const raw=`${candidate.rawText} ${candidate.skills||""} ${candidate.location??""}`;
 const detectedSkills=detectSkills(candidate.rawText),negatedSkills=detectNegatedSkills(candidate.rawText);
 const must=splitList(job.mustHave).map(c=>evidence(c,raw)),should=splitList(job.shouldHave).map(c=>evidence(c,raw)),optional=splitList(job.optional).map(c=>evidence(c,raw));
 const all=[...must,...should,...optional],matched=all.filter(x=>x.hit),missing=[...must,...should].filter(x=>!x.hit);
 const mr=weightedRatio(must),sr=weightedRatio(should),or=weightedRatio(optional);
 let score=Math.round(mr*65+sr*25+or*10);
 const years=Number(job.mustHave.match(/\b(\d+)\s+ans/i)?.[1]||0);
 if(years){if(candidate.experienceYears==null)score-=2;else if(candidate.experienceYears<years)score=Math.min(score,64)}
 const mustNegated=must.filter(x=>x.negated).length;if(mustNegated)score-=mustNegated*4;
 score=Math.max(0,Math.min(100,score));
 const questions=missing.slice(0,5).map(m=>m.negated?`Le CV mentionne « ${m.criterion} » dans un contexte limité ou négatif. Quel est votre niveau réel ?`:`Le CV ne permet pas de confirmer « ${m.criterion} ». Pouvez-vous préciser votre expérience ?`);
 const verdict=score>=85?"Très forte adéquation":score>=70?"Bonne adéquation":score>=55?"Adéquation partielle":score>=40?"Profil à approfondir":"Faible adéquation apparente";
 const confirmed=all.filter(x=>x.hit).length,limited=all.filter(x=>x.negated).length,unknown=all.filter(x=>!x.hit&&!x.negated).length;
 const explanation=`${verdict}. Indispensables ${Math.round(mr*100)} %, souhaitables ${Math.round(sr*100)} %, optionnels ${Math.round(or*100)} %. Preuves : ${confirmed} critère(s) confirmé(s), ${limited} mention(s) limitée(s/négatives), ${unknown} critère(s) à vérifier. Compétences positives détectées : ${detectedSkills.join(", ")||"aucune"}. ${negatedSkills.length?`Mentions négatives/limitées : ${negatedSkills.join(", ")}. `:""}Les synonymes et concepts métiers sont rapprochés, mais une absence de preuve n'est pas assimilée à une incompatibilité. Le score est une aide à la revue humaine, jamais une décision automatique.`;
 return{score,matched:matched.map(x=>x.criterion),missing:missing.map(x=>x.criterion),questions,explanation,detectedSkills,negatedSkills,verdict,evidence:all.map(x=>({criterion:x.criterion,status:x.hit?"confirme":x.negated?"limite":"a_verifier",confidence:x.confidence,evidence:x.evidence,strength:x.strength}))};
}
