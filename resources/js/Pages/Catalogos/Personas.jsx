import { useEffect, useState } from "react";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { toast } from 'sonner';
import Datatable from "@/Components/Datatable";
import LoadingDiv from "@/Components/LoadingDiv";
import request from "@/utils";

// --- Configuración de Rutas ---
const route = (name, params = {}) => {
    const id = params.IdPersona;
    const routeMap = {
        "personas.index": "/api/personas",
        "personas.store": "/api/personas",
        "personas.update": `/api/personas/${id}`,
        "estados.index": "/api/estados",
        "municipios.index": "/api/municipios",
        "colonias.index": "/api/colonias",
        "puestos.index": "/api/puestos",
    };
    return routeMap[name] || `/${name}`;
};

const initialPersonaData = {
    IdPersona: null,
    IdEstado: "",
    IdMunicipio: "",
    IdColonia: "",
    IdPuesto: "",
    Nombres: "",
    ApePat: "",
    ApeMat: "",
    Calle: "",
    CasaNum: "",
    Telefono: "",
    FechaNacimiento: "", // Corregido: Inicializado
    FechaIngreso: "",
    Sexo: "M",
    NSS: "",
    RFC: "",
    Curp: "",
    CodigoPostal: "",
    SalarioReal: 0,
    Estatus: true,
    EsEmpleado: true,
    PathFotoEmpleado: ""
};

