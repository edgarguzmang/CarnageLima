import { useEffect, useState } from "react";
import { toast } from 'sonner';
import Datatable from "@/Components/Datatable";
import { excelTemplate } from '../Catalogos/ExcelTemplate'

import {
    Truck,
    User,
    Plus,
    ArrowRight,
    ClipboardList,
    FileText,
    Clock,
    ArrowUpRight,
    ArrowDownLeft,
    ChevronsRight, SendHorizontal,
    Activity,
    Check,
    // Door 
} from 'lucide-react';

export default function Reportes() {
    const [reportes, setReportes] = useState({
        totalMovimientos: 0,
        totalSalidas: 0,
        movimientos: [],
        totalEntradas: 0,
    });
    const [units, setUnits] = useState([]); // Cambiado a units
    const [users, setUsers] = useState([]);
    const [filtros, setfiltros] = useState({
        usuarioID: null,
        unidad: null,
        tipoMovimiento: null,
        fechaInicio: null,
        fechaFin: null,
    });


    const getReportes = async () => {
        try {
            const response = await fetch(route('ReporteMovimientos'), {
                method: 'POST',
                body: JSON.stringify(filtros),
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            setReportes(data);

        } catch (err) {
            console.error('Error al obtener movimientos:', err);
        }
    };


    const getUnits = async () => {

        try {
            const response = await fetch(route("unidades.index"));

            if (!response.ok) {
                throw new Error(`Error en la solicitud: ${response.statusText} (${response.status})`);
            }
            const data = await response.json();
            setUnits(data);

        } catch (error) {
            console.error('Error al obtener las unidades:', error);
        } finally {
        }
    };

    const getUsers = async () => {
        try {
            const data = await fetch(route("users.index")).then(res => res.json());
            setUsers(data);
        } catch (error) {
            console.error('Error al obtener los usuarios:', error);
        }
    }


    useEffect(() => {
        getReportes()
        getUsers();
        getUnits()
    }, [])

    const excelColumns = [
        { header: "Fecha salida", accessor: "fecha_salida", type: "date" },
        { header: "Fecha entrada", accessor: "fecha_entrada", type: "date" },


        { header: "Chofer", accessor: "nombre_chofer", type: "text" },
        { header: "Unidad", accessor: "Unidades_numeroEconomico", type: "text" },
        { header: "Motivo", accessor: "motivo", type: "text" },
        { header: "Destino", accessor: "destino", type: "text" },
        { header: "Combustible salida", accessor: "combustible_salida", type: "number" },
        { header: "Combustible entrada", accessor: "combustible_entrada", type: "number" },
        { header: "Combustible consumido", accessor: "combustible_consumido", type: "number" },

        { header: "Kilometraje recorrido", accessor: "km_recorridos", type: "number" },
        { header: "Kilometraje Rendimiento", accessor: "rendimiento_kml", type: "number" },
        { header: "Ayudante-1", accessor: "ayudante1", type: "text" },
        { header: "Ayudante-2", accessor: "ayudante2", type: "text" },
        { header: "Ayudante-3", accessor: "ayudante3", type: "text" },
        { header: "Ayudante-4", accessor: "ayudante4", type: "text" },
        { header: "Ayudante-5", accessor: "ayudante5", type: "text" },

        
    ]

    const handleExportExcel = () => excelTemplate(
        reportes.viajes_completos_rendimiento,
        excelColumns,
        filtros,
        "Reporte_Movimientos"
    )


    function StatCard({ name, value, color = 'text-gray-900', icon: Icon }) {
        return (
            <div className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100 flex items-center justify-between transition transform hover:scale-[1.01] duration-300 ease-in-out">
                <div>
                    <p className="text-sm font-medium text-gray-500">{name}</p>
                    <p className={`mt-1 text-4xl font-extrabold ${color}`}>{value}</p>
                </div>
                {/* Icono con color tenue y un círculo de fondo para contraste */}
                <div className={`p-3 rounded-full ${color.replace('text-', 'bg-')} bg-opacity-10`}>
                    {Icon && <Icon className={`w-8 h-8 ${color}`} />}
                </div>
            </div>
        );
    }

    const stats = [
        { name: 'Movimientos Hoy', value: reportes.totalMovimientos ?? 0, icon: Plus, color: 'text-green-600' },
        { name: 'Entradas', value: reportes.totalEntradas ?? 0, icon: Truck, color: 'text-yellow-600' },
        { name: 'Salidas', value: reportes.totalSalidas ?? 0, icon: ArrowDownLeft, color: 'text-red-500' },
        { name: 'Total viajes completos', value: reportes.totalViajesCompletos ?? 0, icon: Check, color: 'text-green-500' },
        { name: 'Rendimiento promedio', value: reportes.rendimiento_promedio_global_kml ?? 0, icon: Activity, color: 'text-blue-500' },
    ];

    return (
        <div className="relative h-[100%] pb-4 px-3 overflow-auto blue-scroll">


            <div className="flex justify-between items-center p-3 border-b mb-4">
                <h2 className="text-3xl font-bold text-gray-800">Gestion de reporteria </h2>
            </div>


            <div className="grid grid-cols-1 gap-6 sm:grid-cols-5 mb-8">
                {stats.map((stat) => (
                    <StatCard key={stat.name} {...stat} />
                ))}
            </div>

            {/* <ReportFilterSection /> */}
            <div className="bg-white rounded-lg p-5 shadow-sm mt-5 ring-1 ring-gray-100">
                <h3 className="text-xl font-bold mb-4 text-gray-800">Filtros</h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    {/* Campo: Fecha inicio */}
                    <div className="space-y-3">
                        <label className="block">
                            <span className="text-sm font-medium text-gray-700">FECHA INICIO: <span className="text-red-500">*</span></span>
                            <input
                                type="date"
                                name="fechaInicio"
                                value={filtros.fechaInicio}
                                onChange={(e) => {
                                    setfiltros({ ...filtros, fechaInicio: e.target.value });
                                }}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                        </label>
                    </div>

                    {/* Campo: Fecha fin */}
                    <div className="space-y-3">
                        <label className="block">
                            <span className="text-sm font-medium text-gray-700">FECHA FIN: <span className="text-red-500">*</span></span>
                            <input
                                type="date"
                                name="fechaFin"
                                value={filtros.fechaFin}
                                onChange={(e) => {
                                    setfiltros({ ...filtros, fechaFin: e.target.value });
                                }}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                        </label>
                    </div>

                    {/* Campo: Unidad (Select) */}
                    <div className="space-y-3">
                        <label className="block">
                            <span className="text-sm font-medium text-gray-700">UNIDAD: <span className="text-red-500">*</span></span>
                            <select
                                name="Unidad"
                                value={filtros.unidad || ''}
                                onChange={(e) => { setfiltros({ ...filtros, unidad: e.target.value }); }}
                                className={`mt-1 block w-full rounded-md border p-2 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500`}
                            >
                                <option value="" disabled>SELECCIONA UNA UNIDAD</option>
                                {units && units.map((dept) => (
                                    <option
                                        key={dept.Unidades_unidadID}
                                        value={dept.Unidades_unidadID}
                                    >
                                        {dept.Unidades_numeroEconomico}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    {/* Campo: Chofer (Select) */}
                    <div className="space-y-3">
                        <label className="block">
                            <span className="text-sm font-medium text-gray-700">CHOFER: <span className="text-red-500">*</span></span>
                            <select
                                name="Chofer"
                                value={filtros.usuarioID || ''}
                                onChange={(e) => { setfiltros({ ...filtros, usuarioID: e.target.value }); }}
                                className={`mt-1 block w-full rounded-md border p-2 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500`}
                            >
                                <option value="" disabled>SELECCIONA UN USUARIO</option>
                                {users && users.map((dept) => (
                                    <option
                                        key={dept.Personas_usuarioID}
                                        value={dept.Personas_usuarioID}
                                    >
                                        {dept.nombre_completo}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                </div>

                <div className="flex gap-3 pt-3 border-t border-gray-100">
                    <button
                        onClick={getReportes}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md hover:bg-gray-50 border border-gray-200 transition disabled:opacity-50"
                    >
                        Buscar
                    </button>
                    <button
                        onClick={() =>
                            setfiltros({
                                usuarioID: null,
                                tipoMovimiento: null,
                                fechaInicio: null,
                                fechaFin: null,
                            })
                        }
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md hover:bg-gray-50 border border-gray-200 transition disabled:opacity-50"
                    >
                        Limpiar
                    </button>
                    <button
                        onClick={handleExportExcel}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 transition disabled:opacity-50"
                        style={{ backgroundColor: '#5bc0de' }} // Color exacto de la imagen
                    >
                        Exportar
                    </button>
                </div>
            </div>


            {/* Contenido de la tabla de Reportes */}
            <div className="p-3 w-full bg-white rounded-lg shadow-md min-h-[300px] mt-4 ring-1 ring-gray-100">
                <Datatable
                    data={reportes.viajes_completos_rendimiento}
                    virtual={true}
                    searcher={false}
                    columns={[
                        { header: 'Fecha Salida', accessor: 'fecha_salida' },
                        { header: 'Fecha Entrada', accessor: 'fecha_entrada' },
                        { header: 'Chofer', accessor: 'nombre_chofer' },
                        { header: 'Destino', accessor: 'destino' },
                        { header: 'Motivo', accessor: 'motivo' },
                        { header: 'Kilometraje recorrido (kms)', accessor: 'km_recorridos' },
                        { header: 'Combustible salida (lts)', accessor: 'combustible_salida' },
                        { header: 'Combustible entrada (lts)', accessor: 'combustible_entrada' },
                        { header: 'Combustible consumido (lts)', accessor: 'combustible_consumido' },
                        { header: 'Rendimiento', accessor: 'rendimiento_kml' },
                    ]}
                />
            </div>
        </div>
    );
}