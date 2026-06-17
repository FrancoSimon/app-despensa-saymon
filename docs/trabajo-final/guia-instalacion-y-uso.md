# Guia de instalacion y uso

## 1. Requisitos

- Node.js compatible con el proyecto.
- npm.
- Proyecto Supabase activo.
- Acceso al SQL Editor de Supabase o una conexion administrativa para aplicar migraciones.

## 2. Variables de entorno

Crear `.env.local` en la raiz del proyecto:

```text
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

La `SUPABASE_SERVICE_ROLE_KEY` es solo de servidor. No debe publicarse ni exponerse con prefijo `NEXT_PUBLIC_`.

## 3. Instalacion local

```bash
npm install
npm run dev
```

Abrir:

```text
http://localhost:3000
```

## 4. Configuracion de Supabase

Aplicar las migraciones en orden desde `supabase/migrations/`. La guia detallada esta en:

```text
docs/supabase-setup.md
```

Pasos minimos:

1. Crear tablas de perfiles.
2. Crear el primer usuario administrador en Supabase Auth.
3. Insertar el perfil `admin` asociado al usuario.
4. Aplicar migraciones de productos, storage, ventas, pedidos, stock, caja, clientes y cuentas corrientes.
5. Cargar datos demo: productos, usuarios vendedores, usuarios mayoristas y clientes.

## 5. Usuarios demo sugeridos

Completar antes de la defensa:

| Rol | Email | Password | Uso en la demo |
| --- | --- | --- | --- |
| Admin | Completar | Completar | Gestion y reportes |
| Vendedor | Completar | Completar | Venta de mostrador y caja |
| Mayorista | Completar | Completar | Pedido mayorista |

## 6. Recorrido de uso por rol

### Administrador

1. Iniciar sesion.
2. Revisar indicadores del panel.
3. Crear o editar productos.
4. Consultar stock bajo.
5. Crear usuarios de prueba si hace falta.
6. Revisar pedidos mayoristas pendientes.
7. Confirmar o rechazar un pedido.
8. Consultar ventas, cajas, cuentas corrientes y reportes.
9. Exportar un CSV desde reportes.

### Vendedor

1. Iniciar sesion.
2. Abrir caja desde el modulo de vendedor.
3. Buscar productos por nombre, categoria o codigo de barras.
4. Agregar productos al carrito.
5. Aplicar descuento o recargo si corresponde.
6. Elegir medio de pago.
7. Para efectivo, cargar monto recibido y revisar vuelto.
8. Confirmar venta.
9. Imprimir o guardar ticket interno.
10. Cerrar caja al finalizar.

### Mayorista

1. Iniciar sesion.
2. Buscar productos del catalogo mayorista.
3. Filtrar por categoria.
4. Agregar productos al pedido.
5. Revisar si aplica precio especial por cantidad.
6. Elegir fecha de entrega disponible.
7. Enviar pedido pendiente.
8. Consultar historial y estado del pedido.

## 7. Rutas principales

| Ruta | Rol | Descripcion |
| --- | --- | --- |
| `/` | Publico | Pantalla inicial |
| `/login` | Publico | Inicio de sesion |
| `/admin` | Admin | Panel general |
| `/admin/productos` | Admin | Gestion de productos |
| `/admin/stock` | Admin | Stock, movimientos y proveedores |
| `/admin/ventas` | Admin | Ventas y tickets |
| `/admin/cajas` | Admin | Cajas y cierres |
| `/admin/pedidos` | Admin | Pedidos mayoristas |
| `/admin/cuentas-corrientes` | Admin | Clientes, saldos y pagos |
| `/admin/reportes` | Admin | Reportes y CSV |
| `/admin/usuarios` | Admin | Usuarios y roles |
| `/vendedor` | Admin/Vendedor | Punto de venta |
| `/vendedor/caja` | Admin/Vendedor | Apertura/cierre de caja |
| `/mayorista` | Admin/Mayorista | Portal mayorista |

## 8. Comandos de verificacion

```bash
npm run lint
npm run build
```

## 9. Despliegue sugerido

Una opcion natural para este stack es Vercel:

1. Subir el repositorio a GitHub.
2. Importar el proyecto en Vercel.
3. Configurar variables de entorno.
4. Verificar que Supabase permita el dominio desplegado.
5. Ejecutar una prueba de login y flujos principales.

- URL de despliegue: https://app-despensa-saymon-l9sa.vercel.app/
- Fecha de despliegue: 16/06/2026
- Version/commit presentado: completar con el commit final de entrega
