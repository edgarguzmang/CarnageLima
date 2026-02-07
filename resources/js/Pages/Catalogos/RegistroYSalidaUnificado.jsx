import React, { useState, useEffect } from 'react';
import Datatable from "@/Components/Datatable"; // Asegúrate de la ruta correcta
import SelectInput from "@/components/SelectInput"; // Asegúrate de la ruta correcta
import { toast } from 'sonner';
import TextInput from '@/Components/TextInput';
import ComponenteVerificacion from "./ListaVerificacionImagenes";
import { Dialog, DialogPanel, DialogTitle, Transition } from '@headlessui/react';
import AuthorizationModal from './AuthorizationModal';

const FUEL_OPTIONS = [
    { nombre: '1/8', escala_valor: 1, litros: 5 },
    { nombre: '1/4', escala_valor: 2, litros: 10 },
    { nombre: '3/8', escala_valor: 3, litros: 15 },
    { nombre: '1/2', escala_valor: 4, litros: 20 },
    { nombre: '5/8', escala_valor: 5, litros: 25 },
    { nombre: '3/4', escala_valor: 6, litros: 30 },
    { nombre: '7/8', escala_valor: 7, litros: 35 },
    { nombre: 'Lleno', escala_valor: 8, litros: 40 }
];

const RegistroYSalidaUnificado = () => {
    const userObject = JSON.parse(localStorage.getItem('user') || '{}');
    const ESTADO_INICIAL = {
        NombreUnidad: '',
        UltimoKilometraje: '',
        NombreAyudante: '',
        NombreOperador: '',
        Estado: '',
    };
    const initialFormState = {
        movementType: 'ENTRADA',
        unit: '',
        driver: '',
        destination: '',
        kilometers: 0,
        motive: '',
        observation: '',
        combustible: '',
        checklist: [],
        authorizationCode: '',
        user: userObject.Personas_usuarioID,
        estatusCode: 0,
        Ayudantes: ''
    };
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIncidencias, setSelectedIncidencias] = useState([]);
    const [requests, setRequests] = useState({
        Motivos: [],
        Unidades: [],
        Choferes: [],
        Ayudantes: [],
        Destinos: [],
        ListasVerificacion: [],
        UltimosMovimientos: [],
        QuienconQuienControl: []
    });
    const [informacion, setInformacion] = useState(ESTADO_INICIAL);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState(initialFormState)
    // Condición de habilitación del botón: KM es válido solo si es mayor al último en ENTRADA
    const isKmValid = form.movementType === 'SALIDA' ? true : form.kilometers > informacion.UltimoKilometraje;    // Condición de validación básica del formulario
    const isFormValid = (
        form.unit !== '' &&
        form.driver !== '' &&
        form.destination !== '' &&
        form.motive !== '' &&
        isKmValid &&
        form.combustible !== ''
    );

    // Texto del botón
    const buttonText = isSubmitting
        ? 'PROCESANDO...'
        : form.estatusCode === 1 && !form.authorizationCode
            ? 'SOLICITAR AUTORIZACIÓN'
            : 'REGISTRAR MOVIMIENTO';

    const closeModal = () => {
        setIsOpen(false);
    };

    const openModal = () => {
        setIsOpen(true);
    };

    const openAuthorizationModal = () => {
        setIsModalOpen(true);
    };

    const fetchData = async (routeName) => {
        const response = await fetch(route(routeName));
        if (!response.ok) {
            throw new Error(`Fallo al cargar ${routeName}: ${response.statusText}`);
        }
        return response.json();
    };

    const loadAllData = async () => {
        try {
            const [
                MotivosData,
                UnidadesData,
                ChoferesData,
                DestinosData,
                ListasData,
            ] = await Promise.all([
                fetchData("MotivosQuiencQuien"),
                fetchData("UnidadesQuiencQuien"),
                fetchData("users.index"),
                fetchData("DestinosQuiencQuien"),
                fetchData("CondicionesUnidad"),
            ]);

            setRequests(prevRequests => ({
                ...prevRequests,
                Motivos: MotivosData,
                Unidades: UnidadesData,
                Choferes: ChoferesData,
                Ayudantes: ChoferesData,
                Destinos: DestinosData,
                ListasVerificacion: ListasData,
            }));

        } catch (error) {
            console.error('Error al cargar datos:', error);
            toast.error('Error al cargar datos iniciales.');
        }
    }

    const handleAuthorization = (authCode) => {
        setForm(prevForm => ({
            ...prevForm,
            authorizationCode: authCode, // Guarda el código en el formulario
        }));
        setIsModalOpen(false); // Cierra el modal
        toast.success("Autorización exitosa. Proceda a registrar el movimiento.");
        // Opcionalmente, puedes llamar a CrearAsignacion() aquí para reintentar automáticamente
    };

    const CrearAsignacion = async () => {
        setIsSubmitting(true);
        const listachecks = form.checklist.concat(selectedIncidencias);
        const refaccionesNecesarias = listachecks.some(item => item.observacion === "No");

        try {
            // Lógica final de envío de asignación
            const response = await fetch(route('asignaciones.store'), {
                method: 'POST',
                body: JSON.stringify(form),
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) {
                const errorText = await response.text();
                toast.error(`Error al registrar el movimiento: ${errorText}. Vuelve a intentar el proceso.`);
                throw new Error("Respuesta no ok");
            }
            if (!refaccionesNecesarias) {
                toast.success("Se ha creado un movimiento con éxito");
                setForm({ ...initialFormState, authorizationCode: form.authorizationCode });
                getAllData();
                setRequests(prevRequests => ({
                    ...prevRequests,
                    UltimosMovimientos: [],
                }));
            }
        } catch (err) {
            console.error('Error al crear el movimiento:', err);
            // El error ya fue notificado con toast.error previamente
        } finally {
            setIsSubmitting(false);
        }
        if (refaccionesNecesarias) {
            // try {
            // toast.info("Solicitando código de autorización...");
            setForm(prevForm => ({
                ...prevForm,
                kilometers: ''
            }));
            openAuthorizationModal();
            toast.info("Código de autorización enviado. Ingrésalo en la ventana emergente.");
        }

        loadAllData()
    };

    const handleChecklistToggle = (listId, statusValue) => {
        setForm(prevForm => {
            const currentChecklist = prevForm.checklist;
            const listIdString = listId.toString();
            const existingIndex = currentChecklist.findIndex(item => item.id === listIdString);
            let newChecklist;

            if (existingIndex > -1) {
                newChecklist = currentChecklist.map((item, index) =>
                    index === existingIndex
                        ? { ...item, observacion: statusValue }
                        : item
                );
            } else {
                const newItem = {
                    id: listIdString,
                    observacion: statusValue
                };
                newChecklist = [...currentChecklist, newItem];
            }

            return {
                ...prevForm,
                checklist: newChecklist,
            };
        });
    };

    const setMovementType = (type) => {
        // Resetea gran parte del formulario al cambiar el tipo de movimiento
        setForm(prev => ({
            ...initialFormState,
            movementType: type,
            user: userObject.Personas_usuarioID,
            authorizationCode: '' // Limpiar código de autorización al cambiar tipo
        }));
        setRequests(prevRequests => ({
            ...prevRequests,
            UltimosMovimientos: [],
            QuienconQuienControl: [] // Esto se recarga en el useEffect
        }));
    };

    const fetchUltimosMovimientos = async (unitId) => {
        try {
            // **IMPORTANTE**: Asegúrate de que `route('ultimos-movimientos-unidad')` es correcto
            const response = await fetch(route('ultimos-movimientos-unidad'), {
                method: 'POST',
                body: JSON.stringify({ unidadID: unitId }),
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            const primerMovimiento = Array.isArray(data) && data.length > 0 ? data[0] : {};
            const ultimoKm = primerMovimiento.Movimientos_kilometraje || 0;

            // Inicializa la checklist por defecto a 'Si' para todos los ítems
            const defaultChecklist = requests.ListasVerificacion.map(item => ({
                id: item.ListaVerificacion_listaID.toString(),
                observacion: 'Si'
            }));

            setRequests(prevRequests => ({
                ...prevRequests,
                UltimosMovimientos: data,
            }));

            setInformacion(prevInfo => ({
                ...prevInfo,
                UltimoKilometraje: ultimoKm,
            }));

            // Actualiza KM solo si es SALIDA o si el KM actual es 0 (primera carga)
            if (form.movementType === 'SALIDA' || form.kilometers === 0) {
                setForm(prevForm => ({
                    ...prevForm,
                    kilometers: ultimoKm,
                    checklist: defaultChecklist,
                }));
            } else {
                setForm(prevForm => ({
                    ...prevForm,
                    checklist: defaultChecklist,
                }));
            }

        } catch (err) {
            console.error('Error al obtener movimientos:', err);
            toast.error('Error al cargar últimos movimientos de la unidad.');
        }
    };

    const getAllData = async () => {
        try {
            const quien = await fetch(route("QuienconQuienControl", { id: form.movementType })).then(res => res.json());
            setRequests(prevRequests => ({
                ...prevRequests,
                QuienconQuienControl: quien,
            }));
        } catch (error) {
            console.error("Error al obtener QuienconQuienControl:", error);
            toast.error('Error al cargar datos de control.');
        }
    };

    const handleIncidenciasChange = (incidencias) => {
        // 2. Almacenamos el estado actualizado que viene del hijo
        setSelectedIncidencias(incidencias);

        // **FILTRO CLAVE: Solo mantenemos las incidencias donde 'observacion' es estrictamente "No"**
        const incidenciasSoloNo = incidencias.filter(
            (incidencia) => incidencia.observacion === "No"
        );

        setForm(prevForm => {
            const checklistSinHijos = prevForm.checklist.filter(item => item.hijo !== true);
            const checklistMap = new Map(
                checklistSinHijos.map(item => [item.id, item])
            );

            incidenciasSoloNo.forEach(newIncidencia => {
                if (!checklistMap.has(newIncidencia.id)) {
                    checklistMap.set(newIncidencia.id, newIncidencia);
                }
            });

            const nuevoChecklistUnico = Array.from(checklistMap.values());
            return {
                ...prevForm, // Conserva las demás propiedades del formulario
                checklist: nuevoChecklistUnico, // Reemplaza el 'checklist' con el nuevo array único
            };
        });

    };

    const ToggleButton = ({ label, isActive, onClick }) => (
        <button
            onClick={onClick}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors duration-200 ${isActive
                ? 'bg-[#3b82f6] text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
        >
            {label}
        </button>
    );

    const ConditionToggle = ({ label, name, currentValue, onToggle, isCritical = false }) => (
        <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
            <span className="text-sm font-medium text-gray-700">
                {label}
                {isCritical && <span className="text-red-500 text-xs ml-1">(Crítico)</span>}
            </span>
            <div className="flex gap-2">
                <button
                    onClick={() => onToggle(name, 'No')}
                    className={`px-4 py-1 text-sm font-semibold rounded-lg transition-colors duration-200 ${currentValue === 'No'
                        ? 'bg-red-500 text-white shadow-md'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    No
                </button>
                <button
                    onClick={() => onToggle(name, 'Si')}
                    className={`px-4 py-1 text-sm font-semibold rounded-lg transition-colors duration-200 ${currentValue === 'Si'
                        ? 'bg-green-500 text-white shadow-md'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    Sí
                </button>
            </div>
        </div>
    );

    const ResumenItem = ({ label, value }) => (
        <div className="flex justify-between items-start py-2 border-b border-gray-200 gap-4">
            <span className="text-sm font-medium text-gray-600 whitespace-nowrap">{label}</span>
            <span className="text-sm font-semibold text-gray-800 text-right break-words max-w-[70%]">
                {value}
            </span>
        </div>
    );

    useEffect(() => {
        loadAllData();
    }, []);

    useEffect(() => {
        if (isModalOpen === false) {
            setInformacion(ESTADO_INICIAL);

            setRequests(prevRequests => ({
                ...prevRequests,
                UltimosMovimientos: [],
            }));

            setForm(initialFormState)
        }
    }, [isModalOpen]);

    useEffect(() => {
        if (form.unit) fetchUltimosMovimientos(form.unit);
    }, [form.unit]);

    // Efecto para determinar si se necesita autorización (estatusCode)
    useEffect(() => {
        // Determinar si existe al menos un elemento con observación "No"
        const hasNoObservation = form.checklist.some(item => item.observacion === "No");
        // 1 (Requiere autorización) si hay "No", 0 (No requiere) si todos son "Sí"
        const newStatusCode = hasNoObservation ? 1 : 0;
        // Si el estatus cambia de 1 a 0, se limpia el código de autorización
        if (newStatusCode === 0 && form.estatusCode === 1) {
            setForm(prevForm => ({
                ...prevForm,
                authorizationCode: '',
                estatusCode: newStatusCode
            }));
        } else {
            setForm(prevForm => ({
                ...prevForm,
                estatusCode: newStatusCode
            }));
        }
    }, [form.checklist, setForm])

    // Efecto para buscar datos de QuienConQuienControl cuando cambia la unidad
    useEffect(() => {
        const selectedUnitId = Number(form.unit);
        // Buscar la unidad y el chofer
        const Unidad = requests.Unidades.find(u => u.Unidades_unidadID === selectedUnitId);
        const Chofer = requests.Choferes.find(C => C.Personas_usuarioID === Number(form.driver));
        let nombreUnidad = '';
        let nombreOperador = '';
        if (Unidad) {
            nombreUnidad = Unidad.Unidades_numeroEconomico;
        }
        if (Chofer) {
            nombreOperador = Chofer.nombre_completo || '';
        }
        // Buscar información en QuienconQuienControl
        const QuienConQuien = requests.QuienconQuienControl.find(u => Number(u.CUA_unidadID) === selectedUnitId);

        if (QuienConQuien) {
            setForm(prevForm => ({
                ...prevForm,
                motive: Number(QuienConQuien.CUA_motivoID),
                destination: Number(QuienConQuien.CUA_destino),
                driver: Number(QuienConQuien.CUA_choferID),
                Ayudantes: QuienConQuien.CUA_ayudantes,

                // kilometers se carga en fetchUltimosMovimientos
            }));
            if (QuienConQuien.EstatusCodigo === "1") {
                openAuthorizationModal(); // Descomentar si el estatus 1 debe abrir el modal automáticamente
            }
        } else {
            // Limpiar campos relacionados si la unidad no está en CQC
            setForm(prevForm => ({
                ...prevForm,
                motive: '',
                destination: '',
                driver: '',
            }));
        }
        setInformacion(prevInfo => ({
            ...prevInfo,
            NombreUnidad: nombreUnidad,
            NombreOperador: nombreOperador,
        }));
    }, [form.unit, requests.Unidades, requests.Choferes, requests.QuienconQuienControl, userObject.Personas_usuarioID]);

    useEffect(() => {
        getAllData();
    }, [form.movementType]);

    return (
        <div className={`flex flex-col gap-4 ${isModalOpen ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className='flex flex-col gap-4'>
               
                {/* Header con info responsiva */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-white p-4 rounded-xl shadow-md">
                    <div className="text-sm sm:text-lg font-bold text-gray-800">
                        {/* Unidad: <span className="text-blue-600">{informacion.NombreUnidad || '—'}</span> */}
                         Registro Único de Movimientos: <span className="text-blue-600"> Unidad- {informacion.NombreUnidad || 'S/N'}</span>
                    </div>
                   
                </div>
            </div>

            {/* Contenedor Principal de las 2 Columnas */}
            <div className="flex flex-col lg:flex-row gap-4 w-full">

                {/* COLUMNA IZQUIERDA: Datos del Movimiento */}
                <div className="flex-1 min-w-0 bg-white p-4 sm:p-6 rounded-xl shadow-lg">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
                        Datos del Movimiento
                    </h2>

                    <div className="flex flex-col gap-4 mb-6">
                        {/* Toggle ENTRADA/SALIDA */}
                        <div className="flex gap-2">
                            <ToggleButton
                                label="ENTRADA"
                                isActive={form.movementType === 'ENTRADA'}
                                onClick={() => setMovementType('ENTRADA')}
                            />
                            <ToggleButton
                                label="SALIDA"
                                isActive={form.movementType === 'SALIDA'}
                                onClick={() => setMovementType('SALIDA')}
                            />
                        </div>

                        {/* Grid de inputs - RESPONSIVO */}
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 w-full'>

                            {/* SELECT Motivo */}
                            <div className="w-full min-w-0">
                                <SelectInput
                                    label="Motivo"
                                    value={form.motive}
                                    onChange={(value) => {
                                        setForm({ ...form, motive: value });
                                    }}
                                    options={requests.Motivos}
                                    placeholder="Seleccionar motivo..."
                                    valueKey="Motivos_motivoID"
                                    labelKey="Motivos_nombre"
                                    disabled={true}
                                />
                            </div>

                            {/* SELECT Unidad */}
                            <div className='w-full min-w-0'>
                                <SelectInput
                                    label="Unidad (Número Económico)"
                                    value={form.unit}
                                    onChange={(value) => {
                                        setForm({ ...form, unit: value });
                                        setForm(prevForm => ({ ...prevForm, authorizationCode: '' }));
                                    }}
                                    options={requests.QuienconQuienControl}
                                    placeholder="Seleccionar unidad..."
                                    valueKey="CUA_unidadID"
                                    labelKey="Unidades_numeroEconomico"
                                    disabled={!requests.QuienconQuienControl?.length}
                                />
                                {requests.QuienconQuienControl && requests.QuienconQuienControl.length === 0 && (
                                    <span className="text-xs text-red-500 mt-1 block">
                                        No hay unidades disponibles para seleccionar.
                                    </span>
                                )}
                            </div>

                            {/* SELECT Chofer / Ayudante */}
                            <div className="w-full min-w-0">
                                <SelectInput
                                    label="Chofer / Ayudante"
                                    value={form.driver}
                                    onChange={(value) => { setForm({ ...form, driver: value }); }}
                                    options={requests.Choferes}
                                    placeholder="Seleccionar Chofer / ayudante"
                                    valueKey="Personas_usuarioID"
                                    labelKey="nombre_completo"
                                    disabled={true}
                                />
                            </div>

                            {/* SELECT Destino */}
                            <div className="w-full min-w-0">
                                <SelectInput
                                    label="Destino"
                                    value={form.destination}
                                    onChange={(value) => { setForm({ ...form, destination: value }); }}
                                    options={requests.Destinos}
                                    placeholder="Seleccionar destino..."
                                    valueKey="Destinos_Id"
                                    labelKey="Destinos_Nombre"
                                    disabled={true}
                                />
                            </div>

                            {/* SELECT Combustible */}
                            <div className="w-full min-w-0">
                                <SelectInput
                                    label="Combustible"
                                    value={form.combustible}
                                    onChange={(value) => { setForm({ ...form, combustible: value }); }}
                                    options={FUEL_OPTIONS}
                                    placeholder="Seleccionar combustible"
                                    valueKey="escala_valor"
                                    labelKey="nombre"
                                />
                            </div>

                            {/* INPUT Kilometraje Actual */}
                            <div className={`flex flex-col gap-1 w-full min-w-0`}>
                                <label className="text-sm font-medium text-gray-600">
                                    Kilometraje Actual
                                </label>
                                <TextInput
                                    type="number"
                                    name="kilometers"
                                    disabled={form.movementType === 'SALIDA'}
                                    value={form.kilometers}
                                    onChange={(e) => {
                                        setForm({ ...form, kilometers: e.target.value });
                                    }}
                                    className={`p-3 border rounded-lg focus:outline-none focus:ring-2 ${!isKmValid && form.movementType === 'ENTRADA' && form.kilometers !== 0
                                        ? 'border-red-500 focus:ring-red-400'
                                        : 'border-gray-300 focus:ring-blue-400'
                                        }`}
                                />
                                {!isKmValid && form.movementType === 'ENTRADA' && form.kilometers !== 0 && (
                                    <span className="text-xs text-red-500 mt-1">
                                        El KM debe ser mayor al último registrado ({informacion.UltimoKilometraje}).
                                    </span>
                                )}
                            </div>

                            {/* INPUT Observaciones - Ocupa 2 columnas en pantallas grandes */}
                            <div className={`flex flex-col gap-1 w-full min-w-0 md:col-span-2`}>
                                <label className="text-sm font-medium text-gray-600">
                                    Observaciones
                                </label>
                                <textarea
                                    name="observation"
                                    value={form.observation}
                                    onChange={(e) => {
                                        setForm({ ...form, observation: e.target.value });
                                    }}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                                    rows="2"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Checklist y Condiciones */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 border-b pb-2">
                        <h2 className="text-lg font-bold text-gray-800">Checklist</h2>
                        <button
                            className="px-4 sm:px-6 py-2 rounded-lg font-semibold transition-colors duration-200 bg-[#3b82f6] text-white shadow-lg text-sm sm:text-base"
                            onClick={openModal}
                        >
                            Condiciones de la unidad
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-x-4 gap-y-2 mb-6 p-3 border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                        {requests.ListasVerificacion.map((item) => {
                            const listId = item.ListaVerificacion_listaID.toString();
                            const currentItem = Array.isArray(form.checklist)
                                ? form.checklist.find(i => i.id === listId)
                                : undefined;
                            const currentValue = currentItem ? currentItem.observacion : 'Si';

                            return (
                                <ConditionToggle
                                    key={listId}
                                    label={item.ListaVerificacion_nombre}
                                    name={listId}
                                    currentValue={currentValue}
                                    onToggle={handleChecklistToggle}
                                    isCritical={item.ListaVerificacion_tipo === "Obligatorio"}
                                />
                            );
                        })}
                    </div>

                    <button
                        onClick={CrearAsignacion}
                        disabled={isSubmitting || !isFormValid}
                        className={`w-full py-3 text-white text-base sm:text-lg font-bold rounded-lg shadow-xl transition-colors ${isSubmitting || !isFormValid
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {buttonText}
                    </button>
                </div>

                {/* COLUMNA DERECHA: RESUMEN Y EVIDENCIAS */}
                <div className="flex-1 min-w-0 bg-white p-4 sm:p-6 rounded-xl shadow-lg">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
                        Resumen y Evidencias
                    </h2>

                    {/* Resumen de Datos */}
                    <div className="flex flex-col gap-2 mb-6 p-3 border border-gray-200 rounded-lg overflow-x-auto">
                        <h3 className="text-md font-semibold text-gray-700">Datos Clave</h3>
                        <ResumenItem label="Tipo de Movimiento" value={form.movementType} />
                        <ResumenItem label="Unidad" value={informacion.NombreUnidad || '—'} />
                        <ResumenItem label="Ayudantes" value={form.Ayudantes || '—'} />
                        <hr className="my-1 border-gray-100" />
                        <ResumenItem
                            label="Motivo"
                            value={(requests.Motivos.find(m => m.Motivos_motivoID === form.motive)?.Motivos_nombre) || '—'}
                        />
                        <ResumenItem
                            label="Destino"
                            value={(requests.Destinos.find(d => d.Destinos_Id === form.destination)?.Destinos_Nombre) || '—'}
                        />
                        <hr className="my-1 border-gray-100" />
                        <ResumenItem label="Kilometraje Registrado" value={`${form.kilometers} km`} />
                        <ResumenItem
                            label="Nivel Combustible"
                            value={FUEL_OPTIONS.find(f => f.escala_valor == form.combustible)?.nombre || '—'}
                        />
                        <hr className="my-1 border-gray-100" />
                        <div className="flex justify-between items-center py-1">
                            <span className="text-sm font-medium text-gray-600">Fallas Detectadas</span>
                            <span className={`text-sm font-bold ${form.estatusCode === 1 ? 'text-red-600' : 'text-green-600'
                                }`}>
                                {form.estatusCode === 1 ? 'Sí (Requiere Autorización)' : 'No'}
                            </span>
                        </div>
                    </div>

                    {/* DATATABLE de Últimos Movimientos */}
                    <h3 className="text-md font-semibold text-gray-700 mb-2">
                        Historial Reciente de Unidad
                    </h3>
                    <div className="overflow-x-auto">
                        <Datatable
                            data={requests.UltimosMovimientos}
                            virtual={true}
                            searcher={false}
                            columns={[
                                { header: 'Tipo', accessor: 'Movimientos_tipoMovimiento' },
                                { header: 'Fecha', accessor: 'Movimientos_fecha' },
                                { header: 'KM', accessor: 'Movimientos_kilometraje' },
                                { header: 'Chofer', accessor: 'nombre_chofer' },
                            ]}
                        />
                    </div>
                </div>
            </div>

            {/* Modales */}
            <AuthorizationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAuthorize={handleAuthorization}
                data={form}
            />

            <Dialog open={isOpen} onClose={closeModal} className="relative z-50">
                <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                <div className="fixed inset-0 flex w-full items-center justify-center p-4">
                    <DialogPanel className="w-full max-w-4xl max-h-[90vh] rounded-lg bg-white p-4 sm:p-6 shadow-xl relative flex flex-col">
                        <DialogTitle className="text-base sm:text-lg font-bold border-b pb-2 mb-4">
                            Lista de Verificación de Incidencias del Vehículo
                        </DialogTitle>

                        <button
                            onClick={closeModal}
                            className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-500 hover:text-gray-700 text-xl"
                            aria-label="Cerrar modal"
                        >
                            ❌
                        </button>

                        <div className="flex-1 overflow-y-auto">
                            <ComponenteVerificacion
                                initialIncidencias={selectedIncidencias}
                                onIncidenciasChange={handleIncidenciasChange}
                                onClose={closeModal}
                            />
                        </div>
                    </DialogPanel>
                </div>
            </Dialog>
        </div>
    );
};

export default RegistroYSalidaUnificado;