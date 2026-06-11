CREATE TABLE `Contract` (
	`id` text PRIMARY KEY NOT NULL,
	`tenantId` text NOT NULL,
	`roomId` text NOT NULL,
	`startDate` text NOT NULL,
	`endDate` text NOT NULL,
	`monthlyRent` real NOT NULL,
	`deposit` real DEFAULT 0 NOT NULL,
	`fileUrl` text,
	`status` text DEFAULT 'active' NOT NULL,
	`notes` text,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`tenantId`) REFERENCES `TenantProfile`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `Expense` (
	`id` text PRIMARY KEY NOT NULL,
	`landlordId` text NOT NULL,
	`propertyId` text,
	`category` text NOT NULL,
	`description` text NOT NULL,
	`amount` real NOT NULL,
	`date` text NOT NULL,
	`notes` text,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`landlordId`) REFERENCES `LandlordProfile`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`propertyId`) REFERENCES `Property`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
ALTER TABLE `Invoice` ADD `paymentMethod` text;--> statement-breakpoint
ALTER TABLE `LandlordProfile` ADD `momoNumber` text;--> statement-breakpoint
ALTER TABLE `MeterReading` ADD `status` text DEFAULT 'approved' NOT NULL;--> statement-breakpoint
ALTER TABLE `MeterReading` ADD `submittedBy` text DEFAULT 'LANDLORD' NOT NULL;--> statement-breakpoint
ALTER TABLE `MeterReading` ADD `isAnomalous` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `SpecialNote` ADD `sender` text DEFAULT 'TENANT' NOT NULL;