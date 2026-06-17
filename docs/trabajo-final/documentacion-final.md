# Documentacion final - App Despensa SAYMON

## 1. Datos del proyecto

- **Nombre:** App Despensa SAYMON
- **Curso:** Desarrollo de Aplicaciones Web con Inteligencia Artificial
- **Tipo de entrega:** Trabajo Final Integrador
- **Repositorio:** https://github.com/FrancoSimon/app-despensa-saymon
- **Aplicacion desplegada:** https://app-despensa-saymon-l9sa.vercel.app/
- **Integrante/s:** Completar
- **Fecha de defensa:** Completar

## 2. Resumen ejecutivo

App Despensa SAYMON es una aplicacion web para organizar la operatoria diaria de un comercio de despensa. El sistema centraliza ventas de mostrador, control de caja, stock, productos, pedidos mayoristas, cuentas corrientes, usuarios y reportes administrativos.

La solucion nace de una necesidad concreta: reducir registros manuales dispersos, mejorar la trazabilidad de ventas y stock, y dar a cada tipo de usuario una pantalla adecuada para su trabajo. Un vendedor necesita vender rapido y cerrar caja; un mayorista necesita armar pedidos de forma simple; un administrador necesita controlar productos, usuarios, pedidos, stock y reportes.

## 3. Problema detectado

En un comercio minorista/mayorista chico o mediano, muchas operaciones suelen resolverse con herramientas separadas: cuadernos para cuentas corrientes, planillas para stock, mensajes para pedidos, calculadora para descuentos y controles manuales de caja. Esto genera errores de carga, poca visibilidad del estado real del negocio y dificultad para reconstruir movimientos anteriores.

El problema principal es la falta de un flujo integrado entre venta, stock, caja, clientes y pedidos. Cuando una venta se registra en un lugar y el stock se actualiza en otro, el comercio pierde informacion confiable para tomar decisiones.

## 4. Usuarios destinatarios

- **Administrador:** gestiona productos, usuarios, stock, pedidos mayoristas, cuentas corrientes, ventas, cajas y reportes.
- **Vendedor:** opera el punto de venta de mostrador, registra ventas, cobra con distintos medios de pago, genera tickets internos y controla su caja.
- **Mayorista:** ingresa al catalogo mayorista, arma pedidos, ve precios aplicables por cantidad y consulta el estado de sus pedidos.

## 5. Objetivo de la solucion

Construir una aplicacion web funcional que permita registrar y consultar las operaciones principales del comercio desde una interfaz navegable, con datos persistentes, reglas de negocio claras, automatizaciones relevantes y control de acceso por rol.

## 6. Alcance implementado

### Autenticacion y roles

La aplicacion usa Supabase Auth para login con email y password. Cada usuario tiene un perfil de aplicacion con rol `admin`, `vendedor` o `mayorista`. Las rutas protegidas redirigen a login cuando no hay sesion y restringen acciones segun el rol.

### Administracion

El panel administrador muestra indicadores de ventas del dia, efectivo, cajas, diferencias de caja, stock bajo y pedidos mayoristas pendientes. Desde este panel se accede a productos, usuarios, ventas, cajas, cuentas corrientes, pedidos, stock y reportes.

### Productos y stock

Los productos incluyen nombre, categoria, codigo de barras opcional, precio de mostrador, precio mayorista fijo, precio mayorista especial, cantidad especial, stock, stock minimo, imagen, estado activo y habilitacion mayorista. El administrador puede crear, editar, desactivar, subir imagenes y consultar productos con stock bajo.

El stock se actualiza mediante ventas, confirmacion/cancelacion de pedidos mayoristas y movimientos manuales. Las operaciones sensibles se resuelven en backend con validaciones y RPCs para evitar inconsistencias.

### Punto de venta

El vendedor cuenta con un POS para buscar productos por nombre, categoria o codigo de barras, usar camara para escanear, armar carrito, modificar cantidades, aplicar descuento o recargo, elegir medio de pago y confirmar la venta. Para pagos en efectivo, el sistema calcula el vuelto; para cuenta corriente, exige cliente activo.

La venta descuenta stock cuando hay disponibilidad suficiente, queda asociada a caja abierta y permite generar un ticket interno imprimible o guardable como PDF. El ticket se declara como comprobante interno sin validez fiscal.

