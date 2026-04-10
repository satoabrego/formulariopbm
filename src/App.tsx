import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Clock,
  ChevronDown,
  Megaphone,
  Award,
  Tag,
  Rocket,
  Infinity as InfinityIcon,
  MoreHorizontal,
  Star,
  ArrowRight,
  Monitor,
  Maximize,
  Tv,
  Plane,
  Store,
  ShieldCheck,
  Smile,
  Meh,
  Frown,
  CheckCircle,
  Mail,
  Smartphone,
  Check,
  Loader2
} from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface FormData {
  // Step 1
  nombre: string;
  empresa: string;
  pais: string;
  ejecutivo: string;
  // Step 2
  tipoCampana: string[];
  nps: number | null;
  npsPorQue: string;
  // Step 3
  atencionEjecutivo: number | null;
  tiemposRespuesta: number | null;
  claridadInformacion: number | null;
  ejecucionCampana: number | null;
  calidadFormatos: number | null;
  // Step 4
  efectividadCampana: number | null;
  impactoMarca: string[];
  impactoOtro: string;
  // Step 5
  cumplimientoPlazos: string;
  dentroPresupuesto: string;
  rePautar: string;
  // Step 6
  formatosFuturos: string[];
  mejoras: string;
  // Step 7
  contactoAsesor: string;
  // Step 8
  email: string;
  telefono: string;
}

const initialFormData: FormData = {
  nombre: '',
  empresa: '',
  pais: '',
  ejecutivo: '',
  tipoCampana: [],
  nps: null,
  npsPorQue: '',
  atencionEjecutivo: null,
  tiemposRespuesta: null,
  claridadInformacion: null,
  ejecucionCampana: null,
  calidadFormatos: null,
  efectividadCampana: null,
  impactoMarca: [],
  impactoOtro: '',
  cumplimientoPlazos: '',
  dentroPresupuesto: '',
  rePautar: '',
  formatosFuturos: [],
  mejoras: '',
  contactoAsesor: '',
  email: '',
  telefono: '',
};

