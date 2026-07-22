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
sécurité/prod — rate limiting, CI/CD, monitoring, backup) est 🟡 4/9 (15.1
rate limiting, 15.2 validation Zod, 15.6 pipeline CI/CD + protection de
branche, 15.9 test runner Jest — tous ✅ ; BDD Neon opérationnelle, Redis
encore manquant) et bloque la Phase 6. Dépôt distant :
`github.com/golden001boy/budget-pocket` (**public**). `pnpm test` fonctionne
désormais à la racine — toute nouvelle story doit inclure ses tests
unitaires, plus d'ADR de report type ADR-005. Voir
[docs/04-tests.md](docs/04-tests.md) pour le détail par item du catalogue de
failles.

**`master` est protégé** depuis la story 15.6 : PR requise + check
`type-check-and-test` requis avant fusion. Un push direct sur `master` par
un propriétaire du dépôt bypasse encore la règle (`enforcement_level:
non_admins`), mais le flux prévu est désormais branche + PR, pas push
direct.

## Stack & commandes essentielles

Monorepo pnpm/Turborepo — Next.js 14 (web) + Expo/React Native (mobile) +
Prisma/PostgreSQL. Détail complet : [docs/03-architecture.md](docs/03-architecture.md).

```bash
pnpm install          # installe + génère le client Prisma (postinstall)
pnpm dev              # lance web + mobile
pnpm type-check        # gate de correction de type (le build ignore les erreurs TS)
pnpm test               # suite Jest (apps/web uniquement à ce jour)
pnpm db:migrate         # migration Prisma (jamais de modif directe du schéma en prod)
pnpm db:seed            # compte de démo
```
