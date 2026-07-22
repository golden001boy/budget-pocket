# 05 — Status

**Commande BMAD** : `bmad status`
**Dernière mise à jour** : 2026-07-22 (story 15.5 — scan SCA + remédiation,
✅ complet ; story 15.10 créée pour le résidu Next.js)

## Vue d'ensemble des phases

| Phase | Livrable | Statut |
|---|---|---|
| 1. Discovery | [01-brainstorming.md](01-brainstorming.md) | ✅ |
| 2. PRD | [02-prd.md](02-prd.md) | ✅ |
| 3. Architecture | [03-architecture.md](03-architecture.md) | ✅ |
| 4. Développement | Epics 1–14 | ✅ · Epic 15 | 🟡 5/10 |
| 5. QA & Tests | [04-tests.md](04-tests.md) | ✅ (audit) · suite auto | 🟡 câblée, couverture partielle |
| 6. Pre-Launch Gate | ci-dessous | 🔴 bloqué |

## Epics — progression

| # | Epic | Statut |
|---|---|---|
| 1 | Authentification & Onboarding | ✅ |
| 2 | Comptes & liaison mobile money | 🟡 (sync stubbée) |
| 3 | Transactions & suivi des dépenses | ✅ |
| 4 | Budgets & alertes de seuil | ✅ |
| 5 | Objectifs financiers | ✅ |
| 6 | Portefeuille d'investissement | ✅ |
| 7 | Planification retraite & fiscale | ✅ |
| 8 | Analyse financière & prévisions | ✅ |
| 9 | Conseiller IA | 🟡 (chat désactivé) |
| 10 | Alertes & notifications | ✅ |
| 11 | Facturation & abonnements | ✅ |
| 12 | Console admin | ✅ |
| 13 | Application mobile | ✅ |
| 14 | Plateforme, monorepo & infra | ✅ |
| 15 | Mise en conformité BMAD v2 (sécurité & prod) | 🟡 5/10 stories (15.1, 15.2, 15.5, 15.6, 15.9 ✅) |

## Prochaine action recommandée

