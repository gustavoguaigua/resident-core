# RESIDENT Core — Data Governance v0.2

## 1. Información
Ruta: `docs/sdd/data-governance.md`  
Versión: 0.2  
Cambio: identidad técnica en Keycloak y datos de negocio en Core.

## 2. Propósito
Garantizar datos correctos, seguros, trazables, auditables, separados por tenant y aptos para reportes, automatizaciones e IA controlada.

## 3. Principios
Datos como activos críticos, tenant como frontera primaria, trazabilidad antes que eliminación, minimización, privacidad por diseño y separación identidad/negocio.

## 4. Clasificación
Públicos, internos, confidenciales y restringidos. Restringidos: cédulas, pagos, deudas, comprobantes, banco, tokens, secretos y backups.

## 5. Identidad técnica
Keycloak será fuente objetivo para credenciales, contraseñas, sesiones, refresh tokens, MFA, recuperación, federación y eventos técnicos de login.

## 6. UserProfile local
```text
UserProfile
├── id
├── keycloakSubjectId
├── externalSubjectId
├── authProvider
├── email
├── displayName
├── status
└── timestamps
```

## 7. Datos de negocio en Core
Tenants, configuración, memberships, roles funcionales, permisos, residentes, propietarios, unidades, cargos, pagos, comprobantes, conciliación, multas, reservas, reuniones, auditoría y reportes.

## 8. Datos financieros
Cargos, pagos, saldos, comprobantes, movimientos, conciliaciones, ajustes y reportes. No sobrescribir historia; usar eventos, ajustes o reversos.

## 9. Responsabilidades
Plataforma define políticas. Tenant asegura uso legítimo. Equipo técnico implementa controles. Admins Keycloak gestionan realm, clients, MFA, backups y actualizaciones.

## 10. Ciclo de vida
Recolección, validación, almacenamiento, uso, actualización, consulta, exportación, archivo, retención, eliminación lógica/anonimización/conservación.

## 11. Multitenancy
Single DB + shared schema + tenant_id. Índices, constraints, jobs, eventos, logs y storage consideran tenant.

## 12. Finanzas y auditoría
Saldos se reconstruyen desde cargos, pagos, aplicaciones, ajustes, reversos y moras. Auditar roles, permisos, perfiles, memberships, configuración financiera, tenants, unidades, pagos, reversos, conciliaciones, exportaciones y accesos sensibles.

## 13. Retención y backups
Finanzas y auditoría: conservación prolongada. Logs: 90-180 días. Exportaciones temporales: 7-30 días. Respaldar Core DB, archivos, configuración, auditoría, Keycloak DB y realm export cuando sea viable.

## 14. Ambientes, migraciones e IA
No datos reales en no productivo sin anonimización. Migraciones preservan UserProfile, keycloakSubjectId y memberships. IA solo con datos ficticios/anonimizados salvo evaluación formal.

## 15. Integraciones
WordPress solo datos públicos. n8n datos mínimos por API. Keycloak gestiona identidad; Core conserva keycloakSubjectId, perfil local, membership, roles, permisos y auditoría.

## 16. Derechos e incidentes
Preparar acceso, rectificación, actualización, eliminación cuando proceda, oposición, suspensión y portabilidad. Exposición entre tenants es incidente crítico.

## 17. Conclusión
Keycloak será fuente objetivo de identidad; Core conserva datos de negocio, tenants, memberships, permisos funcionales, auditoría y reglas financieras.
