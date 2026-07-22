# 05 — Status

**Commande BMAD** : `bmad status`
**Dernière mise à jour** : 2026-07-22 (story 15.6 — pipeline CI/CD, partiel ;
dépôt poussé sur GitHub)

## Vue d'ensemble des phases

| Phase | Livrable | Statut |
|---|---|---|
| 1. Discovery | [01-brainstorming.md](01-brainstorming.md) | ✅ |
| 2. PRD | [02-prd.md](02-prd.md) | ✅ |
| 3. Architecture | [03-architecture.md](03-architecture.md) | ✅ |
| 4. Développement | Epics 1–14 | ✅ · Epic 15 | 🟡 4/9 |
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
| 15 | Mise en conformité BMAD v2 (sécurité & prod) | 🟡 3/9 ✅ + 1/9 🟡 (15.1, 15.2, 15.9 ✅ ; 15.6 🟡) |

## Prochaine action recommandée

`bmad dev 15.5` — remédiation `pnpm audit` (46 vulnérabilités, 1 critique).
Voir [04-tests.md §7](04-tests.md#7-synthèse--priorités-avant-bmad-prelaunch)
pour l'ordre complet.

**Note story 15.6** : pipeline GitHub Actions ajouté
([.github/workflows/ci.yml](../.github/workflows/ci.yml)) — exécute
`pnpm type-check` + `pnpm test` sur chaque push/PR vers `master`. Toutes les
commandes ont été rejouées localement dans l'ordre exact du workflow et
passent. **Reste 🟡, pas ✅** : la protection de branche elle-même (exiger
le passage du workflow avant fusion) nécessite un accès admin GitHub que
l'agent n'a pas — action manuelle requise (voir 02-prd.md pour les étapes
exactes). Le workflow n'a pas non plus encore tourné réellement sur GitHub —
premier run à vérifier après le prochain push.

**Dépôt distant** : `github.com/golden001boy/budget-pocket` (privé), poussé
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

Les 9 stories de l'Epic 15 doivent toutes passer à ✅ avant de pouvoir cocher
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
