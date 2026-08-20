# Host Talent AI — V1.6

Copilote opérationnel sécurisé pour cabinets de recrutement et cabinets de conseil RH.

## Fonctions métier

- création de missions ;
- import CV PDF/DOCX/texte ;
- extraction de compétences et détection des mentions négatives/limitées ;
- matching explicable candidat ↔ mission ;
- questions de préqualification ;
- recherche dans le vivier ;
- pipeline : à examiner, short-list, contacté, entretien, présenté client, offre, recruté, en attente, non retenu ;
- notes recruteur et prochaine action ;
- export CSV ;
- recalcul global ;
- dashboard opérationnel.

## Sécurité V1.6

- authentification par e-mail et mot de passe ;
- mots de passe hachés avec PBKDF2 ;
- sessions persistantes stockées en base, cookie HTTP-only ;
- comptes Administrateur / Recruteur ;
- activation et désactivation des utilisateurs ;
- données rattachées à un `Organization` et requêtes cloisonnées par cabinet ;
- journal d'audit des actions sensibles ;
- changement de mot de passe avec invalidation des sessions ;
- suppression définitive d'un candidat et de ses matchings associés ;
- export limité au cabinet connecté.

## Première mise en service

1. Ouvrir `/setup` sur le domaine de production.
2. Saisir le nom du cabinet, le nom du premier administrateur, son e-mail et un mot de passe d'au moins 10 caractères.
3. Le premier administrateur est créé et connecté automatiquement.
4. L'administrateur peut ensuite créer les comptes recruteurs depuis `Utilisateurs`.

L'initialisation `/setup` n'est acceptée que si aucun utilisateur n'existe encore.

## Principe de sécurité métier

Le score est une aide à la revue. Une absence de preuve dans un CV n'est pas assimilée à une incompatibilité. Aucune décision de recrutement ou de rejet n'est automatisée.

## Étapes production suivantes

Avant une diffusion SaaS large : stockage persistant et chiffré des fichiers CV originaux, politique de conservation configurable, récupération de compte/mot de passe, 2FA/SSO selon offre, sauvegardes et tests de sécurité formalisés.
