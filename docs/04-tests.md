# 04 — QA & Tests

**Commande BMAD** : `bmad qa X.Y`
**Statut** : audit rétroactif du code existant contre le catalogue de failles
§8 de [BMAD_FRAMEWORK_v2.md](BMAD_FRAMEWORK_v2.md), pas des rapports
d'exécution de tests automatisés (voir §5 pour l'état réel de la suite de
tests). Chaque ligne 🔴 correspond à une story de l'Epic 15 dans
[02-prd.md](02-prd.md).

**Légende** : ✅ Couvert · 🟡 Partiel · 🔴 Gap · N/A non applicable

---

## 1. Couche Backend — API (BE-01 à BE-09)

*Priorité 🔴 Critique traitée en premier, conformément à §7.1.*

| ID | Faiblesse | Priorité | État | Constat |
|---|---|---|---|---|
| BE-01 | Contrôle d'accès cassé (BOLA/IDOR) | 🔴 | ✅ Couvert | `transactions/[id]` et `goals/[id]` vérifient `userId === session.user.id` avant lecture/écriture/suppression (404 si non-propriétaire, jamais 403 pour ne pas confirmer l'existence) |
| BE-02 | Authentification défaillante | 🔴 | 🟡 Partiel | Session JWT (7j depuis 15.8, était 30j), bcrypt sur les mots de passe. Rate limiting par (email, IP) **et** par compte toutes IP confondues (story 15.1 + 15.8) ; mot de passe ≥10 caractères + rejet des mots de passe communs (story 15.8). Reset de mot de passe (story 15.11) : token 256 bits, seul le hash stocké, réponse identique que le compte existe ou non (pas d'énumération d'emails), token invalidé après usage ou sur nouvelle demande. Vérification email non-bloquante (story 15.12) : même mécanisme de token, `resend-verification` gaté par session plutôt que par email. **Toujours pas de MFA** (décision de périmètre ADR-008 — reporté, story dédiée à créer) ; **pas de révocation de session côté serveur** (JWT sans état par design — `maxAge` réduit borne l'exposition mais n'invalide pas un jeton déjà émis) |
| BE-03 | Injection SQL/NoSQL/commande | 🔴 | ✅ Couvert | 100% des requêtes passent par Prisma (requêtes paramétrées) — aucune requête SQL brute (`$queryRawUnsafe`) trouvée dans le code |
| BE-04 | Exposition de données sensibles | 🟡 | ✅ Couvert | Aucun secret sous `NEXT_PUBLIC_*` ; `passwordHash` jamais sérialisé dans les réponses API (vérifié sur `auth/mobile`, `admin/users`) |
| BE-05 | Mauvaise configuration sécurité | 🟡 | 🟡 Partiel | Headers de sécurité déployés (CSP, X-Frame-Options, Referrer-Policy — voir FE-06) ; pas de scan de config automatisé |
| BE-06 | Défaillance cryptographique | 🟡 | 🟡 Partiel | bcrypt pour les mots de passe (bon) ; TLS dépend de l'hébergeur (Vercel), non vérifié explicitement en code |
| BE-07 | Conception non sécurisée | 🟡 | ✅ Couvert | Rate limiting Redis sur login (web+mobile) et inscription (story 15.1) ; étendu aux 14 handlers de mutation restants (`accounts`/`budgets`/`goals`/`portfolio`/`transactions`/`profile`/`scenarios`/`taxes`/`retirement`), 60 req/min/utilisateur, story 15.20. Limite de taille de payload (100 Ko) sur les 16 routes acceptant un corps JSON, story 15.30 — voir API-04 |
| BE-08 | Journalisation insuffisante | 🟢 | ✅ Couvert | `lib/auditLog.ts` (story 15.19) — JSON structuré, branché sur login (succès/échec avec raison), inscription, reset de mot de passe, vérification email. Pas de changement de rôle à journaliser : aucune mutation de ce type n'existe dans le code (console admin en lecture seule) |
| BE-09 | Gestion des erreurs inadéquate | 🟢 | ✅ Couvert | `/api/health` ne renvoie plus le message Prisma brut (story 15.17) — BDD/Redis vérifiés indépendamment, erreurs journalisées côté serveur uniquement. `try/catch` généralisé à quasi toutes les routes (stories 15.21/15.23/15.24) — un crash inattendu renvoie désormais `{ error: 'Erreur serveur' }` plutôt qu'un 500 brut non-JSON |

