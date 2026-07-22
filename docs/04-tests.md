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
| BE-02 | Authentification défaillante | 🔴 | 🟡 Partiel | Session JWT (30j), bcrypt sur les mots de passe, invalidation via NextAuth ; **pas de MFA**, **pas de rate limiting sur le login** (brute force possible) → story 15.1, 15.8 |
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
| FE-08 | Validation seulement côté client | 🔴 | 🟡 Partiel | Validation Zod côté serveur sur la majorité des routes ; **absente** sur `PATCH /api/goals/[id]` (body non validé, passé quasi tel quel à Prisma) et `/api/auth/mobile` (déstructuration directe sans schéma) → story 15.2 |

## 3. Couche API — OWASP API Top 10 (API-01 à API-10)

| ID | Faiblesse | Priorité | État | Constat |
|---|---|---|---|---|
| API-01 | BOLA | 🔴 | ✅ Couvert | Voir BE-01 |
| API-02 | Broken Authentication | 🔴 | 🟡 Partiel | Voir BE-02 |
| API-03 | Broken Object Property Level Auth | 🟡 | 🟡 Partiel | Les schémas Zod whitelistent les champs acceptés sur la plupart des routes ; `goals/[id]` PATCH n'a pas cette protection (même gap que FE-08) |
| API-04 | Unrestricted Resource Consumption | 🟡 | 🟡 Partiel | Login/inscription limités (story 15.1, ✅) ; pas de limite de taille de payload ni de quota sur les autres routes mutatives |
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
| DEV-02 | Dépendances vulnérables / supply chain | 🟡 | 🔴 Gap | `pnpm audit` : **46 vulnérabilités (1 critique, 26 hautes, 16 modérées, 3 basses)** — la critique (`node-tar` DoS) est une dépendance transitive de tooling mobile (`expo-cli`/`cacache`), pas dans le chemin runtime prod, mais non traitée → story 15.5 |
| DEV-03 | Pipeline CI/CD non protégé | 🔴 | 🔴 Gap | **Aucun pipeline CI/CD n'existe** (`.github/workflows` absent) — donc aucune protection de branche à évaluer → story 15.6 |

## 5. Couche Production (PROD-01 à PROD-03)

| ID | Faiblesse | Priorité | État | Constat |
|---|---|---|---|---|
| PROD-01 | Absence de monitoring utile | 🟡 | 🔴 Gap | `NEXT_PUBLIC_SENTRY_DSN` existe dans `.env.example` mais Sentry n'est pas intégré dans le code (aucun `sentry.*.config.ts`) → story 15.4 |
| PROD-02 | Exposition d'envs non-prod | 🟡 | 🟡 Partiel | Aucun endpoint `/debug`/`/test` trouvé ; pas d'environnement staging déployé à ce jour donc rien à exposer, mais aucune politique écrite non plus |
| PROD-03 | Mauvaise gestion des mises à jour | 🟢 | 🔴 Gap | Pas de politique de patching écrite, pas de stratégie de backup/rollback BDD documentée → story 15.7, bloquant Phase 6 §9.1 |

---

## 6. État réel de la suite de tests automatisés

- **E2E** : 2 specs Playwright — `apps/web/tests/auth.spec.ts`,
  `apps/web/tests/golden-path.spec.ts` (config :
  [apps/web/playwright.config.ts](../apps/web/playwright.config.ts)).
- **Unitaires** : `jest` est en devDependency mais **aucun test unitaire
  n'existe** — les simulateurs (`retirement.ts`, `realEstate.ts`,
  `stockGrowth.ts`), l'analytique (`forecast.ts`, `snapshot.ts`) et les routes
  API n'ont aucune couverture.
- **Sécurité** : aucun test automatisé des items du catalogue §8 — cet audit
  est une revue de code manuelle, pas une exécution de suite de tests.

## 7. Synthèse — priorités avant `bmad prelaunch`

Tous les 🔴 ci-dessus doivent être résolus (Epic 15) avant que la checklist
[Phase 6](BMAD_FRAMEWORK_v2.md#9-phase-6--pre-launch-gate) puisse être cochée.
Ordre recommandé (Critique → Haute → Moyenne) :

1. ~~BE-07 / API-04 / API-06 — rate limiting login/inscription (story 15.1)~~ ✅
2. FE-08 / BE-03 / API-03 — validation Zod manquante (story 15.2)
3. DEV-03 — pipeline CI/CD (story 15.6)
4. PROD-01 — monitoring Sentry (story 15.4)
5. DEV-02 — remédiation `pnpm audit` (story 15.5)
6. PROD-03 — politique backup/rollback (story 15.7)
7. Perf : pagination manquante (story 15.3)
8. BE-02 — MFA / hardening auth (story 15.8, non bloquant Must mais recommandé)