`bmad dev 15.4` — monitoring d'erreurs Sentry (PROD-01). Voir
[04-tests.md §7](04-tests.md#7-synthèse--priorités-avant-bmad-prelaunch)
pour l'ordre complet.

**Note story 15.5** : ✅ complet. `pnpm audit` réduit de **46 → 14**
vulnérabilités via `pnpm.overrides` — le critique éliminé entièrement, hautes
26→5, modérées 16→7, basses 3→2. Vérifié sans régression : `pnpm type-check`
(4/4), `pnpm test` (19/19), serveur de dev redémarré et testé en direct. Les
14 restantes sont **toutes** `next@14.2.35` — aucune n'a de correctif dans la
branche 14.x, seul un passage à Next.js ≥15.5.16 (changement majeur) les
corrige → nouvelle story **15.10** créée, non commencée. Risque résiduel
documenté dans [03-architecture.md ADR-007](03-architecture.md#adr-007--overrides-pnpm-pour-la-remédiation-sca-story-155) :
`js-yaml`/`brace-expansion` forcés en override "bare" faute d'un ciblage par
plage fonctionnel — non revérifié contre un vrai `expo start`.

**Note story 15.6** : ✅ complet. Pipeline GitHub Actions
([.github/workflows/ci.yml](../.github/workflows/ci.yml)) exécute
`pnpm type-check` + `pnpm test` sur chaque push/PR vers `master` — confirmé
en vrai sur GitHub (pas seulement rejoué localement), un premier run ayant
échoué et été corrigé en route (conflit de version pnpm entre le workflow et
`packageManager` dans `package.json`, voir 02-prd.md). Protection de branche
sur `master` (PR requise + check `type-check-and-test` requis) confirmée
active via l'API GitHub. A nécessité de rendre le dépôt public — la
protection de branche n'est pas appliquée sur un dépôt privé en dehors d'un
compte GitHub Team/Enterprise.

**Dépôt distant** : `github.com/golden001boy/budget-pocket` (public — passé de
privé à public spécifiquement pour que la protection de branche soit
applicable gratuitement, voir story 15.6), poussé
avec succès — 10 commits, `master` suit `origin/master`. Auparavant tout
l'historique était local uniquement, ce qui bloquait cette story (pas de
remote = pas de CI possible).

**Note story 15.9** : test runner Jest câblé (`apps/web/jest.config.js`,
`pnpm test` fonctionne à la racine du monorepo via Turborepo). A résolu au
passage les deux ADR-005 en suspens : `rateLimit.ts` et les schémas
`loginSchema`/`updateGoalSchema` ont maintenant de vrais tests unitaires
(19 tests, tous verts). A nécessité de repointer `jest` de `^30` vers
`^29.7.0` — `next/jest` (fourni par `next@14.2.35`) n'est pas compatible avec
Jest 30 (voir [03-architecture.md ADR-006](03-architecture.md#adr-006--pin-jest-29x-pour-compatibilité-avec-nextjest)).
Couverture encore très partielle — simulateurs, analytique et routes API
n'ont aucun test à ce jour ; `apps/mobile` n'a pas de runner du tout.

**Note story 15.1** : implémentée (rate limiting Redis sur login web/mobile +
inscription, voir [03-architecture.md ADR-004](03-architecture.md#adr-004--rate-limiting--fenêtre-fixe-redis-fail-open))
mais **non vérifiée de bout en bout** — Redis n'est pas encore up dans
l'environnement local. À qualifier (`bmad qa 15.1`) dès que Redis est
disponible. A aussi produit la story 15.9 (câbler Jest), nécessaire avant que
toute story suivante puisse respecter la règle "tests écrits avec le code".
Observation incidente : le fail-open Redis prend ~9-10s (backoff de
reconnexion par défaut d'ioredis) — latence à corriger si l'epic revient sur
ce fichier.

**Note story 15.2** : implémentée. Login mobile testé de bout en bout avec le
compte de démo réel (`demo@budget-pocket.app`) maintenant que la BDD est
opérationnelle — JWT émis correctement. `goals/[id]` reste à qualifier avec
une vraie session (bloqué par le gap 307/401 ci-dessous, pas par la BDD).
A révélé un gap d'API hors périmètre : les routes protégées par
`middleware.ts` renvoient une redirection `307` HTML plutôt qu'un `401` JSON
pour les clients non authentifiés — noté dans
[03-architecture.md §5](03-architecture.md), pas encore transformé en story.

## Gate Phase 6 — non atteignable en l'état

Les 10 stories de l'Epic 15 doivent toutes passer à ✅ avant de pouvoir cocher
la checklist [Phase 6](BMAD_FRAMEWORK_v2.md#9-phase-6--pre-launch-gate). En
particulier, deux points de la checklist n'ont **aucune story associée pour
l'instant** et devront être ajoutés à l'Epic 15 avant le gate :
- Vérification email (non implémentée — pas de flux de confirmation d'email)
- Tests de charge (jamais exécutés)

## Environnement local (hors périmètre BMAD, pour mémoire)

- **Base de données : ✅ opérationnelle** — bascule vers Postgres hébergé
  (Neon) effectuée. `prisma migrate dev` et `pnpm db:seed` exécutés avec
  succès ; `/api/health` confirme `db: connected` ; login mobile testé en
  direct avec le compte de démo (`demo@budget-pocket.app`) — JWT émis
  correctement. Débloque la vérification complète de toute story touchant la
  BDD, y compris une ré-exécution possible de `bmad qa 15.2`.
- **Redis : toujours non configuré.** `/api/health` renvoie maintenant une
  erreur Redis (`MaxRetriesPerRequestError`) au lieu d'une erreur Prisma —
  seul point encore bloquant pour qualifier pleinement la story 15.1
  (comportement "bloque après N tentatives"). L'app dégrade proprement sans
  lui (cache uniquement).