## 2. Couche Frontend (FE-01 à FE-08)

| ID | Faiblesse | Priorité | État | Constat |
|---|---|---|---|---|
| FE-01 | XSS stocké | 🔴 | ✅ Couvert | Aucun `dangerouslySetInnerHTML` dans tout le code web/mobile — React échappe par défaut |
| FE-02 | XSS réfléchi | 🟡 | ✅ Couvert | Idem — pas de rendu HTML non échappé depuis des paramètres d'URL |
| FE-03 | DOM XSS | 🟡 | ✅ Couvert | Pas de sink dangereux (`innerHTML`, `eval`) trouvé |
| FE-04 | CSRF | 🔴 | 🟡 Partiel | Cookie de session NextAuth `SameSite=Lax` par défaut (non envoyé en cross-site POST) ; pas de token CSRF explicite sur les routes API custom au-delà du flux NextAuth natif |
| FE-05 | Mauvaise gestion tokens client | 🟡 | ✅ Couvert | Web : cookie HttpOnly (défaut NextAuth), jamais lu en JS. Mobile : `expo-secure-store` (keychain chiffré), pas de `localStorage`/`AsyncStorage` en clair |
| FE-06 | CSP absente ou faible | 🟢 | ✅ Couvert | CSP stricte déployée globalement dans `next.config.mjs` (`default-src 'self'`, etc.) |
| FE-07 | Fuite via source maps/HTML | 🟢 | ✅ Couvert | `productionBrowserSourceMaps` non activé (défaut Next.js = pas de source maps en prod) |
| FE-08 | Validation seulement côté client | 🔴 | ✅ Couvert | Validation Zod côté serveur sur toutes les routes mutatives connues, y compris `PATCH /api/goals/[id]` (`updateGoalSchema`) et `/api/auth/mobile` (`loginSchema`) depuis la story 15.2 |

## 3. Couche API — OWASP API Top 10 (API-01 à API-10)

| ID | Faiblesse | Priorité | État | Constat |
|---|---|---|---|---|
| API-01 | BOLA | 🔴 | ✅ Couvert | Voir BE-01 |
| API-02 | Broken Authentication | 🔴 | 🟡 Partiel | Voir BE-02 |
| API-03 | Broken Object Property Level Auth | 🟡 | ✅ Couvert | Les schémas Zod whitelistent les champs acceptés sur toutes les routes mutatives connues, y compris `goals/[id]` PATCH depuis la story 15.2. `POST /api/advisor/scenarios` n'avait aucune validation avant la story 15.23 (trouvé sans schéma du tout) — corrigé |
| API-04 | Unrestricted Resource Consumption | 🟡 | ✅ Couvert | Login/inscription limités (story 15.1) ; listes paginées et `pageSize` plafonné à 100 sur les 7 routes de liste, y compris `advisor/scenarios`/`planning/taxes` (stories 15.3/15.18) ; rate limiting par utilisateur (60/min) sur les 14 handlers de mutation (story 15.20) ; limite de taille de payload (100 Ko, `413` au-delà) sur les 16 routes qui acceptent un corps JSON (story 15.30). Résiduel non applicatif : les timeouts de requête dépendent de la plateforme d'hébergement (Vercel/Next.js), pas du code de l'app — même raisonnement que TLS sous BE-06 |
| API-05 | Broken Function Level Auth | 🔴 | ✅ Couvert | `middleware.ts` protège `/admin/*` par rôle (`token.role !== 'ADMIN'` → redirect) et toutes les routes API sensibles par le matcher |
| API-06 | Unrestricted Access to Business Flows | 🟡 | 🟡 Partiel | Brute force de connexion/spam d'inscription limités (story 15.1) ; création de transactions/objectifs/etc. désormais limitée à 60/min/utilisateur (story 15.20). Résiduel, non traité : pas de protection anti-bot (captcha) — nécessite un choix de fournisseur, hors périmètre d'une correction unilatérale |
| API-07 | SSRF | 🟡 | ✅ Couvert | Les seuls appels sortants (`CoinGecko`, scraper BRVM) ciblent des URLs codées en dur, aucune URL fournie par l'utilisateur n'est fetchée côté serveur |
| API-08 | Security Misconfiguration | 🟡 | ✅ Couvert | Pas de CORS explicite (donc pas de wildcard `*`), pas d'endpoint de debug trouvé, `ignoreBuildErrors`/`ignoreDuringBuilds` sont un choix de build, pas une brèche |
| API-09 | Improper Inventory Management | 🟢 | 🟡 Partiel | Pas de doc API formelle (OpenAPI/Swagger) — [03-architecture.md §5](03-architecture.md) sert d'inventaire actuel mais n'est pas généré depuis le code |
| API-10 | Unsafe Consumption of APIs | 🟢 | 🟡 Partiel | Réponses CoinGecko/BRVM ne sont pas validées par schéma avant usage (pas de Zod côté réponse externe) |

