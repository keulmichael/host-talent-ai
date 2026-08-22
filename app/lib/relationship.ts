export type RelationshipInput = {
  stage:string;
  score:number;
  missing:string;
  questions:string;
  candidateInterest:string|null;
  availability:string|null;
  dailyRate:number|null;
  salaryExpectation:number|null;
  candidateName:string;
  candidateEmail:string|null;
  jobTitle:string;
  clientName:string|null;
};

export type RecommendedAction = {
  type:string;
  label:string;
  reason:string;
  channel:string;
  priority:"HIGH"|"NORMAL"|"LOW";
};

export function recommendedAction(input:RelationshipInput):RecommendedAction{
  const requiredMissing=input.missing.split(",").map(x=>x.trim()).filter(Boolean);
  if(input.stage==="HIRED")return{type:"POST_INTERVIEW",label:"Clôturer le parcours candidat",reason:"Le recrutement est finalisé : confirmer la bonne réception des informations et archiver le suivi.",channel:"EMAIL",priority:"LOW"};
  if(input.stage==="OFFER")return{type:"FOLLOW_UP",label:"Suivre la proposition",reason:"Une offre est en cours : vérifier la réception, les questions éventuelles et la date de décision.",channel:"EMAIL",priority:"HIGH"};
  if(input.stage==="CLIENT")return{type:"FOLLOW_UP",label:"Informer le candidat du retour client",reason:"Le profil a été présenté : maintenir le candidat informé et éviter une période de silence.",channel:"EMAIL",priority:"NORMAL"};
  if(input.stage==="INTERVIEW")return{type:"POST_INTERVIEW",label:"Faire le suivi post-entretien",reason:"Recueillir le ressenti du candidat et confirmer la prochaine étape.",channel:"EMAIL",priority:"NORMAL"};
  if(input.stage==="CONTACTED")return{type:"FOLLOW_UP",label:"Relancer ou planifier l’entretien",reason:"Le premier contact a eu lieu : faire progresser le parcours ou relancer si nécessaire.",channel:"EMAIL",priority:"NORMAL"};
  if(requiredMissing.length)return{type:"CONTACT",label:"Préqualifier les critères à vérifier",reason:`${requiredMissing.length} critère(s) requis restent à confirmer avant positionnement.`,channel:"PHONE",priority:"HIGH"};
  if(!input.availability||(!input.dailyRate&&!input.salaryExpectation)||!input.candidateInterest)return{type:"CONTACT",label:"Compléter la préqualification",reason:"Le profil est pertinent mais disponibilité, intérêt ou rémunération restent à confirmer.",channel:"PHONE",priority:"HIGH"};
  if(input.score>=70)return{type:"INTERVIEW",label:"Proposer un entretien de qualification",reason:"Le matching est favorable et les informations clés sont disponibles.",channel:"MEETING",priority:"HIGH"};
  return{type:"CONTACT",label:"Clarifier l’intérêt et l’adéquation",reason:"Le profil mérite une validation humaine avant toute présentation.",channel:"PHONE",priority:"NORMAL"};
}

function firstName(fullName:string){return fullName.trim().split(/\s+/)[0]||"Bonjour"}

export function messageTemplate(kind:string,input:RelationshipInput){
  const first=firstName(input.candidateName);
  const client=input.clientName?` pour ${input.clientName}`:"";
  const job=input.jobTitle;
  if(kind==="RECEIPT")return{subject:`Votre candidature / profil – ${job}`,body:`Bonjour ${first},\n\nNous avons bien reçu votre CV et l'avons intégré à notre processus de recherche pour la mission « ${job} »${client}.\n\nVotre profil va être examiné par un consultant. Nous reviendrons vers vous si des éléments complémentaires sont nécessaires ou si une prochaine étape est pertinente.\n\nBien cordialement`};
  if(kind==="CONTACT")return{subject:`Échange au sujet de la mission ${job}`,body:`Bonjour ${first},\n\nVotre profil présente plusieurs correspondances avec la mission « ${job} »${client}. Je souhaite échanger avec vous afin de confirmer quelques éléments : votre intérêt pour la mission, votre disponibilité et, selon votre situation, votre TJM ou vos prétentions salariales.\n\nSeriez-vous disponible pour un échange court ?\n\nBien cordialement`};
  if(kind==="INTERVIEW")return{subject:`Proposition d'entretien – ${job}`,body:`Bonjour ${first},\n\nÀ la suite de l'analyse de votre profil pour la mission « ${job} »${client}, je vous propose un entretien de qualification afin d'approfondir votre expérience et le contexte de la mission.\n\nPouvez-vous me communiquer vos disponibilités pour convenir d'un créneau ?\n\nBien cordialement`};
  if(kind==="POST_INTERVIEW")return{subject:`Suite à notre échange – ${job}`,body:`Bonjour ${first},\n\nMerci pour notre échange concernant la mission « ${job} »${client}. Je souhaitais m'assurer que vous disposez de toutes les informations utiles et recueillir votre ressenti sur la suite du processus.\n\nJe vous tiendrai informé(e) de la prochaine étape dès que possible.\n\nBien cordialement`};
  return{subject:`Suivi de votre candidature – ${job}`,body:`Bonjour ${first},\n\nJe reviens vers vous concernant la mission « ${job} »${client}. Votre profil est toujours suivi dans notre processus et je souhaitais vous tenir informé(e) de son avancement.\n\nN'hésitez pas à me signaler tout changement de disponibilité ou de situation.\n\nBien cordialement`};
}
