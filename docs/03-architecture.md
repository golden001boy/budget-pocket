# 03 — Architecture

**Commande BMAD** : `bmad archi`
**Statut** : rétroactif — décrit le système tel qu'il est aujourd'hui, pas tel
qu'il était prévu. Voir [01-brainstorming.md](01-brainstorming.md) et
[02-prd.md](02-prd.md).

---

## 1. Stack technique + justification

| Composant | Choix | Justification |
|---|---|---|
| Monorepo | pnpm workspaces + Turborepo | Un seul dépôt pour web + mobile + packages partagés, avec cache de build par tâche |
| Web | Next.js 14 (App Router), TypeScript | Route Handlers = API + pages dans un seul framework ; SSR pour les pages authentifiées |
| Mobile | Expo SDK 51 (Expo Router), React Native 0.74 | Développement iOS/Android unifié sans code natif séparé ; consomme la même API que le web |
| BDD | PostgreSQL via Prisma ORM | Types générés depuis le schéma, migrations versionnées, `Decimal` natif pour les montants |
| Cache | Redis (`ioredis`) | Fronts les lectures lentes/répétées (prix de marché) |
| Auth | NextAuth (Credentials + JWT) | Session web standard ; un second flux (`/api/auth/mobile`) encode un JWT compatible pour le mobile sans backend séparé |
| Paiement | Stripe | Checkout + webhook + portail, standard du marché |
| IA | Groq (défaut) / Anthropic (fallback) | Groq gratuit et rapide pour le français ; Anthropic en option payante déjà câblée |
| Déploiement web | Vercel (implicite via `vercel.json`) | Cron jobs natifs, adapté à Next.js |

## 2. Arborescence des fichiers

```
apps/
  web/      Next.js 14 (App Router) — surface produit principale
  mobile/   Expo / React Native (Expo Router) — app mobile compagnon
packages/
  shared/       Schémas Zod, types DTO, constantes (catégories, devises, thème,
                 providers) partagés entre web et mobile
  api-client/   Wrapper fetch typé consommé par le mobile (et réutilisable côté
                 web) — un fichier par ressource
docs/       Livrables BMAD (ce dossier)
specs/      Détail par epic (critères d'acceptation, fichiers) référencé depuis 02-prd.md
```

`packages/shared` est la source de vérité unique pour les types transverses
(ex. `PortfolioItemDTO`, `AssetClass`) afin que web et mobile ne divergent pas
silencieusement — voir [packages/shared/src/types/](../packages/shared/src/types/).

### Web (`apps/web`)

- **Route groups** : `(auth)` (login/register), `(dashboard)` (surface
  authentifiée), `(onboarding)`, `admin/` — voir [apps/web/src/app/](../apps/web/src/app/).
- **API** : Route Handlers sous `src/app/api/**/route.ts`, un dossier par
  ressource. Forme standard : `getServerSession` → 401 si absent →
  validation Zod du body → appel Prisma → `NextResponse.json`.
- **Accès données** : Prisma Client en singleton pour survivre au hot-reload
  ([apps/web/src/lib/prisma.ts](../apps/web/src/lib/prisma.ts)). Le client
  généré n'est **pas** versionné (`node_modules/.prisma`) — `apps/web/package.json`
  lance `prisma generate` en `postinstall` pour qu'il soit toujours régénéré
  après `pnpm install`.
- **Jobs de fond** : 4 endpoints sous `api/cron/*`, planifiés par
  [vercel.json](../apps/web/vercel.json) (prix horaire, snapshots quotidiens,
  alertes quotidiennes, récurrences quotidiennes). Chacun vérifie
  `Authorization: Bearer $CRON_SECRET` — c'est la seule protection de ces
  routes, donc `CRON_SECRET` doit rester privé.
- **Posture de build** : `next.config.mjs` a `typescript.ignoreBuildErrors: true`
  et `eslint.ignoreDuringBuilds: true` — le build de prod n'est pas bloqué par
  les erreurs de type/lint. `pnpm type-check` reste le vrai gate et doit être
  exécuté en CI (non encore fait — voir story 15.6).

### Mobile (`apps/mobile`)

- `(auth)` pour le login, `(tabs)` pour le shell authentifié (accueil,
  dépenses, investissements, conseiller, réglages), plus `modals/add-transaction`.
- `lib/mfetch.ts` attache le jeton bearer stocké (`expo-secure-store`) à chaque
  appel — le mobile n'a pas de backend propre, il consomme l'API web.

## 3. Modèle de données

