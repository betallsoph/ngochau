import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import db from '$lib/db';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const landlordId = url.searchParams.get('landlordId');

    if (!landlordId) {
      return json({ error: 'Missing landlord ID' }, { status: 400 });
    }

    // 1. Fetch all properties belonging to landlord
    const properties = await db.property.findMany({
      where: { landlordId },
      select: { id: true }
    });
    const propertyIds = properties.map((p) => p.id);

    // 2. Fetch rooms
    const rooms = await db.room.findMany({
      where: {
        propertyId: { in: propertyIds }
      },
      select: { id: true, status: true }
    });

    const totalRooms = rooms.length;
    const emptyRooms = rooms.filter((r) => r.status === 'empty').length;
    const occupiedRooms = totalRooms - emptyRooms;

    // 3. Fetch unpaid invoices count
    const unpaidInvoicesCount = await db.invoice.count({
      where: {
        room: {
          propertyId: { in: propertyIds }
        },
        status: { in: ['pending', 'overdue', 'partial'] }
      }
    });

    // 4. Calculate total revenue (sum of paidAmount of all invoices)
    const invoices = await db.invoice.findMany({
      where: {
        room: {
          propertyId: { in: propertyIds }
        }
      },
      select: { paidAmount: true }
    });
    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);

    return json({
      totalRevenue,
      emptyRooms,
      unpaidInvoices: unpaidInvoicesCount,
      expiringContracts: 1, // Placeholder
      totalRooms,
      occupiedRooms
    });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
};
