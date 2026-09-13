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
| Web | Next.js 15 (App Router), TypeScript | Route Handlers = API + pages dans un seul framework ; SSR pour les pages authentifiées |
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
  web/      Next.js 15 (App Router) — surface produit principale
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

PostgreSQL via Prisma, 21 modèles
([apps/web/prisma/schema.prisma](../apps/web/prisma/schema.prisma)), groupés
par domaine :

- **Identité/facturation** : `User`, `Session`, `PasswordResetToken` (story 15.11), `EmailVerificationToken` (story 15.12), `Subscription`
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

**Reset de mot de passe** (story 15.11) : `POST /api/auth/forgot-password`
(email) → si le compte existe, génère un token aléatoire (256 bits),
n'en stocke que le hash SHA-256 (`PasswordResetToken.tokenHash`), invalide
tout token non utilisé précédent, envoie le lien par email (Resend) →
**réponse identique dans tous les cas** (compte existant ou non) pour ne
pas permettre l'énumération d'emails. `POST /api/auth/reset-password`
(token brut + nouveau mot de passe) → hash du token reçu comparé au hash
stocké → si valide, non expiré (1h) et non utilisé : met à jour
`passwordHash` et marque le token utilisé, dans une seule transaction.
La génération/hash de token (`lib/tokens.ts`) est partagée avec la
vérification email ci-dessous plutôt que dupliquée.

**Vérification email** (story 15.12, **non-bloquant** — décision produit
prise avec vous) : `POST /api/auth/register` génère un token (24h) et
envoie l'email en plus de créer le compte, qui reste utilisable
immédiatement. `POST /api/auth/verify-email` (token) marque
`User.emailVerified` et le token utilisé. `POST /api/auth/resend-verification`
est gaté par la **session** plutôt que par un email dans le body (contraste
avec `forgot-password`) — l'appelant est déjà prouvé propriétaire du
compte, donc pas de risque d'énumération à gérer ici. Le statut
`emailVerified` est propagé dans la session/JWT ; comme un JWT est sans
état, une vérification survenant après la connexion initiale ne s'y
reflète pas automatiquement — la page `/verify-email` appelle
`useSession().update()` côté client pour forcer le rafraîchissement
(callback `jwt()`, branche `trigger === 'update'`, relit la BDD).

## 5. APIs — contrats, formats, erreurs

- **Format de succès (listes)** : depuis la story 15.3, `GET
  /api/accounts`, `/api/budgets`, `/api/goals`, `/api/portfolio` et
  `/api/transactions` renvoient toutes `{ data: T[], meta: PaginationMeta }`
  (`PaginationMeta = { total, page, pageSize, totalPages }`, type partagé
  `packages/shared/src/types/api.ts`, jusque-là défini mais jamais utilisé).
  Pagination via `?page=&pageSize=`, parsing centralisé et testé dans
  [apps/web/src/lib/pagination.ts](../apps/web/src/lib/pagination.ts)
  (`pageSize` plafonné à 100, entrées non numériques/négatives retombent sur
  les valeurs par défaut au lieu de produire un `NaN` Prisma). Avant cette
  story, `/api/portfolio`/`/api/accounts`/`/api/goals` renvoyaient un tableau
  brut non borné — un compte Premium (`maxPortfolioItems`/`maxGoals`/
  `maxLinkedAccounts` = `Infinity`, voir `packages/shared/src/constants/limits.ts`)
  pouvait donc déclencher une requête `findMany` non paginée (API-04).
- **Format de succès (item unique / création)** : enveloppé `{ data: ... }`
  sur les routes migrées vers le contrat `ApiResponse<T>` ; encore variable
  (objet nu) sur certaines routes non touchées par 15.2/15.3 — non documenté
  formellement au-delà de ce fichier à ce jour.
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

