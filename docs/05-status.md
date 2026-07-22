# 05 — Status

**Commande BMAD** : `bmad status`
**Dernière mise à jour** : 2026-07-03 (story 15.2 livrée)

## Vue d'ensemble des phases

| Phase | Livrable | Statut |
|---|---|---|
| 1. Discovery | [01-brainstorming.md](01-brainstorming.md) | ✅ |
| 2. PRD | [02-prd.md](02-prd.md) | ✅ |
| 3. Architecture | [03-architecture.md](03-architecture.md) | ✅ |
| 4. Développement | Epics 1–14 | ✅ · Epic 15 | 🟡 2/9 |
| 5. QA & Tests | [04-tests.md](04-tests.md) | ✅ (audit) · suite auto | 🔴 |
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
| 15 | Mise en conformité BMAD v2 (sécurité & prod) | 🟡 2/9 stories (15.1, 15.2 ✅) |

## Prochaine action recommandée

`bmad dev 15.6` — pipeline CI/CD (DEV-03). Voir
[04-tests.md §7](04-tests.md#7-synthèse--priorités-avant-bmad-prelaunch) pour
l'ordre complet.

**Note story 15.1** : implémentée (rate limiting Redis sur login web/mobile +
inscription, voir [03-architecture.md ADR-004](03-architecture.md#adr-004--rate-limiting--fenêtre-fixe-redis-fail-open))
mais **non vérifiée de bout en bout** — Redis n'est pas encore up dans
l'environnement local. À qualifier (`bmad qa 15.1`) dès que Redis est
disponible. A aussi produit la story 15.9 (câbler Jest), nécessaire avant que
toute story suivante puisse respecter la règle "tests écrits avec le code".
Observation incidente : le fail-open Redis prend ~9-10s (backoff de
reconnexion par défaut d'ioredis) — latence à corriger si l'epic revient sur
ce fichier.

**Note story 15.2** : implémentée et partiellement vérifiée (voir
[02-prd.md](02-prd.md) pour le détail). A révélé un gap d'API hors périmètre :
les routes protégées par `middleware.ts` renvoient une redirection `307` HTML
plutôt qu'un `401` JSON pour les clients non authentifiés — noté dans
[03-architecture.md §5](03-architecture.md), pas encore transformé en story.

## Gate Phase 6 — non atteignable en l'état

Les 9 stories de l'Epic 15 doivent toutes passer à ✅ avant de pouvoir cocher
la checklist [Phase 6](BMAD_FRAMEWORK_v2.md#9-phase-6--pre-launch-gate). En
particulier, deux points de la checklist n'ont **aucune story associée pour
l'instant** et devront être ajoutés à l'Epic 15 avant le gate :
- Vérification email (non implémentée — pas de flux de confirmation d'email)
- Tests de charge (jamais exécutés)

## Environnement local (hors périmètre BMAD, pour mémoire)

- Base de données : en cours de bascule vers Postgres hébergé (Neon) suite à
  un blocage d'installation locale Windows (reboot en attente).
- Redis : non configuré localement à ce jour (l'app dégrade proprement sans
  lui — cache uniquement).
