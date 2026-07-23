# 05 — Status

**Commande BMAD** : `bmad status`
**Dernière mise à jour** : 2026-07-23 (story 15.10 — migration Next.js 15 +
React 19, ✅ — `pnpm audit` à 0 vulnérabilité, voir ADR-009)

## Vue d'ensemble des phases

| Phase | Livrable | Statut |
|---|---|---|
| 1. Discovery | [01-brainstorming.md](01-brainstorming.md) | ✅ |
| 2. PRD | [02-prd.md](02-prd.md) | ✅ |
| 3. Architecture | [03-architecture.md](03-architecture.md) | ✅ |
| 4. Développement | Epics 1–14 | ✅ · Epic 15 | 🟡 8 ✅ + 2 🟡 sur 10 |
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
| 15 | Mise en conformité BMAD v2 (sécurité & prod) | 🟡 8 ✅ + 2 🟡 sur 10 (15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.9, 15.10 ✅ ; 15.7, 15.8 🟡) |

## Prochaine action recommandée

Toutes les stories planifiées de l'Epic 15 sont maintenant ✅ ou 🟡 avec un
résidu explicitement documenté (15.7 : test de restauration Neon réel,
console requise ; 15.8 : MFA, hors périmètre convenu). Le MFA (volet non
traité de 15.8, voir ADR-008) n'a pas encore de story dédiée — à créer si un
lancement avec de vrais utilisateurs est planifié. Sinon, prochaine étape
naturelle : `bmad prelaunch` pour évaluer l'écart réel à la checklist
Phase 6 (voir aussi les deux points sans story — vérification email, tests
de charge — notés plus bas). Voir
[04-tests.md §7](04-tests.md#7-synthèse--priorités-avant-bmad-prelaunch)
pour le détail complet.

**Note story 15.10** : ✅ complet. `next@14.2.35 → 15.5.21` + React
`18.3.1 → 19.2.8` — décision de scope prise avec vous avant implémentation
après une recherche qui a montré que le monde avait bougé depuis la
rédaction de la story (Next 15 App Router impose React 19 en pratique, le
vrai `latest` npm de `next` est désormais 16.x, NextAuth v4 a des soucis
documentés sur Next 15 App Router et son successeur Auth.js v5 est resté
en beta plus d'un an) : `next@15.5.21` + React 19 en gardant NextAuth v4,
sans aller jusqu'à Next 16 ni Auth.js v5. Détail complet :
[03-architecture.md ADR-009](03-architecture.md#adr-009--migration-nextjs-15--react-19-story-1510).
Le plus gros du travail n'avait rien à voir avec Next.js lui-même : faire
coexister React 19 (web) et React 18 (mobile, Expo SDK 51) dans le même
workspace pnpm cassait le type-check (`TS2786` sur tout composant
`forwardRef`) à cause de `resolve-peers-from-workspace-root=true` dans
`.npmrc` — présent depuis le commit initial, jamais documenté — qui faisait
résoudre les peers `@types/react` de `apps/web` contre la version
d'`apps/mobile`. Supprimé, plus deux couches de hoisting pnpm exclues
explicitement pour `@types/react`/`@types/react-dom`. Deuxième gap sans
rapport : `recharts` (2.13.3 puis 2.15.4) expose des primitives encore
typées comme composants classe, incompatibles avec le typage React 19 plus
strict — contourné via un cast centralisé
([rechartsCompat.ts](../apps/web/src/lib/rechartsCompat.ts)), vérifié au
runtime par rendu réel de graphiques SVG. `pnpm audit` : **14 → 0
vulnérabilité** (mieux que l'objectif initial), grâce à une nouvelle
vulnérabilité `sharp` (dépendance transitive de `next@15.5.21`) détectée et
corrigée dans la même story. Vérifié en direct contre la vraie BDD Neon :
connexion navigateur réelle (flux CSRF/callback NextAuth reproduit en
HTTP), connexion mobile, routes paginées, route dynamique avec `params`
async, pages serveur avec `searchParams` async, rendu du dashboard,
création + suppression d'une transaction. `pnpm type-check` (4/4) et
`pnpm test` (34/34) verts. **Non corrigé** : la suite Playwright (8/10
tests échouent avec un timeout de 15s trop court face au retry Redis local
+ compile à froid, déjà documenté story 15.1) — confirmé non lié à cette
migration, non bloquant (Playwright hors pipeline CI), non corrigé ici.

**Note story 15.8** : 🟡 hardening fait, MFA explicitement reporté (décision
prise avant implémentation, voir
[03-architecture.md ADR-008](03-architecture.md#adr-008--story-158-scoping--hardening-seul-mfa-reporté)).
Trois changements livrés : (1) rate limiting compte (10 tentatives/15 min,
toutes IP confondues) en plus du rate limiting par (email, IP) existant
depuis 15.1 — ferme le contournement par rotation d'IP ; (2) durée de session
JWT réduite de 30 à 7 jours (web + mobile) — borne la fenêtre d'exposition
d'un jeton volé sur un appareil inactif, sans impact perceptible pour un
utilisateur actif ; (3) politique de mot de passe renforcée sur
l'inscription (10 caractères minimum, rejet des mots de passe communs) —
n'affecte pas les comptes existants, `loginSchema` inchangé. Vérifié en
direct contre la vraie BDD Neon : rejets `400` corrects sur mot de passe
commun/trop court, inscription `201` réussie avec mot de passe fort (compte
supprimé après test), connexion démo toujours fonctionnelle, jeton mobile
décodé confirme `exp - iat = 7 jours`. 8 nouveaux tests unitaires (34/34
au total), `pnpm type-check` 4/4. **Non traité** : MFA (TOTP) — nécessiterait
migration de schéma + nouvelle dépendance + refonte du flux
`CredentialsProvider`, hors périmètre convenu ; révocation de session
côté serveur — la stratégie JWT est sans état par design, réduire `maxAge`
ne permet pas d'invalider un jeton déjà émis avant expiration.

**Note story 15.3** : ✅ complet. `GET /api/accounts`, `/api/budgets`,
`/api/goals`, `/api/portfolio` acceptent désormais `?page=&pageSize=` et
renvoient `{ data, meta }` (`meta.pageSize` plafonné à 100), même contrat que
`/api/transactions` — parsing centralisé et testé dans
[apps/web/src/lib/pagination.ts](../apps/web/src/lib/pagination.ts) (7 tests,
couvrant notamment le repli sur les valeurs par défaut pour des paramètres
invalides plutôt qu'un crash). `/api/transactions`, qui paginait déjà mais
sans plafond ni validation d'entrée, réutilise maintenant le même helper.
Vérifié en direct contre la vraie BDD Neon avec le compte de démo
(PREMIUM — limites `Infinity`, donc le cas d'usage réel de cette story) :
les 4 nouvelles routes + `/api/transactions` renvoient les bons
`total`/`totalPages`, `pageSize=999999` est bien plafonné à 100, et
`page=abc&pageSize=xyz` retombe sur les défauts sans erreur 500. Bug
découvert et corrigé au passage : l'écran mobile Investissements lisait
`data.items` sur une réponse qui était en réalité un tableau brut — la liste
était donc **toujours vide** sur mobile ; corrigé (`data.data`, cohérent avec
le nouveau contrat). `pnpm type-check` (4/4) et `pnpm test` (26/26) verts.
**Non couvert** : pas de pager/infinite-scroll côté UI mobile (charge
toujours seulement la page 1) — les pages web équivalentes lisent Prisma
côté serveur directement, donc hors périmètre de ce changement de contrat
API.

**Note story 15.7** : 🟡 politique documentée, pas encore vérifiée. Le
mécanisme de restauration Neon (branchement par LSN, réversible via branche
de sauvegarde auto-créée, root branches uniquement) est confirmé via la
documentation officielle Neon — pas supposé. **Fenêtre PITR réelle confirmée
avec vous : plan Free, 6 heures, plafonné à 1 Go** — documenté comme risque
assumé, pas minimisé : tout incident de données non détecté sous 6h devient
irrécupérable via Neon. Stratégie de rollback de schéma Prisma documentée
(restauration Neon dans la fenêtre, migration inverse manuelle au-delà).
**Reste 🟡, pas ✅** : aucun test de restauration réel exécuté — nécessite la
console Neon, à laquelle l'agent n'a pas accès (seule la chaîne de connexion
a été fournie). Détail complet :
[03-architecture.md §11](03-architecture.md#11--politique-de-sauvegarde--restauration-story-157).

**Note story 15.4** : ✅ complet. `@sentry/nextjs` intégré aux trois runtimes
(client/serveur/edge) + frontière d'erreur globale App Router
([global-error.tsx](../apps/web/src/app/global-error.tsx)). Sans DSN
configuré, le SDK est un no-op vérifié — aucune erreur/warning au boot, build
de production propre (43/43 routes). CSP mise à jour pour autoriser les
domaines d'ingestion Sentry, sinon le navigateur aurait bloqué l'envoi côté
client. **Non vérifié** : réception réelle d'un événement dans un projet
Sentry — nécessite un compte/DSN (même situation que Neon/GitHub
précédemment, à fournir par vous). À faire : `bmad qa 15.4`.

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
