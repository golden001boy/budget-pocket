import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { registerSchema } from '@budget-pocket/shared';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req.headers);
    const limit = await rateLimit(`register:${ip}`, 5, 60 * 60);
    if (!limit.success) {
      return NextResponse.json({ error: 'Trop de tentatives, réessayez plus tard' }, { status: 429 });
    }

    const body = await req.json();
    const data = registerSchema.safeParse(body);
    if (!data.success) {
      return NextResponse.json({ error: 'Données invalides', details: data.error.flatten() }, { status: 400 });
    }

    const { email, password, name, currency } = data.data;

    const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (exists) {
      return NextResponse.json({ error: 'Un compte avec cet email existe déjà' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email:        email.toLowerCase().trim(),
        passwordHash,
        name:         name?.trim(),
        currency:     currency as any,
      },
      select: { id: true, email: true, name: true, role: true },
    });

    return NextResponse.json({ data: user }, { status: 201 });
  } catch (error) {
    console.error('[register]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
