-- ════════════════════════════════════════════════════════════
--  GQG SYSTEM — ESQUEMA COMPLETO
--  Ejecutar en Supabase → SQL Editor
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS clientes (
  id SERIAL PRIMARY KEY, nombre VARCHAR(150) NOT NULL,
  ruc_ci VARCHAR(20), direccion VARCHAR(200), telefono VARCHAR(30),
  email VARCHAR(100), tipo VARCHAR(15) DEFAULT 'cliente'
    CHECK (tipo IN ('cliente','proveedor','ambos')),
  activo BOOLEAN DEFAULT TRUE, created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS productos (
  id SERIAL PRIMARY KEY, cod_barra VARCHAR(20) UNIQUE,
  descripcion VARCHAR(200) NOT NULL, precio NUMERIC(15,2) NOT NULL DEFAULT 0,
  iva INT NOT NULL DEFAULT 10 CHECK (iva IN (0,5,10)),
  costo NUMERIC(15,2) DEFAULT 0, stock NUMERIC(12,2) DEFAULT 0,
  unidad VARCHAR(20) DEFAULT 'Unid', activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS timbrados (
  id SERIAL PRIMARY KEY, numero VARCHAR(20) NOT NULL, ruc VARCHAR(20) NOT NULL,
  fecha_inicio DATE NOT NULL, fecha_fin DATE NOT NULL,
  punto_expedicion VARCHAR(5) DEFAULT '001', activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS depositos (
  id SERIAL PRIMARY KEY, nombre VARCHAR(100) NOT NULL,
  direccion VARCHAR(200), activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS plazos (
  id SERIAL PRIMARY KEY, plazo VARCHAR(100) NOT NULL,
  tipo_id INT NOT NULL DEFAULT 0, cuotas INT NOT NULL DEFAULT 1,
  irregular BOOLEAN DEFAULT FALSE, created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS plazo_detalles (
  id SERIAL PRIMARY KEY, plazo_id INT NOT NULL REFERENCES plazos(id) ON DELETE CASCADE,
  cuota INT NOT NULL, dias INT NOT NULL DEFAULT 30
);

CREATE TABLE IF NOT EXISTS facturas (
  id SERIAL PRIMARY KEY, numero VARCHAR(20) NOT NULL UNIQUE,
  tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('venta','compra')),
  cliente_id INT NOT NULL REFERENCES clientes(id),
  timbrado_id INT REFERENCES timbrados(id),
  deposito_id INT REFERENCES depositos(id),
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_proceso TIMESTAMPTZ DEFAULT NOW(),
  moneda VARCHAR(20) DEFAULT 'Guaraní',
  total_neto NUMERIC(15,2) DEFAULT 0, total_impuesto NUMERIC(15,2) DEFAULT 0,
  total_excento NUMERIC(15,2) DEFAULT 0, total NUMERIC(15,2) NOT NULL,
  modalidad VARCHAR(2) NOT NULL CHECK (modalidad IN ('CO','CR')),
  plazo_id INT REFERENCES plazos(id),
  estado VARCHAR(20) DEFAULT 'pendiente', created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS factura_detalles (
  id SERIAL PRIMARY KEY, factura_id INT NOT NULL REFERENCES facturas(id) ON DELETE CASCADE,
  item_nro INT NOT NULL, producto_id INT REFERENCES productos(id),
  cod_barra VARCHAR(20), descripcion VARCHAR(200) NOT NULL,
  precio NUMERIC(15,2) NOT NULL, iva INT NOT NULL DEFAULT 10,
  base NUMERIC(15,2) DEFAULT 0, impuesto NUMERIC(15,2) DEFAULT 0,
  descuento_pct NUMERIC(5,2) DEFAULT 0, descuento NUMERIC(15,2) DEFAULT 0,
  cantidad NUMERIC(12,2) NOT NULL DEFAULT 1, total NUMERIC(15,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cuentas (
  id SERIAL PRIMARY KEY, factura_id INT NOT NULL REFERENCES facturas(id) ON DELETE CASCADE,
  tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('cobrar','pagar')),
  cuota VARCHAR(10) NOT NULL, importe NUMERIC(15,2) NOT NULL,
  vence DATE NOT NULL, cobrado NUMERIC(15,2) DEFAULT 0,
  estado VARCHAR(20) DEFAULT 'pendiente', created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_clientes_nombre ON clientes(nombre);
CREATE INDEX IF NOT EXISTS idx_productos_cod ON productos(cod_barra);
CREATE INDEX IF NOT EXISTS idx_facturas_cliente ON facturas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_fdet_factura ON factura_detalles(factura_id);
CREATE INDEX IF NOT EXISTS idx_cuentas_factura ON cuentas(factura_id);

-- Datos iniciales
INSERT INTO depositos (nombre) VALUES ('Depósito 1'),('Depósito 2'),('Depósito Central') ON CONFLICT DO NOTHING;
INSERT INTO timbrados (numero,ruc,fecha_inicio,fecha_fin) VALUES ('17155531','384649-0','2024-04-11','2025-04-30') ON CONFLICT DO NOTHING;
INSERT INTO clientes (nombre,ruc_ci,direccion,telefono,tipo) VALUES
  ('Gregorio Quintana González','3419776-0','Asunción','0961-894343','cliente'),
  ('María López Fernández','4521889-1','San Lorenzo','0981-223344','cliente')
ON CONFLICT DO NOTHING;
INSERT INTO productos (cod_barra,descripcion,precio,iva,stock) VALUES
  ('7841617000662','Producto 1 x Unid',27560,5,150),
  ('7842568000312','Producto 2 x Unid',125000,0,80),
  ('7840036106030','Producto 3 x Unid',65842,10,200),
  ('7793742000669','Producto 4 x Unid',365824,10,45)
ON CONFLICT DO NOTHING;
INSERT INTO plazos (plazo,tipo_id,cuotas,irregular) VALUES
  ('CO-Contado',0,1,false),('CR-30/60/90 días',1,3,false),('CR-25/40/55 días',1,3,true)
ON CONFLICT DO NOTHING;
INSERT INTO plazo_detalles (plazo_id,cuota,dias)
  SELECT id,1,25 FROM plazos WHERE plazo='CR-25/40/55 días' ON CONFLICT DO NOTHING;
INSERT INTO plazo_detalles (plazo_id,cuota,dias)
  SELECT id,2,40 FROM plazos WHERE plazo='CR-25/40/55 días' ON CONFLICT DO NOTHING;
INSERT INTO plazo_detalles (plazo_id,cuota,dias)
  SELECT id,3,55 FROM plazos WHERE plazo='CR-25/40/55 días' ON CONFLICT DO NOTHING;

-- RLS: acceso público (sin login)
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE timbrados ENABLE ROW LEVEL SECURITY;
ALTER TABLE depositos ENABLE ROW LEVEL SECURITY;
ALTER TABLE plazos ENABLE ROW LEVEL SECURITY;
ALTER TABLE plazo_detalles ENABLE ROW LEVEL SECURITY;
ALTER TABLE facturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE factura_detalles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cuentas ENABLE ROW LEVEL SECURITY;

DO $$ DECLARE pol RECORD;
BEGIN
  FOR pol IN SELECT policyname,tablename FROM pg_policies WHERE schemaname='public'
    AND tablename IN ('clientes','productos','timbrados','depositos','plazos','plazo_detalles','facturas','factura_detalles','cuentas')
  LOOP EXECUTE format('DROP POLICY %I ON %I',pol.policyname,pol.tablename); END LOOP;
END $$;

CREATE POLICY "allow_all" ON clientes FOR ALL TO anon,authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON productos FOR ALL TO anon,authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON timbrados FOR ALL TO anon,authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON depositos FOR ALL TO anon,authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON plazos FOR ALL TO anon,authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON plazo_detalles FOR ALL TO anon,authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON facturas FOR ALL TO anon,authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON factura_detalles FOR ALL TO anon,authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON cuentas FOR ALL TO anon,authenticated USING (true) WITH CHECK (true);
