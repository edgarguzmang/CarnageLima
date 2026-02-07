
import Datatable from "@/components/Datatable";
import LoadingDiv from "@/components/LoadingDiv";
import request from "@/utils";
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { Truck, UsersRound, Check, SendHorizontal } from 'lucide-react';
import { useEffect, useState, useCallback } from "react";
import { toast } from 'sonner';

const userObject = JSON.parse(localStorage.getItem('user'));


export default function QuienConQuienTransporte() {
    const [states, setStates] = useState({
        loading: true,
        quienConQuien: [],
    });


    const userObject = JSON.parse(localStorage.getItem('user'));

    const fetchData = useCallback(async () => {
        try {
            const [Qconquien] = await Promise.all([
                request(route('AutorizacionQuienconQuienUnidades')),
            ]);

            setStates({
                loading: false,
                quienConQuien: Qconquien,
            });
        } catch (error) {
            toast.error("ERROR AL CARGAR DATOS");
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const submit = async (e) => {
        try {
            const response = await fetch(route('AuthorizacionQuienCQuien'), {
                method: "POST",
                body: JSON.stringify({ id: e }),
                headers: { "Content-Type": "application/json" }
            });

            if (response.ok) {
                setStates({ ...states, open: false });
                toast.success("Se ha autorizado correctamente ");

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


    return (
        <div className="relative h-full pb-4 px-3 overflow-auto blue-scroll bg-gray-50">
            {states.loading ? (
                <div className="flex h-full items-center justify-center"><LoadingDiv /></div>
            ) : (
                <div className="flex flex-col space-y-6 py-4">
                    <div className="flex justify-between items-center border-b pb-4">
                        <h2 className="text-3xl font-black text-gray-800">Autorizacion quien con quien</h2>
                    </div>

                    <div className="quienConQuienTablaTotal">
                        <Datatable
                            data={states.quienConQuien}
                            virtual={true}
                            columns={[
                                {
                                    header: "Estatus",
                                    accessor: "Unidades_estatus",
                                    width: '10%',
                                    cell: ({ item: { Unidades_estatus } }) => {
                                        const color = String(Unidades_estatus) === "1"
                                            ? "bg-green-300" // Si es "1"
                                            : "bg-blue-300";  // Si NO es "1" (incluyendo "2", "0", null, etc.)

                                        return (
                                            <span className={`inline-flex items-center justify-center rounded-full ${color} w-4 h-4`} />
                                        );
                                    },
                                },
                                { header: 'No. Económico', width: '20%', accessor: 'Unidades_numeroEconomico' },
                                { header: 'Modelo Unidad', width: '20%', accessor: 'Unidades_modelo' },

                                { header: 'Destino', width: '20%', accessor: 'Destinos_Nombre' },
                                { header: 'Chofer', width: '20%', accessor: 'nombre_chofer' },


                                {
                                    header: "Acciones",
                                    accessor: "Acciones",
                                    width: '10%',
                                    cell: (eprops) => (
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            width: '100%',
                                            height: '100%'
                                        }}>
                                            <Check
                                                style={{ color: 'green', cursor: 'pointer' }}
                                                onClick={() => submit(eprops.item.CUA_asignacionID)}
                                            />
                                        </div>
                                    ),
                                }
                            ]}
                        />
                    </div>


                </div>
            )}
        </div>
    );
}