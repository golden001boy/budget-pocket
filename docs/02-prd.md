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

## Epic 15 — Mise en conformité BMAD v2 (sécurité & prod) · 🟡 En cours (15 ✅ + 4 🟡 sur 19)

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
| 15.10 | Migrer Next.js 14 → 15+ | Should | L | ✅ | DEV-02 (résidu de 15.5) |
| 15.11 | Reset de mot de passe (flux email + token) | Must | M | ✅ | Gate Phase 6 §9.1 |
| 15.12 | Vérification email à l'inscription | Must | M | ✅ | Gate Phase 6 §9.1 |
| 15.13 | Tests de charge | Should | M | ✅ | Gate Phase 6 §9.3 |
| 15.14 | Coffre de secrets pour les variables d'environnement | Could | S | 🟡 | Gate Phase 6 §9.2 |
| 15.15 | Politique de patching formelle + test de rollback | Could | S | 🟡 | Gate Phase 6 §9.3 |
| 15.16 | Corriger le goulot `/dashboard` trouvé en story 15.13 | Should | M | ✅ | Gate Phase 6 §9.3 (suivi 15.13) |
| 15.17 | Ne pas exposer le détail interne des erreurs sur `/api/health` | Should | S | ✅ | Gate Phase 6 §9.2, BE-09 |
| 15.18 | Pagination sur `/api/advisor/scenarios` et `/api/planning/taxes` | Should | S | ✅ | Gate Phase 6 §9.1 (résidu de 15.3) |
| 15.19 | Journalisation centralisée des actions sensibles (auth) | Should | S | ✅ | Gate Phase 6 §9.3, BE-08 |

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

### Story 15.10 — Migrer Next.js 14 → 15+ · ✅ Done

**Story** : En tant que mainteneur, je veux passer à une version de Next.js
qui corrige les 14 vulnérabilités restantes du scan SCA (DoS, XSS, SSRF,
cache poisoning, request smuggling — détail dans [04-tests.md](04-tests.md)),
afin de fermer le dernier residu de la story 15.5.

**Recherche préalable (avant tout code)** : le monde a bougé depuis la
rédaction de cette story. Next.js 15 impose React 19 comme minimum réel pour
l'App Router (le `peerDependencies` npm accepte encore `^18.2.0`, mais c'est
un vestige de compatibilité Pages Router — confirmé faux en pratique pour
l'App Router). NextAuth v4 a des soucis documentés sur Next 15 App Router ;
Auth.js v5 (son successeur) est encore en beta après plus d'un an
(`5.0.0-beta.32` au moment de cette story). Le vrai `latest` npm de `next`
est désormais 16.x, 15.x étant maintenu via un tag `backport` (`15.5.21` —
exactement la version déjà citée dans nos docs comme corrigeant les 14
vulnérabilités). **Décision prise avec vous avant implémentation** :
`next@15.5.21` + React 19, en gardant NextAuth v4 (pas de réécriture vers
Auth.js v5 beta, pas de saut à Next 16). Voir
[03-architecture.md ADR-009](03-architecture.md#adr-009--migration-nextjs-15--react-19-story-1510).

**Critères d'acceptation**
- [x] `next` 14.2.35 → 15.5.21, `react`/`react-dom` 18.3.1 → 19.2.8,
      `@types/react`/`@types/react-dom` → 19.2.17/19.2.3,
      `eslint-config-next` → 15.5.21. `apps/mobile` reste sur React 18.2.0
      (Expo SDK 51) — non touché par cette story.
- [x] APIs asynchrones (breaking change Next 15) : `params` sur les routes
      dynamiques (`api/goals/[id]`, `api/transactions/[id]`) et
      `searchParams` sur les pages serveur (`expenses`,
      `settings/billing`, `admin/users`) convertis en `Promise` + `await`.
      Aucun usage de `cookies()`/`headers()`/`draftMode()` trouvé dans le
      code applicatif (NextAuth gère ça en interne).
- [x] `next.config.mjs` : `experimental.serverComponentsExternalPackages`
      renommé en `serverExternalPackages` (stable depuis 15).
- [x] **Bug de résolution de types découvert et corrigé** (le plus gros du
      travail de cette story, sans rapport avec Next.js lui-même) : élever
      `apps/web` vers React 19 tout en gardant `apps/mobile` sur React 18
      dans le même workspace pnpm cassait le type-check (`TS2786`,
      composants shadcn/Radix inutilisables comme JSX) — causé par
      `resolve-peers-from-workspace-root=true` dans `.npmrc` (présent
      depuis le commit initial), qui faisait résoudre les peers `@types/react`
      des paquets de `apps/web` contre la version 18.3.1 d'`apps/mobile`.
      Supprimé, plus deux couches de hoisting pnpm (racine ET la couche
      cachée `.pnpm/node_modules/`) explicitement exclues pour
      `@types/react`/`@types/react-dom`. Détail complet : ADR-009.
- [x] **`recharts` incompatible React 19** : `recharts@2.13.3` (puis
      `2.15.4`, qui ajoute React 19 aux `peerDependencies` sans corriger
      tous les types) expose plusieurs primitives (`XAxis`, `YAxis`,
      `Tooltip`, `Legend`, `Bar`, `Area`, `Pie`, `Line`, `ReferenceLine`)
      encore typées comme composants classe à un seul argument, incompatible
      avec le `JSX.ElementType` plus strict de React 19. Contournement
      centralisé dans
      [apps/web/src/lib/rechartsCompat.ts](../apps/web/src/lib/rechartsCompat.ts)
      (cast vers `ComponentType<any>`, aucun changement de comportement au
      runtime) plutôt qu'un saut vers `recharts@3` (breaking API, hors
      périmètre). Utilisé dans les 5 composants `charts/` + les 2 composants
      `marketing/` (landing page).
- [x] `sharp@0.34.5` (dépendance transitive de `next@15.5.21` lui-même, via
      l'optimisation d'images) introduisait une nouvelle vulnérabilité
      HIGH (CVE-2026-33327 et 3 autres, libvips). Corrigée via
      `pnpm.overrides` (`sharp@^0.35.3`).
- [x] Hook `onRequestError` ajouté à `instrumentation.ts` — Next 15 le
      réclame explicitement pour capturer les erreurs de Server Components
      imbriqués (Sentry log un avertissement au boot sans lui).
- [x] `pnpm type-check` (4/4) et `pnpm test` (34/34) verts.
- [x] `pnpm audit` : **14 → 0 vulnérabilité** — meilleur que l'objectif
      initial de cette story (qui visait seulement les 14 de `next`).
- [x] Vérifié en direct contre la vraie BDD Neon avec le compte de démo :
      connexion mobile (`/api/auth/mobile`), connexion navigateur réelle
      (flux CSRF + callback NextAuth reproduit directement en HTTP),
      routes paginées (`accounts`, `goals`), route dynamique
      `transactions/[id]` (GET), pages serveur avec `searchParams` async
      (`/expenses`, `/settings/billing`), rendu du dashboard (17 éléments
      `<svg>` confirmant que les graphiques recharts s'affichent
      réellement), création + suppression d'une transaction (201 puis 204).
      CSP toujours correctement appliquée.
