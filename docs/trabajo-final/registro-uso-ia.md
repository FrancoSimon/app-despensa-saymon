# Registro de uso de inteligencia artificial

## 1. Objetivo del uso de IA

La IA se uso como copiloto para acelerar el desarrollo de una aplicacion web real sin perder control sobre las decisiones de producto. El foco fue convertir una necesidad concreta del comercio SAYMON en funcionalidades implementables, revisar riesgos y documentar el proceso.

## 2. Momentos principales de uso

### Ideacion y alcance

La IA ayudo a ordenar el problema inicial: separar usuarios, detectar flujos principales y priorizar un MVP viable. A partir de esa conversacion se definieron modulos como productos, ventas de mostrador, pedidos mayoristas, caja, stock, cuentas corrientes y reportes.

Ejemplos de prompts:

```text
Necesito transformar la gestion de una despensa en una aplicacion web viable para un trabajo final. Ayudame a definir usuarios, problema, alcance MVP y funcionalidades por prioridad.
```

```text
Actua como analista funcional. Converti estas necesidades del comercio en requisitos verificables por rol: administrador, vendedor y mayorista.
```

### Especificacion incremental

Se uso OpenSpec para registrar cambios, requisitos y tareas antes de implementar funcionalidades importantes. Esto permitio mantener una trazabilidad entre necesidad, propuesta, diseno, specs y tareas.

Ejemplos de prompts:

```text
Proponer un cambio OpenSpec para agregar ventas de mostrador con carrito, control de stock y ticket interno.
```

```text
Crear tareas verificables para implementar pedidos mayoristas pendientes sin descontar stock hasta confirmacion administrativa.
```

### Desarrollo de codigo

La IA colaboro en componentes de interfaz, acciones de servidor, consultas, validaciones y migraciones SQL. Cada salida se reviso contra el comportamiento esperado, especialmente cuando afectaba stock, caja, roles o dinero.

Ejemplos de prompts:

```text
Implementar el flujo de POS con busqueda por nombre/codigo, carrito, descuento, recargo, metodo de pago y confirmacion.
```

```text
Revisar esta accion de servidor para confirmar venta: debe verificar permisos, stock suficiente, caja abierta y registrar movimientos de cuenta corriente cuando corresponda.
```

### Depuracion y mejora

La IA se uso para investigar errores, mejorar mensajes, compactar interfaces y agregar confirmaciones en acciones criticas. Tambien ayudo a detectar flujos incompletos, como ventas sin caja abierta, pedidos confirmados sin stock o ventas a cuenta corriente sin cliente.

Ejemplos de prompts:

```text
Analiza por que esta venta falla en Supabase y propon una correccion segura sin romper el historial.
```

```text
Mejorar la UX del POS para que un vendedor pueda operar rapido con teclado, busqueda y confirmacion clara.
```

### Documentacion

La IA ayudo a generar esta documentacion final, cruzando el enunciado del trabajo final con el estado real del repositorio, las rutas, las migraciones y las especificaciones.

Ejemplo de prompt:

```text
Leer el enunciado del trabajo final y generar toda la documentacion requerida para presentar y defender el proyecto app-despensa-saymon.
```

## 3. Decisiones tomadas con criterio propio

- Mantener tres roles simples y claros: admin, vendedor y mayorista.
- Delegar contrasenas en Supabase Auth en lugar de almacenarlas en tablas propias.
- Usar Supabase PostgreSQL y RPCs para operaciones atomicas de stock, ventas y pedidos.
- No descontar stock al crear pedidos mayoristas, solo al confirmarlos.
- Separar ventas de cuenta corriente de caja para que los reportes sean mas claros.
- Priorizar una interfaz operativa, compacta y rapida antes que una pagina promocional.
- Declarar los tickets como comprobantes internos, no fiscales.

## 4. Errores o riesgos detectados con ayuda de IA

- Riesgo de vender sin caja abierta.
- Riesgo de descontar stock dos veces en pedidos mayoristas.
- Riesgo de confirmar ventas sin stock suficiente.
- Riesgo de mezclar pagos de cuenta corriente con efectivo de caja.
- Riesgo de exponer credenciales sensibles de Supabase.
- Riesgo de permitir acciones administrativas desde roles no autorizados.
- Riesgo de generar documentacion generica que no represente la app real.

## 5. Limites encontrados

- La IA puede proponer codigo que compila pero no respeta del todo la regla de negocio; por eso las operaciones sensibles requieren revision.
- Las versiones modernas de Next.js pueden tener cambios de API, por lo que el proyecto exige consultar documentacion local antes de modificar codigo.
- La IA no reemplaza pruebas con datos reales de Supabase.
- Algunas decisiones dependen del contexto del comercio y no se pueden inferir automaticamente.

## 6. Aprendizajes

El uso mas valioso de IA fue como acelerador de iteracion: permitio convertir ideas en especificaciones, implementar, revisar y mejorar con rapidez. El aprendizaje principal fue que la IA funciona mejor cuando el problema esta bien formulado, los cambios se hacen por pasos y cada resultado se valida contra usuarios, datos y reglas reales.
