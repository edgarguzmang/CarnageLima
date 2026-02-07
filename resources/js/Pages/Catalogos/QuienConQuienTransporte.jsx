// import Datatable from "@/components/Datatable";
// import LoadingDiv from "@/components/LoadingDiv";
// import request from "@/utils";
// import { Dialog, DialogPanel, DialogTitle, Transition } from '@headlessui/react';

// import {
//     Truck,
//     User,
//     Plus,
//     ArrowRight,
//     ClipboardList,
//     FileText,
//     Clock,
//     ArrowUpRight,
//     ArrowDownLeft,
//     ChevronsRight, SendHorizontal,
//     UsersRound
// } from 'lucide-react';

// import { useEffect, useState } from "react";
// import { toast } from 'sonner';

// function DialogAyudantes({ isOpen, closeModal, onSubmit, motivoToEdit, action, errors, setErrors }) {
//     // Cambiado de unitData a motivoData
//     const [motivoData, setMotivoData] = useState([]);
//     const [loading, setLoading] = useState(false);

//     // Sincroniza los datos al abrir el modal o cambiar el motivo a editar
//     useEffect(() => {
//         if (isOpen) {
//             const dataToLoad = motivoToEdit
//                 ? {
//                     ...motivoToEdit,
//                     Motivos_nombre: motivoToEdit.Motivos_nombre || "",
//                     Motivos_tipo: "EN",
//                     Motivos_descripcion: motivoToEdit.Motivos_descripcion || "",
//                     Motivos_estatus: motivoToEdit.Motivos_estatus || "1",
//                 }
//                 : initialMotivoData;
//             setMotivoData(dataToLoad);
//             setErrors({}); // Limpia errores al abrir
//         }
//     }, [isOpen, motivoToEdit]);


//     const handleChange = (e) => {
//         const { name, value, type, checked } = e.target;

//         setMotivoData(prevData => ({
//             ...prevData,
//             [name]: type === 'checkbox' ? (checked ? "1" : "0") : value
//         }));

//         if (errors[name]) {
//             setErrors(prevErrors => {
//                 const newErrors = { ...prevErrors };
//                 delete newErrors[name];
//                 return newErrors;
//             });
//         }
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         setLoading(true);
//         try {
//             // Llama a la función onSubmit del padre, pasándole los datos del formulario
//             await onSubmit(motivoData);
//             // Si la función onSubmit tiene éxito (no lanza error), cierra el modal.
//             closeModal();
//         } catch (error) {
//             console.error("Error al enviar el formulario:", error);
//             // El error es propagado desde el padre, si falla, el modal no se cierra.
//         } finally {
//             setLoading(false);
//         }
//     };

//     const dialogTitle = action === 'create' ? 'Agregar ayudantes' : 'Editar ayudantes';

//     return (
//         <Dialog open={isOpen} onClose={closeModal} className="relative z-50">
//             {/* Overlay de fondo */}
//             <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

//             {/* Contenedor del Modal */}
//             <div className="fixed inset-0 flex items-center justify-center p-4">
//                 <DialogPanel className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl relative">
//                     {loading && <LoadingDiv />}
//                     <DialogTitle className="text-2xl font-bold mb-4 text-gray-900 border-b pb-2">
//                         {dialogTitle}
//                     </DialogTitle>

//                     <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
//                         <div className="space-y-3">
//                             {/* Input Nombre */}
//                             <label className="block">
//                                 <span className="text-sm font-medium text-gray-700">Nombre del Motivo: <span className="text-red-500">*</span></span>
//                                 <input
//                                     type="text"
//                                     name="Motivos_nombre"
//                                     value={motivoData.Motivos_nombre}
//                                     onChange={handleChange}
//                                     className={`mt-1 block w-full rounded-md border p-2 text-sm ${errors.Motivos_nombre ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
//                                 />
//                                 {errors.Motivos_nombre && <p className="text-red-500 text-xs mt-1">{errors.Motivos_nombre}</p>}
//                             </label>


//                             {/* <label className="block">
//                                 <span className="text-sm font-medium text-gray-700">Tipo: <span className="text-red-500">*</span></span>
//                                 <input
//                                     type="text"
//                                     name="Motivos_tipo"
//                                     value={motivoData.Motivos_tipo}
//                                     onChange={handleChange}
//                                     className={`mt-1 block w-full rounded-md border p-2 text-sm ${errors.Motivos_tipo ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
//                                 />
//                                 {errors.Motivos_nombre && <p className="text-red-500 text-xs mt-1">{errors.Motivos_tipo}</p>}
//                             </label> */}

//                             {/* Textarea Descripción */}
//                             <label className="block">
//                                 <span className="text-sm font-medium text-gray-700">Descripción:</span>
//                                 <textarea
//                                     name="Motivos_descripcion"
//                                     value={motivoData.Motivos_descripcion}
//                                     onChange={handleChange}
//                                     rows="3"
//                                     className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500"
//                                 />
//                             </label>


