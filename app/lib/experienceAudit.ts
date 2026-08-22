export type AuditLevel="GOOD"|"WATCH"|"RISK"|"NO_DATA";
export type AuditAxis={key:string;label:string;score:number|null;level:AuditLevel;summary:string;evidence:string[];recommendations:string[]};
export type ExperienceAudit={score:number|null;level:AuditLevel;axes:AuditAxis[];risks:number;strengths:number;priorities:string[]};

export type ExperienceAuditInput={
 candidates:number;
 candidatesWithEmail:number;
 relevantMatches:number;
 activeMatches:number;
 prequalifiedMatches:number;
 activities:number;
 completedActivities:number;
 plannedActivities:number;
 overdueActivities:number;
 surveys:number;
 surveyResponses:number;
 clarityAvg:number|null;
 responsivenessAvg:number|null;
 respectAvg:number|null;
 transparencyAvg:number|null;
 clientSharesWithoutFeedback:number;
 stagnantMatches:number;
};

function clamp(n:number){return Math.max(0,Math.min(100,Math.round(n)))}
function pct(n:number,d:number){return d?Math.round(n/d*100):0}
function level(score:number|null):AuditLevel{return score==null?"NO_DATA":score>=80?"GOOD":score>=60?"WATCH":"RISK"}
function axis(key:string,label:string,score:number|null,summary:string,evidence:string[],recommendations:string[]):AuditAxis{return{key,label,score:score==null?null:clamp(score),level:level(score),summary,evidence,recommendations}}

export function buildExperienceAudit(i:ExperienceAuditInput):ExperienceAudit{
 const contactScore=i.candidates?pct(i.candidatesWithEmail,i.candidates):null;
 const prequalScore=i.relevantMatches?pct(i.prequalifiedMatches,i.relevantMatches):null;
 const relationCoverage=i.relevantMatches?Math.min(100,pct(i.activities,i.relevantMatches)):null;
 const completion=i.activities?pct(i.completedActivities,i.activities):null;
 const relationScore=relationCoverage==null?null:Math.round(relationCoverage*.55+(completion??0)*.45);
 const reactionScore=i.plannedActivities?clamp(100-pct(i.overdueActivities,i.plannedActivities)):i.activities?100:null;
 const experienceValues=[i.clarityAvg,i.responsivenessAvg,i.respectAvg,i.transparencyAvg].filter((x):x is number=>x!=null);
 const experienceScore=experienceValues.length?Math.round((experienceValues.reduce((a,b)=>a+b,0)/experienceValues.length)/5*100):null;
 const listeningCoverage=i.surveys?pct(i.surveyResponses,i.surveys):null;
 const listeningScore=experienceScore==null?(i.surveys?Math.min(70,listeningCoverage??0):null):Math.round(experienceScore*.7+(listeningCoverage??0)*.3);
 const continuityPenalty=Math.min(100,i.stagnantMatches*12+i.clientSharesWithoutFeedback*10);
 const continuityScore=i.activeMatches||i.clientSharesWithoutFeedback?clamp(100-continuityPenalty):null;

 const axes:AuditAxis[]=[
  axis("ENTRY","Entrée et joignabilité",contactScore,
   contactScore==null?"Pas assez de données pour mesurer la joignabilité.":`${contactScore}% des candidats du vivier disposent d'un e-mail exploitable.`,
   [`${i.candidatesWithEmail}/${i.candidates} candidat(s) avec e-mail détecté`],
   contactScore!=null&&contactScore<90?["Améliorer l'extraction des coordonnées et traiter les CV non joignables avant mise en relation."]:[]),
  axis("PREQUAL","Préqualification",prequalScore,
   prequalScore==null?"Aucun profil pertinent ne permet encore de mesurer la complétude de préqualification.":`${prequalScore}% des profils pertinents ont disponibilité, intérêt et rémunération renseignés.`,
   [`${i.prequalifiedMatches}/${i.relevantMatches} profil(s) pertinent(s) préqualifié(s)`],
   prequalScore!=null&&prequalScore<80?["Prioriser la collecte de disponibilité, intérêt et rémunération avant présentation client."]:[]),
  axis("RELATION","Continuité relationnelle",relationScore,
   relationScore==null?"Aucune interaction relationnelle mesurable pour le moment.":`${i.activities} interaction(s) enregistrée(s), dont ${i.completedActivities} terminée(s).`,
   [`Couverture relationnelle : ${relationCoverage??0}%`,`Actions terminées : ${completion??0}%`],
   relationScore!=null&&relationScore<80?["Créer une prochaine action pour chaque profil réellement suivi et clôturer les actions après contact."]:[]),
  axis("REACTIVITY","Réactivité / SLA",reactionScore,
   reactionScore==null?"Aucune action planifiée ne permet encore de mesurer le respect des délais.":i.overdueActivities?`${i.overdueActivities} action(s) dépassent leur échéance.`:"Aucune action planifiée en retard.",
   [`${i.overdueActivities}/${i.plannedActivities} action(s) planifiée(s) en retard`],
   i.overdueActivities?["Traiter les actions en retard et ajuster les SLA si les délais définis ne sont pas réalistes."]:[]),
  axis("CONTINUITY","Absence de silence",continuityScore,
   continuityScore==null?"Pas assez de parcours actifs pour mesurer les périodes de silence.":i.stagnantMatches||i.clientSharesWithoutFeedback?`${i.stagnantMatches} parcours candidat(s) et ${i.clientSharesWithoutFeedback} partage(s) client nécessitent une attention.`:"Aucun signal de stagnation détecté.",
   [`Parcours actifs stagnants : ${i.stagnantMatches}`,`Partages client sans retour : ${i.clientSharesWithoutFeedback}`],
   continuityScore!=null&&continuityScore<80?["Relancer en priorité les parcours sans mouvement et informer le candidat même lorsqu'aucune décision client n'est encore disponible."]:[]),
  axis("LISTENING","Écoute candidat",listeningScore,
   listeningScore==null?"L'Observatoire n'a pas encore assez de retours candidat pour qualifier cette dimension.":`Taux de réponse questionnaire ${listeningCoverage??0}% ; qualité perçue ${experienceScore??0}/100.`,
   [`${i.surveyResponses}/${i.surveys} questionnaire(s) complété(s)`,...(experienceScore!=null?[`Expérience moyenne : ${experienceScore}/100`]:[])],
   listeningScore!=null&&listeningScore<80?["Déclencher les questionnaires aux étapes clés et analyser les notes faibles par dimension."]:i.surveys===0?["Commencer à demander un retour candidat sur quelques parcours représentatifs."]:[])
 ];
 const measurable=axes.filter(a=>a.score!=null);
 const score=measurable.length?Math.round(measurable.reduce((s,a)=>s+a.score!,0)/measurable.length):null;
 const risks=axes.filter(a=>a.level==="RISK").length;
 const strengths=axes.filter(a=>a.level==="GOOD").length;
 const priorities=axes.flatMap(a=>a.recommendations.map(r=>({r,score:a.score??101}))).sort((a,b)=>a.score-b.score).slice(0,4).map(x=>x.r);
 return{score,level:level(score),axes,risks,strengths,priorities};
}

export function auditLevelLabel(l:AuditLevel){return l==="GOOD"?"Maîtrisé":l==="WATCH"?"À surveiller":l==="RISK"?"Friction probable":"Non mesurable"}
