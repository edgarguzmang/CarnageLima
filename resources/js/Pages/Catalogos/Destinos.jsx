import { useEffect, useState } from "react";
import { Dialog, DialogPanel, DialogTitle, Transition } from '@headlessui/react';
import { toast } from 'sonner';
// Asumiendo que Datatable y LoadingDiv existen en tu entorno de componentes
import Datatable from "@/Components/Datatable";
import LoadingDiv from "@/Components/LoadingDiv";
import request from "@/utils";

// --- DUMMY FUNCTIONS (Ajustar a tu backend) ---
// Función para simular las rutas de la API
const route = (name, params = {}) => {
    const id = params.Destinos_Id;
    const routeMap = {
        "DestinosQuiencQuien": "/api/DestinosQuiencQuien",
        "destinos.store": "/api/destinos",
        "destinos.update": `/api/destinos/${id}`,
        "destinos.destroy": `/api/destinos/${id}`,
    };
    return routeMap[name] || `/${name}`;
};

// Función DUMMY de validación para Destinos (Actualizada sin Descripción)
const validateInputs = (validations, data) => {
    let formErrors = {};

    if (validations.Destinos_Nombre && !data.Destinos_Nombre?.trim()) formErrors.Destinos_Nombre = 'El nombre del destino es obligatorio.';
    // if (validations.Destinos_Latitud && (data.Destinos_Latitud === "" || isNaN(data.Destinos_Latitud))) formErrors.Destinos_Latitud = 'La latitud es obligatoria y debe ser un número.';
    // if (validations.Destinos_Longitud && (data.Destinos_Longitud === "" || isNaN(data.Destinos_Longitud))) formErrors.Destinos_Longitud = 'La longitud es obligatoria y debe ser un número.';

    return { isValid: Object.keys(formErrors).length === 0, errors: formErrors };
};

// Validaciones requeridas para el formulario de Destino (¡Sin Descripción!)
const destinationValidations = {
    Destinos_Nombre: true,
    Destinos_Latitud: false,
    Destinos_Longitud: false,
};

const userObject = JSON.parse(localStorage.getItem('user'));
// const personasUsuarioID = userObject.Personas_usuarioID; // Esta era la línea que faltaba si querías una variable intermedia
// Datos de ejemplo para el estado inicial del formulario de Unidad

// Datos de ejemplo para el estado inicial del formulario de destino (¡Sin Descripción!)
const initialDestinationData = {
    Destinos_Id: null,
    Destinos_Nombre: "",
    Destinos_Latitud: null,
    Destinos_Longitud: null,
    Destinos_Estatus: "1", // Activo por defecto
    Destinos_UsuarioID: userObject.Personas_usuarioID
};