//                             <div className="flex justify-center w-full"> {/* <-- Contenedor agregado y clases de centrado */}
//                                 <label className="flex items-center space-x-2">
//                                     <input
//                                         type="checkbox"
//                                         name="Motivos_estatus"
//                                         checked={motivoData.Motivos_estatus == 1} // Usamos == para manejar 1 o '1'
//                                         onChange={handleChange}
//                                         className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//                                     />
//                                     <span className="text-sm font-medium text-gray-700">Estatus</span>
//                                 </label>
//                             </div>
//                         </div>

//                         <div className="flex justify-end gap-3 pt-4 border-t mt-4">
//                             <button
//                                 type="button"
//                                 onClick={closeModal}
//                                 disabled={loading}
//                                 className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
//                             >
//                                 Cancelar
//                             </button>
//                             <button
//                                 type="submit"
//                                 disabled={loading}
//                                 className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
//                             >
//                                 {loading ? (action === 'create' ? 'Registrando...' : 'Actualizando...') : (action === 'create' ? 'Guardar Motivo' : 'Actualizar Motivo')}
//                             </button>
//                         </div>

//                     </form>
//                 </DialogPanel>
//             </div>
//         </Dialog>
//     )
// }


// export default function QuienConQuienTransporte() {
//     const [modData, setModData] = useState([]);
//     const [states, setStates] = useState({
//         loading: true,
//         open: false,
//         choferes: [],
//         destinos: [],
//         motivos: [],
//         quienConQuien: [],
//         dashboard: [],
//         tipo: ''
//     });

//     const userObject = JSON.parse(localStorage.getItem('user'));

//     const getWho = async () => {
//         const [
//             destinos,
//             motivos,
//             choferes,
//             Qconquien,
//             dashboard
//         ] = await Promise.all([
//             request(route('DestinosQuiencQuien')),
//             request(route('MotivosQuiencQuien')),
//             request(route('users.index')),
//             request(route('QuienconQuienUnidades')),
//             request(route('QuienconQuienUnidadesDashboard')),


//         ]);

//         setStates(prev => ({
//             ...prev,
//             quienConQuien: Qconquien,
//             motivos: motivos,
//             destinos: destinos,
//             choferes: choferes,
//             dashboard: dashboard,
//             loading: false,
//         }));
//     };

//     const [isDialogOpen, setIsDialogOpen] = useState(false);
//     const [motivos, setMotivos] = useState([]); // Cambiado a motivos
//     const [action, setAction] = useState('create');
//     const [motivoData, setMotivoData] = useState([

//     ]); // Cambiado a motivoData
//     const [errors, setErrors] = useState({});
//     const [isLoading, setIsLoading] = useState(true);

//     const processWhoEquals = (who = {}, whoData = states.quienConQuien) => {
//         const unSavedWho = []; // aquí puedes implementar tu lógica real
//         const unsavedWhoIds = unSavedWho.map(reg => reg.CUA_unidadID);

//         // NUEVO CÓDIGO
//         const newWhoByWhoData = whoData.map(reg => {
//             // Extrae 'quienConQuien_checkout' y la ignora.
//             // 'restOfReg' contiene todas las otras propiedades de 'reg'.
//             const { quienConQuien_checkout, ...restOfReg } = reg;

//             // Devuelve el nuevo objeto sin la propiedad excluida.
//             return restOfReg;
//         });
//         const whoIndex = newWhoByWhoData.findIndex(q => q.CUA_unidadID == who.CUA_unidadID);
//         if (whoIndex !== -1) {
//             newWhoByWhoData[whoIndex] = who;
//         }

//         return {
//             newModData: [
//                 ...modData.filter(q => !unsavedWhoIds.includes(q.CUA_unidadID) && q.CUA_unidadID !== who.CUA_unidadID),
//                 ...unSavedWho,
//                 who
//             ],
//             unsavedWhoIds,
//             newWhoByWhoData
//         };
//     };

//     const updateWhoRow = (e) => {
//         if (e.newData) {
//             const newData = { ...e.oldData, ...e.newData };
//             const { newModData, newWhoByWhoData } = processWhoEquals(newData);
//             setStates(prev => ({ ...prev, quienConQuien: newWhoByWhoData }));
//             setModData(newModData);
//         }
//     };



//     useEffect(() => {
//         getWho();
//     }, []);

//     // DEFINE ESTA FUNCIÓN FUERA DEL ARRAY DE COLUMNAS, EN EL MISMO COMPONENTE QUE LAS USA
//     const hasData = (value) => {
//         // Verifica si el valor no es null ni undefined
//         if (value == null) {
//             return false;
//         }
//         // Para strings, verifica que no esté vacío después de quitar espacios
//         if (typeof value === 'string') {
//             return value.trim().length > 0;
//         }
//         // Para números/IDs, si no es null/undefined, se considera que tiene datos
//         return true;
//     };

//     function StatCard({ name, value, color = 'text-gray-900', icon: Icon }) {
//         return (
//             <div className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100 flex items-center justify-between transition transform hover:scale-[1.01] duration-300 ease-in-out">
//                 <div>
//                     <p className="text-sm font-medium text-gray-500">{name}</p>
//                     <p className={`mt-1 text-4xl font-extrabold ${color}`}>{value}</p>
//                 </div>
//                 {/* Icono con color tenue y un círculo de fondo para contraste */}
//                 <div className={`p-3 rounded-full ${color.replace('text-', 'bg-')} bg-opacity-10`}>
//                     {Icon && <Icon className={`w-8 h-8 ${color}`} />}
//                 </div>
//             </div>
//         );
//     }

