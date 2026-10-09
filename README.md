# Gestión multiempresa

App web instalable (PWA) para negocios por suscripción. Primera vertical: pastelería. Segunda: seguridad.
Stack: React + Vite, Firebase (Auth, Firestore, Storage, Hosting). Idiomas: español, portugués, inglés.

## Estado: fase 1 (base multiempresa)

Hecho:
- Registro con email confirmado, login y recuperación de contraseña
- Alta de empresa en prueba de 30 días (país, moneda, zona horaria e idioma salen del país)
- Roles: superadmin, dueño, administrador, empleado
- Equipo con invitaciones por email (límite de 10 personas en pastelería; sin límite en seguridad)
- Ajustes de marca: nombre, color, logo (se achica en el celular antes de subirlo), WhatsApp, idioma
- Cobro manual: botones que copian datos de cuenta/Pix y abren WhatsApp para el comprobante
- Panel de superadmin: empresas, estado, registro de pagos y edición manual del plan
- Suscripción: prueba → activa → período de gracia (7 días) → bloqueada
- Reglas de seguridad de Firestore y Storage

Todavía no: catálogo, pedidos, stock, recetas, envíos, importador (fases siguientes).
El catálogo público con botón de WhatsApp necesita un perfil público de la empresa, separado de los datos del plan.

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # genera dist/
```

La configuración de Firebase está en `src/firebase.js`. No es secreta: la protección real son las reglas.

## Puesta en marcha en la consola de Firebase

Hacer una sola vez, en este orden:

1. **Authentication → Método de acceso:** habilitar "Correo electrónico/contraseña".
2. **Authentication → Configuración → Dominios autorizados:** agregar el dominio de Hosting.
3. **Firestore Database:** crear la base en modo producción. La región no se puede cambiar después.
4. **Storage:** ya está creado. Confirmar que la región sea us-central1, us-west1 o us-east1; solo ahí aplica la cuota sin costo.
5. **Presupuesto:** en Google Cloud → Facturación → Presupuestos y alertas, crear uno de USD 10 con avisos al 50%, 90% y 100%. Avisa, pero no corta el gasto.
6. **Publicar las reglas** (ver abajo).
7. **Crear el superadmin:** registrarse en la app con tu email y confirmarlo. En Authentication → Usuarios copiar tu UID. En Firestore crear el documento `usuarios/<tu UID>` con:
   `rol: "superadmin"`, `activo: true`, `nombre: "Tu nombre"`, `email: "tu@email"`, `idioma: "es"`.
   Sin campo `empresaId`. Recargar la app: aparece el panel de empresas.
8. **Datos de cobro:** en la app, pestaña Cobro, cargar tu WhatsApp, cuenta de Uruguay, Banco do Brasil y clave Pix.

## Publicar

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules,storage   # reglas
npm run build && firebase deploy --only hosting   # app
```

Si Firebase pide permisos para que Storage lea Firestore desde las reglas, aceptar.

## Modelo de datos (fase 1)

| Colección | Qué guarda |
| --- | --- |
| `empresas/{id}` | Datos del negocio, plan, estado, fin de prueba y vencimiento |
| `usuarios/{uid}` | Perfil: empresa, rol, nombre, idioma, activo. El superadmin es un perfil con rol `superadmin` |
| `invitaciones/{email}` | Invitación pendiente al equipo (empresa y rol) |
| `plataforma/cobro` | Datos de pago y precios que ven las empresas |
| `pagos/{id}` | Registro de cada pago (solo superadmin) |

Lo que cuelga de una empresa (`empresas/{id}/...`) queda cerrado hasta construir cada módulo.

## Pendiente de verificar

- Las reglas **no se probaron con el emulador** (este entorno bloquea su descarga). Probarlas antes de dar acceso a clientes: emulador local o el simulador de reglas de la consola.
- El límite de 10 personas se aplica en la pantalla, no en las reglas.
- Si el celular tiene la fecha adelantada más de un día, el alta de empresa puede ser rechazada por la regla del fin de prueba.
