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
sécurité/prod) est 🟡 25 ✅ + 4 🟡 sur 29, plus aucune story 🔴. 15.7
(backup/rollback BDD) et 15.8 (hardening auth) restent 🟡 partiels
documentés (MFA reporté, voir ADR-008). **Dette technique signalée, non
traitée** (trois découvertes, décisions volontairement laissées à vous) :
`packages/api-client` est du code mort avec un mécanisme d'auth qui ne
fonctionnerait pas contre ce backend ; cinq répertoires de route API sous
`apps/web/src/app/api` n'ont jamais eu de `route.ts`
(`accounts/[id]`, `portfolio/[id]`, `alerts/[id]`, `admin/stats`,
`admin/users`) ; `retirement.ts`/`stockGrowth.ts` divergent de ~2,5-3 %
entre leur total final et le dernier point de `projectionByYear` (sans
impact aujourd'hui, ce champ n'est rendu nulle part dans l'UI) — détail et
options dans
[docs/03-architecture.md §13](docs/03-architecture.md#13-dette-technique-identifiée-non-traitée-signalée-pour-décision).

**⚠️ Point de reprise en attente (2026-09-14)** : une revue de code
holistique `code-review high master..HEAD` (auto-initiée, non demandée),
lancée après la 15.29, s'est arrêtée **avant sa fin** sur une limite de
session (3 des 8 angles interrompus, à relancer ; les 5 autres ont rendu
des findings non dédupliqués/non vérifiés). Deux dérives déjà confirmées
par cette revue ont depuis été corrigées dans la même session (`GET
/api/advisor/scenarios` sans `try/catch`, message 401 non uniforme —
uniformisé sur `'Unauthorized'`), et la question de fond qu'elle a soulevée
(aucun wrapper de route API partagé) ajoutée comme quatrième découverte en
[03-architecture.md §13](docs/03-architecture.md#13-dette-technique-identifiée-non-traitée-signalée-pour-décision).
Reste à faire : relancer les 3 angles interrompus, dédupliquer/vérifier
l'ensemble. Détail dans
[docs/05-status.md §Point de reprise](docs/05-status.md#point-de-reprise-pour-la-prochaine-session--revue-de-code-holistique-interrompue-2026-09-14)
— à lire avant toute nouvelle story.

**Stories 15.14 à 15.29 traitées le 2026-09-13** dans une session `/goal`
en continuation autonome (« poursuis jusqu'à épuisement de token de cette
session »), **sans pause pour confirmation avec vous** — contrairement au
précédent établi par 15.10/15.12. Résumé (détail complet story par story
dans [docs/05-status.md](docs/05-status.md), section Gate Phase 6) :
- **15.14** coffre de secrets — variables d'env chiffrées Vercel retenues
  plutôt que Vault/AWS Secrets Manager, décision **à confirmer avec vous**
  ([ADR-012](docs/03-architecture.md#adr-012--coffre-de-secrets--variables-denvironnement-vercel-plutôt-que-vaultaws-secrets-manager-story-1514)),
  + validation Zod des secrets au boot (`lib/env.ts`). 🟡 partiel.
- **15.15** politique de patching + rollback applicatif réellement testé
  (`git revert`, rollback BDD toujours non exercé). 🟡 partiel.
- **15.17** `/api/health` ne fuit plus le message d'erreur Prisma brut. ✅
- **15.18** pagination sur `scenarios`/`taxes` (dernier résidu de 15.3) —
  a aussi révélé et corrigé un bug mobile pré-existant (écran Conseiller
  affichait toujours zéro scénario, même famille que le bug Investissements
  de 15.3). ✅
- **15.19** journalisation centralisée des actions sensibles d'auth
  (`lib/auditLog.ts`). ✅
- **15.20** rate limiting étendu (60/min/utilisateur) aux 14 handlers de
  mutation qui n'en avaient aucun. ✅
- **15.21** `401` JSON propre sur les routes API protégées au lieu d'une
  redirection `307` (gap noté depuis 15.2) + `/api/auth/mobile` ne
  crashe plus brut sur une coupure BDD transitoire. ✅
- **15.22** couverture de tests (59 tests) pour les 9 routes CRUD
  restantes sans aucun test (gap noté depuis 15.9) — tests seulement,
  aucun changement de comportement. ✅
- **15.23** `POST /api/advisor/scenarios` n'avait aucune validation Zod
  (règle #5 violée) ni `try/catch` — corrigé, sans imposer de shape pour
  les 3 types de scénario qui n'en ont pas encore (signalé en §13). ✅
- **15.24** audit systémique après 15.21/15.23 : ni les 10 autres routes
  CRUD ni `analysis/snapshot`/`analysis/forecast` n'avaient de
  `try/catch` (12 fichiers, 21 handlers) — même patron appliqué partout,
  aucun changement de comportement sur le chemin normal. ✅
- **15.25** même schéma que 15.23 : 3 autres schémas partagés complets
  mais inutilisés (`retirement.ts`, `goal.ts`, `portfolio.ts`) — champs
  Prisma réels (`inflationRate`, `priority`, `exchange`, `notes`) jamais
  exposés par l'API, ajoutés aux schémas locaux. Incident mineur pendant
  le nettoyage post-vérification (upsert sur la ligne seedée du compte
  de démo supprimé par réflexe), restauré immédiatement, signalé dans
  05-status.md. ✅
- **15.26** `apps/mobile` a enfin un test runner (`jest-expo`), gap noté
  depuis 15.9. A nécessité de corriger le `transformIgnorePatterns` par
  défaut, incompatible avec la structure imbriquée de pnpm
  ([ADR-013](docs/03-architecture.md#adr-013--transformignorepatterns-pnpm-compatible-pour-jest-expo-story-1526)).
  12 premiers tests réels : `lib/mfetch.ts` (7) et `contexts/AuthContext.tsx`
  (5, rendu via `react-test-renderer`, déjà disponible, sans ajouter
  `@testing-library/react-native`). `pnpm test` racine couvre désormais
  web et mobile. ✅
- **15.27** `formatCurrency`/`convertToXOF` (`packages/shared`), logique
  argent réelle jamais testée — 7 tests, testés depuis `apps/web` (même
  convention qu'`authSchemas.test.ts`, `packages/shared` n'a pas de runner
  propre). ✅
- **15.28** `projectForecast` (régression linéaire des prévisions
  financières) n'avait jamais été testé directement, seulement par mock
  en 15.24 — 10 tests couvrant tendance, plancher à zéro, accumulation du
  patrimoine net, rollover d'année, tri chronologique, niveaux de
  confiance. ✅
- **15.29** dernier trou "simulateurs" noté depuis 15.9 — 23 tests sur
  `realEstate.ts`/`retirement.ts`/`stockGrowth.ts`. A trouvé un écart réel
  (~2,5-3 %) entre le total final et le dernier point de
  `projectionByYear` sur 2 des 3 simulateurs (formule fermée vs. boucle
  annuelle) — sans impact aujourd'hui (champ non rendu dans l'UI),
  documenté dans les tests et en §13. ✅

15.17–15.21 vérifiées en direct contre la vraie BDD Neon avec le compte de
démo (connexions mobile réelles, écritures de test supprimées après coup),
pas seulement en unitaire. **Correction sur l'accès réseau** : les
premières notes de cette session affirmaient qu'aucun accès réseau
n'existait dans ce sandbox (GitHub, Neon) — inexact. La réalité, observée
plusieurs fois pendant la session : une **connectivité intermittente**
(Neon est passé joignable → injoignable → joignable sans action de ma
part), cause exacte non confirmée (cold-start du compute Neon Free
suspecté, instabilité du sandbox pas exclue). Travail commité sur une
branche locale non poussée (`epic-15/15.14-15.15-secrets-patching`) — pas
par impossibilité, mais parce que pousser n'a pas été demandé — voir
[docs/05-status.md §Gate Phase 6](docs/05-status.md#gate-phase-6--évaluation-bmad-prelaunch-2026-07-23)
pour le détail item par item (score **10 ✅ / 6 🟡 / 5 🔴 sur 21** — le
dénombrement précédent ("20 items") était déjà inexact ; le projet reste
une démo solide en local, pas prêt pour un lancement réel). **Story 15.13**
a tourné les
tests de charge (Artillery) sans Redis local (installation refusée,
distorsion documentée) et cru trouver un goulot Postgres sur `/dashboard`
— **diagnostic invalidé par la story 15.16** : la vraie cause était un bug
de configuration `ioredis` (`enableOfflineQueue` non désactivé, backoff de
reconnexion qui s'accumule sans fin sur un client de longue durée), corrigé
avec un effet de bord notable : le coût du fail-open Redis accepté depuis
la story 15.1/ADR-004 chute de ~5,4s à ~410ms. Voir
[docs/03-architecture.md ADR-011](docs/03-architecture.md#adr-011--vraie-cause-du-goulot-dashboard--backoff-de-reconnexion-ioredis-pas-postgres-story-1516)
pour le détail (ADR-010 corrigé, pas réécrit en silence). Dépôt distant :
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
pnpm test               # suite Jest (apps/web + apps/mobile depuis la story 15.26)
pnpm db:migrate         # migration Prisma (jamais de modif directe du schéma en prod)
pnpm db:seed            # compte de démo
```
