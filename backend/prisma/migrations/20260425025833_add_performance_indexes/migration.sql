-- CreateIndex
CREATE INDEX `Empleado_empresaId_estadoActual_activo_idx` ON `Empleado`(`empresaId`, `estadoActual`, `activo`);

-- CreateIndex
CREATE INDEX `Empleado_empresaId_activo_idx` ON `Empleado`(`empresaId`, `activo`);

-- CreateIndex
CREATE INDEX `Registro_fechaHora_idx` ON `Registro`(`fechaHora`);

-- RenameIndex
ALTER TABLE `Registro` RENAME INDEX `Registro_empleadoId_fkey` TO `Registro_empleadoId_idx`;