**Mise à jour (story 15.16)** : le coût mesuré du fail-open (~9-10s puis
~5,4s par requête selon les mesures, story 15.1 puis 15.13) a longtemps été
considéré comme un compromis inhérent au design fail-open. Il ne l'était
pas — c'était un bug de configuration `ioredis` (`enableOfflineQueue` non
désactivé, backoff de reconnexion qui s'accumule sans fin). Corrigé :
coût réduit à ~410ms. Voir [ADR-011](#adr-011--vraie-cause-du-goulot-dashboard--backoff-de-reconnexion-ioredis-pas-postgres-story-1516).

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
**Résolu par la story 15.9** — voir ADR-006 ci-dessous. Les tests différés
existent maintenant : [apps/web/src/lib/__tests__/rateLimit.test.ts](../apps/web/src/lib/__tests__/rateLimit.test.ts),
[apps/web/src/lib/__tests__/authSchemas.test.ts](../apps/web/src/lib/__tests__/authSchemas.test.ts).

### ADR-006 — Pin `jest@29.x` pour compatibilité avec `next/jest`
**Contexte** (story 15.9) : `next/jest` (le wrapper fourni par `next@14.2.35`
pour configurer Jest avec le transform SWC et la résolution `tsconfig.json`)
plantait avec `jest@30` (`TypeError: this._moduleMocker.clearMocksOnScope is
not a function`) — `jest` était déjà en devDependency (`^30.0.0`) sans jamais
avoir été réellement exercé (aucun `jest.config.js` n'existait avant cette
story). `next@14.x` est en maintenance et n'a pas été mis à jour pour la
nouvelle API interne de `jest-mock` utilisée par Jest 30.
**Décision** : repointer `jest` sur `^29.7.0` (la ligne pour laquelle
`next/jest` a été écrite) plutôt que d'abandonner `next/jest` au profit d'une
config manuelle (`ts-jest`/`@swc/jest`) — `next/jest` reste la voie la plus
simple pour ce projet (auto-résolution de `@/*`, chargement de `.env`,
alignement avec le transform de build de Next.js). `@types/jest` a été ajouté
(absent malgré `jest` en devDependency depuis le début).
**Conséquence** : si le projet migre vers Next.js 15+ à l'avenir, revalider
si `jest@30` (ou plus récent) redevient compatible et si le pin peut être
levé. **Mise à jour (story 15.10)** : migration faite, `next/jest` sous
`next@15.5.21` fonctionne toujours avec `jest@29.x` sans changement
nécessaire (34/34 tests verts) — le pin reste justifié tel quel, non
revalidé plus loin par manque de signal contraire.

### ADR-007 — Overrides `pnpm` pour la remédiation SCA (story 15.5)
**Contexte** : `pnpm audit` remontait 46 vulnérabilités, presque toutes dans
des dépendances transitives de l'outillage mobile (`@expo/cli` →
`cacache`/`tar`, `js-yaml`, `brace-expansion`, etc. — jamais exécutées en
production) plus une quinzaine dans `next@14.2.35` (dépendance de production
réelle).
**Décision** : forcer via `pnpm.overrides` toutes les versions patchées qui
restent dans la même ligne majeure (`send`, `glob`, `tar`, `postcss`,
`@xmldom/xmldom`, `fast-xml-parser`, `uuid`, `turbo-stream`, `fast-uri` —
overrides ciblés par plage semver ; `js-yaml` et `brace-expansion` — override
"bare", toutes résolutions, car le ciblage par plage n'a pas fonctionné comme
attendu pour ces deux paquets). **Ne pas** tenter de corriger `next` de la
même façon : aucun correctif n'existe dans la branche 14.x pour aucune des 14
vulnérabilités restantes — seul un passage à 15.5.16+ les corrige, ce qui est
un changement majeur avec API de requête asynchrone modifiée, hors périmètre
d'une story de remédiation SCA. Story dédiée créée : 15.10.
**Conséquence / risque résiduel** : l'override "bare" de `js-yaml` en v4.3.0
force TOUTES ses résolutions vers v4, y compris tout code qui attendrait
l'API v3 (`safeLoad`/`safeDump`, supprimée en v4). `pnpm type-check` ne
détecte pas ce genre de rupture dans du JS compilé tiers (`@expo/cli`) — seul
un `expo start` réel le révélerait, non exécuté dans cette session. À
surveiller à la prochaine utilisation réelle de l'outillage mobile.

### ADR-008 — Story 15.8 scoping : hardening seul, MFA reporté