export default function App() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [validationError, setValidationError] = useState('');
  const totalSteps = 8;

  const updateForm = (fields: Partial<FormData>) => {
    setForm((prev) => ({ ...prev, ...fields }));
    setValidationError('');
  };

  const validateStep = (s: number): string | null => {
    switch (s) {
      case 2:
        if (form.tipoCampana.length === 0) return 'Selecciona al menos un tipo de campaña.';
        if (form.nps === null) return 'Selecciona una calificación NPS.';
        if (!form.npsPorQue.trim()) return 'Indica por qué diste esa calificación.';
        return null;
      case 3:
        if (form.atencionEjecutivo === null) return 'Califica la atención del ejecutivo.';
        if (form.tiemposRespuesta === null) return 'Califica los tiempos de respuesta.';
        if (form.claridadInformacion === null) return 'Califica la claridad de la información.';
        if (form.ejecucionCampana === null) return 'Califica la ejecución de la campaña.';
        if (form.calidadFormatos === null) return 'Califica la calidad de los formatos.';
        return null;
      case 4:
        if (form.efectividadCampana === null) return 'Selecciona la efectividad de la campaña.';
        if (form.impactoMarca.length === 0) return 'Selecciona al menos un impacto percibido.';
        return null;
      case 5:
        if (!form.cumplimientoPlazos) return 'Indica si se cumplieron los plazos.';
        if (!form.dentroPresupuesto) return 'Indica si se mantuvo dentro del presupuesto.';
        if (!form.rePautar) return 'Indica si te gustaría pautar nuevamente.';
        return null;
      case 6:
        if (form.formatosFuturos.length === 0) return 'Selecciona al menos un formato.';
        if (!form.mejoras.trim()) return 'Escribe qué podríamos mejorar.';
        return null;
      case 7:
        if (!form.contactoAsesor) return 'Indica si deseas contacto de un asesor.';
        return null;
      default:
        return null;
    }
  };

  const nextStep = () => {
    const error = validateStep(step);
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError('');
    if (step === 7 && form.contactoAsesor === 'No') {
      setStep(8);
      handleSubmit();
      return;
    }
    setStep((s) => Math.min(totalSteps, s + 1));
  };
  const prevStep = () => { setValidationError(''); setStep((s) => Math.max(1, s - 1)); };

  const handleSubmit = async () => {
    if (form.contactoAsesor === 'Sí' && !form.email.trim()) {
      setValidationError('El correo electrónico es requerido.');
      return;
    }
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'pbmlatam'), {
        ...form,
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Error al guardar encuesta:', err);
      alert('Hubo un error al enviar la encuesta. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-[100dvh] flex flex-col font-body selection:bg-primary-container/30 overflow-hidden bg-[#0c0e15]">
      <TopBar step={step} />
      
      <main className="flex-grow overflow-y-auto relative scroll-smooth custom-scrollbar">
        <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl pb-32 md:pb-40">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="h-full"
            >
              {step === 1 && <Step1 onNext={nextStep} form={form} updateForm={updateForm} />}
              {step === 2 && <Step2 form={form} updateForm={updateForm} />}
              {step === 3 && <Step3 form={form} updateForm={updateForm} />}
              {step === 4 && <Step4 form={form} updateForm={updateForm} />}
              {step === 5 && <Step5 form={form} updateForm={updateForm} />}
              {step === 6 && <Step6 form={form} updateForm={updateForm} />}
              {step === 7 && <Step7 form={form} updateForm={updateForm} />}
              {step === 8 && <Step8 form={form} updateForm={updateForm} onSubmit={handleSubmit} submitting={submitting} submitted={submitted} validationError={validationError} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {step > 1 && step < 8 && !submitted && <BottomBar step={step} onNext={nextStep} onPrev={prevStep} validationError={validationError} />}
    </div>
  );
}

function TopBar({ step }: { step: number }) {
  const progress = (step / 8) * 100;
  
  return (
    <header className="bg-[#0c0e15] docked full-width top-0 z-50 sticky shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5)]">
      <div className="flex justify-between items-center px-6 py-4 w-full">
        <div className="flex items-center gap-4">
          <button className="active:scale-95 duration-200 hover:bg-[#23252f] transition-colors p-2 rounded-full">
            <ArrowLeft className="text-[#F05A22] w-6 h-6" />
          </button>
          <img src="/static/images/logo.png" alt="Publimovil LATAM" className="h-8 md:h-10 object-contain" />
        </div>
        <div className="hidden md:flex items-center gap-6">
          {step < 8 ? (
            <>
              <span className="text-slate-400 font-label text-sm">Paso {step} de 8</span>
              <div className="w-32 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-[#F05A22] transition-all duration-500" style={{ width: `${progress}%` }}></div>
              </div>
            </>
          ) : (
            <span className="text-lg font-black tracking-tighter text-[#F05A22]">PUBLIMOVIL</span>
          )}
        </div>
      </div>
      {step === 8 && (
        <div className="w-full h-1 bg-surface-container-low">
          <div className="h-full bg-secondary w-full transition-all duration-500"></div>
        </div>
      )}
    </header>
  );
}

function BottomBar({ step, onNext, onPrev, validationError }: { step: number, onNext: () => void, onPrev: () => void, validationError: string }) {
  return (
    <div className="fixed bottom-0 left-0 w-full z-50 pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e15] via-[#0c0e15]/90 to-transparent -z-10 h-32 bottom-0 top-auto"></div>
      {validationError && (
        <div className="pointer-events-auto max-w-4xl mx-auto mb-2 px-6">
          <div className="bg-error/15 border border-error/30 text-error rounded-xl px-4 py-3 text-sm font-medium text-center">
            {validationError}
          </div>
        </div>
      )}
      <nav className="bg-[#11131b]/80 backdrop-blur-xl border-t border-white/5 shadow-2xl flex justify-between items-center px-6 md:px-8 py-4 md:py-5 pointer-events-auto max-w-4xl mx-auto rounded-t-2xl">
        <button 
          onClick={onPrev}
          disabled={step === 1}
          className={`flex items-center justify-center gap-2 px-4 py-3 transition-all duration-300 rounded-xl ${step === 1 ? 'text-slate-600 opacity-50 cursor-not-allowed' : 'text-slate-400 hover:text-[#F05A22] hover:bg-white/5 active:scale-95'}`}
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          <span className="hidden sm:block font-body text-xs font-bold uppercase tracking-widest">Anterior</span>
        </button>
        
        {step > 1 && step < 7 && (
           <div className="hidden md:flex items-center justify-center gap-3">
             <div className="h-1.5 w-10 bg-primary rounded-full shadow-[0_0_10px_rgba(240,90,34,0.4)]"></div>
             <div className="h-1.5 w-2.5 bg-surface-container-highest rounded-full"></div>
             <div className="h-1.5 w-2.5 bg-surface-container-highest rounded-full"></div>
           </div>
        )}

        <button 
          onClick={onNext}
          className="group flex items-center justify-center gap-2 bg-[#F05A22] hover:bg-[#ff6b33] text-white rounded-xl px-6 py-3 md:px-8 md:py-4 active:scale-95 transition-all duration-300 shadow-lg shadow-[#F05A22]/20 hover:shadow-[#F05A22]/40"
        >
          <span className="font-bold tracking-wide text-sm md:text-base">Siguiente</span>
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
        </button>
      </nav>
    </div>
  );
}

// --- Steps ---

function Step1({ onNext, form, updateForm }: { onNext: () => void; form: FormData; updateForm: (f: Partial<FormData>) => void }) {
  return (
    <div className="flex flex-col gap-8 mb-12">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="bg-[#FDE8DF] text-[#F05A22] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Paso 1 de 8</span>
            <div className="h-1 w-24 bg-surface-container-highest rounded-full overflow-hidden">
              <div className="h-full w-[12.5%] bg-primary shadow-[0_0_8px_rgba(240,90,34,0.5)]"></div>
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-headline font-extrabold text-white leading-tight mb-4 tracking-tight">
            Comencemos con tu <span className="text-[#F05A22]">feedback</span>.
          </h2>
          <p className="text-on-surface-variant text-base md:text-lg leading-relaxed max-w-xl">
            En Publimovil LATAM escuchamos a quienes generan impacto. Por favor, completa tus datos para iniciar la encuesta.
          </p>
          <div className="mt-4 flex items-center gap-3 text-[#ff906b]">
            <Clock className="w-5 h-5" />
            <span className="font-medium text-sm">⏱️ Te tomará menos de 3 minutos.</span>
          </div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="bg-surface-container-low rounded-2xl p-6 md:p-10 relative overflow-hidden group shadow-xl border border-white/5"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#F05A22]/5 blur-[120px] -z-10 rounded-full transition-all duration-700 group-hover:bg-[#F05A22]/10"></div>
        <h3 className="font-headline font-bold text-xl md:text-2xl text-white mb-8 flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center text-[#F05A22] text-sm shadow-inner">01</span>
          Información General
        </h3>
        <form className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 md:gap-y-8" onSubmit={(e) => { e.preventDefault(); onNext(); }}>
          <div className="space-y-2 group/field">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1 transition-colors group-focus-within/field:text-primary">
              Nombre <span className="text-on-tertiary-fixed-variant italic lowercase font-normal">(Opcional)</span>
            </label>
            <input type="text" placeholder="Tu nombre completo" value={form.nombre} onChange={(e) => updateForm({ nombre: e.target.value })} className="w-full bg-surface-container-lowest border border-transparent outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-xl py-4 px-5 text-on-surface transition-all duration-300 placeholder:text-outline/40 hover:bg-surface-container-lowest/80" />
          </div>
          <div className="space-y-2 group/field">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#F05A22] ml-1 transition-colors group-focus-within/field:text-primary">
              Empresa <span className="text-error text-xs">*</span>
            </label>
            <input type="text" required placeholder="Nombre de la compañía" value={form.empresa} onChange={(e) => updateForm({ empresa: e.target.value })} className="w-full bg-surface-container-lowest border border-transparent outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-xl py-4 px-5 text-on-surface transition-all duration-300 placeholder:text-outline/40 hover:bg-surface-container-lowest/80" />
          </div>
          <div className="space-y-2 group/field">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#F05A22] ml-1 transition-colors group-focus-within/field:text-primary">
              País <span className="text-error text-xs">*</span>
            </label>
            <div className="relative">
              <select required value={form.pais} onChange={(e) => updateForm({ pais: e.target.value })} className="w-full bg-surface-container-lowest border border-transparent outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-xl py-4 px-5 text-on-surface appearance-none transition-all duration-300 hover:bg-surface-container-lowest/80 cursor-pointer">
                <option value="" disabled>Selecciona un país</option>
                <option>Guatemala</option>
                <option>El Salvador</option>
                <option>Honduras</option>
                <option>Nicaragua</option>
                <option>Costa Rica</option>
                <option>Panamá</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-outline w-5 h-5 transition-transform group-focus-within/field:text-primary group-focus-within/field:rotate-180" />
            </div>
          </div>
          <div className="space-y-2 group/field">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#F05A22] ml-1 transition-colors group-focus-within/field:text-primary">
              Ejecutivo de Cuenta <span className="text-error text-xs">*</span>
            </label>
            <div className="relative">
              <select required value={form.ejecutivo} onChange={(e) => updateForm({ ejecutivo: e.target.value })} className="w-full bg-surface-container-lowest border border-transparent outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-xl py-4 px-5 text-on-surface appearance-none transition-all duration-300 hover:bg-surface-container-lowest/80 cursor-pointer">
                <option value="" disabled>Selecciona tu ejecutivo</option>
                <option>Ejecutivo asignado 1</option>
                <option>Ejecutivo asignado 2</option>
                <option>Otro / No lo sé</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-outline w-5 h-5 transition-transform group-focus-within/field:text-primary group-focus-within/field:rotate-180" />
            </div>
          </div>
          <div className="sm:col-span-2 mt-6 flex justify-end">
            <button type="submit" className="group relative px-8 py-4 bg-primary hover:bg-[#ff6b33] text-on-primary font-bold rounded-xl active:scale-95 transition-all duration-300 overflow-hidden shadow-lg shadow-primary/20 hover:shadow-primary/40">
              <span className="relative z-10 flex items-center gap-2">
                Comenzar Encuesta
                <ChevronRight className="group-hover:translate-x-1 transition-transform w-5 h-5" />
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function Step2({ form, updateForm }: { form: FormData; updateForm: (f: Partial<FormData>) => void }) {
  const toggleCampana = (val: string) => {
    const arr = form.tipoCampana.includes(val)
      ? form.tipoCampana.filter((v) => v !== val)
      : [...form.tipoCampana, val];
    updateForm({ tipoCampana: arr });
  };

  return (
    <div className="space-y-12">
      <div className="mb-12">
        <div className="flex justify-between items-end mb-4">
          <div>
            <span className="text-primary font-bold text-sm tracking-widest uppercase">Paso 02 de 08</span>
            <h2 className="text-3xl md:text-4xl font-headline font-extrabold tracking-tight text-white mt-1">Contexto & Recomendación</h2>
          </div>
          <div className="text-on-surface-variant font-medium text-sm">25% completado</div>
        </div>
        <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
          <div className="h-full bg-primary w-1/4 rounded-full"></div>
        </div>
      </div>

      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Megaphone className="w-6 h-6" />
          </div>
          <h3 className="text-xl md:text-2xl font-headline font-bold text-white">¿Qué tipo de campaña realizaste con Publimovil?</h3>
        </div>
        <p className="text-on-surface-variant text-sm md:text-base max-w-2xl">Selecciona todas las opciones que apliquen a tu última ejecución publicitaria.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: Award, title: 'Branding', desc: 'Posicionamiento y reconocimiento de marca.' },
            { icon: Tag, title: 'Promoción', desc: 'Ofertas temporales o activaciones de venta.' },
            { icon: Rocket, title: 'Lanzamiento', desc: 'Introducción de nuevos productos o servicios.' },
            { icon: InfinityIcon, title: 'Always-on', desc: 'Presencia continua y sostenida en el tiempo.' },
            { icon: MoreHorizontal, title: 'Otro', desc: 'Otros objetivos tácticos específicos.' },
          ].map((item, i) => (
            <label key={i} className="group cursor-pointer">
              <input type="checkbox" className="hidden peer" checked={form.tipoCampana.includes(item.title)} onChange={() => toggleCampana(item.title)} />
              <div className="h-full p-6 bg-surface-container rounded-xl border-2 border-transparent peer-checked:border-primary peer-checked:bg-primary/5 hover:bg-surface-container-highest transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5">
                <div className="flex flex-col gap-4">
                  <item.icon className="w-8 h-8 text-on-surface-variant group-hover:text-primary transition-colors" />
                  <div>
                    <div className="font-bold text-lg text-white">{item.title}</div>
                    <p className="text-xs text-on-surface-variant">{item.desc}</p>
                  </div>
                </div>
              </div>
            </label>
          ))}
        </div>
      </section>

      <section className="space-y-8 pt-8 border-t border-outline-variant/20">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Star className="w-6 h-6" />
            </div>
            <h3 className="text-xl md:text-2xl font-headline font-bold text-white">¿Qué tan probable es que recomiendes Publimovil LATAM a un colega o empresa?</h3>
          </div>
          
          <div className="bg-surface-container-low p-6 md:p-8 rounded-2xl relative overflow-hidden">
            <div className="flex justify-between text-[10px] md:text-xs uppercase tracking-widest font-bold mb-4">
              <span className="text-error">Nada probable</span>
              <span className="text-primary">Neutro</span>
              <span className="text-[#34c759]">Muy probable</span>
            </div>
            <div className="flex gap-1.5 md:gap-2 overflow-x-auto no-scrollbar pb-4 md:pb-0 justify-start lg:justify-center">
              {[0,1,2,3,4,5,6,7,8,9,10].map((num) => (
                <button key={num} type="button" onClick={() => updateForm({ nps: num })} className={`flex-shrink-0 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-lg font-bold text-lg transition-all duration-300 border border-transparent active:scale-90 ${form.nps === num ? 'bg-primary text-on-primary scale-110 shadow-[0_0_20px_rgba(255,144,107,0.4)]' : 'bg-surface-container hover:bg-surface-container-highest hover:scale-105 hover:text-white text-on-surface'}`}>
                  {num}
                </button>
              ))}
            </div>
            <div className="h-1 w-full mt-2 md:mt-6 rounded-full bg-gradient-to-r from-error via-primary to-[#34c759] opacity-30"></div>
          </div>
        </div>
        
        <div className="space-y-4">
          <label className="block text-lg font-headline font-bold text-white">¿Por qué nos diste esa calificación?</label>
          <textarea rows={4} placeholder="Cuéntanos más sobre tu experiencia..." value={form.npsPorQue} onChange={(e) => updateForm({ npsPorQue: e.target.value })} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4 text-on-surface focus:ring-4 focus:ring-primary/20 focus:border-primary/50 hover:bg-surface-container-lowest/80 transition-all duration-300 outline-none resize-none placeholder:text-outline"></textarea>
        </div>
      </section>
    </div>
  );
}

