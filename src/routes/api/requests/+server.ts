import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import db from '$lib/db';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const landlordId = url.searchParams.get('landlordId');
    const tenantId = url.searchParams.get('tenantId');

    const filter: any = {};

    if (landlordId) {
      filter.tenant = {
        rooms: {
          some: {
            property: { landlordId }
          }
        }
      };
    } else if (tenantId) {
      filter.tenantId = tenantId;
    }

    const requests = await db.maintenanceRequest.findMany({
      where: filter,
      include: {
        tenant: {
          include: {
            user: {
              select: { name: true, phone: true }
            }
          }
        },
        assignedTo: {
          include: {
            user: {
              select: { name: true, phone: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return json(requests);
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const { tenantId, roomNumber, buildingName, category, title, description, imageUrl, priority } = body;

    if (!tenantId || !roomNumber || !buildingName || !category || !title || !description) {
      return json({ error: 'Missing required maintenance request fields' }, { status: 400 });
    }

    const req = await db.maintenanceRequest.create({
      data: {
        tenantId,
        roomNumber,
        buildingName,
        category,
        title,
        description,
        imageUrl,
        priority: priority || 'normal',
        status: 'pending'
      }
    });

    return json(req);
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
};

export const PUT: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const { id, status, response, assignedToId } = body;

    if (!id) {
      return json({ error: 'Missing maintenance request ID' }, { status: 400 });
    }

    const updated = await db.maintenanceRequest.update({
      where: { id },
      data: {
        status,
        response,
        assignedToId
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
      return json({ error: 'Missing maintenance request ID' }, { status: 400 });
    }

    await db.maintenanceRequest.delete({
      where: { id }
    });

    return json({ success: true });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
};
