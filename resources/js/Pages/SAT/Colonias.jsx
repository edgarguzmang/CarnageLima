import { useEffect, useState } from "react";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { toast } from 'sonner';
import Datatable from "@/Components/Datatable";
import LoadingDiv from "@/Components/LoadingDiv";
import request from "@/utils";

// --- Configuración de Rutas ---
const route = (name, params = {}) => {
    const id = params.Colonia_Id;
    const routeMap = {
        "colonias.index": "/api/colonias",
        "colonias.store": "/api/colonias",
        "colonias.update": `/api/colonias/${id}`,
        "estados.index": "/api/estados",
        "municipios.index": "/api/municipios",
    };
    return routeMap[name] || `/${name}`;
};

const validateInputs = (data) => {
    let formErrors = {};
    if (!data.Colonia_Nombre?.trim()) formErrors.Colonia_Nombre = 'El nombre es obligatorio.';
    if (!data.Colonia_IdMunicipio) formErrors.Colonia_IdMunicipio = 'El municipio es obligatorio.';
    if (!data.c_CodigoPostal?.trim()) formErrors.c_CodigoPostal = 'El CP es obligatorio.';
    return { isValid: Object.keys(formErrors).length === 0, errors: formErrors };
};

const initialColoniaData = {
    Colonia_Id: null,
    Colonia_Nombre: "",
    Colonia_IdMunicipio: "",
    c_CodigoPostal: "",
    Colonia_cveSAT: "",
    idEstado: "", // Auxiliar para el form
};

// --- Componente del Formulario Modal ---
function ColoniaFormDialog({ isOpen, closeModal, onSubmit, dataToEdit, action, errors, setErrors, estados, municipios }) {
    const [formData, setFormData] = useState(initialColoniaData);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const munDoc = municipios.find(m => m.id === dataToEdit?.Colonia_IdMunicipio);
            setFormData({
                Colonia_Id: dataToEdit?.Colonia_Id || null,
                Colonia_Nombre: dataToEdit?.Colonia_Nombre || "",
                Colonia_IdMunicipio: dataToEdit?.Colonia_IdMunicipio || "",
                c_CodigoPostal: dataToEdit?.c_CodigoPostal || "",
                Colonia_cveSAT: dataToEdit?.Colonia_cveSAT || "",
                idEstado: munDoc?.idestado || "",
            });
            setErrors({});
        }
    }, [isOpen, dataToEdit, municipios]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'idEstado') setFormData(prev => ({ ...prev, Colonia_IdMunicipio: "" }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try { await onSubmit(formData); } finally { setLoading(false); }
    };

    const filteredMun = municipios.filter(m => String(m.idestado) === String(formData.idEstado));

    return (
        <Transition show={isOpen}>
            <Dialog onClose={closeModal} className="relative z-50">
                <TransitionChild enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black/30" />
                </TransitionChild>
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <DialogPanel className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
                        {loading && <LoadingDiv />}
                        <DialogTitle className="text-2xl font-bold mb-4 border-b pb-2">
                            {action === 'create' ? 'Nueva Colonia' : 'Editar Colonia'}
                        </DialogTitle>
                        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                            <div className="col-span-1">
                                <label className="text-sm font-medium">Estado:</label>
                                <select name="idEstado" value={formData.idEstado} onChange={handleChange} className="w-full mt-1 border rounded p-2 text-sm">
                                    <option value="">Seleccione...</option>
                                    {estados.map(e => <option key={e.idEstado} value={e.idEstado}>{e.descripcionEstado}</option>)}
                                </select>
                            </div>
                            <div className="col-span-1">
                                <label className="text-sm font-medium">Municipio:</label>
                                <select name="Colonia_IdMunicipio" value={formData.Colonia_IdMunicipio} onChange={handleChange} className="w-full mt-1 border rounded p-2 text-sm">
                                    <option value="">Seleccione...</option>
                                    {filteredMun.map(m => <option key={m.id} value={m.id}>{m.descripcionMunicipio}</option>)}
                                </select>
                                {errors.Colonia_IdMunicipio && <p className="text-red-500 text-xs">{errors.Colonia_IdMunicipio}</p>}
                            </div>
                            <div className="col-span-2">
                                <label className="text-sm font-medium">Nombre Colonia:</label>
                                <input type="text" name="Colonia_Nombre" value={formData.Colonia_Nombre} onChange={handleChange} className="w-full mt-1 border rounded p-2 text-sm" />
                                {errors.Colonia_Nombre && <p className="text-red-500 text-xs">{errors.Colonia_Nombre}</p>}
                            </div>
                            <div className="col-span-1">
                                <label className="text-sm font-medium">CP:</label>
                                <input type="text" name="c_CodigoPostal" value={formData.c_CodigoPostal} onChange={handleChange} className="w-full mt-1 border rounded p-2 text-sm" />
                            </div>
                            <div className="col-span-1">
                                <label className="text-sm font-medium">Clave SAT:</label>
                                <input type="text" name="Colonia_cveSAT" value={formData.Colonia_cveSAT} onChange={handleChange} className="w-full mt-1 border rounded p-2 text-sm" />
                            </div>
                            <div className="col-span-2 flex justify-end gap-2 pt-4 border-t">
                                <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-100 rounded text-sm">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded text-sm">Guardar</button>
                            </div>
                        </form>
                    </DialogPanel>
                </div>
            </Dialog>
        </Transition>
    );
}

