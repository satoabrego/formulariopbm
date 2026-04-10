import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { FormData } from './App';
import {
  Loader2,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Search,
  Users,
  BarChart3,
  Star,
  X,
} from 'lucide-react';

interface ResponseDoc extends FormData {
  id: string;
  createdAt: Timestamp | null;
}

const ratingFields: { key: keyof FormData; label: string }[] = [
  { key: 'atencionEjecutivo', label: 'Atención ejecutivo' },
  { key: 'tiemposRespuesta', label: 'Tiempos respuesta' },
  { key: 'claridadInformacion', label: 'Claridad información' },
  { key: 'ejecucionCampana', label: 'Ejecución campaña' },
  { key: 'calidadFormatos', label: 'Calidad formatos' },
  { key: 'efectividadCampana', label: 'Efectividad campaña' },
];

export default function Admin() {
  const [responses, setResponses] = useState<ResponseDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPais, setFilterPais] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(collection(db, 'pbmlatam'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ResponseDoc[];
        setResponses(docs);
      } catch (err) {
        console.error('Error fetching responses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const paises = [...new Set(responses.map((r) => r.pais).filter(Boolean))];

  const filtered = responses.filter((r) => {
    const matchSearch =
      !searchTerm ||
      r.empresa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchPais = !filterPais || r.pais === filterPais;
    return matchSearch && matchPais;
  });

  const avgNps =
    filtered.length > 0
      ? (filtered.reduce((sum, r) => sum + (r.nps ?? 0), 0) / filtered.filter((r) => r.nps !== null).length).toFixed(1)
      : '-';

  const avgRatings = ratingFields.map((f) => {
    const valid = filtered.filter((r) => (r[f.key] as number | null) !== null);
    const avg = valid.length > 0 ? (valid.reduce((s, r) => s + ((r[f.key] as number) ?? 0), 0) / valid.length).toFixed(1) : '-';
    return { ...f, avg };
  });

  const formatDate = (ts: Timestamp | null) => {
    if (!ts) return '-';
    const d = ts.toDate();
    return d.toLocaleDateString('es-GT', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c0e15] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0e15] text-white font-body">
      {/* Header */}
      <header className="bg-[#11131b] border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => { window.history.pushState({}, '', '/'); window.dispatchEvent(new PopStateEvent('popstate')); }}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-on-surface-variant" />
            </button>
            <div>
              <h1 className="text-xl font-headline font-extrabold tracking-tight">Panel de Respuestas</h1>
              <p className="text-xs text-on-surface-variant">Publimovil LATAM — Encuesta de Satisfacción</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-surface-container px-4 py-2 rounded-xl">
            <Users className="w-4 h-4 text-primary" />
            <span className="font-bold text-sm">{filtered.length}</span>
            <span className="text-on-surface-variant text-xs">respuestas</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surface-container rounded-xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-on-surface-variant text-xs font-bold uppercase tracking-widest">
              <Users className="w-4 h-4" /> Total
            </div>
            <p className="text-3xl font-headline font-black text-white">{filtered.length}</p>
          </div>
          <div className="bg-surface-container rounded-xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-on-surface-variant text-xs font-bold uppercase tracking-widest">
              <Star className="w-4 h-4" /> NPS Promedio
            </div>
            <p className="text-3xl font-headline font-black text-primary">{avgNps}</p>
          </div>
          <div className="bg-surface-container rounded-xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-on-surface-variant text-xs font-bold uppercase tracking-widest">
              <BarChart3 className="w-4 h-4" /> Re-pautar Sí
            </div>
            <p className="text-3xl font-headline font-black text-[#34c759]">
              {filtered.filter((r) => r.rePautar === 'Sí').length}
            </p>
          </div>
          <div className="bg-surface-container rounded-xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-on-surface-variant text-xs font-bold uppercase tracking-widest">
              <BarChart3 className="w-4 h-4" /> Contacto Sí
            </div>
            <p className="text-3xl font-headline font-black text-[#34c759]">
              {filtered.filter((r) => r.contactoAsesor === 'Sí').length}
            </p>
          </div>
        </div>

        {/* Average ratings */}
        <div className="bg-surface-container rounded-xl p-6">
          <h3 className="font-headline font-bold text-sm uppercase tracking-widest text-on-surface-variant mb-4">Promedios de Evaluación</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {avgRatings.map((r) => (
              <div key={r.key} className="text-center space-y-1">
                <p className="text-2xl font-headline font-black text-primary">{r.avg}</p>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">{r.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
            <input
              type="text"
              placeholder="Buscar por empresa, nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface-container border-none rounded-xl py-3 pl-10 pr-4 text-sm text-on-surface placeholder:text-outline outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-outline hover:text-white" />
              </button>
            )}
          </div>
          <select
            value={filterPais}
            onChange={(e) => setFilterPais(e.target.value)}
            className="bg-surface-container border-none rounded-xl py-3 px-4 text-sm text-on-surface appearance-none outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer min-w-[160px]"
          >
            <option value="">Todos los países</option>
            {paises.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Responses list */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-16 text-on-surface-variant">
              <p className="text-lg font-semibold">No se encontraron respuestas</p>
              <p className="text-sm mt-1">Ajusta los filtros o espera nuevas encuestas.</p>
            </div>
          )}

          {filtered.map((r) => {
            const isExpanded = expandedId === r.id;
            return (
              <div key={r.id} className="bg-surface-container rounded-xl overflow-hidden transition-all duration-300 hover:bg-surface-container-highest/50">
                {/* Summary row */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : r.id)}
                  className="w-full flex items-center gap-4 p-5 text-left"
                >
                  <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 items-center">
                    <div className="truncate">
                      <p className="font-bold text-white text-sm truncate">{r.empresa || 'Sin empresa'}</p>
                      <p className="text-xs text-on-surface-variant truncate">{r.nombre || 'Anónimo'}</p>
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-xs text-on-surface-variant">País</p>
                      <p className="text-sm font-semibold">{r.pais || '-'}</p>
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-xs text-on-surface-variant">NPS</p>
                      <p className={`text-sm font-black ${(r.nps ?? 0) >= 9 ? 'text-[#34c759]' : (r.nps ?? 0) >= 7 ? 'text-primary' : 'text-error'}`}>
                        {r.nps ?? '-'}
                      </p>
                    </div>
                    <div className="hidden sm:block text-right">
                      <p className="text-xs text-on-surface-variant">{formatDate(r.createdAt)}</p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-on-surface-variant shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-on-surface-variant shrink-0" />
                  )}
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-white/5 p-5 space-y-6 animate-in fade-in">
                    {/* Info general */}
                    <section>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Información General</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <Detail label="Nombre" value={r.nombre} />
                        <Detail label="Empresa" value={r.empresa} />
                        <Detail label="País" value={r.pais} />
                        <Detail label="Ejecutivo" value={r.ejecutivo} />
                      </div>
                    </section>

                    {/* Campaña */}
                    <section>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Campaña</h4>
                      <div className="space-y-2 text-sm">
                        <Detail label="Tipo de campaña" value={r.tipoCampana?.join(', ')} />
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <Detail label="NPS" value={r.nps?.toString()} />
                          <Detail label="¿Por qué?" value={r.npsPorQue} />
                        </div>
                      </div>
                    </section>

                    {/* Evaluación servicio */}
                    <section>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Evaluación del Servicio</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                        {ratingFields.slice(0, 5).map((f) => (
                          <div key={f.key} className="bg-surface-container-low rounded-lg p-3 text-center">
                            <p className="text-xl font-black text-primary">{(r[f.key] as number) ?? '-'}</p>
                            <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-widest mt-1">{f.label}</p>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Impacto */}
                    <section>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Impacto de Campaña</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <Detail label="Efectividad" value={r.efectividadCampana?.toString()} />
                        <Detail label="Impacto percibido" value={r.impactoMarca?.join(', ')} />
                        {r.impactoOtro && <Detail label="Otro impacto" value={r.impactoOtro} />}
                      </div>
                    </section>

                    {/* Operación */}
                    <section>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Operación & Futuro</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <Detail label="Plazos cumplidos" value={r.cumplimientoPlazos} />
                        <Detail label="Dentro presupuesto" value={r.dentroPresupuesto} />
                        <Detail label="Re-pautar" value={r.rePautar} />
                      </div>
                    </section>

                    {/* Formatos y mejoras */}
                    <section>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Formatos & Mejoras</h4>
                      <div className="space-y-2 text-sm">
                        <Detail label="Formatos futuros" value={r.formatosFuturos?.join(', ')} />
                        <Detail label="Mejoras sugeridas" value={r.mejoras} />
                      </div>
                    </section>

                    {/* Contacto */}
                    <section>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Contacto</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <Detail label="¿Contacto asesor?" value={r.contactoAsesor} />
                        <Detail label="Email" value={r.email} />
                        <Detail label="Teléfono" value={r.telefono} />
                      </div>
                    </section>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{label}</p>
      <p className="text-on-surface mt-0.5">{value || '-'}</p>
    </div>
  );
}
