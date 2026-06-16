import { format, addDays, addMonths } from 'date-fns'
import { es } from 'date-fns/locale'

export function formatearFecha(date) {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date + 'T12:00:00') : date
  return format(d, 'dd/MM/yyyy', { locale: es })
}

export function fmtNum(n) {
  return new Intl.NumberFormat('es-PY', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0)
}

export function calcularIVA(totalConIva, tasaIva) {
  if (tasaIva <= 0) return { base: totalConIva, impuesto: 0 }
  const base = totalConIva / (1 + tasaIva / 100)
  return { base: Math.round(base * 100) / 100, impuesto: Math.round((totalConIva - base) * 100) / 100 }
}

export function generarEtiquetaPlazo(modalidad, cantCuotas, tipoVenc, diasIrregulares) {
  if (modalidad === 'CO') return 'CO-Contado'
  if (tipoVenc === 'regular')
    return `CR-${Array.from({ length: cantCuotas }, (_, i) => (i + 1) * 30).join('-')} días`
  return `CR-${diasIrregulares.slice(0, cantCuotas).join('-')} días`
}

export function generarCuotas(total, cantCuotas, tipoVenc, diasIrregulares, fechaFactura) {
  const cuotas = []
  const importeCuota = Math.floor(total / cantCuotas)
  const resto = total - importeCuota * cantCuotas
  for (let i = 0; i < cantCuotas; i++) {
    const vence = tipoVenc === 'regular'
      ? addMonths(fechaFactura, i + 1)
      : addDays(fechaFactura, diasIrregulares[i] || 30 * (i + 1))
    cuotas.push({
      numero: `"${i + 1}/${cantCuotas}"`,
      importe: i === cantCuotas - 1 ? importeCuota + resto : importeCuota,
      vence, cobrado: 0,
    })
  }
  return cuotas
}

export function calcularItem(item) {
  const totalBruto = item.precio * item.cantidad
  const descMonto = totalBruto * (item.desc_pct / 100)
  const totalNeto = totalBruto - descMonto
  const { base, impuesto } = calcularIVA(totalNeto, item.iva)
  return { ...item, totalBruto, descMonto, base, impuesto, total: totalNeto }
}

export function calcularTotalesFactura(items) {
  let neto = 0, impuesto = 0, excento = 0, cantItems = 0
  items.forEach(it => {
    const totalBruto = it.precio * it.cantidad
    const totalNeto = totalBruto * (1 - (it.desc_pct || 0) / 100)
    const { base, impuesto: imp } = calcularIVA(totalNeto, it.iva)
    if (it.iva === 0) excento += totalNeto
    else { neto += base; impuesto += imp }
    cantItems += it.cantidad
  })
  return {
    neto: Math.round(neto * 100) / 100,
    impuesto: Math.round(impuesto * 100) / 100,
    excento: Math.round(excento * 100) / 100,
    total: Math.round((neto + impuesto + excento) * 100) / 100,
    cantItems,
  }
}