PostgreSQL via Prisma, 19 modèles
([apps/web/prisma/schema.prisma](../apps/web/prisma/schema.prisma)), groupés
par domaine :

- **Identité/facturation** : `User`, `Session`, `Subscription`
- **Mouvement d'argent** : `LinkedAccount`, `Transaction`, `RecurringRule`, `CustomCategory`
- **Planification** : `Budget`, `FinancialGoal`, `RetirementPlan`, `TaxRecord`, `Scenario`
- **Investissement** : `PortfolioItem`, `AssetPriceSnapshot`
- **Engagement** : `Alert`, `AIConversation`, `AIMessage`, `MonthlySnapshot`, `NewsletterSubscriber`

Les montants sont toujours `Decimal(18,2)` (jamais `Float`). La plupart des
modèles user-scoped ont une contrainte d'unicité composite (ex. `Budget` est
unique sur `[userId, category, month, year]`) pour sécuriser les upserts.

### Protections N+1

Les routes actuelles interrogent des collections à plat (`findMany`/`findUnique`
sans relation imbriquée à risque) — pas de N+1 identifié à ce jour. Point de
vigilance pour les évolutions futures : si une route commence à inclure une
relation (ex. transactions + compte lié), utiliser `include`/`select` explicite
plutôt qu'une boucle de requêtes, et documenter ici.

## 4. Flows et séquences

**Connexion web** : formulaire → `signIn('credentials')` (NextAuth) →
`authorize()` vérifie `bcrypt.compare` contre `User.passwordHash` → callback
`jwt` peuple `id/role/currency/onboardingDone` → callback `session` les expose
sur `session.user` → cookie de session (HttpOnly/Secure/SameSite par défaut
NextAuth).

**Connexion mobile** : `POST /api/auth/mobile` (email+password) → même
vérification `bcrypt` → `encode()` (next-auth/jwt) produit un jeton avec la
même forme que le JWT web → l'app mobile le stocke via `expo-secure-store` et
l'attache en `Authorization: Bearer` sur chaque appel API suivant.

**Mutation avec autorisation par objet** (ex. `PATCH /api/transactions/[id]`) :
session requise → `findUnique({ where: { id } })` → **vérification explicite
`tx.userId === session.user.id`** avant toute lecture/écriture → 404 si
l'objet n'appartient pas à l'appelant (pas 403, pour ne pas révéler
l'existence de l'objet). Ce pattern est appliqué dans
`transactions/[id]`, `goals/[id]` — voir [04-tests.md](04-tests.md) BE-01/API-01
pour la couverture exhaustive.

**Job cron** : Vercel invoque `POST /api/cron/{job}` selon le planning →
handler vérifie `Authorization: Bearer $CRON_SECRET` → traite → retourne un
résumé JSON. Pas de session utilisateur impliquée.

## 5. APIs — contrats, formats, erreurs

- **Format de succès** : soit l'objet/la liste directement
  (`NextResponse.json(items)`), soit enveloppé `{ data: ... }` selon la route
  — **incohérent d'une route à l'autre** (ex. `/api/portfolio` renvoie un
  tableau brut, `/api/transactions` renvoie `{ transactions, total }`). Non
  documenté formellement à ce jour — à corriger avant d'ouvrir l'API à des
  consommateurs externes.
- **Format d'erreur** : `{ error: string }` avec status HTTP approprié (401
  non authentifié, 404 non trouvé/non autorisé, 400 validation échouée). Pas
  de code d'erreur structuré (`code: "..."`) sur la plupart des routes, sauf
  exception ponctuelle (`FEATURE_DISABLED` sur `/api/advisor/chat`).
- **Incohérence relevée (story 15.2)** : les routes API sous le matcher de
  `middleware.ts` (voir [apps/web/src/middleware.ts](../apps/web/src/middleware.ts))
  reçoivent une redirection `307` vers `/api/auth/signin` si non
  authentifiées, **avant** même d'atteindre le `getServerSession` du handler
  — donc jamais le `401 { error: ... }` JSON attendu par un client API/mobile.
  Le contrôle `if (!session) return NextResponse.json(...)` dans chaque
  handler est de fait mort pour ces routes. Non corrigé ici (hors périmètre
  de 15.2) — à traiter dans une story dédiée si confirmé gênant pour le
  client mobile (`@budget-pocket/api-client`).
- **Validation** : Zod sur toutes les routes mutatives connues via
  `@budget-pocket/shared` (schémas partagés avec le mobile) depuis la story
  15.2 — voir [04-tests.md](04-tests.md) FE-08/API-03.
