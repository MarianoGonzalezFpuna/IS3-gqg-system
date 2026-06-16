import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { obtenerPlazos, crearPlazo, actualizarPlazo, eliminarPlazo } from '../lib/api'

const FORM_VACIO = { plazo:'', tipo_id:1, cuotas:3, irregular:false, detalles:[] }

function generarLabel(form) {
  if (form.tipo_id===0) return 'CO-Contado'
  if (!form.irregular) return `CR-${Array.from({length:form.cuotas},(_,i)=>(i+1)*30).join('/')} días`
  return `CR-${form.detalles.map(d=>d.dias||0).join('/')} días`
}

export default function Plazos() {
  const [plazos, setPlazos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({...FORM_VACIO})
  const [guardando, setGuardando] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  const cargar = useCallback(async () => {
    try { setLoading(true); setPlazos(await obtenerPlazos() || []) }
    catch (err) { toast.error('Error: ' + err.message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const abrirCrear = () => {
    setEditId(null)
    const f = { ...FORM_VACIO, detalles:[{cuota:1,dias:30},{cuota:2,dias:60},{cuota:3,dias:90}] }
    setForm({ ...f, plazo: generarLabel(f) })
    setShowModal(true)
  }

  const abrirEditar = (p) => {
    setEditId(p.id)
    const detalles = (p.plazoDetalles||p.plazo_detalles||[]).sort((a,b)=>a.cuota-b.cuota).map(d=>({cuota:d.cuota,dias:d.dias}))
    setForm({ plazo:p.plazo, tipo_id:p.tipoId??p.tipo_id, cuotas:p.cuotas, irregular:p.irregular, detalles })
    setShowModal(true)
  }

  const updateForm = (key, value) => {
    setForm(prev => {
      const next = { ...prev, [key]: value }
      if (key==='tipo_id' && value===0) { next.cuotas=1; next.irregular=false; next.detalles=[] }
      if (key==='cuotas') {
        const n = Math.max(1, Math.min(24, parseInt(value)||1))
        next.cuotas=n
        next.detalles=Array.from({length:n},(_,i)=>({cuota:i+1,dias:prev.detalles[i]?.dias||(i+1)*30}))
      }
      next.plazo = generarLabel(next)
      return next
    })
  }

  const updateDia = (idx, dias) => {
    setForm(prev => {
      const detalles = prev.detalles.map((d,i) => i===idx ? {...d,dias:parseInt(dias)||0} : d)
      const next = { ...prev, detalles }
      next.plazo = generarLabel(next)
      return next
    })
  }

  const guardar = async () => {
    if (!form.plazo.trim()) { toast.error('El nombre no puede estar vacío'); return }
    setGuardando(true)
    try {
      const plazoData = { plazo:form.plazo, tipoId:form.tipo_id, cuotas:form.cuotas, irregular:form.irregular }
      const detalles = form.irregular ? form.detalles.map(d=>({cuota:d.cuota,dias:d.dias})) : []
      editId ? await actualizarPlazo(editId, plazoData, detalles) : await crearPlazo(plazoData, detalles)
      toast.success(editId ? 'Plazo actualizado' : 'Plazo creado')
      setShowModal(false); await cargar()
    } catch (err) { toast.error('Error: ' + err.message) }
    finally { setGuardando(false) }
  }

  const confirmarEliminar = async () => {
    try { await eliminarPlazo(deleteId); toast.success('Plazo eliminado'); setDeleteId(null); await cargar() }
    catch (err) { toast.error('Error: ' + err.message) }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-brand text-lg font-bold">⚙️ Plazos de Pago</h2>
        <button onClick={abrirCrear} className="px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded-lg text-sm font-bold transition-colors">+ Nuevo Plazo</button>
      </div>

      {loading && <div className="text-center py-10 text-gray-400">Cargando...</div>}

      <div className="space-y-3">
        {plazos.map(p => (
          <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-start justify-between shadow-sm">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-gray-800">{p.plazo}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${(p.tipoId??p.tipo_id)===0?'text-gray-500 bg-gray-100':'text-brand bg-brand-light'}`}>{(p.tipoId??p.tipo_id)===0?'Contado':'Crédito'}</span>
                {p.irregular && <span className="px-2 py-0.5 rounded text-[10px] font-bold text-amber-600 bg-amber-50">Irregular</span>}
              </div>
              <div className="text-xs text-gray-500">
                {p.cuotas} cuota{p.cuotas>1?'s':''}
                {p.irregular && (p.plazoDetalles||p.plazo_detalles)?.length>0 && (
                  <span className="ml-1">· Días: {(p.plazoDetalles||p.plazo_detalles).sort((a,b)=>a.cuota-b.cuota).map(d=>d.dias).join(', ')}</span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={()=>abrirEditar(p)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-colors">✏️ Editar</button>
              <button onClick={()=>setDeleteId(p.id)} className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-medium transition-colors">🗑️ Eliminar</button>
            </div>
          </div>
        ))}
      </div>

      {!loading && plazos.length===0 && <div className="text-center py-10 text-gray-400">No hay plazos configurados.</div>}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-800">{editId?'✏️ Editar Plazo':'➕ Nuevo Plazo'}</h3>
              <button onClick={()=>setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs text-gray-500 font-semibold mb-1.5">Tipo de Pago</label>
                <div className="grid grid-cols-2 gap-2">
                  {[{v:0,l:'Contado'},{v:1,l:'Crédito'}].map(t=>(
                    <button key={t.v} onClick={()=>updateForm('tipo_id',t.v)}
                      className={`py-2.5 rounded-lg text-sm font-semibold transition-all ${form.tipo_id===t.v?'bg-brand text-white':'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{t.l}</button>
                  ))}
                </div>
              </div>
              {form.tipo_id===1 && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 font-semibold mb-1.5">Cuotas</label>
                    <input type="number" min={1} max={24} value={form.cuotas} onChange={e=>updateForm('cuotas',e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand"/>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 font-semibold mb-1.5">Vencimiento</label>
                    <div className="flex items-center gap-3 py-2.5">
                      {[{v:false,l:'Regular'},{v:true,l:'Irregular'}].map(t=>(
                        <label key={t.l} className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer">
                          <input type="radio" checked={form.irregular===t.v} onChange={()=>{
                            setForm(prev=>{
                              const next={...prev,irregular:t.v}
                              if(t.v && next.detalles.length===0) next.detalles=Array.from({length:next.cuotas},(_,i)=>({cuota:i+1,dias:(i+1)*30}))
                              next.plazo=generarLabel(next); return next
                            })
                          }} className="accent-brand"/> {t.l}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {form.tipo_id===1 && form.irregular && (
                <div>
                  <label className="block text-xs text-gray-500 font-semibold mb-2">Días por cuota</label>
                  <div className="grid grid-cols-4 gap-2">
                    {form.detalles.map((d,i)=>(
                      <div key={i}>
                        <span className="text-[10px] text-gray-400 block mb-0.5">Cuota {i+1}</span>
                        <input type="number" min={1} value={d.dias} onChange={e=>updateDia(i,e.target.value)}
                          className="w-full px-2 py-2 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:border-brand"/>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="block text-xs text-gray-500 font-semibold mb-1.5">Nombre</label>
                <input value={form.plazo} onChange={e=>setForm(p=>({...p,plazo:e.target.value}))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold focus:outline-none focus:border-brand"/>
                <p className="text-[10px] text-gray-400 mt-1">Se genera automáticamente, podés editarlo.</p>
              </div>
            </div>
            <div className="flex gap-2 px-6 py-4 border-t border-gray-100">
              <button onClick={()=>setShowModal(false)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm font-semibold transition-colors">Cancelar</button>
              <button onClick={guardar} disabled={guardando} className="flex-1 py-2.5 bg-brand hover:bg-brand-dark text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50">{guardando?'Guardando...':(editId?'Actualizar':'Crear Plazo')}</button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <h3 className="text-base font-bold text-gray-800 mb-2">¿Eliminar este plazo?</h3>
            <p className="text-sm text-gray-500 mb-5">Las facturas existentes no se verán afectadas.</p>
            <div className="flex gap-2">
              <button onClick={()=>setDeleteId(null)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm font-semibold transition-colors">Cancelar</button>
              <button onClick={confirmarEliminar} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-bold transition-colors">Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
