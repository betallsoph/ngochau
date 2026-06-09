import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import db from '$lib/db';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const landlordId = url.searchParams.get('landlordId');

    if (!landlordId) {
      return json({ error: 'Missing landlord ID' }, { status: 400 });
    }

    const services = await db.service.findMany({
      where: { landlordId },
      orderBy: { name: 'asc' }
    });

    return json(services);
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const { landlordId, name, type, defaultRate, isActive } = body;

    if (!landlordId || !name || !type || defaultRate === undefined) {
      return json({ error: 'Missing required service fields' }, { status: 400 });
    }

    const service = await db.service.create({
      data: {
        landlordId,
        name,
        type, // "METERED" | "FLAT_ROOM" | "FLAT_PERSON" | "FLAT_VEHICLE"
        defaultRate: Number(defaultRate),
        isActive: isActive !== undefined ? isActive : true
      }
    });

    // Automatically register this new service for all existing rooms belonging to this landlord
    const rooms = await db.room.findMany({
      where: {
        property: { landlordId }
      }
    });

    for (const room of rooms) {
      await db.roomServiceConfig.create({
        data: {
          roomId: room.id,
          serviceId: service.id,
          customRate: null,
          quantity: 1
        }
      });
    }

    return json(service);
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
};

export const PUT: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const { id, name, defaultRate, isActive } = body;

    if (!id) {
      return json({ error: 'Missing service ID' }, { status: 400 });
    }

    const updated = await db.service.update({
      where: { id },
      data: {
        name,
        defaultRate: defaultRate !== undefined ? Number(defaultRate) : undefined,
        isActive
      }
    });

    return json(updated);
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ url }) => {
  try {
    const id = url.searchParams.get('id');

    if (!id) {
      return json({ error: 'Missing service ID' }, { status: 400 });
    }

    await db.service.delete({
      where: { id }
    });

    return json({ success: true });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
};