// --- Formulario Modal ---
function PersonaFormDialog({ isOpen, closeModal, onSubmit, dataToEdit, action, estados, municipios, colonias, puestos }) {
    const [formData, setFormData] = useState(initialPersonaData);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData(dataToEdit?.IdPersona ? { ...dataToEdit } : initialPersonaData);
            setErrors({});
        }
    }, [isOpen, dataToEdit]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;

        setFormData(prev => ({ ...prev, [name]: val }));

        // Lógica de cascada
        if (name === 'IdEstado') {
            setFormData(p => ({ ...p, IdMunicipio: "", IdColonia: "", CodigoPostal: "" }));
        }
        if (name === 'IdMunicipio') {
            setFormData(p => ({ ...p, IdColonia: "", CodigoPostal: "" }));
        }
        if (name === 'IdColonia') {
            const col = colonias.find(c => String(c.Colonia_Id) === String(value));
            if (col) setFormData(p => ({ ...p, CodigoPostal: col.c_CodigoPostal }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(formData);
        } catch (err) {
            // Captura errores de Laravel (422 Unprocessable Entity)
            const serverErrors = err.response?.data?.errors || {};
            setErrors(serverErrors);
            toast.error("Error al validar los datos.");
        } finally {
            setLoading(false);
        }
    };

    const filteredMunicipios = municipios.filter(m => String(m.idestado) === String(formData.IdEstado));
    const filteredColonias = colonias.filter(c => String(c.Colonia_IdMunicipio) === String(formData.IdMunicipio));

    return (
        <Transition show={isOpen}>
            <Dialog onClose={closeModal} className="relative z-50">
                <TransitionChild enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black/30" />
                </TransitionChild>

                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <DialogPanel className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-8 shadow-2xl relative">
                        {loading && <LoadingDiv />}
                        <DialogTitle className="text-2xl font-bold mb-6 border-b pb-2 text-indigo-900">
                            {action === 'create' ? 'Registrar Nueva Persona' : 'Editar Persona'}
                        </DialogTitle>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Datos Personales */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <h3 className="md:col-span-3 font-bold text-gray-400 uppercase text-xs tracking-wider">Datos Personales</h3>
                                <Field label="Nombres" name="Nombres" value={formData.Nombres} onChange={handleChange} error={errors.Nombres} />
                                <Field label="Apellido Paterno" name="ApePat" value={formData.ApePat} onChange={handleChange} error={errors.ApePat} />
                                <Field label="Apellido Materno" name="ApeMat" value={formData.ApeMat} onChange={handleChange} error={errors.ApeMat} />

                                <Field label="Fecha de Nacimiento" name="FechaNacimiento" type="date" value={formData.FechaNacimiento} onChange={handleChange} error={errors.FechaNacimiento} />
                                <Field label="RFC" name="RFC" value={formData.RFC} onChange={handleChange} error={errors.RFC} />
                                <Field label="CURP" name="Curp" value={formData.Curp} onChange={handleChange} error={errors.Curp} />

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Sexo</label>
                                    <select name="Sexo" value={formData.Sexo} onChange={handleChange} className="w-full border border-gray-300 rounded p-2 text-sm mt-1 focus:ring-2 focus:ring-indigo-500">
                                        <option value="M">Masculino</option>
                                        <option value="F">Femenino</option>
                                        <option value="O">Otro</option>
                                    </select>
                                    {errors.Sexo && <p className="text-red-500 text-[10px] mt-1">{errors.Sexo[0]}</p>}
                                </div>
                                <Field label="Teléfono" name="Telefono" value={formData.Telefono} onChange={handleChange} error={errors.Telefono} />
                                <Field label="NSS" name="NSS" value={formData.NSS} onChange={handleChange} error={errors.NSS} />
                            </div>

                            {/* Domicilio */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-inner">
                                <h3 className="md:col-span-3 font-bold text-gray-400 uppercase text-xs tracking-wider text-indigo-700">Domicilio</h3>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Estado</label>
                                    <select name="IdEstado" value={formData.IdEstado} onChange={handleChange} className="w-full border border-gray-300 rounded p-2 text-sm mt-1">
                                        <option value="">Seleccione...</option>
                                        {estados.map(e => <option key={e.idEstado} value={e.idEstado}>{e.descripcionEstado}</option>)}
                                    </select>
                                    {errors.IdEstado && <p className="text-red-500 text-[10px] mt-1">{errors.IdEstado[0]}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Municipio</label>
                                    <select name="IdMunicipio" value={formData.IdMunicipio} onChange={handleChange} disabled={!formData.IdEstado} className="w-full border border-gray-300 rounded p-2 text-sm mt-1 disabled:bg-gray-100">
                                        <option value="">Seleccione...</option>
                                        {filteredMunicipios.map(m => <option key={m.idMunicipio} value={m.idMunicipio}>{m.descripcionMunicipio}</option>)}
                                    </select>
                                    {errors.IdMunicipio && <p className="text-red-500 text-[10px] mt-1">{errors.IdMunicipio[0]}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Colonia</label>
                                    <select name="IdColonia" value={formData.IdColonia} onChange={handleChange} disabled={!formData.IdMunicipio} className="w-full border border-gray-300 rounded p-2 text-sm mt-1 disabled:bg-gray-100">
                                        <option value="">Seleccione...</option>
                                        {filteredColonias.map(c => <option key={c.Colonia_Id} value={c.Colonia_Id}>{c.Colonia_Nombre}</option>)}
                                    </select>
                                    {errors.IdColonia && <p className="text-red-500 text-[10px] mt-1">{errors.IdColonia[0]}</p>}
                                </div>
                                <Field label="Calle" name="Calle" value={formData.Calle} onChange={handleChange} error={errors.Calle} />
                                <Field label="Num. Exterior/Casa" name="CasaNum" value={formData.CasaNum} onChange={handleChange} error={errors.CasaNum} />
                                <Field label="Código Postal" name="CodigoPostal" value={formData.CodigoPostal} onChange={handleChange} readOnly />
                            </div>

                            {/* Laboral */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <h3 className="md:col-span-3 font-bold text-gray-400 uppercase text-xs tracking-wider">Información Laboral</h3>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Puesto</label>
                                    <select name="IdPuesto" value={formData.IdPuesto} onChange={handleChange} className="w-full border border-gray-300 rounded p-2 text-sm mt-1 focus:ring-2 focus:ring-indigo-500">
                                        <option value="">Seleccione puesto...</option>
                                        {puestos.map(p => <option key={p.IdPuesto} value={p.IdPuesto}>{p.nombre}</option>)}
                                    </select>
                                    {errors.IdPuesto && <p className="text-red-500 text-[10px] mt-1">{errors.IdPuesto[0]}</p>}
                                </div>
                                <Field label="Salario Real" name="SalarioReal" type="number" value={formData.SalarioReal} onChange={handleChange} error={errors.SalarioReal} />
                                <Field label="Fecha Ingreso" name="FechaIngreso" type="date" value={formData.FechaIngreso} onChange={handleChange} error={errors.FechaIngreso} />

                                <div className="flex items-center gap-6 mt-6 md:col-span-3">
                                    <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                                        <input type="checkbox" name="Estatus" checked={formData.Estatus} onChange={handleChange} className="rounded text-indigo-600 w-4 h-4 focus:ring-indigo-500" /> Activo
                                    </label>
                                    <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                                        <input type="checkbox" name="EsEmpleado" checked={formData.EsEmpleado} onChange={handleChange} className="rounded text-indigo-600 w-4 h-4 focus:ring-indigo-500" /> Es Empleado
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t mt-4">
                                <button type="button" onClick={closeModal} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-all font-medium">Cancelar</button>
                                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-md font-bold hover:bg-indigo-700 transition-all shadow-md active:scale-95">Guardar Persona</button>
                            </div>
                        </form>
                    </DialogPanel>
                </div>
            </Dialog>
        </Transition>
    );
}

// Auxiliar Field Corregido para manejar arrays de errores
const Field = ({ label, name, value, onChange, type = "text", error, readOnly = false }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <input type={type} name={name} value={value} onChange={onChange} readOnly={readOnly}
            className={`w-full mt-1 border rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${error ? 'border-red-500 bg-red-50' : 'border-gray-300'} ${readOnly ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`} />
        {error && <p className="text-red-500 text-[10px] mt-1 font-bold italic">{Array.isArray(error) ? error[0] : error}</p>}
    </div>
);

// --- Componente Principal ---
export default function Personas() {
    const [data, setData] = useState([]);
    const [cats, setCats] = useState({ est: [], mun: [], col: [], pue: [] });
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState({ open: false, action: 'create', item: null });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [resP, resE, resM, resC, resPue] = await Promise.all([
                fetch(route("personas.index")),
                fetch(route("estados.index")),
                fetch(route("municipios.index")),
                fetch(route("colonias.index")),
                fetch(route("puestos.index"))
            ]);

            const jsonP = await resP.json();
            const jsonM = await resM.json();
            const jsonC = await resC.json();
            const jsonPue = await resPue.json();

            setData(jsonP.data || []);
            setCats({
                est: await resE.json(),
                mun: jsonM.data || jsonM,
                col: jsonC.data || jsonC,
                pue: jsonPue.data || jsonPue
            });
        } catch (e) {
            toast.error("Error al cargar los catálogos del servidor.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSave = async (formData) => {
        const isEdit = !!formData.IdPersona;
        const url = isEdit ? route("personas.update", { IdPersona: formData.IdPersona }) : route("personas.store");
        await request(url, isEdit ? "PUT" : "POST", formData);
        toast.success(isEdit ? "Persona actualizada correctamente" : "Persona registrada con éxito");
        fetchData();
        setModal({ open: false });
    };

    return (
        <div className="relative h-full pb-4 px-3 overflow-auto bg-gray-50">
            <div className="flex justify-between items-center p-4 border-b mb-6 bg-white sticky top-0 z-10 shadow-sm rounded-b-xl">
                <h2 className="text-2xl font-extrabold text-indigo-900 tracking-tight">Catálogo de Personas / RH</h2>
                <button onClick={() => setModal({ open: true, action: 'create', item: null })}
                    className="flex items-center px-4 py-2 text-base font-semibold text-white rounded-lg shadow-md  transition duration-150 ease-in-out"
                    style={{ backgroundColor: '#A61A18' }}


                >
                    + Nueva Persona
                </button>
            </div>

            {loading ? <div className="flex justify-center mt-20"><LoadingDiv /></div> : (
                <div className="bg-white rounded-xl shadow-md p-2">
                    <Datatable
                        data={data}
                        virtual={true}
                        columns={[
                            { header: 'Nombre Completo', cell: (p) => <span className="font-bold text-gray-700">{`${p.item.Nombres} ${p.item.ApePat} ${p.item.ApeMat || ''}`}</span> },
                            { header: 'RFC', accessor: 'RFC' },
                            { header: 'CURP', accessor: 'Curp' },
                            {
                                header: 'Puesto', cell: (p) => {
                                    const puestoObj = cats.pue.find(pu => String(pu.IdPuesto) === String(p.item.IdPuesto));
                                    return <span className="text-indigo-600 font-medium">{puestoObj ? puestoObj.nombre : 'Sin Puesto'}</span>;
                                }
                            },
                            {
                                header: 'Estatus', cell: (p) => (
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-black ${p.item.Estatus ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {p.item.Estatus ? 'ACTIVO' : 'INACTIVO'}
                                    </span>
                                )
                            },
                            {
                                header: 'Acciones', cell: (p) => (
                                    <button onClick={() => setModal({ open: true, action: 'edit', item: p.item })}
                                        className="text-white bg-indigo-500 hover:bg-indigo-700 px-3 py-1 rounded-lg text-xs font-bold transition-colors">
                                        Editar
                                    </button>
                                )
                            }
                        ]}
                    />
                </div>
            )}

            <PersonaFormDialog
                isOpen={modal.open}
                closeModal={() => setModal({ open: false })}
                action={modal.action}
                dataToEdit={modal.item}
                onSubmit={handleSave}
                estados={cats.est}
                municipios={cats.mun}
                colonias={cats.col}
                puestos={cats.pue}
            />
        </div>
    );
}