### Caja

El vendedor debe abrir caja antes de confirmar ventas. El sistema registra apertura, ventas asociadas, efectivo esperado, cierre y diferencias. El administrador puede revisar cajas y detalles por periodo.

### Pedidos mayoristas

El usuario mayorista ve un catalogo con productos habilitados para mayorista, filtra por categoria, busca productos y arma un pedido. El precio se recalcula segun cantidad: si se alcanza la cantidad especial configurada y existe precio especial, se aplica automaticamente.

Los pedidos se crean como `pendiente` y no descuentan stock hasta que un administrador los confirma. La fecha de entrega se limita a sabados y se valida tambien en backend.

### Gestion administrativa de pedidos

El administrador puede confirmar, rechazar, entregar o cancelar pedidos mayoristas. La confirmacion verifica stock disponible antes de descontar. El rechazo no impacta stock. La cancelacion de pedidos confirmados restaura stock y registra el movimiento.

### Cuentas corrientes

El sistema permite vender a cuenta corriente, registrar deuda del cliente, cargar pagos parciales y consultar movimientos con saldo. Los pagos tienen recibo interno y las ventas asociadas a cuenta corriente quedan separadas de los totales de caja.

### Reportes

El panel de reportes resume ventas, cajas, stock bajo, pedidos y cuentas corrientes por rango de fechas. Incluye exportaciones CSV para informacion operativa como ventas por dia, productos mas vendidos y stock bajo.

## 7. Logica de negocio destacada

- Una venta de mostrador solo se confirma si hay caja abierta.
- El stock se verifica antes de descontar productos.
- Las ventas de cuenta corriente requieren cliente seleccionado.
- Los descuentos y recargos se calculan en orden: subtotal, descuento, recargo y total.
- El pago en efectivo exige monto recibido suficiente y calcula vuelto.
- Los pedidos mayoristas no descuentan stock al crearse, solo al confirmarse.
- Las entregas mayoristas disponibles se restringen a sabados con regla de corte semanal.
- Los productos inactivos conservan historial para ventas, pedidos y reportes.
- Las contrasenas no se guardan en tablas propias; quedan administradas por Supabase Auth.
- Las acciones criticas usan confirmaciones dentro de la interfaz.

## 8. Manejo de datos

La persistencia se implementa con Supabase PostgreSQL. Las principales entidades son:

- `profiles`: perfil de aplicacion y rol asociado al usuario de Supabase Auth.
- `productos`: catalogo, precios, stock, imagen y configuracion mayorista.
- `ventas` y `venta_items`: ventas de mostrador y sus productos.
- `pedidos_mayoristas` y `pedido_mayorista_items`: pedidos B2B y detalle.
- `cash_register_shifts`: cajas abiertas/cerradas y totales asociados.
- `stock_movements`: historial de movimientos manuales y automaticos.
- `customers` y movimientos de cuenta corriente: clientes, debitos y pagos.
- `suppliers` y compras/lotes de stock: proveedores y abastecimiento.

El proyecto usa migraciones SQL en `supabase/migrations/` y politicas de seguridad para separar permisos por rol.

## 9. Integraciones y automatizaciones

- **Supabase Auth:** autenticacion y gestion segura de credenciales.
- **Supabase PostgreSQL:** base de datos relacional con reglas, constraints, RLS y RPCs.
- **Supabase Storage:** carga y publicacion de imagenes de productos.
- **html5-qrcode:** lectura de codigos de barras con camara en el POS.
- **Generacion/impresion de tickets internos:** flujo de ticket imprimible o guardable desde la aplicacion.
- **Exportacion CSV:** reportes descargables para analisis externo.

## 10. Interfaz y experiencia de usuario

La interfaz esta organizada por rol. El inicio presenta un unico acceso por login y luego redirige al panel correspondiente. El administrador trabaja con modulos; el vendedor ingresa directo al mostrador; el mayorista accede a su portal de pedidos.

Se priorizo una experiencia compacta y operativa: busquedas rapidas, atajos de teclado, carritos con scroll, confirmaciones antes de acciones criticas, mensajes de error claros y tablas filtrables. La aplicacion esta construida con componentes React y estilos Tailwind.

