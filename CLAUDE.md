# Budget-Pocket — Contexte projet

Ce projet suit **BMAD Framework v2.0** ([docs/BMAD_FRAMEWORK_v2.md](docs/BMAD_FRAMEWORK_v2.md))
comme méthode de développement obligatoire. Avant toute nouvelle fonctionnalité :
lire [docs/05-status.md](docs/05-status.md) pour l'état courant, puis suivre le
flux de phases ci-dessous plutôt que de coder directement.

## Flux BMAD — documents vivants

| Phase | Commande | Document |
|---|---|---|
| 1. Discovery | `bmad analyste` | [docs/01-brainstorming.md](docs/01-brainstorming.md) |
| 2. PRD | `bmad pm` | [docs/02-prd.md](docs/02-prd.md) (Epics/Stories X.Y) |
| 3. Architecture | `bmad archi` | [docs/03-architecture.md](docs/03-architecture.md) |
| 4. Développement | `bmad dev X.Y` | code, story par story — détail par epic dans [specs/](specs/) |
| 5. QA & Tests | `bmad qa X.Y` | [docs/04-tests.md](docs/04-tests.md) |
| 6. Pre-Launch Gate | `bmad prelaunch` | checklist dans BMAD_FRAMEWORK_v2.md §9 |

`bmad status` → [docs/05-status.md](docs/05-status.md). `bmad next` passe à la
story suivante. `bmad adr` documente une décision architecturale dans
[docs/03-architecture.md §6](docs/03-architecture.md#6--adr--architecture-decision-records).

## Règles non-négociables (résumé — détail en §2 du framework)

1. Ne jamais sauter une phase.
2. Une seule story active à la fois.
3. En cas de divergence code/doc, on corrige le **code**.
4. Toute déviation architecturale → ADR.
5. Toute API valide ses inputs côté serveur, sans exception.
6. Jamais de modification directe du schéma BDD en prod — toujours via migration Prisma.

**État actuel** : Epics 1–14 sont ✅ Done. Epic 15 (mise en conformité
sécurité/prod — rate limiting, CI/CD, monitoring, backup) est 🟡 8 ✅ + 2 🟡
sur 10 (15.1 rate limiting, 15.2 validation Zod, 15.3 pagination
accounts/budgets/goals/portfolio, 15.4 monitoring Sentry, 15.5 scan SCA +
remédiation, 15.6 pipeline CI/CD + protection de branche, 15.9 test runner
Jest, 15.10 migration Next.js 15 + React 19 — tous ✅ ; 15.7 politique
backup/rollback 🟡 documentée mais non vérifiée par un test réel ; 15.8
hardening authentification 🟡 fait (rate limit compte, session 7j, mot de
passe renforcé) mais volet MFA explicitement reporté, voir ADR-008 ; BDD
Neon opérationnelle, Redis encore manquant) et bloque la Phase 6. Dépôt
distant :
`github.com/golden001boy/budget-pocket` (**public**). `pnpm test` fonctionne
désormais à la racine — toute nouvelle story doit inclure ses tests
unitaires, plus d'ADR de report type ADR-005. Voir
[docs/04-tests.md](docs/04-tests.md) pour le détail par item du catalogue de
failles.

**BDD Neon sur plan Free : fenêtre de restauration (PITR) de 6h seulement**,
plafonnée à 1 Go d'historique — voir
[docs/03-architecture.md §11](docs/03-architecture.md#11--politique-de-sauvegarde--restauration-story-157).
Risque assumé pour un projet sans utilisateurs réels ; bloquant avant tout
lancement en production réelle.

**Sentry est intégré mais sans DSN** (`NEXT_PUBLIC_SENTRY_DSN` vide dans
`.env`) — SDK actif en no-op, pas d'erreur. Ajouter un DSN réel active la
capture sans changement de code.

**`pnpm audit` est à 0 vulnérabilité** depuis la story 15.10 (migration
`next@14.2.35 → 15.5.21` + React 18 → 19 sur `apps/web` uniquement ;
`apps/mobile` reste sur React 18/Expo SDK 51). Voir
[docs/03-architecture.md ADR-009](docs/03-architecture.md#adr-009--migration-nextjs-15--react-19-story-1510)
pour le détail — notamment un bug de résolution `@types/react` sans rapport
avec Next.js (`.npmrc` avait `resolve-peers-from-workspace-root=true`
depuis le commit initial, jamais documenté) qui a fait le plus gros du
travail de cette story.

**`master` est protégé** depuis la story 15.6 : PR requise + check
`type-check-and-test` requis avant fusion. Un push direct sur `master` par
un propriétaire du dépôt bypasse encore la règle (`enforcement_level:
non_admins`), mais le flux prévu est désormais branche + PR, pas push
direct.

## Stack & commandes essentielles

Monorepo pnpm/Turborepo — Next.js 15 (web, React 19) + Expo/React Native
(mobile, React 18) + Prisma/PostgreSQL. Détail complet :
[docs/03-architecture.md](docs/03-architecture.md).

```bash
pnpm install          # installe + génère le client Prisma (postinstall)
pnpm dev              # lance web + mobile
pnpm type-check        # gate de correction de type (le build ignore les erreurs TS)
pnpm test               # suite Jest (apps/web uniquement à ce jour)
pnpm db:migrate         # migration Prisma (jamais de modif directe du schéma en prod)
pnpm db:seed            # compte de démo
```
