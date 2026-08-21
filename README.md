# Host Talent AI — V1.9

Copilote opérationnel sécurisé pour cabinets de recrutement et cabinets de conseil RH.

## Parcours métier

- création de missions ;
- import CV PDF/DOCX/TXT ;
- extraction de compétences et détection des mentions négatives/limitées ;
- matching explicable candidat ↔ mission ;
- recherche sémantique locale dans le vivier ;
- comparaison côte à côte des meilleurs profils ;
- pipeline recruteur ;
- short-list et dossier client imprimable ;
- disponibilité, TJM et prétention salariale ;
- partage sécurisé d'une short-list au client ;
- retours client structurés par profil ;
- export CSV, JSON individuel et JSON ATS/CRM enrichi ;
- dashboard de suivi.

## V1.9 — portail client

Depuis une mission, le recruteur peut ouvrir `Portail client`, créer un lien temporaire (3, 7, 14 ou 30 jours), le copier et l'envoyer à son client. Le lien est généré avec un secret aléatoire dont seul le hash SHA-256 est conservé en base. Il est révocable et sa date d'expiration est contrôlée côté serveur.

Le client voit uniquement les profils retenus dans la short-list/process. Les e-mails candidats, notes internes du recruteur, prochaines actions et fichiers CV privés ne sont pas exposés. Pour chaque profil, il peut transmettre un retour : intéressé, souhaite un entretien, à garder en attente ou ne pas poursuivre, avec commentaire facultatif.

Le cabinet voit ensuite les retours, le nombre de vues, la dernière consultation et peut révoquer le lien.

## Données commerciales candidat

Le recruteur peut enregistrer :

- disponibilité ;
- TJM souhaité ;
- prétention salariale annuelle.

Ces informations apparaissent dans le comparateur, le dossier client, le portail client et l'export ATS/CRM.

## Sécurité et multi-cabinet

- authentification e-mail / mot de passe ;
- mots de passe hachés PBKDF2 ;
- sessions persistantes en base et cookie HTTP-only ;
- rôles Administrateur / Recruteur ;
- cloisonnement par `Organization` ;
- journal d'audit ;
- changement de mot de passe et invalidation des sessions ;
- stockage privé Vercel Blob des CV originaux ;
- téléchargement authentifié et suppression cohérente Blob + données ;
- politique de conservation configurable et export RGPD.

## Principe métier

Le score est une aide à la revue. Une absence de preuve dans un CV n'est pas assimilée à une incompatibilité. Aucune décision de recrutement ou de rejet n'est automatisée.

## Étapes suivantes

Pour une V2 SaaS plus large : récupération de compte, 2FA/SSO selon l'offre, sauvegardes/restauration testées, connecteurs ATS/CRM natifs, calendrier/e-mail, monitoring métier, API partenaire et recherche vectorielle/LLM optionnelle selon le cabinet.
