# GQG System — Módulo de Pagos

Sistema de facturación con soporte de pagos al contado y crédito en cuotas, desarrollado para la materia Ingeniería de Software III.

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Java 17 + Spring Boot 3 + Maven |
| Base de Datos | PostgreSQL (Supabase) |
| Deploy Frontend | Vercel |
| Deploy Backend | Railway |

---

## Estructura del Repositorio

```
IS3-gqg-system/
├── front/                          ← Frontend React
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx         ← Navegación lateral
│   │   │   ├── CabeceraFactura.jsx ← Cabecera del formulario de factura
│   │   │   ├── DetalleItems.jsx    ← Tabla de ítems con autocomplete
│   │   │   └── TablaCuotas.jsx     ← Vista previa de cuotas
│   │   ├── pages/
│   │   │   ├── Login.jsx               ← Pantalla de acceso
│   │   │   ├── NuevaFactura.jsx        ← Formulario de factura
│   │   │   ├── ConsultaFacturas.jsx    ← Listado de facturas sin cuotas
│   │   │   ├── Historial.jsx           ← Cuentas a Cobrar (facturas + cuotas)
│   │   │   ├── Clientes.jsx            ← ABM de clientes
│   │   │   ├── Productos.jsx           ← ABM de productos
│   │   │   └── Plazos.jsx              ← ABM de plazos de pago
│   │   ├── lib/
│   │   │   ├── api.js              ← Llamadas al backend Java
│   │   │   ├── utils.js            ← Cálculos de IVA y cuotas
│   │   │   └── constants.js        ← Constantes globales
│   │   └── App.jsx                 ← Rutas y layout principal
│   ├── .env.example
│   └── package.json
│
├── back/                           ← Backend Java
│   ├── src/main/java/com/gqg/
│   │   ├── controller/             ← Endpoints REST
│   │   ├── service/                ← Lógica de negocio
│   │   ├── repository/             ← Acceso a datos (JPA)
│   │   ├── model/                  ← Entidades de base de datos
│   │   ├── dto/                    ← Objetos de transferencia
│   │   └── config/                 ← Configuración CORS
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── Dockerfile
│   └── pom.xml
│
└── supabase/
    └── schema.sql                  ← Tablas, triggers y datos iniciales
```

---

## Funcionalidades

- **Login** con usuario y contraseña
- **Clientes** — ABM completo con búsqueda por nombre o RUC
- **Productos** — ABM completo con búsqueda por descripción o código de barra
- **Plazos** — ABM de configuraciones de pago con las siguientes validaciones:
  - Solo puede existir un plazo de tipo Contado
  - No se permite crear plazos crédito con nombre duplicado
  - Soporta vencimiento regular (30-60-90 días) e irregular (días específicos por cuota)
- **Facturas de Venta**
  - Cabecera con datos de timbrado, cliente, depósito y moneda
  - Número de factura secuencial automático (001-001-XXXXXXX), no editable
  - Detalle de ítems con autocomplete por código de barra (Enter o Tab)
  - Cálculo automático de IVA (0%, 5%, 10%), base imponible y excento
  - Modalidad Contado o Crédito con selección de plazo
  - Vista previa de cuotas antes de guardar
  - Generación automática de cuotas vía trigger PostgreSQL
- **Consulta de Facturas** — Tabla de facturas con totalizador de neto, IVA, excento y total. Incluye buscador por número o cliente
- **Cuentas a Cobrar** — Listado de facturas con detalle de ítems y cuotas generadas

---

## Despliegue

### Frontend — Vercel

1. Subir la carpeta `front/` a un repositorio GitHub
2. Conectar el repo en [vercel.com](https://vercel.com)
3. Configurar **Root Directory** como `front`
4. Agregar la variable de entorno:
```
VITE_API_URL = https://tu-backend.up.railway.app/api
```
5. Deploy

### Backend — Railway

1. Conectar el mismo repositorio en [railway.app](https://railway.app)
2. Configurar **Root Directory** como `back`
3. Seleccionar **Dockerfile** como builder
4. Agregar las variables de entorno:
```
SPRING_DATASOURCE_URL      = jdbc:postgresql://HOST:5432/postgres?sslmode=require
SPRING_DATASOURCE_USERNAME = postgres.PROJECT_ID
SPRING_DATASOURCE_PASSWORD = TU_PASSWORD
```
5. En **Networking → Generate Domain** exponer el puerto `8080`

### Base de Datos — Supabase

1. Crear un proyecto en [supabase.com](https://supabase.com)
2. Ir a **SQL Editor** y ejecutar el contenido de `supabase/schema.sql`
3. Los datos de conexión para Railway se obtienen desde **Connect → Session pooler**

---

## Variables de Entorno

**Frontend (`front/.env`):**
```
VITE_API_URL=https://tu-backend.up.railway.app/api
```

**Backend (Railway → Variables):**
```
SPRING_DATASOURCE_URL      = jdbc:postgresql://HOST:5432/postgres?sslmode=require
SPRING_DATASOURCE_USERNAME = postgres.PROJECT_ID
SPRING_DATASOURCE_PASSWORD = TU_PASSWORD
```

---

## API REST

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/clientes` | Listar clientes |
| POST | `/api/clientes` | Crear cliente |
| PUT | `/api/clientes/{id}` | Actualizar cliente |
| DELETE | `/api/clientes/{id}` | Eliminar cliente (soft delete) |
| GET | `/api/productos` | Listar productos |
| GET | `/api/productos/codigo/{cod}` | Buscar por código de barra |
| POST | `/api/productos` | Crear producto |
| PUT | `/api/productos/{id}` | Actualizar producto |
| DELETE | `/api/productos/{id}` | Eliminar producto (soft delete) |
| GET | `/api/plazos` | Listar plazos |
| POST | `/api/plazos` | Crear plazo |
| PUT | `/api/plazos/{id}` | Actualizar plazo |
| DELETE | `/api/plazos/{id}` | Eliminar plazo |
| GET | `/api/facturas` | Listar facturas |
| GET | `/api/facturas/siguiente-numero` | Obtener siguiente número secuencial |
| POST | `/api/facturas` | Crear factura (trigger genera cuotas) |

---

## Integrantes

- Oscar Nicolás Duarte Alonso
- Diego Sebastián Martínez Maciel
- Jorge Ezequiel Zárate Gómez
- Diego Benjamín Castillo Bernal
- Mariano Ramón Gonzalez Benítez



**Universidad Nacional de Asunción — Facultad Politécnica**
Ingeniería de Software III — 2026
