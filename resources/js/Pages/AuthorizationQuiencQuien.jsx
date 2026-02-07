import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Truck, User, Send, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const AuthorizationCard = () => {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [noData, setNoData] = useState(false);
    const [params, setParams] = useState({ asign: '', uGTYr: '',uu:'' });

    // 1. Capturar los dos parámetros específicos de la URL
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const asign = urlParams.get('asign');
        const uGTYr = urlParams.get('uGTYr');
        const uu = urlParams.get('uu');

        if (!asign || !uGTYr) {
            setNoData(true);
            setIsLoading(false);
        } else {
            setParams({ asign, uGTYr,uu });
            setIsLoading(false);
        }
    }, []);


    const handleConfirm = async (e) => {
        setIsLoading(true); // Es buena práctica activarlo al inicio
        try {
            const response = await fetch(route('AuthorizacionQuienCQuien'), {
                method: "POST",
                body: JSON.stringify({ id: params.asign }),
                headers: { "Content-Type": "application/json" }
            });

            const data = await response.json();

            if (response.ok) {
                // Validamos el status interno que viene en tu JSON
                if (data.status === "already_authorized") {
                    toast.info(data.message); // "Esta asignación ya había sido autorizada previamente."
                    setIsAuthorized(true);
                } else {
                    toast.success("Se ha autorizado correctamente");
                    setIsAuthorized(true);
                }
            } else {
                const message = data?.message || 'Error al actualizar';
                showNotification(message, 'error', 'metroui', 'bottomRight', 7000);
            }
        } catch (error) {
            showNotification('Error inesperado: ' + error.message, 'error', 'metroui', 'bottomRight', 7000);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="flex items-center justify-center min-h-screen bg-[#053AA7] p-4 font-sans relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 rounded-full blur-[120px]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative w-full max-w-md bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] shadow-2xl p-8 text-white"
            >
                {isLoading ? (
                    <div className="flex flex-col items-center py-20">
                        <Loader2 className="animate-spin text-blue-300 mb-4" size={48} />
                        <p className="text-blue-100/70 text-sm font-bold uppercase tracking-widest">Procesando...</p>
                    </div>
                ) : noData ? (
                    <div className="text-center py-10 space-y-6">
                        <AlertCircle size={60} className="text-amber-400 mx-auto" />
                        <h2 className="text-xl font-bold uppercase">Datos Incompletos</h2>
                        <p className="text-blue-200/60 text-sm">No se encontró la unidad o el usuario en el enlace.</p>
                    </div>
                ) : isAuthorized ? (
                    <SuccessView unit={params.asign} />
                ) : (
                    <div className="space-y-8">
                        <div className="text-center">
                            <div className="inline-block p-4 bg-white/10 rounded-3xl mb-4 border border-white/10">
                                <Truck className="text-blue-300" size={40} />
                            </div>
                            <h2 className="text-3xl font-black leading-tight uppercase">
                                Confirmar <br /> <span className="text-blue-300">Aceptación</span>
                            </h2>
                        </div>

                        <div className="space-y-3">
                            <InfoRow icon={<Truck size={20} />} label="Unidad" value={params.uu} highlight />
                            {/* <InfoRow icon={<User size={20} />} label="Usuario" value={params.uGTYr} /> */}
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleConfirm}
                            className="w-full py-5 bg-white text-[#053AA7] font-black rounded-2xl flex items-center justify-center gap-3 uppercase tracking-widest shadow-xl"
                        >
                            <Send size={20} />
                            Confirmar Aceptación
                        </motion.button>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

// Componentes Auxiliares
// const InfoRow = ({ icon, label, value, highlight }) => (
//     <div className={`flex items-center justify-between p-4 rounded-2xl border ${highlight ? 'bg-white/20 border-white/40' : 'bg-white/5 border-white/5'}`}>
//         <div className="flex items-center gap-3 text-blue-200/70">
//             {icon}
//             <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
//         </div>
//         <span className={`font-mono font-bold ${highlight ? 'text-md text-white' : 'text-blue-100'}`}>{value}</span>
//     </div>
// );

const InfoRow = ({ icon, label, value, highlight }) => (
    <div className={`flex items-start justify-between p-4 rounded-2xl border gap-4 ${highlight ? 'bg-white/20 border-white/40' : 'bg-white/5 border-white/5'}`}>
        <div className="flex items-center gap-3 text-blue-200/70 pt-1">
            {icon}
            <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">{label}</span>
        </div>
        <span className={`font-mono font-bold text-right break-words max-w-[60%] ${highlight ? 'text-md text-white' : 'text-blue-100'}`}>
            {value}
        </span>
    </div>
);

const SuccessView = ({ unit }) => (
    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center py-10">
        <div className="w-24 h-24 bg-emerald-400 text-[#053AA7] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/40">
            <CheckCircle size={50} strokeWidth={3} />
        </div>
        <h2 className="text-3xl font-black mb-2">¡CONFIRMADO!</h2>
        <p className="text-blue-100">La unidad <span className="font-bold text-emerald-400"></span> ha sido aceptada correctamente.</p>
    </motion.div>
);

export default AuthorizationCard;