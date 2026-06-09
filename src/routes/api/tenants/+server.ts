import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import db from '$lib/db';
import crypto from 'crypto';

function hashPassword(password: string) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export const GET: RequestHandler = async ({ url }) => {
  try {
    const landlordId = url.searchParams.get('landlordId');

    if (!landlordId) {
      return json({ error: 'Missing landlord ID' }, { status: 400 });
    }

    const tenants = await db.tenantProfile.findMany({
      where: {
        rooms: {
          some: {
            property: { landlordId }
          }
        }
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true }
        },
        rooms: {
          include: {
            property: true,
            block: true
          }
        }
      },
      orderBy: {
        user: { name: 'asc' }
      }
    });

    return json(tenants);
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const {
      email,
      phone,
      password,
      name,
      roomId,
      idNumber,
      moveInDate,
      deposit,
      notes,
      initialElectricity,
      initialWater
    } = body;

    if (!email || !phone || !password || !name || !roomId || !idNumber || !moveInDate || deposit === undefined) {
      return json({ error: 'Thiếu thông tin khách thuê bắt buộc' }, { status: 400 });
    }

    // 1. Check if user already exists
    let user = await db.user.findFirst({
      where: {
        OR: [{ email }, { phone }]
      }
    });

    const tenant = await db.$transaction(async (tx) => {
      if (!user) {
        user = await tx.user.create({
          data: {
            email,
            phone,
            passwordHash: hashPassword(password),
            name,
            role: 'TENANT'
          }
        });
      }

      // 2. Check if TenantProfile exists
      let tenantProfile = await tx.tenantProfile.findUnique({
        where: { userId: user.id }
      });

      if (!tenantProfile) {
        tenantProfile = await tx.tenantProfile.create({
          data: {
            userId: user.id,
            idNumber,
            moveInDate,
            deposit: Number(deposit),
            notes
          }
        });
      } else {
        // Update details if profile already exists
        tenantProfile = await tx.tenantProfile.update({
          where: { id: tenantProfile.id },
          data: {
            idNumber,
            moveInDate,
            deposit: Number(deposit),
            notes
          }
        });
      }

      // 3. Link room to tenant
      const room = await tx.room.update({
        where: { id: roomId },
        data: {
          tenantId: tenantProfile.id,
          status: 'paid', // Mark as active/paid initially
          debtAmount: 0
        },
        include: {
          property: true
        }
      });

      // 4. Record initial meters
      const checkInMonth = moveInDate.slice(0, 7); // "YYYY-MM"
      
      // Find electricity & water services for the landlord
      const electricityService = await tx.service.findFirst({
        where: { landlordId: room.property.landlordId, name: { contains: 'Điện' } }
      });
      const waterService = await tx.service.findFirst({
        where: { landlordId: room.property.landlordId, name: { contains: 'Nước' } }
      });

      if (electricityService && initialElectricity !== undefined) {
        await tx.meterReading.create({
          data: {
            roomId: room.id,
            serviceId: electricityService.id,
            month: checkInMonth,
            prevValue: Number(initialElectricity),
            currValue: Number(initialElectricity),
            recordedAt: new Date().toISOString().split('T')[0]
          }
        });
      }

      if (waterService && initialWater !== undefined) {
        await tx.meterReading.create({
          data: {
            roomId: room.id,
            serviceId: waterService.id,
            month: checkInMonth,
            prevValue: Number(initialWater),
            currValue: Number(initialWater),
            recordedAt: new Date().toISOString().split('T')[0]
          }
        });
      }

      return tenantProfile;
    });

    const fullTenant = await db.tenantProfile.findUnique({
      where: { id: tenant.id },
      include: {
        user: true,
        rooms: {
          include: { property: true }
        }
      }
    });

    return json(fullTenant);
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
};

export const PUT: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const { id, idNumber, idFrontImage, idBackImage, vehicleImage, checkInImage } = body;

    if (!id) {
      return json({ error: 'Missing tenant profile ID' }, { status: 400 });
    }

    const updated = await db.tenantProfile.update({
      where: { id },
      data: {
        idNumber: idNumber !== undefined ? idNumber : undefined,
        idFrontImage: idFrontImage !== undefined ? idFrontImage : undefined,
        idBackImage: idBackImage !== undefined ? idBackImage : undefined,
        vehicleImage: vehicleImage !== undefined ? vehicleImage : undefined,
        checkInImage: checkInImage !== undefined ? checkInImage : undefined
      },
      include: {
        user: true,
        rooms: {
          include: { property: true }
        }
      }
    });

    return json(updated);
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
};
