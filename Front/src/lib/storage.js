const KEY = 'gqg_facturas'
export const guardarFacturaLocal = (f) => {
  const list = obtenerFacturasLocal()
  list.unshift(f)
  localStorage.setItem(KEY, JSON.stringify(list))
}
export const obtenerFacturasLocal = () => {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}
export const limpiarFacturasLocal = () => localStorage.removeItem(KEY)
