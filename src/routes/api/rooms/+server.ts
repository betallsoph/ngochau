import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import db from '$lib/db';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const propertyId = url.searchParams.get('propertyId');
    const blockId = url.searchParams.get('blockId');
    const tenantId = url.searchParams.get('tenantId');

    const filter: any = {};
    if (propertyId) {
      filter.propertyId = propertyId;
    }
    if (blockId && blockId !== 'all') {
      filter.blockId = blockId;
    }
    if (tenantId) {
      filter.tenantId = tenantId;
    }

    const rooms = await db.room.findMany({
      where: filter,
      include: {
        property: true,
        tenant: {
          include: { user: true }
        },
        services: {
          include: { service: true }
        },
        assets: true,
        meterReadings: {
          orderBy: { month: 'desc' }
        }
      },
      orderBy: { roomNumber: 'asc' }
    });

    return json(rooms);
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const { propertyId, blockId, roomNumber, roomCode, roomType, floor, monthlyRent, area } = body;

    if (!propertyId || !roomNumber || !roomType || !monthlyRent) {
      return json({ error: 'Missing required room fields' }, { status: 400 });
    }

    // Check if room number already exists in this property
    const existing = await db.room.findFirst({
      where: { propertyId, roomNumber }
    });

    if (existing) {
      return json({ error: 'Số phòng này đã tồn tại trong tòa nhà này' }, { status: 400 });
    }

    const room = await db.$transaction(async (tx) => {
      // Create the room
      const r = await tx.room.create({
        data: {
          propertyId,
          blockId: blockId || null,
          roomNumber,
          roomCode: roomCode || null,
          roomType,
          floor: floor ? Number(floor) : null,
          status: 'empty',
          monthlyRent: Number(monthlyRent),
          area: area ? Number(area) : null,
          debtAmount: 0
        }
      });

      // Find landlord's services
      const property = await tx.property.findUnique({
        where: { id: propertyId },
        select: { landlordId: true }
      });

      if (property) {
        const services = await tx.service.findMany({
          where: { landlordId: property.landlordId, isActive: true }
        });

        // Map room to all active services with default rates
        for (const service of services) {
          await tx.roomServiceConfig.create({
            data: {
              roomId: r.id,
              serviceId: service.id,
              customRate: null,
              quantity: 1
            }
          });
        }
      }

      return r;
    });

    const fullRoom = await db.room.findUnique({
      where: { id: room.id },
      include: {
        tenant: { include: { user: true } },
        services: { include: { service: true } },
        assets: true,
        meterReadings: true
      }
    });

    return json(fullRoom);
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
};

export const PUT: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const { id, action, ...data } = body;

    if (!id) {
      return json({ error: 'Missing room ID' }, { status: 400 });
    }

    if (action === 'updateMeters') {
      const { serviceId, month, prevValue, currValue, photoUrl } = data;

      if (!serviceId || !month || currValue === undefined || prevValue === undefined) {
        return json({ error: 'Missing meter reading parameters' }, { status: 400 });
      }

      const existingReading = await db.meterReading.findFirst({
        where: { roomId: id, serviceId, month }
      });

      if (existingReading) {
        await db.meterReading.update({
          where: { id: existingReading.id },
          data: {
            prevValue: Number(prevValue),
            currValue: Number(currValue),
            photoUrl: photoUrl || undefined,
            recordedAt: new Date().toISOString().split('T')[0]
          }
        });
      } else {
        await db.meterReading.create({
          data: {
            roomId: id,
            serviceId,
            month,
            prevValue: Number(prevValue),
            currValue: Number(currValue),
            photoUrl: photoUrl || null,
            recordedAt: new Date().toISOString().split('T')[0]
          }
        });
      }
    } else if (action === 'updateAsset') {
      const { assetId, name, code, status, notes } = data;

      if (!name) {
        return json({ error: 'Missing asset name' }, { status: 400 });
      }

      if (assetId) {
        await db.roomAsset.update({
          where: { id: assetId },
          data: { name, code, status, notes }
        });
      } else {
        await db.roomAsset.create({
          data: { roomId: id, name, code, status, notes }
        });
      }
    } else if (action === 'deleteAsset') {
      const { assetId } = data;
      if (assetId) {
        await db.roomAsset.delete({
          where: { id: assetId }
        });
      }
    } else if (action === 'updateServiceConfig') {
      const { configs } = data; // configs: array of { serviceId, customRate, quantity }
      if (configs && Array.isArray(configs)) {
        for (const config of configs) {
          const existingConfig = await db.roomServiceConfig.findFirst({
            where: { roomId: id, serviceId: config.serviceId }
          });

          if (existingConfig) {
            await db.roomServiceConfig.update({
              where: { id: existingConfig.id },
              data: {
                customRate: config.customRate === '' || config.customRate === null ? null : Number(config.customRate),
                quantity: Number(config.quantity) || 1
              }
            });
          }
        }
      }
    } else if (action === 'checkout') {
      await db.room.update({
        where: { id },
        data: {
          status: 'empty',
          tenantId: null,
          debtAmount: 0
        }
      });
    } else {
      // Standard room update
      const updateData: any = {};
      if (data.roomNumber !== undefined) updateData.roomNumber = data.roomNumber;
      if (data.roomCode !== undefined) updateData.roomCode = data.roomCode;
      if (data.roomType !== undefined) updateData.roomType = data.roomType;
      if (data.floor !== undefined) updateData.floor = Number(data.floor);
      if (data.monthlyRent !== undefined) updateData.monthlyRent = Number(data.monthlyRent);
      if (data.area !== undefined) updateData.area = Number(data.area);
      if (data.status !== undefined) updateData.status = data.status;
      if (data.debtAmount !== undefined) updateData.debtAmount = Number(data.debtAmount);
      if (data.blockId !== undefined) updateData.blockId = data.blockId;

      await db.room.update({
        where: { id },
        data: updateData
      });
    }

    const updatedRoom = await db.room.findUnique({
      where: { id },
      include: {
        tenant: { include: { user: true } },
        services: { include: { service: true } },
        assets: true,
        meterReadings: {
          orderBy: { month: 'desc' }
        }
      }
    });

    return json(updatedRoom);
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ url }) => {
  try {
    const id = url.searchParams.get('id');

    if (!id) {
      return json({ error: 'Missing room ID' }, { status: 400 });
    }

    await db.room.delete({
      where: { id }
    });

    return json({ success: true });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
};
