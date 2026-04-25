-- CreateTable
CREATE TABLE `Alerta` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `empresaId` INTEGER NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `mensaje` VARCHAR(191) NOT NULL,
    `nivel` VARCHAR(191) NOT NULL DEFAULT 'warning',
    `leida` BOOLEAN NOT NULL DEFAULT false,
    `fechaCreada` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Incidencia` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `empresaId` INTEGER NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `descripcion` TEXT NOT NULL,
    `area` VARCHAR(191) NOT NULL,
    `nivel` VARCHAR(191) NOT NULL,
    `estado` VARCHAR(191) NOT NULL DEFAULT 'abierta',
    `fechaCreada` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fechaResuelta` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Visitante` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `empresaId` INTEGER NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `empresaOrigen` VARCHAR(191) NOT NULL,
    `motivo` VARCHAR(191) NOT NULL,
    `acceso` VARCHAR(191) NOT NULL,
    `fechaEntrada` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fechaSalida` DATETIME(3) NULL,
    `estado` VARCHAR(191) NOT NULL DEFAULT 'dentro',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Alerta` ADD CONSTRAINT `Alerta_empresaId_fkey` FOREIGN KEY (`empresaId`) REFERENCES `Empresa`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Incidencia` ADD CONSTRAINT `Incidencia_empresaId_fkey` FOREIGN KEY (`empresaId`) REFERENCES `Empresa`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Visitante` ADD CONSTRAINT `Visitante_empresaId_fkey` FOREIGN KEY (`empresaId`) REFERENCES `Empresa`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
