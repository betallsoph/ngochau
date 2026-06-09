import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import db from '$lib/db';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const landlordId = url.searchParams.get('landlordId');

    if (!landlordId) {
      return json({ error: 'Missing landlord ID' }, { status: 400 });
    }

    const properties = await db.property.findMany({
      where: { landlordId },
      include: {
        blocks: true,
        rooms: {
          select: { id: true, roomNumber: true, status: true, roomType: true, monthlyRent: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    return json(properties);
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const { landlordId, name, shortName, address, blocks } = body;

    if (!landlordId || !name || !shortName || !address) {
      return json({ error: 'Missing required property fields' }, { status: 400 });
    }

    const property = await db.$transaction(async (tx) => {
      // Create property
      const prop = await tx.property.create({
        data: {
          landlordId,
          name,
          shortName,
          address
        }
      });

      // Create initial blocks if specified
      if (blocks && Array.isArray(blocks) && blocks.length > 0) {
        for (const blockName of blocks) {
          if (blockName.trim()) {
            await tx.block.create({
              data: {
                propertyId: prop.id,
                name: blockName.trim()
              }
            });
          }
        }
      }

      return prop;
    });

    const fullProperty = await db.property.findUnique({
      where: { id: property.id },
      include: {
        blocks: true,
        rooms: true
      }
    });

    return json(fullProperty);
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
};

export const PUT: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const { id, name, shortName, address, blocks } = body;

    if (!id) {
      return json({ error: 'Missing property ID' }, { status: 400 });
    }

    const property = await db.$transaction(async (tx) => {
      // Update property details
      const prop = await tx.property.update({
        where: { id },
        data: {
          name,
          shortName,
          address
        }
      });

      // Synchronize blocks (add new ones, keep existing ones)
      if (blocks && Array.isArray(blocks)) {
        const existingBlocks = await tx.block.findMany({
          where: { propertyId: id }
        });
        const existingNames = existingBlocks.map((b) => b.name);

        for (const blockName of blocks) {
          const trimmed = blockName.trim();
          if (trimmed && !existingNames.includes(trimmed)) {
            await tx.block.create({
              data: {
                propertyId: id,
                name: trimmed
              }
            });
          }
        }
      }

      return prop;
    });

    const fullProperty = await db.property.findUnique({
      where: { id: property.id },
      include: {
        blocks: true,
        rooms: true
      }
    });

    return json(fullProperty);
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ url }) => {
  try {
    const id = url.searchParams.get('id');

    if (!id) {
      return json({ error: 'Missing property ID' }, { status: 400 });
    }

    await db.property.delete({
      where: { id }
    });

    return json({ success: true });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
};
