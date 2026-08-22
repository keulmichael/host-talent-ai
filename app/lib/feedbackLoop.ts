export type CandidateFeedbackLike={clarity:number;responsiveness:number;respect:number;transparency:number;recommendation:number;comment?:string|null};
export type FeedbackInsight={dimension:string;severity:"HIGH"|"MEDIUM"|"LOW";cause:string;action:string;activityType:"FOLLOW_UP"|"CONTACT"|"POST_INTERVIEW"|"NOTE";channel:"EMAIL"|"PHONE"|"MEETING"|"OTHER"};

export function feedbackInsights(f:CandidateFeedbackLike):FeedbackInsight[]{
 const out:FeedbackInsight[]=[];
 if(f.responsiveness<=2)out.push({dimension:"Réactivité",severity:"HIGH",cause:"Le candidat perçoit un délai ou un manque de suivi.",action:"Recontacter le candidat rapidement, confirmer la prochaine étape et planifier une relance datée.",activityType:"FOLLOW_UP",channel:"EMAIL"});
 if(f.transparency<=2)out.push({dimension:"Transparence",severity:"HIGH",cause:"Les prochaines étapes ou délais semblent insuffisamment explicites.",action:"Clarifier le statut du processus, les prochaines étapes, le responsable du retour et le délai attendu.",activityType:"CONTACT",channel:"EMAIL"});
 if(f.clarity<=2)out.push({dimension:"Clarté",severity:"MEDIUM",cause:"Les informations relatives à la mission ou au processus sont jugées insuffisamment claires.",action:"Reformuler les informations essentielles de la mission et vérifier que le candidat a compris le contexte, les critères et le déroulé.",activityType:"CONTACT",channel:"PHONE"});
 if(f.respect<=2)out.push({dimension:"Respect",severity:"HIGH",cause:"Le candidat signale une expérience relationnelle dégradée.",action:"Prévoir une reprise de contact humaine prioritaire pour comprendre le ressenti et rétablir une relation de qualité.",activityType:"CONTACT",channel:"PHONE"});
 if(f.recommendation<=6)out.push({dimension:"Recommandation",severity:"MEDIUM",cause:"Le candidat est détracteur du parcours et pourrait ne pas recommander le cabinet.",action:"Analyser le verbatim, identifier le point de rupture principal et documenter une action d’amélioration du processus.",activityType:"NOTE",channel:"OTHER"});
 if(!out.length&&f.recommendation<=8)out.push({dimension:"Recommandation",severity:"LOW",cause:"L’expérience est correcte mais encore perfectible.",action:"Examiner le commentaire candidat et identifier un ajustement léger du parcours.",activityType:"NOTE",channel:"OTHER"});
 return out;
}

export function feedbackRiskScore(f:CandidateFeedbackLike){
 const dims=[f.clarity,f.responsiveness,f.respect,f.transparency];
 const weak=dims.filter(v=>v<=2).length;
 const average=dims.reduce((a,b)=>a+b,0)/dims.length;
 return Math.max(0,Math.min(100,Math.round(weak*18+(5-average)*10+(10-f.recommendation)*3)));
}
