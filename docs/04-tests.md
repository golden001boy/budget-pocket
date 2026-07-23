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
| BE-02 | Authentification défaillante | 🔴 | 🟡 Partiel | Session JWT (7j depuis 15.8, était 30j), bcrypt sur les mots de passe. Rate limiting par (email, IP) **et** par compte toutes IP confondues (story 15.1 + 15.8) ; mot de passe ≥10 caractères + rejet des mots de passe communs (story 15.8). Reset de mot de passe (story 15.11) : token 256 bits, seul le hash stocké, réponse identique que le compte existe ou non (pas d'énumération d'emails), token invalidé après usage ou sur nouvelle demande. **Toujours pas de MFA** (décision de périmètre ADR-008 — reporté, story dédiée à créer) ; **pas de révocation de session côté serveur** (JWT sans état par design — `maxAge` réduit borne l'exposition mais n'invalide pas un jeton déjà émis) |
| BE-03 | Injection SQL/NoSQL/commande | 🔴 | ✅ Couvert | 100% des requêtes passent par Prisma (requêtes paramétrées) — aucune requête SQL brute (`$queryRawUnsafe`) trouvée dans le code |
| BE-04 | Exposition de données sensibles | 🟡 | ✅ Couvert | Aucun secret sous `NEXT_PUBLIC_*` ; `passwordHash` jamais sérialisé dans les réponses API (vérifié sur `auth/mobile`, `admin/users`) |
| BE-05 | Mauvaise configuration sécurité | 🟡 | 🟡 Partiel | Headers de sécurité déployés (CSP, X-Frame-Options, Referrer-Policy — voir FE-06) ; pas de scan de config automatisé |
| BE-06 | Défaillance cryptographique | 🟡 | 🟡 Partiel | bcrypt pour les mots de passe (bon) ; TLS dépend de l'hébergeur (Vercel), non vérifié explicitement en code |
| BE-07 | Conception non sécurisée | 🟡 | 🟡 Partiel | Rate limiting Redis sur login (web+mobile) et inscription (story 15.1, ✅) ; le reste des routes API mutatives n'a toujours aucune limite |
| BE-08 | Journalisation insuffisante | 🟢 | 🔴 Gap | Logs Prisma par défaut uniquement ; pas de journalisation applicative des actions sensibles (login, changement de rôle, suppression de compte) |
| BE-09 | Gestion des erreurs inadéquate | 🟢 | 🟡 Partiel | La plupart des routes renvoient `{ error: "message générique" }` ; `/api/health` expose le message Prisma brut (`PrismaClientInitializationError: ...`) — acceptable pour un endpoint de santé interne non public, à surveiller si exposé |

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
| API-03 | Broken Object Property Level Auth | 🟡 | ✅ Couvert | Les schémas Zod whitelistent les champs acceptés sur toutes les routes mutatives connues, y compris `goals/[id]` PATCH depuis la story 15.2 |
| API-04 | Unrestricted Resource Consumption | 🟡 | 🟡 Partiel | Login/inscription limités (story 15.1, ✅) ; listes paginées et `pageSize` plafonné à 100 sur `accounts`/`budgets`/`goals`/`portfolio`/`transactions` (story 15.3, ✅) ; pas de limite de taille de payload sur les routes mutatives |
| API-05 | Broken Function Level Auth | 🔴 | ✅ Couvert | `middleware.ts` protège `/admin/*` par rôle (`token.role !== 'ADMIN'` → redirect) et toutes les routes API sensibles par le matcher |
| API-06 | Unrestricted Access to Business Flows | 🟡 | 🟡 Partiel | Brute force de connexion/spam d'inscription limités (story 15.1, ✅) ; pas de protection anti-bot ni de limite métier sur les autres flux (ex. création de transactions en masse) |
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
| PROD-03 | Mauvaise gestion des mises à jour | 🟢 | 🟡 Partiel | Politique de backup/rollback BDD documentée avec précision (mécanisme Neon confirmé via doc officielle, fenêtre PITR réelle 6h sur le plan Free) — story 15.7 ; **test de restauration réel non exécuté** (accès console Neon requis, non disponible pour l'agent) ; pas de politique de patching écrite |

---

## 6. État réel de la suite de tests automatisés

- **E2E** : 2 specs Playwright (10 tests) — `apps/web/tests/auth.spec.ts`,
  `apps/web/tests/golden-path.spec.ts` (config :
  [apps/web/playwright.config.ts](../apps/web/playwright.config.ts)). Pas
  dans le pipeline CI ([.github/workflows/ci.yml](../.github/workflows/ci.yml)
  ne lance que `type-check`/`test`). **Connu instable en local sans Redis**
  (story 15.10) : `page.waitForURL(..., { timeout: 15000 })` est plus court
  que le retry Redis (~9-10s, story 15.1) combiné au compile à froid de
  `next dev` — la connexion et la navigation aboutissent réellement,
  simplement après 15s. Diagnostiqué en détail, non corrigé (changement de
  timeouts de test, hors périmètre d'une story de migration de version).
- **Unitaires** : câblés depuis la story 15.9 (`apps/web/jest.config.js`,
  `pnpm test`/`pnpm --filter web run test`). 46 tests, 4 fichiers —
  [rateLimit.test.ts](../apps/web/src/lib/__tests__/rateLimit.test.ts)
  (+ `accountLoginRateLimitKey`, story 15.8),
  [authSchemas.test.ts](../apps/web/src/lib/__tests__/authSchemas.test.ts)
  (+ `registerSchema` story 15.8, + `forgotPasswordSchema`/`resetPasswordSchema`
  story 15.11),
  [pagination.test.ts](../apps/web/src/lib/__tests__/pagination.test.ts)
  (story 15.3) et
  [passwordReset.test.ts](../apps/web/src/lib/__tests__/passwordReset.test.ts)
  (story 15.11 — génération/hash de token).
  **Couverture encore très partielle** : les simulateurs (`retirement.ts`,
  `realEstate.ts`, `stockGrowth.ts`), l'analytique (`forecast.ts`,
  `snapshot.ts`) et les handlers de routes API (logique métier au-delà du
  parsing de pagination) n'ont toujours aucun test. `apps/mobile` n'a pas de
  runner (nécessiterait `jest-expo`, hors périmètre de 15.9).
- **Sécurité** : aucun test automatisé des items du catalogue §8 — cet audit
  est une revue de code manuelle, pas une exécution de suite de tests.

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
7. 🟡 PROD-03 — politique backup/rollback (story 15.7) — documentée, test de
   restauration réel en attente (accès console Neon requis)
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
