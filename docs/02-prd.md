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
| 15.3 | Pagination sur `/api/accounts`, `/api/budgets`, `/api/goals`, `/api/portfolio` | Should | S | 🔴 | Perf (règle Phase 1) |
| 15.4 | Intégration monitoring d'erreurs (Sentry) | Must | M | ✅ | PROD-01 |
| 15.5 | Scan SCA des dépendances + plan de remédiation | Must | S | ✅ | DEV-02 |
| 15.6 | Pipeline CI/CD avec protections de branche | Must | M | ✅ | DEV-03 |
| 15.7 | Politique de backup/rollback BDD production | Must | S | 🔴 | Gate Phase 6 §9.1 |
| 15.8 | MFA ou hardening de l'authentification | Should | L | 🔴 | BE-02 |
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
