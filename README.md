# Host Talent AI — V1.8

Copilote opérationnel sécurisé pour cabinets de recrutement et cabinets de conseil RH.

## Fonctions métier

- création de missions ;
- import CV PDF/DOCX/TXT ;
- extraction de compétences ;
- détection des mentions négatives ou limitées ;
- matching explicable candidat ↔ mission ;
- questions de préqualification ;
- recherche sémantique locale dans le vivier, sans envoi des CV à un fournisseur IA externe ;
- comparaison côte à côte des meilleurs profils d'une mission ;
- short-list client pilotée depuis les étapes du pipeline ;
- dossier client imprimable / exportable en PDF sans notes recruteur internes ;
- pipeline : à examiner, short-list, contacté, entretien, présenté client, offre, recruté, en attente, non retenu ;
- notes recruteur et prochaine action ;
- export CSV du vivier, export JSON individuel et export JSON structuré mission pour intégration ATS/CRM ;
- recalcul global ;
- dashboard opérationnel avec suivi des short-lists.

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

## Confidentialité et stockage privé

- durée de conservation par défaut configurable par le cabinet ;
- durée ajustable lors de chaque import candidat ;
- origine du profil et note confidentialité ;
- tableau de bord des échéances de conservation ;
- export individuel des données d'un candidat ;
- suppression du candidat et de ses matchings ;
- journalisation des exports et téléchargements ;
- stockage du CV original dans Vercel Blob privé ;
- compatibilité avec le store projet Vercel via `BLOB_STORE_ID` et l'authentification OIDC du runtime, avec prise en charge de l'ancien token statique si présent ;
- téléchargement du CV original uniquement via une route authentifiée ;
- suppression du Blob lors de l'effacement du candidat.

## V1.8 — présentation client et interopérabilité

Depuis une mission :

1. analyser le vivier ;
2. comparer les cinq meilleurs candidats dans `/jobs/[id]/compare` ;
3. ajouter les profils retenus à la short-list ;
4. générer le dossier client dans `/jobs/[id]/client` ;
5. imprimer ou enregistrer le dossier en PDF ;
6. exporter la mission et ses candidats au format JSON normalisé via `/api/jobs/[id]/export` pour préparer une connexion ATS/CRM.

Le dossier client n'affiche pas les notes recruteur internes, les prochaines actions ni les coordonnées privées utilisées en interne.

## Principe métier

Le score est une aide à la revue. Une absence de preuve dans un CV n'est pas assimilée à une incompatibilité. Aucune décision de recrutement ou de rejet n'est automatisée.

## Limites avant diffusion SaaS large

Prévoir encore : récupération de compte, 2FA/SSO selon offre, sauvegardes et restauration testées, revue juridique de la politique de conservation, analyse de sécurité formalisée, monitoring, connecteurs ATS/CRM natifs et recherche vectorielle/LLM optionnelle si un cabinet la souhaite.
