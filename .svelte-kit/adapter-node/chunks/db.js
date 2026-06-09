import { PrismaClient } from "@prisma/client";
//#region src/lib/db.ts
var prismaClientSingleton = () => {
	return new PrismaClient();
};
var db = globalThis.prismaGlobal ?? prismaClientSingleton();
if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = db;
//#endregion
export { db as t };
