# 01 — Brainstorming / Discovery

**Commande BMAD** : `bmad analyste`
**Statut** : rétroactif — écrit le 2026-07-03 contre une base de code déjà largement
construite, pour mettre le projet en conformité avec [BMAD_FRAMEWORK_v2.md](BMAD_FRAMEWORK_v2.md).
Voir aussi la note de provenance dans [02-prd.md](02-prd.md).

## Problème

En Côte d'Ivoire et dans la zone UEMOA, la majorité des flux financiers individuels
transitent par le mobile money (Wave, MTN Mobile Money, Orange Money) et le cash,
sans outil unifié pour suivre les dépenses, budgétiser par catégorie, épargner vers
un objectif, ou suivre un portefeuille d'investissement (actions BRVM, crypto).
Les applications de budget existantes sont majoritairement conçues pour des
marchés occidentaux (comptes bancaires, cartes) et ne reflètent pas ces usages.

## Personas

- **Utilisateur principal** — individu ou foyer en zone UEMOA gérant ses finances
  principalement via mobile money et espèces, en FCFA (XOF), qui veut un point
  unique pour voir ses dépenses, budgétiser, épargner et investir.
- **Administrateur** (interne) — supervise la croissance des utilisateurs et la
  santé de la plateforme via `/admin`.

## Scénarios principaux

1. Un utilisateur s'inscrit, complète l'onboarding, ajoute un compte manuel, et
   enregistre ses premières dépenses catégorisées.
2. Un utilisateur définit un budget mensuel par catégorie et reçoit une alerte
   avant de le dépasser.
3. Un utilisateur définit un objectif d'épargne (fonds d'urgence, voyage) et suit
   sa progression.
4. Un utilisateur enregistre ses positions d'investissement (actions BRVM,
   crypto) et suit leur valeur avec des prix mis à jour automatiquement.
5. Un utilisateur passe en Premium via Stripe pour débloquer les fonctionnalités
   illimitées.
6. Un administrateur consulte le tableau de bord `/admin` pour voir la
   croissance des utilisateurs.

## MoSCoW

**Must have**
- Authentification (web + mobile), suivi des transactions catégorisées, budgets
  mensuels avec alertes, objectifs financiers, suivi de portefeuille avec prix
  live, abonnement Stripe.

**Should have**
- Prévisions/analyse financière, planification retraite/fiscale, simulateurs
  (immobilier, croissance boursière), tableau de bord admin.

**Could have**
- Conseiller IA conversationnel, synchronisation automatique des comptes mobile
  money.

**Won't have (cette version)**
- Connexion bancaire directe (open banking), support multi-devises au-delà de
  XOF/EUR/USD/GBP, application desktop native.

> **Statut réel de deux "Could have"** : la synchronisation mobile money et le
> chat IA conversationnel sont **construits mais désactivés/stubbés** — voir
> [02-prd.md § Non-goals](02-prd.md#non-goals--gaps-explicites) pour le détail.
> Documenté ici honnêtement plutôt que reclassé après coup en "Must have livré".

## Contraintes

- **Techniques** : monorepo pnpm/Turborepo, Next.js 14 (App Router) pour le web,
  Expo/React Native pour le mobile, PostgreSQL via Prisma, Redis pour le cache.
- **Budgétaires** : services tiers sur offres gratuites/pas cher en priorité
  (Neon, Upstash, CoinGecko sans clé, Groq gratuit pour l'IA).
- **Temporelles** : pas de contrainte de date externe documentée à ce jour.

## Critères de succès

- Un utilisateur peut réaliser le parcours complet (inscription → dépense →
  budget → objectif → portefeuille) sans erreur.
- `pnpm type-check` passe sur les 4 workspaces.
- Zéro secret exposé côté client (voir DEV-01 dans le catalogue sécurité).
- Le gate de pré-lancement (Phase 6) est entièrement coché avant toute mise en
  production réelle.

## Questions ouvertes

- Quel fournisseur d'intégration mobile money (agrégateur vs API directe par
  opérateur) pour sortir la synchronisation du statut "stub" ?
- Quel provider IA activer en premier pour le chat conseiller — Groq (gratuit,
  déjà configuré par défaut) ou Anthropic (payant, fallback déjà codé) ?
- Politique de rétention/backup pour la base de production — pas encore définie
  (bloquant pour la Phase 6, item 9.1).

## Risques & Contraintes de production (obligatoire)

### Sécurité
- Authentification par session JWT (NextAuth, côté web) + jeton bearer
  encodé séparément pour mobile (`/api/auth/mobile`) — **pas de MFA**.
- **Aucun rate limiting n'existe sur aucune route** (login, API, cron) — risque
  de brute force et d'abus de ressources. Voir BE-07/API-04/API-06 dans le
  catalogue.
- Validation serveur : présente via Zod sur la majorité des routes mutatives,
  mais absente sur `/api/auth/mobile` et `/api/goals/[id]` (PATCH) — voir
  [04-tests.md](04-tests.md).
- Flux sensibles à protéger en priorité : login, changement de mot de passe
  (non implémenté), webhook Stripe, routes cron (protégées par secret partagé).

### Performance
- Risque N+1 identifié : aucune requête `include`/relation imbriquée à risque
  élevé détectée dans les routes actuelles (la plupart des requêtes sont des
  `findMany`/`findUnique` à plat) — à re-vérifier si des relations sont
  ajoutées (ex. transactions avec compte lié).
- Colonnes à indexer : `Budget` et `RecurringRule` ont déjà des `@@index`
  documentés dans `schema.prisma` ; à étendre à `Transaction.userId`/`date` si
  les volumes augmentent (non mesuré à ce jour).
- Background jobs : 4 jobs cron existent déjà et sortent bien le travail lourd
  (rafraîchissement de prix, snapshots, alertes, récurrences) de la requête
  HTTP synchrone — conforme à la règle.
- Pagination : implémentée sur `/api/transactions` (`?limit=`) ; **absente**
  sur `/api/accounts`, `/api/budgets`, `/api/goals`, `/api/portfolio` — à
  corriger avant montée en charge réelle.

### Observabilité
- **Aucun monitoring d'erreurs actif** — `NEXT_PUBLIC_SENTRY_DSN` existe dans
  `.env.example` mais Sentry n'est pas intégré dans le code (pas de
  `sentry.client.config.ts`/`sentry.server.config.ts`).
- Pas de journalisation centralisée des actions sensibles au-delà des logs
  Prisma par défaut.

### Environnements
- Séparation dev/staging/prod : non formalisée — un seul `.env` local existe à
  ce jour, pas de configuration staging documentée.
- Secrets : gérés via variables d'environnement (`.env`, gitignoré) — pas de
  coffre-fort dédié (Vault, AWS Secrets Manager, etc.) à ce stade.
- Backup/rollback BDD : aucune stratégie documentée — **bloquant pour la Phase
  6** (item 9.1 de la checklist pré-lancement).
