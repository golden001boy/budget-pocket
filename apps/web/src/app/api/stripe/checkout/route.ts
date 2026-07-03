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

  const user = await prisma.user.findUnique({
    where:  { id: session.user.id },
    select: { email: true, name: true },
  });
  if (!user) return NextResponse.redirect(new URL('/dashboard', process.env.NEXTAUTH_URL!));

  const checkoutSession = await stripe.checkout.sessions.create({
    customer_email:      user.email,
    client_reference_id: session.user.id,
    mode:                'subscription',
    line_items:          [{ price: process.env.STRIPE_PRICE_MONTHLY!, quantity: 1 }],
    success_url:         `${process.env.NEXTAUTH_URL}/settings/billing?success=1`,
    cancel_url:          `${process.env.NEXTAUTH_URL}/settings/billing?canceled=1`,
    metadata:            { userId: session.user.id },
  });

  return NextResponse.redirect(checkoutSession.url!);
}
