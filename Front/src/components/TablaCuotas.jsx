import { formatearFecha, fmtNum } from '../lib/utils'

export default function TablaCuotas({ cuotas, tipo, cliente, numero, fecha, moneda, plazoLabel }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <h3 className="text-sm text-brand font-bold mb-1">
        {tipo?.includes('Crédito') ? 'CUENTAS A COBRAR' : 'CUENTA A COBRAR'}
      </h3>
      <div className="text-xs text-gray-500 mb-3 leading-relaxed">
        <div>Cliente: <span className="text-gray-800">{cliente}</span></div>
        <div>Factura: <span className="text-gray-800">{numero}</span></div>
        <div>Fecha: <span className="text-gray-800">{formatearFecha(fecha)}</span></div>
        <div>Moneda: <span className="text-gray-800">{moneda}</span></div>
        <div>Cuotas: <span className="text-brand font-bold">{plazoLabel}</span></div>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {['Cuota','Importe','Vence','Cobrado'].map(h => (
              <th key={h} className="px-2.5 py-[7px] text-left text-[10px] text-gray-400 font-bold uppercase tracking-wider border-b-2 border-gray-200">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cuotas.map((c, i) => (
            <tr key={i} className="border-b border-gray-100">
              <td className="px-2.5 py-2 text-xs font-semibold">{c.numero}</td>
              <td className="px-2.5 py-2 text-xs font-mono text-green-700">{fmtNum(c.importe)}</td>
              <td className="px-2.5 py-2 text-xs">{formatearFecha(c.vence)}</td>
              <td className="px-2.5 py-2 text-xs font-mono text-red-500">{c.cobrado}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
