# Host Talent AI V1 — Déploiement direct sur Vercel

Cette version est préparée pour Vercel avec PostgreSQL.

## Architecture V1

- Next.js / TypeScript
- Prisma ORM
- PostgreSQL serverless (Neon recommandé)
- Déploiement Vercel
- Aucun appel API IA payant dans cette V1

## Méthode recommandée : GitHub → Vercel

Vercel déploie normalement un projet depuis un dépôt Git.

### 1. Mettre le projet sur GitHub

Créer un nouveau dépôt, par exemple :

`host-talent-ai`

Puis envoyer le contenu de ce dossier dans le dépôt.

### 2. Créer le projet Vercel

Dans Vercel :

- Add New → Project
- Import Git Repository
- sélectionner `host-talent-ai`
- Framework Preset : Next.js
- ne pas déployer tant que la base n'est pas connectée si Vercel le permet ; sinon le premier build peut échouer puis être relancé.

### 3. Ajouter PostgreSQL

Dans le projet Vercel :

- Storage / Marketplace
- installer **Neon**
- créer une base Postgres
- connecter la base au projet Vercel

L'intégration ajoute `DATABASE_URL` dans les variables d'environnement du projet.

### 4. Vérifier les variables

Dans :

Project → Settings → Environment Variables

vérifier :

`DATABASE_URL`

Elle doit commencer par `postgresql://` ou `postgres://`.

### 5. Déployer

Le script de build est déjà préparé :

`prisma migrate deploy && next build`

et `postinstall` exécute :

`prisma generate`

Au premier build, Prisma applique la migration initiale puis Next.js construit l'application.

### 6. Ajouter les données de démonstration (facultatif)

Le seed ne doit pas être exécuté automatiquement en production.

Si tu veux les deux candidats et la mission de démonstration, exécute le seed depuis ton PC avec la `DATABASE_URL` de production :

```powershell
npm install
$env:DATABASE_URL="COLLER_ICI_LA_DATABASE_URL"
npm run db:seed
```

Attention : le seed V1 supprime les données existantes avant de recréer la démo. Ne plus l'utiliser après avoir commencé à saisir de vraies données.

### 7. Tester

Ouvrir l'URL Vercel, puis :

1. Créer une mission.
2. Importer un candidat.
3. Ouvrir la mission.
4. Cliquer sur `Rechercher dans le vivier`.

## Important : stockage des CV

La V1 extrait le texte du CV au moment de l'import et l'enregistre en base, mais elle ne conserve pas encore le fichier PDF/DOCX original dans un stockage persistant.

Pour la V1.1, ajouter Vercel Blob, S3 ou Supabase Storage afin de conserver les fichiers originaux.

## Important : production RH

Cette V1 est un prototype fonctionnel. Avant utilisation avec de vraies données candidats, ajouter au minimum :

- authentification ;
- organisations / multi-tenant ;
- droits d'accès ;
- politique de conservation ;
- suppression/export des données ;
- journalisation ;
- stockage sécurisé des CV ;
- information RGPD adaptée.
