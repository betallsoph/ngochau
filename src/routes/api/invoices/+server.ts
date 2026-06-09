import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import db from '$lib/db';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const landlordId = url.searchParams.get('landlordId');
    const tenantId = url.searchParams.get('tenantId');
    const roomId = url.searchParams.get('roomId');
    const status = url.searchParams.get('status');

    const filter: any = {};

    if (landlordId) {
      filter.room = {
        property: { landlordId }
      };
    } else if (tenantId) {
      filter.room = {
        tenantId
      };
    } else if (roomId) {
      filter.roomId = roomId;
    }

    if (status) {
      filter.status = status;
    }

    const invoices = await db.invoice.findMany({
      where: filter,
      include: {
        items: true,
        room: {
          include: {
            property: true,
            block: true
          }
        }
      },
      orderBy: [
        { month: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return json(invoices);
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const { roomId, month, rentAmount, dueDate, items, notes } = body;

    if (!roomId || !month || rentAmount === undefined || !dueDate || !items || !Array.isArray(items)) {
      return json({ error: 'Missing required invoice parameters' }, { status: 400 });
    }

    // Fetch room & active tenant
    const room = await db.room.findUnique({
      where: { id: roomId },
      include: {
        tenant: { include: { user: true } }
      }
    });

    if (!room) {
      return json({ error: 'Room not found' }, { status: 404 });
    }

    if (!room.tenant) {
      return json({ error: 'Room has no active tenant' }, { status: 400 });
    }

    const tenantName = room.tenant.user.name;
    const tenantPhone = room.tenant.user.phone;

    // Calculate total amount from items
    const totalAmount = items.reduce((sum: number, item: any) => sum + Number(item.amount), 0);

    // Generate Invoice ID
    const randomHex = Math.floor(1000 + Math.random() * 9000).toString();
    const invoiceId = `INV-${month.replace('-', '')}-${randomHex}`;

    const invoice = await db.$transaction(async (tx) => {
      // 1. Create Invoice
      const inv = await tx.invoice.create({
        data: {
          id: invoiceId,
          roomId,
          roomNumber: room.roomNumber,
          tenantName,
          tenantPhone,
          month,
          rentAmount: Number(rentAmount),
          totalAmount,
          dueDate,
          status: 'pending',
          paidAmount: 0,
          createdAt: new Date().toISOString().split('T')[0],
          notes
        }
      });

      // 2. Create Invoice Items
      for (const item of items) {
        await tx.invoiceItem.create({
          data: {
            invoiceId: inv.id,
            name: item.name,
            amount: Number(item.amount),
            details: item.details
          }
        });
      }

      // 3. Update room status to debt (since invoice is pending payment)
      await tx.room.update({
        where: { id: roomId },
        data: {
          status: 'debt',
          debtAmount: { increment: totalAmount }
        }
      });

      return inv;
    });

    const fullInvoice = await db.invoice.findUnique({
      where: { id: invoice.id },
      include: { items: true }
    });

    return json(fullInvoice);
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
};