## 4. Couche Déploiement (DEV-01 à DEV-03)

| ID | Faiblesse | Priorité | État | Constat |
|---|---|---|---|---|
| DEV-01 | Secrets dans le code/variables | 🔴 | ✅ Couvert | `.env` gitignoré et jamais commité (vérifié) ; aucun secret en dur trouvé dans le code source |
| DEV-02 | Dépendances vulnérables / supply chain | 🟡 | ✅ Couvert | `pnpm audit` réduit de **46 → 0** vulnérabilité. Story 15.5 : 46 → 14 via `pnpm.overrides`. Story 15.10 (migration Next.js 14 → 15.5.21 + React 19) : les 14 dernières (toutes `next@14.2.35`) fermées ; une nouvelle vulnérabilité HIGH introduite par `sharp` (dépendance transitive de `next@15.5.21`) corrigée dans la même story via override (`sharp@^0.35.3`) |
| DEV-03 | Pipeline CI/CD non protégé | 🔴 | ✅ Couvert | Pipeline GitHub Actions (`type-check` + `test` sur push/PR, story 15.6) et protection de branche sur `master` (PR requise + check `type-check-and-test` requis) — les deux confirmés actifs via l'API GitHub |

## 5. Couche Production (PROD-01 à PROD-03)

| ID | Faiblesse | Priorité | État | Constat |
|---|---|---|---|---|
| PROD-01 | Absence de monitoring utile | 🟡 | 🟡 Partiel | `@sentry/nextjs` intégré (client/serveur/edge + frontière d'erreur globale, story 15.4), vérifié no-op sans DSN et sans régression (build + tests + type-check). **Non vérifié** : réception réelle d'un événement dans un projet Sentry — nécessite un compte/DSN fourni par l'utilisateur |
| PROD-02 | Exposition d'envs non-prod | 🟡 | 🟡 Partiel | Aucun endpoint `/debug`/`/test` trouvé ; pas d'environnement staging déployé à ce jour donc rien à exposer, mais aucune politique écrite non plus |
| PROD-03 | Mauvaise gestion des mises à jour | 🟢 | 🟡 Partiel | Politique de backup/rollback BDD documentée avec précision (mécanisme Neon confirmé via doc officielle, fenêtre PITR réelle 6h sur le plan Free) — story 15.7 ; **test de restauration réel non exécuté** (accès console Neon requis, non disponible pour l'agent). Politique de patching écrite (cadence par catégorie, gate de test, mécanismes de rollback applicatif) et **rollback applicatif réellement testé** par `git revert` — story 15.15 ; rollback BDD reste non exercé (même limite que 15.7) |

*Tests de charge (Gate Phase 6 §9.3, hors catalogue PROD-01/03 ci-dessus,*
*pas de gap dédié dans BMAD_FRAMEWORK_v2.md §8.5) : voir §6 ci-dessous.*

---

## 6. État réel de la suite de tests automatisés

- **E2E** : 2 specs Playwright (10 tests) — `apps/web/tests/auth.spec.ts`,
  `apps/web/tests/golden-path.spec.ts` (config :
  [apps/web/playwright.config.ts](../apps/web/playwright.config.ts)). Pas
  dans le pipeline CI ([.github/workflows/ci.yml](../.github/workflows/ci.yml)
  ne lance que `type-check`/`test`). **Connu instable en local sans Redis**
  (story 15.10), attribué à l'époque au retry Redis (~9-10s, story 15.1)
  combiné au compile à froid de `next dev`. **Re-testé après le correctif
  Redis de la story 15.16** (`enableOfflineQueue: false`, qui a fait
  chuter le coût du retry Redis de ~5,4s à ~0,4s) : l'instabilité
  **persiste** (2 puis 3 échecs sur 10 selon l'exécution, mêmes
  `TimeoutError` sur `page.waitForURL`/`page.click`), ce qui **écarte
  Redis comme cause dominante** et pointe plutôt vers le compile à froid
  de `next dev` (ou une contention entre workers Playwright parallèles
  compilant plusieurs routes en même temps) comme facteur principal.
  Non corrigé — hors périmètre des stories 15.13/15.16 (tests de charge),
  resterait à cadrer comme story dédiée si jugé prioritaire.
- **Unitaires** : câblés depuis la story 15.9 pour `apps/web`
  (`apps/web/jest.config.js`) et depuis la story 15.26 pour `apps/mobile`
  (`apps/mobile/jest.config.js`, `jest-expo`) — `pnpm test` (racine) lance
  les deux via Turborepo. **247 tests au total** (235 `apps/web` + 12
  `apps/mobile`), largement étendu au fil des stories 15.17 à 15.29 de
  cette session par rapport aux 52 tests/6 fichiers d'origine (story
  15.9-15.12). Répartition par domaine plutôt que fichier par fichier
  (trop nombreux désormais) :
  - **Auth/tokens** : `rateLimit.test.ts` (+ `checkMutationRateLimit`,
    story 15.20), `authSchemas.test.ts`, `tokens.test.ts`,
    `passwordReset.test.ts`, `emailVerification.test.ts`, `env.test.ts`
    (story 15.14 — validation Zod des secrets au boot), `auditLog.test.ts`
    (story 15.19).
  - **Middleware** : `middleware.test.ts` (story 15.21 — `401` JSON sur
    `/api/*` non authentifié au lieu d'une redirection `307`).
  - **Routes API** : un fichier `__tests__/route.test.ts` par route pour
    les 9 routes CRUD principales (`accounts`, `budgets`, `goals` +
    `[id]`, `portfolio`, `transactions` + `[id]`, `user/profile`,
    `planning/retirement`, `planning/taxes`) + `advisor/scenarios`,
    `health`, `auth/mobile`, `analysis/snapshot`, `analysis/forecast` —
    stories 15.17/15.18/15.20 à 15.24.
  - **Logique métier pure** : `lib/analytics/forecast.test.ts` (story
    15.28), `lib/analytics/snapshot.test.ts`,
    `lib/simulators/{realEstate,retirement,stockGrowth}.test.ts` (story
    15.29 — dernier trou "simulateurs" explicitement fermé),
    `lib/__tests__/currencies.test.ts` (story 15.27, code de
    `packages/shared` testé depuis `apps/web` faute de runner propre à ce
    package).
  - **Mobile** : `lib/mfetch.test.ts` (primitive réseau centrale) et
    `contexts/AuthContext.test.tsx` (session complète — login/logout/
    restauration), story 15.26.
  **Couverture non encore comblée** : `packages/api-client` (code mort,
  voir [03-architecture.md §13](03-architecture.md#13-dette-technique-identifiée-non-traitée-signalée-pour-décision),
  pas de valeur à tester du code inutilisé) ; `lib/ai/*` (fonctionnalité
  Epic 9.3 désactivée, non branchée) ; `lib/market-data/coingecko.ts` et
  `lib/scrapers/brvm.ts` (appels externes, valeur limitée sans un vrai
  contrat d'API à mocker) ; aucun test de composant/écran complet côté
  mobile (navigation réelle) ; CI ne couvre toujours qu'`apps/web`.
- **Sécurité** : aucun test automatisé des items du catalogue §8 — cet audit
  est une revue de code manuelle, pas une exécution de suite de tests.
- **Charge** : Artillery (story 15.13, correctif en story 15.16), scénarios
  dans [apps/web/loadtests/](../apps/web/loadtests/), exécutés contre un
  build de production (`pnpm build && pnpm start`) + BDD Neon réelle, hors
  CI. Routes API paginées (`accounts`/`goals`/`portfolio`/`transactions`) :
  saines, 0 % d'échec, p95 ~570-600ms sur 240 requêtes, inchangé entre les
  deux stories. `/dashboard` (story 15.13) : goulot distinct trouvé — 100 %
  d'échec (`ERR_SOCKET_TIMEOUT`) à seulement 3 req/s en isolation. Diagnostic
  initial (contention Postgres sur `MonthlySnapshot`) **invalidé par la
  story 15.16** : cause réelle = `ioredis` qui met les commandes en file
  d'attente pendant une déconnexion et attend un cycle de reconnexion dont
  le délai s'accumule sans fin sur la durée de vie du process (pas de
  rapport avec Postgres). Correctif : `enableOfflineQueue: false` sur
  [`lib/redis.ts`](../apps/web/src/lib/redis.ts) — `/dashboard` passe de
  100 % à **0 % d'échec** ; le coût du rate limiting fail-open (déjà
  accepté depuis 15.1/ADR-004) chute de ~5355ms à **~410ms** moyenne sur
  `/api/auth/mobile`, le même bug étant en cause. Échecs résiduels sous
  charge combinée (login par VU + lectures + dashboard) : 20,1 % — sans
  rapport avec Redis (routes API pures toujours à 0 %), hypothèse capacité
  Neon Free non confirmée, non investiguée plus avant. Détail complet :
  [02-prd.md, story 15.13](02-prd.md#story-1513--tests-de-charge--fait-avec-distorsion-documentée)
  (diagnostic initial, y compris la fausse piste, conservé tel quel) et
  [story 15.16](02-prd.md#story-1516--corriger-le-goulot-dashboard-trouvé-en-story-1513--done)
  (cause réelle, correctif, chiffres avant/après).

## 7. Synthèse — priorités avant `bmad prelaunch`

Tous les 🔴 ci-dessus doivent être résolus (Epic 15) avant que la checklist
[Phase 6](BMAD_FRAMEWORK_v2.md#9-phase-6--pre-launch-gate) puisse être cochée.
Ordre recommandé (Critique → Haute → Moyenne) :

1. ~~BE-07 / API-04 / API-06 — rate limiting login/inscription (story 15.1)~~ ✅
2. ~~FE-08 / BE-03 / API-03 — validation Zod manquante (story 15.2)~~ ✅
3. ~~Prérequis §6.1 — test runner Jest câblé (story 15.9)~~ ✅ (fait hors
   ordre — nécessaire pour que les stories suivantes respectent enfin la
   règle "tests écrits avec le code" sans nouvel ADR de report)
4. ~~DEV-03 — pipeline CI/CD (story 15.6)~~ ✅ (workflow + protection de
   branche, tous deux confirmés actifs)
5. ~~DEV-02 — remédiation `pnpm audit` (story 15.5)~~ ✅ (46 → 14 ; résidu
   `next` fermé par la story 15.10 — 14 → 0)
6. ~~PROD-01 — monitoring Sentry (story 15.4)~~ ✅ (intégré, capture réelle
   non vérifiée faute de compte Sentry)
7. 🟡 PROD-03 — politique backup/rollback (story 15.7) et politique de
   patching + rollback applicatif testé (story 15.15) — documentées,
   rollback applicatif vérifié par `git revert` ; test de restauration
   BDD réel en attente (accès console Neon requis)
8. ~~Perf : pagination manquante (story 15.3)~~ ✅ (`accounts`/`budgets`/
   `goals`/`portfolio`/`transactions`, contrat `{ data, meta }` commun)
9. 🟡 BE-02 — hardening auth (story 15.8) ✅ (rate limit compte, session 7j,
   politique mot de passe) ; volet MFA explicitement reporté (ADR-008,
   non bloquant Must mais recommandé avant de vrais utilisateurs)
10. ~~DEV-02 résidu — migration Next.js 14 → 15.5.21 + React 19
    (story 15.10)~~ ✅ (14 → 0 vulnérabilité au final, y compris une
    nouvelle introduite par `sharp` et corrigée dans la même story)
11. ~~Gate Phase 6 §9.1 — reset de mot de passe (story 15.11)~~ ✅ (flux
    complet, testé en direct contre Neon ; reste 🔴 uniquement pour le
    critère "testé en production réelle" de la checklist, faute
    d'environnement de production)
12. ~~Gate Phase 6 §9.1 — vérification email (story 15.12)~~ ✅
    (non-bloquant par décision produit ; même nuance que 15.11 sur le
    critère "production réelle")
13. ~~Gate Phase 6 §9.3 — tests de charge (story 15.13)~~ ✅ (exécutés,
    routes API saines, goulot `/dashboard` diagnostiqué — diagnostic
    initial invalidé et corrigé en story 15.16 — test réalisé sans Redis
    local, distorsion documentée plutôt que reportée)
14. ~~Story de suivi — correctif du goulot `/dashboard` (story 15.16)~~ ✅
    (cause réelle : bug de configuration `ioredis`, pas Postgres comme
    supposé en 15.13 ; corrige au passage le coût fail-open Redis accepté
    depuis 15.1/ADR-004 — ~5,4s → ~410ms)

**Stories 15.17 à 15.29 (session `/goal` autonome, 2026-09-13/14)** —
toutes créées en cours de route (non prévues par l'évaluation initiale du
23/07), chacune motivée par un incident ou un gap trouvé en vérifiant une
autre story en direct plutôt que planifiée à l'avance :

15. ~~BE-09 — fuite du message d'erreur Prisma brut sur `/api/health`
    (story 15.17)~~ ✅ (BDD/Redis vérifiés indépendamment, erreurs
    journalisées côté serveur uniquement)
16. ~~Perf résiduel — pagination sur `advisor/scenarios`/`planning/taxes`
    (story 15.18)~~ ✅ (dernières routes de liste sans pagination ; a
    aussi révélé et corrigé un bug mobile pré-existant, écran Conseiller
    affichant toujours zéro scénario)
17. ~~BE-08 — journalisation des actions sensibles (story 15.19)~~ ✅
    (`lib/auditLog.ts`, branché sur login/inscription/reset mdp/
    vérification email)
18. ~~BE-07 / API-04 / API-06 résidu — rate limiting étendu aux routes de
    mutation (story 15.20)~~ ✅ (14 handlers restants, 60/min/utilisateur)
19. ~~Gap noté depuis 15.2 — `401` JSON propre au lieu d'une redirection
    `307` sur les routes API protégées (story 15.21)~~ ✅ + résilience
    `auth/mobile` (ne crashe plus brut sur une coupure BDD transitoire)
20. ~~Prérequis §6 — couverture de tests pour les 9 routes CRUD sans
    aucun test (story 15.22)~~ ✅ (59 tests, aucun changement de
    comportement)
21. ~~API-03 — validation Zod manquante sur `POST /api/advisor/scenarios`
    (story 15.23)~~ ✅ (trouvée sans schéma du tout, corrigée + résilience)
22. ~~BE-09 résidu — `try/catch` manquant sur 12 routes restantes (story
    15.24)~~ ✅ (audit systémique après 15.21/15.23, même patron partout)
23. ~~Champs Prisma réels jamais exposés par l'API — `inflationRate`,
    `priority`, `exchange`, `notes` (story 15.25)~~ ✅ (schémas partagés
    complets mais inutilisés, câblés dans les schémas locaux)
24. ~~Prérequis §6 — `apps/mobile` sans runner de test (story 15.26)~~ ✅
    (`jest-expo`, correctif `transformIgnorePatterns` pnpm documenté en
    [ADR-013](03-architecture.md#adr-013--transformignorepatterns-pnpm-compatible-pour-jest-expo-story-1526))
25. ~~Prérequis §6 — `packages/shared` (`formatCurrency`/`convertToXOF`)
    jamais testé (story 15.27)~~ ✅
26. ~~Prérequis §6 — `projectForecast` testé uniquement par mock (story
    15.28)~~ ✅ (testé directement)
27. ~~Prérequis §6 — simulateurs financiers jamais testés (story
    15.29)~~ ✅ (dernier gap "simulateurs" nommé depuis la story 15.9 ;
    a aussi trouvé un écart réel ~2,5-3 % entre `projectionByYear` et le
    total final sur 2 des 3 simulateurs — sans impact aujourd'hui, champ
    non rendu dans l'UI, voir [03-architecture.md §13](03-architecture.md#13-dette-technique-identifiée-non-traitée-signalée-pour-décision))
28. ~~Revue de code holistique post-15.29 (`code-review high
    master..HEAD`, hors périmètre `bmad prelaunch`, auto-initiée)~~ ✅
    (8/8 angles terminés — d'abord interrompue par une limite de session à
    mi-parcours, les 3 angles coupés relancés et terminés dans la même
    session, voir [05-status.md §Point de reprise](05-status.md#point-de-reprise-pour-la-prochaine-session--revue-de-code-holistique-interrompue-2026-09-14)).
    Trois dérives réelles trouvées, toutes corrigées directement :
    `GET /api/advisor/scenarios` sans `try/catch` (oublié par le passage
    systématique de la story 15.24) ; message 401 non uniforme
    (`'Non autorisé'` vs `'Unauthorized'`, uniformisé sur ce dernier) ;
    écran mobile "Transactions" lisant `data.transactions` au lieu de
    `data.data` (même bug que 15.3/15.18, jamais corrigé sur cet
    écran-là). Son thème de fond (aucun wrapper de route API partagé, cause
    probable des dérives ci-dessus et du problème des schémas Zod dupliqués
    déjà noté au point 23) documenté comme quatrième découverte en
    [03-architecture.md §13](03-architecture.md#13-dette-technique-identifiée-non-traitée-signalée-pour-décision).
    Reste seulement une synthèse formelle de dédup des 8 sorties, sans
    nouveau correctif attendu
29. ~~API-04 résidu — limite de taille de payload sur les routes mutatives
    (story 15.30)~~ ✅ (100 Ko, `413` avant toute validation/DB ; helper
    trouvé non committé/non branché en début de session, terminé et câblé
    sur les 16 routes concernées, voir
    [02-prd.md](02-prd.md#story-1530--limite-de-taille-de-payload-sur-les-routes-mutatives--done))

**Reste non résolu après ces 29 items** : PROD-03/story 15.7 (test de
restauration Neon réel, accès console requis) ; BE-02/story 15.8 volet
MFA (ADR-008, reporté) ; story 15.14 (coffre de secrets — décision de
cadrage Vercel prise sans confirmation, voir
[ADR-012](03-architecture.md#adr-012--coffre-de-secrets--variables-denvironnement-vercel-plutôt-que-vaultaws-secrets-manager-story-1514)) ;
story 15.15 (politique de patching écrite, rollback applicatif testé,
rollback BDD toujours non exercé) ; API-06 anti-bot (choix de fournisseur
requis) ; FE-04 CSRF explicite au-delà de `SameSite=Lax` ; PROD-01
réception réelle d'un événement Sentry (DSN requis) ; quatre éléments de
dette technique documentés sans story
([03-architecture.md §13](03-architecture.md#13-dette-technique-identifiée-non-traitée-signalée-pour-décision)) :
`packages/api-client` (code mort), 5 répertoires de route API vides, écart
`projectionByYear` sur 2 simulateurs, absence de wrapper de route API
partagé.
