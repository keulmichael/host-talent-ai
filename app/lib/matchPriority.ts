export type MatchPriorityInput={score:number;missing?:string|null;questions?:string|null;stage?:string|null};
export type MatchPriorityLevel="LOW"|"BACKGROUND"|"INTERESTING"|"PRIORITY"|"TOP";

export function splitItems(value?:string|null){
  return String(value||"").split(/[,;\n•]+/).map(x=>x.trim()).filter(Boolean);
}

export function classifyMatch(input:MatchPriorityInput){
  const missingCount=splitItems(input.missing).length;
  const questionCount=splitItems(input.questions).length;
  const needsValidation=input.score>=60&&(missingCount>0||questionCount>0);
  let level:MatchPriorityLevel="LOW";
  if(input.score>=90)level="TOP";
  else if(input.score>=75)level="PRIORITY";
  else if(input.score>=60)level="INTERESTING";
  else if(input.score>=40)level="BACKGROUND";

  const reviewRank=(level==="TOP"?500:level==="PRIORITY"?400:level==="INTERESTING"?300:level==="BACKGROUND"?200:100)+input.score+(needsValidation?25:0)-Math.min(20,missingCount*3);
  const label=level==="TOP"?"Très forte adéquation":level==="PRIORITY"?"Forte adéquation":level==="INTERESTING"?"Profil intéressant":level==="BACKGROUND"?"Adéquation partielle":"Faible adéquation";
  const reason=needsValidation
    ? `${label} · ${missingCount||questionCount} point(s) à valider humainement`
    : level==="TOP"||level==="PRIORITY"
      ? `${label} · aucun point requis explicitement manquant`
      : level==="INTERESTING"
        ? "Adéquation suffisante pour une revue ciblée"
        : "Conservé hors de la file prioritaire";

  return {
    level,label,reason,missingCount,questionCount,needsValidation,reviewRank,
    isRelevant:input.score>=60,
    isPriority:input.score>=75,
    isTop:input.score>=90,
    isBackground:input.score<60
  };
}

export function summarizeMatches<T extends MatchPriorityInput&{candidateId:string}>(matches:T[]){
  const analyzed=matches.length;
  const relevant=matches.filter(m=>classifyMatch(m).isRelevant).length;
  const priorityMatches=matches.filter(m=>classifyMatch(m).isPriority);
  const priorityCandidates=new Set(priorityMatches.map(m=>m.candidateId)).size;
  const validationMatches=matches.filter(m=>classifyMatch(m).needsValidation);
  const validationCandidates=new Set(validationMatches.map(m=>m.candidateId)).size;
  return {analyzed,relevant,priorityMatches:priorityMatches.length,priorityCandidates,validationMatches:validationMatches.length,validationCandidates};
}