## 11. Arquitectura tecnica

La aplicacion usa Next.js con App Router bajo `app/`. La logica de dominio se organiza en `lib/` por modulos: `auth`, `products`, `sales`, `cash`, `wholesale`, `reports`, `stock`, `customers`, `accounts` y `users`.

Los componentes reutilizables estan en `components/`, por ejemplo:

- `components/pos/pos-terminal.tsx`
- `components/pos/barcode-scanner.tsx`
- `components/wholesale/wholesale-order-terminal.tsx`
- `components/layout/app-shell.tsx`
- `components/reports/csv-export-button.tsx`
- `components/ui/confirm-dialog.tsx`

La configuracion de Supabase se centraliza en `lib/supabase/` y las operaciones sensibles se ejecutan desde acciones de servidor o RPCs de base de datos.

## 12. Uso de inteligencia artificial

La IA se uso como copiloto de desarrollo para:

- Transformar una necesidad comercial en alcance funcional.
- Ordenar requisitos por roles y flujos.
- Diseñar propuestas incrementales mediante OpenSpec.
- Generar y revisar componentes, acciones de servidor, consultas y migraciones.
- Detectar inconsistencias de permisos, stock y caja.
- Mejorar textos, navegacion, validaciones y documentacion.

El uso de IA no reemplazo el criterio del desarrollador: las decisiones se contrastaron con el objetivo del comercio, las restricciones tecnicas y pruebas manuales. Los limites principales fueron la necesidad de validar codigo generado, ajustar detalles de Next.js 16 y revisar reglas de negocio donde un error podia afectar stock, ventas o caja.

Ver detalle en [registro-uso-ia.md](registro-uso-ia.md).

## 13. Pruebas y verificacion

La verificacion del proyecto debe incluir:

- Login con usuarios de cada rol.
- Redireccion y bloqueo de rutas segun permisos.
- Alta/edicion de productos.
- Venta de mostrador con caja abierta.
- Bloqueo de venta sin caja abierta.
- Venta con stock insuficiente.
- Ticket interno de venta.
- Venta a cuenta corriente y movimiento de deuda.
- Pago parcial de cuenta corriente.
- Pedido mayorista pendiente.
- Confirmacion de pedido con stock suficiente.
- Rechazo/cancelacion sin impacto indebido.
- Reportes y exportaciones CSV.
- Ejecucion de `npm run lint` y `npm run build`.

## 14. Despliegue

- **Plataforma de despliegue:** Vercel.
- **URL publica:** https://app-despensa-saymon-l9sa.vercel.app/
- **Variables de entorno configuradas:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- **Base Supabase:** migraciones aplicadas y primer usuario admin creado.
- **Datos demo:** productos, clientes, usuarios y pedidos suficientes para la defensa.

Verificacion realizada: la URL publica responde `200 OK`.

## 15. Capturas sugeridas

Las capturas estan disponibles en [capturas.md](capturas.md) y en la carpeta `docs/trabajo-final/capturas/`.

- Pantalla de inicio/login.
- Panel administrador con indicadores.
- Gestion de productos.
- Stock y movimientos.
- POS de vendedor con carrito.
- Ticket interno de venta.
- Apertura/cierre de caja.
- Portal mayorista con carrito.
- Detalle de pedido mayorista.
- Administracion de pedidos mayoristas.
- Cuentas corrientes.
- Reportes.

## 16. Mejoras futuras

- Dashboard grafico mas completo con evolucion semanal/mensual.
- Notificaciones automaticas para pedidos mayoristas y stock bajo.
- Integracion con impresora termica.
- Importacion masiva de productos por CSV.
- Historial de auditoria por usuario para acciones criticas.
- Modo offline parcial para mostrador.
- Facturacion fiscal si el comercio decide integrarse con servicios oficiales.

## 17. Conclusiones

El proyecto cumple el objetivo de convertir una necesidad real en una solucion web funcional, navegable y defendible. La aplicacion integra interfaz, logica de negocio, datos persistentes, autenticacion, roles, automatizaciones y documentacion de proceso. Su valor principal es que conecta areas clave del comercio en un mismo flujo: vender, descontar stock, controlar caja, gestionar deuda, recibir pedidos y analizar resultados.
