// ══════════════════════════════════════════════════════════════
//  api.js — Llamadas al backend Java (Spring Boot)
//  Desarrollo:  http://localhost:8080/api
//  Producción:  VITE_API_URL en Vercel
// ══════════════════════════════════════════════════════════════

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

async function http(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || `Error ${res.status}`)
  }
  if (res.status === 204) return null
  return res.json()
}

// ── Clientes ──
export const obtenerClientes = () => http('/clientes')
export const buscarClientes = (q) => http(`/clientes?q=${encodeURIComponent(q)}`)
export const crearCliente = (c) => http('/clientes', { method: 'POST', body: JSON.stringify(c) })
export const actualizarCliente = (id, c) => http(`/clientes/${id}`, { method: 'PUT', body: JSON.stringify(c) })
export const eliminarCliente = (id) => http(`/clientes/${id}`, { method: 'DELETE' })

// ── Productos ──
export const obtenerProductos = () => http('/productos')
export const buscarProductos = (q) => http(`/productos?q=${encodeURIComponent(q)}`)
export const buscarProductoPorCodigo = (cod) => http(`/productos/codigo/${encodeURIComponent(cod)}`).catch(() => null)
export const crearProducto = (p) => http('/productos', { method: 'POST', body: JSON.stringify(p) })
export const actualizarProducto = (id, p) => http(`/productos/${id}`, { method: 'PUT', body: JSON.stringify(p) })
export const eliminarProducto = (id) => http(`/productos/${id}`, { method: 'DELETE' })

// ── Plazos ──
export const obtenerPlazos = () => http('/plazos')
export const crearPlazo = (plazo, detalles = []) =>
  http('/plazos', { method: 'POST', body: JSON.stringify({ ...plazo, plazoDetalles: detalles }) })
export const actualizarPlazo = (id, plazo, detalles = []) =>
  http(`/plazos/${id}`, { method: 'PUT', body: JSON.stringify({ ...plazo, plazoDetalles: detalles }) })
export const eliminarPlazo = (id) => http(`/plazos/${id}`, { method: 'DELETE' })

// ── Facturas ──
export const obtenerFacturas = () => http('/facturas')
export const crearFacturaCompleta = (cabecera, detalles) =>
  http('/facturas', {
    method: 'POST',
    body: JSON.stringify({
      numero: cabecera.numero,
      tipo: cabecera.tipo,
      clienteId: cabecera.cliente_id,
      timbradoId: cabecera.timbrado_id,
      depositoId: cabecera.deposito_id,
      fecha: cabecera.fecha,
      moneda: cabecera.moneda,
      totalNeto: cabecera.total_neto,
      totalImpuesto: cabecera.total_impuesto,
      totalExcento: cabecera.total_excento,
      total: cabecera.total,
      modalidad: cabecera.modalidad,
      plazoId: cabecera.plazo_id,
      detalles: detalles.map(d => ({
        productoId: d.producto_id,
        codBarra: d.cod_barra,
        descripcion: d.descripcion,
        precio: d.precio,
        iva: d.iva,
        base: d.base,
        impuesto: d.impuesto,
        descuentoPct: d.descuento_pct,
        descuento: d.descuento,
        cantidad: d.cantidad,
        total: d.total,
      })),
    }),
  })
