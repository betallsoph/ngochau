CREATE TABLE `Announcement` (
	`id` text PRIMARY KEY NOT NULL,
	`senderId` text NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`isImportant` integer DEFAULT false NOT NULL,
	`targetType` text NOT NULL,
	`targetId` text,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Block` (
	`id` text PRIMARY KEY NOT NULL,
	`propertyId` text NOT NULL,
	`name` text NOT NULL,
	FOREIGN KEY (`propertyId`) REFERENCES `Property`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `InvoiceItem` (
	`id` text PRIMARY KEY NOT NULL,
	`invoiceId` text NOT NULL,
	`name` text NOT NULL,
	`amount` real NOT NULL,
	`details` text,
	FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `Invoice` (
	`id` text PRIMARY KEY NOT NULL,
	`roomId` text NOT NULL,
	`roomNumber` text NOT NULL,
	`tenantName` text NOT NULL,
	`tenantPhone` text NOT NULL,
	`month` text NOT NULL,
	`rentAmount` real NOT NULL,
	`totalAmount` real NOT NULL,
	`dueDate` text NOT NULL,
	`paidDate` text,
	`status` text NOT NULL,
	`paidAmount` real DEFAULT 0 NOT NULL,
	`paymentProofImage` text,
	`createdAt` text NOT NULL,
	`notes` text,
	FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `LandlordProfile` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`subscriptionType` text DEFAULT 'FREE' NOT NULL,
	`subValidUntil` integer,
	`companyName` text,
	`bankName` text DEFAULT 'Vietcombank' NOT NULL,
	`bankCode` text DEFAULT 'VCB' NOT NULL,
	`accountNumber` text DEFAULT '1234567890' NOT NULL,
	`accountName` text DEFAULT 'NGUYEN VAN HAU' NOT NULL,
	`bankBranch` text DEFAULT 'Chi nhánh TP.HCM' NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `LandlordProfile_userId_unique` ON `LandlordProfile` (`userId`);--> statement-breakpoint
CREATE TABLE `MaintenanceRequest` (
	`id` text PRIMARY KEY NOT NULL,
	`tenantId` text NOT NULL,
	`roomNumber` text NOT NULL,
	`buildingName` text NOT NULL,
	`category` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`imageUrl` text,
	`status` text NOT NULL,
	`priority` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`response` text,
	`assignedToId` text,
	FOREIGN KEY (`tenantId`) REFERENCES `TenantProfile`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`assignedToId`) REFERENCES `StaffProfile`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `Message` (
	`id` text PRIMARY KEY NOT NULL,
	`conversationId` text NOT NULL,
	`senderId` text NOT NULL,
	`content` text NOT NULL,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `MeterReading` (
	`id` text PRIMARY KEY NOT NULL,
	`roomId` text NOT NULL,
	`serviceId` text NOT NULL,
	`month` text NOT NULL,
	`prevValue` real NOT NULL,
	`currValue` real NOT NULL,
	`recordedAt` text NOT NULL,
	`photoUrl` text,
	FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `Property` (
	`id` text PRIMARY KEY NOT NULL,
	`landlordId` text NOT NULL,
	`name` text NOT NULL,
	`shortName` text NOT NULL,
	`address` text NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`landlordId`) REFERENCES `LandlordProfile`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `RoomAsset` (
	`id` text PRIMARY KEY NOT NULL,
	`roomId` text NOT NULL,
	`name` text NOT NULL,
	`code` text,
	`status` text NOT NULL,
	`imageUrl` text,
	`notes` text,
	FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `RoomServiceConfig` (
	`id` text PRIMARY KEY NOT NULL,
	`roomId` text NOT NULL,
	`serviceId` text NOT NULL,
	`customRate` real,
	`quantity` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `Room` (
	`id` text PRIMARY KEY NOT NULL,
	`propertyId` text NOT NULL,
	`blockId` text,
	`roomNumber` text NOT NULL,
	`roomCode` text,
	`roomType` text NOT NULL,
	`floor` integer,
	`status` text NOT NULL,
	`monthlyRent` real NOT NULL,
	`area` real,
	`debtAmount` real DEFAULT 0,
	`tenantId` text,
	FOREIGN KEY (`propertyId`) REFERENCES `Property`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`blockId`) REFERENCES `Block`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`tenantId`) REFERENCES `TenantProfile`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `Service` (
	`id` text PRIMARY KEY NOT NULL,
	`landlordId` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`defaultRate` real NOT NULL,
	`isActive` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`landlordId`) REFERENCES `LandlordProfile`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `SpecialNote` (
	`id` text PRIMARY KEY NOT NULL,
	`tenantId` text NOT NULL,
	`content` text NOT NULL,
	`isRead` integer DEFAULT false NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`tenantId`) REFERENCES `TenantProfile`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `StaffProfile` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`landlordId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`landlordId`) REFERENCES `LandlordProfile`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `StaffProfile_userId_unique` ON `StaffProfile` (`userId`);--> statement-breakpoint
CREATE TABLE `TenantProfile` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`idNumber` text NOT NULL,
	`idFrontImage` text,
	`idBackImage` text,
	`vehicleImage` text,
	`checkInImage` text,
	`moveInDate` text NOT NULL,
	`deposit` real NOT NULL,
	`notes` text,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `TenantProfile_userId_unique` ON `TenantProfile` (`userId`);--> statement-breakpoint
CREATE TABLE `User` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`passwordHash` text NOT NULL,
	`name` text NOT NULL,
	`avatar` text,
	`role` text DEFAULT 'TENANT' NOT NULL,
	`isActive` integer DEFAULT true NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `User_email_unique` ON `User` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `User_phone_unique` ON `User` (`phone`);