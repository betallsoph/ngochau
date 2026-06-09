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

    const notes = await db.specialNote.findMany({
      where: filter,
      include: {
        tenant: {
          include: {
            user: {
              select: { name: true, phone: true }
            },
            rooms: {
              select: { roomNumber: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return json(notes);
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const { tenantId, content } = body;

    if (!tenantId || !content) {
      return json({ error: 'Missing tenant ID or content' }, { status: 400 });
    }

    const note = await db.specialNote.create({
      data: {
        tenantId,
        content,
        isRead: false
      }
    });

    return json(note);
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
};

export const PUT: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const { id, isRead } = body;

    if (!id) {
      return json({ error: 'Missing notification/note ID' }, { status: 400 });
    }

    const updated = await db.specialNote.update({
      where: { id },
      data: {
        isRead: isRead !== undefined ? isRead : true
      }
    });

    return json(updated);
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
};
