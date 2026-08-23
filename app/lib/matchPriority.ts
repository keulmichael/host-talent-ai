export type MatchPriorityInput={score:number;missing?:string|null;questions?:string|null;stage?:string|null};
export type MatchPriorityLevel="LOW"|"BACKGROUND"|"INTERESTING"|"PRIORITY"|"TOP";
export type ValidationLevel="NONE"|"INFORMATIVE"|"USEFUL"|"CRITICAL";

export function splitItems(value?:string|null){
  return String(value||"").split(/[,;\n•]+/).map(x=>x.trim()).filter(Boolean);
}

const COMMERCIAL_TERMS=[
  "disponibil","tjm","tarif","journalier","prétention","pretention","salaire","salarial","rémunér","remuner",
  "mobilité","mobilite","préavis","preavis","date de démarrage","date de demarrage","remote","télétravail","teletravail"
];
const CRITICAL_TERMS=[
  "indispensable","obligatoire","requis","minimum","certification","habilit","permis","diplôme","diplome",
  "anglais professionnel","langue obligatoire","expérience minimum","experience minimum","ans d'expérience minimum","ans d’experience minimum"
];

function normalize(value:string){return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");}
function hasAny(value:string,terms:string[]){const v=normalize(value);return terms.some(term=>v.includes(normalize(term)));}

export function classifyValidation(input:MatchPriorityInput){
  const missing=splitItems(input.missing);
  const questions=splitItems(input.questions);
  const items=[...missing,...questions];
  const commercialItems=items.filter(item=>hasAny(item,COMMERCIAL_TERMS));
  const criticalItems=items.filter(item=>hasAny(item,CRITICAL_TERMS));
  const usefulItems=items.filter(item=>!commercialItems.includes(item)&&!criticalItems.includes(item));

  let validationLevel:ValidationLevel="NONE";
  if(input.score>=60&&criticalItems.length)validationLevel="CRITICAL";
  else if(input.score>=60&&usefulItems.length)validationLevel="USEFUL";
  else if(input.score>=60&&commercialItems.length)validationLevel="INFORMATIVE";

  return {
    validationLevel,
    criticalItems,
    usefulItems,
    commercialItems,
    needsCriticalValidation:validationLevel==="CRITICAL",
    needsUsefulValidation:validationLevel==="USEFUL",
    hasCommercialInfoToComplete:commercialItems.length>0,
    needsHumanDecision:validationLevel==="CRITICAL"||validationLevel==="USEFUL"
  };
}

export function classifyMatch(input:MatchPriorityInput){
  const missingCount=splitItems(input.missing).length;
  const questionCount=splitItems(input.questions).length;
  const validation=classifyValidation(input);
  const needsValidation=validation.needsHumanDecision;
  let level:MatchPriorityLevel="LOW";
  if(input.score>=90)level="TOP";
  else if(input.score>=75)level="PRIORITY";
  else if(input.score>=60)level="INTERESTING";
  else if(input.score>=40)level="BACKGROUND";

  const validationBoost=validation.needsCriticalValidation?35:validation.needsUsefulValidation?18:0;
  const reviewRank=(level==="TOP"?500:level==="PRIORITY"?400:level==="INTERESTING"?300:level==="BACKGROUND"?200:100)+input.score+validationBoost-Math.min(20,missingCount*2);
  const label=level==="TOP"?"Très forte adéquation":level==="PRIORITY"?"Forte adéquation":level==="INTERESTING"?"Profil intéressant":level==="BACKGROUND"?"Adéquation partielle":"Faible adéquation";
  const reason=validation.needsCriticalValidation
    ? `${label} · critère déterminant à valider humainement`
    : validation.needsUsefulValidation
      ? `${label} · élément métier utile à confirmer`
      : validation.hasCommercialInfoToComplete
        ? `${label} · adéquation CV exploitable, informations commerciales à compléter`
        : level==="TOP"||level==="PRIORITY"
          ? `${label} · aucun point métier requis explicitement manquant`
          : level==="INTERESTING"
            ? "Adéquation suffisante pour une revue ciblée"
            : "Conservé hors de la file prioritaire";

  return {
    level,label,reason,missingCount,questionCount,needsValidation,reviewRank,...validation,
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
  const criticalMatches=matches.filter(m=>classifyMatch(m).needsCriticalValidation);
  const criticalCandidates=new Set(criticalMatches.map(m=>m.candidateId)).size;
  const usefulMatches=matches.filter(m=>classifyMatch(m).needsUsefulValidation);
  const usefulCandidates=new Set(usefulMatches.map(m=>m.candidateId)).size;
  const commercialMatches=matches.filter(m=>classifyMatch(m).hasCommercialInfoToComplete);
  const commercialCandidates=new Set(commercialMatches.map(m=>m.candidateId)).size;
  return {analyzed,relevant,priorityMatches:priorityMatches.length,priorityCandidates,validationMatches:validationMatches.length,validationCandidates,criticalMatches:criticalMatches.length,criticalCandidates,usefulMatches:usefulMatches.length,usefulCandidates,commercialMatches:commercialMatches.length,commercialCandidates};
}
