import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import db from '$lib/db';

export const GET: RequestHandler = async ({ params }) => {
  try {
    const { id } = params;

    if (!id) {
      return json({ error: 'Missing invoice ID' }, { status: 400 });
    }

    const invoice = await db.invoice.findUnique({
      where: { id },
      include: {
        items: true,
        room: {
          include: {
            property: {
              include: {
                landlord: true
              }
            }
          }
        }
      }
    });

    if (!invoice) {
      return json({ error: 'Invoice not found' }, { status: 404 });
    }

    return json(invoice);
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
};

export const PUT: RequestHandler = async ({ params, request }) => {
  try {
    const { id } = params;
    const body = await request.json();
    const { action, paymentProofImage, paidAmount } = body;

    if (!id) {
      return json({ error: 'Missing invoice ID' }, { status: 400 });
    }

    const invoice = await db.invoice.findUnique({
      where: { id },
      include: { room: true }
    });

    if (!invoice) {
      return json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (action === 'confirmPaid') {
      const alreadyPaid = invoice.status === 'paid';
      if (alreadyPaid) {
        return json({ error: 'Invoice is already paid' }, { status: 400 });
      }

      const updated = await db.$transaction(async (tx) => {
        // 1. Update invoice status
        const inv = await tx.invoice.update({
          where: { id },
          data: {
            status: 'paid',
            paidAmount: invoice.totalAmount,
            paidDate: new Date().toISOString().split('T')[0]
          }
        });

        // 2. Reduce the room's outstanding debt
        const outstandingAmount = invoice.totalAmount - invoice.paidAmount;
        await tx.room.update({
          where: { id: invoice.roomId },
          data: {
            status: 'paid', // Mark as paid/clean
            debtAmount: { decrement: outstandingAmount >= 0 ? outstandingAmount : 0 }
          }
        });

        return inv;
      });

      return json(updated);
    } else if (action === 'uploadProof') {
      if (!paymentProofImage) {
        return json({ error: 'Missing payment proof image url' }, { status: 400 });
      }

      const updated = await db.invoice.update({
        where: { id },
        data: {
          paymentProofImage,
          status: 'pending' // Still pending review
        }
      });

      return json(updated);
    } else {
      // Standard update
      const updateData: any = {};
      if (paidAmount !== undefined) {
        updateData.paidAmount = Number(paidAmount);
        if (Number(paidAmount) >= invoice.totalAmount) {
          updateData.status = 'paid';
          updateData.paidDate = new Date().toISOString().split('T')[0];
        }
      }

      const updated = await db.invoice.update({
        where: { id },
        data: updateData
      });

      return json(updated);
    }
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ params }) => {
  try {
    const { id } = params;

    if (!id) {
      return json({ error: 'Missing invoice ID' }, { status: 400 });
    }

    const invoice = await db.invoice.findUnique({
      where: { id }
    });

    if (!invoice) {
      return json({ error: 'Invoice not found' }, { status: 404 });
    }

    await db.$transaction(async (tx) => {
      // Delete invoice
      await tx.invoice.delete({
        where: { id }
      });

      // If pending or unpaid, subtract from room debt
      if (invoice.status !== 'paid') {
        const outstanding = invoice.totalAmount - invoice.paidAmount;
        await tx.room.update({
          where: { id: invoice.roomId },
          data: {
            debtAmount: { decrement: outstanding > 0 ? outstanding : 0 }
          }
        });
      }
    });

    return json({ success: true });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
};