function Step3({ form, updateForm }: { form: FormData; updateForm: (f: Partial<FormData>) => void }) {
  const questions: { title: string; desc: string; key: keyof FormData }[] = [
    { title: 'Atención del ejecutivo', desc: 'Calidad del trato, disposición y profesionalismo del consultor asignado.', key: 'atencionEjecutivo' },
    { title: 'Tiempos de respuesta', desc: 'Agilidad en la comunicación y resolución de requerimientos.', key: 'tiemposRespuesta' },
    { title: 'Claridad de la información', desc: 'Precisión en propuestas comerciales, reportes y especificaciones técnicas.', key: 'claridadInformacion' },
    { title: 'Ejecución de la campaña', desc: 'Cumplimiento de plazos, ubicación de pautas y reportes de exhibición.', key: 'ejecucionCampana' },
    { title: 'Calidad de los formatos publicitarios', desc: 'Estado físico de vallas, calidad de impresión o nitidez en pantallas digitales.', key: 'calidadFormatos' },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-12">
        <span className="inline-block px-4 py-1.5 rounded-full bg-surface-container-highest text-[#F05A22] text-xs font-bold tracking-widest uppercase mb-4 shadow-[inset_0_2px_4px_rgba(255,255,255,0.05)]">
          BLOQUE 4
        </span>
        <h2 className="text-4xl md:text-6xl font-headline font-extrabold tracking-tighter mb-6 text-white leading-none">
          Evaluación del <br/><span className="text-primary-container">Servicio</span>
        </h2>
        <p className="text-on-surface-variant text-lg max-w-2xl leading-relaxed">
          Su opinión es fundamental para optimizar nuestros procesos. Por favor, califique los siguientes aspectos del 1 al 10, donde 1 es deficiente y 10 es excelente.
        </p>
      </div>

      <div className="space-y-6">
        {questions.map((q, i) => (
          <div key={i} className="bg-surface-container-low rounded-xl p-8 transition-all duration-300 hover:bg-surface-container border-l-4 border-transparent hover:border-primary hover:shadow-lg hover:-translate-y-1 group">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-md">
                <h3 className="text-xl font-semibold text-on-surface mb-2 tracking-tight">{q.title}</h3>
                <p className="text-sm text-on-surface-variant">{q.desc}</p>
              </div>
              <div className="flex flex-wrap gap-2 justify-start md:justify-end w-full md:w-auto">
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-4 md:pb-0 w-full md:w-auto">
                  {[1,2,3,4,5,6,7,8,9,10].map(num => (
                    <button key={num} type="button" onClick={() => updateForm({ [q.key]: num })} className={`flex-shrink-0 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-lg font-headline font-bold text-sm transition-all duration-300 active:scale-90 ${num === (form[q.key] as number | null) ? 'bg-primary text-on-primary ring-4 ring-primary/20 shadow-[inset_0_2px_4px_rgba(255,255,255,0.2)] scale-110' : 'bg-surface-container-highest text-on-surface-variant hover:bg-primary-dim hover:text-on-primary hover:scale-105'}`}>
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Step4({ form, updateForm }: { form: FormData; updateForm: (f: Partial<FormData>) => void }) {
  const toggleImpacto = (val: string) => {
    const arr = form.impactoMarca.includes(val)
      ? form.impactoMarca.filter((v) => v !== val)
      : [...form.impactoMarca, val];
    updateForm({ impactoMarca: arr });
  };

  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h2 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tighter text-white leading-tight">
          Impacto de <span className="text-primary italic">Campaña</span>
        </h2>
        <p className="text-on-surface-variant text-lg max-w-2xl">
          Analizamos los resultados para optimizar su futura presencia en el mercado regional.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-12 bg-surface-container rounded-lg p-8 kinetic-glow">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="max-w-xl">
              <h3 className="text-xl md:text-2xl font-headline font-bold text-white mb-2">
                ¿Qué tan efectiva consideras que fue tu campaña en términos de visibilidad y alcance?
              </h3>
              <p className="text-on-surface-variant text-sm font-label">Desliza o selecciona un valor del 1 (Nula) al 10 (Excelente)</p>
            </div>
            <div className="flex items-center gap-2 bg-surface-container-highest px-4 py-2 rounded-xl">
              <span className="text-primary font-headline font-black text-3xl">{form.efectividadCampana ?? '-'}</span>
              <span className="text-on-surface-variant text-xs uppercase font-bold tracking-tighter">Score</span>
            </div>
          </div>
          
          <div className="mt-8 md:mt-12 group">
            <style>{`
              input[type="range"].efectividad-slider {
                -webkit-appearance: none;
                appearance: none;
                width: 100%;
                height: 8px;
                border-radius: 9999px;
                outline: none;
                cursor: pointer;
                background: linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) var(--slider-progress), var(--color-surface-container-low, #1a1c25) var(--slider-progress), var(--color-surface-container-low, #1a1c25) 100%);
              }
              input[type="range"].efectividad-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                background: var(--color-primary);
                border: 4px solid var(--color-surface-container, #1e2029);
                box-shadow: 0 0 12px rgba(240,90,34,0.4);
                cursor: grab;
                transition: box-shadow 0.2s, transform 0.2s;
              }
              input[type="range"].efectividad-slider::-webkit-slider-thumb:hover {
                transform: scale(1.15);
                box-shadow: 0 0 20px rgba(240,90,34,0.6);
              }
              input[type="range"].efectividad-slider::-webkit-slider-thumb:active {
                cursor: grabbing;
                transform: scale(1.2);
              }
              input[type="range"].efectividad-slider::-moz-range-thumb {
                width: 28px;
                height: 28px;
                border-radius: 50%;
                background: var(--color-primary);
                border: 4px solid var(--color-surface-container, #1e2029);
                box-shadow: 0 0 12px rgba(240,90,34,0.4);
                cursor: grab;
              }
              input[type="range"].efectividad-slider::-moz-range-track {
                height: 8px;
                border-radius: 9999px;
                background: var(--color-surface-container-low, #1a1c25);
              }
              input[type="range"].efectividad-slider::-moz-range-progress {
                height: 8px;
                border-radius: 9999px;
                background: var(--color-primary);
              }
            `}</style>
            <div className="relative w-full px-1">
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={form.efectividadCampana ?? 1}
                onChange={(e) => updateForm({ efectividadCampana: Number(e.target.value) })}
                className="efectividad-slider w-full"
                style={{ '--slider-progress': `${(((form.efectividadCampana ?? 1) - 1) / 9) * 100}%` } as React.CSSProperties}
              />
              <div className="flex justify-between mt-1 px-0.5">
                {[...Array(10)].map((_, i) => (
                  <span key={i} className={`text-[10px] font-bold ${(i + 1) === form.efectividadCampana ? 'text-primary' : 'text-outline/40'}`}>{i + 1}</span>
                ))}
              </div>
            </div>
            <div className="flex justify-between mt-2 md:mt-4 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-outline">
              <span>Impacto Mínimo</span>
              <span>Máximo Alcance</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-12 bg-surface-container rounded-lg p-8">
          <h3 className="text-xl md:text-2xl font-headline font-bold text-white mb-8">
            ¿Qué impacto percibiste en tu marca?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {['Mayor reconocimiento', 'Más tráfico', 'Incremento en ventas', 'Mejor posicionamiento', 'No percibí impacto'].map((opt, i) => (
              <label key={i} className="group relative flex items-center p-4 bg-surface-container-low rounded-xl cursor-pointer hover:bg-surface-container-highest transition-all duration-300 border border-transparent hover:border-primary-dim/30">
                <input type="checkbox" className="peer hidden" checked={form.impactoMarca.includes(opt)} onChange={() => toggleImpacto(opt)} />
                <span className="flex-grow font-semibold text-on-surface group-hover:text-primary transition-colors">{opt}</span>
                <div className="w-6 h-6 border-2 border-outline-variant rounded-md peer-checked:bg-primary peer-checked:border-primary flex items-center justify-center transition-all">
                  <Check className="text-on-primary w-4 h-4 font-bold scale-0 peer-checked:scale-100 transition-transform" />
                </div>
              </label>
            ))}
            <label className="group relative flex flex-col gap-2 p-4 bg-surface-container-low rounded-xl cursor-pointer hover:bg-surface-container-highest transition-all duration-300 border border-transparent hover:border-primary-dim/30">
              <span className="font-semibold text-on-surface group-hover:text-primary transition-colors">Otro</span>
              <input type="text" placeholder="Especifique aquí..." value={form.impactoOtro} onChange={(e) => updateForm({ impactoOtro: e.target.value })} className="w-full bg-surface-container-lowest border-none rounded p-2 text-sm text-on-surface focus:ring-1 focus:ring-primary outline-none transition-all" />
            </label>
          </div>
        </div>
      </div>

      <div className="relative w-full h-48 rounded-lg overflow-hidden bg-surface-container group">
        <img alt="Marketing team reviewing data" className="w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFBaxSGM9PlnpDvz68knxObtyxr8NgY2_G5cn30h6rCacHLivaO5yCoeVTvri3G9ZEMzZrukVNXcgwypJgkqy9IxTJUitSA9Lp-XWcazIPyxjRLZq_6amPyj_nFGfPldjf44WDUKTh_RnEBIJGUeWInLrw-328uoJBHW8UJ_c1XdDSp_BNCNTdgtdGZMxgYeBNu1X522jqa7uCx7qKbER7gXYyP_ePooQ2HNxww5sLOFqGaSD8zZ4ADQcA9DF14kXMY2dO5H5Ojjb4" />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-6 bg-gradient-to-t from-background to-transparent">
          <span className="text-primary font-headline font-black text-2xl tracking-tighter">PUBLIMOVIL LATAM</span>
          <p className="text-on-surface-variant font-label text-sm mt-1 uppercase tracking-widest">Connect. Engage. Grow.</p>
        </div>
      </div>
    </div>
  );
}

function Step5({ form, updateForm }: { form: FormData; updateForm: (f: Partial<FormData>) => void }) {
  return (
    <div className="grid gap-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <span className="text-primary font-headline text-sm font-bold uppercase tracking-widest">Paso 5 de 8</span>
          <h2 className="text-display-lg font-headline font-extrabold text-4xl md:text-5xl mt-2 tracking-tight">Operación & Futuro</h2>
        </div>
        <div className="hidden sm:flex h-16 w-16 items-center justify-center rounded-full border-4 border-primary/20">
          <span className="text-primary font-headline font-black text-xl leading-none">62%</span>
        </div>
      </div>

      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-primary/50 to-transparent"></div>
          <h3 className="font-headline font-bold text-on-surface-variant uppercase text-xs tracking-[0.2em]">Bloque 6 - Operación</h3>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-surface-container p-8 rounded-xl space-y-6 flex flex-col justify-between transition-all hover:bg-surface-container-highest group">
            <p className="text-xl font-semibold leading-snug">¿Se cumplieron los plazos acordados?</p>
            <div className="flex gap-4">
              <label className="flex-1 cursor-pointer">
                <input type="radio" name="plazos" className="peer hidden" checked={form.cumplimientoPlazos === 'Sí'} onChange={() => updateForm({ cumplimientoPlazos: 'Sí' })} />
                <div className="flex items-center justify-center p-4 rounded-lg bg-surface-container-low border border-transparent peer-checked:border-primary peer-checked:bg-primary/10 transition-all text-on-surface-variant peer-checked:text-primary">
                  <span className="font-bold">Sí</span>
                </div>
              </label>
              <label className="flex-1 cursor-pointer">
                <input type="radio" name="plazos" className="peer hidden" checked={form.cumplimientoPlazos === 'No'} onChange={() => updateForm({ cumplimientoPlazos: 'No' })} />
                <div className="flex items-center justify-center p-4 rounded-lg bg-surface-container-low border border-transparent peer-checked:border-error peer-checked:bg-error/10 transition-all text-on-surface-variant peer-checked:text-error">
                  <span className="font-bold">No</span>
                </div>
              </label>
            </div>
          </div>
          
          <div className="bg-surface-container p-8 rounded-xl space-y-6 flex flex-col justify-between transition-all hover:bg-surface-container-highest group">
            <p className="text-xl font-semibold leading-snug">¿El servicio se mantuvo dentro del presupuesto?</p>
            <div className="flex gap-4">
              <label className="flex-1 cursor-pointer">
                <input type="radio" name="presupuesto" className="peer hidden" checked={form.dentroPresupuesto === 'Sí'} onChange={() => updateForm({ dentroPresupuesto: 'Sí' })} />
                <div className="flex items-center justify-center p-4 rounded-lg bg-surface-container-low border border-transparent peer-checked:border-primary peer-checked:bg-primary/10 transition-all text-on-surface-variant peer-checked:text-primary">
                  <span className="font-bold">Sí</span>
                </div>
              </label>
              <label className="flex-1 cursor-pointer">
                <input type="radio" name="presupuesto" className="peer hidden" checked={form.dentroPresupuesto === 'No'} onChange={() => updateForm({ dentroPresupuesto: 'No' })} />
                <div className="flex items-center justify-center p-4 rounded-lg bg-surface-container-low border border-transparent peer-checked:border-error peer-checked:bg-error/10 transition-all text-on-surface-variant peer-checked:text-error">
                  <span className="font-bold">No</span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6 pt-6">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-primary/50 to-transparent"></div>
          <h3 className="font-headline font-bold text-on-surface-variant uppercase text-xs tracking-[0.2em]">Bloque 7 - Futuro</h3>
        </div>
        
        <div className="relative overflow-hidden rounded-xl bg-surface-container p-1 shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full"></div>
          <div className="relative p-8 md:p-12 space-y-8">
            <div className="max-w-2xl">
              <h4 className="text-2xl md:text-3xl font-headline font-bold tracking-tight mb-4">¿Te gustaría pautar nuevamente con Publimovil LATAM?</h4>
              <p className="text-on-surface-variant text-sm md:text-base leading-relaxed">Tu visión de futuro nos ayuda a mejorar nuestra propuesta de valor y fortalecer nuestra alianza estratégica.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className="cursor-pointer">
                <input type="radio" name="re-pautar" className="peer hidden" checked={form.rePautar === 'Sí'} onChange={() => updateForm({ rePautar: 'Sí' })} />
                <div className="h-full flex flex-col items-center justify-center gap-4 p-6 rounded-lg bg-surface-container-low border-2 border-transparent peer-checked:border-primary peer-checked:bg-primary/5 transition-all group">
                  <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center group-hover:scale-110 transition-transform peer-checked:bg-primary">
                    <Smile className="text-primary group-hover:text-primary transition-colors peer-checked:text-white" />
                  </div>
                  <span className="font-headline font-bold text-lg text-on-surface-variant peer-checked:text-on-surface">Sí</span>
                </div>
              </label>
              <label className="cursor-pointer">
                <input type="radio" name="re-pautar" className="peer hidden" checked={form.rePautar === 'Tal vez'} onChange={() => updateForm({ rePautar: 'Tal vez' })} />
                <div className="h-full flex flex-col items-center justify-center gap-4 p-6 rounded-lg bg-surface-container-low border-2 border-transparent peer-checked:border-primary peer-checked:bg-primary/5 transition-all group">
                  <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center group-hover:scale-110 transition-transform peer-checked:bg-primary">
                    <Meh className="text-on-surface-variant group-hover:text-primary transition-colors peer-checked:text-white" />
                  </div>
                  <span className="font-headline font-bold text-lg text-on-surface-variant peer-checked:text-on-surface">Tal vez</span>
                </div>
              </label>
              <label className="cursor-pointer">
                <input type="radio" name="re-pautar" className="peer hidden" checked={form.rePautar === 'No'} onChange={() => updateForm({ rePautar: 'No' })} />
                <div className="h-full flex flex-col items-center justify-center gap-4 p-6 rounded-lg bg-surface-container-low border-2 border-transparent peer-checked:border-error peer-checked:bg-error/5 transition-all group">
                  <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center group-hover:scale-110 transition-transform peer-checked:bg-error">
                    <Frown className="text-on-surface-variant group-hover:text-error transition-colors peer-checked:text-white" />
                  </div>
                  <span className="font-headline font-bold text-lg text-on-surface-variant peer-checked:text-on-surface">No</span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Step6({ form, updateForm }: { form: FormData; updateForm: (f: Partial<FormData>) => void }) {
  const toggleFormato = (val: string) => {
    const arr = form.formatosFuturos.includes(val)
      ? form.formatosFuturos.filter((v) => v !== val)
      : [...form.formatosFuturos, val];
    updateForm({ formatosFuturos: arr });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
      <section className="lg:col-span-7 flex flex-col gap-6">
        <div className="space-y-2">
          <span className="text-primary-fixed text-xs font-bold tracking-[0.2em] uppercase">Bloque 7</span>
          <h2 className="text-3xl md:text-4xl font-extrabold font-headline leading-tight tracking-tight text-on-surface">¿En qué formatos te interesaría pautar en el futuro?</h2>
          <p className="text-on-surface-variant text-sm">Selecciona todas las opciones que se alineen con tu estrategia de crecimiento.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { icon: Monitor, label: 'Mupis digitales' },
            { icon: Maximize, label: 'Vallas' },
            { icon: Tv, label: 'Pantallas indoor' },
            { icon: Plane, label: 'Aeropuertos' },
            { icon: Store, label: 'Centros comerciales' },
            { icon: MoreHorizontal, label: 'Otro' },
          ].map((item, i) => (
            <label key={i} className="group relative flex items-center p-4 bg-surface-container rounded-xl cursor-pointer hover:bg-surface-container-highest transition-all duration-300 border border-transparent hover:border-primary-dim/30">
              <input type="checkbox" className="peer hidden" checked={form.formatosFuturos.includes(item.label)} onChange={() => toggleFormato(item.label)} />
              <div className="w-10 h-10 flex items-center justify-center bg-surface-container-low rounded-lg group-hover:bg-primary/10 transition-colors mr-4">
                <item.icon className="text-primary-fixed w-5 h-5" />
              </div>
              <span className="flex-grow font-semibold text-on-surface group-hover:text-primary transition-colors">{item.label}</span>
              <div className="w-6 h-6 border-2 border-outline-variant rounded-md peer-checked:bg-primary peer-checked:border-primary flex items-center justify-center transition-all">
                <Check className="text-on-primary w-4 h-4 font-bold scale-0 peer-checked:scale-100 transition-transform" />
              </div>
            </label>
          ))}
        </div>
      </section>

      <section className="lg:col-span-5 flex flex-col gap-6">
        <div className="glass-panel p-8 rounded-xl border border-outline-variant/10 flex flex-col gap-6">
          <div className="space-y-2">
            <span className="text-primary-fixed text-xs font-bold tracking-[0.2em] uppercase">Bloque 8</span>
            <h2 className="text-2xl font-bold font-headline leading-tight text-on-surface">¿Qué podríamos mejorar para brindarte una mejor experiencia?</h2>
          </div>
          <div className="relative group">
            <textarea rows={6} placeholder="Tu opinión nos ayuda a crecer..." value={form.mejoras} onChange={(e) => updateForm({ mejoras: e.target.value })} className="w-full bg-surface-container-lowest border-none rounded-lg p-5 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/40 transition-all custom-scrollbar resize-none"></textarea>
            <div className="absolute bottom-4 right-4 text-outline text-[10px] font-mono opacity-50 group-focus-within:opacity-100">
              {form.mejoras.length}/500
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
              <ShieldCheck className="text-primary w-5 h-5" />
              <p className="text-[11px] text-on-surface-variant italic">Tu feedback es anónimo y será utilizado únicamente para mejorar nuestros procesos internos.</p>
            </div>
          </div>
        </div>
        
        <div className="hidden lg:block relative h-48 w-full rounded-xl overflow-hidden grayscale opacity-30">
          <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDoNW5r4y863hXvS5DECmVp9OZ8mrm_bK88_3Vp7ZzKqJkvE2Q0P9rt_8tzosviR9XPMGU1DFukpqfVkcPPr5ZTjRYc1KK_qrSeBldrV69ohEtba1RB487Omu8ZXJdVcPcZVsIlRyZJZR-rcn3Z9IIKlKxMRkA3gragW4gaM9TwXSkFxqY9Abs4zmfukYTZsgGakVlSNu4_Q-fznC5C9B8QJ5E3K8GuqT292UlMXhQX-wCHlwzLfmRL4M6T78ZeIhDUZBsFiyDDoe5" alt="Office space" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
        </div>
      </section>
    </div>
  );
}

function Step7({ form, updateForm }: { form: FormData; updateForm: (f: Partial<FormData>) => void }) {
  return (
    <div className="flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-secondary-container/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="w-full z-10">
        <div className="mb-12 flex flex-col gap-4">
          <div className="flex justify-between items-end">
            <span className="font-headline text-primary font-extrabold text-4xl tracking-tighter">07 <span className="text-on-surface-variant text-xl">/ 08</span></span>
            <span className="text-sm text-on-surface-variant font-semibold tracking-widest uppercase">Cierre Estratégico</span>
          </div>
          <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
            <div className="h-full bg-primary kinetic-glow rounded-full w-[87.5%]"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-7 bg-surface-container rounded-xl p-8 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Megaphone className="w-32 h-32" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full mb-6 border border-primary/20">
                <Star className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Compromiso Publimovil</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-headline font-extrabold leading-[1.1] text-white mb-4 md:mb-6">
                Gracias por confiar en <span className="text-primary">Publimovil LATAM</span>.
              </h2>
              <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed max-w-md">
                Tu feedback nos permite seguir creando campañas más efectivas y medibles, adaptadas al ADN de tu marca.
              </p>
            </div>
            <div className="mt-12 flex items-center gap-4">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full border-2 border-surface-container overflow-hidden bg-surface-container-highest">
                  <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD78qxL9TATp-9lYT6R0p4OcFdT66IH9MU3y8uN14m_KBEoiWRtUZEvO-kX--oZkZN7lEG2tlqszCL7tmrPhvlw-wifemd-GyQ_D_Jg6QOz8vQfYPlEa6QMF3-kKmqQNY98QmrugusAh7wwSkAvKu3PdxtEKoFvpni--OmAKwR8NnHGuwB8SatBQ4nk4GbGG6xN8SLGu6ADfJWCQQcuEeA954TE1EyqAWBbW6WTbeUPwMrcopPQgyukJJicG-OcWLLNstoz8y_jbZML" alt="Advisor 1" />
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-surface-container overflow-hidden bg-surface-container-highest">
                  <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDRt_48IGgc0UYTjo6PIrhB-KYdkRfjHu4W2N9HubxGlaoWKLvEgmBJISnuLoKeNljzdKWA_ktjq2_NHmH-eFOJbkdWnQgaLJDVa4z52oh33khUvbHKcfl3cEnkdoDgddQsdJryELjkzmkHCupgPOYN7077OQpTuFBNqttYYOFt-BHR6-0eL5cTIfOWC0ZBSu41-9pUV9qf3e0UwHtBf7R8U6-7lADoK-OQAX7aPIugzbuDxSYtyNaFNhuESjGAzO3Pr8ajpHjWznY5" alt="Advisor 2" />
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-surface-container overflow-hidden bg-surface-container-highest flex items-center justify-center text-[10px] font-bold text-primary-container">
                  +15
                </div>
              </div>
              <span className="text-sm text-on-surface-variant font-medium">Nuestro equipo estratégico a tu disposición</span>
            </div>
          </div>

          <div className="md:col-span-5 flex flex-col gap-6">
            <div className="bg-surface-container-low border-2 border-primary/20 rounded-xl p-8 h-full flex flex-col justify-center">
              <h3 className="font-headline text-xl text-white font-bold leading-tight mb-8">
                ¿Te gustaría que un asesor te contacte para optimizar tu próxima campaña?
              </h3>
              <div className="space-y-4">
                <label className="group relative flex items-center p-4 rounded-xl bg-surface-container cursor-pointer hover:bg-surface-container-highest transition-all duration-200 border border-transparent hover:border-primary/30">
                  <input type="radio" name="advisor_contact" value="yes" className="hidden peer" checked={form.contactoAsesor === 'Sí'} onChange={() => updateForm({ contactoAsesor: 'Sí' })} />
                  <div className="w-6 h-6 rounded-full border-2 border-outline flex items-center justify-center peer-checked:border-primary peer-checked:bg-primary transition-colors">
                    <div className="w-2 h-2 rounded-full bg-on-primary opacity-0 peer-checked:opacity-100"></div>
                  </div>
                  <span className="ml-4 font-semibold text-on-surface group-hover:text-primary transition-colors">Sí, me interesa</span>
                  <Rocket className="ml-auto text-primary opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5" />
                </label>
                <label className="group relative flex items-center p-4 rounded-xl bg-surface-container cursor-pointer hover:bg-surface-container-highest transition-all duration-200 border border-transparent hover:border-outline-variant/30">
                  <input type="radio" name="advisor_contact" value="no" className="hidden peer" checked={form.contactoAsesor === 'No'} onChange={() => updateForm({ contactoAsesor: 'No' })} />
                  <div className="w-6 h-6 rounded-full border-2 border-outline flex items-center justify-center peer-checked:border-outline-variant peer-checked:bg-outline-variant transition-colors">
                    <div className="w-2 h-2 rounded-full bg-white opacity-0 peer-checked:opacity-100"></div>
                  </div>
                  <span className="ml-4 font-semibold text-on-surface-variant group-hover:text-on-surface transition-colors">Por ahora no, gracias</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-8 h-8" />
            <span className="font-bold tracking-widest text-xs">CERTIFIED STRATEGY</span>
          </div>
          <div className="flex items-center gap-2">
            <Monitor className="w-8 h-8" />
            <span className="font-bold tracking-widest text-xs">DATA DRIVEN CAMPAIGNS</span>
          </div>
          <div className="flex items-center gap-2">
            <Plane className="w-8 h-8" />
            <span className="font-bold tracking-widest text-xs">LATAM WIDE REACH</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step8({ form, updateForm, onSubmit, submitting, submitted, validationError }: { form: FormData; updateForm: (f: Partial<FormData>) => void; onSubmit: () => void; submitting: boolean; submitted: boolean; validationError: string }) {
  if (submitted) {
    return (
      <div className="flex items-center justify-center relative overflow-hidden min-h-[60vh]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -z-10"></div>
        <div className="max-w-2xl w-full text-center space-y-6">
          <CheckCircle className="w-20 h-20 text-[#34c759] mx-auto" />
          <h2 className="text-4xl md:text-5xl font-headline font-extrabold text-white tracking-tight">¡Gracias!</h2>
          <p className="text-on-surface-variant text-lg">Tu encuesta ha sido enviada exitosamente. Valoramos mucho tu opinión.</p>
          <span className="text-primary font-headline font-black text-2xl tracking-tighter">PUBLIMOVIL LATAM</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center relative overflow-hidden min-h-[60vh]">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-[100px] -z-10"></div>
      
      <div className="max-w-2xl w-full">
        <div className="mb-8">
          <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-surface-container-highest text-primary font-bold text-xs tracking-widest uppercase">
            Paso 8 de 8
          </span>
        </div>
        
        <div className="bg-surface-container p-8 md:p-12 rounded-xl kinetic-glow relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary opacity-50"></div>
          <div className="relative z-10 space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-[2.5rem] md:text-[3.5rem] font-headline font-extrabold text-on-surface leading-[1.1] tracking-tight">
                ¡Excelente elección!
              </h2>
              <p className="text-on-surface-variant text-base sm:text-lg leading-relaxed max-w-lg">
                Un asesor se pondrá en contacto contigo pronto. Déjanos tus datos para agilizar el proceso.
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-6 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-on-surface-variant ml-1">Correo Electrónico <span className="text-error text-xs">*</span></label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
                  <input type="email" required placeholder="ejemplo@correo.com" value={form.email} onChange={(e) => updateForm({ email: e.target.value })} className="w-full bg-surface-container-lowest outline outline-1 outline-outline-variant/20 border-none rounded-lg py-4 pl-12 pr-4 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/50 transition-all" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-on-surface-variant ml-1">Teléfono (Opcional)</label>
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
                  <input type="tel" placeholder="+502 0000 0000" value={form.telefono} onChange={(e) => updateForm({ telefono: e.target.value })} className="w-full bg-surface-container-lowest outline outline-1 outline-outline-variant/20 border-none rounded-lg py-4 pl-12 pr-4 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/50 transition-all" />
                </div>
              </div>
            </div>
            
            <div className="pt-6">
              <button type="button" onClick={onSubmit} disabled={submitting} className="w-full md:w-auto bg-primary hover:bg-primary-dim text-on-primary font-bold px-10 py-5 rounded-lg shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)] transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting ? (<><Loader2 className="w-5 h-5 animate-spin" /> Enviando...</>) : (<>Finalizar Encuesta <CheckCircle className="w-5 h-5" /></>)}
              </button>
              <p className="mt-4 text-xs text-outline text-center md:text-left">
                Al finalizar, aceptas nuestra política de tratamiento de datos personales.
              </p>
              {validationError && (
                <div className="mt-4 bg-error/15 border border-error/30 text-error rounded-xl px-4 py-3 text-sm font-medium text-center">
                  {validationError}
                </div>
              )}
            </div>
          </div>
          
          <div className="absolute top-12 right-[-10%] opacity-10 pointer-events-none hidden lg:block">
            <img alt="Abstract visual" className="w-64 h-64 object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDpR0ZaYjaGDNyTZvwAVbt5tVpR_BlC8t6PNnR1TuG0UpUpLyYGLsVprxUIlMj6t_x24cymnga0CMXFTq5usyATjKF_Kv3Ajlknw1i5crkxdiFKtpNSAP70tSARD0E8u4dMXqaW941_EAZ3jpUBgEtubqjfZyVZxCJxNG2tqzAahsyLXdOPNaZcPnyRLj7AcD2lRQHEVVrewtk_nGbkTed87uHoYa8jCgZylbL3aGtMw18r2xpQdlGjxTwyWg9Z7d4AE72uuKdg4FXp" />
          </div>
        </div>
      </div>
    </div>
  );
}