//     const stats = [
//         { name: 'Unidades fuera de area', value: states.dashboard.totalVerde ?? 0, icon: Truck, color: 'text-green-600' },
//         { name: 'Unidades en patio', value: states.dashboard.totalAmarillo ?? 0, icon: Truck, color: 'text-yellow-600' },
//         { name: 'Unidades sin asignar ', value: states.dashboard.totalRojo ?? 0, icon: Truck, color: 'text-red-500' },
//     ];



//     return (
//         <div className="relative h-[98%] pb-4 px-3 overflow-auto blue-scroll">
//             {states.loading &&
//                 <div className='flex items-center justify-center h-[100%] w-full'> <LoadingDiv /> </div>

//             }
//             {!states.loading &&
//                 <div className="flex flex-col h-full">

//                     <div className="flex justify-between items-center p-3 border-b mb-4">
//                         <h2 className="text-3xl font-bold text-gray-800">Gestion de Quien con quien </h2>

//                     </div>

//                     <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8">
//                         {stats.map((stat) => (
//                             <StatCard key={stat.name} {...stat} />
//                         ))}
//                     </div>


//                     <div className="quienConQuienTablaTotal">
//                         <Datatable
//                             data={states.quienConQuien}
//                             virtual={true}
//                             tableId={'CUA_unidadID'}
//                             searcher={false}
//                             handleRowUpdating={updateWhoRow}
//                             editingMode={{ mode: "cell", allowUpdating: true }}
//                             columns={
//                                 [
//                                     {
//                                         header: "Estatus",
//                                         accessor: "Unidades_estatus",
//                                         width: '5%',
//                                         cell: ({ item: { CUA_choferID, CUA_motivoID, CUA_destino, UltimoMovimiento } }) => {
//                                             const allDataPresent = hasData(CUA_choferID) && hasData(CUA_motivoID) && hasData(CUA_destino);
//                                             let color = "bg-red-300"; // ROJO: Por defecto o si faltan datos
//                                             if (allDataPresent) {
//                                                 if (UltimoMovimiento === "SALIDA") {
//                                                     color = "bg-green-300"; // VERDE: Todo completo y SALIDA
//                                                 } else if (UltimoMovimiento === "ENTRADA") {
//                                                     color = "bg-yellow-300"; // AMARILLO: Todo completo y ENTRADA
//                                                 }
//                                             }
//                                             return (
//                                                 <span className={`inline-flex items-center justify-center rounded-full ${color} w-4 h-4`} />
//                                             );
//                                         },
//                                     },

//                                     {
//                                         header: 'Unidad',
//                                         accessor: 'Unidades_numeroEconomico',
//                                         alignment: 'start',
//                                         width: '10%',
//                                         editable: false
//                                     },
//                                     {
//                                         header: 'Choferes',
//                                         accessor: 'CUA_choferID',
//                                         width: '30%',
//                                         lookup: {
//                                             dataSource: states.choferes,
//                                             displayExpr: "nombre_completo",
//                                             valueExpr: "Personas_usuarioID",
//                                         },
//                                     },
//                                     {
//                                         header: 'Motivos',
//                                         accessor: 'CUA_motivoID',
//                                         width: '20%',
//                                         lookup: {
//                                             dataSource: states.motivos,
//                                             displayExpr: "Motivos_nombre",
//                                             valueExpr: "Motivos_motivoID",
//                                         },
//                                     },
//                                     {
//                                         header: 'Destinos',
//                                         accessor: 'CUA_destino',
//                                         width: '30%',
//                                         lookup: {
//                                             dataSource: states.destinos,
//                                             displayExpr: "Destinos_Nombre",
//                                             valueExpr: "Destinos_Id",
//                                         },
//                                     },
//                                     {
//                                         header: "Ayudantes",
//                                         accessor: "Acciones",
//                                         width: '5%',
//                                         cell: ({ item }) => {
//                                             const { CUA_choferID, CUA_motivoID, CUA_destino, UltimoMovimiento } = item;

//                                             // 1. Verificar si todos los datos requeridos están presentes (similar a isGreen en el original)
//                                             const allDataPresent = hasData(CUA_choferID) && hasData(CUA_motivoID) && hasData(CUA_destino);

//                                             // 2. Determinar si el botón debe estar deshabilitado/oculto (solo si el estado es VERDE)
//                                             // Está deshabilitado/oculto si: Todos los datos están presentes Y UltimoMovimiento es "SALIDA"
//                                             const isDisabled = allDataPresent && UltimoMovimiento === "SALIDA";

//                                             // Si isDisabled es true (Estado VERDE), el botón NO es visible/interactuable.
//                                             if (isDisabled) {
//                                                 return <div style={{ width: '20px', height: '20px' }}></div>; // Retorna un espacio vacío
//                                             }

