import { prisma } from '../prisma';
import { cacheGetOrSet, CACHE_TTL } from '../cache';
import { formatCurrency } from '@budget-pocket/shared';
import type { Currency } from '@budget-pocket/shared';

interface UserFinancialContext {
  userName:         string;
  currency:         Currency;
  avgMonthlyIncome: number;
  avgMonthlyExpenses: number;
  savingsRate:      number;
  portfolioValue:   number;
  activeGoals:      string[];
  netWorth:         number | null;
}

export async function buildUserFinancialContext(userId: string): Promise<UserFinancialContext> {
  const key = `ai:context:${userId}`;

  return cacheGetOrSet(key, async () => {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { name: true, currency: true },
    });

    // Last 3 months of snapshots
    const snapshots = await prisma.monthlySnapshot.findMany({
      where:   { userId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      take:    3,
    });

    const avgMonthlyIncome   = snapshots.length
      ? snapshots.reduce((s, x) => s + Number(x.totalIncome),   0) / snapshots.length
      : 0;
    const avgMonthlyExpenses = snapshots.length
      ? snapshots.reduce((s, x) => s + Number(x.totalExpenses), 0) / snapshots.length
      : 0;
    const savingsRate        = snapshots.length
      ? snapshots.reduce((s, x) => s + Number(x.savingsRate),   0) / snapshots.length
      : 0;

    const portfolio = await prisma.portfolioItem.findMany({
      where: { userId },
      select: { quantity: true, currentPrice: true, averageCost: true },
    });
    const portfolioValue = portfolio.reduce(
      (s, p) => s + Number(p.quantity) * (p.currentPrice ? Number(p.currentPrice) : Number(p.averageCost)),
      0,
    );

    const goals = await prisma.financialGoal.findMany({
      where:  { userId, status: 'ACTIVE' },
      select: { name: true },
      take:   5,
    });

    return {
      userName:          user.name ?? 'Utilisateur',
      currency:          user.currency as Currency,
      avgMonthlyIncome,
      avgMonthlyExpenses,
      savingsRate:       Math.round(savingsRate * 10) / 10,
      portfolioValue:    Math.round(portfolioValue),
      activeGoals:       goals.map(g => g.name),
      netWorth:          snapshots[0]?.netWorth ? Number(snapshots[0].netWorth) : null,
    };
  }, CACHE_TTL.AI_CONTEXT);
}

export function buildSystemPrompt(ctx: UserFinancialContext): string {
  const fmt = (n: number) => formatCurrency(n, ctx.currency);
  return `Tu es Budget-Pocket Assistant, conseiller financier personnel de ${ctx.userName}.

Contexte financier actuel :
- Revenu mensuel moyen : ${fmt(ctx.avgMonthlyIncome)}
- Dépenses mensuelles moyennes : ${fmt(ctx.avgMonthlyExpenses)}
- Taux d'épargne moyen : ${ctx.savingsRate}%
- Valeur du portefeuille d'investissement : ${fmt(ctx.portfolioValue)}
- Objectifs financiers actifs : ${ctx.activeGoals.length > 0 ? ctx.activeGoals.join(', ') : 'aucun pour l\'instant'}
${ctx.netWorth !== null ? `- Patrimoine net estimé : ${fmt(ctx.netWorth)}` : ''}

Instructions :
- Réponds toujours en français
- Adapte tes conseils au contexte économique ouest-africain (FCFA, BRVM, marchés locaux)
- Sois précis, pratique et bienveillant
- Propose des actions concrètes et réalisables
- Mentionne les risques pertinents sans alarmer inutilement
- Ne fournis pas de conseils fiscaux ou juridiques spécifiques — recommande de consulter un professionnel pour ces sujets`;
}
