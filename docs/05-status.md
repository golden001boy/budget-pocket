# 05 — Status

**Commande BMAD** : `bmad status`
**Dernière mise à jour** : 2026-09-13 (story 15.14 — coffre de secrets :
décision de cadrage Vercel + validation Zod des variables d'environnement
au boot ; décision prise en session `/goal` autonome, sans vous — voir note
ci-dessous)

## Vue d'ensemble des phases

| Phase | Livrable | Statut |
|---|---|---|
| 1. Discovery | [01-brainstorming.md](01-brainstorming.md) | ✅ |
| 2. PRD | [02-prd.md](02-prd.md) | ✅ |
| 3. Architecture | [03-architecture.md](03-architecture.md) | ✅ |
| 4. Développement | Epics 1–14 | ✅ · Epic 15 | 🟡 12 ✅ + 3 🟡 + 1 🔴 sur 16 |
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
| 15 | Mise en conformité BMAD v2 (sécurité & prod) | 🟡 12 ✅ + 3 🟡 + 1 🔴 sur 16 (15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.9, 15.10, 15.11, 15.12, 15.13, 15.16 ✅ ; 15.7, 15.8, 15.14 🟡 ; 15.15 🔴 non commencée) |

## Prochaine action recommandée

15.11 (reset de mot de passe), 15.12 (vérification email), 15.13 (tests de
charge) et 15.16 (correctif du goulot dashboard trouvé en 15.13) faites.
Les deux derniers Must de la checklist Phase 6 §9.1 sont traités.
**15.14 (coffre de secrets) traitée partiellement** (🟡, voir note
ci-dessous) ; il reste **15.15** (politique de patching), Could, créée
suite à `bmad prelaunch` (2026-07-23, détail dans la section Gate Phase 6
plus bas). Le MFA (volet non traité de 15.8, voir ADR-008) reste sans
story dédiée. Voir
[04-tests.md §7](04-tests.md#7-synthèse--priorités-avant-bmad-prelaunch)
pour le détail complet.

**Note story 15.14** : 🟡 partiel — traitée dans une session `/goal` en
continuation autonome (2026-09-13, « poursuis jusqu'à épuisement de token
de cette session »), donc **la décision de cadrage a été prise sans vous**,
contrairement à ce que la story prévoyait explicitement ("à trancher avec
vous avant de commencer") et contrairement au précédent établi par 15.10/
15.12. Décision retenue : variables d'environnement chiffrées Vercel comme
coffre dédié (pas de Vault/AWS Secrets Manager), voir
[03-architecture.md ADR-012](03-architecture.md#adr-012--coffre-de-secrets--variables-denvironnement-vercel-plutôt-que-vaultaws-secrets-manager-story-1514)
— **à confirmer ou corriger avec vous**. Garde-fou de code livré et
vérifié : [lib/env.ts](../apps/web/src/lib/env.ts) valide au boot
(`instrumentation.ts`) que les secrets requis sont présents/bien formés ;
un vrai bug a été attrapé en le branchant (clés Stripe vides du `.env`
local rejetées à tort comme invalides — corrigé avant de committer,
reconfirmé par un redémarrage propre du serveur de dev). 12 nouveaux tests
(68/68 au total), `pnpm type-check` 4/4. **Non vérifié** : configuration
réelle dans un vrai dashboard Vercel (pas de compte connecté dans cette
session). Aucun accès réseau vers GitHub/Neon dans cette session (sandbox
sans sortie internet) — travail commité sur une branche locale
(`epic-15/15.14-15.15-secrets-patching`), pas poussée, `master` non touché.

**Note story 15.16** : ✅ complet — corrige le goulot `/dashboard` trouvé
en 15.13. **Le diagnostic de la 15.13 était faux** (contention Postgres
supposée) : la vraie cause, trouvée par isolation méthodique (curl
serveur direct, script Prisma isolé, client `ioredis` isolé), était un bug
de configuration `ioredis` — `enableOfflineQueue` non désactivé fait
attendre les commandes émises hors connexion sur un backoff de reconnexion
qui s'allonge **sans jamais se réinitialiser** tant que le client reste
déconnecté, rendant chaque appel cache de plus en plus lent au fil de la
vie du process (12-16s observés sur une requête isolée sans charge, pas
un problème de concurrence). Correctif : `enableOfflineQueue: false`.
Résultat : `/dashboard` 100 % → 0 % d'échec ; **corrige aussi, au passage,
le coût du fail-open Redis accepté depuis 15.1/ADR-004** (~5,4s → ~410ms
sur `/api/auth/mobile`). Testé aussi contre l'instabilité E2E connue
depuis 15.10 (attribuée en partie à ce même retry Redis) : **persiste**
après le correctif, ce qui écarte Redis comme cause de cette instabilité-là
et pointe vers le compile à froid de `next dev` — non corrigé, hors
périmètre. Échecs résiduels sous charge combinée (20 %) non expliqués par
Redis, hypothèse capacité Neon Free non confirmée. ADR-010 corrigé
(pas réécrit en silence) + nouvel ADR-011. Détail complet :
[02-prd.md](02-prd.md#story-1516--corriger-le-goulot-dashboard-trouvé-en-story-1513--done).

**Note story 15.13** : ✅ complet, avec une distorsion assumée et
documentée (pas de Redis local — installation Chocolatey refusée avec
vous). Artillery contre un build de production réel + Neon réelle. Routes
API paginées saines (0 % d'échec, p95 596ms). Goulot distinct découvert
sur `/dashboard` — **diagnostic initial invalidé par la story 15.16**, voir
note ci-dessus pour la cause réelle. Une tentative de correctif
(`connectTimeout` sur Redis) a été testée dans cette story, invalidée par
re-test, et **annulée** plutôt que laissée en place — bon réflexe mais
mauvaise piste, le vrai correctif (`enableOfflineQueue`) n'a été trouvé
qu'en 15.16. Voir
[02-prd.md](02-prd.md#story-1513--tests-de-charge--fait-avec-distorsion-documentée)
pour le détail complet des chiffres et du diagnostic (conservé tel quel).

**Note story 15.12** : ✅ complet. Vérification email **non-bloquante**
(décision produit prise avec vous avant implémentation) : le compte reste
utilisable normalement dès l'inscription, un email de confirmation part en
parallèle et une bannière discrète l'indique tant que le statut
`emailVerified` n'est pas vrai. `User.emailVerified` (`DateTime?`,
convention NextAuth standard) + nouveau modèle `EmailVerificationToken`,
même forme que `PasswordResetToken` (story 15.11). Refactorisation DRY au
passage : la génération/hash de token, identique entre les deux stories,
extraite dans `lib/tokens.ts` partagé — `passwordReset.ts` garde son API
publique inchangée. `resend-verification` est gaté par la **session**
plutôt que par un email dans le body, à la différence de
`forgot-password` : l'appelant est déjà prouvé propriétaire du compte,
donc pas de risque d'énumération à gérer ici. Subtilité JWT gérée
correctement : un token étant sans état, une vérification survenant après
la connexion initiale ne s'y reflète pas automatiquement — la page
`/verify-email` appelle `useSession().update()` pour forcer le
rafraîchissement depuis la BDD. Vérifié en direct contre la vraie BDD
Neon avec deux comptes jetables : cycle complet inscription → lien loggé
→ token invalide (400) → vérification réussie (200) → réutilisation
rejetée (400) → `emailVerified` confirmé en BDD **et** dans le JWT décodé
après une connexion post-vérification ; `resend-verification` testé à la
fois sur un compte déjà vérifié (message dédié, pas de nouveau token) et
sur un compte non vérifié (invalide l'ancien, émet un nouveau qui
vérifie correctement à son tour). Comptes supprimés après test. 9
nouveaux tests unitaires (52/52 au total, dont 3 déplacés depuis
`passwordReset.test.ts` vers `tokens.test.ts`), `pnpm type-check` 4/4.
**Non vérifié** : comportement réel du rate limiting (même limitation que
toutes les routes rate-limitées depuis 15.1, pas de Redis local).

**Note story 15.11** : ✅ complet. Flux reset de mot de passe complet —
`POST /api/auth/forgot-password` (email → token 256 bits, seul le hash
SHA-256 stocké, invalide les tokens précédents, réponse identique que le
compte existe ou non pour ne pas permettre l'énumération) et
`POST /api/auth/reset-password` (token + nouveau mot de passe, la même
politique que l'inscription depuis 15.8) ; pages `/forgot-password` et
`/reset-password?token=...` ; le bouton "Mot de passe oublié ?" de
`LoginForm.tsx`, jusque-là un `<button>` mort, pointe maintenant vers
`/forgot-password`. Emails via Resend (dépendance présente depuis le
début mais jamais câblée) — sans `RESEND_API_KEY` (cas actuel), le lien
est simplement loggé côté serveur, même pattern que Sentry sans DSN.
Vérifié en direct contre la vraie BDD Neon avec un compte jetable : cycle
complet inscription → demande de reset → récupération du lien loggé →
rejet mot de passe faible (400) → rejet token invalide (400) → reset
réussi (200) → réutilisation du même token rejetée (400) → connexion avec
le nouveau mot de passe (succès) → connexion avec l'ancien (401). Compte
supprimé après test. 12 nouveaux tests unitaires (46/46 au total),
`pnpm type-check` 4/4. **Non vérifié** : comportement réel du rate
limiting (fail-open faute de Redis local, même limitation que story
15.1 — logique testée unitairement, pas bout en bout). Item Gate Phase 6
§9.1 reste 🔴 : la checklist exige un test en environnement de
**production réelle**, qui n'existe toujours pas.

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
**Deux correctifs post-push** (aucun des deux reproduit en local avant que
la CI les révèle) :
1. Client Prisma mal généré sur un store pnpm totalement froid (le
   `postinstall` rapportait pourtant un succès) — probablement un bug
   latent présent depuis le début du projet, jamais rencontré faute d'un
   store pnpm CI froid avant cette story. Corrigé par une étape
   `prisma generate` explicite ajoutée en CI après `pnpm install`.
2. Le correctif de hoisting `@types/react` qui répare `apps/web` cassait
   `apps/mobile` (`_layout.tsx`, `tabBarIcon`) — plusieurs paquets
   `@react-navigation/*`/`expo-router` ne déclarent pas `@types/react`
   comme peer formelle et comptaient sur le hoisting classique pour le
   trouver. Corrigé via `pnpm.packageExtensions` (6 paquets), au prix
   d'une itération manuelle package par package faute de méthode plus
   directe pour tous les identifier d'avance.

Les deux reproduits de façon fiable en local une fois le store pnpm
vidé. Détail complet :
[03-architecture.md ADR-009](03-architecture.md#adr-009--migration-nextjs-15--react-19-story-1510)
(post-scriptum 1 et 2). `pnpm type-check` (4/4, sans cache) et
`pnpm test` (34/34) reverifiés localement sur un store totalement froid
après les deux correctifs, avant nouveau push. **CI confirmée verte** sur
le commit `e32c83f` — story 15.10 réellement terminée, pas seulement
documentée comme telle.

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
ce fichier. **Corrigé en story 15.16** (`enableOfflineQueue: false`) : ~410ms
mesuré après correctif, contre ~5,4s avant (story 15.13) — voir
[03-architecture.md ADR-011](03-architecture.md#adr-011--vraie-cause-du-goulot-dashboard--backoff-de-reconnexion-ioredis-pas-postgres-story-1516).

**Note story 15.2** : implémentée. Login mobile testé de bout en bout avec le
compte de démo réel (`demo@budget-pocket.app`) maintenant que la BDD est
opérationnelle — JWT émis correctement. `goals/[id]` reste à qualifier avec
une vraie session (bloqué par le gap 307/401 ci-dessous, pas par la BDD).
A révélé un gap d'API hors périmètre : les routes protégées par
`middleware.ts` renvoient une redirection `307` HTML plutôt qu'un `401` JSON
pour les clients non authentifiés — noté dans
[03-architecture.md §5](03-architecture.md), pas encore transformé en story.

## Gate Phase 6 — évaluation (`bmad prelaunch`, 2026-07-23)

**Résultat : très loin d'être atteignable.** Sur les 20 cases de la
checklist [Phase 6](BMAD_FRAMEWORK_v2.md#9-phase-6--pre-launch-gate), la
majorité sont 🔴, et plusieurs n'ont **aucune story** dans l'Epic 15 —
l'écart est plus large que "il reste 15.7 et 15.8 à finir". Évaluation
honnête item par item, contre le code réel :

### 9.1 Fonctionnelle
| Item | État | Constat |
|---|---|---|
| Login/reset mdp en prod réelle | 🔴 | Le reset de mot de passe est désormais implémenté et vérifié en dev/Neon (story 15.11). Reste 🔴 uniquement parce qu'aucun environnement de production n'existe encore pour satisfaire le critère exact de la checklist ("testé en production réelle") |
| Paiements en mode réel | 🔴 | Stripe intégré (Epic 11) mais jamais testé hors mode test |
| SSL actif en prod | 🔴 | Pas de domaine de production |
| Environnements dev/staging/prod séparés | 🔴 | Aucun staging, aucune prod — `vercel.json` configure des crons mais rien ne prouve un déploiement réel |
| Clés API non exposées, secrets scannés | ✅ | `.env` gitignoré, aucun secret en dur (DEV-01) |
| Backups BDD vérifiés fonctionnels | 🟡 | Story 15.7 — politique documentée, aucun test de restauration réel exécuté |
| Vérification email activée | ✅ | Implémentée et vérifiée en direct contre Neon depuis la story 15.12 — email envoyé à l'inscription, lien de confirmation fonctionnel, statut suivi en BDD/session. **Non-bloquante** par décision produit (un compte non confirmé reste pleinement utilisable) : à revoir si le mode bloquant devient un jour requis, mais le système de vérification lui-même est bien actif |
| Pagination sur toutes les listes | 🟡 | Story 15.3 couvre accounts/budgets/goals/portfolio/transactions ; pas vérifié exhaustivement sur le reste (alerts, scenarios...) |

### 9.2 Sécurité
| Item | État | Constat |
|---|---|---|
| Rate limiting sur tous les endpoints sensibles | 🟡 | Login/inscription couverts (15.1) ; le reste des routes mutatives n'a aucune limite (API-04/API-06) |
| Protection anti-bot/spam | 🔴 | Aucun captcha, aucune protection anti-bot |
| Validation inputs testée côté serveur | ✅ | Zod partout (15.2) |
| CSRF protégé partout | 🟡 | Cookie `SameSite=Lax` par défaut NextAuth ; pas de token CSRF explicite sur les routes API custom (FE-04) |
| Headers de sécurité présents | ✅ | CSP/X-Frame-Options/etc déployés (FE-06) |
| Aucun endpoint debug exposé | 🟡 | Aucun `/debug` trouvé, mais `/api/health` expose le message d'erreur Prisma brut (BE-09) |
| Secrets depuis un coffre dédié | 🟡 | Story 15.14 — décision de cadrage prise (variables d'env chiffrées Vercel plutôt que Vault/AWS Secrets Manager, [ADR-012](03-architecture.md#adr-012--coffre-de-secrets--variables-denvironnement-vercel-plutôt-que-vaultaws-secrets-manager-story-1514), à confirmer avec vous) + validation Zod des secrets au boot (`lib/env.ts`) ; non vérifié sur un vrai compte Vercel |
| Pipeline CI/CD protégé | ✅ | Story 15.6, confirmé actif |
| Scan SCA sans vulnérabilité critique | ✅ | `pnpm audit` à **0 vulnérabilité** (story 15.10) |

### 9.3 Observabilité & performance
| Item | État | Constat |
|---|---|---|
| Monitoring d'erreurs actif + alertes | 🟡 | Sentry intégré (15.4) mais **sans DSN configuré = no-op**, donc pas réellement actif |
| Journalisation actions sensibles centralisée | 🔴 | Aucun log applicatif des actions sensibles (login, changement de rôle...) — BE-08 |
| Tests de charge effectués | 🟡 | Exécutés (story 15.13, Artillery) contre un build de production réel + Neon réelle. Test réalisé **sans Redis local** (installation refusée) — distorsion documentée. Routes API paginées : saines (0 % d'échec, p95 ~570-600ms). Goulot `/dashboard` trouvé en 15.13 (diagnostic initial faux, contention Postgres supposée) **corrigé en story 15.16** : vraie cause = bug de config `ioredis`, `/dashboard` 100 % → 0 % d'échec, coût du fail-open Redis (accepté depuis 15.1) réduit de ~5,4s à ~410ms. Échecs résiduels sous charge combinée (20 %) sans rapport avec Redis, cause non confirmée (capacité Neon Free suspectée). Reste 🟡 et non ✅ : la distorsion "sans Redis local" persiste (Redis n'est toujours pas opérationnel, seul le comportement de son absence est mieux géré) et une partie de la charge combinée échoue encore |
| Politique de patching définie + rollback testé | 🟡 | Rollback BDD documenté (15.7) ; pas de politique de patching formelle, rien testé en pratique |

**Score approximatif** : 6 ✅ / 9 🟡 / 5 🔴 sur 20 (évaluation initiale du
23/07 : 5/8/7 — mis à jour après la story 15.12, qui active la
vérification email ; puis après la story 15.13/15.16, tests de charge
exécutés et le goulot dashboard qu'ils ont révélé corrigé — le score reste
inchangé car "tests de charge effectués" était déjà 🟡, pas 🔴, et le reste
de la distorsion Redis/charge combinée maintient ce statut).

**Pour aller au-delà de "documentation exhaustive d'un projet de démo"**, il
faudrait au minimum : un environnement de production réel (domaine, SSL,
staging séparé), le reset de mot de passe et la vérification email
(actuellement absents, pas juste incomplets), un coffre de secrets, un vrai
DSN Sentry, et des tests de charge. Ce n'est pas une liste de finitions —
c'est l'écart entre "app qui tourne en local avec un compte de démo" et "app
en production avec de vrais utilisateurs". Cohérent avec le risque déjà
assumé et documenté sur le PITR Neon (6h, plan Free) : ce projet n'est,
pour l'instant, pas prêt pour un lancement réel.

**Stories créées dans le PRD suite à cette évaluation** (voir
[02-prd.md](02-prd.md)) :
- ~~15.11 — Reset de mot de passe (flux email + token)~~ ✅ fait
- ~~15.12 — Vérification email à l'inscription~~ ✅ fait
- ~~15.13 — Tests de charge~~ ✅ fait (avec distorsion documentée, sans Redis)
- 15.14 — Coffre de secrets pour les variables d'environnement (non commencée)
- 15.15 — Politique de patching formelle + test de rollback (non commencée)
- ~~15.16 — Corriger le goulot `/dashboard` trouvé en 15.13~~ ✅ fait (créée
  et complétée dans la même session, en plus des trois ci-dessus prévues
  par `bmad prelaunch`)

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
