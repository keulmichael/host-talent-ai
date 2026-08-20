# Host Talent AI — V1.7

Copilote opérationnel sécurisé pour cabinets de recrutement et cabinets de conseil RH.

## Fonctions métier

- création de missions ;
- import CV PDF/DOCX/TXT ;
- extraction de compétences ;
- détection des mentions négatives ou limitées ;
- matching explicable candidat ↔ mission ;
- questions de préqualification ;
- recherche sémantique locale dans le vivier, sans envoi des CV à un fournisseur IA externe ;
- pipeline : à examiner, short-list, contacté, entretien, présenté client, offre, recruté, en attente, non retenu ;
- notes recruteur et prochaine action ;
- export CSV du vivier et export JSON individuel ;
- recalcul global ;
- dashboard opérationnel.

## Sécurité et multi-cabinet

- authentification e-mail / mot de passe ;
- mots de passe hachés PBKDF2 ;
- sessions persistantes en base et cookie HTTP-only ;
- rôles Administrateur / Recruteur ;
- activation et désactivation des utilisateurs ;
- cloisonnement des missions, candidats et matchings par `Organization` ;
- journal d'audit des actions sensibles ;
- changement de mot de passe avec invalidation des sessions ;
- export et suppression limités au cabinet connecté.

## Confidentialité V1.7

- durée de conservation par défaut configurable par le cabinet ;
- durée ajustable lors de chaque import candidat ;
- origine du profil et note confidentialité ;
- tableau de bord des échéances de conservation ;
- export individuel des données d'un candidat ;
- suppression du candidat et de ses matchings ;
- journalisation des exports et téléchargements ;
- stockage du CV original dans Vercel Blob privé si un store Blob est connecté ;
- téléchargement du CV original uniquement via une route authentifiée ;
- suppression du Blob lors de l'effacement du candidat.

## Activation du stockage privé

Connecter un store Vercel Blob privé au projet. Vercel fournit alors `BLOB_READ_WRITE_TOKEN` au projet. Sans cette variable, l'import et le matching restent fonctionnels mais seul le texte extrait est conservé en base.

## Principe métier

Le score est une aide à la revue. Une absence de preuve dans un CV n'est pas assimilée à une incompatibilité. Aucune décision de recrutement ou de rejet n'est automatisée.

## Limites avant diffusion SaaS large

Prévoir encore : récupération de compte, 2FA/SSO selon offre, sauvegardes et restauration testées, revue juridique de la politique de conservation, analyse de sécurité formalisée, monitoring, intégrations ATS/CRM et recherche vectorielle/LLM optionnelle si un cabinet la souhaite.