- **Erreurs serveur** : les erreurs Prisma non interceptées remontent leur
  message brut dans certains handlers (ex. `/api/health` expose le message
  `PrismaClientInitializationError` complet) — acceptable pour un endpoint de
  santé interne, à revoir si exposé publiquement (voir BE-09).

## 6. ADR — Architecture Decision Records

### ADR-001 — Bloquer le script `postinstall` de `react-native-screens`
**Contexte** : `react-native-screens@3.31.0` publie un `postinstall`
(`bob build && husky install`) prévu pour son propre dépôt, pas pour les
consommateurs. Sans les outils `bob`/`husky`, ce script échoue et **interrompt
tout `pnpm install`** avant que `node_modules/.bin` soit lié — cassant
silencieusement `turbo`/`tsc` pour tout le monorepo.
**Décision** : `pnpm.neverBuiltDependencies: ["react-native-screens"]` dans le
`package.json` racine.
**Conséquence** : le script de build de ce package ne tourne jamais ; sans
impact car le `dist/` publié sur npm est déjà prêt à l'emploi.

### ADR-002 — `prisma generate` en `postinstall`
**Contexte** : sans client Prisma généré, `PrismaClient` se résout
silencieusement en `any` (via la ré-export `.prisma/client/default` cassée) —
masquant de vraies erreurs de type et provoquant un crash runtime au premier
appel BDD.
**Décision** : `"postinstall": "prisma generate"` dans `apps/web/package.json`.
**Conséquence** : un `pnpm install` propre produit toujours un client Prisma à
jour, sans étape manuelle.

