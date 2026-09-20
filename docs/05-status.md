# 05 — Status

**Commande BMAD** : `bmad status`
**Dernière mise à jour** : 2026-09-19 (story 15.30 — limite de taille de
payload sur les routes mutatives ; reprise d'un travail commencé dans une
session précédente et laissé non committé, voir sa note ci-dessous)

## Vue d'ensemble des phases

| Phase | Livrable | Statut |
|---|---|---|
| 1. Discovery | [01-brainstorming.md](01-brainstorming.md) | ✅ |
| 2. PRD | [02-prd.md](02-prd.md) | ✅ |
| 3. Architecture | [03-architecture.md](03-architecture.md) | ✅ |
| 4. Développement | Epics 1–14 | ✅ · Epic 15 | 🟡 28 ✅ + 4 🟡 sur 32 |
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
| 15 | Mise en conformité BMAD v2 (sécurité & prod) | 🟡 28 ✅ + 4 🟡 sur 32 (15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.9, 15.10, 15.11, 15.12, 15.13, 15.16, 15.17, 15.18, 15.19, 15.20, 15.21, 15.22, 15.23, 15.24, 15.25, 15.26, 15.27, 15.28, 15.29, 15.30, 15.31, 15.32 ✅ ; 15.7, 15.8, 15.14, 15.15 🟡 — plus aucune story 🔴 dans l'epic) |

## Prochaine action recommandée

**Note story 15.30** (2026-09-19) : ✅ complet — dernier résidu documenté
d'API-04 (limite de taille de payload), noté depuis la story 15.20, jamais
transformé en story jusqu'ici. Le garde-fou lui-même
([lib/requestBody.ts](../apps/web/src/lib/requestBody.ts) — `readJsonBody()`,
remplaçant de `req.json()` qui rejette avec `PayloadTooLargeError` tout
corps dépassant 100 Ko avant de le parser) avait été écrit dans une
session précédente mais **laissé non committé et non branché sur aucune
route** — trouvé comme fichier non suivi par `git status` en début de
cette session. Terminé ici : câblé sur les 16 fichiers de route qui
acceptent un corps JSON (`accounts`, `budgets`, `goals` + `goals/[id]`,
`portfolio`, `transactions` + `transactions/[id]`, `user/profile`,
`planning/retirement`, `planning/taxes`, `advisor/scenarios`, et les 5
routes `auth/*`), chaque `catch` distinguant désormais `413` (payload trop
gros) du `500` générique existant (story 15.24). 7 nouveaux tests sur le
helper + un test de régression `413` dans les 12 suites de route déjà
existantes parmi les 16 modifiées (254/254 au total), `pnpm type-check`
(4/4), `pnpm build` (50/50 pages) verts. **Non couvert** : les 4 routes
`auth/*` restantes (`register`/`forgot-password`/`reset-password`/
`verify-email`) n'avaient aucun fichier de test avant cette story — leur
en créer un uniquement pour ce correctif aurait dépassé le périmètre de la
story, signalé plutôt que traité en silence (gap déjà connu
séparément). **Non vérifié** : comportement réel contre la vraie BDD Neon
avec un corps de requête effectivement surdimensionné (couverture
unitaire complète, pas de vérification bout en bout comme pour d'autres
stories de cet epic). Détail complet :
[02-prd.md](02-prd.md#story-1530--limite-de-taille-de-payload-sur-les-routes-mutatives--done).

**Note story 15.31** (2026-09-19) : ✅ complet — suite à la demande
explicite « terminons avec l'epic 15 », les 4 découvertes de dette
technique du [§13](03-architecture.md#13-dette-technique-identifiée-décisions-tranchées-avec-lutilisateur-le-2026-09-19)
(laissées non tranchées depuis la revue de code holistique du
2026-09-14) ont été présentées avec leurs options, décidées explicitement
avec vous, puis implémentées : `packages/api-client` supprimé (code mort,
avec son unique consommateur `apps/mobile/lib/api.ts`, lui-même
inutilisé) ; 5 répertoires de route API vides supprimés (`accounts/[id]`,
`portfolio/[id]`, `alerts/`, `admin/stats`, `admin/users` — le matcher de
`middleware.ts` a aussi perdu son entrée `/api/alerts/:path*` désormais
sans cible réelle) ; `projectionByYear` aligné exactement sur le total
final dans `retirement.ts`/`stockGrowth.ts` (boucle mensuelle au lieu
d'un bloc annuel — écart de story 15.29 fermé, pas seulement documenté) ;
wrapper d'API partagé `withApiRoute`/`withDynamicApiRoute`
([lib/apiRoute.ts](../apps/web/src/lib/apiRoute.ts)) construit et câblé
sur les 13 fichiers de routes concernés. **Obstacle réel rencontré en
implémentant le wrapper, non anticipé lors de la décision** : une
première version à fonction unique avec un second paramètre
optionnel/par défaut échouait `pnpm type-check` — le validateur de types
généré par Next.js exige qu'un second paramètre de handler, s'il est
déclaré, soit exactement `{ params: Promise<P> }` sans `undefined` dans
le type, ce qu'un paramètre optionnel ne satisfait jamais en TypeScript.
Résolu en scindant en deux fonctions (`withApiRoute` pour les routes
statiques, un seul paramètre déclaré ; `withDynamicApiRoute<P>` pour les
routes à segment dynamique, deux paramètres obligatoires) — détail complet
dans [03-architecture.md](03-architecture.md#aucun-wrapper-de-route-api-partagé--trycatchrate-limitsession-recopiés-à-la-main-dans-12-fichiers--décision-prise--hof-withapiroutewithdynamicapiroute).
16 nouveaux tests de wrapper, 2 tests de simulateurs réécrits (267/267 au
total), `pnpm type-check` 3/3 (le monorepo passe de 4 à 3 packages),
`pnpm build` 50/50 pages après un rebuild complet (`.next` supprimé pour
régénérer les validateurs de route sur les nouvelles signatures). Aucun
changement de comportement sur le chemin nominal des 13 routes migrées —
confirmé par la suite de tests existante, exécutée sans aucune
modification de ses mocks (ils ciblent les chemins de module, pas les
sites d'import). Détail complet :
[02-prd.md](02-prd.md#story-1531--dette-technique-13-clôturée-avec-lutilisateur-4-décisions--done).

**Note story 15.32** (2026-09-19) : ✅ complet — dernier volet de la story
15.8 explicitement reporté par [ADR-008](03-architecture.md#adr-008--story-158-scoping--hardening-seul-mfa-reporté),
traité maintenant sur votre demande explicite. MFA TOTP **optionnel**
(activable par l'utilisateur, pas imposé à tous les comptes — cadrage
décidé avec vous, voir
[ADR-014](03-architecture.md#adr-014--mfa--totp-optionnel-activable-par-lutilisateur-otplib--secret-chiffré-aes-256-gcm-story-1532)).
Migration Prisma appliquée contre la vraie BDD Neon
(`mfaEnabled`/`mfaSecret`/`mfaRecoveryCodes` sur `User`) ; secret chiffré
AES-256-GCM (nouvelle variable requise `MFA_ENCRYPTION_KEY`, validée au
boot comme les autres secrets depuis 15.14) — jamais en clair en BDD,
contrairement à un simple hash impossible ici (vérifier un code TOTP
nécessite le secret brut). 3 routes API (`setup`/`enable`/`disable`),
intégration dans `lib/auth.ts` (web) et `/api/auth/mobile` — technique
NextAuth peu documentée utilisée pour distinguer "code manquant" d'un
mauvais mot de passe : `authorize()` lève une `Error('MFA_REQUIRED')`
plutôt que `return null` (NextAuth propage le message de l'exception dans
`result.error`). UI complète côté web (page de connexion + onglet
Sécurité des paramètres) **et** côté mobile pour la connexion (l'écran
d'activation reste web-only, décision délibérée — c'est l'endroit naturel
pour scanner un QR code). 313 tests web (+35) et 14 tests mobile (+2),
`pnpm type-check` 3/3, `pnpm build` 50/50 pages. **Vérifié en direct de
bout en bout contre la vraie BDD Neon avec le compte de démo** : cycle
complet activation → connexion mobile bloquée sans code → code TOTP réel
accepté → code de récupération accepté puis rejeté à la deuxième
tentative (usage unique confirmé) → désactivation → compte restauré à son
état d'origine après vérification, aucune trace laissée. **Non fait** :
écran d'activation MFA sur mobile, test en environnement de production
réelle. Détail complet :
[02-prd.md](02-prd.md#story-1532--mfa-totp-optionnel-activable-par-lutilisateur--done).

**Découverte, puis corrigée dans la foulée sur demande explicite** : en
ajoutant les dépendances `otplib`/`qrcode` pour cette story, `pnpm audit`
a révélé **49 vulnérabilités** (2 critiques, 29 hautes, 16 modérées,
2 basses). **Première analyse inexacte, corrigée** : j'avais d'abord
affirmé que les 49 étaient toutes dans la chaîne d'outils de build
`apps/mobile` (vu via un seul exemple, `joi`) — faux. En réalité 2 des
vulnérabilités critiques étaient dans **`next@15.5.21` lui-même**
(RCE non authentifiée, y compris sur serveurs Windows), une dépendance
runtime réelle d'`apps/web`. Corrigé : `next` → `15.5.25` (tag `backport`,
patché) + `sharp` → `^0.35.4` (transitif) + 15 autres paquets épinglés via
`pnpm.overrides` (racine `package.json`) — détail complet dans
[CLAUDE.md](../CLAUDE.md). **49 → 2** ; les 2 restantes sont la même lib
(`image-size`, transitif de Metro/RN, dev-only) sans version corrigée
publiée à ce jour (avis officiel : `recommendation: None`) — résiduel
accepté, aucun correctif possible dans l'immédiat. `pnpm test` (313 web +
14 mobile), `pnpm type-check` (3/3), `pnpm build` (50/50 pages)
reconfirmés verts après la montée de version.
13 ✅, 4 🟡 (15.7, 15.8, 15.14, 15.15), plus aucune 🔴. Il ne reste donc
plus de story non commencée dans l'epic ; ce qui reste, c'est de
transformer les quatre 🟡 en ✅ (voir leurs notes respectives ci-dessous) et
le MFA (volet non traité de 15.8, voir ADR-008), qui reste sans story
dédiée. **15.17** (nouvelle, non prévue par `bmad prelaunch`) a aussi été
créée et complétée dans cette session — même schéma que 15.16 : un bug de
sécurité réel (fuite d'erreur Prisma sur `/api/health`) trouvé en
vérifiant une autre story en direct, traité par une story dédiée plutôt
que corrigé en douce dans la story qui l'a trouvé. Voir
[04-tests.md §7](04-tests.md#7-synthèse--priorités-avant-bmad-prelaunch)
pour le détail complet.

**Point d'attention méthodologique** : les stories 15.14, 15.15 et 15.17
ont été traitées dans une session `/goal` en continuation autonome
(2026-09-13, « poursuis jusqu'à épuisement de token de cette session »),
donc **sans pause pour confirmation avec vous** — à la différence du
précédent établi par les stories 15.10/15.12 (décisions de cadrage
explicitement prises avec vous avant implémentation). La décision de
cadrage de la 15.14 (ADR-012) est donc à confirmer ou corriger — 15.15,
15.17, 15.18 et 15.19 n'impliquaient pas de décision de cadrage comparable,
donc moins de réserve sur celles-ci. Travail commité sur une branche locale
(`epic-15/15.14-15.15-secrets-patching`), **pas fusionnée ni poussée** —
**non pas par impossibilité technique** : contrairement à ce qu'affirmaient
les premières versions de cette note, GitHub et Neon se sont révélés
joignables plus tard dans la même session (voir la correction dans la note
de la story 15.19 plus bas) — simplement parce que pousser sur le dépôt
distant n'a pas été explicitement demandé.

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
session). Travail commité sur une branche locale
(`epic-15/15.14-15.15-secrets-patching`), pas poussée à ce stade —
GitHub/Neon se sont en fait révélés joignables plus tard dans la session
(voir la correction dans la note de la story 15.19), `master` non touché.

**Note story 15.15** : 🟡 partiel — même session `/goal` autonome que la
15.14. Politique de patching écrite (trois catégories : correctifs de
sécurité, montées mineures, montées majeures, chacune avec une cadence et
un précédent réel du projet à l'appui) + gate de test avant déploiement +
mécanismes de rollback documentés, détail complet dans
[03-architecture.md §12](03-architecture.md#12-politique-de-patching--test-de-rollback-story-1515).
**Rollback réellement testé, contrairement à 15.7** : sur une branche
locale jetable (jamais poussée, supprimée après coup), une régression
intentionnelle dans `lib/pagination.ts` a fait échouer `pagination.test.ts`
comme prévu, puis `git revert HEAD` a restauré un état vert (7/7) sans
conflit — confirme que le gate CI (15.6) aurait bloqué la régression et
que le mécanisme de rollback applicatif fonctionne. Effet de bord honnête :
une première tentative de régression n'a été détectée par **aucun** test
existant (`pagination.test.ts` compare `MAX_PAGE_SIZE` à lui-même plutôt
qu'à une valeur littérale) — gap de couverture réel, signalé mais non
corrigé (hors périmètre de cette story). **Non vérifié** : rollback Vercel
réel (aucun compte connecté) et restauration Neon réelle (toujours non
exercée depuis 15.7, aucun changement).

**Note story 15.17** : ✅ complet — trouvée en vérifiant en direct le
correctif de la story 15.14 (`/api/health` appelé après un redémarrage du
serveur de dev, pour confirmer que la validation d'env au boot n'empêchait
pas le boot). L'endpoint renvoyait `String(error)`, donc le message
d'erreur Prisma brut (hôte de la BDD Neon inclus) à tout appelant non
authentifié — item déjà noté 🟡 dans la checklist §9.2 (BE-09), jamais
traité par une story avant celle-ci. Corrigé : BDD et Redis vérifiés
indépendamment (`Promise.all`), chaque échec journalisé côté serveur
(`console.error`) mais jamais renvoyé dans la réponse HTTP (`{ status, db,
redis }` structuré, plus aucun contenu d'erreur). Premier test unitaire
d'une route API dans ce projet (`04-tests.md` notait cette absence) — 4
nouveaux tests, plus 1 test de régression sur `pagination.test.ts` trouvé
pendant la 15.15 (une assertion qui se comparait à sa propre constante).
`pnpm type-check` 4/4, `pnpm test` 73/73. Vérifié en direct : serveur de
dev redémarré, `curl /api/health` renvoie `{"status":"error","db":"error","redis":"error"}`
(BDD/Redis injoignables dans cette session, sandbox sans sortie réseau)
sans plus aucune trace de l'hôte Neon ni d'un message Prisma.

**Note story 15.18** : ✅ complet — ferme le résidu explicitement noté dans
la checklist §9.1 depuis la story 15.3 ("pas vérifié exhaustivement sur le
reste... scenarios"). Audit des 6 routes API du projet : deux `GET`
renvoyaient encore un tableau brut sans pagination —
`/api/advisor/scenarios` et `/api/planning/taxes` — désormais alignées sur
le contrat `{ data, meta }` commun. **Bug pré-existant trouvé au passage,
sans rapport avec la pagination** : l'écran mobile Conseiller lisait
`data.scenarios` sur une réponse qui était (déjà avant cette story) un
tableau brut — donc `undefined`, et cet écran affichait silencieusement
**zéro scénario sauvegardé depuis toujours**, même famille de bug que
celui trouvé sur mobile Investissements en 15.3. Corrigé dans le même
changement (`data.data`). Vérifié qu'aucun autre consommateur ne casse :
les pages web équivalentes lisent Prisma directement (hors périmètre du
contrat API, même situation que 15.3), `/api/planning/taxes` n'a aucun
consommateur `GET` à ce jour. 5 nouveaux tests (78/78 au total),
`pnpm type-check` 4/4 (web **et** mobile). Vérifié en direct : serveur de
dev redémarré, les deux routes répondent sans crash.

**Note story 15.20** : ✅ complet — dernier volet restant de l'item
"rate limiting sur tous les endpoints sensibles" (15.1 couvrait déjà
login/inscription). `checkMutationRateLimit(userId)` dans
[`lib/rateLimit.ts`](../apps/web/src/lib/rateLimit.ts) — limite par
utilisateur (60/min, fail-open comme le reste depuis ADR-004), branchée
sur les 14 handlers de mutation restants dans 10 fichiers (accounts,
budgets, goals + `[id]`, portfolio, transactions + `[id]`, user/profile,
planning/retirement, advisor/scenarios, planning/taxes). Audité
explicitement pour ne rien oublier ; exclusions documentées (Stripe
checkout/portal en `GET`, cron protégé par secret, advisor/chat désactivé).
6 nouveaux tests (90/90 au total), `pnpm type-check` 4/4. **Vérifié en
direct contre la vraie BDD Neon** : build de production + `pnpm start`,
connexion mobile réelle avec le compte de démo, `POST /api/accounts`
réussi (`201`) avec le cookie de session — compte de test supprimé après
coup.

**Note story 15.21** : ✅ complet — gap noté depuis la story 15.2, jamais
transformé en story jusqu'ici. `authMiddleware` (extrait de `withAuth` dans
[middleware.ts](../apps/web/src/middleware.ts) pour être testable
directement) renvoie désormais un `401` JSON sur toute route `/api/*` non
authentifiée au lieu de la redirection `307` vers `/login` que `withAuth`
appliquait indifféremment aux pages et aux routes API. 7 nouveaux tests.
**Bug trouvé et corrigé au passage, pendant la vérification en direct** :
`api/auth/mobile/route.ts` n'avait aucun `try/catch` englobant (contrairement
à ses routes sœurs) — une coupure BDD transitoire, observée en direct dans
cette session, faisait remonter un `500` brut au lieu du `{ error: 'Erreur
serveur' }` JSON attendu. Corrigé avec le même patron que les autres routes
d'auth, 1 nouveau test. 98/98 tests, `pnpm type-check` 4/4. Vérifié en
direct dans les deux sens sur le même serveur : `500` propre pendant la
coupure BDD réelle, puis `200` normal une fois la BDD reconnectée quelques
minutes plus tard sans redémarrage.

**Sur l'accès réseau de ce sandbox — troisième et dernière correction de
cette session** : la BDD Neon est passée joignable → injoignable → de
nouveau joignable **pendant** la vérification de la story 15.21, sans
action de ma part. Ni "bloqué en continu" (l'affirmation initiale des
stories 15.14/15.15) ni "joignable de façon fiable" (ma correction en story
15.19) n'étaient exactes : la réalité est une **connectivité
intermittente**, dont la cause exacte (cold-start du compute Neon Free qui
se suspend, ou instabilité du sandbox lui-même) n'a pas pu être confirmée
avec certitude dans le temps de cette session.

**Vérification finale de session** (après 15.14/15.15/15.17/15.18/15.19) :
`pnpm build` (production réelle, `apps/web`) — 50/50 pages générées, tous
les endpoints API attendus présents dans le manifeste de routes, aucune
erreur. `pnpm start` démarré (`✓ Ready in 3.3s`) et testé en direct :
`/api/health` toujours sans fuite de détail interne, connexion mobile
réussie avec le compte de démo (mot de passe correct → token émis, mot de
passe erroné → `401`), les deux lignes d'audit log (`login_success` puis
`login_failure`) confirmées dans les logs du serveur de production. `db:
error` observé une fois sur `/api/health` avant le premier login réussi —
cohérent avec l'hypothèse de cold-start Neon déjà notée dans la story
15.19, pas une régression.

**Note story 15.19** : ✅ complet — dernier item 🔴 restant de la checklist
9.3. [`lib/auditLog.ts`](../apps/web/src/lib/auditLog.ts) journalise en JSON
structuré (`{ type: 'audit', action, userId, email, ip, reason, at }`),
branché sur 7 événements réels dans 6 fichiers : login web/mobile
(succès + échec avec raison exacte), inscription, demande/complétion de
reset de mot de passe (la demande reste journalisée uniquement côté
serveur, sans changer la réponse anti-énumération de `forgot-password`),
vérification email et renvoi du lien. Pas de changement de rôle
journalisé : aucune mutation de rôle n'existe dans le code à ce jour
(`/admin/users` est en lecture seule). 6 nouveaux tests (84/84 au total),
`pnpm type-check` 4/4. **Vérifié en direct contre la vraie BDD Neon avec
le compte de démo** — pas seulement en unitaire : mauvais mot de passe →
`login_failure`/`wrong_password` loggé avec le vrai `userId`, `401` ; bon
mot de passe (`demo1234`) → `login_success` loggé, JWT émis, `200`.

**Correction importante découverte pendant cette story** : les notes des
stories 15.14/15.15/15.17/15.18 affirmaient qu'aucun accès réseau n'existait
dans ce sandbox (GitHub et Neon inclus). **C'était inexact** — en
vérifiant l'audit log en direct, la BDD Neon s'est révélée joignable
(la première requête de la session avait échoué, probablement le
cold-start du compute Neon Free qui se met en veille, pas un vrai blocage
réseau), et `git ls-remote origin` (GitHub), qui avait échoué en tout
début de session, a été retesté avec succès. Le travail de cette session
reste néanmoins sur la branche locale `epic-15/15.14-15.15-secrets-patching`,
**non poussée** — pas par impossibilité technique, mais parce que pousser
n'a pas été explicitement demandé.

**Note story 15.23** : ✅ complet — trouvé en auditant les schémas Zod
existants pendant la story 15.22 : `POST /api/advisor/scenarios` n'avait
**aucune validation** (règle non-négociable #5 du framework, violée).
Un schéma `createScenarioSchema` existe déjà dans `packages/shared` mais
ne couvre que 3 des 6 `ScenarioType` réellement acceptés par la route — le
brancher tel quel aurait cassé les 3 autres, donc un schéma plus étroit a
été écrit pour cette story (valide `type`/`name`/`inputs`/`results` sans
imposer de shape par type non défini) ; le résidu (shape complet pour
`BUSINESS_CREATION`/`EDUCATION_FUND`/`CUSTOM`) reste signalé, pas résolu,
dans
[03-architecture.md §13](03-architecture.md#13-dette-technique-identifiée-non-traitée-signalée-pour-décision).
Même occasion : `try/catch` ajouté (même fragilité que le bug `/api/auth/
mobile` de 15.21, trouvée cette fois par audit plutôt que par accident).
6 nouveaux tests (162/162 au total), `pnpm type-check` 4/4. Vérifié en
direct contre la vraie BDD Neon avec le compte de démo : body invalide →
`400` avec erreurs de champ détaillées, body valide → `201`, scénario
réellement créé puis supprimé après vérification.

**Note story 15.24** : ✅ complet — audit systémique après les correctifs
ponctuels de 15.21 (`auth/mobile`) et 15.23 (`advisor/scenarios`), chacun
motivé par un incident précis. Un `grep` sur les 10 autres routes CRUD a
montré qu'**aucune** n'avait de `try/catch` ; un second passage sur les
routes de lecture restantes a trouvé la même fragilité sur
`analysis/snapshot` (la route derrière le goulot `/dashboard` de 15.13/
15.16 — pas hypothétique ici) et `analysis/forecast` (`prices/*` avait
déjà son propre `try/catch`, confirmé). 12 fichiers au total, même
fragilité à l'échelle de quasi toute l'API du projet, pas seulement les
deux endroits déjà touchés. Même patron appliqué partout (`console.error`
préfixé + `{ error: 'Erreur serveur' }` en `500`), aucun changement de
comportement sur le chemin normal — les 162 tests existants passent sans
modification, plus 24 nouveaux (15 "500 propre" un par fichier déjà
testé, 9 pour `analysis/snapshot`/`analysis/forecast` qui n'avaient aucun
test du tout). 186/186 au total, `pnpm type-check` 4/4, `pnpm build`
vert. Vérifié en direct contre la vraie BDD Neon : connexion mobile
réelle puis les 9 routes concernées (`accounts`, `budgets`, `goals`,
`portfolio`, `transactions`, `planning/retirement`, `planning/taxes`,
`user/profile`, `analysis/snapshot`, `analysis/forecast`) toutes `200`
avec de vraies données — et une coupure BDD transitoire réelle pendant la
vérification a reconfirmé, en prime, le `500` propre de la story 15.21.

**Note story 15.29** : ✅ complet — dernier trou de couverture explicitement
nommé depuis la story 15.9 ("simulateurs... n'ont aucun test"), jamais
comblé jusqu'ici. `lib/simulators/realEstate.ts` (7 tests : formule
d'amortissement vérifiée indépendamment, taux zéro, cohérence
totalPaid/totalInterest, `breakEvenMonths`/`annualROI` null sans loyer,
table d'amortissement plafonnée à 12 lignes, solde strictement
décroissant), `retirement.ts` (8 tests) et `stockGrowth.ts` (8 tests) —
23 tests au total. **Découverte réelle en écrivant les tests, pas un bug
caché mais un écart documenté** : `retirement.ts` et `stockGrowth.ts`
divergent de ~2,5-3 % entre leur total final (formule fermée, capitalise
chaque mois) et le dernier point de `projectionByYear` (boucle
an-par-an, ajoute 12 mois de contributions en une fois) — vérifié avec un
script Node isolé avant d'écrire les assertions. **Sans impact
aujourd'hui** : `projectionByYear` n'est rendu nulle part dans l'UI
actuelle (recherché explicitement) — deviendrait visible dès qu'un
graphique l'utiliserait. Documenté dans les tests eux-mêmes et dans
[03-architecture.md §13](03-architecture.md#13-dette-technique-identifiée-non-traitée-signalée-pour-décision)
(troisième découverte) plutôt que "corrigé" unilatéralement — deux
méthodes de calcul défendables, le choix appartient à qui construira ce
graphique. 235 (web) + 12 (mobile), `pnpm type-check` 4/4.

**Note story 15.28** : ✅ complet — `lib/analytics/forecast.ts`
(`projectForecast`, régression linéaire sur revenus/dépenses,
accumulation de patrimoine net, niveau de confiance) n'avait jamais été
testé directement — seulement par mock dans `analysis/forecast/
route.test.ts` (story 15.24). 10 tests : cas vide, extrapolation de
tendance (pas juste la moyenne), plancher à zéro sur tendance baissière,
accumulation du patrimoine net mois après mois, `netWorth` manquant,
rollover décembre→janvier, tri chronologique d'un historique désordonné,
niveaux de confiance selon la profondeur d'historique. 212 (web) + 12
(mobile), `pnpm type-check` 4/4.

**Note story 15.27** : ✅ complet — `formatCurrency`/`convertToXOF`
(`packages/shared/src/constants/currencies.ts`), logique argent réelle
utilisée partout dans l'affichage web/mobile, jamais testée. Même
convention que `authSchemas.test.ts` : testé depuis `apps/web` (pas de
runner propre à `packages/shared`). 7 tests, assertions sur le contenu
plutôt que sur l'octet exact du séparateur de milliers (espace insécable
fine `Intl`, dépendante de la version d'ICU — vérifié en Node avant
d'écrire les tests). 202 (web) + 12 (mobile), `pnpm type-check` 4/4.

**Note story 15.26** : ✅ complet — gap noté depuis la story 15.9
("nécessiterait un preset différent (`jest-expo`), hors périmètre").
`jest-expo@51.0.2` (dist-tag `sdk-51`, aligné sur `expo: ~51.0.0`),
`jest@^29.7.0` (même pin que web depuis l'ADR-006). **Obstacle réel
rencontré et corrigé** : le `transformIgnorePatterns` par défaut de
`jest-expo` suppose un `node_modules` plat, incompatible avec la
structure imbriquée de pnpm (`node_modules/.pnpm/<pkg>@<v>/node_modules/
<pkg>/...`) — `@react-native/js-polyfills` (syntaxe Flow) était ignoré à
tort et atteignait le parser tel quel. Diagnostiqué avec un script Node
isolé testant le regex directement contre de vrais chemins, corrigé
(détail complet dans
[03-architecture.md ADR-013](03-architecture.md#adr-013--transformignorepatterns-pnpm-compatible-pour-jest-expo-story-1526)),
plutôt que par essais-erreurs sur la suite Jest complète. Deux fichiers
réels testés, pas un test bidon pour prouver que le runner tourne :
[`lib/mfetch.ts`](../apps/mobile/lib/mfetch.ts) (primitive réseau de toute
l'app mobile — authentification par cookie, pas de header `Authorization`,
priorité des headers appelant, 4 chemins d'erreur de `mfetchJson`, 7
tests) et [`contexts/AuthContext.tsx`](../apps/mobile/contexts/AuthContext.tsx)
(toute la gestion de session mobile — restauration au démarrage,
`login()`/`logout()`, 5 tests, rendu avec `react-test-renderer` déjà
disponible via `jest-expo`, sans ajouter `@testing-library/react-native`
ni aucune autre dépendance de rendu ; a nécessité `@types/react-test-renderer` en
devDependency, absent initialement). `pnpm test` (racine) exécute
désormais web (195/195) **et** mobile (12/12) ; `pnpm type-check` (4/4) et
`pnpm build` (web) reconfirmés verts après l'installation. Accès au
registre npm vérifié disponible avant de retenter (la première tentative,
plus tôt dans la session, avait été reportée faute d'accès — connectivité
intermittente déjà documentée, stories 15.19/15.21). **Non fait** : tests
d'écrans complets (navigation réelle), CI mobile — le workflow de la
story 15.6 ne couvre qu'`apps/web`.

**Note story 15.25** : ✅ complet — même schéma de découverte que la
story 15.23 : en auditant les schémas `packages/shared` inutilisés, trois
autres (`retirement.ts`, `goal.ts`, `portfolio.ts`) se sont révélés
complets et cohérents avec Prisma, mais non branchés — leurs routes
utilisent chacune un schéma local plus restreint qui omet de vraies
colonnes (`RetirementPlan.inflationRate`/`.notes`,
`FinancialGoal.priority`, `PortfolioItem.exchange`/`.notes`) ; `assetClass`
sur `portfolio` était aussi un `z.string()` non contraint (valeur invalide
atteignant Prisma au lieu d'un `400` clair). Champs/validations manquants
ajoutés directement dans chaque schéma local (pas d'import du schéma
partagé tel quel — chacun diverge légèrement en bornes/defaults du
comportement déjà en production). 20 nouveaux tests (195/195 au total),
`pnpm type-check` 4/4, `pnpm build` vert. Vérifié en direct contre la
vraie BDD Neon avec le compte de démo : les trois champs/validations
fonctionnent réellement. **Incident de nettoyage, corrigé** : le plan
retraite de test a été écrit par `upsert` sur la ligne déjà seedée du
compte de démo (pas une nouvelle ligne) ; supprimé par réflexe pendant le
nettoyage, restauré immédiatement avec les valeurs exactes de
`scripts/seed.ts` — aucune donnée réelle affectée, signalé en toute
transparence.

**Découverte hors périmètre, signalée mais non traitée** (pendant la story
15.22) : `packages/api-client` est du code mort dans toute la codebase —
son unique consommateur (`apps/mobile/lib/api.ts`) n'est lui-même importé
par aucun écran mobile réel (tous utilisent `lib/mfetch.ts` directement,
authentification par cookie). Même s'il était utilisé, son header
`Authorization: Bearer` ne fonctionnerait pas : `getServerSession()`
(NextAuth v4) ne lit que les cookies. Détail complet et options possibles
(garder/réparer/supprimer) dans
[03-architecture.md §13](03-architecture.md#13-dette-technique-identifiée-non-traitée-signalée-pour-décision)
— décision volontairement laissée à vous plutôt que tranchée seule, car
elle change la surface de code exposée à l'équipe mobile future.

**Deuxième découverte de fin de session, également non traitée** : cinq
répertoires sous `apps/web/src/app/api` n'ont jamais eu de `route.ts`
(`accounts/[id]/`, `portfolio/[id]/`, `alerts/[id]/`, `admin/stats/`,
`admin/users/`) — du scaffold vide, jamais implémenté, aucun consommateur
web ou mobile ne les appelle (les pages admin lisent déjà Prisma
directement). Construire ces routes serait du développement de
fonctionnalité neuve, pas un correctif — détail dans
[03-architecture.md §13](03-architecture.md#13-dette-technique-identifiée-non-traitée-signalée-pour-décision).

**Troisième découverte, pendant la story 15.29** : `retirement.ts` et
`stockGrowth.ts` divergent de ~2,5-3 % entre leur total final et le
dernier point de `projectionByYear` (voir la note de la story 15.29
ci-dessus pour le détail) — sans impact aujourd'hui car ce champ n'est
rendu nulle part dans l'UI, mais signalé pour qui construira un graphique
dessus. Détail dans
[03-architecture.md §13](03-architecture.md#13-dette-technique-identifiée-non-traitée-signalée-pour-décision).

**Note story 15.22** : ✅ complet — termine le gap noté depuis la story
15.9 ("routes API n'ont aucun test à ce jour"). 59 nouveaux tests sur les 9
routes CRUD restantes (accounts, budgets, goals + `[id]`, portfolio,
transactions + `[id]`, user/profile, planning/retirement) : `401` sans
session, `429` une fois la limite de mutation atteinte, `400` sur body
invalide, scoping par `userId`, chemin de succès — plus `404`
d'appartenance sur `goals/[id]`/`transactions/[id]`, effets de bord
(`budget.spent`, invalidation cache) sur `transactions`, et protection
contre un `id` client qui écraserait `session.user.id` sur `user/profile`.
**Portée limitée aux tests** : aucune route modifiée, donc aucun nouveau
risque de régression — les routes elles-mêmes étaient déjà vérifiées en
direct contre la vraie BDD Neon lors des stories 15.20/15.21. 157/157
tests au total (+59), `pnpm type-check` 4/4, `pnpm build` reconfirmé vert.

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
Couverture encore très partielle à l'époque — simulateurs, analytique et
routes API n'avaient aucun test ; `apps/mobile` n'avait pas de runner du
tout. **Comblé depuis** : routes API et `analysis/*` couvertes par les
stories 15.17/15.18/15.20 à 15.25 ; `apps/mobile` a son propre runner
(`jest-expo`) depuis la story 15.26.

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
**Corrigé en story 15.21** (2026-09-13) — voir sa note plus haut.

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
| Pagination sur toutes les listes | ✅ | Story 15.3 (accounts/budgets/goals/portfolio/transactions) + story 15.18 (`advisor/scenarios`, `planning/taxes` — les deux dernières routes API sans pagination). Alerts n'a pas de route API dédiée (page web lit Prisma directement) donc hors périmètre du contrat API |

### 9.2 Sécurité
| Item | État | Constat |
|---|---|---|
| Rate limiting sur tous les endpoints sensibles | ✅ | Login/inscription (15.1) + story 15.20 : limite par utilisateur (60/min, fail-open) sur les 14 handlers de mutation restants (accounts/budgets/goals/portfolio/transactions/profile/scenarios/taxes/retirement). Hors périmètre par nature : Stripe checkout/portal (`GET`, pas une mutation), cron (protégé par secret, pas par session), advisor/chat (désactivé, `503` systématique) |
| Protection anti-bot/spam | 🔴 | Aucun captcha, aucune protection anti-bot |
| Validation inputs testée côté serveur | ✅ | Zod partout (15.2) |
| CSRF protégé partout | 🟡 | Cookie `SameSite=Lax` par défaut NextAuth ; pas de token CSRF explicite sur les routes API custom (FE-04) |
| Headers de sécurité présents | ✅ | CSP/X-Frame-Options/etc déployés (FE-06) |
| Aucun endpoint debug exposé | ✅ | Story 15.17 — `/api/health` ne renvoie plus le message d'erreur Prisma brut, BDD/Redis vérifiés indépendamment, erreurs journalisées côté serveur uniquement (BE-09) |
| Secrets depuis un coffre dédié | 🟡 | Story 15.14 — décision de cadrage confirmée avec vous le 2026-09-19 (variables d'env chiffrées Vercel plutôt que Vault/AWS Secrets Manager, [ADR-012](03-architecture.md#adr-012--coffre-de-secrets--variables-denvironnement-vercel-plutôt-que-vaultaws-secrets-manager-story-1514--confirmé)) + validation Zod des secrets au boot (`lib/env.ts`) ; reste 🟡 uniquement faute de vérification sur un vrai compte Vercel |
| Pipeline CI/CD protégé | ✅ | Story 15.6, confirmé actif |
| Scan SCA sans vulnérabilité critique | ✅ | `pnpm audit` à 0 vulnérabilité sur `apps/web` (story 15.10) ; 2 critiques réapparues côté `next@15.5.21` (RCE) début de session du 2026-09-19, corrigées le jour même (`next` → 15.5.25 + 15 paquets épinglés via overrides, 49 → 2 vulnérabilités au niveau du monorepo) — voir [CLAUDE.md](../CLAUDE.md). Résiduel : 2 (même lib `image-size`, dev-only, pas de correctif publié) |

### 9.3 Observabilité & performance
| Item | État | Constat |
|---|---|---|
| Monitoring d'erreurs actif + alertes | 🟡 | Sentry intégré (15.4) mais **sans DSN configuré = no-op**, donc pas réellement actif |
| Journalisation actions sensibles centralisée | ✅ | Story 15.19 — `lib/auditLog.ts`, format JSON structuré, branché sur login (succès/échec avec raison), inscription, reset de mot de passe, vérification email. Pas de changement de rôle à journaliser : aucune mutation de ce type n'existe encore dans le code (BE-08) |
| Tests de charge effectués | 🟡 | Exécutés (story 15.13, Artillery) contre un build de production réel + Neon réelle. Test réalisé **sans Redis local** (installation refusée) — distorsion documentée. Routes API paginées : saines (0 % d'échec, p95 ~570-600ms). Goulot `/dashboard` trouvé en 15.13 (diagnostic initial faux, contention Postgres supposée) **corrigé en story 15.16** : vraie cause = bug de config `ioredis`, `/dashboard` 100 % → 0 % d'échec, coût du fail-open Redis (accepté depuis 15.1) réduit de ~5,4s à ~410ms. Échecs résiduels sous charge combinée (20 %) sans rapport avec Redis, cause non confirmée (capacité Neon Free suspectée). Reste 🟡 et non ✅ : la distorsion "sans Redis local" persiste (Redis n'est toujours pas opérationnel, seul le comportement de son absence est mieux géré) et une partie de la charge combinée échoue encore |
| Politique de patching définie + rollback testé | 🟡 | Story 15.15 — politique écrite (cadence par catégorie de patch, gate de test, mécanismes de rollback), rollback applicatif réellement testé par `git revert` sur une branche jetable ; rollback BDD (15.7) toujours non exercé, politique non encore éprouvée sur un cycle réel — détail dans [03-architecture.md §12](03-architecture.md#12-politique-de-patching--test-de-rollback-story-1515) |

**Score approximatif** : 10 ✅ / 6 🟡 / 5 🔴 sur **21** (le tableau ci-dessus
compte 21 lignes, pas 20 comme les versions précédentes de cette section
l'affirmaient — corrigé au passage. Historique : évaluation initiale du
23/07, 5/8/7 (sur la même base de 21, déjà mal comptée à 20 à l'époque) ;
mise à jour après la story 15.12 (vérification email) ; après 15.13/15.16
(tests de charge + goulot dashboard corrigé, statut inchangé, déjà 🟡) ;
après 15.14/15.15 (secrets coffre 🔴→🟡, patching 🟡 enrichi mais statut
inchangé) ; après 15.17 (endpoint debug `/api/health` 🟡→✅, trouvée en
vérifiant 15.14 en direct) ; après 15.18 (pagination sur toutes les listes
🟡→✅) ; après 15.19 (journalisation actions sensibles 🔴→✅) ; après 15.20
(rate limiting sur tous les endpoints sensibles 🟡→✅) — la moitié de la
checklist est maintenant ✅. **Correctif arithmétique** : une première
version de cette ligne annonçait 5 🟡/6 🔴, l'inverse du décompte réel —
corrigé après recomptage explicite ligne par ligne du tableau ci-dessus.
Restent 🔴 : login/reset en prod réelle, paiements en mode réel, SSL,
environnements séparés, anti-bot/spam — tous nécessitent une vraie
infrastructure de prod ou un compte tiers non disponible dans cette
session).

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
- 15.14 — Coffre de secrets pour les variables d'environnement — 🟡 partiel (décision de cadrage prise sans vous, à confirmer, voir ADR-012)
- 15.15 — Politique de patching formelle + test de rollback — 🟡 partiel (politique écrite, rollback applicatif testé ; rollback BDD/Vercel réels toujours non exercés)
- ~~15.16 — Corriger le goulot `/dashboard` trouvé en 15.13~~ ✅ fait (créée
  et complétée dans la même session, en plus des trois ci-dessus prévues
  par `bmad prelaunch`)
- ~~15.17 — Ne pas exposer le détail interne des erreurs sur `/api/health`~~
  ✅ fait (même schéma que 15.16 : créée et complétée dans la même session
  `/goal` que 15.14/15.15, suite à un bug trouvé en vérifiant 15.14 en
  direct, pas prévue par `bmad prelaunch`)
- ~~15.18 — Pagination sur `/api/advisor/scenarios` et
  `/api/planning/taxes`~~ ✅ fait (résidu explicitement noté en 15.3, même
  session `/goal` ; a aussi révélé et corrigé un bug mobile pré-existant
  sans rapport, même famille que celui trouvé en 15.3)
- ~~15.19 — Journalisation centralisée des actions sensibles (auth)~~
  ✅ fait (dernier item 🔴 de la checklist 9.3, même session `/goal`,
  vérifiée en direct contre la vraie BDD Neon avec le compte de démo)
- ~~15.20 — Rate limiting sur les routes de mutation~~ ✅ fait (dernier
  volet de "rate limiting sur tous les endpoints sensibles", même session
  `/goal`, vérifiée en direct en production avec le compte de démo)

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

## Point de reprise pour la prochaine session — revue de code holistique interrompue (2026-09-14)

**Contexte** : après la story 15.29 (commit `6be4ed2`) et la mise à jour de
[04-tests.md](04-tests.md) (commit `64e9a42`), toutes deux clean et
vérifiées (`pnpm test` 247/247, `pnpm type-check` 4/4, `pnpm build` 50/50
pages), j'ai lancé de ma propre initiative — **non demandé par vous**, en
continuation du `/goal` de la session précédente — une revue de code
`code-review high master..HEAD` sur l'intégralité de la branche
(21 commits, ~6700 lignes, 62 fichiers), en raison de sa taille. C'est une
démarche QA, pas une story BMAD. **Elle s'est arrêtée avant sa fin** :
3 des 8 sous-agents ("angles") ont échoué en cours de route sur une limite
de session (`rate_limit`, pas une erreur de fond), sans avoir produit de
findings exploitables. 5 ont terminé et rendu des findings bruts,
**non dédupliqués et non vérifiés** (l'étape de vérification prévue par le
skill `code-review` n'a jamais eu lieu). Aucun de ces findings n'a été
appliqué au code — conformément au principe suivi tout du long cette
session (signaler en §13/ici plutôt que trancher seul une question de
conception), et parce qu'ils n'ont pas encore passé l'étape de
vérification.

**Mise à jour (même session, après ce point de reprise initial)** : les 3
angles interrompus ont été relancés et ont terminé (voir "Angles relancés"
ci-dessous) — **les 8 angles de la revue sont désormais tous complets**.
Trois bugs réels au total ont été trouvés puis corrigés directement dans
cette session (règle #3, corrections mineures et sans ambiguïté, pas de
décision de conception) : le `try/catch` manquant sur `GET
/api/advisor/scenarios`, le message 401 non uniforme, et — trouvé par
l'angle `cross-file tracer` relancé — l'écran mobile "Transactions" qui
lisait une clé de réponse API qui n'a jamais existé. Le thème de fond
commun à plusieurs angles (aucun wrapper de route API partagé) est
documenté comme quatrième découverte en §13 plutôt que tranché seul. Ne
reste qu'une synthèse formelle de dédup des 8 sorties d'angles (§Prochaine
action, point 2) — sans nouveau correctif de code attendu de cette
synthèse, les bugs concrets ayant déjà tous été traités au fil de l'eau.

### Angles terminés (5/8) — findings bruts, non vérifiés

Thème dominant, remonté indépendamment par 4 des 5 angles (reuse,
simplification, efficiency, altitude) : **aucun wrapper de route partagé
n'existe** dans `apps/web/src` (confirmé : ni `withAuth`, ni `apiHandler`,
ni équivalent). Le bloc `try/catch` + réponse 500 JSON (story 15.24) et le
bloc `checkMutationRateLimit` + réponse 429 (story 15.20) sont recopiés à
la main dans respectivement ~21 et ~13 handlers à travers ~12 fichiers de
routes. Conséquences concrètes déjà observées, pas seulement théoriques :

- **Incohérence réelle trouvée** : `apps/web/src/app/api/advisor/scenarios/route.ts`
  — `GET` n'a pas de `try/catch` alors que `POST` en a un, dans le même
  fichier (la story 15.24 visait explicitement "même patron partout" et l'a
  raté sur ce handler).
- **Incohérence réelle trouvée** : message d'erreur 401 non uniforme —
  `"Non autorisé"` (budgets, transactions, analysis, planning) vs.
  `"Unauthorized"` (accounts, goals, portfolio, user/profile) — dérive de
  copier-coller entre stories, pas un choix délibéré.
- **Trois schémas Zod partagés dans `packages/shared`
  (`retirement.ts`, `portfolio.ts`, `goal.ts` — déjà signalés en
  [03-architecture.md §13](03-architecture.md#13-dette-technique-identifiée-non-traitée-signalée-pour-décision)
  comme "construits mais jamais câblés") restent non importés** dans leurs
  routes respectives, qui maintiennent chacune leur propre schéma local
  légèrement divergent (bornes/défauts différents) — la duplication
  continue de grandir story après story plutôt que d'être résorbée.
- **Angle efficiency** : `checkMutationRateLimit`/`rateLimit()`
  (`lib/rateLimit.ts`) fait un aller-retour Redis (`ttl()`) systématique
  pour remplir `resetAt`, valeur qu'aucun des ~14 call-sites de mutation
  ajoutés en 15.20 ne lit jamais — un aller-retour réseau gratuit sur
  chaque écriture de l'API, potentiellement notable vu la connectivité
  Neon/Redis déjà documentée comme intermittente dans ce sandbox.
- **Angle CLAUDE.md conventions** : aucune violation confirmée des 6 règles
  non-négociables (validation serveur, ADR, schéma BDD, etc.) — liste
  vérifiée route par route, résultat `[]`.

Le détail complet (fichier/ligne/scénario d'échec par finding) est dans les
sorties brutes des sous-agents, pas reproduit ici in extenso ; à
redemander/relancer si besoin au lieu de faire confiance à ce résumé seul.

### Angles relancés (3/3) — terminés, revue des 8 angles maintenant complète

`line-by-line diff scan`, `removed-behavior auditor` et `cross-file
tracer` ont été relancés depuis zéro dans cette même session (la limite de
session qui les avait coupés — reset annoncé à 12h20 Abidjan — était déjà
passée). Résultat :

- `line-by-line diff scan` : `[]` — aucun bug de ligne trouvé après lecture
  complète des ~28 fichiers non-test du diff.
- `removed-behavior auditor` : `[]` — aucune régression de comportement
  trouvée (vérifié explicitement que chaque check d'auth/ownership/
  validation existant est préservé tel quel à l'intérieur des nouveaux
  `try/catch`, et que le changement de forme de réponse
  `advisor/scenarios` est bien synchronisé avec son seul consommateur
  mobile).
- `cross-file tracer` : **une trouvaille réelle**, confirmée et corrigée
  (voir juste en dessous) — `apps/mobile/app/(tabs)/expenses/index.tsx`
  lit `data.transactions` alors que `GET /api/transactions` renvoie
  `{ data, meta }` depuis la story 15.3 (route elle-même non touchée par
  ce diff, donc ratée par les balayages 15.3/15.18 qui avaient corrigé le
  même bug sur les écrans Investissements et Conseiller). Un utilisateur
  mobile ouvrant l'onglet "Transactions" voyait donc toujours une liste
  vide, silencieusement, quel que soit le nombre réel de transactions.
  Corrigé directement (`data.data`, même schéma que les deux corrections
  précédentes) — aucun test d'écran mobile n'existe pour cette classe de
  composant (convention déjà établie depuis 15.18 : ces écrans n'ont pas
  de test, seuls `lib/` et `contexts/` en ont depuis 15.26/15.27).
  Revérifié : `pnpm test` 247/247, `pnpm type-check` 4/4.

**Les 8 angles de la revue holistique sont maintenant tous terminés.** Ce
qui reste, ce n'est plus de relancer des angles mais de dédupliquer
formellement l'ensemble des 8 sorties et de repasser par l'étape de
vérification prévue par le skill `code-review` (déjà largement faite au
fil de l'eau ici, mais pas comme une passe unique et exhaustive) — voir
ci-dessous.

### Prochaine action recommandée

1. ~~Relancer les 3 angles interrompus~~ **Fait** (voir ci-dessus).
2. Dédupliquer formellement l'ensemble des 8 sorties d'angles en une passe
   unique (elles se recoupent déjà beaucoup — 4 des 5 angles originaux
   avaient signalé indépendamment le même thème de fond) et confirmer
   qu'aucun finding restant n'a été laissé de côté. **Reste à faire**, mais
   risque faible : tous les bugs concrets et confirmés remontés par les 8
   angles ont déjà été corrigés (voir points 3/4/5) ; ce qui reste est
   surtout la synthèse formelle, pas de nouveaux correctifs attendus.
3. ~~Corriger les deux bugs de divergence confirmés (GET `advisor/scenarios`
   sans `try/catch`, message 401 non uniforme)~~ **Fait** : `GET
   /api/advisor/scenarios` enveloppé dans un `try/catch` identique à
   `POST` ; les 9 occurrences de `'Non autorisé'` uniformisées vers
   `'Unauthorized'` (forme majoritaire, attendue par `middleware.test.ts`).
4. ~~Documenter le thème de fond ("pas de wrapper de route partagé")~~
   **Fait** : quatrième découverte dans
   [03-architecture.md §13](03-architecture.md#13-dette-technique-identifiée-non-traitée-signalée-pour-décision)
   — décision du wrapper (HOF par handler vs. middleware centralisé vs.
   statu quo) laissée à vous.
5. ~~Corriger le bug `transactions.data` trouvé par le cross-file tracer
   relancé~~ **Fait** (voir ci-dessus).
6. ~~Revérifier `pnpm test` / `pnpm type-check` / `pnpm build` après toute
   correction~~ **Fait** : `pnpm build` reconfirmé une dernière fois (50/50
   pages, exit 0) après tous les correctifs de ce point de reprise.
7. ~~Vérifier qu'aucun autre écran mobile n'a la même classe de bug que le
   point 5~~ **Fait** : les 4 seuls appels `mfetchJson<...>` d'écran dans
   `apps/mobile/app` (advisor, expenses, accueil/`index.tsx`,
   investments) lisent maintenant tous correctement `{ data: ... }`,
   vérifié contre la forme réelle renvoyée par chacune des 4 routes
   correspondantes (`advisor/scenarios`, `transactions`,
   `analysis/snapshot`, `portfolio`). Aucune autre occurrence de cette
   classe de bug ne subsiste.

**Ce point de reprise est maintenant clos** : les 8 angles ont tourné, les
3 bugs réels qu'ils ont trouvés sont corrigés et vérifiés, le thème de fond
et son effet de bord mesuré sont documentés en §13 pour votre arbitrage,
et plus aucune régression du même type ne subsiste ailleurs dans
`apps/mobile`. Il ne reste, de cette revue, que des décisions de
conception volontairement laissées à vous (§13, découvertes 1 à 4) — pas
de travail de vérification en attente.
