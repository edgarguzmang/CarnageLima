import { useEffect, useState } from "react";
import { Dialog, DialogPanel, DialogTitle, Transition } from '@headlessui/react';
import { toast } from 'sonner';
import Datatable from "@/Components/Datatable";
import LoadingDiv from "@/Components/LoadingDiv";
import request from "@/utils";

// Función para mapear rutas de API
const route = (name, params = {}) => {
    const id = params.Departamentos_id;
    const routeMap = {
        "DepartamentosActivos": "/api/DepartamentosActivos",
        "departamentos.store": "/api/departamentos",
        "departamentos.update": `/api/departamentos/${id}`,
    };
    return routeMap[name] || `/${name}`;
};

// Función de validación de entradas
const validateInputs = (validations, data) => {
    let formErrors = {};
    if (validations.Departamentos_nombre && !data.Departamentos_nombre?.trim()) formErrors.Departamentos_nombre = 'El nombre del departamento es obligatorio.';
    return { isValid: Object.keys(formErrors).length === 0, errors: formErrors };
};


const departmentValidations = {
    Departamentos_nombre: true,
};

const initialDepartmentData = {
    Departamentos_id: null,
    Departamentos_nombre: "",
    Departamentos_estatus: 1, // Por defecto: Activo (1)
};

// --- Componente del Formulario (Diálogo Modal) ---

function DepartmentFormDialog({ isOpen, closeModal, onSubmit, departmentToEdit, action, errors, setErrors }) {
    const [departmentData, setDepartmentData] = useState(initialDepartmentData);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const dataToLoad = departmentToEdit || initialDepartmentData;
            setDepartmentData(dataToLoad);
            setErrors({});
        }
    }, [isOpen, departmentToEdit, setErrors]);


    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const finalValue = type === 'checkbox' ? (checked ? "1" : "0") : value;
        setDepartmentData(prevData => ({
            ...prevData,
            [name]: finalValue,
        }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(departmentData);
            // El cierre del modal se maneja en el componente principal 'Departamentos'
        } catch (error) {
            // Manejo de error (ej: validación fallida)
        } finally {
            setLoading(false);
        }
    };

    const dialogTitle = action === 'create' ? 'Crear Nuevo Departamento' : 'Editar Departamento';

    return (
        <Transition show={isOpen}>
            <Dialog open={isOpen} onClose={closeModal} className="relative z-50">
                <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <DialogPanel className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl relative">
                        {loading && <LoadingDiv />}
                        <DialogTitle className="text-2xl font-bold mb-4 text-gray-900 border-b pb-2">
                            {dialogTitle}
                        </DialogTitle>

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">

                            {/* Campo Nombre del Departamento */}
                            <label className="block">
                                <span className="text-sm font-medium text-gray-700">Nombre del Departamento: <span className="text-red-500">*</span></span>
                                <input
                                    type="text"
                                    name="Departamentos_nombre"
                                    value={departmentData.Departamentos_nombre || ''}
                                    onChange={handleChange}
                                    className={`mt-1 block w-full rounded-md border p-2 text-sm ${errors.Departamentos_nombre ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                                />
                                {errors.Departamentos_nombre && <p className="text-red-500 text-xs mt-1">{errors.Departamentos_nombre}</p>}
                            </label>

                            <div className="flex justify-center w-full"> {/* <-- Contenedor agregado y clases de centrado */}
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        name="Departamentos_estatus"
                                        checked={departmentData.Departamentos_estatus === "1"}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Estatus</span>
                                </label>
                            </div>

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
                                    {loading ? (action === 'create' ? 'Registrando...' : 'Actualizando...') : (action === 'create' ? 'Guardar Departamento' : 'Actualizar Departamento')}
                                </button>
                            </div>
                        </form>
                    </DialogPanel>
                </div>
            </Dialog>
        </Transition>
    )
}

export default function Departamentos() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [action, setAction] = useState('create');
    const [departmentData, setDepartmentData] = useState(initialDepartmentData);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    const openCreateModal = () => {
        setAction('create');
        setDepartmentData(initialDepartmentData);
        setErrors({});
        setIsDialogOpen(true);
    };

    const openEditModal = (department) => {
        setAction('edit');
        setDepartmentData(department);
        setErrors({});
        setIsDialogOpen(true);
    };

    const closeModal = () => {
        setIsDialogOpen(false);
        setDepartmentData(initialDepartmentData);
        setErrors({});
    };

    const submit = async (data) => {
        setErrors({});
        const validationResult = validateInputs(departmentValidations, data);

        if (!validationResult.isValid) {
            setErrors(validationResult.errors);
            toast.error("Por favor, corrige los errores en el formulario.");
            throw new Error("Validation Failed");
        }

        const isEdit = data.Departamentos_id;
        const ruta = isEdit
            ? route("departamentos.update", { Departamentos_id: data.Departamentos_id })
            : route("departamentos.store");

        const method = isEdit ? "PUT" : "POST";
        const successMessage = isEdit ? "Departamento actualizado con éxito." : "Departamento creado con éxito.";

        try {
            const payload = {
                Departamentos_nombre: data.Departamentos_nombre,
                Departamentos_estatus: data.Departamentos_estatus, // Incluir el estatus
            };

            await request(ruta, method, payload);
            await getDepartments(); // Recargar la tabla
            toast.success(successMessage);
            closeModal(); // Cerrar solo si la operación fue exitosa

        } catch (error) {
            console.error("Error al guardar el departamento:", error);
            toast.error("Hubo un error al guardar el departamento.");
            throw error;
        }
    };


    const getDepartments = async () => {
        try {
            setIsLoading(true);
            const data = await fetch(route("DepartamentosActivos")).then(res => res.json());
            setDepartments(data);
            setIsLoading(false);
        } catch (error) {
            console.error('Error al obtener los usuarios:', error);
        }
    }

    useEffect(() => {
        getDepartments()
    }, [])

    return (
        <div className="relative h-[100%] pb-4 px-3 overflow-auto blue-scroll">
            <div className="flex justify-between items-center p-3 border-b mb-4">
                <h2 className="text-3xl font-bold text-gray-800">Gestión de Departamentos</h2>
                <button
                    onClick={openCreateModal}
                    className="flex items-center px-4 py-2 text-base font-semibold text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 transition duration-150 ease-in-out"
                >
                    + Nuevo Departamento
                </button>
            </div>

            {isLoading ? (
                <div className='flex items-center justify-center h-[100%] w-full'> <LoadingDiv /> </div>
            ) : (
                <Datatable
                    data={departments}
                    virtual={true}
                    columns={[

                        {
                            header: "Estatus",
                            accessor: "Departamentos_estatus",
                            width: '20%',
                            cell: ({ item: { Departamentos_estatus } }) => {
                                const color = String(Departamentos_estatus) === "1"
                                    ? "bg-green-300" // Si es "1"
                                    : "bg-red-300";  // Si NO es "1" (incluyendo "2", "0", null, etc.)

                                return (
                                    <span className={`inline-flex items-center justify-center rounded-full ${color} w-4 h-4`} />
                                );
                            },
                        },
                        { header: 'Nombre', accessor: 'Departamentos_nombre' },
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

            <DepartmentFormDialog
                isOpen={isDialogOpen}
                closeModal={closeModal}
                onSubmit={submit}
                departmentToEdit={departmentData}
                action={action}
                errors={errors}
                setErrors={setErrors}
            />

        </div>
    );
}