### ADR-003 — Un seul `@types/react`/`@types/react-dom` dans tout le workspace
**Contexte** : web (React 18.3) et mobile (React 18.2, imposé par Expo/RN)
faisaient résoudre 3 versions différentes de `@types/react`, cassant les
types des composants Radix/lucide partout ("cannot be used as a JSX
component").
**Décision** : `pnpm.overrides` fixe `@types/react`/`@types/react-dom` à
`18.3.1` pour tout le workspace.
**Conséquence** : un seul jeu de types React à maintenir ; à revalider si la
version de React du mobile change.

### ADR-004 — Rate limiting : fenêtre fixe Redis, fail-open
**Contexte** (story 15.1) : aucun rate limiting n'existait sur les routes
d'authentification (BE-07/API-04/API-06). Les fonctions serverless de Vercel
sont sans état entre invocations — un compteur en mémoire ne limiterait rien
en production (chaque instance a son propre compteur).
**Décision** :
- Backend Redis (`ioredis`, déjà utilisé pour le cache) via `INCR` + `EXPIRE`
  — algorithme *fenêtre fixe*, volontairement simple plutôt qu'une fenêtre
  glissante ou un token bucket, suffisant pour ce périmètre.
- **Fail-open** si Redis est injoignable : la requête est autorisée plutôt que
  bloquée. Un panne Redis qui empêcherait toute connexion serait pire qu'une
  fenêtre temporairement non limitée. L'échec est journalisé côté serveur
  (`console.error`).
- Périmètre limité à l'authentification (login web + mobile + inscription) —
  pas une limite générique sur toutes les routes API mutatives, pour rester
  dans l'estimation M de la story. Voir story 15.1 dans
  [02-prd.md](02-prd.md).
- Clé de limite de connexion partagée entre le flux web (NextAuth
  `authorize()`) et mobile (`/api/auth/mobile`) — `login:{email}:{ip}` — pour
  qu'un compte ciblé soit protégé quel que soit le point d'entrée utilisé par
  l'attaquant.
**Conséquence** : nécessite Redis en production pour être effectif (sinon
fail-open = pas de protection). Redis n'est pas encore configuré dans
l'environnement local à ce jour — voir [05-status.md](05-status.md).

### ADR-005 — Pas de test unitaire livré avec la story 15.1
**Contexte** : la règle de développement §6.1 du framework impose des tests
unitaires écrits avec le code. Aucun test runner n'est cependant câblé dans le
projet (`jest` est en devDependency mais sans `jest.config.js` ni script
`test` — gap déjà documenté dans [04-tests.md §6](04-tests.md#6--état-réel-de-la-suite-de-tests-automatisés)
avant même cette story).
**Décision** : ne pas câbler l'infrastructure Jest (résolution de path alias
`@/`, transform TS) *à l'intérieur* de la story de rate limiting — c'est un
prérequis transverse, pas une fonctionnalité de cette story (règle 2 : une
seule story à la fois).
**Conséquence** : story 15.9 ajoutée pour câbler Jest ; une fois faite, elle
débloque des tests unitaires réels pour `rateLimit.ts` et toutes les stories
suivantes de l'Epic 15.

## 7. Mapping Story → Fichiers affectés

Voir chaque fichier `specs/epic-XX-*.md` — chaque story y liste ses fichiers
d'implémentation avec des liens directs. Index par epic dans
[02-prd.md](02-prd.md).

## 8. Marqueurs de statut

Utilisés dans [02-prd.md](02-prd.md) et [05-status.md](05-status.md) :
✅ Done · 🟡 En cours / partiel · 🔴 À faire.

---

## 5.2 — Checklist sécurité & performance obligatoire

| # | Contrôle | Détail | État actuel |
|---|---|---|---|
| a | **Index BDD** | Index sur colonnes filtrées/triées | 🟡 `Budget`/`RecurringRule` indexés ; `Transaction.userId`/`date` non indexés explicitement (à mesurer avant montée en charge) |
| b | **Background jobs** | Pas de tâche lente dans la requête HTTP | ✅ 4 jobs cron sortent le travail lourd (prix, snapshots, alertes, récurrences) |
| c | **Pagination** | Obligatoire sur toutes les listes | 🔴 Présente sur `/api/transactions` uniquement — absente sur accounts/budgets/goals/portfolio (story 15.3) |
| d | **Secrets** | Clés API côté serveur uniquement | ✅ Toutes les clés (Stripe, Anthropic, CoinGecko...) sont lues côté serveur (`process.env`) — aucune n'est préfixée `NEXT_PUBLIC_` |
| e | **Migrations** | Tout changement de schéma via migration | ✅ `prisma migrate dev` est le seul chemin documenté (`pnpm db:migrate`) |
| f | **N+1** | Protections documentées | ✅ voir §3 — aucun risque identifié à ce jour |
| g | **TLS** | HTTPS imposé sur comms externes | 🟡 Dépend de l'hébergeur (Vercel force HTTPS) ; non vérifié en local ; aucune vérification explicite dans le code |
| h | **CORS** | Configuration restrictive, pas de `*` | ✅ Aucune configuration CORS explicite trouvée — API et front sont same-origin par design, donc pas d'exposition cross-origin |
| i | **CSP** | Content Security Policy stricte | ✅ Déployée globalement dans [next.config.mjs](../apps/web/next.config.mjs) (`default-src 'self'`, etc.) |
| j | **Coffre secrets** | Variables d'env via gestionnaire dédié | 🔴 `.env` local uniquement, pas de coffre-fort (Vault/AWS Secrets Manager) — acceptable en dev, bloquant pour la Phase 6 |

Détail complet des tests de validation par item : [04-tests.md](04-tests.md).

## 5.3 — Couche d'abstraction LLM

- **Scénario A (APIs payantes)** : Anthropic (`claude-haiku-4-5`), déjà câblé
  dans [apps/web/src/lib/ai/client.ts](../apps/web/src/lib/ai/client.ts) comme
  fallback.
- **Scénario B (par défaut actuel)** : Groq (`llama-3.3-70b-versatile`, gratuit,
  rapide, bon en français) — `AI_PROVIDER` vaut `groq` par défaut.
- **Pas de couche LiteLLM/LangChain** à ce jour — le choix de provider est un
  simple switch dans `client.ts`. À introduire si un 3ᵉ provider est ajouté.
- Le pipeline de contexte ([buildContext.ts](../apps/web/src/lib/ai/buildContext.ts))
  est construit mais non branché à un endpoint actif (voir Epic 9, story 9.3).
- OCR/embeddings/LLM open-source (Mistral OCR 3, BGE-M3, Mistral Small 3.2) —
  non applicables : ce produit n'a pas de fonctionnalité RAG/OCR à ce jour.

## 9. Build & outillage

- **Gestionnaire de paquets** : pnpm 9, `.npmrc` avec `shamefully-hoist=true`
  et `resolve-peers-from-workspace-root=true` pour éviter les conflits entre
  les arbres de dépendances web (React 18.3) et mobile (React 18.2).
- **Turborepo** : orchestre `dev`/`build`/`lint`/`type-check`/`format` avec
  cache par tâche ([turbo.json](../turbo.json)).
- **Tests** : 2 specs Playwright e2e (`apps/web/tests/`) ; pas de runner
  unitaire câblé malgré `jest` en devDependency — voir [04-tests.md](04-tests.md).

## 10. Cible de déploiement

[apps/web/vercel.json](../apps/web/vercel.json) (planning des crons) implique
Vercel pour le web ; aucune config de déploiement mobile (pas d'EAS) n'existe
encore.
