-- DropForeignKey
ALTER TABLE `designversion` DROP FOREIGN KEY `DesignVersion_designId_fkey`;

-- DropIndex
DROP INDEX `DesignEvent_designId_id_idx` ON `designevent`;

-- DropIndex
DROP INDEX `DesignVersion_designId_createdAt_idx` ON `designversion`;

-- CreateIndex
CREATE INDEX `DesignEvent_designId_id_idx` ON `DesignEvent`(`designId`, `id` DESC);

-- CreateIndex
CREATE INDEX `DesignVersion_designId_createdAt_idx` ON `DesignVersion`(`designId`, `createdAt` DESC);

-- AddForeignKey
ALTER TABLE `DesignVersion` ADD CONSTRAINT `DesignVersion_designId_fkey` FOREIGN KEY (`designId`) REFERENCES `Design`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
