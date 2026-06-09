import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import db from '$lib/db';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const landlordId = url.searchParams.get('landlordId');

    if (!landlordId) {
      return json({ error: 'Missing landlord ID' }, { status: 400 });
    }

    const landlordProfile = await db.landlordProfile.findUnique({
      where: { id: landlordId },
      include: {
        user: {
          select: { name: true, email: true, phone: true }
        }
      }
    });

    if (!landlordProfile) {
      return json({ error: 'Landlord profile not found' }, { status: 404 });
    }

    return json(landlordProfile);
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
};

export const PUT: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const { landlordId, companyName, bankName, bankCode, accountNumber, accountName, bankBranch } = body;

    if (!landlordId) {
      return json({ error: 'Missing landlord ID' }, { status: 400 });
    }

    const updatedProfile = await db.landlordProfile.update({
      where: { id: landlordId },
      data: {
        companyName,
        bankName,
        bankCode,
        accountNumber,
        accountName: accountName ? accountName.toUpperCase() : undefined,
        bankBranch
      }
    });

    return json(updatedProfile);
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
};