**Contexte** : la story 15.8 ("MFA ou hardening de l'authentification")
couvrait explicitement les deux options — un choix délibéré au moment de la
rédaction du PRD, pas une ambiguïté à trancher unilatéralement.
**Décision** (vous, confirmée avant implémentation) : traiter uniquement le
volet hardening dans cette story. Le MFA TOTP complet exigerait une
migration de schéma (`mfaSecret`/codes de secours sur `User`), une nouvelle
dépendance (bibliothèque TOTP), une UI d'enrôlement/QR code et une refonte du
`CredentialsProvider` NextAuth en flux à deux étapes — un effort disproportionné
tant que le projet n'a pas d'utilisateurs réels à protéger.
**Conséquence** : BE-02 reste 🟡 Partiel dans [04-tests.md](04-tests.md) — le
hardening (rate limiting compte, session raccourcie, politique de mot de
passe) réduit le risque de brute force et l'exposition d'un jeton volé, mais
ne couvre pas le vol de mot de passe lui-même (un attaquant avec le bon mot
de passe reste authentifié sans second facteur). Une story MFA dédiée reste à
créer si un lancement avec de vrais utilisateurs est planifié.
**Détail complet** : [02-prd.md — Story 15.8](02-prd.md#story-158--mfa-ou-hardening-de-lauthentification--🟡-partiel-hardening-fait-mfa-hors-périmètre).

### ADR-009 — Migration Next.js 15 + React 19 (story 15.10)

**Contexte** : `next@14.2.35` portait les 14 dernières vulnérabilités
résiduelles du scan SCA (story 15.5), toutes sans correctif dans la branche
14.x. Recherche préalable : Next 15 App Router impose React 19 en pratique
(le `peerDependencies` npm accepte encore `^18.2.0`, mais c'est un vestige
Pages Router — confirmé faux pour l'App Router) ; NextAuth v4 a des
problèmes documentés sur Next 15 App Router, et son successeur Auth.js v5
est resté en beta plus d'un an ; le vrai `latest` npm de `next` est
désormais 16.x, 15.x étant maintenu via un tag `backport` (`15.5.21`).
**Décision** (vous, avant implémentation) : `next@15.5.21` + React 19, sans
réécrire l'auth vers Auth.js v5 beta ni sauter à Next 16 — le scope minimal
qui ferme les 14 vulnérabilités sans absorber un risque supplémentaire non
nécessaire.

**Changements de code** :
- `params`/`searchParams` convertis en `Promise` + `await` (2 route
  handlers dynamiques, 3 pages serveur).
- `next.config.mjs` : `experimental.serverComponentsExternalPackages` →
  `serverExternalPackages` (stable en 15).
- `instrumentation.ts` : ajout du hook `onRequestError` (Sentry le réclame
  explicitement sous Next 15 pour les erreurs de Server Components imbriqués).

**Le vrai coût de cette story — un bug de résolution `@types/react` sans
rapport avec Next.js** : élever `apps/web` vers React 19 en gardant
`apps/mobile` sur React 18 (Expo SDK 51, qui ne supporte pas React 19) dans
le même workspace pnpm a fait ressurgir une variante du problème qu'ADR-003
avait déjà résolu une fois — sauf que cette fois les deux apps ont
*légitimement* besoin de majors différentes, donc un pin unique
(la solution d'ADR-003) n'est plus applicable. Diagnostic (`tsc
--traceResolution`, inspection directe de `node_modules/.pnpm`) :
- `resolve-peers-from-workspace-root=true` dans `.npmrc` (présent depuis le
  commit initial, jamais documenté par une ADR) faisait résoudre les peers
  `@types/react` des paquets de `apps/web` (ex. `@radix-ui/react-select`,
  peer `"@types/react": "*"`) contre `apps/mobile` — **supprimé**.
- `shamefully-hoist=true` hoistait `@types/react` vers la racine du
  workspace ET vers une seconde couche cachée (`node_modules/.pnpm/node_modules/`,
  gouvernée séparément par `hoist-pattern`, pas par `public-hoist-pattern`) —
  **remplacé** par `public-hoist-pattern`/`hoist-pattern` explicites avec
  négation (`!@types/react`, `!@types/react-dom`) sur les deux couches.
- `apps/web/tsconfig.json` référençait aussi `../../node_modules/@types`
  dans `typeRoots` (ADR-003, inoffensif quand racine et web pointaient vers
  la même version) — retiré par hygiène, même si la vraie cause était les
  deux points ci-dessus.

Symptôme observé avant correctif : `TS2786` sur tout composant utilisant
`forwardRef` (shadcn/Radix) — `bigint` (ajouté à `ReactNode` par React 19)
non assignable au `ReactNode` d'une copie fantôme de `@types/react@18.3.1`
toujours chargée en parallèle de la 19.2.17 réellement utilisée.

**`recharts` — deuxième incompatibilité React 19, sans rapport avec le
bug ci-dessus** : `recharts@2.13.3` (puis `2.15.4`, qui ajoute React 19 aux
`peerDependencies` sans corriger tous ses types) expose des primitives
(`XAxis`, `YAxis`, `Tooltip`, `Legend`, `Bar`, `Area`, `Pie`, `Line`,
`ReferenceLine`) encore typées comme composants classe à un seul argument
constructeur, incompatibles avec le `JSX.ElementType` plus strict de React
19 — vrai gap de types tiers, fonctionne correctement au runtime (confirmé
par `peerDependencies` et par le rendu réel de graphiques SVG en direct).
Contourné via un cast centralisé
([apps/web/src/lib/rechartsCompat.ts](../apps/web/src/lib/rechartsCompat.ts))
plutôt qu'un saut vers `recharts@3` (breaking API, hors périmètre).

**Résidu découvert au passage** : `sharp@0.34.5` (dépendance transitive de
`next@15.5.21` pour l'optimisation d'images) portait une nouvelle
vulnérabilité HIGH (CVE-2026-33327 + 3 autres, libvips) — corrigée via
`pnpm.overrides` (`sharp@^0.35.3`). `pnpm audit` final : **0 vulnérabilité**
(objectif initial : seulement les 14 de `next`).

**Non résolu, documenté plutôt que masqué** : la suite Playwright (2
specs, 10 tests) échoue à 8/10 avec `page.waitForURL(..., { timeout: 15000 })`
— diagnostiqué avec un script Playwright ad hoc reproduisant le flux
NextAuth (CSRF + callback) : la connexion aboutit réellement, la navigation
vers `/dashboard` aboutit aussi, simplement après le délai de 15s à cause du
retry Redis (~9-10s, déjà documenté story 15.1, pas de Redis local) combiné
au compile à froid de `next dev`. Confirmé antérieur à cette migration, non
corrigé ici (changement de timeouts de test, hors périmètre ; Playwright
n'est de toute façon pas dans le pipeline CI).

**Post-scriptum — CI a détecté un vrai bug non lié à cette migration** : le
premier push de cette story a fait échouer `pnpm type-check` en CI (jamais
localement) — des dizaines d'erreurs `TS7006` sur des `.map()`/`.reduce()`
dans des pages n'ayant rien à voir avec cette story
(`accounts/page.tsx`, `budgets/page.tsx`, `dashboard/page.tsx`, etc.).
Cause : sur un store pnpm totalement froid (`pnpm install --frozen-lockfile`
sans cache — exactement ce que fait CI, et que le dev local n'avait encore
jamais reproduit dans cette session malgré plusieurs réinstallations,
faute d'avoir aussi vidé le store pnpm lui-même), le client Prisma généré
que résout réellement `@prisma/client/index.d.ts` (via
`export * from '.prisma/client/default'`, un chemin qui se résout depuis
l'emplacement du paquet dans le store pnpm, pas depuis `apps/web`) reste
le gabarit vide livré par défaut — aucun type de modèle (confirmé :
0 occurrence de `LinkedAccount` dans ce fichier juste après l'install, alors
que le `postinstall` de `prisma generate` rapporte pourtant un succès).
Reproduit de façon 100% déterministe en local avec un store pnpm vidé ;
corrigé en relançant `prisma generate` une seconde fois une fois
l'installation totalement terminée. **Correctif** : étape explicite
`pnpm --filter web run db:generate` ajoutée dans
[.github/workflows/ci.yml](../.github/workflows/ci.yml) entre `pnpm install`
et `pnpm type-check`, en complément (pas en remplacement) du `postinstall`
existant. Probablement un bug latent présent depuis le début du projet,
jamais rencontré avant : chaque story précédente (15.1–15.9) avait un cache
pnpm CI chaud (clé = hash du lockfile, inchangé ou peu changé d'une story à
l'autre) — cette story est la première à avoir suffisamment modifié
`pnpm-lock.yaml` pour forcer un vrai store froid en CI.

**Post-scriptum 2 — le correctif de hoisting `@types/react` (ci-dessus)
cassait `apps/mobile`** : le 2ᵉ push a de nouveau fait échouer la CI,
cette fois dans `apps/mobile/app/(tabs)/_layout.tsx` (fichier jamais
touché par cette story) — `tabBarIcon: ({ color, size }) => ...` sur les 5
`Tabs.Screen`, `TS7031` implicit-any sur `color`/`size`. Cause : exclure
`@types/react` des deux couches de hoisting pnpm (post-scriptum 1 plus
haut) répare `apps/web` mais retire aussi le filet de sécurité dont
dépendaient plusieurs paquets de l'écosystème Expo/React Navigation
(`@react-navigation/bottom-tabs`, `core`, `native`, `native-stack`,
`elements`, `expo-router`) — aucun ne déclare `@types/react` comme peer
dependency formelle (juste `react`/`react-native` en `"*"`), une
convention d'avant l'adoption large des peers `@types/*` par l'écosystème
React Native. Sans déclaration formelle, pnpm ne peut pas créer de
symlink local correct pour eux ; ils comptaient entièrement sur le
hoisting classique pour "trouver" `@types/react` par hasard — exactement
le mécanisme que le correctif web a supprimé. Confirmé isolément :
`shamefully-hoist=true` seul (sans l'exclusion) → `apps/mobile` passe mais
`apps/web` recasse (retour du `TS2786`) ; avec l'exclusion seule →
`apps/web` passe mais `apps/mobile` casse. Les deux besoins sont en
tension sur le même mécanisme pnpm, pas résolubles par un seul réglage
`.npmrc`. **Correctif** : `pnpm.packageExtensions` dans `package.json`
déclare explicitement `"@types/react": "*"` en peer dependency pour ces 6
paquets — force pnpm à leur créer un symlink local correct (résolu vers
la version d'`apps/mobile`, seul consommateur de ces paquets), sans
dépendre du hoisting partagé. `pnpm-lock.yaml` régénéré en conséquence
(le hash de config `packageExtensions` fait partie du lockfile).
Découvert et corrigé par itération : chaque paquet manquant produisait
une nouvelle vague d'erreurs une fois le précédent corrigé — pas de
méthode plus directe trouvée pour énumérer tous les paquets concernés à
l'avance.

**Détail complet** : [02-prd.md — Story 15.10](02-prd.md#story-1510--migrer-nextjs-14--15--✅-done).

### ADR-010 — Tests de charge sans Redis local + goulot `/dashboard` non corrigé (story 15.13)

> **⚠️ Correction (story 15.16)** : l'hypothèse de contention Postgres
> ci-dessous, posée dans cette story, **s'est révélée fausse**. La cause
> réelle était le comportement de reconnexion `ioredis` (délai de backoff
> qui s'accumule sur la durée de vie du client sans jamais se
> réinitialiser). Corrigée dans
> [Story 15.16](02-prd.md#story-1516--corriger-le-goulot-dashboard-trouvé-en-story-1513--done).
> Le texte original est conservé tel quel ci-dessous par souci de
> traçabilité du raisonnement (fausse piste incluse), plutôt que réécrit
> en silence.

**Contexte** : story 15.13 (tests de charge, Gate Phase 6 §9.3). Aucun
Redis local disponible sur ce poste ; installation via Chocolatey proposée
et **explicitement refusée**. Deux choix possibles : reporter la story
jusqu'à disposer d'un Redis local, ou tester quand même en documentant
honnêtement la distorsion que ça introduit.

**Décision** : tester sans Redis, documenter la distorsion plutôt que
reporter. Justification : le coût du fail-open Redis sur le rate limiting
est déjà connu et documenté depuis l'ADR-004/story 15.1 ; le refaire
mesurer une fois de plus n'apporte rien de neuf, alors que les routes de
lecture pure (accounts/goals/portfolio/transactions, sans rate limiting)
restent, elles, mesurables sans distorsion. Reporter la story entière
aurait sacrifié une information utile (l'état réel des routes de lecture)
pour éviter de répéter une limitation déjà connue.

**Découverte en cours de route, hors périmètre initial** : `/dashboard`
échoue à 100 % sous une charge de seulement 3 req/s
(`ERR_SOCKET_TIMEOUT`), un ordre de grandeur en dessous de ce qu'on
attendrait d'un problème Redis pur (les routes API pures encaissent la
même charge sans problème). Tracé jusqu'à
[`computeMonthlySnapshot()`](../apps/web/src/lib/analytics/snapshot.ts) :
`cacheGet()` échoue vite (Redis injoignable, `lib/cache.ts` avale
l'erreur), puis la fonction exécute **inconditionnellement** un `findMany`
+ `upsert` Prisma sur la clé composite unique `userId_year_month` de
`MonthlySnapshot`. Hypothèse : contention de verrou ligne Postgres, chaque
requête concurrente du même compte de démo (tous les utilisateurs
virtuels du test de charge partagent un seul compte) tentant d'upsert la
même ligne, sans jamais bénéficier du cache pour éviter ce recalcul.

**Tentative de correctif testée et invalidée** : ajout de `connectTimeout:
1000` à [`lib/redis.ts`](../apps/web/src/lib/redis.ts) (hypothèse : lenteur
de connexion TCP). Rebuild + retest → toujours 100 % d'échec ; logs serveur
montrent un `ECONNREFUSED` quasi instantané (pas un timeout lent), donc la
piste "connexion Redis lente" est écartée pour ce goulot précis. Changement
**annulé intégralement** (pas de correctif partiel laissé en place avec un
commentaire qui prétendrait résoudre le problème).

**Ce qui n'a volontairement pas été fait dans cette story** : corriger le
goulot lui-même (ex. garde anti-thundering-herd sur
`computeMonthlySnapshot`, ou remise en service réelle de Redis en local
pour vérifier si le cache, une fois fonctionnel, absorbe le problème). La
story portait sur la mesure et le diagnostic, pas la correction — une
story de suivi dédiée est recommandée mais pas encore créée dans le PRD.

**Détail complet, chiffres et méthodologie** :
[02-prd.md — Story 15.13](02-prd.md#story-1513--tests-de-charge--fait-avec-distorsion-documentée).

### ADR-011 — Vraie cause du goulot `/dashboard` : backoff de reconnexion `ioredis`, pas Postgres (story 15.16)

**Contexte** : story 15.16, cadrée pour corriger le goulot `/dashboard`
diagnostiqué (à tort, voir correction en tête d'ADR-010) comme une
contention de verrou ligne Postgres.

**Méthode de vérification, avant de toucher au code** : plutôt que de
recoder directement une hypothèse de correctif, trois mesures isolées ont
été prises pour localiser la vraie cause :
1. Une requête `curl` unique, sans charge concurrente, sur `/dashboard` :
   déjà 12-16 secondes, de façon répétée (pas seulement au premier appel —
   élimine l'hypothèse d'un cold-start Neon).
2. Un script Node isolé exécutant les mêmes requêtes Prisma
   (`monthlySnapshot.findUnique`, `transaction.findMany`) directement
   contre Neon, hors Next.js : 140-300ms — la BDD est saine, hors cause.
3. Un client `ioredis` isolé et fraîchement créé, config identique
   (`maxRetriesPerRequest: 3`, `lazyConnect: true`) : un `get()` rejette en
   371ms — comportement de base sain, hors cause lui aussi.

Seul le client Redis du **serveur de production déjà en vie** (celui qui
avait subi les dizaines d'échecs du test de charge précédent) restait lent
en continu, y compris sur une requête isolée plusieurs minutes après.

**Cause réelle** : `ioredis`, avec `enableOfflineQueue` à sa valeur par
défaut (activé), met en **file d'attente** les commandes émises pendant une
déconnexion et les fait attendre le prochain cycle de reconnexion
automatique. Le délai de ce cycle (`retryStrategy`) **s'allonge
progressivement et ne se réinitialise jamais** tant que le client échoue à
se reconnecter. Sur un process de longue durée avec Redis indisponible en
continu, ce délai accumulé fait que chaque appel cache — même unique,
même sans aucune charge concurrente — devient de plus en plus lent au fil
de la vie du process. C'est un bug de fond de configuration, pas un
artefact du test de charge : n'importe quel déploiement réel où Redis tombe
en panne durablement subirait la même dégradation progressive et sans
fin.

**Correctif** : `enableOfflineQueue: false` sur
[`lib/redis.ts`](../apps/web/src/lib/redis.ts). Une commande émise pendant
une déconnexion est rejetée immédiatement (0-14ms mesurés isolément,
stable sur 10 appels espacés d'une seconde, pas de dégradation dans le
temps) au lieu d'attendre le cycle de reconnexion.

**Résultats** : `dashboard-only.yml` 100 % → 0 % d'échec ;
`login-latency.yml` (qui exerce le même mécanisme via le rate limiting)
moyenne 5355ms → 410ms — un ordre de grandeur, et referme au passage une
limitation acceptée depuis la story 15.1/ADR-004 sans qu'elle soit en
réalité inhérente au design fail-open. Détail complet, chiffres avant/après
et échecs résiduels non expliqués par Redis :
[02-prd.md — Story 15.16](02-prd.md#story-1516--corriger-le-goulot-dashboard-trouvé-en-story-1513--done).

**Changement additionnel, non responsable de la correction ci-dessus** :
[`computeMonthlySnapshot()`](../apps/web/src/lib/analytics/snapshot.ts)
court-circuite désormais le recalcul si une ligne `MonthlySnapshot`
existante date de moins de 6h (même fenêtre que `CACHE_TTL.MONTHLY_SNAPSHOT`).
Optimisation défensive indépendante, gardée pour limiter la charge BDD à
plus grande échelle réelle, mais ce n'est pas ce qui a résolu le goulot
mesuré ici (voir Story 15.16 pour la distinction claire entre les deux
changements).

### ADR-012 — Coffre de secrets : variables d'environnement Vercel plutôt que Vault/AWS Secrets Manager (story 15.14)

**Contexte** : Gate Phase 6 §9.2.j ("Secrets depuis un coffre dédié") était
🔴 — `.env` local uniquement, aucun coffre-fort. La story indiquait
explicitement une décision de cadrage à trancher avant implémentation.

**Décision prise de façon autonome, pas avec vous** : cette story a été
traitée dans une session `/goal` en continuation autonome (« poursuis
jusqu'à épuisement de token de cette session », 2026-09-13), sans pause
pour confirmation — contrairement aux stories précédentes (15.10, 15.12)
où le cadrage avait explicitement été discuté avec vous avant
implémentation. Marqué ici pour transparence, à rouvrir si vous jugez le
choix ci-dessous incorrect.

**Choix retenu** : les **variables d'environnement chiffrées de Vercel**
(Project Settings → Environment Variables, scopées par environnement
Development/Preview/Production, chiffrées au repos) constituent le coffre
dédié pour ce projet, plutôt que d'introduire Vault ou AWS Secrets Manager.

**Raisonnement** :
- La cible de déploiement est déjà Vercel ([§10](#10-cible-de-déploiement),
  `vercel.json`) — aucun autre runtime cloud n'est en jeu à ce jour.
- Aucune prod réelle n'existe encore (Gate Phase 6 : "Environnements
  dev/staging/prod séparés" reste 🔴) — introduire un service tiers payant
  ou une infra à opérer (Vault) avant même d'avoir un déploiement réel
  serait prématuré et non vérifiable dans cette session (pas d'accès à un
  compte Vercel/Vault pour le confirmer en direct, même limitation que
  Sentry/GitHub sur des stories antérieures).
- Un vrai coffre tiers (Vault, AWS Secrets Manager) reste la bonne
  escalade si le projet dépasse un seul provider de déploiement, a besoin
  d'audit de rotation fin, ou de partage de secrets entre plusieurs
  services/équipes — aucun de ces besoins n'existe aujourd'hui.

**Ce qui a été livré en plus de la décision de cadrage** (la partie
vérifiable en code, sans accès à un compte Vercel réel) :
[`lib/env.ts`](../apps/web/src/lib/env.ts) — schéma Zod validant la forme
des variables d'environnement serveur au boot (`DATABASE_URL`,
`NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `CRON_SECRET` requises ; Stripe/Redis/
Resend/Sentry/IA/marché optionnelles mais bien formées si présentes —
chaîne vide traitée comme absente, même convention que Sentry sans DSN).
Appelé depuis `instrumentation.ts` (runtime `nodejs` uniquement, avant
l'init Sentry) : un déploiement mal configuré échoue immédiatement au
boot avec une erreur agrégée listant tous les champs en cause, plutôt que
de tomber en panne plus tard au premier appel touchant la variable
manquante. Un bug réel a été attrapé en écrivant ce garde-fou : la
première version du schéma rejetait les clés Stripe vides comme des
erreurs, alors que ce projet les traite délibérément comme "non
configuré" (même logique que Sentry/Resend) — corrigé avant de committer
(`emptyToUndefined`, testé dans
[`env.test.ts`](../apps/web/src/lib/__tests__/env.test.ts)).

**Non fait, hors périmètre vérifiable ici** : confirmation en direct que
les variables sont effectivement configurées comme "Production" scopées
dans un vrai dashboard Vercel — nécessiterait un compte Vercel connecté,
non disponible dans cette session.

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
| c | **Pagination** | Obligatoire sur toutes les listes | ✅ `/api/accounts`, `/api/budgets`, `/api/goals`, `/api/portfolio`, `/api/transactions` — contrat commun `{ data, meta }`, `pageSize` plafonné à 100 (story 15.3) |
| d | **Secrets** | Clés API côté serveur uniquement | ✅ Toutes les clés (Stripe, Anthropic, CoinGecko...) sont lues côté serveur (`process.env`) — aucune n'est préfixée `NEXT_PUBLIC_` |
| e | **Migrations** | Tout changement de schéma via migration | ✅ `prisma migrate dev` est le seul chemin documenté (`pnpm db:migrate`) |
| f | **N+1** | Protections documentées | ✅ voir §3 — aucun risque identifié à ce jour |
| g | **TLS** | HTTPS imposé sur comms externes | 🟡 Dépend de l'hébergeur (Vercel force HTTPS) ; non vérifié en local ; aucune vérification explicite dans le code |
| h | **CORS** | Configuration restrictive, pas de `*` | ✅ Aucune configuration CORS explicite trouvée — API et front sont same-origin par design, donc pas d'exposition cross-origin |
| i | **CSP** | Content Security Policy stricte | ✅ Déployée globalement dans [next.config.mjs](../apps/web/next.config.mjs) (`default-src 'self'`, etc.) |
| j | **Coffre secrets** | Variables d'env via gestionnaire dédié | 🟡 Décision de cadrage prise (story 15.14, [ADR-012](#adr-012--coffre-de-secrets--variables-denvironnement-vercel-plutôt-que-vaultaws-secrets-manager-story-1514)) : variables d'env chiffrées Vercel plutôt que Vault/AWS Secrets Manager, plus validation Zod au boot (`lib/env.ts`) ; non vérifié en direct sur un vrai compte Vercel |

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

## 11. Politique de sauvegarde & restauration (story 15.7)

**Base** : PostgreSQL hébergé sur Neon (`ep-floral-flower-abimpoyq-pooler.eu-west-2.aws.neon.tech`).
Neon n'utilise pas un modèle de sauvegarde/restauration classique
(dump/reload) — la restauration se fait par **branchement** : Neon retrouve le
LSN (Log Sequence Number) correspondant à l'horodatage demandé dans le WAL
partagé, crée une nouvelle branche à ce point, y transfère le compute (la
chaîne de connexion ne change pas), puis renomme l'ancienne branche en backup
(`{nom}_old_{horodatage}`). La restauration remplace **tout** — données et
schéma — sur la branche root ciblée ; elle n'est possible que sur les
branches root (jamais les branches enfants), et **elle est réversible** : la
branche de sauvegarde automatique permet de revenir en arrière en la
reprenant comme source d'une nouvelle restauration.

### État réel de la rétention (plan actuel : Free)

| Plan | Fenêtre PITR | Limite |
|---|---|---|
| **Free (plan actuel du projet)** | **6 heures** | Plafonnée à 1 Go d'historique de changements |
| Payant (Launch/Scale) | 1 à 30 jours selon le palier | — |

**Risque réel et assumé** : sur le plan Free, tout incident de données
(suppression accidentelle, migration défaillante, bug applicatif corrompant
des lignes) **non détecté sous 6 heures devient irrécupérable** via la
restauration Neon. Ce risque est documenté, pas résolu — acceptable pour un
projet en développement sans utilisateurs réels à ce jour, **mais bloquant
avant tout lancement en production réelle avec des données utilisateur**
(voir Gate Phase 6 §9.1, qui exige des sauvegardes "vérifiées fonctionnelles").

### Procédure de restauration (à exécuter depuis la console Neon)

1. Console Neon → **Backup & Restore** → sélectionner la branche root ciblée.
2. Choisir un horodatage ou un LSN dans la fenêtre d'historique disponible
   (6h sur le plan actuel).
3. Confirmer — la restauration s'exécute en quelques secondes à minutes ;
   les connexions existantes sont temporairement coupées puis se
   reconnectent automatiquement.
4. En cas d'erreur, restaurer à nouveau en utilisant la branche
   `{nom}_old_{horodatage}` (créée automatiquement à l'étape précédente)
   comme source — la restauration Neon est réversible par ce mécanisme.

Équivalent CLI : `neon branches restore <target> <source@timestamp|lsn>`.
Équivalent API : `POST /projects/{project_id}/branches/{branch_id}/restore`.

### Rollback de schéma (migrations Prisma)

Prisma Migrate ne génère pas de migration "down" automatique. Deux chemins
de rollback, selon la fraîcheur de l'incident :

- **Dans la fenêtre PITR (≤ 6h)** : une restauration Neon (ci-dessus) annule
  à la fois les données ET le schéma en un seul geste, puisque la
  restauration remplace l'intégralité de la branche.
- **Au-delà de la fenêtre PITR** : aucun filet de sécurité automatique.
  Écrire une nouvelle migration Prisma qui inverse manuellement les
  changements de la migration défaillante (jamais de modification directe
  du schéma en production — règle non-négociable §2.6 du framework).

### Ce qui n'a pas été vérifié dans cette story

- **Aucun test de restauration réel n'a été exécuté** — cette story documente
  le mécanisme (recherché et confirmé via la documentation officielle Neon)
  mais ne l'a pas exercé en direct : l'agent n'a accès qu'à la chaîne de
  connexion Postgres, pas à la console/API Neon (pas de clé API Neon
  fournie). Un test réel (créer une donnée, la restaurer, vérifier qu'elle
  disparaît) nécessite une action manuelle dans la console Neon.
- Pas de sauvegarde **hors Neon** (export périodique vers un stockage tiers,
  ex. S3) — la restauration Neon ne protège pas contre une suppression du
  compte/projet Neon lui-même. Non traité ici, hors périmètre d'une story S.

## 12. Politique de patching + test de rollback (story 15.15)

**Chevauche partiellement la story 15.7** (rollback BDD, §11 ci-dessus) —
cette section couvre le volet **applicatif** (code, dépendances) ; §11
couvre le volet **données/schéma**. Traitée dans la même session `/goal`
autonome que la story 15.14 — voir la note de transparence dans ADR-012 :
aucune décision de cadrage à trancher ici (contrairement à 15.14), donc pas
la même réserve, mais toujours sans confirmation avec vous en temps réel.

### Portée du "patching"

Trois catégories distinctes, avec une cadence propre à chacune :

| Catégorie | Exemple | Cadence recommandée | Précédent dans ce projet |
|---|---|---|---|
| Correctifs de sécurité (`pnpm audit`) | Vulnérabilité critique/haute dans une dépendance transitive | Critique : dès détection, avant tout autre travail. Haute : sous 1 semaine. Modérée/basse : lors du prochain cycle de dépendances normal | Story 15.5 (46→14 vulnérabilités via `pnpm.overrides`), story 15.10 (14→0, en corrigeant aussi une vulnérabilité `sharp` détectée en cours de route) |
| Montées de version mineures/patch (dépendances non-sécurité) | `recharts@2.13.3→2.15.4` | Mensuel ou à la demande, groupées, jamais isolées pour une seule dépendance sauf urgence | — |
| Montées de version majeures (Next.js, React, Prisma, Node) | Next 14→15 + React 18→19 | **Story dédiée**, précédée d'une recherche explicite avant tout code (l'écosystème a pu bouger depuis la rédaction de la story), décision de scope actée avant implémentation | Story 15.10 — précédent qui fixe le standard à suivre pour toute future montée majeure |

### Qui décide

Projet à un seul opérateur/développeur à ce jour (vous) — pas de comité de
review formel. Toute déviation par rapport à ce tableau (ex. repousser un
correctif critique) doit être actée explicitement, la même règle que pour
toute déviation architecturale (§2.4 du framework, ADR). Si l'équipe
grandit, ce paragraphe devra désigner un rôle explicite plutôt qu'une
personne.

### Gate avant tout déploiement

1. `pnpm type-check` + `pnpm test` verts (gate CI existant depuis la story
   15.6, `type-check-and-test`, requis par la protection de branche
   `master`).
2. Pour un changement touchant la BDD ou l'auth : vérification manuelle en
   direct contre la vraie BDD Neon avec le compte de démo — précédent
   constant depuis les stories 15.2/15.8/15.10/15.11/15.12.
3. Pour un changement touchant Redis/le chemin `/dashboard` (rate limiting,
   cache) : re-jouer au moins `dashboard-only.yml` et `login-latency.yml`
   (story 15.13, `apps/web/loadtests/`) — ces deux scénarios ont
   spécifiquement révélé la régression corrigée en story 15.16.
4. Fusion sur `master` uniquement via PR (protection de branche active
   depuis 15.6) — jamais de push direct, même si le propriétaire du dépôt
   peut techniquement bypasser la règle (`enforcement_level: non_admins`).

### Mécanisme de rollback applicatif

- **Code** : `git revert` du commit fautif sur une branche, PR, merge —
  jamais de rewrite d'historique sur `master`. Vercel conserve par ailleurs
  chaque déploiement passé et permet de "promote" instantanément un
  déploiement antérieur sans attendre un nouveau build, pour un rollback
  encore plus rapide qu'un revert+redeploy — **non vérifié en direct**
  (pas de compte Vercel connecté dans cette session, même limitation que
  15.4/15.6/15.14).
- **Schéma/données** : voir §11 (restauration Neon dans la fenêtre PITR de
  6h, migration Prisma inverse manuelle au-delà).
- **Dépendances** : `pnpm.overrides` (déjà en place pour la SCA, ADR-007)
  ou un simple retour à la version précédente dans `package.json` +
  `pnpm install` — pas de mécanisme dédié au-delà du contrôle de version
  normal.

### Test de rollback réellement exécuté dans cette story

Contrairement à la restauration Neon (§11, jamais exercée faute d'accès à
la console), le rollback **applicatif par `git revert`** a été testé en
direct, sur une branche locale jetable (`rollback-drill-test`, supprimée
après coup, jamais poussée) :

1. Régression intentionnelle introduite dans
   [`lib/pagination.ts`](../apps/web/src/lib/pagination.ts)
   (`buildPaginationMeta` : `Math.ceil` → `Math.floor`), committée.
2. `pnpm jest pagination.test.ts` : **échoue** comme attendu
   (`totalPages` attendu 3, reçu 2) — confirme que le gate CI de l'étape 1
   ci-dessus aurait bloqué la fusion.
3. `git revert HEAD` : un commit de revert propre, sans conflit.
4. `pnpm jest pagination.test.ts` : **repasse au vert**, 7/7 — confirme que
   le rollback restaure un état fonctionnel identique à l'avant-régression.

**Effet de bord découvert pendant la préparation du test** : une première
tentative de régression (`MAX_PAGE_SIZE` 100 → 1000) n'a été détectée par
**aucun** test, car
[`pagination.test.ts`](../apps/web/src/lib/__tests__/pagination.test.ts)
compare le résultat à la constante `MAX_PAGE_SIZE` elle-même plutôt qu'à
une valeur littérale (`expect(result.pageSize).toBe(MAX_PAGE_SIZE)`) — un
test qui passe même si le plafond réel change. Gap de couverture réel,
non corrigé ici (hors périmètre de cette story, qui porte sur la politique
et le mécanisme de rollback, pas un audit de la suite de tests existante) ;
signalé pour une story de suivi.

### Ce qui n'a pas été vérifié dans cette story

- **Rollback Vercel réel** (promotion d'un déploiement antérieur) — aucun
  compte Vercel connecté dans cette session.
- **Restauration Neon réelle** — toujours non exercée, voir §11 (story
  15.7), aucun changement depuis.
- **Cadence de patching en pratique** — le tableau ci-dessus est une
  politique écrite, pas encore éprouvée sur un cycle réel (pas assez de
  temps écoulé depuis sa rédaction pour évaluer si elle est suivie).
