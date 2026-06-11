# Guion de defensa

## Duracion sugerida

Entre 7 y 10 minutos de exposicion, mas preguntas.

## 1. Apertura

Hola, voy a presentar **App Despensa SAYMON**, una aplicacion web desarrollada para organizar la operatoria diaria de un comercio de despensa.

El problema que busque resolver es que muchas tareas del comercio suelen quedar repartidas entre cuadernos, planillas, mensajes y controles manuales. Eso dificulta saber que stock queda, cuanto se vendio, que pedidos estan pendientes, que clientes deben y como cerro la caja.

## 2. Problema y usuarios

La aplicacion tiene tres tipos de usuarios:

- El administrador, que necesita controlar el negocio.
- El vendedor, que necesita vender rapido en mostrador.
- El mayorista, que necesita cargar pedidos y consultar su estado.

La idea fue que cada rol tenga una pantalla pensada para su tarea, pero que todas las operaciones impacten en los mismos datos.

## 3. Solucion implementada

La solucion integra:

- Login y permisos por rol con Supabase Auth.
- Panel de administracion con indicadores.
- Gestion de productos, precios, imagenes y stock.
- Punto de venta con carrito, descuentos, recargos, medios de pago, scanner de codigo de barras, cuenta corriente y ticket interno.
- Apertura y cierre de caja.
- Portal mayorista con precios especiales por cantidad y pedidos pendientes.
- Gestion administrativa de pedidos con control de stock.
- Cuentas corrientes y pagos parciales.
- Reportes y exportaciones CSV.

## 4. Demo sugerida

### Paso 1: Login y panel admin

Entrar con usuario administrador. Mostrar indicadores de ventas, caja, stock bajo y pedidos pendientes. Explicar que el admin tiene vision general del comercio.

### Paso 2: Producto

Abrir productos o stock. Mostrar que cada producto tiene precio mostrador, precio mayorista, codigo de barras, imagen, stock y stock minimo. Explicar la relacion con stock bajo y venta.

### Paso 3: Venta de mostrador

Entrar como vendedor o desde rol admin a `/vendedor`.

Mostrar:

- Estado de caja.
- Busqueda de producto.
- Agregar productos al carrito.
- Modificar cantidad.
- Aplicar descuento o recargo.
- Elegir medio de pago.
- En efectivo, cargar monto recibido y mostrar vuelto.
- Confirmar venta.
- Abrir ticket interno imprimible.

Remarcar que la venta valida caja abierta y stock suficiente.

### Paso 4: Pedido mayorista

Entrar como mayorista. Mostrar catalogo, filtro por categoria, carrito, precio especial por cantidad, fecha de entrega y envio de pedido pendiente.

Remarcar que el pedido no descuenta stock hasta que lo confirma el administrador.

### Paso 5: Administracion de pedido

Volver al admin y abrir pedidos. Mostrar confirmacion o rechazo. Explicar que al confirmar se verifica stock y recien ahi se descuenta.

### Paso 6: Reportes

Mostrar reportes, filtros y exportacion CSV. Explicar que esto permite pasar de operar el dia a analizar informacion.

## 5. Arquitectura tecnica

La aplicacion esta construida con Next.js, React, TypeScript y Tailwind CSS. El backend usa Supabase para autenticacion, base de datos PostgreSQL, storage de imagenes y reglas de seguridad.

La estructura esta organizada por dominios en `lib/`: autenticacion, productos, ventas, caja, pedidos mayoristas, stock, cuentas corrientes, clientes, usuarios y reportes. Las rutas estan en `app/` usando App Router.

Las operaciones sensibles, como confirmar ventas o pedidos, se validan del lado servidor y en la base de datos para evitar inconsistencias.

## 6. Uso de IA

Use IA como copiloto para idear, especificar, implementar, depurar y documentar. No la use como reemplazo de criterio: las reglas de negocio se revisaron especialmente donde afectaban dinero, stock, caja o permisos.

Ejemplos concretos:

- Convertir necesidades del comercio en requisitos por rol.
- Crear propuestas incrementales con OpenSpec.
- Mejorar el POS para busqueda rapida y atajos.
- Revisar flujos de stock y caja.
- Preparar la documentacion final cruzando el enunciado con el proyecto real.

## 7. Decisiones importantes

- Usar Supabase Auth para no manejar contrasenas manualmente.
- Separar roles para reducir errores y accesos indebidos.
- Usar RPCs y validaciones de backend para operaciones atomicas.
- Crear pedidos mayoristas como pendientes, sin tocar stock hasta confirmacion.
- Separar cuenta corriente de caja para que los reportes no mezclen deuda con efectivo.
- Mantener tickets como comprobantes internos sin validez fiscal.

## 8. Mejoras futuras

Las mejoras futuras mas relevantes son:

- Integracion con impresora termica.
- Importacion masiva de productos.
- Notificaciones automaticas para pedidos y stock bajo.
- Mas graficos de analitica.
- Auditoria detallada por usuario.
- Facturacion fiscal si el comercio lo necesita.

## 9. Cierre

El resultado es una aplicacion funcional y demostrable que resuelve un problema concreto. Integra interfaz, datos, logica de negocio, roles, automatizaciones y uso responsable de IA. El mayor aprendizaje fue trabajar de manera incremental: construir una version util, probarla, detectar riesgos y mejorarla con criterio.

## Preguntas posibles y respuestas breves

**Por que Supabase?**  
Porque resuelve autenticacion, base de datos, storage y seguridad en una misma plataforma, lo que permite enfocarse en la logica del comercio.

**Que pasa si no hay stock?**  
La venta o confirmacion de pedido se bloquea. El stock se verifica antes de registrar la operacion definitiva.

**Por que los pedidos mayoristas no descuentan stock al crearse?**  
Porque son solicitudes pendientes. El administrador decide si puede cumplirlas y el descuento ocurre solo al confirmar.

**El ticket es factura?**  
No. Es un comprobante interno sin validez fiscal.

**Como se uso IA responsablemente?**  
Se uso para acelerar ideacion, codigo y documentacion, pero revisando resultados, validando reglas sensibles y manteniendo decisiones humanas sobre alcance y negocio.
