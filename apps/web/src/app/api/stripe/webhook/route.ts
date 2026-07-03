import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const stripe    = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-02-24.acacia' });
  const body      = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    // Checkout completed → link subscription to user via client_reference_id
    case 'checkout.session.completed': {
      const cs     = event.data.object as Stripe.Checkout.Session;
      const userId = cs.client_reference_id ?? cs.metadata?.userId;
      if (!userId || !cs.subscription) break;

      const stripeSubId = cs.subscription as string;
      const stripeSub   = await stripe.subscriptions.retrieve(stripeSubId);
      const isActive    = stripeSub.status === 'active' || stripeSub.status === 'trialing';

      await prisma.$transaction([
        prisma.user.update({
          where: { id: userId },
          data:  { role: isActive ? 'PREMIUM' : 'FREE' },
        }),
        prisma.subscription.upsert({
          where:  { stripeId: stripeSubId },
          create: {
            userId,
            stripeId:  stripeSubId,
            plan:      stripeSub.items.data[0]?.price.id ?? 'monthly',
            status:    stripeSub.status.toUpperCase(),
            startedAt: new Date(stripeSub.start_date * 1000),
            expiresAt: stripeSub.current_period_end
              ? new Date(stripeSub.current_period_end * 1000)
              : null,
          },
          update: {
            status:    stripeSub.status.toUpperCase(),
            expiresAt: stripeSub.current_period_end
              ? new Date(stripeSub.current_period_end * 1000)
              : null,
          },
        }),
      ]);
      break;
    }

    // Subscription updated (renewal, plan change, etc.)
    case 'customer.subscription.updated': {
      const sub       = event.data.object as Stripe.Subscription;
      const existing  = await prisma.subscription.findUnique({ where: { stripeId: sub.id } });
      if (!existing) break;

      const isActive = sub.status === 'active' || sub.status === 'trialing';
      await prisma.$transaction([
        prisma.user.update({
          where: { id: existing.userId },
          data:  { role: isActive ? 'PREMIUM' : 'FREE' },
        }),
        prisma.subscription.update({
          where: { stripeId: sub.id },
          data:  {
            status:    sub.status.toUpperCase(),
            expiresAt: sub.current_period_end
              ? new Date(sub.current_period_end * 1000)
              : null,
          },
        }),
      ]);
      break;
    }

    // Subscription cancelled
    case 'customer.subscription.deleted': {
      const sub      = event.data.object as Stripe.Subscription;
      const existing = await prisma.subscription.findUnique({ where: { stripeId: sub.id } });
      if (!existing) break;

      await prisma.$transaction([
        prisma.user.update({
          where: { id: existing.userId },
          data:  { role: 'FREE' },
        }),
        prisma.subscription.update({
          where: { stripeId: sub.id },
          data:  { status: 'CANCELLED' },
        }),
      ]);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
