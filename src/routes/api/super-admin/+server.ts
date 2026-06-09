import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import db from '$lib/db';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const landlords = await db.landlordProfile.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true, isActive: true }
        },
        properties: {
          select: { id: true, name: true, _count: { select: { rooms: true } } }
        }
      },
      orderBy: {
        user: { name: 'asc' }
      }
    });

    return json(landlords);
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
};

export const PUT: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const { landlordId, userId, subscriptionType, isActive, subValidUntil } = body;

    if (!landlordId && !userId) {
      return json({ error: 'Missing landlord ID or user ID' }, { status: 400 });
    }

    const updated = await db.$transaction(async (tx) => {
      let profile = null;
      let user = null;

      if (landlordId) {
        profile = await tx.landlordProfile.update({
          where: { id: landlordId },
          data: {
            subscriptionType,
            subValidUntil: subValidUntil ? new Date(subValidUntil) : undefined
          }
        });
      }

      if (userId && isActive !== undefined) {
        user = await tx.user.update({
          where: { id: userId },
          data: { isActive }
        });
      }

      return { profile, user };
    });

    return json(updated);
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
};
