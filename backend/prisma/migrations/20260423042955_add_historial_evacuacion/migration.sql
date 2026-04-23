-- CreateTable
CREATE TABLE `HistorialEvacuacion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `empresaId` INTEGER NOT NULL,
    `fechaInicio` DATETIME(3) NOT NULL,
    `fechaFin` DATETIME(3) NOT NULL,
    `duracionSegundos` INTEGER NOT NULL,
    `totalEnPlanta` INTEGER NOT NULL,
    `totalEvacuados` INTEGER NOT NULL,
    `brigadistas` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `HistorialEvacuacion` ADD CONSTRAINT `HistorialEvacuacion_empresaId_fkey` FOREIGN KEY (`empresaId`) REFERENCES `Empresa`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