// Componente del Formulario de Destino (Modal de Headless UI)
function DestinationFormDialog({ isOpen, closeModal, onSubmit, destinationToEdit, action, errors, setErrors }) {
    const [destinationData, setDestinationData] = useState(initialDestinationData);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const dataToLoad = destinationToEdit || initialDestinationData;
            setDestinationData(dataToLoad);
            setErrors({});
        }
    }, [isOpen, destinationToEdit]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const finalValue = type === 'checkbox' ? (checked ? "1" : "0") : value;

        setDestinationData(prevData => ({
            ...prevData,
            [name]: finalValue
        }));

    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(destinationData);
            closeModal();
        } catch (error) {
            // El error ya fue manejado en la función onSubmit
        } finally {
            setLoading(false);
        }
    };

    const handleChangeNumeric = (e) => {
        const { name, value } = e.target;

        if (name !== 'Destinos_Longitud') {
            // Manejar otros campos si existen, o simplemente retornar
            return;
        }

        let filteredValue = value.replace(/[^\d.-]/g, '');

        if (filteredValue.includes('-')) {
            let valueWithoutDash = filteredValue.replace(/-/g, '');

            if (value.startsWith('-')) {
                filteredValue = '-' + valueWithoutDash;
            } else {
                filteredValue = valueWithoutDash;
            }
        }

        const parts = filteredValue.split('.');
        if (parts.length > 2) {
            filteredValue = parts[0] + '.' + parts.slice(1).join('');
        }

        setDestinationData(prevState => ({
            ...prevState,
            [name]: filteredValue
        }));
    };

    const dialogTitle = action === 'create' ? 'Crear Nuevo Destino' : 'Editar Destino';

    return (
        <Transition show={isOpen}>
            <Dialog open={isOpen} onClose={closeModal} className="relative z-50">
                <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <DialogPanel className="w-full max-w-xl rounded-xl bg-white p-6 shadow-2xl relative">
                        {loading && <LoadingDiv />}
                        <DialogTitle className="text-2xl font-bold mb-4 text-gray-900 border-b pb-2">
                            {dialogTitle}
                        </DialogTitle>

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">

                            {/* Input Nombre */}
                            <label className="block">
                                <span className="text-sm font-medium text-gray-700">Nombre del Destino: <span className="text-red-500">*</span></span>
                                <input
                                    type="text"
                                    name="Destinos_Nombre"
                                    value={destinationData.Destinos_Nombre || ''}
                                    onChange={handleChange}
                                    className={`mt-1 block w-full rounded-md border p-2 text-sm ${errors.Destinos_Nombre ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                                />
                                {errors.Destinos_Nombre && <p className="text-red-500 text-xs mt-1">{errors.Destinos_Nombre}</p>}
                            </label>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Input Latitud */}
                                <label className="block">
                                    <span className="text-sm font-medium text-gray-700">Latitud (No requerido): <span className="text-red-500">*</span></span>
                                    <input
                                        type="text"
                                        name="Destinos_Latitud"
                                        value={destinationData.Destinos_Latitud || ''}
                                        onChange={handleChange}
                                        className={`mt-1 block w-full rounded-md border p-2 text-sm ${errors.Destinos_Latitud ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                                        placeholder="25.5428443000"
                                    />
                                    {errors.Destinos_Latitud && <p className="text-red-500 text-xs mt-1">{errors.Destinos_Latitud}</p>}
                                </label>

                                {/* Input Longitud */}
                                <label className="block">
                                    <span className="text-sm font-medium text-gray-700">Longitud (No requerido): <span className="text-red-500">*</span></span>
                                    <input
                                        type="text"
                                        name="Destinos_Longitud"
                                        value={destinationData.Destinos_Longitud || ''}
                                        onChange={handleChangeNumeric}
                                        className={`mt-1 block w-full rounded-md border p-2 text-sm ${errors.Destinos_Longitud ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                                        placeholder="-103.4067861000"
                                    />
                                    {errors.Destinos_Longitud && <p className="text-red-500 text-xs mt-1">{errors.Destinos_Longitud}</p>}
                                </label>



                            </div>
                            <div className="flex justify-center w-full"> {/* <-- Contenedor agregado y clases de centrado */}
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        name="Destinos_Estatus"
                                        checked={destinationData.Destinos_Estatus === "1"}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Estatus</span>
                                </label>
                            </div>

                            {/* Botones */}
                            <div className="col-span-1 flex justify-end gap-3 pt-4 border-t mt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={loading}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                                >
                                    {loading ? (action === 'create' ? 'Registrando...' : 'Actualizando...') : (action === 'create' ? 'Guardar Destino' : 'Actualizar Destino')}
                                </button>
                            </div>
                        </form>
                    </DialogPanel>
                </div>
            </Dialog>
        </Transition>
    )
}

// ----------------------------------------------------------------------
// Componente principal Destinos
// ----------------------------------------------------------------------

export default function Destinos() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [destinations, setDestinations] = useState([]);
    const [action, setAction] = useState('create');
    const [destinationData, setDestinationData] = useState(initialDestinationData);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    const openCreateModal = () => {
        setAction('create');
        setDestinationData(initialDestinationData);
        setErrors({});
        setIsDialogOpen(true);
    };

    const openEditModal = (destination) => {
        setAction('edit');
        setDestinationData(destination);
        setErrors({});
        setIsDialogOpen(true);
    };

    const closeModal = () => {
        setIsDialogOpen(false);
        setDestinationData(initialDestinationData);
        setErrors({});
    };

    // Función para crear/actualizar un destino
    const submit = async (data) => {
        // console.log("Datos a enviar:", data); // Depuración
        setErrors({});
        const validationResult = validateInputs(destinationValidations, data);

        if (!validationResult.isValid) {
            setErrors(validationResult.errors);
            toast.error("Por favor, corrige los errores en el formulario.");
            throw new Error("Validation Failed");
        }

        const isEdit = data.Destinos_Id;
        const ruta = isEdit
            ? route("destinos.update", { Destinos_Id: data.Destinos_Id })
            : route("destinos.store");

        const method = isEdit ? "PUT" : "POST";
        const successMessage = isEdit ? "Destino actualizado con éxito." : "Destino creado con éxito.";

        try {
            // Envía solo los campos fillable
            const payload = {
                // Si data.Destinos_Nombre es null o undefined, usa null
                Destinos_Nombre: data.Destinos_Nombre ?? null,
                // Si data.Destinos_Latitud es null o undefined, usa null
                Destinos_Latitud: data.Destinos_Latitud ?? null,
                // Si data.Destinos_Longitud es null o undefined, usa null
                Destinos_Longitud: data.Destinos_Longitud ?? null,
                // Si data.Destinos_Estatus es null o undefined, usa null
                Destinos_Estatus: data.Destinos_Estatus ?? null,
                // Si data.Destinos_UsuarioID es null o undefined, usa null
                Destinos_UsuarioID: data.Destinos_UsuarioID ?? null
            };

            await request(ruta, method, payload);
            await getDestinations();
            toast.success(successMessage);
        } catch (error) {
            console.error("Error al guardar el destino:", error);
            toast.error("Hubo un error al guardar el destino.");
            throw error;
        }
    };



    const getDestinations = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(route("DestinosQuiencQuien"));
            const result = await response.json();

            setDestinations(result);

        } catch (error) {
            console.error('Error al obtener los destinos:', error);
            toast.error("No se pudieron cargar los destinos.");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        getDestinations()
    }, [])

    return (
        <div className="relative h-[100%] pb-4 px-3 overflow-auto blue-scroll">
            <div className="flex justify-between items-center p-3 border-b mb-4">
                <h2 className="text-3xl font-bold text-gray-800">Gestión de Destinos</h2>
                <button
                    onClick={openCreateModal}
                    className="flex items-center px-4 py-2 text-base font-semibold text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 transition duration-150 ease-in-out"
                >
                    + Nuevo Destino
                </button>
            </div>

            {isLoading ? (
                <div className='flex items-center justify-center h-[100%] w-full'> <LoadingDiv /> </div>

            ) : (
                <Datatable
                    data={destinations}
                    virtual={true}
                    columns={[
                        {
                            header: "Estatus",
                            accessor: "Destinos_Estatus",
                            width: '20%',
                            cell: ({ item: { Destinos_Estatus } }) => {
                                const color = String(Destinos_Estatus) === "1"
                                    ? "bg-green-300" // Si es "1"
                                    : "bg-red-300";  // Si NO es "1" (incluyendo "2", "0", null, etc.)

                                return (
                                    <span className={`inline-flex items-center justify-center rounded-full ${color} w-4 h-4`} />
                                );
                            },
                        },
                        { header: 'Nombre', accessor: 'Destinos_Nombre' },
                        { header: 'Latitud', accessor: 'Destinos_Latitud' },
                        { header: 'Longitud', accessor: 'Destinos_Longitud' },
                        {
                            header: "Acciones", accessor: "Acciones", cell: (eprops) => (<div className="flex space-x-2">
                                <button
                                    onClick={() => openEditModal(eprops.item)}
                                    className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200"
                                >
                                    Editar
                                </button>

                            </div>)
                        },
                    ]}
                />
            )}


            {/* Componente Modal de Headless UI */}
            <DestinationFormDialog
                isOpen={isDialogOpen}
                closeModal={closeModal}
                onSubmit={submit}
                destinationToEdit={destinationData}
                action={action}
                errors={errors}
                setErrors={setErrors}
            />

        </div>
    );
}