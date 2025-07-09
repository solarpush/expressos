# ExpressOS - Intégration avec TimeAZ

## 🚀 Utilisation d'ExpressOS dans le monorepo

ExpressOS est maintenant disponible en tant que package dans ce monorepo. Vous pouvez l'utiliser pour créer de nouveaux services Express avec une architecture propre.

### Installation globale

```bash
cd packages/expressos
npm link
```

### Créer un nouveau service

```bash
# Dans le dossier racine du monorepo
cd packages
expressos my-new-service
```

### Structure générée

ExpressOS génère une structure standardisée :

```md
my-new-service/
├── src/
│ ├── framework/ # Framework de base
│ │ ├── createController.ts # Factory de contrôleurs validés
│ │ └── loadRoutes.ts # Chargement automatique des routes
│ ├── modules/ # Modules métier
│ │ └── example/  
│ │ ├── input.ts # Schéma d'entrée (Zod)
│ │ ├── output.ts # Schéma de sortie (Zod)
│ │ ├── useCase.ts # Logique métier
│ │ └── index.ts # Définition des routes
│ ├── services/ # Container de services
│ ├── middlewares/ # Middlewares Express
│ ├── configs/ # Fichiers de configuration
│ └── index.ts # Point d'entrée
├── package.json
├── tsconfig.json
└── README.md
```

**Ajouter des modules spécifiques** :

```bash
expressos generate module user
expressos generate module project
```

### Avantages d'ExpressOS

- **Architecture standardisée** : Tous les services suivent la même structure
- **Validation automatique** : Zod intégré pour la validation des entrées/sorties
- **TypeScript first** : Support complet de TypeScript
- **Routing automatique** : Les modules sont automatiquement enregistrés
- **Clean Architecture** : Séparation claire des responsabilités
- **Framework agnostic** : Compatible Firebase Functions, Vercel, AWS Lambda, etc.
- **Chargement synchrone** : La fonction `createApp()` retourne directement l'app Express configurée

### Commandes disponibles

```bash
# Créer un nouveau service
expressos my-service

# Générer un use case (format simple)
expressos usecase user-management

# Générer un use case (format hiérarchique)
expressos usecase auth create
expressos usecase auth update
expressos usecase user profile

# Générer un service
expressos service notification

# Générer un middleware
expressos middleware authentication

# Commande générique pour générer des composants
expressos generate module product
expressos generate usecase order-processing
expressos g service email

# Aide
expressos --help

# Version
expressos --version
```

### Exemple d'utilisation

1. Créer un service :

   ```bash
   expressos time-tracking-service
   ```

2. Installer les dépendances :

   ```bash
   cd time-tracking-service
   npm install
   ```

3. Générer des composants :

   ```bash
   # Générer un use case simple
   expressos usecase time-entry

   # Générer des use cases hiérarchiques par domaine
   expressos usecase auth login
   expressos usecase auth logout
   expressos usecase timer start
   expressos usecase timer stop

   # Générer un service
   expressos service timer

   # Générer un middleware
   expressos middleware auth
   ```

4. Démarrer en développement :

   ```bash
   npm run dev
   ```

5. **Pour Firebase Functions** - Utiliser la fonction `createApp()` :

   ```typescript
   // functions/src/index.ts
   import { onRequest } from "firebase-functions/v2/https";
   import { createApp } from "./api/src/index";

   const app = createApp();
   export const api = onRequest(app);
   ```

6. Tester les endpoints :

   ```bash
   curl http://localhost:3000/api/health
   curl -X POST http://localhost:3000/api/example \
     -H "Content-Type: application/json" \
     -d '{"message":"Hello ExpressOS"}'
   curl -X POST http://localhost:3000/api/time-entry \
     -H "Content-Type: application/json" \
     -d '{"id":"123"}'
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"id":"user123"}'
   curl -X POST http://localhost:3000/api/timer/start \
     -H "Content-Type: application/json" \
     -d '{"id":"timer123"}'
   ```

### Fonctionnalités des générateurs

#### Use Case

- Génère un module complet avec validation Zod
- **Format simple** : `expressos usecase user-management` → `modules/userManagement/`
- **Format hiérarchique** : `expressos usecase auth create` → `modules/auth/create/`
- Fichiers : `input.ts`, `output.ts`, `useCase.ts`, `index.ts` (routes)
- Routes automatiques : `/api/user-management` ou `/api/auth/create`
- Intégration automatique avec le framework de contrôleurs validés

#### Service

- Génère une interface et une implémentation CRUD
- Ajout automatique au container de services
- Template avec méthodes get, create, update, delete

#### Middleware

- Génère un middleware Express avec options configurables
- Template avec validation et exemples d'utilisation

#### Module (via generate)

- Équivalent à un use case mais avec intention de module complet

### Prochaines étapes

- [x] Implémenter la génération d'use cases (`expressos usecase <name>`)
- [x] Implémenter la génération de services (`expressos service <name>`)
- [x] Implémenter la génération de middlewares (`expressos middleware <name>`)
- [x] Ajouter la commande générique (`expressos generate <type> <name>`)
- [x] Support de la structure hiérarchique pour les use cases (`expressos usecase domain action`)
- [x] Fonction `createApp()` synchrone compatible Firebase Functions
- [ ] Ajouter des templates pour différents types de services
- [ ] Intégrer avec le système de déploiement existant
- [ ] Ajouter des tests automatiques pour les services générés
- [ ] Générer des tests unitaires pour les composants générés
- [ ] Ajouter des templates avancés (CRUD complet, authentification, etc.)
- [ ] Support des middlewares globaux configurables
- [ ] Templates spécialisés pour Firebase, Vercel, AWS Lambda