// --- Componente Principal ---
export default function Colonias() {
    const [colonias, setColonias] = useState([]);
    const [estados, setEstados] = useState([]);
    const [municipios, setMunicipios] = useState([]);
    
    const [filterEstado, setFilterEstado] = useState("");
    const [filterMunicipio, setFilterMunicipio] = useState("");
    
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [action, setAction] = useState('create');
    const [currentCol, setCurrentCol] = useState(initialColoniaData);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    const getColonias = async () => {
        setIsLoading(true);
        try {
            let url = route("colonias.index");
            if (filterMunicipio) url += `?Colonia_IdMunicipio=${filterMunicipio}`;
            const res = await fetch(url);
            const data = await res.json();
            setColonias(data.data || data); // Maneja paginación de Laravel
        } catch (error) { toast.error("Error al cargar colonias."); }
        finally { setIsLoading(false); }
    };

    useEffect(() => {
        const fetchCats = async () => {
            const [re, rm] = await Promise.all([fetch(route("estados.index")), fetch(route("municipios.index"))]);
            setEstados(await re.json());
            const dm = await rm.json();
            setMunicipios(dm.data || dm);
        };
        fetchCats();
    }, []);

    useEffect(() => { getColonias(); }, [filterMunicipio]);

    const submit = async (formData) => {
        const val = validateInputs(formData);
        if (!val.isValid) return setErrors(val.errors);
        const isEdit = !!formData.Colonia_Id;
        const method = isEdit ? "PUT" : "POST";
        const url = isEdit ? route("colonias.update", { Colonia_Id: formData.Colonia_Id }) : route("colonias.store");

        try {
            await request(url, method, formData);
            toast.success("¡Éxito!");
            getColonias();
            setIsDialogOpen(false);
        } catch (e) { toast.error("Error al guardar."); }
    };

    return (
        <div className="relative h-full pb-4 px-3 overflow-auto">
            <div className="sticky top-0 z-10 bg-white border-b pb-4 pt-2">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Catálogo de Colonias</h2>
                    <button onClick={() => { setAction('create'); setCurrentCol(initialColoniaData); setIsDialogOpen(true); }} className="px-4 py-2 bg-indigo-600 text-white rounded">+ Nueva</button>
                </div>

                <div className="flex gap-4 p-3 bg-gray-50 rounded-lg border">
                    <div className="flex-1">
                        <label className="text-[10px] font-bold uppercase text-gray-500">Estado</label>
                        <select className="w-full border rounded p-1 text-sm" value={filterEstado} onChange={(e) => { setFilterEstado(e.target.value); setFilterMunicipio(""); }}>
                            <option value="">Todos</option>
                            {estados.map(e => <option key={e.idEstado} value={e.idEstado}>{e.descripcionEstado}</option>)}
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="text-[10px] font-bold uppercase text-gray-500">Municipio</label>
                        <select className="w-full border rounded p-1 text-sm" value={filterMunicipio} onChange={(e) => setFilterMunicipio(e.target.value)} disabled={!filterEstado}>
                            <option value="">Todos</option>
                            {municipios.filter(m => String(m.idestado) === String(filterEstado)).map(m => <option key={m.id} value={m.id}>{m.descripcionMunicipio}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {isLoading ? <LoadingDiv /> : (
                <Datatable
                    data={colonias}
                    virtual={true}
                    columns={[
                        { header: 'CP', accessor: 'c_CodigoPostal' },
                        { header: 'Nombre', accessor: 'Colonia_Nombre' },
                        { header: 'SAT', accessor: 'Colonia_cveSAT' },
                        // {
                        //     header: "Acciones",
                        //     cell: (props) => (
                        //         <button onClick={() => { setAction('edit'); setCurrentCol(props.item); setIsDialogOpen(true); }} className="text-indigo-600 hover:underline text-sm font-medium">Editar</button>
                        //     )
                        // },

                          {
                            header: "Acciones",
                            accessor: "actions",
                            // width: '15%',
                            cell: (props) => (
                                <div className="flex space-x-2">
                                    <button
                                       onClick={() => { setAction('edit'); setCurrentCol(props.item); setIsDialogOpen(true); }}
                                        className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
                                    >
                                        Editar
                                    </button>
                                </div>
                            )
                        },
                    ]}
                />
            )}

            <ColoniaFormDialog
                isOpen={isDialogOpen} closeModal={() => setIsDialogOpen(false)}
                onSubmit={submit} dataToEdit={currentCol} action={action}
                errors={errors} setErrors={setErrors} estados={estados} municipios={municipios}
            />
        </div>
    );
}