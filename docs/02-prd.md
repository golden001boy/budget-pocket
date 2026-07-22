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

## Epic 15 — Mise en conformité BMAD v2 (sécurité & prod) · 🟡 En cours (1/9)

**Nouveau** — créé suite à l'adoption de [BMAD_FRAMEWORK_v2.md](BMAD_FRAMEWORK_v2.md).
Ces stories couvrent les écarts identifiés dans [04-tests.md](04-tests.md) contre
le catalogue de failles §8 du framework. Toutes bloquent la Phase 6
(`bmad prelaunch`) tant qu'elles restent 🔴.

| Story | Titre | MoSCoW | Estim. | Statut | Réf. catalogue |
|---|---|---|---|---|---|
| 15.1 | Rate limiting sur login + inscription | Must | M | ✅ | BE-07, API-04, API-06 |
| 15.2 | Validation Zod sur `/api/auth/mobile` et `/api/goals/[id]` | Must | S | 🔴 | BE-03, FE-08 |
| 15.3 | Pagination sur `/api/accounts`, `/api/budgets`, `/api/goals`, `/api/portfolio` | Should | S | 🔴 | Perf (règle Phase 1) |
| 15.4 | Intégration monitoring d'erreurs (Sentry) | Must | M | 🔴 | PROD-01 |
| 15.5 | Scan SCA des dépendances + plan de remédiation | Must | S | 🔴 | DEV-02 |
| 15.6 | Pipeline CI/CD avec protections de branche | Must | M | 🔴 | DEV-03 |
| 15.7 | Politique de backup/rollback BDD production | Must | S | 🔴 | Gate Phase 6 §9.1 |
| 15.8 | MFA ou hardening de l'authentification | Should | L | 🔴 | BE-02 |
| 15.9 | Câbler un test runner (Jest) pour le monorepo | Must | S | 🔴 | prérequis §6.1 (tests écrits avec le code) — voir ADR-005 |

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
- [ ] Test unitaire — reporté à la story 15.9 (aucun test runner câblé), voir ADR-005.

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
