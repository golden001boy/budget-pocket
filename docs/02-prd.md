# 02 — PRD (Epics & Stories)

**Commande BMAD** : `bmad pm`
**Statut** : rétroactif — voir [01-brainstorming.md](01-brainstorming.md). Toute
story ci-dessous est adossée à du code existant ; le détail (critères
d'acceptation, fichiers) vit dans [specs/](../specs/) sous le même numéro
d'epic. Les stories marquées 🔴/🟡 sont les seules à traiter en Phase 4
(`bmad dev X.Y`) à partir de maintenant.

**Légende statut** : ✅ Done · 🟡 En cours / partiel · 🔴 À faire
**Format story** : *En tant que [persona], je veux [action], afin de [bénéfice]*

---

## Epic 1 — Authentification & Onboarding · ✅ Done
Spec détaillée : [specs/epic-01-auth-onboarding.md](../specs/epic-01-auth-onboarding.md)

| Story | Titre | MoSCoW | Estim. | Statut |
|---|---|---|---|---|
| 1.1 | Inscription email/mot de passe | Must | M | ✅ |
| 1.2 | Connexion web (session NextAuth) | Must | M | ✅ |
| 1.3 | Connexion mobile (jeton bearer) | Must | M | ✅ |
| 1.4 | Assistant d'onboarding première utilisation | Should | L | ✅ |

## Epic 2 — Comptes & liaison mobile money · 🟡 Partiel
Spec : [specs/epic-02-accounts.md](../specs/epic-02-accounts.md)

| Story | Titre | MoSCoW | Estim. | Statut |
|---|---|---|---|---|
| 2.1 | Gestion de comptes manuels | Must | S | ✅ |
| 2.2 | Synchronisation Wave / MTN / Orange | Could | L | 🔴 stub — voir gap ci-dessous |

## Epic 3 — Transactions & suivi des dépenses · ✅ Done
Spec : [specs/epic-03-transactions.md](../specs/epic-03-transactions.md)

| Story | Titre | MoSCoW | Estim. | Statut |
|---|---|---|---|---|
| 3.1 | CRUD transactions | Must | M | ✅ |
| 3.2 | Catégorisation (standard + personnalisée) | Must | S | ✅ |
| 3.3 | Transactions récurrentes | Should | M | ✅ |
| 3.4 | Liste des dépenses mobile | Must | S | ✅ |

## Epic 4 — Budgets & alertes de seuil · ✅ Done
Spec : [specs/epic-04-budgets.md](../specs/epic-04-budgets.md)

| Story | Titre | MoSCoW | Estim. | Statut |
|---|---|---|---|---|
| 4.1 | Budgets mensuels par catégorie | Must | M | ✅ |
| 4.2 | Alertes de dépassement de seuil | Should | M | ✅ |

## Epic 5 — Objectifs financiers · ✅ Done
Spec : [specs/epic-05-goals.md](../specs/epic-05-goals.md)

| Story | Titre | MoSCoW | Estim. | Statut |
|---|---|---|---|---|
| 5.1 | Création et suivi d'objectifs d'épargne | Must | M | ✅ |
| 5.2 | Vue d'analyse des objectifs | Should | S | ✅ |

## Epic 6 — Portefeuille d'investissement · ✅ Done
Spec : [specs/epic-06-portfolio.md](../specs/epic-06-portfolio.md)

| Story | Titre | MoSCoW | Estim. | Statut |
|---|---|---|---|---|
| 6.1 | Suivi des positions de portefeuille | Must | M | ✅ |
| 6.2 | Rafraîchissement live des prix (crypto & BRVM) | Should | L | ✅ |
| 6.3 | Graphique de répartition du portefeuille | Should | S | ✅ |
| 6.4 | Vue portefeuille mobile | Must | S | ✅ |

## Epic 7 — Planification retraite & fiscale · ✅ Done
Spec : [specs/epic-07-planning.md](../specs/epic-07-planning.md)

| Story | Titre | MoSCoW | Estim. | Statut |
|---|---|---|---|---|
| 7.1 | Plan de retraite & projection | Should | M | ✅ |
| 7.2 | Enregistrements fiscaux | Could | S | ✅ |
| 7.3 | Simulateurs immobilier & croissance boursière | Could | M | ✅ |
| 7.4 | Page tableau de bord planification | Should | S | ✅ |

## Epic 8 — Analyse financière & prévisions · ✅ Done
Spec : [specs/epic-08-analysis.md](../specs/epic-08-analysis.md)

| Story | Titre | MoSCoW | Estim. | Statut |
|---|---|---|---|---|
| 8.1 | Snapshots mensuels pré-calculés | Should | M | ✅ |
| 8.2 | Prévision de dépenses | Should | M | ✅ |
| 8.3 | Graphiques du tableau de bord | Must | M | ✅ |
| 8.4 | Résumé mensuel mobile | Must | S | ✅ |

## Epic 9 — Conseiller IA · 🟡 Partiel
Spec : [specs/epic-09-advisor.md](../specs/epic-09-advisor.md)

| Story | Titre | MoSCoW | Estim. | Statut |
|---|---|---|---|---|
| 9.1 | Scénarios "what-if" | Could | M | ✅ |
| 9.2 | Constructeur de contexte IA | Could | M | ✅ (construit, non branché) |
| 9.3 | Endpoint de chat conversationnel | Could | L | 🔴 désactivé (503) — voir gap |

## Epic 10 — Alertes & notifications · ✅ Done
Spec : [specs/epic-10-alerts.md](../specs/epic-10-alerts.md)

| Story | Titre | MoSCoW | Estim. | Statut |
|---|---|---|---|---|
| 10.1 | Alertes in-app | Should | S | ✅ |

## Epic 11 — Facturation & abonnements · ✅ Done
Spec : [specs/epic-11-billing.md](../specs/epic-11-billing.md)

| Story | Titre | MoSCoW | Estim. | Statut |
|---|---|---|---|---|
| 11.1 | Paiement Stripe & passage Premium | Must | L | ✅ |
| 11.2 | Portail de facturation | Should | S | ✅ |
| 11.3 | Paramètres du profil | Must | S | ✅ |

## Epic 12 — Console admin · ✅ Done
Spec : [specs/epic-12-admin.md](../specs/epic-12-admin.md)

| Story | Titre | MoSCoW | Estim. | Statut |
|---|---|---|---|---|
| 12.1 | Tableau de bord métriques plateforme | Should | M | ✅ |
| 12.2 | Liste & gestion des utilisateurs | Should | S | ✅ |

## Epic 13 — Application mobile · ✅ Done
Spec : [specs/epic-13-mobile.md](../specs/epic-13-mobile.md)

| Story | Titre | MoSCoW | Estim. | Statut |
|---|---|---|---|---|
| 13.1 | Navigation par onglets | Must | M | ✅ |
| 13.2 | Écrans Accueil / Dépenses / Investissements / Conseiller / Réglages | Must | L | ✅ |
| 13.3 | Modal d'ajout rapide de transaction | Should | S | ✅ |
| 13.4 | Client API partagé | Must | M | ✅ |

## Epic 14 — Plateforme, monorepo & infra · ✅ Done
Spec : [specs/epic-14-platform.md](../specs/epic-14-platform.md)

| Story | Titre | MoSCoW | Estim. | Statut |
|---|---|---|---|---|
| 14.1 | Setup monorepo pnpm/Turborepo | Must | M | ✅ |
| 14.2 | Package de domaine partagé | Must | M | ✅ |
| 14.3 | Cohérence des versions de dépendances | Must | S | ✅ |
| 14.4 | Install fiable sur machine propre | Must | M | ✅ |
| 14.5 | Ordonnancement des jobs de fond | Must | S | ✅ |
| 14.6 | Script de seed BDD | Should | M | ✅ |

---

## Epic 15 — Mise en conformité BMAD v2 (sécurité & prod) · 🟡 En cours (6/10 ✅)

**Nouveau** — créé suite à l'adoption de [BMAD_FRAMEWORK_v2.md](BMAD_FRAMEWORK_v2.md).
Ces stories couvrent les écarts identifiés dans [04-tests.md](04-tests.md) contre
le catalogue de failles §8 du framework. Toutes bloquent la Phase 6
(`bmad prelaunch`) tant qu'elles restent 🔴.

| Story | Titre | MoSCoW | Estim. | Statut | Réf. catalogue |
|---|---|---|---|---|---|
| 15.1 | Rate limiting sur login + inscription | Must | M | ✅ | BE-07, API-04, API-06 |
| 15.2 | Validation Zod sur `/api/auth/mobile` et `/api/goals/[id]` | Must | S | ✅ | BE-03, FE-08 |
| 15.3 | Pagination sur `/api/accounts`, `/api/budgets`, `/api/goals`, `/api/portfolio` | Should | S | ✅ | Perf (règle Phase 1) |
| 15.4 | Intégration monitoring d'erreurs (Sentry) | Must | M | ✅ | PROD-01 |
| 15.5 | Scan SCA des dépendances + plan de remédiation | Must | S | ✅ | DEV-02 |
| 15.6 | Pipeline CI/CD avec protections de branche | Must | M | ✅ | DEV-03 |
| 15.7 | Politique de backup/rollback BDD production | Must | S | 🟡 | Gate Phase 6 §9.1 |
| 15.8 | MFA ou hardening de l'authentification | Should | L | 🟡 | BE-02 |
| 15.9 | Câbler un test runner (Jest) pour le monorepo | Must | S | ✅ | prérequis §6.1 (tests écrits avec le code) — voir ADR-005 |
| 15.10 | Migrer Next.js 14 → 15+ | Should | L | 🔴 | DEV-02 (résidu de 15.5) |

### Story 15.1 — Rate limiting sur login + inscription · ✅ Done

**Story** : En tant qu'opérateur de la plateforme, je veux limiter le nombre
de tentatives de connexion/inscription par IP et par compte, afin de réduire
le risque de brute force et d'abus de ressources (BE-07/API-04/API-06).

**Critères d'acceptation**
- [x] `POST /api/auth/mobile` refuse avec `429` au-delà de 5 tentatives / 15 min
      pour la paire (email, IP).
- [x] Le flux de connexion web (NextAuth `authorize()`) applique la même
      limite, avec la même clé — un attaquant ne peut pas la contourner en
      changeant de point d'entrée.
- [x] `POST /api/auth/register` refuse avec `429` au-delà de 5 tentatives / heure
      par IP.
- [x] Le compteur est backé par Redis (`INCR`+`EXPIRE`), pas par la mémoire du
      processus — reste correct sur des instances serverless multiples.
- [x] Si Redis est injoignable, la requête est autorisée (fail-open) et
      l'échec est journalisé côté serveur — pas de panne d'authentification à
      cause d'un incident Redis (ADR-004).
- [x] Test unitaire — `apps/web/src/lib/__tests__/rateLimit.test.ts` (câblé
      rétroactivement par la story 15.9, voir ADR-005) : couvre le succès sous
      la limite, l'absence de ré-`expire` après le premier incrément, le
      blocage au-delà de la limite, le fail-open sur erreur Redis, et
      `getClientIp`/`loginRateLimitKey`.

**Implémentation** : [apps/web/src/lib/rateLimit.ts](../apps/web/src/lib/rateLimit.ts),
[apps/web/src/lib/auth.ts](../apps/web/src/lib/auth.ts),
[apps/web/src/app/api/auth/mobile/route.ts](../apps/web/src/app/api/auth/mobile/route.ts),
[apps/web/src/app/api/auth/register/route.ts](../apps/web/src/app/api/auth/register/route.ts).
Détail de la décision : [03-architecture.md ADR-004](03-architecture.md#adr-004--rate-limiting--fenêtre-fixe-redis-fail-open).

**Vérification** : le chemin fail-open est confirmé — sans Redis local
disponible, `POST /api/auth/register` et `POST /api/auth/mobile` ont été
exercés en direct et le rate limiter a échoué silencieusement (erreur
journalisée) sans bloquer ni planter la requête, qui a continué normalement
jusqu'à l'appel Prisma suivant. Le chemin "bloque après N tentatives"
**reste non vérifié** — nécessite Redis réellement joignable pour que
`INCR`/`EXPIRE` s'exécutent. À vérifier dès que Redis est disponible :
`bmad qa 15.1`.

**Observation opérationnelle (relevée pendant la vérification de la story
15.2)** : quand Redis est injoignable, le fail-open prend **~9-10 secondes**
avant de répondre (backoff de reconnexion par défaut d'`ioredis`) — le
comportement est correct (pas de panne), mais l'utilisateur attend
anormalement longtemps pendant un incident Redis. Pas un défaut fonctionnel,
mais une latence à corriger (ex. `retryStrategy`/`connectTimeout` plus
agressifs) si l'Epic 15 revient sur ce fichier — non traité ici pour ne pas
rouvrir une story déjà ✅.

### Story 15.2 — Validation Zod manquante · ✅ Done

**Story** : En tant que développeur, je veux que chaque route API valide son
body avec un schéma Zod côté serveur, afin qu'aucune donnée malformée
n'atteigne Prisma sans contrôle (BE-03/FE-08/API-03).

**Critères d'acceptation**
- [x] `POST /api/auth/mobile` rejette avec `400` un email malformé, un mot de
      passe absent, ou un body non conforme — via `loginSchema` (déjà
      présent dans `@budget-pocket/shared`, jusqu'ici inutilisé par cette
      route).
- [x] `PATCH /api/goals/[id]` rejette avec `400` un body non conforme — via
      `updateGoalSchema` (déjà présent, jusqu'ici inutilisé par cette route).
- [x] Aucun champ non whitelisté par le schéma n'est transmis à Prisma
      (Zod ignore silencieusement les clés inconnues par défaut).
- [x] Test unitaire — `apps/web/src/lib/__tests__/authSchemas.test.ts`
      (câblé rétroactivement par la story 15.9, voir ADR-005) : couvre
      `loginSchema` et `updateGoalSchema` (acceptation valide, rejet email
      malformé/mot de passe vide/montant négatif/statut invalide, et
      confirmation que les champs non whitelistés — ex. `userId` — sont
      silencieusement retirés plutôt que transmis à Prisma).

**Implémentation** : [apps/web/src/app/api/auth/mobile/route.ts](../apps/web/src/app/api/auth/mobile/route.ts),
[apps/web/src/app/api/goals/[id]/route.ts](../apps/web/src/app/api/goals/[id]/route.ts) —
les deux schémas existaient déjà dans `packages/shared/src/schemas/`
(`auth.ts`, `goal.ts`) mais n'étaient importés par aucune route ; aucun nouveau
schéma n'a été nécessaire.

**Vérification** : `auth/mobile` testé en direct — email malformé → `400`,
mot de passe manquant → `400`, body valide → passe la validation, atteint
Prisma, **et réussit désormais réellement** : login testé de bout en bout
avec le compte de démo (`demo@budget-pocket.app`) une fois la BDD Neon
opérationnelle — JWT valide émis. `goals/[id]` reste non vérifié : la route
est protégée en amont par `middleware.ts` qui redirige (`307`) toute requête
non authentifiée avant d'atteindre le handler, donc le chemin de validation
Zod n'est atteignable qu'avec une vraie session cookie — pas simulable via
`curl` seul. À vérifier via le navigateur ou un test e2e : `bmad qa 15.2`.

**Observation incidente (hors périmètre de cette story)** : en testant
`goals/[id]` sans session, la requête reçoit une redirection `307` vers
`/api/auth/signin` (comportement de `middleware.ts`/`withAuth`) plutôt qu'un
`401` JSON propre — ce qui casse le contrat attendu par un client API/mobile
consommant du JSON. Comportement pré-existant, non introduit par 15.1/15.2 ;
à traiter dans une story dédiée si confirmé problématique pour le client
mobile.

### Story 15.9 — Câbler un test runner (Jest) · ✅ Done

**Story** : En tant que développeur, je veux un test runner fonctionnel dans
le monorepo, afin que la règle §6.1 "tests écrits avec le code" soit
respectable pour toute story future — au lieu de systématiquement produire
un ADR de report comme 15.1 et 15.2 l'ont fait.

**Critères d'acceptation**
- [x] `pnpm --filter web run test` exécute une suite Jest et réussit.
- [x] `pnpm test` (racine, via Turborepo) exécute la même suite — le test
      runner est disponible au niveau du monorepo, pas seulement en local
      dans `apps/web`.
- [x] `pnpm type-check` reste vert avec les fichiers de test inclus.
- [x] Les tests différés de 15.1 et 15.2 sont écrits rétroactivement
      (voir leurs cases à cocher ci-dessus) — la preuve que le runner
      fonctionne n'est pas un test bidon, mais la dette réelle qu'il devait
      résorber.

**Implémentation** : [apps/web/jest.config.js](../apps/web/jest.config.js)
(`next/jest`), scripts `test`/`test:watch` dans `apps/web/package.json`,
tâche `test` ajoutée à [turbo.json](../turbo.json) et au `package.json`
racine. Tests : [apps/web/src/lib/__tests__/rateLimit.test.ts](../apps/web/src/lib/__tests__/rateLimit.test.ts),
[apps/web/src/lib/__tests__/authSchemas.test.ts](../apps/web/src/lib/__tests__/authSchemas.test.ts).

**Déviations rencontrées** (voir [03-architecture.md ADR-006](03-architecture.md#adr-006--pin-jest-2910-pour-compatibilité-avec-nextjest)) :
`next/jest` (fourni par `next@14.2.35`) est incompatible avec `jest@30`
(erreur interne `clearMocksOnScope is not a function`) — `jest` a été
repointé sur `^29.7.0`, la ligne pour laquelle `next/jest` a réellement été
écrite. `@types/jest` a aussi dû être ajouté (absent malgré `jest` en
devDependency depuis le début du projet).

**Vérification** : `pnpm test` et `pnpm type-check` exécutés à la racine du
monorepo — 19 tests passent, aucune régression de type.

**Portée non couverte** : uniquement `apps/web`. `apps/mobile` (Expo/React
Native) nécessiterait un preset différent (`jest-expo`) — hors périmètre S de
cette story. `packages/shared`/`packages/api-client` peuvent réutiliser la
suite `apps/web` sans config propre (déjà démontré par `authSchemas.test.ts`,
qui teste du code de `packages/shared` depuis `apps/web`).

---

### Story 15.6 — Pipeline CI/CD avec protections de branche · ✅ Done

**Story** : En tant que mainteneur, je veux que chaque push/PR soit vérifié
automatiquement (types + tests), et qu'aucun code cassé ne puisse être
fusionné sur `master` sans passer ces contrôles.

**Prérequis résolu** : le dépôt a été poussé sur GitHub
(`github.com/golden001boy/budget-pocket`) — jusqu'ici tout l'historique était
local uniquement, un pipeline CI n'a de sens qu'avec un remote. Le dépôt est
**public**, pas privé comme prévu initialement : la protection de branche
(classique *et* Rulesets) n'est pas appliquée sur un dépôt privé en dehors
d'un compte GitHub Team/Enterprise — changement de visibilité nécessaire pour
que cette story soit réellement faisable sans coût.

**Critères d'acceptation**
- [x] Un workflow GitHub Actions s'exécute sur chaque push et pull request
      vers `master`.
- [x] Le workflow exécute `pnpm type-check` et `pnpm test` — les deux gates
      qui existent réellement à ce jour (voir [04-tests.md](04-tests.md)).
- [x] Vérifié que `prisma generate` (déclenché par `pnpm install` via son
      `postinstall`) réussit **sans** `DATABASE_URL` — confirmé en direct en
      déplaçant temporairement `.env` : succès, code de sortie 0. La CI n'a
      donc besoin d'aucun secret pour ces deux checks.
- [x] `pnpm install --frozen-lockfile` (comportement CI) testé en local :
      lockfile à jour, aucune dérive.
- [x] **Le workflow tourne réellement sur GitHub et passe** — confirmé via
      l'API Actions (`conclusion: "success"` sur les 8 étapes du job
      `type-check-and-test`, run [29928138512](https://github.com/golden001boy/budget-pocket/actions/runs/29928138512)).
- [x] **Protection de branche sur `master`** : `Require a pull request before
      merging` + `Require status checks to pass before merging` (check
      `type-check-and-test`) actifs — confirmé via
      `GET /repos/golden001boy/budget-pocket/branches/master` :
      `"protected": true`, `required_status_checks.contexts: ["type-check-and-test"]`.
      `enforcement_level: "non_admins"` — le propriétaire du dépôt peut encore
      bypasser la règle (comportement standard GitHub), à garder en tête.

**Bug trouvé et corrigé en cours de route** : le tout premier run a échoué
(`pnpm/action-setup@v4` en échec immédiat, toutes les étapes suivantes
skippées) — le workflow fixait `version: 9` alors que
`package.json` a déjà `"packageManager": "pnpm@9.0.0"` ; `pnpm/action-setup`
erreure quand les deux sont présents à la fois. Retiré le `version:` du
workflow ; deuxième run entièrement vert.

**Implémentation** : [.github/workflows/ci.yml](../.github/workflows/ci.yml).

**Vérification** : commandes rejouées localement dans l'ordre exact du
workflow (toutes vertes), puis le run réel sur GitHub et l'état de la
protection de branche confirmés indépendamment via l'API GitHub (lectures
publiques, sans authentification, le dépôt étant désormais public).

---

### Story 15.5 — Scan SCA des dépendances + plan de remédiation · ✅ Done

**Story** : En tant que mainteneur, je veux connaître les vulnérabilités
connues dans les dépendances du projet et un plan pour les traiter, afin de
ne pas laisser de failles de supply chain non gérées (DEV-02).

**Scan initial** : `pnpm audit` → **46 vulnérabilités** (1 critique, 26
hautes, 16 modérées, 3 basses). Répartition par origine :
- La quasi-totalité venait de dépendances **transitives de l'outillage
  mobile** (`@expo/cli` → `cacache`/`tar`, `js-yaml`, `brace-expansion`,
  `@xmldom/xmldom`, `fast-uri`, `fast-xml-parser`, `turbo-stream`, `glob`,
  `send`, `uuid`, `postcss`) — code de build/dev, jamais exécuté en
  production, mais un vrai risque de supply chain (exécution de code non
  fiable sur la machine de dev/CI).
- Une quinzaine venait de `next@14.2.35` lui-même (`apps/web`, dépendance de
  production réelle).

**Critères d'acceptation**
- [x] Scan complet documenté (voir ci-dessus et détail par paquet
      ci-dessous).
- [x] Toutes les vulnérabilités corrigibles par un bump patch/mineur (même
      ligne majeure) ont été corrigées via `pnpm.overrides` :
      `send`, `glob`, `tar`, `postcss`, `@xmldom/xmldom`, `fast-xml-parser`,
      `uuid`, `turbo-stream`, `js-yaml`, `brace-expansion`, `fast-uri`.
      **Résultat : 46 → 14 vulnérabilités, le critique éliminé entièrement**
      (0 critique, 5 hautes, 7 modérées, 2 basses restantes).
- [x] Vérifié qu'aucune régression n'a été introduite : `pnpm type-check`
      (4/4 workspaces ✅), `pnpm test` (19/19 ✅), redémarrage du serveur de
      dev avec succès (`/`, `/login` → 200).
- [x] Les 14 vulnérabilités restantes sont **toutes** dans `next` et
      nécessitent un passage à **Next.js ≥15.5.16** — aucun correctif 14.x
      n'existe pour aucune d'entre elles (vérifié advisory par advisory).
      C'est un changement majeur (breaking), hors périmètre d'une story S —
      story dédiée créée : **15.10**.
- [x] Risque résiduel documenté : `js-yaml` et `brace-expansion` ont été
      forcés en override "bare" (toutes résolutions, pas seulement la plage
      vulnérable) car le ciblage par plage de semver n'a pas fonctionné comme
      attendu pour ces deux paquets (voir tentative dans l'historique git de
      ce fichier) — risque théorique si du code interne à `@expo/cli`
      utilisait une API v3 de `js-yaml` (`safeLoad`/`safeDump`, supprimée en
      v4). `pnpm type-check` ne peut pas détecter ce genre de rupture dans du
      JS compilé tiers ; seul un vrai `expo start` le révélerait. Non testé
      ici (pas d'environnement mobile lancé dans cette session).

**Implémentation** : [package.json](../package.json) (`pnpm.overrides`).

**Vérification** : `pnpm audit` avant/après (46 → 14), `pnpm type-check` et
`pnpm test` rejoués après le changement de dépendances, serveur de dev
redémarré et testé en direct (`/`, `/login`, `/api/health` — ce dernier
confirme toujours `db` joignable, l'erreur restante étant Redis, sans lien
avec ce changement).

### Story 15.10 — Migrer Next.js 14 → 15+ · 🔴 À faire

**Story** : En tant que mainteneur, je veux passer à une version de Next.js
qui corrige les 14 vulnérabilités restantes du scan SCA (DoS, XSS, SSRF,
cache poisoning, request smuggling — détail dans [04-tests.md](04-tests.md)),
afin de fermer le dernier residu de la story 15.5.

**Pourquoi une story séparée** : `next@14 → 15` est un changement majeur —
API de requête asynchrone (`cookies()`/`headers()` deviennent `async`),
changements de comportement du cache, exigences de version React à
revalider. Impacte potentiellement toutes les routes API et pages de
`apps/web`. Ne rentre pas dans le calibrage S/M d'une story de sécurité
ponctuelle ; nécessite son propre cycle de test complet (`bmad qa` dédié).

**Non commencée.**

---

### Story 15.4 — Intégration monitoring d'erreurs (Sentry) · ✅ Done

**Story** : En tant que mainteneur, je veux que les erreurs non gérées côté
client, serveur et edge soient remontées automatiquement, afin de savoir
qu'un incident se produit en production sans attendre qu'un utilisateur le
signale (PROD-01).

**Critères d'acceptation**
- [x] `@sentry/nextjs` installé et intégré aux trois runtimes Next.js :
      client ([src/instrumentation-client.ts](../apps/web/src/instrumentation-client.ts)),
      Node.js et edge (via [src/instrumentation.ts](../apps/web/src/instrumentation.ts) →
      [sentry.server.config.ts](../apps/web/sentry.server.config.ts) /
      [sentry.edge.config.ts](../apps/web/sentry.edge.config.ts)).
- [x] `next.config.mjs` enveloppé avec `withSentryConfig` — upload de source
      maps configuré mais **dégradé silencieusement** si `SENTRY_ORG` /
      `SENTRY_PROJECT` / `SENTRY_AUTH_TOKEN` sont absents (comportement
      documenté de la lib, pas un correctif ad hoc).
- [x] Frontière d'erreur globale App Router ajoutée
      ([src/app/global-error.tsx](../apps/web/src/app/global-error.tsx)) —
      capture les erreurs de rendu React qui échapperaient autrement à toute
      remontée.
- [x] CSP mise à jour (`connect-src`) pour autoriser les domaines d'ingestion
      Sentry (`*.sentry.io`, `*.ingest.us.sentry.io`) — sans ça, le
      navigateur aurait bloqué silencieusement l'envoi des events côté
      client.
- [x] **Sans DSN configuré, le SDK s'initialise en no-op** (vérifié : aucune
      erreur, aucun avertissement au boot, dev server + build de production
      tous deux propres) — pas de risque de casser l'environnement local ou
      la CI qui n'ont pas de DSN.
- [x] Deux avertissements de config levés en cours de route (voir
      ci-dessous) — configuration finale sans aucun warning au boot.
- [ ] **Capture réelle d'un événement dans un vrai projet Sentry** — non
      vérifiable sans compte Sentry (même situation que Neon/GitHub
      précédemment : nécessite une action de votre côté). Voir §Vérification.

**Avertissements de config résolus** :
- `disableLogger: true` est déprécié dans cette version → remplacé par
  `webpack.treeshake.removeDebugLogging: true`.
- Le SDK exigeait l'export `onRouterTransitionStart` depuis
  `instrumentation-client.ts` pour instrumenter les transitions de route
  (sinon warning "ACTION REQUIRED" à chaque boot) → ajouté.

**Implémentation** : voir fichiers listés ci-dessus, plus
[apps/web/.env.example](../apps/web/.env.example) et
[apps/web/.env](../apps/web/.env) (variables `NEXT_PUBLIC_SENTRY_DSN`,
`SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` documentées, toutes
optionnelles).

**Vérification** : `pnpm type-check` (4/4 workspaces), `pnpm test` (19/19),
`pnpm run build` (production, 43/43 routes compilées avec succès), dev
server redémarré à froid — aucune erreur ni warning Sentry au boot, `/`,
`/login`, `/api/health` tous répondent normalement. **Non vérifié** : qu'un
DSN réel reçoit effectivement un événement — nécessite un compte Sentry
(gratuit, sentry.io) et son DSN. À faire dès que vous en avez un :
`bmad qa 15.4`.

---

### Story 15.7 — Politique de backup/rollback BDD production · 🟡 Partiel

**Story** : En tant qu'opérateur, je veux une politique documentée et
compréhensible de sauvegarde/restauration pour la base de données de
production, afin de pouvoir réagir à un incident de données sans improviser
(Gate Phase 6 §9.1).

**Critères d'acceptation**
- [x] Mécanisme de restauration Neon documenté avec précision — recherché via
      la documentation officielle Neon (pas supposé) : restauration par
      branchement (LSN → nouvelle branche → compute transféré → ancienne
      branche renommée en sauvegarde), réversible, root branches uniquement.
- [x] Fenêtre de rétention réelle du plan actuel confirmée avec vous : **Free,
      6 heures, plafonné à 1 Go d'historique**. Documenté comme risque assumé
      plutôt que minimisé.
- [x] Procédure de restauration écrite, étape par étape (console + équivalents
      CLI/API).
- [x] Stratégie de rollback de schéma Prisma documentée (restauration Neon
      dans la fenêtre PITR ; migration inverse manuelle au-delà).
- [ ] **Test de restauration réel** — non exécuté. Nécessite la console/API
      Neon, à laquelle l'agent n'a pas accès (seule la chaîne de connexion
      Postgres a été fournie). C'est la raison pour laquelle cette story
      reste 🟡 et non ✅ : le Gate Phase 6 §9.1 exige des sauvegardes
      **vérifiées fonctionnelles**, pas seulement documentées.
- [ ] Sauvegarde hors Neon (export périodique externe) — non traitée, notée
      comme hors périmètre d'une story S.

**Implémentation** : [03-architecture.md §11](03-architecture.md#11--politique-de-sauvegarde--restauration-story-157).

**Pour passer à ✅** : exécuter un test de restauration réel dans la console
Neon (créer une ligne de test, noter l'horodatage, la modifier, restaurer à
l'horodatage noté, vérifier que la valeur d'origine est revenue) —
`bmad qa 15.7`. Nécessite un accès à la console Neon (vous), pas seulement à
la chaîne de connexion (moi).

---

### Story 15.3 — Pagination sur `/api/accounts`, `/api/budgets`, `/api/goals`, `/api/portfolio` · ✅ Done

**Story** : En tant qu'opérateur de la plateforme, je veux que les listes
retournées par les routes API mutatives limitent et paginent leurs résultats,
afin d'éviter qu'un compte Premium (limites `Infinity` sur
`maxGoals`/`maxPortfolioItems`/`maxLinkedAccounts`, voir
`packages/shared/src/constants/limits.ts`) ne déclenche une requête non
bornée (API-04 — Unrestricted Resource Consumption).

**Critères d'acceptation**
- [x] `GET /api/accounts`, `/api/budgets`, `/api/goals`, `/api/portfolio`
      acceptent `?page=&pageSize=` et renvoient `{ data, meta }` avec
      `meta: { total, page, pageSize, totalPages }` — même contrat que
      `GET /api/transactions` et le type partagé `ApiResponse<T>` déjà défini
      dans `packages/shared/src/types/api.ts` (jamais utilisé jusqu'ici).
- [x] `pageSize` est plafonné (`MAX_PAGE_SIZE = 100`) — un client ne peut pas
      demander une page arbitrairement grande.
- [x] Des paramètres non numériques ou négatifs (`page=abc`, `pageSize=-10`)
      retombent sur les valeurs par défaut au lieu de produire un `NaN` côté
      Prisma (`skip`/`take`) ou un 500.
- [x] Logique de parsing centralisée dans `apps/web/src/lib/pagination.ts`
      (`parsePagination`, `buildPaginationMeta`), réutilisée par les 4
      nouvelles routes **et** par `GET /api/transactions`, qui faisait déjà de
      la pagination mais sans plafond ni validation — corrigé au passage sans
      changer son contrat externe (toujours `{ data, meta }`).
- [x] `/api/budgets` conserve son filtre `month`/`year` existant en plus de la
      pagination (comportement par défaut inchangé pour un appelant qui ne
      passe pas `page`/`pageSize`).
- [x] Bug découvert en implémentant : l'écran mobile
      `apps/mobile/app/(tabs)/investments/index.tsx` lisait `data.items` alors
      que `GET /api/portfolio` renvoyait un tableau brut — la liste
      d'investissements était donc **toujours vide** sur mobile. Corrigé au
      passage (`data.data`, cohérent avec le nouveau contrat) — c'est le même
      endpoint que celui modifié par cette story, pas un ajout de périmètre.
- [x] Tests unitaires —
      `apps/web/src/lib/__tests__/pagination.test.ts` : défauts, calcul
      skip/take, plafonnement `pageSize`, retombée sur défaut pour entrées
      invalides (`NaN`, zéro, négatif), calcul `totalPages` (y compris le cas
      `total = 0` → `totalPages = 1`, pas `0`).
- [x] Vérifié en direct contre la vraie BDD Neon avec le compte de démo
      (`demo@budget-pocket.app`, PREMIUM) via le serveur de dev : les 4 routes
      renvoient bien `{ data, meta }` avec les bons `total`/`totalPages` ;
      `pageSize=999999` sur `/api/transactions` est bien plafonné à 100 (84
      résultats renvoyés, pas plus) ; `page=abc&pageSize=xyz` renvoie `200`
      avec les valeurs par défaut, pas un crash.
- [x] `pnpm type-check` (4/4) et `pnpm test` (26/26, +7 vs avant) verts après
      les changements.

**Non couvert par cette story** : l'écran mobile Investissements ne charge
que la page 1 (pas de pager/infinite-scroll côté UI) — les routes web
équivalentes (`accounts`, `budgets`, `goals`, `dashboard`) lisent Prisma
directement côté serveur (composants serveur), donc ne sont pas concernées
par ce changement de contrat API.

---

### Story 15.8 — MFA ou hardening de l'authentification · 🟡 Partiel (hardening fait, MFA hors périmètre)

**Story** : En tant qu'opérateur de la plateforme, je veux renforcer
l'authentification au-delà du rate limiting déjà en place (story 15.1), afin
de réduire les risques identifiés en BE-02 (pas de MFA, session longue,
politique de mot de passe faible).

**Décision de périmètre** (vous, avant implémentation) : hardening
uniquement pour cette story — pas de MFA TOTP. Le MFA complet exige une
migration de schéma (`mfaSecret`/codes de secours sur `User`), une nouvelle
dépendance TOTP, une UI d'enrôlement/QR code et une refonte du flux
`CredentialsProvider` NextAuth en deux étapes (mot de passe puis code) — un
effort disproportionné pour un projet sans utilisateurs réels. Reste donc 🔴
pour le volet MFA ; la partie hardening est ✅.

**Critères d'acceptation**
- [x] **Rate limiting compte, indépendant de l'IP** — la limite existante
      (story 15.1) est par paire (email, IP) : un attaquant qui fait tourner
      plusieurs IP reçoit une nouvelle fenêtre de 5 tentatives à chaque
      changement. Nouvelle couche `accountLoginRateLimitKey(email)` dans
      [rateLimit.ts](../apps/web/src/lib/rateLimit.ts) : 10
      tentatives/15 min cumulées sur le compte, toutes IP confondues,
      appliquée en plus de la limite par IP (jamais à la place) sur les deux
      points d'entrée (`authorize()` web, `POST /api/auth/mobile`). Seuil
      volontairement plus haut que la limite par IP (5) pour qu'un
      utilisateur légitime qui se trompe de mot de passe depuis une seule IP
      ne la déclenche jamais.
- [x] **Durée de session réduite** : `maxAge` JWT passé de 30 à 7 jours, côté
      web (`authOptions.session.maxAge`) et côté mobile (token émis par
      `/api/auth/mobile`, gardés synchronisés). Réduit la fenêtre
      d'exposition d'un jeton volé/oublié sur un appareil inactif — un
      utilisateur actif ne le remarque pas (NextAuth réémet silencieusement
      le jeton en fonction de l'activité, `updateAge` par défaut). Contrepartie
      assumée côté mobile : pas de flux de refresh token existant, donc un
      utilisateur mobile inactif 7 jours doit se reconnecter (au lieu de 30).
- [x] **Politique de mot de passe renforcée** sur `registerSchema`
      (`packages/shared/src/schemas/auth.ts`) : longueur minimale passée de 8
      à 10 caractères, rejet d'une liste de mots de passe communs/compromis
      connus (`password123`, `12345678`, etc.), insensible à la casse.
      Délibérément **pas** de règle de complexité par classe de caractères
      (majuscule/chiffre/symbole imposés) — NIST 800-63B déconseille cette
      approche, qui pousse vers des substitutions prévisibles
      (`Password1!`) sans gain réel de résistance aux attaques. `loginSchema`
      n'est pas touché : les comptes existants avec un mot de passe plus
      court (ex. `demo@budget-pocket.app`, 8 caractères) continuent de se
      connecter normalement — aucune migration de données, pas de
      réinitialisation forcée.
- [x] Placeholder du formulaire d'inscription web mis à jour ("Minimum 10
      caractères") — l'indicateur de force du mot de passe déjà présent
      classait ≥10 caractères comme "Fort", donc déjà aligné avec la
      nouvelle politique sans modification.
- [x] Tests unitaires — 8 nouveaux tests : 5 sur `registerSchema`
      ([authSchemas.test.ts](../apps/web/src/lib/__tests__/authSchemas.test.ts),
      longueur minimale, rejet mot de passe commun insensible à la casse,
      défaut de devise) et 3 sur `accountLoginRateLimitKey`
      ([rateLimit.test.ts](../apps/web/src/lib/__tests__/rateLimit.test.ts),
      normalisation email, indépendance vis-à-vis de l'IP, seuil supérieur à
      la limite par IP).
- [x] Vérifié en direct contre la vraie BDD Neon : inscription avec mot de
      passe commun → `400` (`"Mot de passe trop courant..."`) ; inscription
      avec 9 caractères → `400` (`"Minimum 10 caractères"`) ; inscription
      avec un mot de passe fort valide → `201`, compte créé puis supprimé
      après vérification ; connexion du compte de démo (mot de passe
      8 caractères, antérieur à cette story) toujours fonctionnelle ; jeton
      mobile décodé (`next-auth/jwt` `decode()`) confirme `exp - iat = 7
      jours` exactement.
- [x] `pnpm type-check` (4/4) et `pnpm test` (34/34, +8 vs story 15.3) verts.
- [ ] **MFA (TOTP)** — non traité, périmètre explicitement exclu de cette
      story (voir décision ci-dessus). À planifier comme story dédiée si
      souhaité avant un lancement avec de vrais utilisateurs.
- [ ] **Révocation de session côté serveur** — non traitée. La stratégie JWT
      est sans état par design : réduire `maxAge` borne la fenêtre
      d'exposition mais ne permet pas d'invalider un jeton déjà émis avant
      son expiration (ex. compte compromis, déconnexion forcée à distance).
      Le modèle Prisma `Session` existe dans le schéma mais n'est pas utilisé
      par la stratégie `jwt` actuelle — implémenter une vraie révocation
      nécessiterait soit de passer à la stratégie `database` de NextAuth,
      soit une liste de révocation Redis vérifiée à chaque requête (coût de
      latence sur *chaque* appel authentifié). Non traité ici — changement de
      stratégie d'authentification plus large que le périmètre "hardening"
      convenu.

**Implémentation** : [rateLimit.ts](../apps/web/src/lib/rateLimit.ts),
[auth.ts](../apps/web/src/lib/auth.ts),
[api/auth/mobile/route.ts](../apps/web/src/app/api/auth/mobile/route.ts),
[schemas/auth.ts](../packages/shared/src/schemas/auth.ts).

---

## Non-goals / gaps explicites

- **Synchronisation mobile money automatique** (Epic 2, story 2.2) — les
  providers `WAVE`/`MTN_MONEY`/`ORANGE_MONEY` existent en tant qu'interfaces
  typées qui lèvent `"...API not yet connected"`. `NEXT_PUBLIC_ENABLE_SYNC`
  vaut `false` par défaut.
- **Chat IA conversationnel** (Epic 9, story 9.3) — `POST /api/advisor/chat`
  retourne inconditionnellement `503 FEATURE_DISABLED`, malgré un pipeline de
  contexte (`buildContext.ts`) et une config provider (Groq/Anthropic) déjà
  écrits.
- Pas de suite de tests automatisés au-delà de 2 specs Playwright e2e — aucun
  test unitaire sur les simulateurs, l'analytique ou les routes API.

## Entités du domaine

Voir `apps/web/prisma/schema.prisma` (19 modèles) — détail complet dans
[03-architecture.md](03-architecture.md).
