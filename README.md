# Gestión multiempresa

App web instalable (PWA) para negocios por suscripción. Primera vertical: pastelería. Segunda: seguridad.
Stack: React + Vite, Firebase (Auth, Firestore, Storage, Hosting). Idiomas: español, portugués, inglés.

## Estado

**Base multiempresa (fase 1)**
- Registro con email confirmado, login y recuperación de contraseña
- Alta de empresa en prueba de 30 días (país, moneda, zona horaria e idioma salen del país)
- Roles: superadmin, dueño, administrador, empleado
- Equipo con invitaciones por email (límite de 10 personas en pastelería; sin límite en seguridad)
- Ajustes de marca: nombre, color, logo, WhatsApp, idioma
- Cobro manual: botones que copian datos de cuenta/Pix y abren WhatsApp (uno por país) para el comprobante
- Panel de superadmin: empresas, estado, registro de pagos y edición manual del plan
- Suscripción: prueba → activa → período de gracia (7 días) → bloqueada

**Pastelería (fase 2)**
- **Productos** con foto, categoría, precio, visibilidad en el catálogo y **receta embebida** (insumos, rendimiento, otros costos). Muestra costo por unidad y margen.
- **Stock** de insumos: precio de compra, stock, mínimo, alertas de faltante; entradas y salidas rápidas. El equipo ajusta cantidades; solo dueño/admin editan precios.
- **Pedidos** con número correlativo, cliente, ítems, fecha de entrega, retiro o envío, descuento, seña y saldo, notas. Estados: nuevo → confirmado → preparación → listo → entregado (o cancelado).
  Al pasar a *preparación* se descuentan los insumos de las recetas (avisa si falta stock); si se cancela o vuelve atrás, se devuelven.
- **Entregas**: agenda por día, dirección con enlace a mapa, cobro del saldo, repartidor, resultado del envío (cobrado vs. costo real).
- **Zonas de envío**: tarifa al cliente y costo real del traslado.
- **Clientes**: ficha, WhatsApp, dirección, notas.
- **Catálogo público** en `/c/<id de la empresa>`: sin cuenta, con carrito que arma el pedido y lo manda por WhatsApp. Es una copia mínima (nombre, logo, WhatsApp, productos visibles): nunca lleva recetas, costos ni stock. La actualiza sola el dueño o administrador al cambiar productos o datos.
- **Importador** de productos, insumos y clientes desde Excel (.xlsx) o CSV, con vista previa, detección de columnas en es/pt/en y plantilla descargable.
- **Inicio** con pedidos de hoy, por cobrar, stock bajo, próximos pedidos y ventas/ganancia estimada del mes (solo dueño/admin).

**Legal**
- Términos y Condiciones (38 cláusulas) y Política de Privacidad (15), en es/pt/en, en `/terminos` y `/privacidad` (se leen sin cuenta).
- Casilla de aceptación obligatoria al crear empresa o unirse a un equipo. Se guarda la versión y la fecha en el perfil (`terminosVersion`, `terminosEn`).
- Si se cambia `TERMINOS_VERSION` en `src/legal/index.js`, todas las personas deben aceptar de nuevo al entrar.
- **Antes de vender, que los revise un abogado de cada país.** Datos a confirmar en `src/legal/index.js`: titular (hoy "Carlos Fontans"), ley aplicable y foro (hoy Uruguay/Montevideo). También conviene completar domicilio y datos de contacto, y revisar si hay que registrar la base de datos ante la autoridad de cada país.

Todavía no: seguridad (turnos, rondas, incidentes), facturación automática, exportación completa de datos, importar chats de WhatsApp.

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
4. **Storage:** confirmar que la región sea us-central1, us-west1 o us-east1; solo ahí aplica la cuota sin costo.
5. **Presupuesto:** en Google Cloud → Facturación → Presupuestos y alertas, crear uno de USD 10 con avisos al 50%, 90% y 100%. Avisa, pero no corta el gasto.
6. **Publicar las reglas** (ver abajo). **Cada vez que cambie `firestore.rules` hay que volver a publicarlas.**
7. **Crear el superadmin:** registrarse en la app con tu email y confirmarlo. En Authentication → Usuarios copiar tu UID. En Firestore crear el documento `usuarios/<tu UID>` con:
   `rol: "superadmin"`, `activo: true`, `nombre: "Tu nombre"`, `email: "tu@email"`, `idioma: "es"`.
   Sin campo `empresaId`. Recargar la app: aparece el panel de empresas.
8. **Datos de cobro:** en la app, pestaña Cobro, cargar un WhatsApp por país, la cuenta de Uruguay, Banco do Brasil y la clave Pix.

## Publicar

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules,storage   # reglas
npm run build && firebase deploy --only hosting   # app
```

Si Firebase pide permisos para que Storage lea Firestore desde las reglas, aceptar.
También se pueden pegar los archivos `firestore.rules` y `storage.rules` en la pestaña Reglas de la consola.

## Modelo de datos

| Colección | Qué guarda |
| --- | --- |
| `empresas/{id}` | Datos del negocio, plan, estado, fin de prueba y vencimiento |
| `empresas/{id}/productos` | Productos con precio, visibilidad, foto y receta |
| `empresas/{id}/insumos` | Insumos con precio de compra, stock y mínimo (unidades base: g, ml, un) |
| `empresas/{id}/clientes` | Clientes finales cargados por el equipo |
| `empresas/{id}/pedidos` | Pedidos con ítems (precio y costo al momento), estado, entrega, cobros |
| `empresas/{id}/zonas` | Zonas de envío (tarifa y costo real) |
| `empresas/{id}/config/pedidos` | Contador del número de pedido |
| `catalogos/{id}` | Copia pública y mínima del catálogo (la lee cualquiera) |
| `usuarios/{uid}` | Perfil: empresa, rol, nombre, idioma, activo, versión de términos aceptada |
| `invitaciones/{email}` | Invitación pendiente al equipo (empresa y rol) |
| `plataforma/cobro` | Datos de pago y precios que ven las empresas |
| `pagos/{id}` | Registro de cada pago (solo superadmin) |

Los pedidos se cargan solo de los últimos 45 días (y los futuros) para cuidar las lecturas.

## Pendiente de verificar

- Las reglas **no se probaron con el emulador** (este entorno bloquea su descarga). Probarlas antes de dar acceso a clientes: emulador local o el simulador de reglas de la consola.
- Lo que se probó con simulaciones: cálculo de costos, descuento y devolución de stock, numeración de pedidos, importador y armado del catálogo. No se probó contra el proyecto real de Firebase.
- El límite de 10 personas se aplica en la pantalla, no en las reglas.
- Los costos de recetas son técnicamente legibles por todo el equipo de la empresa (las reglas no ocultan campos); la pantalla se los oculta a los empleados.
- Si el celular tiene la fecha adelantada más de un día, el alta de empresa puede ser rechazada por la regla del fin de prueba.
- Si una empresa se bloquea por falta de pago, las reglas todavía no le impiden escribir datos: el bloqueo es de la pantalla.
