export type MatchPriorityInput={score:number;missing?:string|null;questions?:string|null;stage?:string|null;mustHave?:string|null;shouldHave?:string|null;availability?:string|null;dailyRate?:number|null;salaryExpectation?:number|null};
export type MatchPriorityLevel="LOW"|"BACKGROUND"|"INTERESTING"|"PRIORITY"|"TOP";
export type ValidationLevel="NONE"|"INFORMATIVE"|"USEFUL"|"CRITICAL";

export function splitItems(value?:string|null){return String(value||"").split(/[,;\n•]+/).map(x=>x.replace(/^[-✓✔•\s]+/,"").trim()).filter(Boolean);}
function normalize(value:string){return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9+#.]+/g," ").replace(/\s+/g," ").trim();}
function words(value:string){return normalize(value).split(" ").filter(w=>w.length>2&&!new Set(["avec","pour","dans","des","une","les","minimum","minimale","requis","requise","obligatoire","souhaite","souhaitee"]).has(w));}
function sameCriterion(a:string,b:string){const na=normalize(a),nb=normalize(b);if(!na||!nb)return false;if(na.includes(nb)||nb.includes(na))return true;const wa=words(a),wb=new Set(words(b));if(!wa.length||!wb.size)return false;const common=wa.filter(w=>wb.has(w)).length;return common>=Math.min(2,Math.max(1,Math.min(wa.length,wb.size)));}
function unique(items:string[]){return [...new Set(items)];}
const COMMERCIAL_TERMS=["disponibil","tjm","tarif","journalier","pretention","salaire","salarial","remuner","mobilite","preavis","date de demarrage","remote","teletravail"];
const PRIORITY_MARKERS=["prioritaire","priorite","important","fortement souhaite","fortement souhaitable","cle","clé","essentiel"];
function isCommercial(value:string){const v=normalize(value);return COMMERCIAL_TERMS.some(t=>v.includes(normalize(t)));}
function isExplicitPriority(value:string){const v=normalize(value);return PRIORITY_MARKERS.some(t=>v.includes(normalize(t)));}

export function classifyValidation(input:MatchPriorityInput){
  const missing=splitItems(input.missing);
  const must=splitItems(input.mustHave);
  const should=splitItems(input.shouldHave);
  const criticalItems=unique(missing.filter(item=>!isCommercial(item)&&must.some(c=>sameCriterion(item,c))));
  const rawShouldMissing=unique(missing.filter(item=>!isCommercial(item)&&!criticalItems.includes(item)&&should.some(c=>sameCriterion(item,c))));
  const explicitPriorityShould=rawShouldMissing.filter(item=>should.some(c=>sameCriterion(item,c)&&isExplicitPriority(c)));
  // A single ordinary should-have no longer creates human work. A useful validation requires
  // either several missing should-haves or one should-have explicitly marked as important/priority.
  const usefulItems=explicitPriorityShould.length?explicitPriorityShould:(rawShouldMissing.length>=2?rawShouldMissing:[]);

  const commercialFromText=unique([...missing,...splitItems(input.questions)].filter(isCommercial));
  const commercialItems=[...commercialFromText];
  if(!input.availability?.trim())commercialItems.push("Disponibilité à confirmer");
  if(input.dailyRate==null&&input.salaryExpectation==null)commercialItems.push("TJM ou prétention salariale à confirmer");
  const commercialUnique=unique(commercialItems);

  let validationLevel:ValidationLevel="NONE";
  if(input.score>=60&&criticalItems.length)validationLevel="CRITICAL";
  else if(input.score>=60&&usefulItems.length)validationLevel="USEFUL";
  else if(input.score>=60&&commercialUnique.length)validationLevel="INFORMATIVE";
  return {validationLevel,criticalItems,usefulItems,commercialItems:commercialUnique,rawShouldMissing,needsCriticalValidation:validationLevel==="CRITICAL",needsUsefulValidation:validationLevel==="USEFUL",hasCommercialInfoToComplete:commercialUnique.length>0,needsHumanDecision:validationLevel==="CRITICAL"||validationLevel==="USEFUL"};
}

export function classifyMatch(input:MatchPriorityInput){
  const missingCount=splitItems(input.missing).length,questionCount=splitItems(input.questions).length,validation=classifyValidation(input);const needsValidation=validation.needsHumanDecision;
  let level:MatchPriorityLevel="LOW";if(input.score>=90)level="TOP";else if(input.score>=75)level="PRIORITY";else if(input.score>=60)level="INTERESTING";else if(input.score>=40)level="BACKGROUND";
  const validationBoost=validation.needsCriticalValidation?35:validation.needsUsefulValidation?18:0;
  const reviewRank=(level==="TOP"?500:level==="PRIORITY"?400:level==="INTERESTING"?300:level==="BACKGROUND"?200:100)+input.score+validationBoost-Math.min(20,missingCount*2);
  const label=level==="TOP"?"Très forte adéquation":level==="PRIORITY"?"Forte adéquation":level==="INTERESTING"?"Profil intéressant":level==="BACKGROUND"?"Adéquation partielle":"Faible adéquation";
  const reason=validation.needsCriticalValidation?`${label} · indispensable de la mission à valider`:validation.needsUsefulValidation?`${label} · plusieurs souhaitables importants restent à confirmer`:validation.hasCommercialInfoToComplete?`${label} · adéquation CV exploitable, informations commerciales à compléter`:level==="TOP"||level==="PRIORITY"?`${label} · aucun critère métier déterminant manquant`:level==="INTERESTING"?"Adéquation suffisante pour une revue ciblée":"Conservé hors de la file prioritaire";
  return {level,label,reason,missingCount,questionCount,needsValidation,reviewRank,...validation,isRelevant:input.score>=60,isPriority:input.score>=75,isTop:input.score>=90,isBackground:input.score<60};
}

export function summarizeMatches<T extends MatchPriorityInput&{candidateId:string}>(matches:T[]){
  const analyzed=matches.length,relevant=matches.filter(m=>classifyMatch(m).isRelevant).length,priorityMatches=matches.filter(m=>classifyMatch(m).isPriority),priorityCandidates=new Set(priorityMatches.map(m=>m.candidateId)).size;
  const validationMatches=matches.filter(m=>classifyMatch(m).needsValidation),validationCandidates=new Set(validationMatches.map(m=>m.candidateId)).size,criticalMatches=matches.filter(m=>classifyMatch(m).needsCriticalValidation),criticalCandidates=new Set(criticalMatches.map(m=>m.candidateId)).size,usefulMatches=matches.filter(m=>classifyMatch(m).needsUsefulValidation),usefulCandidates=new Set(usefulMatches.map(m=>m.candidateId)).size,commercialMatches=matches.filter(m=>classifyMatch(m).hasCommercialInfoToComplete),commercialCandidates=new Set(commercialMatches.map(m=>m.candidateId)).size;
  return {analyzed,relevant,priorityMatches:priorityMatches.length,priorityCandidates,validationMatches:validationMatches.length,validationCandidates,criticalMatches:criticalMatches.length,criticalCandidates,usefulMatches:usefulMatches.length,usefulCandidates,commercialMatches:commercialMatches.length,commercialCandidates};
}
