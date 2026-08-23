export type MatchPriorityInput={score:number;missing?:string|null;questions?:string|null;stage?:string|null;mustHave?:string|null;shouldHave?:string|null;availability?:string|null;dailyRate?:number|null;salaryExpectation?:number|null};
export type MatchPriorityLevel="LOW"|"BACKGROUND"|"INTERESTING"|"PRIORITY"|"TOP";
export type ValidationLevel="NONE"|"INFORMATIVE"|"USEFUL"|"CRITICAL";

export function splitItems(value?:string|null){
  return String(value||"").split(/[,;\n•]+/).map(x=>x.replace(/^[-✓✔•\s]+/,"").trim()).filter(Boolean);
}

function normalize(value:string){return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9+#.]+/g," ").replace(/\s+/g," ").trim();}
function words(value:string){return normalize(value).split(" ").filter(w=>w.length>2&&!new Set(["avec","pour","dans","des","une","les","minimum","minimale","requis","requise","obligatoire","souhaite","souhaitee"]).has(w));}
function sameCriterion(a:string,b:string){
  const na=normalize(a),nb=normalize(b);
  if(!na||!nb)return false;
  if(na.includes(nb)||nb.includes(na))return true;
  const wa=words(a),wb=new Set(words(b));
  if(!wa.length||!wb.size)return false;
  const common=wa.filter(w=>wb.has(w)).length;
  return common>=Math.min(2,Math.max(1,Math.min(wa.length,wb.size)));
}
function unique(items:string[]){return [...new Set(items)];}

const COMMERCIAL_TERMS=["disponibil","tjm","tarif","journalier","pretention","salaire","salarial","remuner","mobilite","preavis","date de demarrage","remote","teletravail"];
function isCommercial(value:string){const v=normalize(value);return COMMERCIAL_TERMS.some(t=>v.includes(normalize(t)));}

export function classifyValidation(input:MatchPriorityInput){
  // IMPORTANT: only structured mission criteria may create a métier validation.
  // Generic generated questions never create a blocking/decision validation by themselves.
  const missing=splitItems(input.missing);
  const must=splitItems(input.mustHave);
  const should=splitItems(input.shouldHave);
  const criticalItems=unique(missing.filter(item=>!isCommercial(item)&&must.some(c=>sameCriterion(item,c))));
  const usefulItems=unique(missing.filter(item=>!isCommercial(item)&&!criticalItems.includes(item)&&should.some(c=>sameCriterion(item,c))));

  const commercialFromText=unique([...missing,...splitItems(input.questions)].filter(isCommercial));
  const commercialItems=[...commercialFromText];
  if(!input.availability?.trim())commercialItems.push("Disponibilité à confirmer");
  if(input.dailyRate==null&&input.salaryExpectation==null)commercialItems.push("TJM ou prétention salariale à confirmer");
  const commercialUnique=unique(commercialItems);

  let validationLevel:ValidationLevel="NONE";
  if(input.score>=60&&criticalItems.length)validationLevel="CRITICAL";
  else if(input.score>=60&&usefulItems.length)validationLevel="USEFUL";
  else if(input.score>=60&&commercialUnique.length)validationLevel="INFORMATIVE";

  return {
    validationLevel,criticalItems,usefulItems,commercialItems:commercialUnique,
    needsCriticalValidation:validationLevel==="CRITICAL",
    needsUsefulValidation:validationLevel==="USEFUL",
    hasCommercialInfoToComplete:commercialUnique.length>0,
    needsHumanDecision:validationLevel==="CRITICAL"||validationLevel==="USEFUL"
  };
}

export function classifyMatch(input:MatchPriorityInput){
  const missingCount=splitItems(input.missing).length;
  const questionCount=splitItems(input.questions).length;
  const validation=classifyValidation(input);
  const needsValidation=validation.needsHumanDecision;
  let level:MatchPriorityLevel="LOW";
  if(input.score>=90)level="TOP"; else if(input.score>=75)level="PRIORITY"; else if(input.score>=60)level="INTERESTING"; else if(input.score>=40)level="BACKGROUND";
  const validationBoost=validation.needsCriticalValidation?35:validation.needsUsefulValidation?18:0;
  const reviewRank=(level==="TOP"?500:level==="PRIORITY"?400:level==="INTERESTING"?300:level==="BACKGROUND"?200:100)+input.score+validationBoost-Math.min(20,missingCount*2);
  const label=level==="TOP"?"Très forte adéquation":level==="PRIORITY"?"Forte adéquation":level==="INTERESTING"?"Profil intéressant":level==="BACKGROUND"?"Adéquation partielle":"Faible adéquation";
  const reason=validation.needsCriticalValidation?`${label} · indispensable de la mission à valider`:validation.needsUsefulValidation?`${label} · souhaitable important à confirmer`:validation.hasCommercialInfoToComplete?`${label} · adéquation CV exploitable, informations commerciales à compléter`:level==="TOP"||level==="PRIORITY"?`${label} · aucun critère métier structuré manquant` : level==="INTERESTING"?"Adéquation suffisante pour une revue ciblée":"Conservé hors de la file prioritaire";
  return {level,label,reason,missingCount,questionCount,needsValidation,reviewRank,...validation,isRelevant:input.score>=60,isPriority:input.score>=75,isTop:input.score>=90,isBackground:input.score<60};
}

export function summarizeMatches<T extends MatchPriorityInput&{candidateId:string}>(matches:T[]){
  const analyzed=matches.length;
  const relevant=matches.filter(m=>classifyMatch(m).isRelevant).length;
  const priorityMatches=matches.filter(m=>classifyMatch(m).isPriority);
  const priorityCandidates=new Set(priorityMatches.map(m=>m.candidateId)).size;
  const validationMatches=matches.filter(m=>classifyMatch(m).needsValidation);
  const validationCandidates=new Set(validationMatches.map(m=>m.candidateId)).size;
  const criticalMatches=matches.filter(m=>classifyMatch(m).needsCriticalValidation);
  const criticalCandidates=new Set(criticalMatches.map(m=>m.candidateId)).size;
  const usefulMatches=matches.filter(m=>classifyMatch(m).needsUsefulValidation);
  const usefulCandidates=new Set(usefulMatches.map(m=>m.candidateId)).size;
  const commercialMatches=matches.filter(m=>classifyMatch(m).hasCommercialInfoToComplete);
  const commercialCandidates=new Set(commercialMatches.map(m=>m.candidateId)).size;
  return {analyzed,relevant,priorityMatches:priorityMatches.length,priorityCandidates,validationMatches:validationMatches.length,validationCandidates,criticalMatches:criticalMatches.length,criticalCandidates,usefulMatches:usefulMatches.length,usefulCandidates,commercialMatches:commercialMatches.length,commercialCandidates};
}