//                                             // Si llegamos aquí, el estado es ROJO o AMARILLO, por lo que el botón es visible y activo.
//                                             const iconColor = 'green';
//                                             const cursorStyle = 'pointer';

//                                             // const handleClick = () => {
//                                             //     // Aquí ya no necesitamos el chequeo de `!isDisabled` porque se maneja con el `if (isDisabled)` de arriba.
//                                             //     // Pero si decides no devolver nada para `isDisabled`, la verificación de abajo sigue siendo importante.
//                                             //     if (!isDisabled) {
//                                             //         SubmitQuien(item);
//                                             //     }
//                                             // };

//                                             return (
//                                                 <div style={{ display: 'flex', justifyContent: 'center' }}>
//                                                     <UsersRound
//                                                         style={{
//                                                             width: '20px',
//                                                             color: 'blue',
//                                                             cursor: cursorStyle,
//                                                             opacity: 1 // La opacidad siempre es 1 ya que el caso 'deshabilitado' está oculto
//                                                         }}
//                                                     // onClick={handleClick}
//                                                     />
//                                                 </div>
//                                             );
//                                         },
//                                     },

//                                     {
//                                         header: "Acciones",
//                                         accessor: "Acciones",
//                                         width: '5%',
//                                         cell: ({ item }) => {
//                                             const { CUA_choferID, CUA_motivoID, CUA_destino, UltimoMovimiento } = item;

//                                             // 1. Verificar si todos los datos requeridos están presentes (similar a isGreen en el original)
//                                             const allDataPresent = hasData(CUA_choferID) && hasData(CUA_motivoID) && hasData(CUA_destino);

//                                             // 2. Determinar si el botón debe estar deshabilitado/oculto (solo si el estado es VERDE)
//                                             // Está deshabilitado/oculto si: Todos los datos están presentes Y UltimoMovimiento es "SALIDA"
//                                             const isDisabled = allDataPresent && UltimoMovimiento === "SALIDA";

//                                             // Si isDisabled es true (Estado VERDE), el botón NO es visible/interactuable.
//                                             if (isDisabled) {
//                                                 return <div style={{ width: '20px', height: '20px' }}></div>; // Retorna un espacio vacío
//                                             }

//                                             // Si llegamos aquí, el estado es ROJO o AMARILLO, por lo que el botón es visible y activo.
//                                             const iconColor = 'green';
//                                             const cursorStyle = 'pointer';

//                                             const handleClick = () => {
//                                                 // Aquí ya no necesitamos el chequeo de `!isDisabled` porque se maneja con el `if (isDisabled)` de arriba.
//                                                 // Pero si decides no devolver nada para `isDisabled`, la verificación de abajo sigue siendo importante.
//                                                 if (!isDisabled) {
//                                                     SubmitQuien(item);
//                                                 }
//                                             };

//                                             return (
//                                                 <div style={{ display: 'flex', justifyContent: 'center' }}>
//                                                     <SendHorizontal
//                                                         style={{
//                                                             width: '20px',
//                                                             color: iconColor,
//                                                             cursor: cursorStyle,
//                                                             opacity: 1 // La opacidad siempre es 1 ya que el caso 'deshabilitado' está oculto
//                                                         }}
//                                                         onClick={handleClick}
//                                                     />
//                                                 </div>
//                                             );
//                                         },
//                                     }
//                                 ]
//                             }
//                         />
//                     </div>



//                     <DialogAyudantes
//                         isOpen={isDialogOpen}
//                         closeModal={false}
//                         onSubmit={false}
//                         motivoToEdit={motivoData}
//                         action={action}
//                         errors={errors}
//                         setErrors={setErrors}
//                     />
//                 </div>
//             }
//         </div>
//     );
// }


import Datatable from "@/components/Datatable";
import LoadingDiv from "@/components/LoadingDiv";
import request from "@/utils";
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { Truck, UsersRound, SendHorizontal } from 'lucide-react';
import { useEffect, useState, useCallback } from "react";
import { toast } from 'sonner';


const userObject = JSON.parse(localStorage.getItem('user'));


// function DialogAyudantes({ isOpen, closeModal, onSubmit, motivoToEdit, action, choferes, errors, setErrors, userObject }) {
//     const [seleccionados, setSeleccionados] = useState([]);
//     const [loading, setLoading] = useState(false);

//     // RESETEAR ESTADO AL ABRIR EL MODAL
//     useEffect(() => {
//         if (isOpen) {
//             const ayudantesString = motivoToEdit?.CUA_ayudantes;

//             if (ayudantesString && ayudantesString.trim().length > 0) {
//                 const listaLimpia = ayudantesString
//                     .split(',')
//                     .map(s => s.trim())
//                     .filter(s => s !== "");

//                 // Si por alguna razón la DB tiene más de 5, truncamos para evitar errores en el componente
//                 setSeleccionados(listaLimpia.slice(0, 5));
//             } else {
//                 setSeleccionados([]);
//             }
//             setErrors({});
//         }
//     }, [isOpen, motivoToEdit?.CUA_ayudantes, setErrors]);

