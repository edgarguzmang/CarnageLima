import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Truck, User, MapPin, Send, Hash, Loader2, Lock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const AuthorizationCard = () => {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [statusError, setStatusError] = useState(null);
    const [noData, setNoData] = useState(false); // Nuevo estado para URL vacía
    const [data, setData] = useState({
        asign: '', unfg: '', oprtd: '', dest: '', cgp: '', tytype: ''
    });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('cgp');
        const unidad = params.get('unfg');

        // VALIDACIÓN: Si no hay código o unidad, marcar como "Sin Datos"
        if (!code || !unidad) {
            setNoData(true);
            setIsLoading(false);
            return;
        }

        setData({
            asign: params.get('asign') || 'N/A',
            unfg: unidad,
            oprtd: params.get('oprtd') || 'N/A',
            dest: (params.get('dest') || 'N/A').trim(),
            cgp: code,
            tytype: params.get('tytype') || ''
        });
    }, []);

    const checkCodeStatus = async () => {
        if (noData) return;

        try {
            const response = await fetch(route('CodigoverificacionEstado'), {
                method: 'POST',
                body: JSON.stringify({ code: data.cgp }),
                headers: { 'Content-Type': 'application/json' },
            });

            const result = await response.json();

            if (!response.ok) {
                setStatusError(result.message || "Código no válido");
            } else if (result.estado_label === 'Inactivo') {
                setStatusError("EL CÓDIGO YA HA SIDO UTILIZADO");
            } else {
                setStatusError(null);
            }
        } catch (err) {
            setStatusError("Error de conexión");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (data.cgp !== '') checkCodeStatus();
    }, [data.cgp]);

    const handleAuthorize = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(route('verifycode'), {
                method: 'POST',
                body: JSON.stringify({ unit: data.asign, code: data.cgp, type: data.tytype }),
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Error al autorizar");
            }

            toast.success("Autorización completada.");
            setIsAuthorized(true);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#053AA7] p-4 font-sans relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/30 rounded-full blur-[120px]" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative w-full max-w-md overflow-hidden bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] p-8 text-white"
            >
                {isLoading ? (
                    <div className="flex flex-col items-center py-20">
                        <Loader2 className="animate-spin text-blue-300 mb-4" size={48} />
                        <p className="text-blue-100/70 animate-pulse text-sm font-medium tracking-widest uppercase">Verificando...</p>
                    </div>
                ) : noData ? (
                    /* PANTALLA: SIN DATOS (URL VACÍA) */
                    <div className="text-center py-10 space-y-6">
                        <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto border border-amber-500/50">
                            <AlertCircle size={40} className="text-amber-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Faltan Datos</h2>
                            <p className="text-blue-200/60 text-sm mt-3 leading-relaxed">
                                No se ha detectado una solicitud válida. Por favor, escanee el código QR nuevamente o use el enlace proporcionado por el sistema.
                            </p>
                        </div>
                        <div className="h-px bg-white/10 w-full" />
                        <p className="text-[10px] text-blue-300/40 uppercase font-bold tracking-widest">Error 400: Missing Parameters</p>
                    </div>
                ) : isAuthorized ? (
                    <SuccessView unit={data.unfg} />
                ) : statusError ? (
                    /* PANTALLA: ERROR DE CÓDIGO */
                    <div className="text-center py-8 space-y-6">
                        <div className="w-24 h-24 bg-red-500/20 rounded-3xl flex items-center justify-center mx-auto border border-red-400/30 rotate-12">
                            <Lock size={44} className="text-red-400 -rotate-12" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tight">Acceso Denegado</h2>
                            <p className="bg-red-500/20 text-red-200 text-xs font-bold mt-3 py-2 px-4 rounded-full inline-block border border-red-500/50 uppercase">
                                {statusError}
                            </p>
                        </div>
                        <div className="bg-black/20 p-5 rounded-3xl border border-white/10 text-left space-y-2">
                            <div className="flex justify-between text-xs font-mono"><span className="text-blue-200/50">UNIDAD:</span> <span>{data.unfg}</span></div>
                            <div className="flex justify-between text-xs font-mono"><span className="text-blue-200/50">CÓDIGO:</span> <span>{data.cgp}</span></div>
                        </div>
                    </div>
                ) : (
                    /* VISTA FORMULARIO ACTIVO */
                    <div className="space-y-8">
                        <div className="text-center">
                            <div className="inline-block p-3 bg-white/10 rounded-2xl mb-4 border border-white/10">
                                <Truck className="text-blue-300" size={32} />
                            </div>
                            <h2 className="text-3xl font-black text-white leading-tight">Autorización <br /><span className="text-blue-300 font-light">de
                                {data.tytype === 'SALIDA' ? ' Salida' : ' Entrada'}
                            </span></h2>
                        </div>

                        <div className="space-y-3">
                            {/* <InfoRow icon={<Hash size={18} />} label="Asignación" value={data.asign} /> */}
                            <InfoRow icon={<Truck size={18} />} label="Unidad" value={data.unfg} highlight />
                            <InfoRow icon={<User size={18} />} label="Operador" value={data.oprtd} />
                            <InfoRow icon={<MapPin size={18} />} label="Destino" value={data.dest} />
                        </div>

                        <motion.button
                            disabled={isLoading}
                            whileHover={{ scale: 1.02, backgroundColor: 'white', color: '#053AA7' }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleAuthorize}
                            className="w-full py-5 bg-white text-[#053AA7] font-black rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-colors uppercase tracking-widest text-sm"
                        >
                            <Send size={20} />
                            Confirmar Salida
                        </motion.button>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

// ... (SuccessView e InfoRow se mantienen igual)
const SuccessView = ({ unit }) => (
    <AnimatePresence>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-10">
            <motion.div
                initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }}
                className="w-28 h-28 bg-emerald-400 text-[#053AA7] rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/20"
            >
                <CheckCircle size={64} strokeWidth={2.5} />
            </motion.div>
            <h2 className="text-4xl font-black text-white mb-3">¡LISTO!</h2>
            <p className="text-blue-100 text-lg px-4 leading-relaxed">
                La unidad <span className="text-emerald-400 font-bold underline decoration-2 underline-offset-4">{unit}</span> puede salir.
            </p>
            <div className="mt-12 flex justify-center gap-2">
                {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
                        className="w-2 h-2 bg-emerald-400 rounded-full"
                    />
                ))}
            </div>
        </motion.div>
    </AnimatePresence>
);

const InfoRow = ({ icon, label, value, highlight }) => (
    <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${highlight ? 'bg-white/20 border-white/40 shadow-lg' : 'bg-white/5 border-white/5'}`}>
        <div className="flex items-center gap-3 text-blue-200/70">
            <span className={highlight ? 'text-blue-100' : ''}>{icon}</span>
            <span className="text-[10px] uppercase tracking-[0.15em] font-black">{label}</span>
        </div>
        <span className={`font-mono text-sm font-bold ${highlight ? 'text-white text-base' : 'text-blue-50'}`}>
            {value}
        </span>
    </div>
);

export default AuthorizationCard;