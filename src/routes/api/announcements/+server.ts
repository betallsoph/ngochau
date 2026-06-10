import { json } from '@sveltejs/kit';
import { errorMessage } from '$lib/server/api';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { announcements } from '$lib/server/db/schema';
import { and, desc, eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const senderId = url.searchParams.get('senderId');
		const targetType = url.searchParams.get('targetType');
		const targetId = url.searchParams.get('targetId');

		const conditions = [];
		if (senderId) conditions.push(eq(announcements.senderId, senderId));
		if (targetType) conditions.push(eq(announcements.targetType, targetType));
		if (targetId) conditions.push(eq(announcements.targetId, targetId));

		const result = await db
			.select()
			.from(announcements)
			.where(conditions.length > 0 ? and(...conditions) : undefined)
			.orderBy(desc(announcements.createdAt));

		return json(result);
	} catch (error) {
		return json({ error: errorMessage(error) }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { senderId, title, content, isImportant, targetType, targetId } = body;

		if (!senderId || !title || !content) {
			return json({ error: 'Missing required announcement fields' }, { status: 400 });
		}

		const created = await db
			.insert(announcements)
			.values({
				senderId,
				title,
				content,
				isImportant: isImportant || false,
				targetType: targetType || 'ALL',
				targetId: targetId || null
			})
			.returning();

		return json(created[0]);
	} catch (error) {
		return json({ error: errorMessage(error) }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ url }) => {
	try {
		const id = url.searchParams.get('id');

		if (!id) {
			return json({ error: 'Missing announcement ID' }, { status: 400 });
		}

		await db.delete(announcements).where(eq(announcements.id, id));

		return json({ success: true });
	} catch (error) {
		return json({ error: errorMessage(error) }, { status: 500 });
	}
};
