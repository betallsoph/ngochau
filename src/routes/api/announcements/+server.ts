import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import db from '$lib/db';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const senderId = url.searchParams.get('senderId');
    const targetType = url.searchParams.get('targetType');
    const targetId = url.searchParams.get('targetId');

    const filter: any = {};
    if (senderId) filter.senderId = senderId;
    if (targetType) filter.targetType = targetType;
    if (targetId) filter.targetId = targetId;

    const announcements = await db.announcement.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' }
    });

    return json(announcements);
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const { senderId, title, content, isImportant, targetType, targetId } = body;

    if (!senderId || !title || !content) {
      return json({ error: 'Missing required announcement fields' }, { status: 400 });
    }

    const ann = await db.announcement.create({
      data: {
        senderId,
        title,
        content,
        isImportant: isImportant || false,
        targetType: targetType || 'ALL',
        targetId: targetId || null
      }
    });

    return json(ann);
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ url }) => {
  try {
    const id = url.searchParams.get('id');

    if (!id) {
      return json({ error: 'Missing announcement ID' }, { status: 400 });
    }

    await db.announcement.delete({
      where: { id }
    });

    return json({ success: true });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
};
