# App Despensa SAYMON

Sistema web para la gestion diaria de un comercio de despensa con venta de mostrador, stock, caja, pedidos mayoristas, cuentas corrientes, usuarios y reportes.

El proyecto fue desarrollado como Trabajo Final Integrador del curso **Desarrollo de Aplicaciones Web con Inteligencia Artificial**. La aplicacion busca resolver una necesidad real del comercio: centralizar operaciones que suelen quedar dispersas entre planillas, cuadernos, mensajes y controles manuales.

## Alcance principal

- Autenticacion con Supabase Auth y control de acceso por roles: `admin`, `vendedor` y `mayorista`.
- Panel administrador con indicadores de ventas, caja, stock bajo y pedidos pendientes.
- Gestion de productos con precios de mostrador, precios mayoristas, codigo de barras, imagen, stock minimo y activacion mayorista.
- Punto de venta para mostrador con busqueda por nombre, categoria o codigo de barras, lector por camara, descuentos, recargos, medios de pago, cuenta corriente y ticket interno imprimible.
- Apertura, cierre y control de caja por vendedor.
- Pedidos mayoristas con catalogo filtrado, precios especiales por cantidad, fecha de entrega sabado y estados de seguimiento.
- Administracion de pedidos mayoristas con confirmacion, rechazo, entrega, cancelacion y control atomico de stock.
- Cuentas corrientes de clientes con movimientos, pagos parciales y recibos.
- Reportes administrativos con filtros, resumenes y exportaciones CSV.

## Documentacion de entrega

La documentacion preparada para presentar y defender el proyecto esta en:

- [Documentacion final](docs/trabajo-final/documentacion-final.md)
- [Guia de instalacion y uso](docs/trabajo-final/guia-instalacion-y-uso.md)
- [Registro de uso de IA](docs/trabajo-final/registro-uso-ia.md)
- [Guion de defensa](docs/trabajo-final/guion-defensa.md)
- [Matriz de cumplimiento del enunciado](docs/trabajo-final/matriz-cumplimiento-enunciado.md)
- [Capturas de pantalla](docs/trabajo-final/capturas.md)
- [Checklist de entrega](docs/trabajo-final/checklist-entrega.md)

Tambien existe una guia tecnica especifica para configurar Supabase:

- [Supabase setup](docs/supabase-setup.md)

## Stack tecnico

- Next.js 16.2.7 con App Router.
- React 19.2.4.
- TypeScript.
- Tailwind CSS 4.
- Supabase Auth, PostgreSQL, Row Level Security, RPCs y Storage.
- `html5-qrcode` para lectura de codigos de barras por camara.

## Ejecucion local

1. Instalar dependencias:

```bash
npm install
```

2. Crear `.env.local` con las variables de Supabase:

```text
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

3. Aplicar las migraciones SQL indicadas en [docs/supabase-setup.md](docs/supabase-setup.md).

4. Iniciar el servidor de desarrollo:

```bash
npm run dev
```

5. Abrir `http://localhost:3000`.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Estado de entrega

Antes de presentar, completar en la documentacion:

- URL del repositorio.
- URL de despliegue o modo de demostracion acordado.
- Credenciales de usuarios demo.
- Capturas de pantallas principales.
- Fecha, integrantes y datos solicitados por la catedra.
