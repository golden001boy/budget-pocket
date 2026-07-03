import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

export async function GET() {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-02-24.acacia' });
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.redirect(new URL('/login', process.env.NEXTAUTH_URL!));

  const sub = await prisma.subscription.findFirst({
    where:   { userId: session.user.id, status: 'ACTIVE' },
    orderBy: { startedAt: 'desc' },
  });

  if (!sub?.stripeId) {
    return NextResponse.redirect(new URL('/settings', process.env.NEXTAUTH_URL!));
  }

  // Retrieve the Stripe subscription to get the customer ID
  const stripeSub  = await stripe.subscriptions.retrieve(sub.stripeId);
  const customerId = stripeSub.customer as string;

  const portalSession = await stripe.billingPortal.sessions.create({
    customer:   customerId,
    return_url: `${process.env.NEXTAUTH_URL}/settings`,
  });

  return NextResponse.redirect(portalSession.url);
}