//     // MANEJAR SELECCIÓN CON LÍMITE DE 5
//     const handleCheckboxChange = (nombre) => {
//         setSeleccionados((prev) => {
//             // Si ya está seleccionado, lo removemos
//             if (prev.includes(nombre)) {
//                 return prev.filter((item) => item !== nombre);
//             }

//             // Si no está seleccionado y ya hay 5, bloqueamos
//             if (prev.length >= 5) {
//                 toast.error("SOLO PUEDES SELECCIONAR UN MÁXIMO DE 5 AYUDANTES");
//                 return prev;
//             }

//             // Agregamos el nuevo
//             return [...prev, nombre];
//         });
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         if (seleccionados.length > 5) {
//             toast.error("NO SE PERMITEN MÁS DE 5 AYUDANTES");
//             return;
//         }

//         setLoading(true);

//         try {
//             const response = await fetch(route('WhoAyudantes'), {
//                 method: "POST",
//                 body: JSON.stringify({
//                     quienconquien: motivoToEdit,
//                     user: userObject?.Personas_usuarioID,
//                     seleccionados: seleccionados
//                 }),
//                 headers: {
//                     "Content-Type": "application/json",
//                     "Accept": "application/json",
//                 }
//             });

//             const result = await response.json();

//             if (response.ok && result.success) {
//                 toast.success("AYUDANTES ACTUALIZADOS");
//                 closeModal();
//                 if (onSubmit) onSubmit(); 
//             } else {
//                 toast.error(result.message || "ERROR AL ACTUALIZAR");
//             }
//         } catch (error) {
//             console.error(error);
//             toast.error("ERROR DE CONEXIÓN AL SERVIDOR");
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <Dialog open={isOpen} onClose={closeModal} className="relative z-50">
//             <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

//             <div className="fixed inset-0 flex items-center justify-center p-4">
//                 <DialogPanel className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl relative">
//                     {loading && <LoadingDiv />}

//                     <DialogTitle className="text-2xl font-bold mb-4 text-gray-900 border-b pb-2 flex justify-between items-center">
//                         <span>{action === 'create' ? 'AGREGAR AYUDANTES' : 'EDITAR AYUDANTES'}</span>
//                         <span className={`text-sm font-bold ${seleccionados.length === 5 ? 'text-red-500' : 'text-blue-500'}`}>
//                             {seleccionados.length}/5
//                         </span>
//                     </DialogTitle>

//                     <form onSubmit={handleSubmit} className="space-y-4">
//                         <div className="max-h-90 overflow-y-auto space-y-2 p-1 border rounded-lg bg-gray-50">
//                             {choferes.map((chofer) => {
//                                 const isChecked = seleccionados.includes(chofer.nombre_completo);
//                                 const isDisabled = seleccionados.length >= 5 && !isChecked;

//                                 return (
//                                     <div 
//                                         key={chofer.Personas_usuarioID} 
//                                         className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
//                                             isDisabled ? 'opacity-40' : 'hover:bg-white cursor-pointer'
//                                         }`}
//                                     >
//                                         <input
//                                             id={`chofer-${chofer.Personas_usuarioID}`}
//                                             type="checkbox"
//                                             className="h-5 w-5 text-blue-600 border-gray-300 rounded cursor-pointer disabled:cursor-not-allowed"
//                                             checked={isChecked}
//                                             disabled={isDisabled}
//                                             onChange={() => handleCheckboxChange(chofer.nombre_completo)}
//                                         />
//                                         <label
//                                             htmlFor={`chofer-${chofer.Personas_usuarioID}`}
//                                             className={`text-sm font-medium flex-grow uppercase ${
//                                                 isDisabled ? 'text-gray-400' : 'text-gray-700 cursor-pointer'
//                                             }`}
//                                         >
//                                             {chofer.nombre_completo}
//                                         </label>
//                                     </div>
//                                 );
//                             })}
//                         </div>

//                         <div className="mt-4 p-3 bg-blue-50 rounded border border-dashed border-blue-200">
//                             <p className="text-[10px] font-bold text-blue-400 uppercase">VISTA PREVIA DE SELECCIÓN:</p>
//                             <span className="text-sm font-mono text-blue-700 break-words">
//                                 {seleccionados.length > 0 ? seleccionados.join(', ') : 'NINGUNO SELECCIONADO'}
//                             </span>
//                         </div>

//                         <div className="flex justify-end gap-3 pt-4 border-t">
//                             <button 
//                                 type="button" 
//                                 onClick={closeModal} 
//                                 className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
//                             >
//                                 CANCELAR
//                             </button>
//                             <button
//                                 type="submit"
//                                 disabled={loading}
//                                 className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 shadow-sm transition-colors"
//                             >
//                                 {action === 'create' ? 'GUARDAR' : 'ACTUALIZAR'}
//                             </button>
//                         </div>
//                     </form>
//                 </DialogPanel>
//             </div>
//         </Dialog>
//     );
// }

// --- COMPONENTE PRINCIPAL ---


function DialogAyudantes({ isOpen, closeModal, onSubmit, motivoToEdit, action, choferes, errors, setErrors, userObject }) {
    const [seleccionados, setSeleccionados] = useState([]);
    const [loading, setLoading] = useState(false);

    // Estados para Paginación y Búsqueda
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    // RESETEAR ESTADO AL ABRIR EL MODAL
    useEffect(() => {
        if (isOpen) {
            setSearchTerm(""); // Limpiar búsqueda al abrir
            setCurrentPage(1); // Resetear a página 1
            const ayudantesString = motivoToEdit?.CUA_ayudantes;

            if (ayudantesString && ayudantesString.trim().length > 0) {
                const listaLimpia = ayudantesString
                    .split(',')
                    .map(s => s.trim())
                    .filter(s => s !== "");
                setSeleccionados(listaLimpia.slice(0, 5));
            } else {
                setSeleccionados([]);
            }
            setErrors({});
        }
    }, [isOpen, motivoToEdit?.CUA_ayudantes, setErrors]);

    // LÓGICA DE FILTRADO Y PAGINACIÓN
    const choferesFiltrados = choferes.filter(chofer =>
        chofer.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(choferesFiltrados.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = choferesFiltrados.slice(indexOfFirstItem, indexOfLastItem);

    // MANEJAR SELECCIÓN CON LÍMITE DE 5
    const handleCheckboxChange = (nombre) => {
        setSeleccionados((prev) => {
            if (prev.includes(nombre)) {
                return prev.filter((item) => item !== nombre);
            }
            if (prev.length >= 5) {
                toast.error("SOLO PUEDES SELECCIONAR UN MÁXIMO DE 5 AYUDANTES");
                return prev;
            }
            return [...prev, nombre];
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (seleccionados.length > 5) {
            toast.error("NO SE PERMITEN MÁS DE 5 AYUDANTES");
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(route('WhoAyudantes'), {
                method: "POST",
                body: JSON.stringify({
                    quienconquien: motivoToEdit,
                    user: userObject?.Personas_usuarioID,
                    seleccionados: seleccionados
                }),
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                }
            });
            const result = await response.json();
            if (response.ok && result.success) {
                toast.success("AYUDANTES ACTUALIZADOS");
                closeModal();
                if (onSubmit) onSubmit();
            } else {
                toast.error(result.message || "ERROR AL ACTUALIZAR");
            }
        } catch (error) {
            console.error(error);
            toast.error("ERROR DE CONEXIÓN AL SERVIDOR");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onClose={closeModal} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

            <div className="fixed inset-0 flex items-center justify-center p-4">
                <DialogPanel className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl relative">
                    {loading && <LoadingDiv />}

                    <DialogTitle className="text-2xl font-bold mb-4 text-gray-900 border-b pb-2 flex justify-between items-center">
                        <span>{action === 'create' ? 'AGREGAR AYUDANTES' : 'EDITAR AYUDANTES'}</span>
                        <span className={`text-sm font-bold ${seleccionados.length === 5 ? 'text-red-500' : 'text-blue-500'}`}>
                            {seleccionados.length}/5
                        </span>
                    </DialogTitle>

                    {/* BUSCADOR */}
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Buscar chofer por nombre..."
                            className="w-full p-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1); // Volver a la pág 1 al buscar
                            }}
                        />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="min-h-[300px] space-y-2 p-1 border rounded-lg bg-gray-50">
                            {currentItems.length > 0 ? (
                                currentItems.map((chofer) => {
                                    const isChecked = seleccionados.includes(chofer.nombre_completo);
                                    const isDisabled = seleccionados.length >= 5 && !isChecked;

                                    return (
                                        <div
                                            key={chofer.Personas_usuarioID}
                                            className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${isDisabled ? 'opacity-40' : 'hover:bg-white cursor-pointer'
                                                }`}
                                        >
                                            <input
                                                id={`chofer-${chofer.Personas_usuarioID}`}
                                                type="checkbox"
                                                className="h-5 w-5 text-blue-600 border-gray-300 rounded cursor-pointer disabled:cursor-not-allowed"
                                                checked={isChecked}
                                                disabled={isDisabled}
                                                onChange={() => handleCheckboxChange(chofer.nombre_completo)}
                                            />
                                            <label
                                                htmlFor={`chofer-${chofer.Personas_usuarioID}`}
                                                className={`text-sm font-medium flex-grow uppercase ${isDisabled ? 'text-gray-400' : 'text-gray-700 cursor-pointer'
                                                    }`}
                                            >
                                                {chofer.nombre_completo}
                                            </label>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-center text-gray-400 text-sm mt-10">No se encontraron resultados</p>
                            )}
                        </div>

                        {/* CONTROLES PAGINACIÓN */}
                        {totalPages > 1 && (
                            <div className="flex justify-between items-center bg-gray-100 p-2 rounded-lg">
                                <button
                                    type="button"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                    className="px-3 py-1 text-xs font-bold bg-white rounded border disabled:opacity-50"
                                >
                                    ANTERIOR
                                </button>
                                <span className="text-xs font-bold text-gray-600">
                                    PÁGINA {currentPage} DE {totalPages}
                                </span>
                                <button
                                    type="button"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                    className="px-3 py-1 text-xs font-bold bg-white rounded border disabled:opacity-50"
                                >
                                    SIGUIENTE
                                </button>
                            </div>
                        )}

                        <div className="mt-4 p-3 bg-blue-50 rounded border border-dashed border-blue-200">
                            <p className="text-[10px] font-bold text-blue-400 uppercase">VISTA PREVIA DE SELECCIÓN:</p>
                            <span className="text-sm font-mono text-blue-700 break-words">
                                {seleccionados.length > 0 ? seleccionados.join(', ') : 'NINGUNO SELECCIONADO'}
                            </span>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                            >
                                CANCELAR
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 shadow-sm"
                            >
                                {action === 'create' ? 'GUARDAR' : 'ACTUALIZAR'}
                            </button>
                        </div>
                    </form>
                </DialogPanel>
            </div>
        </Dialog>
    );
}


export default function QuienConQuienTransporte() {
    const [states, setStates] = useState({
        loading: true,
        choferes: [],
        destinos: [],
        motivos: [],
        quienConQuien: [],
        dashboard: {},
    });

    const [modData, setModData] = useState([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedMotivo, setSelectedMotivo] = useState(null);
    const [errors, setErrors] = useState({});

    const userObject = JSON.parse(localStorage.getItem('user'));

    const fetchData = useCallback(async () => {
        try {
            const [destinos, motivos, choferes, Qconquien, dashboard] = await Promise.all([
                request(route('DestinosQuiencQuien')),
                request(route('MotivosQuiencQuien')),
                request(route('users.index')),
                request(route('QuienconQuienUnidades')),
                request(route('QuienconQuienUnidadesDashboard')),
            ]);

            setStates({
                loading: false,
                destinos,
                motivos,
                choferes,
                quienConQuien: Qconquien,
                dashboard,
            });
        } catch (error) {
            toast.error("ERROR AL CARGAR DATOS");
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const hasData = (val) => val !== null && val !== undefined && val.toString().trim() !== "";

    const handleUpdateRow = (e) => {
        if (e.newData) {
            const updatedRow = { ...e.oldData, ...e.newData };
            setStates(prev => ({
                ...prev,
                quienConQuien: prev.quienConQuien.map(item =>
                    item.CUA_unidadID === updatedRow.CUA_unidadID ? updatedRow : item
                )
            }));
            setModData(prev => [...prev.filter(x => x.CUA_unidadID !== updatedRow.CUA_unidadID), updatedRow]);
        }
    };

    const SubmitQuien = async (e) => {
        try {
            const response = await fetch(route('WhoDestint'), {
                method: "POST",
                body: JSON.stringify({ quienconquien: e, user: userObject.Personas_usuarioID }),
                headers: { "Content-Type": "application/json" }
            });

            if (response.ok) {
                setStates({ ...states, open: false });
                toast.success("Se ha actualizado correctamente el quienconquien");

                fetchData();
            } else {
                const errorData = await response.json();
                const message = errorData?.message || 'Error al actualizar';
                showNotification(message, 'error', 'metroui', 'bottomRight', 7000);
            }
        } catch (error) {
            showNotification('Error inesperado: ' + error.message, 'error', 'metroui', 'bottomRight', 7000);
        }
    };

    const stats = [
        { name: 'UNIDADES FUERA DE ÁREA', value: states.dashboard.totalVerde ?? 0, icon: Truck, color: 'text-green-600', bg: 'bg-green-100' },
        { name: 'UNIDADES EN PATIO', value: states.dashboard.totalAmarillo ?? 0, icon: Truck, color: 'text-yellow-600', bg: 'bg-yellow-100' },
        { name: 'UNIDADES SIN ASIGNAR', value: states.dashboard.totalRojo ?? 0, icon: Truck, color: 'text-red-500', bg: 'bg-red-100' },
    ];

    return (
        <div className="relative h-full pb-4 px-3 overflow-auto blue-scroll bg-gray-50">
            {states.loading ? (
                <div className="flex h-full items-center justify-center"><LoadingDiv /></div>
            ) : (
                <div className="flex flex-col space-y-6 py-4">
                    <div className="flex justify-between items-center border-b pb-4">
                        <h2 className="text-3xl font-black text-gray-800">GESTIÓN DE ASIGNACIONES</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {stats.map((stat, i) => (
                            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.name}</p>
                                    <p className={`text-4xl font-black ${stat.color}`}>{stat.value}</p>
                                </div>
                                <div className={`p-4 rounded-xl ${stat.bg}`}>
                                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="quienConQuienTablaTotal">
                        <Datatable
                            data={states.quienConQuien}
                            tableId={'CUA_unidadID'}
                            handleRowUpdating={handleUpdateRow}
                            virtual={true}
                            editingMode={{ mode: "cell", allowUpdating: true }}
                            columns={[
                                {
                                    header: "Estatus",
                                    accessor: "Unidades_estatus",
                                    width: '80px',
                                    cell: ({ item }) => {
                                        const isComplete = hasData(item.CUA_choferID) && hasData(item.CUA_motivoID) && hasData(item.CUA_destino);
                                        let color = "bg-red-300";
                                        if (isComplete) {
                                            color = item.UltimoMovimiento === "SALIDA" ? "bg-green-300" : "bg-yellow-300";
                                        }
                                        return <div className="flex justify-center"><span className={`w-3 h-3 rounded-full ${color} shadow-sm`} /></div>;
                                    }
                                },
                                { header: 'Unidad', accessor: 'Unidades_numeroEconomico', width: '120px', editable: false },
                                {
                                    header: 'Chofer',
                                    accessor: 'CUA_choferID',
                                    lookup: { dataSource: states.choferes, displayExpr: "nombre_completo", valueExpr: "Personas_usuarioID" }
                                },
                                {
                                    header: 'Motivo',
                                    accessor: 'CUA_motivoID',
                                    lookup: { dataSource: states.motivos, displayExpr: "Motivos_nombre", valueExpr: "Motivos_motivoID" }
                                },
                                {
                                    header: 'Destino',
                                    accessor: 'CUA_destino',
                                    lookup: { dataSource: states.destinos, displayExpr: "Destinos_Nombre", valueExpr: "Destinos_Id" }
                                },
                                {
                                    header: "Ayudantes",
                                    accessor: "CUA_unidadID",
                                    width: '100px',
                                    cell: ({ item }) => {
                                        const { CUA_choferID, CUA_motivoID, CUA_destino, UltimoMovimiento, CUA_unidadID, CUA_asignacionID } = item;

                                        // 1. Estado VERDE: Todo completo y ya salió.
                                        const isVerde = hasData(CUA_choferID) &&
                                            hasData(CUA_motivoID) &&
                                            hasData(CUA_destino) &&
                                            UltimoMovimiento === "SALIDA";

                                        // 2. Estado ROJO: Corregido para verificar si falta CUALQUIERA de los datos base
                                        // El botón se bloquea si no hay ID de unidad, destino o motivo.
                                        const isRojo = !hasData(CUA_unidadID) ||
                                            !hasData(CUA_destino) ||
                                            !hasData(CUA_motivoID) ||
                                            !hasData(CUA_asignacionID);


                                        ;

                                        // 3. El botón se deshabilita si ya está finalizado (Verde) o si faltan datos base (Rojo)
                                        const debeBloquearse = isVerde || isRojo;

                                        return (
                                            <div className="flex justify-center space-x-2">
                                                <UsersRound
                                                    className={debeBloquearse
                                                        ? "w-5 h-5 text-gray-400 cursor-not-allowed opacity-50"
                                                        : "w-5 h-5 text-blue-500 cursor-pointer hover:text-blue-700 transition-colors"
                                                    }
                                                    onClick={() => {
                                                        if (debeBloquearse) return;

                                                        setSelectedMotivo(item);
                                                        setIsDialogOpen(true);
                                                    }}
                                                />
                                            </div>
                                        );
                                    }
                                }
                                ,

                                {
                                    header: "Acciones",
                                    accessor: "Acciones",
                                    width: '5%',
                                    cell: ({ item }) => {
                                        const { CUA_choferID, CUA_motivoID, CUA_destino, UltimoMovimiento } = item;

                                        // 1. Verificar si todos los datos requeridos están presentes (similar a isGreen en el original)
                                        const allDataPresent = hasData(CUA_choferID) && hasData(CUA_motivoID) && hasData(CUA_destino);

                                        // 2. Determinar si el botón debe estar deshabilitado/oculto (solo si el estado es VERDE)
                                        // Está deshabilitado/oculto si: Todos los datos están presentes Y UltimoMovimiento es "SALIDA"
                                        const isDisabled = allDataPresent && UltimoMovimiento === "SALIDA";

                                        // Si isDisabled es true (Estado VERDE), el botón NO es visible/interactuable.
                                        if (isDisabled) {
                                            return <div style={{ width: '20px', height: '20px' }}></div>; // Retorna un espacio vacío
                                        }

                                        // Si llegamos aquí, el estado es ROJO o AMARILLO, por lo que el botón es visible y activo.
                                        const iconColor = 'green';
                                        const cursorStyle = 'pointer';

                                        const handleClick = () => {
                                            // Aquí ya no necesitamos el chequeo de `!isDisabled` porque se maneja con el `if (isDisabled)` de arriba.
                                            // Pero si decides no devolver nada para `isDisabled`, la verificación de abajo sigue siendo importante.
                                            if (!isDisabled) {
                                                SubmitQuien(item);
                                            }
                                        };

                                        return (
                                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                                <SendHorizontal
                                                    style={{
                                                        width: '20px',
                                                        color: iconColor,
                                                        cursor: cursorStyle,
                                                        opacity: 1 // La opacidad siempre es 1 ya que el caso 'deshabilitado' está oculto
                                                    }}
                                                    onClick={handleClick}
                                                />
                                            </div>
                                        );
                                    },
                                }


                            ]}
                        />
                    </div>

                    <DialogAyudantes
                        isOpen={isDialogOpen}
                        closeModal={() => setIsDialogOpen(false)}
                        onSubmit={() => fetchData()}
                        motivoToEdit={selectedMotivo}
                        action="edit"
                        choferes={states.choferes}
                        errors={errors}
                        setErrors={setErrors}
                    />
                </div>
            )}
        </div>
    );
}