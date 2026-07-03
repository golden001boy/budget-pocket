/**
 * Seed script — Budget-Pocket demo data
 * Run: pnpm --filter web db:seed
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱  Seeding Budget-Pocket...');

  // ─── 1. Demo user ─────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('demo1234', 10);

  const user = await prisma.user.upsert({
    where:  { email: 'demo@budget-pocket.app' },
    update: {},
    create: {
      email:         'demo@budget-pocket.app',
      passwordHash,
      name:          'Kofi Mensah',
      role:          'PREMIUM',
      currency:      'XOF',
      timezone:      'Africa/Abidjan',
      onboardingDone: true,
    },
  });
  console.log(`  ✅ User: ${user.email}`);

  // ─── 2. Linked accounts ───────────────────────────────────────────────────
  const waveAccount = await prisma.linkedAccount.upsert({
    where:  { id: `${user.id}-wave` },
    update: {},
    create: {
      id:          `${user.id}-wave`,
      userId:      user.id,
      provider:    'WAVE',
      accountName: 'Wave Principal',
      currency:    'XOF',
      balance:     485000,
      syncStatus:  'ACTIVE',
    },
  });

  const mtnAccount = await prisma.linkedAccount.upsert({
    where:  { id: `${user.id}-mtn` },
    update: {},
    create: {
      id:          `${user.id}-mtn`,
      userId:      user.id,
      provider:    'MTN_MONEY',
      accountName: 'MTN MoMo',
      currency:    'XOF',
      balance:     120000,
      syncStatus:  'ACTIVE',
    },
  });
  console.log(`  ✅ Accounts: ${waveAccount.accountName}, ${mtnAccount.accountName}`);

  // ─── 3. 6 months of transactions ──────────────────────────────────────────
  const now = new Date();

  const transactionTemplates = [
    // INCOME
    { type: 'INCOME', category: 'OTHER',         amount: 850000, description: 'Salaire mensuel',         source: 'MANUAL', expenseType: 'FIXED'     },
    { type: 'INCOME', category: 'OTHER',         amount: 120000, description: 'Freelance design',        source: 'WAVE',   expenseType: 'OCCASIONAL' },
    // EXPENSES
    { type: 'EXPENSE', category: 'HOUSING',      amount: 150000, description: 'Loyer appartement',       source: 'MANUAL', expenseType: 'FIXED'     },
    { type: 'EXPENSE', category: 'FOOD',         amount: 95000,  description: 'Courses alimentaires',    source: 'WAVE',   expenseType: 'CURRENT'   },
    { type: 'EXPENSE', category: 'FOOD',         amount: 35000,  description: 'Restaurant',              source: 'WAVE',   expenseType: 'OCCASIONAL' },
    { type: 'EXPENSE', category: 'TRANSPORT',    amount: 40000,  description: 'Carburant',               source: 'MANUAL', expenseType: 'CURRENT'   },
    { type: 'EXPENSE', category: 'TRANSPORT',    amount: 15000,  description: 'Taxi / Moto',             source: 'WAVE',   expenseType: 'CURRENT'   },
    { type: 'EXPENSE', category: 'UTILITIES',    amount: 28000,  description: 'Électricité CIE',         source: 'MANUAL', expenseType: 'FIXED'     },
    { type: 'EXPENSE', category: 'UTILITIES',    amount: 12000,  description: 'Internet / Mobile',       source: 'ORANGE_MONEY', expenseType: 'FIXED' },
    { type: 'EXPENSE', category: 'HEALTH',       amount: 25000,  description: 'Pharmacie',               source: 'MANUAL', expenseType: 'OCCASIONAL' },
    { type: 'EXPENSE', category: 'EDUCATION',    amount: 45000,  description: 'Formation en ligne',      source: 'WAVE',   expenseType: 'OCCASIONAL' },
    { type: 'EXPENSE', category: 'ENTERTAINMENT',amount: 20000,  description: 'Abonnement streaming',    source: 'WAVE',   expenseType: 'FIXED'     },
    { type: 'EXPENSE', category: 'SAVINGS',      amount: 80000,  description: 'Virement épargne',        source: 'MANUAL', expenseType: 'FIXED'     },
    { type: 'EXPENSE', category: 'INVESTMENT',   amount: 50000,  description: 'Achat actions BRVM',      source: 'MANUAL', expenseType: 'OCCASIONAL' },
  ] as const;

  let txCount = 0;
  for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
    const month = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);

    for (const tmpl of transactionTemplates) {
      const day   = Math.floor(Math.random() * 25) + 1;
      const date  = new Date(month.getFullYear(), month.getMonth(), day);
      // slight variation ±10%
      const variance = 0.9 + Math.random() * 0.2;
      const amount = Math.round(tmpl.amount * variance);

      await prisma.transaction.create({
        data: {
          userId:      user.id,
          type:        tmpl.type,
          category:    tmpl.category,
          amount,
          description: tmpl.description,
          date,
          source:      tmpl.source as 'MANUAL' | 'WAVE' | 'MTN_MONEY' | 'ORANGE_MONEY',
          expenseType: tmpl.expenseType,
        },
      });
      txCount++;
    }
  }
  console.log(`  ✅ Transactions: ${txCount} créées (6 mois)`);

  // ─── 3b. Compute & persist MonthlySnapshots ───────────────────────────────
  for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
    const d  = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
    const yr = d.getFullYear();
    const mo = d.getMonth() + 1;

    const startDate = new Date(yr, mo - 1, 1);
    const endDate   = new Date(yr, mo, 0, 23, 59, 59, 999);

    const txs = await prisma.transaction.findMany({
      where: { userId: user.id, date: { gte: startDate, lte: endDate } },
    });

    let totalIncome = 0, totalExpenses = 0;
    const breakdown: Record<string, number> = {};

    for (const tx of txs) {
      const amt = Number(tx.amount);
      if (tx.type === 'INCOME')   totalIncome   += amt;
      if (tx.type === 'EXPENSE') { totalExpenses += amt; breakdown[tx.category] = (breakdown[tx.category] ?? 0) + amt; }
    }

    const totalSavings = totalIncome - totalExpenses;
    const savingsRate  = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;

    await prisma.monthlySnapshot.upsert({
      where:  { userId_year_month: { userId: user.id, year: yr, month: mo } },
      create: { userId: user.id, year: yr, month: mo, totalIncome, totalExpenses, totalSavings, savingsRate, categoryBreakdown: breakdown },
      update: { totalIncome, totalExpenses, totalSavings, savingsRate, categoryBreakdown: breakdown, computedAt: new Date() },
    });
  }
  console.log('  ✅ MonthlySnapshots: 6 mois pré-calculés');

  // ─── 4. Budgets (current month) ───────────────────────────────────────────
  const year  = now.getFullYear();
  const month = now.getMonth() + 1;

  const budgets = [
    { category: 'FOOD',          amount: 130000, alertAt: 80 },
    { category: 'TRANSPORT',     amount: 60000,  alertAt: 80 },
    { category: 'HOUSING',       amount: 150000, alertAt: 95 },
    { category: 'UTILITIES',     amount: 45000,  alertAt: 85 },
    { category: 'ENTERTAINMENT', amount: 30000,  alertAt: 80 },
    { category: 'HEALTH',        amount: 40000,  alertAt: 90 },
  ] as const;

  for (const b of budgets) {
    await prisma.budget.upsert({
      where:  { userId_category_month_year: { userId: user.id, category: b.category, year, month } },
      update: {},
      create: { userId: user.id, ...b, year, month },
    });
  }
  console.log(`  ✅ Budgets: ${budgets.length} pour ${year}/${month}`);

  // ─── 5. Financial goals ───────────────────────────────────────────────────
  await prisma.financialGoal.upsert({
    where:  { id: `${user.id}-goal-emergency` },
    update: {},
    create: {
      id:            `${user.id}-goal-emergency`,
      userId:        user.id,
      name:          'Fonds urgence 6 mois',
      type:          'EMERGENCY_FUND',
      targetAmount:  2400000,
      currentAmount: 850000,
      status:        'ACTIVE',
      deadline:      new Date(now.getFullYear() + 1, 11, 31),
      notes:         'Couvrir 6 mois de dépenses fixes en cas de perte emploi',
    },
  });

  await prisma.financialGoal.upsert({
    where:  { id: `${user.id}-goal-brvm` },
    update: {},
    create: {
      id:            `${user.id}-goal-brvm`,
      userId:        user.id,
      name:          'Portefeuille BRVM 1M FCFA',
      type:          'SAVINGS',
      targetAmount:  1000000,
      currentAmount: 300000,
      status:        'ACTIVE',
      deadline:      new Date(now.getFullYear() + 2, 5, 30),
      notes:         'Investir progressivement 50 000 FCFA/mois en actions BRVM',
    },
  });

  await prisma.financialGoal.upsert({
    where:  { id: `${user.id}-goal-travel` },
    update: {},
    create: {
      id:            `${user.id}-goal-travel`,
      userId:        user.id,
      name:          'Voyage Europe',
      type:          'TRAVEL',
      targetAmount:  800000,
      currentAmount: 120000,
      status:        'ACTIVE',
      deadline:      new Date(now.getFullYear() + 1, 6, 15),
    },
  });
  console.log('  ✅ Financial goals: 3 créés');

  // ─── 6. Portfolio items ───────────────────────────────────────────────────
  await prisma.portfolioItem.upsert({
    where:  { id: `${user.id}-snts` },
    update: {},
    create: {
      id:           `${user.id}-snts`,
      userId:       user.id,
      assetClass:   'STOCK_BRVM',
      name:         'Sonatel',
      ticker:       'SNTS',
      quantity:     10,
      averageCost:  16500,
      currentPrice: 17200,
      purchaseDate: new Date(now.getFullYear(), now.getMonth() - 3, 15),
    },
  });

  await prisma.portfolioItem.upsert({
    where:  { id: `${user.id}-btc` },
    update: {},
    create: {
      id:           `${user.id}-btc`,
      userId:       user.id,
      assetClass:   'CRYPTO',
      name:         'Bitcoin',
      ticker:       'BTC',
      quantity:     0.005,
      averageCost:  55000000, // ~55M XOF/BTC
      currentPrice: 62000000,
      purchaseDate: new Date(now.getFullYear(), now.getMonth() - 5, 3),
    },
  });

  await prisma.portfolioItem.upsert({
    where:  { id: `${user.id}-boab` },
    update: {},
    create: {
      id:           `${user.id}-boab`,
      userId:       user.id,
      assetClass:   'STOCK_BRVM',
      name:         'Bank of Africa Benin',
      ticker:       'BOAB',
      quantity:     25,
      averageCost:  3200,
      currentPrice: 3450,
      purchaseDate: new Date(now.getFullYear(), now.getMonth() - 4, 22),
    },
  });
  console.log('  ✅ Portfolio: 3 positions (SNTS, BTC, BOAB)');

  // ─── 7. Retirement plan ───────────────────────────────────────────────────
  await prisma.retirementPlan.upsert({
    where:  { userId: user.id },
    update: {},
    create: {
      userId:               user.id,
      currentAge:           32,
      targetRetirementAge:  55,
      monthlyContribution:  80000,
      currentSavings:       850000,
      expectedReturnRate:   8,
      targetMonthlyIncome:  500000,
    },
  });
  console.log('  ✅ Retirement plan créé');

  // ─── 8. Recurring rules ───────────────────────────────────────────────────
  await prisma.recurringRule.upsert({
    where:  { id: `${user.id}-loyer` },
    update: {},
    create: {
      id:          `${user.id}-loyer`,
      userId:      user.id,
      name:        'Loyer appartement',
      amount:      150000,
      category:    'HOUSING',
      dayOfMonth:  5,
      startDate:   new Date(now.getFullYear(), now.getMonth() - 5, 5),
      isActive:    true,
      nextRunAt:   new Date(now.getFullYear(), now.getMonth() + 1, 5),
    },
  });

  await prisma.recurringRule.upsert({
    where:  { id: `${user.id}-epargne` },
    update: {},
    create: {
      id:          `${user.id}-epargne`,
      userId:      user.id,
      name:        'Virement épargne',
      amount:      80000,
      category:    'SAVINGS',
      dayOfMonth:  28,
      startDate:   new Date(now.getFullYear(), now.getMonth() - 5, 28),
      isActive:    true,
      nextRunAt:   new Date(now.getFullYear(), now.getMonth() + 1, 28),
    },
  });
  console.log('  ✅ Recurring rules: 2 créées (loyer, épargne)');

  // ─── 9. Alerts ────────────────────────────────────────────────────────────
  await prisma.alert.create({
    data: {
      userId:   user.id,
      type:     'AI_RECOMMENDATION',
      severity: 'INFO',
      title:    'Conseil du jour',
      body:     'Votre taux d\'épargne est de 12,4% ce mois. Augmentez-le à 15% pour atteindre votre objectif retraite à 55 ans.',
      isRead:   false,
    },
  });
  console.log('  ✅ Alert créée');

  console.log('\n🎉  Seed terminé ! Connectez-vous avec :');
  console.log('   Email    : demo@budget-pocket.app');
  console.log('   Mot de passe : demo1234');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