- [ ] **Suite Playwright** — 8/10 specs échouent avec le délai `next dev`
      froid + latence de retry Redis déjà documentée (~9-10s, story 15.1) :
      `page.waitForURL(/dashboard/, { timeout: 15_000 })` est trop court
      dans cet environnement local sans Redis. Diagnostiqué en détail avec
      un script Playwright ad hoc : la connexion NextAuth aboutit
      réellement (cookie de session valide, `/api/auth/session` renvoie
      l'utilisateur), la navigation vers `/dashboard` aboutit aussi (RSC
      200, chunks JS chargés) — juste après le délai de 15s. Confirmé non
      lié à cette migration (le délai Redis est antérieur, non bloquant
      pour la Phase 6 vu que Playwright n'est pas dans le pipeline CI).
      Non corrigé ici — augmenter les timeouts des specs est un changement
      de test, hors périmètre d'une story de migration de version.

**Implémentation** : `apps/web/package.json`, `package.json` (racine,
`pnpm.overrides`), `.npmrc`, `apps/web/tsconfig.json`,
`apps/web/next.config.mjs`, `apps/web/src/lib/rechartsCompat.ts`,
`apps/web/src/instrumentation.ts`,
[03-architecture.md ADR-009](03-architecture.md#adr-009--migration-nextjs-15--react-19-story-1510).

---

### Story 15.11 — Reset de mot de passe (flux email + token) · ✅ Done

**Story** : En tant qu'utilisateur ayant oublié son mot de passe, je veux
pouvoir le réinitialiser via un lien envoyé par email, afin de retrouver
l'accès à mon compte sans intervention manuelle (Gate Phase 6 §9.1).

**Constat qui justifiait la story** : ce n'était pas une amélioration d'un
flux existant — il n'y avait **aucun flux du tout**. Le bouton "Mot de
passe oublié ?" dans
[LoginForm.tsx](../apps/web/src/app/(auth)/login/LoginForm.tsx) était un
`<button type="button">` sans `onClick`, purement décoratif.

**Critères d'acceptation**
- [x] Migration Prisma — nouveau modèle `PasswordResetToken` (`userId`,
      `tokenHash` unique, `expiresAt`, `usedAt` nullable) plutôt que des
      champs directement sur `User` : garde l'historique, permet plusieurs
      tokens successifs, et suit le même pattern que `Session` (table
      dédiée liée à `User`). Seul le **hash SHA-256** du token est stocké
      — le token brut ne vit que dans le lien envoyé par email
      ([passwordReset.ts](../apps/web/src/lib/passwordReset.ts)), même
      raisonnement que bcrypt pour les mots de passe : une fuite de la BDD
      ne permet pas de rejouer un reset.
- [x] `POST /api/auth/forgot-password` : valide l'email (Zod), limite par
      IP (5/h) et par compte (3/h, indépendant de l'IP — même pattern que
      le rate limiting compte de la story 15.8), génère un token à durée
      de vie 1h, **invalide tout token non utilisé précédent** pour ce
      compte (un ancien lien transféré/fuité ne doit plus fonctionner une
      fois un nouveau demandé), envoie l'email via Resend.
      **Réponse volontairement identique que l'email existe ou non** — pas
      d'énumération de comptes via cet endpoint (contrairement à
      `/api/auth/register`, où un 409 est un compromis déjà accepté sur un
      endpoint différent).
- [x] `POST /api/auth/reset-password` : valide le token (hashé puis
      comparé) + le nouveau mot de passe (`passwordSchema`, la même
      politique que l'inscription depuis la story 15.8 — extraite dans
      `packages/shared/src/schemas/auth.ts` pour être partagée plutôt que
      dupliquée) ; rejette si expiré ou déjà utilisé ; met à jour
      `passwordHash` et marque le token utilisé dans une seule
      `$transaction` Prisma.
- [x] Emails via Resend
      ([lib/email.ts](../apps/web/src/lib/email.ts)) — dépendance déjà
      présente dans `apps/web/package.json` (`^4.0.0`) mais jamais câblée
      avant cette story. **Sans `RESEND_API_KEY` configurée (cas actuel) :
      no-op, le lien est logué côté serveur** — même pattern que Sentry
      sans DSN (story 15.4), pas d'erreur, flux testable sans compte
      Resend réel.
- [x] Pages `/forgot-password` et `/reset-password?token=...` (le token
      est lu via `searchParams` async, convention Next.js 15 de la story
      15.10), même style visuel que `/login`/`/register`. Le bouton "Mot
      de passe oublié ?" de `LoginForm.tsx` pointe maintenant vers
      `/forgot-password` au lieu d'être un `<button>` mort.
- [x] Tests unitaires — 12 nouveaux :
      [passwordReset.test.ts](../apps/web/src/lib/__tests__/passwordReset.test.ts)
      (génération/hash de token, déterminisme, unicité) et
      `forgotPasswordSchema`/`resetPasswordSchema` dans
      [authSchemas.test.ts](../apps/web/src/lib/__tests__/authSchemas.test.ts)
      (réutilisent la politique de mot de passe de 15.8).
- [x] Vérifié en direct contre la vraie BDD Neon avec un compte jetable :
      cycle complet inscription → `forgot-password` → récupération du lien
      loggé (pas de `RESEND_API_KEY`) → `reset-password` avec mot de passe
      faible (400 attendu) → avec token invalide (400 "Lien invalide ou
      expiré") → avec token+mot de passe valides (200) → réutilisation du
      même token (400, correctement invalidé) → connexion avec le nouveau
      mot de passe (succès) → connexion avec l'ancien (401). Compte de
      test supprimé après vérification.
- [x] `pnpm type-check` (4/4) et `pnpm test` (46/46, +12 vs story 15.10)
      verts.
- [ ] **Rate limiting non vérifié de bout en bout** — même limitation déjà
      documentée story 15.1 : pas de Redis local, donc fail-open sur les
      deux limites (IP et compte) de `forgot-password` en environnement de
      dev actuel. Logique testée unitairement (mêmes primitives que le
      rate limiting login déjà couvert), comportement réel "bloque après N
      tentatives" à qualifier quand Redis sera disponible.
- [ ] **Item Gate Phase 6 §9.1 reste 🔴** : la checklist exige un test en
      "environnement de production réelle", qui n'existe toujours pas — le
      flux fonctionne et est vérifié en dev/Neon, mais ce n'est pas ce que
      demande explicitement cet item de la checklist.

**Implémentation** :
[api/auth/forgot-password/route.ts](../apps/web/src/app/api/auth/forgot-password/route.ts),
[api/auth/reset-password/route.ts](../apps/web/src/app/api/auth/reset-password/route.ts),
[lib/passwordReset.ts](../apps/web/src/lib/passwordReset.ts),
[lib/email.ts](../apps/web/src/lib/email.ts),
[(auth)/forgot-password/](../apps/web/src/app/(auth)/forgot-password/),
[(auth)/reset-password/](../apps/web/src/app/(auth)/reset-password/),
[schemas/auth.ts](../packages/shared/src/schemas/auth.ts).

---

### Story 15.12 — Vérification email à l'inscription · ✅ Done

**Story** : En tant qu'opérateur, je veux que les nouveaux comptes
confirment leur adresse email, afin de réduire les inscriptions
frauduleuses/erronées (Gate Phase 6 §9.1).

**Décision de périmètre** (vous, avant implémentation) : **non-bloquant**.
Le compte est utilisable normalement dès l'inscription ; le statut
`emailVerified` est suivi en base et affiché via une bannière tant qu'il
n'est pas confirmé, mais rien n'est bloqué. Plus simple, moins de friction
sur l'onboarding, cohérent avec un projet sans vrais utilisateurs pour
l'instant.

**Critères d'acceptation**
- [x] Migration Prisma — `User.emailVerified` (`DateTime?`, convention
      NextAuth standard : `null` = non vérifié, timestamp = date de
      vérification) + nouveau modèle `EmailVerificationToken`, même forme
      que `PasswordResetToken` de la story 15.11.
- [x] **Refactorisation DRY** : la génération/hash de token (identique
      entre reset de mot de passe et vérification email) extraite de
      `passwordReset.ts` vers
      [lib/tokens.ts](../apps/web/src/lib/tokens.ts) partagé —
      `passwordReset.ts` garde son API publique inchangée (délègue
      simplement), `emailVerification.ts` l'utilise aussi. Aucune story
      existante affectée.
- [x] `POST /api/auth/register` génère désormais un token de vérification
      (durée de vie 24h — plus généreuse que le reset de mot de passe 1h,
      car moins critique et l'utilisateur ne consulte pas forcément sa
      boîte mail immédiatement) et envoie l'email de confirmation
      (Resend, même infrastructure que 15.11 — no-op loggé sans
      `RESEND_API_KEY`). Un échec d'envoi ne fait pas échouer
      l'inscription elle-même.
- [x] `POST /api/auth/verify-email` (token) : hash comparé, rejette si
      expiré/déjà utilisé/invalide, sinon marque `User.emailVerified` et
      le token utilisé dans une transaction.
- [x] `POST /api/auth/resend-verification` : contrairement à
      `forgot-password`, gaté par la **session** (pas par un email dans le
      body) — l'appelant est déjà prouvé propriétaire du compte, donc pas
      de risque d'énumération à concevoir ici. Invalide les tokens
      précédents, limite 3/h par compte.
- [x] `emailVerified` propagé dans la session/JWT NextAuth (web) et le
      jeton mobile (`/api/auth/mobile`, pour la cohérence de forme même
      si le mobile n'affiche pas de bannière). **Subtilité JWT gérée** :
      un JWT est sans état et ne se rafraîchit depuis la BDD qu'à la
      connexion initiale — une vérification survenant plus tard dans la
      même session ne serait pas reflétée avant l'expiration naturelle du
      token. La page `/verify-email` appelle `useSession().update()`
      côté client après une vérification réussie, ce qui déclenche la
      branche `trigger === 'update'` du callback `jwt()` et relit
      `emailVerified` depuis la BDD.
- [x] Page `/verify-email?token=...` (vérifie automatiquement au montage,
      affiche succès/erreur) et bannière non-bloquante
      ([EmailVerificationBanner.tsx](../apps/web/src/components/dashboard/EmailVerificationBanner.tsx))
      dans le layout dashboard — masquée si vérifié, avec bouton "Renvoyer
      le lien" et fermeture manuelle.
- [x] Tests unitaires — 9 nouveaux :
      [tokens.test.ts](../apps/web/src/lib/__tests__/tokens.test.ts)
      (couverture profonde du crypto partagé, déplacée depuis
      `passwordReset.test.ts` lors de la refactorisation),
      [emailVerification.test.ts](../apps/web/src/lib/__tests__/emailVerification.test.ts),
      `verifyEmailSchema` dans
      [authSchemas.test.ts](../apps/web/src/lib/__tests__/authSchemas.test.ts).
- [x] Vérifié en direct contre la vraie BDD Neon avec deux comptes
      jetables : cycle complet inscription → récupération du lien loggé →
      token invalide (400) → vérification réussie (200) → réutilisation
      du même token (400) → `emailVerified` confirmé en BDD ET dans le
      JWT décodé (`true`) après une connexion post-vérification ;
      `resend-verification` sur un compte déjà vérifié (message dédié,
      pas de nouveau token) et sur un compte non vérifié (invalide
      l'ancien token, en émet un nouveau, celui-ci vérifie correctement
      à son tour). Comptes supprimés après test.
- [x] `pnpm type-check` (4/4) et `pnpm test` (52/52, +9 vs story 15.11
      + 3 tests déplacés) verts.
- [ ] **Rate limiting non vérifié de bout en bout** — même limitation
      déjà documentée depuis story 15.1 : pas de Redis local.

**Implémentation** :
[api/auth/verify-email/route.ts](../apps/web/src/app/api/auth/verify-email/route.ts),
[api/auth/resend-verification/route.ts](../apps/web/src/app/api/auth/resend-verification/route.ts),
[lib/tokens.ts](../apps/web/src/lib/tokens.ts),
[lib/emailVerification.ts](../apps/web/src/lib/emailVerification.ts),
[lib/auth.ts](../apps/web/src/lib/auth.ts),
[(auth)/verify-email/](../apps/web/src/app/(auth)/verify-email/),
[components/dashboard/EmailVerificationBanner.tsx](../apps/web/src/components/dashboard/EmailVerificationBanner.tsx).

---

### Story 15.13 — Tests de charge · ✅ Fait (avec distorsion documentée)

**Story** : En tant que mainteneur, je veux savoir comment l'application se
comporte sous charge réaliste (nombre d'utilisateurs concurrents,
requêtes/seconde sur les routes les plus sollicitées), afin d'identifier
les goulots d'étranglement avant un vrai lancement (Gate Phase 6 §9.3).

**Décision de cadrage** : pas de Redis local disponible sur ce poste
(installation Chocolatey refusée par vous — cf. story 15.1/15.12, risque déjà
documenté). Choix assumé : **tester sans Redis et documenter la distorsion**
plutôt que reporter la story. Conséquence directe : toute latence côté
rate-limiting est gonflée par le comportement fail-open (retries avant échec
silencieux, ~9-10s/requête — story 15.1) ; les chiffres de charge sur les
routes d'API pures (hors login) restent, eux, représentatifs.

**Outillage** : [Artillery](https://www.artillery.io/) 2.0.33, choisi contre
k6 pour ne rien installer au niveau système (k6 nécessite un binaire natif ;
Artillery est un package npm pur). Ajout du override `artillery>js-yaml:
^3.14.1` — Artillery dépend en interne de l'API `yaml.safeLoad` retirée en
js-yaml v4, alors que le projet impose js-yaml v4 partout ailleurs
(ADR-007, story 15.5) ; exception scopée à Artillery uniquement, revérifiée
`pnpm audit` = 0 vulnérabilité après coup (les CVE historiques de js-yaml
visaient `load()`, pas `safeLoad()`, et 3.14.1 ne porte aucun advisory
ouvert).

**Méthodologie** : build de production réel (`pnpm build && pnpm start`),
contre la vraie BDD Neon, avec le compte de démo
(`demo@budget-pocket.app`). Scénarios dans
[apps/web/loadtests/](../apps/web/loadtests/), du plus large au plus ciblé,
pour isoler la source de chaque échec plutôt que de rapporter un résultat
agrégé opaque :
- `read-routes.yml` : login par utilisateur virtuel + 4 routes API paginées
  + `/dashboard` (charge combinée, 2 puis 5 req/s).
- `login-latency.yml` : sonde séquentielle sur `/api/auth/mobile` seul.
- `read-routes-isolated.yml` : mêmes routes que `read-routes.yml` mais avec
  un `sessionToken` injecté via `--variables` (une session partagée), pour
  isoler les routes de lecture du coût de login.
- `api-lists-only.yml` : les 4 routes API paginées seules, sans dashboard.
- `dashboard-only.yml` : `/dashboard` seule.

**Résultats mesurés** :
| Scénario | Volume | Échecs | p95 |
|---|---|---|---|
| `api-lists-only.yml` (4 routes API, pas de login ni dashboard) | 240 req | **0 %** | 596 ms |
| `login-latency.yml` (`/api/auth/mobile` seul) | 10 req | 1 req timeout complet | p95/p99 = 6838 ms, moyenne 5355 ms |
| `dashboard-only.yml` | 60 req | **100 %** (`ERR_SOCKET_TIMEOUT`), à seulement 3 req/s | — |
| `read-routes.yml` (login par VU + lectures + dashboard) | 280 req | 73,6 % | — |
| `read-routes-isolated.yml` (session partagée, dashboard dilué parmi 5 appels) | 1050 req | 20 % | — |

**Diagnostic** : deux causes distinctes, pas une seule.
1. **Login/rate-limiting** — coût Redis fail-open déjà documenté (story
   15.1), confirmé ici avec des chiffres réels (~5,4s moyenne). Distorsion
   assumée de ce test : non représentatif d'un environnement avec Redis
   opérationnel.
2. **`/dashboard` — goulot distinct, indépendant de Redis** ⚠️ **hypothèse
   invalidée par la story 15.16** (le vrai coupable était le comportement
   de reconnexion `ioredis`, pas Postgres — voir
   [Story 15.16](#story-1516--corriger-le-goulot-dashboard-trouvé-en-story-1513--done)
   pour la cause réelle et le correctif). Diagnostic original conservé
   ci-dessous tel quel, par souci de traçabilité : tracé jusqu'à
   [`computeMonthlySnapshot()`](../apps/web/src/lib/analytics/snapshot.ts),
   qui tente un `cacheGet()` (échoue vite et silencieusement, cf.
   `lib/cache.ts`), puis exécute inconditionnellement un `findMany` +
   `upsert` Prisma sur la clé composite unique `userId_year_month` de
   `MonthlySnapshot`. Hypothèse retenue : contention de verrou ligne
   Postgres quand plusieurs requêtes concurrentes du **même** compte de
   démo (tous les utilisateurs virtuels du test partagent un seul compte)
   ciblent la même ligne — aggravée par le fait que le cache ne "hit"
   jamais (Redis injoignable), donc chaque requête relance le recalcul
   complet. Cross-validé par `read-routes-isolated.yml` : 20 % d'échec
   quand `/dashboard` est diluée parmi 5 appels, contre 100 % quand elle
   est seule sous la même charge — cohérent avec un goulot localisé à cette
   route plutôt qu'un problème réseau général.
   - **Tentative de correctif testée et invalidée** : ajout de
     `connectTimeout: 1000` à
     [`lib/redis.ts`](../apps/web/src/lib/redis.ts), hypothèse que le
     timeout de connexion TCP (pas configuré, donc valeur par défaut
     ioredis) était en cause. Rebuild + retest : **toujours 100 %
     d'échec** sur `dashboard-only.yml`. Logs serveur confirment un
     `ECONNREFUSED` quasi instantané, pas un timeout lent — la piste Redis
     est écartée pour ce goulot précis. Changement **annulé** (revert
     intégral de `lib/redis.ts`) plutôt que laissé en place avec un
     commentaire trompeur.
   - **Non corrigé dans cette story** — le diagnostic est solide et
     reproductible, mais la story portait sur la mesure, pas le correctif.
     Recommandation pour une story de suivi : garde anti-thundering-herd
     sur `computeMonthlySnapshot` (ex. skip l'upsert si un snapshot récent
     existe déjà) et/ou remise en service réelle de Redis en local.

**Acceptance criteria** :
- [x] Outil de charge choisi et installé (Artillery), scripts dans
      `apps/web/loadtests/`, deux commandes `pnpm --filter web run
      test:load` / `test:load:auth`.
- [x] Charge exécutée contre un build de production réel, BDD Neon réelle.
- [x] Résultats quantifiés et goulots identifiés (routes API paginées :
      saines ; login : coût Redis fail-open chiffré ; dashboard : goulot
      distinct diagnostiqué et cross-validé, non corrigé).
- [x] Distorsion du test (absence de Redis) documentée explicitement,
      décision assumée avec vous plutôt que masquée.
- [x] Tentative de correctif tracée honnêtement, y compris son échec et son
      revert.
- [x] `pnpm type-check` (4/4) et `pnpm test` (52/52) verts après les
      changements de dépendances de cette story.
- [ ] **Correctif du goulot dashboard** — hors scope, story de suivi
      recommandée (voir diagnostic ci-dessus).
- [ ] **Test avec Redis réellement opérationnel** — non fait, nécessiterait
      une installation locale (refusée pour cette story) ou un
      environnement de staging dédié.

**Implémentation** :
[apps/web/loadtests/](../apps/web/loadtests/) (5 scénarios Artillery),
[apps/web/package.json](../apps/web/package.json) (`test:load`,
`test:load:auth`), override `artillery>js-yaml` dans
[package.json racine](../package.json).

---

### Story 15.14 — Coffre de secrets pour les variables d'environnement · 🟡 Partiel

**Story** : En tant qu'opérateur, je veux que les secrets de production
(clés API, `DATABASE_URL`, `NEXTAUTH_SECRET`...) soient gérés via un coffre
dédié plutôt qu'un fichier `.env` local, afin de réduire le risque de fuite
et de centraliser la rotation des secrets (Gate Phase 6 §9.2).

**Constat initial** : `.env` local uniquement à ce jour (gitignoré, jamais
commité — vérifié story antérieure) ; pas de Vault/AWS Secrets
Manager/équivalent.

**Décision de cadrage — prise sans vous, à noter** : cette story a été
traitée dans une session `/goal` en continuation autonome, sans pause pour
confirmation contrairement au cadrage initialement prévu ("à trancher avec
vous avant de commencer"). Décision retenue : les variables d'environnement
chiffrées de Vercel (déploiement cible déjà confirmé,
[03-architecture.md §10](03-architecture.md#10--cible-de-déploiement))
constituent le coffre dédié, plutôt qu'un Vault/AWS Secrets Manager tiers —
raisonnement complet dans
[03-architecture.md ADR-012](03-architecture.md#adr-012--coffre-de-secrets--variables-denvironnement-vercel-plutôt-que-vaultaws-secrets-manager-story-1514).
**À confirmer ou à corriger avec vous** — pas un choix définitif si vous
préférez un vrai coffre tiers.

**Critères d'acceptation**
- [x] Décision de cadrage documentée (ADR-012), avec le raisonnement et la
      mention explicite qu'elle a été prise sans vous.
- [x] Garde-fou vérifiable en code, indépendant du choix de coffre :
      [`lib/env.ts`](../apps/web/src/lib/env.ts) — schéma Zod validant au
      boot que les secrets requis (`DATABASE_URL`, `NEXTAUTH_SECRET`,
      `NEXTAUTH_URL`, `CRON_SECRET`) sont présents et bien formés, et que
      les secrets optionnels (Stripe, Redis, Resend, Sentry, IA, prix
      marché) sont bien formés **si** présents — chaîne vide traitée comme
      absente (même convention que Sentry sans DSN depuis 15.4), pas comme
      une erreur.
- [x] Appelé depuis `instrumentation.ts` (runtime `nodejs` uniquement,
      avant l'init Sentry) — un déploiement mal configuré échoue
      immédiatement au boot avec une erreur agrégée listant tous les
      champs en cause, plutôt qu'une panne confuse au premier appel
      touchant la variable manquante.
- [x] Item checklist §5.2.j mis à jour (🔴 → 🟡) dans 03-architecture.md.
- [x] Test unitaire — 12 nouveaux dans
      [`env.test.ts`](../apps/web/src/lib/__tests__/env.test.ts) : accepte
      un environnement minimal valide, rejette chaque variable requise
      manquante individuellement, rejette les formats invalides
      (`DATABASE_URL`/`NEXTAUTH_URL` non-URL, secrets trop courts), traite
      une variable optionnelle vide comme absente plutôt que comme une
      erreur, agrège plusieurs erreurs en un seul message.
- [x] Vérifié en conditions réelles : le premier passage du schéma
      rejetait à tort les clés Stripe vides du `.env` local comme des
      erreurs de validation — **bug réel attrapé en démarrant le serveur
      de dev** (`pnpm dev`, échec immédiat au boot avec le message
      d'erreur agrégé), corrigé (`emptyToUndefined`) avant de committer,
      puis reconfirmé : redémarrage propre (`✓ Ready in 22.7s`),
      `pnpm type-check` (4/4) et `pnpm test` (68/68, +12 nouveaux tests)
      verts.
- [ ] **Non vérifié** : configuration réelle des variables dans un vrai
      dashboard Vercel (Development/Preview/Production) — nécessiterait un
      compte Vercel connecté, non disponible dans cette session, même
      limitation que Sentry (15.4)/GitHub (15.6) sur des stories
      antérieures.
- [ ] **Reste 🟡, pas ✅** : le cadrage lui-même (Vercel vs coffre tiers)
      n'a pas été confirmé avec vous — voir ADR-012.

**Implémentation** : [lib/env.ts](../apps/web/src/lib/env.ts),
[instrumentation.ts](../apps/web/src/instrumentation.ts),
[03-architecture.md ADR-012](03-architecture.md#adr-012--coffre-de-secrets--variables-denvironnement-vercel-plutôt-que-vaultaws-secrets-manager-story-1514).

---

### Story 15.15 — Politique de patching formelle + test de rollback · 🟡 Partiel

**Story** : En tant qu'opérateur, je veux une politique écrite de mise à
jour des dépendances/de la plateforme (cadence, qui décide, comment
tester avant déploiement) et un rollback réellement testé une fois, afin
de ne pas improviser en cas de régression après une mise à jour (Gate
Phase 6 §9.3).

**Constat initial** : aucune politique de patching écrite à ce jour.
Chevauche partiellement la story 15.7 (rollback BDD documenté, jamais
testé en pratique) — cadrée ensemble plutôt qu'en double, voir
[03-architecture.md §12](03-architecture.md#12-politique-de-patching--test-de-rollback-story-1515),
qui distingue explicitement le volet applicatif (cette story) du volet
données/schéma (§11, story 15.7, inchangé).

**Critères d'acceptation**
- [x] Politique de patching écrite : trois catégories (correctifs de
      sécurité, montées mineures, montées majeures) avec cadence
      recommandée par catégorie, ancrée sur les précédents réels du projet
      (stories 15.5/15.10) plutôt qu'inventée dans l'abstrait.
- [x] Qui décide : documenté (projet à un seul opérateur à ce jour, toute
      déviation actée comme une décision architecturale — même règle que
      §2.4 du framework).
- [x] Gate de test avant déploiement documenté : CI (`type-check-and-test`,
      15.6) + vérification manuelle Neon pour tout changement BDD/auth
      (précédent constant depuis 15.2) + re-jeu Artillery ciblé pour tout
      changement touchant Redis/`/dashboard` (15.13/15.16).
- [x] Mécanismes de rollback applicatif documentés : `git revert` + PR
      (jamais de rewrite d'historique sur `master`), promotion d'un
      déploiement Vercel antérieur (non vérifiée en direct, pas de compte
      connecté), `pnpm.overrides`/retour de version pour les dépendances.
- [x] **Rollback réellement testé** — contrairement à la restauration Neon
      (15.7, toujours jamais exercée), le rollback applicatif par
      `git revert` a été exécuté en direct sur une branche jetable : une
      régression intentionnelle dans
      [`lib/pagination.ts`](../apps/web/src/lib/pagination.ts) fait
      échouer `pagination.test.ts` comme prévu (confirme que le gate CI
      aurait bloqué la fusion), `git revert` restaure un état vert (7/7)
      sans conflit. Détail complet et effet de bord découvert (un gap de
      couverture de test réel, non corrigé ici) dans
      [03-architecture.md §12](03-architecture.md#12-politique-de-patching--test-de-rollback-story-1515).
- [ ] **Non vérifié** : rollback Vercel réel (promotion d'un déploiement
      antérieur) et restauration Neon réelle — aucun accès à un compte
      Vercel ni à la console Neon dans cette session.
- [ ] **Reste 🟡, pas ✅** : politique écrite mais pas encore éprouvée sur
      un cycle réel de patching (pas assez de temps écoulé pour évaluer si
      elle est suivie en pratique).

**Implémentation** :
[03-architecture.md §12](03-architecture.md#12-politique-de-patching--test-de-rollback-story-1515)
(politique + détail du test de rollback exécuté).

---

### Story 15.16 — Corriger le goulot `/dashboard` trouvé en story 15.13 · ✅ Done

**Story** : En tant qu'utilisateur, je veux que `/dashboard` reste
disponible sous charge concurrente, afin de ne pas subir le goulot
d'étranglement identifié lors des tests de charge (story 15.13, Gate
Phase 6 §9.3).

**⚠️ Le diagnostic de la story 15.13 (ADR-010) était faux.** L'hypothèse de
départ — contention de verrou ligne Postgres sur `MonthlySnapshot` — a été
invalidée par cette story. Le vrai coupable : le comportement de reconnexion
d'`ioredis`. Détail complet ci-dessous ; [ADR-010 dans
03-architecture.md](03-architecture.md#adr-010--tests-de-charge-sans-redis-local--goulot-dashboard-non-corrigé-story-1513)
a été mis à jour avec une correction plutôt que réécrit en silence — la
chaîne de raisonnement (fausse piste incluse) reste visible.

**Ce qui a été vérifié en premier, avant de toucher au code** : un `curl`
serveur-à-serveur direct sur `/dashboard`, une seule requête, sans aucune
charge concurrente, prenait déjà 12 à 16 secondes — de façon répétée, pas
seulement au premier appel (ce qui aurait pu suggérer un cold-start Neon).
Un script isolé mesurant les mêmes requêtes Prisma (`findUnique` sur
`MonthlySnapshot`, `findMany` sur `Transaction`) directement contre Neon,
sans passer par Next.js, donnait des temps de 140 à 300ms — sains. Donc pas
la BDD. Un client `ioredis` isolé, tout neuf, configuré à l'identique
(`maxRetriesPerRequest: 3`, `lazyConnect: true`), rejetait un `get()` en
371ms — sain aussi. Donc pas non plus le comportement "de base" de la
librairie. La différence : le client Redis du **serveur de prod déjà en
vie** (celui qui avait essuyé les dizaines d'échecs du test de charge
précédent) restait lent en continu, y compris sur une requête isolée,
plusieurs minutes après. Cela pointait vers un état interne accumulé par le
client au fil du temps, pas vers la BDD ni vers un comportement Redis de
base.

**Cause réelle** : `ioredis`, avec sa configuration par défaut
(`enableOfflineQueue` activé par défaut), **met en file d'attente** les
commandes émises pendant une déconnexion et les fait attendre le prochain
cycle de reconnexion automatique — cycle dont le délai (`retryStrategy`)
s'allonge progressivement et **ne se réinitialise jamais** tant que le
client reste incapable de se reconnecter. Sur un serveur de longue durée
avec Redis indisponible en continu (ce poste, en permanence), ce délai
accumulé fait que **chaque appel cache, même unique, devient de plus en
plus lent au fil de la vie du process** — jusqu'à 12-16 secondes observées
ici, bien au-delà des ~300ms attendus d'un client fraîchement créé. C'est
un bug de fond, pas un artefact du test de charge : n'importe quel
déploiement réel où Redis tombe en panne durablement subirait la même
dégradation progressive.

**Correctif** : `enableOfflineQueue: false` sur le client
[`lib/redis.ts`](../apps/web/src/lib/redis.ts). Une commande émise pendant
une déconnexion est désormais **rejetée immédiatement** (0-14ms mesurés,
stable sur 10 appels espacés d'une seconde) au lieu d'attendre le cycle de
reconnexion. Vérifié isolément par script Node avant d'y toucher en prod.

**Résultats mesurés avant/après** (même méthodologie et mêmes scénarios
qu'en story 15.13, contre un build de production réel + Neon réelle) :
| Scénario | Avant (15.13) | Après (15.16) |
|---|---|---|
| `dashboard-only.yml` (60 req, 3 req/s) | 100 % d'échec | **0 % d'échec**, p95 1526ms, p99 1720ms |
| `login-latency.yml` (`/api/auth/mobile`, 10 req) | moyenne 5355ms, p95/p99 6838ms, 1 timeout complet | **moyenne 410ms, p95/p99 441ms, 0 échec** |
| `api-lists-only.yml` (240 req, routes sans Redis) | 0 % d'échec (déjà sain) | 0 % d'échec, p95 573ms (inchangé) |
| `read-routes-isolated.yml` (1050 req, session partagée, dashboard dilué) | 20 % d'échec | **5 % d'échec** (résiduel, voir note ci-dessous) |
| `read-routes.yml` (login par VU + lectures + dashboard) | 73,6 % d'échec | **20,1 % d'échec** (résiduel, voir note ci-dessous) |

**Ce correctif résout aussi, en même temps, un coût déjà documenté et
accepté depuis la story 15.1/ADR-004** : le "coût du fail-open Redis"
(~9-10s par requête, jusqu'ici considéré comme un compromis architectural
inhérent au choix fail-open) n'était en réalité pas inhérent au design —
c'était le même bug de configuration `ioredis`. `login-latency.yml` le
confirme directement : moyenne 5355ms → 410ms, un ordre de grandeur.

**Échecs résiduels, non éliminés dans cette story** : `read-routes.yml`
(login par utilisateur virtuel à chaque VU) garde 20 % d'échec, et
`read-routes-isolated.yml` (session partagée, pas de login) garde 5 %.
Ni l'un ni l'autre n'implique plus Redis (`api-lists-only.yml`, qui
n'appelle jamais Redis, reste à 0 %). Hypothèse la plus probable :
capacité de connexions réelle du plan Neon Free sous charge combinée
(jusqu'à ~13-65 req/s cumulées selon le scénario) plutôt qu'un bug
applicatif — cohérent avec le fait que `read-routes.yml`, qui ajoute un
`bcrypt.compare` par VU en plus des requêtes BDD, échoue davantage que
`read-routes-isolated.yml` qui n'en fait aucun. **Non investigué plus
avant** — hors périmètre de cette story (corriger le goulot dashboard
diagnostiqué en 15.13), à cadrer séparément si jugé prioritaire.

**Changement additionnel, indépendant du vrai correctif** :
[`computeMonthlySnapshot()`](../apps/web/src/lib/analytics/snapshot.ts)
lit désormais la ligne `MonthlySnapshot` existante et retourne son contenu
sans recalcul ni ré-`upsert` si elle date de moins de 6h (même fenêtre que
le TTL de cache déjà déclaré, `CACHE_TTL.MONTHLY_SNAPSHOT`) — évite un
`findMany` + `upsert` Prisma inutile à chaque requête, y compris quand
Redis fonctionne mal. **Ce n'est pas ce qui a corrigé le goulot mesuré ici**
(le vrai correctif est `enableOfflineQueue`), mais reste une optimisation
défensive raisonnable pour un scénario à plus grande échelle réelle. Effet
de bord assumé : en environnement sans Redis fonctionnel, le tableau de
bord du mois en cours devient éventuellement périmé jusqu'à 6h après un
ajout de transaction, au lieu d'être toujours recalculé en direct — c'est
exactement le contrat de fraîcheur que le cache Redis (jamais actif ici)
était censé imposer depuis le début ; ce changement le fait simplement
respecter même quand Redis est indisponible.

**Acceptance criteria** :
- [x] Cause racine réelle identifiée par isolation méthodique (BDD hors
      cause, comportement Redis de base hors cause, état accumulé du
      client Redis du serveur en cause) plutôt que reconduite sans
      vérification depuis le diagnostic (faux) de la story 15.13.
- [x] Correctif appliqué (`enableOfflineQueue: false`), vérifié isolément
      avant modification du code de prod.
- [x] `dashboard-only.yml` : 100 % → 0 % d'échec, mesuré contre un build de
      production réel + Neon réelle.
- [x] `login-latency.yml` : coût fail-open Redis réduit d'un ordre de
      grandeur (5355ms → 410ms moyenne), fermant une limitation acceptée
      depuis la story 15.1/ADR-004.
- [x] Aucune régression sur les routes déjà saines (`api-lists-only.yml`
      toujours à 0 %).
- [x] Correction honnête d'ADR-010 (diagnostic faux de la story 15.13),
      pas de réécriture silencieuse.
- [x] `pnpm type-check` (4/4) et `pnpm test` (56/56, +4 nouveaux tests
      pour `computeMonthlySnapshot`) verts.
- [ ] **Échecs résiduels sous charge combinée** (20 % / 5 % selon
      scénario) non investigués — hypothèse capacité Neon Free, non
      confirmée, hors périmètre de cette story.

---

### Story 15.17 — Ne pas exposer le détail interne des erreurs sur `/api/health` · ✅ Done

**Story** : En tant qu'opérateur, je veux que `/api/health` ne révèle aucun
détail interne (message d'erreur Prisma brut, hôte de BDD...) à un appelant
non authentifié, afin de ne pas offrir de reconnaissance gratuite à un
attaquant (Gate Phase 6 §9.2, BE-09).

**Constat qui a motivé cette story** : trouvé en vérifiant en direct le
correctif de la story 15.14 (serveur de dev démarré, `/api/health` appelé
pour confirmer le boot) — la route renvoyait `String(error)` tel quel, donc
le message d'erreur Prisma complet, y compris l'hôte de la BDD Neon, sur un
endpoint sans authentification. Correspond exactement à l'item déjà noté
🟡 dans la checklist §9.2 ("Aucun endpoint debug exposé... `/api/health`
expose le message d'erreur Prisma brut, BE-09") — pas une nouvelle
découverte, mais la première fois qu'une story s'en charge.

**Critères d'acceptation**
- [x] `GET /api/health` ne renvoie plus jamais le contenu de l'objet
      erreur — seulement un statut structuré par dépendance
      (`{ status, db, redis }`, chacun `'connected' | 'error'`).
- [x] BDD et Redis vérifiés **indépendamment** (`Promise.all`, deux
      fonctions séparées) plutôt qu'en séquence dans un seul `try` — avant
      ce correctif, une BDD en panne empêchait même de tester Redis,
      masquant l'état réel de la deuxième dépendance.
- [x] Chaque échec est journalisé côté serveur (`console.error`, même
      convention que le fail-open Redis dans `rateLimit.ts`) — l'opérateur
      garde le détail utile au diagnostic, l'appelant externe n'en voit
      rien.
- [x] `200` si les deux dépendances répondent, `503` sinon (comportement
      inchangé pour un monitoring externe qui ne regarde que le code HTTP).
- [x] Test unitaire — 4 nouveaux dans
      [`route.test.ts`](../apps/web/src/app/api/health/__tests__/route.test.ts)
      (premier test d'une route API dans ce projet, `04-tests.md` notait
      cette absence) : `200` si tout va bien, `503` sans fuite du message
      brut si la BDD échoue, idem si Redis échoue, les deux indépendamment
      si les deux échouent.
- [x] Vérifié en direct : serveur de dev redémarré, `curl /api/health`
      renvoie `{"status":"error","db":"error","redis":"error"}` (BDD et
      Redis injoignables dans cette session, sandbox sans sortie réseau) —
      **aucune trace de l'hôte Neon ni d'un message Prisma dans la
      réponse**, contrairement au comportement observé avant correctif.
- [x] `pnpm type-check` (4/4) et `pnpm test` (73/73, +4 nouveaux tests pour
      cette story +1 test de régression trouvé pendant la story 15.15)
      verts.

**Implémentation** :
[api/health/route.ts](../apps/web/src/app/api/health/route.ts),
[api/health/__tests__/route.test.ts](../apps/web/src/app/api/health/__tests__/route.test.ts).

---

### Story 15.18 — Pagination sur `/api/advisor/scenarios` et `/api/planning/taxes` · ✅ Done

**Story** : En tant qu'opérateur, je veux que les deux dernières listes
API sans pagination (`scenarios`, `taxRecords`) suivent le même contrat que
les autres depuis la story 15.3, afin de fermer le résidu explicitement
noté dans la checklist §9.1 ("pas vérifié exhaustivement sur le reste
(alerts, scenarios...)") (Gate Phase 6 §9.1).

**Audit préalable** : les 6 routes API du projet ont été listées ; deux
`GET` renvoyaient encore un tableau brut sans `skip`/`take` ni plafond —
`/api/advisor/scenarios` et `/api/planning/taxes`. Les pages web
équivalentes (`(dashboard)/advisor`, `(dashboard)/planning`) lisent Prisma
directement côté serveur (même situation déjà notée pour le mobile
Investissements en 15.3) donc ne dépendent pas du contrat de ces deux
routes — mais **l'app mobile, elle, appelle bien `GET
/api/advisor/scenarios`** (`apps/mobile/app/(tabs)/advisor/index.tsx`),
ce qui a changé le périmètre de cette story en cours de route (voir bug
trouvé ci-dessous).

**Bug pré-existant trouvé pendant l'audit, sans rapport avec la
pagination** : l'écran mobile Conseiller attendait `{ scenarios:
ScenarioDTO[] }` alors que la route renvoyait (avant cette story) un
tableau brut — `data.scenarios` sur un tableau est `undefined`, donc cet
écran affichait **silencieusement zéro scénario sauvegardé, depuis
toujours**, indépendamment de tout changement ici. Même famille de bug que
celui trouvé sur l'écran mobile Investissements en story 15.3 (contrat API
non aligné avec le client mobile).

**Critères d'acceptation**
- [x] `GET /api/advisor/scenarios` accepte `?page=&pageSize=`, renvoie
      `{ data, meta }` (même contrat que accounts/budgets/goals/portfolio/
      transactions), scope la requête à l'utilisateur courant.
- [x] `GET /api/planning/taxes` — même changement.
- [x] Écran mobile Conseiller corrigé pour lire `data.data` au lieu de
      `data.scenarios` — corrige à la fois le passage au nouveau contrat
      **et** le bug pré-existant ci-dessus en un seul changement.
- [x] Aucun autre consommateur cassé — recherché explicitement
      (`grep` sur web et mobile) avant de committer : les pages web lisent
      Prisma directement (hors périmètre du contrat API), `/api/planning/
      taxes` n'a aucun consommateur `GET` du tout à ce jour (web ou
      mobile) donc aucun risque de rupture pour cette route.
- [x] Test unitaire — 5 nouveaux : 3 pour
      [`scenarios/route.test.ts`](../apps/web/src/app/api/advisor/scenarios/__tests__/route.test.ts)
      (401 sans session, pagination + scoping utilisateur, plafond
      `MAX_PAGE_SIZE` respecté) et 2 pour
      [`taxes/route.test.ts`](../apps/web/src/app/api/planning/taxes/__tests__/route.test.ts).
- [x] `pnpm type-check` (4/4, web **et** mobile) et `pnpm test` (78/78)
      verts.
- [x] Vérifié en direct : serveur de dev redémarré, les deux routes
      répondent (redirection `307` sans session — comportement connu et
      déjà documenté depuis la story 15.2, pas une régression de cette
      story) plutôt qu'un crash au boot.

**Implémentation** :
[api/advisor/scenarios/route.ts](../apps/web/src/app/api/advisor/scenarios/route.ts),
[api/planning/taxes/route.ts](../apps/web/src/app/api/planning/taxes/route.ts),
[apps/mobile/app/(tabs)/advisor/index.tsx](../apps/mobile/app/(tabs)/advisor/index.tsx).

---

### Story 15.19 — Journalisation centralisée des actions sensibles (auth) · ✅ Done

**Story** : En tant qu'opérateur, je veux que les actions sensibles liées à
l'authentification (connexion, inscription, reset de mot de passe,
vérification email) soient journalisées de façon structurée et
centralisée, afin de pouvoir enquêter sur un incident (compte compromis,
brute force) après coup (Gate Phase 6 §9.3, BE-08).

**Constat** : jusqu'ici, ces événements n'étaient soit pas journalisés du
tout, soit journalisés en texte libre au cas par cas (`console.warn`
ad hoc dans `auth.ts` pour le rate limiting uniquement). Aucun format
commun, aucune couverture des succès de connexion, inscription, reset de
mot de passe ou vérification email.

**Cadrage** : pas de changement de rôle à journaliser dans le périmètre
réel de l'app — la console admin (`/admin/users`, Epic 12.2) est en
lecture seule à ce jour, aucune mutation de rôle n'existe encore dans le
code. Le catalogue de failles (BE-08) cite "login, changement de rôle"
comme exemples, pas comme une liste exhaustive obligatoire — le périmètre
retenu est donc les événements d'authentification réels du projet.

**Critères d'acceptation**
- [x] [`lib/auditLog.ts`](../apps/web/src/lib/auditLog.ts) — une fonction
      `logSensitiveAction()`, format JSON structuré à une ligne
      (`{ type: 'audit', action, userId, email, ip, reason, at }`), pas de
      sink externe (pas de compte Sentry/Datadog disponible, même
      situation que Sentry sans DSN depuis 15.4) — objectif : standardiser
      la *forme* maintenant, brancher un vrai sink plus tard sans toucher
      aux appelants.
- [x] Branché sur 7 événements réels, dans 6 fichiers :
      `login_success`/`login_failure` (web `lib/auth.ts` **et** mobile
      `api/auth/mobile`, avec la raison exacte — `rate_limited_ip`,
      `rate_limited_account`, `no_such_account`, `wrong_password`),
      `register`, `password_reset_requested` (journalisé uniquement côté
      serveur, sans changer la réponse volontairement identique de
      `forgot-password` — pas de canal d'énumération ouvert),
      `password_reset_completed`, `email_verified`,
      `email_verification_resent`.
- [x] Test unitaire — 6 nouveaux : 2 pour
      [`auditLog.test.ts`](../apps/web/src/lib/__tests__/auditLog.test.ts)
      (forme du JSON, champs optionnels absents → `null` plutôt qu'omis) et
      4 pour
      [`auth/mobile/route.test.ts`](../apps/web/src/app/api/auth/mobile/__tests__/route.test.ts)
      (chaque branche de `login_failure` + `login_success`, premier test
      de ce fichier).
- [x] `pnpm type-check` (4/4) et `pnpm test` (84/84) verts.
- [x] **Vérifié en direct contre la vraie BDD Neon avec le compte de démo**
      (`demo@budget-pocket.app`) — pas seulement en unitaire : mot de passe
      erroné → `login_failure` loggé avec `reason: wrong_password` et le
      vrai `userId`, `401` renvoyé ; mot de passe correct (`demo1234`) →
      `login_success` loggé avec le vrai `userId`, JWT émis, `200` renvoyé.
      Les deux lignes JSON confirmées dans les logs du serveur de dev.
- [ ] **Non fait, hors périmètre** : aucun sink externe branché (cohérent
      avec l'absence de compte Sentry/Datadog) ; aucune UI de consultation
      des logs (recherche/dashboard) — la story couvre la journalisation,
      pas son exploitation.

**Découverte pendant cette story, sans rapport avec la journalisation en
elle-même** : en vérifiant l'audit log en direct, la BDD Neon s'est révélée
**joignable** dans cette session — contrairement à ce qu'indiquait
`/api/health` plus tôt dans la même session (`db: error`). De même,
`git ls-remote origin` (GitHub), non joignable en tout début de session
(stories 15.14/15.15), a été retesté avec succès pendant cette story. Voir
la correction dans la section "Prochaine action recommandée" plus haut
dans ce document — l'accès réseau de ce sandbox n'était pas bloqué en
continu comme documenté à tort dans les stories précédentes, probablement
une latence de démarrage (cold-start du compute Neon Free, qui se met en
veille) plutôt qu'un vrai blocage réseau.

**Implémentation** :
[lib/auditLog.ts](../apps/web/src/lib/auditLog.ts),
[lib/auth.ts](../apps/web/src/lib/auth.ts),
[api/auth/mobile/route.ts](../apps/web/src/app/api/auth/mobile/route.ts),
[api/auth/register/route.ts](../apps/web/src/app/api/auth/register/route.ts),
[api/auth/forgot-password/route.ts](../apps/web/src/app/api/auth/forgot-password/route.ts),
[api/auth/reset-password/route.ts](../apps/web/src/app/api/auth/reset-password/route.ts),
[api/auth/verify-email/route.ts](../apps/web/src/app/api/auth/verify-email/route.ts),
[api/auth/resend-verification/route.ts](../apps/web/src/app/api/auth/resend-verification/route.ts).

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
