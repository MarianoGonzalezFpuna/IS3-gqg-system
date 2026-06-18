import { useState, useEffect } from 'react'
import { obtenerFacturas } from '../lib/api'
import { obtenerFacturasLocal, limpiarFacturasLocal } from '../lib/storage'
import { formatearFecha, fmtNum } from '../lib/utils'

function Badge({ color, children }) {
  return <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${color}`}>{children}</span>
}

export default function Historial() {
  const [facturas, setFacturas] = useState([])
  const [loading, setLoading] = useState(true)
  const [fuente, setFuente] = useState('')

  useEffect(() => {
    obtenerFacturas()
      .then(data => {
        if (data?.length > 0) {
          const mapped = data.map(f => ({
            id: f.id,
            numero: f.numero,
            fechaFactura: f.fecha,
            modalidad: f.modalidad,
            cliente: f.cliente?.nombre || 'Cliente',
            totals: { neto: f.totalNeto||f.total_neto, impuesto: f.totalImpuesto||f.total_impuesto, excento: f.totalExcento||f.total_excento, total: f.total },
            items: (f.detalles || f.factura_detalles || []).map(d => ({ desc: d.descripcion, precio: d.precio, iva: d.iva, cantidad: d.cantidad, total: d.total })),
            cuotas: (f.cuentas || []).map(c => ({ numero: `"${c.cuota}"`, importe: c.importe, vence: c.vence, cobrado: c.cobrado })),
            plazoLabel: f.modalidad==='CO' ? 'CO-Contado' : (f.plazo?.plazo || 'Crédito'),
          }))
          setFacturas(mapped); setFuente('api')
        } else {
          setFacturas(obtenerFacturasLocal()); setFuente('local')
        }
      })
      .catch(() => { setFacturas(obtenerFacturasLocal()); setFuente('local') })
      .finally(() => setLoading(false))
  }, [])

  const limpiar = () => { if (confirm('¿Limpiar historial local?')) { limpiarFacturasLocal(); if (fuente==='local') setFacturas([]) } }

  if (loading) return <div className="text-center py-10 text-gray-400">Cargando...</div>

  if (facturas.length === 0) return (
    <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
      <div className="text-5xl mb-4">📭</div>
      <p className="text-gray-400">No hay facturas registradas.</p>
    </div>
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-brand font-bold text-base">💰 Cuentas a Cobrar ({facturas.length})</h2>
        {fuente==='local' && <button onClick={limpiar} className="px-3 py-1.5 text-xs text-red-500 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors">🗑️ Limpiar local</button>}
      </div>
      <div className="space-y-3">
        {facturas.map(f => (
          <div key={f.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">{f.numero}</span>
                <Badge color="text-brand bg-brand-light">Venta</Badge>
                <Badge color={f.modalidad==='CO'?'text-gray-500 bg-gray-100':'text-amber-600 bg-amber-50'}>{f.modalidad==='CO'?'Contado':'Crédito'}</Badge>
              </div>
              <span className="text-base font-extrabold font-mono text-green-700">{fmtNum(f.totals?.total)} ₲</span>
            </div>
            <div className="text-xs text-gray-400 mb-1.5">{f.cliente} · {formatearFecha(f.fechaFactura)} · {f.plazoLabel}</div>
            <div className="text-[11px] text-gray-400 mb-3">Neto: {fmtNum(f.totals?.neto)} · IVA: {fmtNum(f.totals?.impuesto)} · Excento: {fmtNum(f.totals?.excento)}</div>

            {/* Detalles */}
            {f.items?.length > 0 && (
              <details className="mb-2">
                <summary className="text-[11px] text-gray-400 cursor-pointer hover:text-gray-600">📦 Ver ítems ({f.items.length})</summary>
                <table className="w-full mt-2 text-xs border-collapse">
                  <thead><tr>{['Descripción','Precio','IVA','Cant.','Total'].map(h=><th key={h} className="px-2 py-1 text-left text-[9px] text-gray-400 uppercase border-b border-gray-100">{h}</th>)}</tr></thead>
                  <tbody>{f.items.map((it,i)=>(
                    <tr key={i} className="border-b border-gray-50">
                      <td className="px-2 py-1">{it.desc}</td>
                      <td className="px-2 py-1 font-mono">{fmtNum(it.precio)}</td>
                      <td className="px-2 py-1">{it.iva}%</td>
                      <td className="px-2 py-1 text-center">{it.cantidad}</td>
                      <td className="px-2 py-1 font-mono font-semibold text-right">{fmtNum(it.total)}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </details>
            )}

            {/* Cuotas */}
            <table className="w-full border-collapse text-xs">
              <thead><tr>{['Cuota','Importe','Vence','Cobrado'].map(h=><th key={h} className="px-2 py-1.5 text-left text-[9px] text-gray-400 uppercase border-b border-gray-200">{h}</th>)}</tr></thead>
              <tbody>{(f.cuotas||[]).map((c,i)=>(
                <tr key={i} className="border-b border-gray-50">
                  <td className="px-2 py-1.5 font-semibold">{c.numero}</td>
                  <td className="px-2 py-1.5 font-mono text-green-700">{fmtNum(c.importe)}</td>
                  <td className="px-2 py-1.5">{formatearFecha(c.vence)}</td>
                  <td className="px-2 py-1.5 font-mono">{c.cobrado}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  )
}
