import { useState, useEffect } from 'react'
import { obtenerFacturas } from '../lib/api'
import { formatearFecha, fmtNum } from '../lib/utils'

function Badge({ color, children }) {
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${color}`}>
      {children}
    </span>
  )
}

export default function ConsultaFacturas() {
  const [facturas, setFacturas] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    obtenerFacturas()
      .then(data => {
        const mapped = (data || []).map(f => ({
          id: f.id,
          numero: f.numero,
          fecha: f.fecha,
          modalidad: f.modalidad,
          estado: f.estado,
          cliente: f.cliente?.nombre || '—',
          moneda: f.moneda,
          totalNeto: f.totalNeto ?? f.total_neto ?? 0,
          totalImpuesto: f.totalImpuesto ?? f.total_impuesto ?? 0,
          totalExcento: f.totalExcento ?? f.total_excento ?? 0,
          total: f.total ?? 0,
          items: f.detalles || f.factura_detalles || [],
          plazo: f.plazo?.plazo || (f.modalidad === 'CO' ? 'CO-Contado' : '—'),
        }))
        setFacturas(mapped)
      })
      .catch(() => setFacturas([]))
      .finally(() => setLoading(false))
  }, [])

  const filtradas = facturas.filter(f =>
    !busqueda ||
    f.numero?.toLowerCase().includes(busqueda.toLowerCase()) ||
    f.cliente?.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-brand text-lg font-bold">🧾 Consulta de Facturas</h2>
        <span className="text-xs text-gray-400">{filtradas.length} factura{filtradas.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Buscador */}
      <div className="relative max-w-md mb-4">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar por número o cliente..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand bg-white"
        />
        {busqueda && (
          <button onClick={() => setBusqueda('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">✕</button>
        )}
      </div>

      {loading && <div className="text-center py-10 text-gray-400">Cargando...</div>}

      {!loading && filtradas.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-gray-400">{busqueda ? 'Sin resultados.' : 'No hay facturas registradas.'}</p>
        </div>
      )}

      {/* Tabla */}
      {!loading && filtradas.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['Nº Factura', 'Fecha', 'Cliente', 'Plazo', 'Modalidad', 'Neto', 'IVA', 'Excento', 'Total', 'Estado'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] text-gray-500 font-semibold uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtradas.map((f, i) => (
                <tr key={f.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${i % 2 ? 'bg-gray-50/50' : ''}`}>
                  <td className="px-4 py-3 text-sm font-bold text-gray-800 font-mono">{f.numero}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatearFecha(f.fecha)}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">{f.cliente}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{f.plazo}</td>
                  <td className="px-4 py-3">
                    <Badge color={f.modalidad === 'CO' ? 'text-gray-500 bg-gray-100' : 'text-amber-600 bg-amber-50'}>
                      {f.modalidad === 'CO' ? 'Contado' : 'Crédito'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-green-700">{fmtNum(f.totalNeto)}</td>
                  <td className="px-4 py-3 text-sm font-mono text-amber-600">{fmtNum(f.totalImpuesto)}</td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-500">{fmtNum(f.totalExcento)}</td>
                  <td className="px-4 py-3 text-sm font-mono font-bold text-gray-800">{fmtNum(f.total)}</td>
                  <td className="px-4 py-3">
                    <Badge color={f.estado === 'pagado' ? 'text-green-700 bg-green-100' : 'text-red-500 bg-red-50'}>
                      {f.estado || 'pendiente'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 border-t-2 border-brand">
                <td colSpan={5} className="px-4 py-2.5 text-xs font-bold text-gray-500 uppercase">
                  Total ({filtradas.length} facturas)
                </td>
                <td className="px-4 py-2.5 text-sm font-bold font-mono text-green-700">
                  {fmtNum(filtradas.reduce((s, f) => s + f.totalNeto, 0))}
                </td>
                <td className="px-4 py-2.5 text-sm font-bold font-mono text-amber-600">
                  {fmtNum(filtradas.reduce((s, f) => s + f.totalImpuesto, 0))}
                </td>
                <td className="px-4 py-2.5 text-sm font-bold font-mono text-gray-500">
                  {fmtNum(filtradas.reduce((s, f) => s + f.totalExcento, 0))}
                </td>
                <td className="px-4 py-2.5 text-sm font-bold font-mono text-brand">
                  {fmtNum(filtradas.reduce((s, f) => s + f.total, 0))}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  )
}
