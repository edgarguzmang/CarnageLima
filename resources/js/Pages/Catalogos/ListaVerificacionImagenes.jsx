import { useState, useEffect } from "react";
import { toast } from 'sonner';
// Asumiendo que estas rutas y archivos existen:
import imgatras from '../Catalogos/img/atras.png';
import imglado from '../Catalogos/img/lateral.png';
import imgfrente from '../Catalogos/img/frente.png';
import imglateralizq from '../Catalogos/img/lateralizq.png';

const INCIDENCIA_PUNTOS = [
    { id: 1006, name: "Faros Delantero izq", view: "frente", x: 32, y: 55 },
    { id: 1007, name: "Faros Delantero der", view: "frente", x: 68, y: 55 },
    { id: 1008, name: "Parabrisas", view: "frente", x: 50, y: 25 },
    { id: 1010, name: "Defensa Frontal", view: "frente", x: 50, y: 70 },
    { id: 1011, name: "Retrovisor Izquierdo", view: "frente", x: 30, y: 35 },
    { id: 1012, name: "Retrovisor Derecho", view: "frente", x: 70, y: 35 },

    { id: 1013, name: "Espejo Lateral", view: "lado", x: 42, y: 35 },
    { id: 1014, name: "Puerta Conductor", view: "lado", x: 42, y: 53 },
    { id: 1016, name: "Llanta Trasera", view: "lado", x: 67, y: 65 },
    { id: 1017, name: "Llanta Delantera", view: "lado", x: 28, y: 60 },
    { id: 1018, name: "Tanque Gasolina", view: "lado", x: 60, y: 50 },

    { id: 1020, name: "Espejo Lateral", view: "lateralizq", x: 57, y: 35 },
    { id: 1021, name: "Puerta Conductor", view: "lateralizq", x: 58, y: 60 },
    { id: 1022, name: "Llanta Delantera", view: "lateralizq", x: 73, y: 62 },
    { id: 1023, name: "Llanta Trasera", view: "lateralizq", x: 33, y: 62 },

    { id: 1024, name: "Calavera Trasera izq", view: "atras", x: 30, y: 45 },
    { id: 1025, name: "Calavera Trasera der", view: "atras", x: 70, y: 45 },
    { id: 1026, name: "Tapa Batea", view: "atras", x: 49, y: 42 },
    { id: 1027, name: "Cristal Trasero", view: "atras", x: 48, y: 25 },
    { id: 1028, name: "Placa", view: "atras", x: 48, y: 65 },
];

const IMAGE_WIDTH = '100%'; 
const CARD_HEIGHT = '250px'; 

export default function ListaVerificacionImagenes({ 
    onIncidenciasChange, 
    onClose, // Mantengo onClose aunque su uso dependerá del componente padre
    initialIncidencias = [] 
}) {
    // Inicialización del estado con las incidencias recibidas
    const [incidenciasMarcadas, setIncidenciasMarcadas] = useState(initialIncidencias);

    const imagesMap = {
        frente: imgfrente,
        atras: imgatras,
        lado: imglado,
        lateralizq: imglateralizq,
    };

    // Efecto para notificar al padre sobre cualquier cambio en las incidencias
    useEffect(() => {
        // Enviar al padre solo los IDs y nombres de las incidencias marcadas
        onIncidenciasChange(incidenciasMarcadas);
    }, [incidenciasMarcadas, onIncidenciasChange]);

    // const handleCheckboxChange = (incidenciaId, incidenciaName, isChecked) => {
    //     setIncidenciasMarcadas(prev => {
    //         let newIncidencias;
    //         if (isChecked) {
    //             // Previene duplicados al marcar
    //             if (!prev.some(item => item.id === incidenciaId)) {
    //                 newIncidencias = [
    //                     ...prev,
    //                     { id: incidenciaId, name: incidenciaName }
    //                 ];
    //                 toast.info(`Incidencia marcada: ${incidenciaName} `);
    //             } else {
    //                 newIncidencias = prev;
    //             }
    //         } else {
    //             // Quitar la incidencia al desmarcar
    //             newIncidencias = prev.filter(item => item.id !== incidenciaId);
    //             toast.warning(`Incidencia desmarcada: ${incidenciaName}`);
    //         }
    //         return newIncidencias;
    //     });
    // };
  const handleCheckboxChange = (incidenciaId, incidenciaName, isChecked) => {
        setIncidenciasMarcadas(prev => {
            let newIncidencias;
            if (isChecked) {
                // Se busca el objeto completo del punto para incluir 'hijo'
                const puntoCompleto = INCIDENCIA_PUNTOS.find(p => p.id === incidenciaId);
                
                if (puntoCompleto && !prev.some(item => item.id === incidenciaId)) {
                    newIncidencias = [
                        ...prev,
                        // Incluimos name, id y la propiedad 'hijo' en el objeto enviado
                        { id: incidenciaId, name: incidenciaName, hijo: "true",observacion:"No" } 
                    ];
                    toast.info(`Incidencia marcada: ${incidenciaName}`);
                } else {
                    newIncidencias = prev;
                }
            } else {
                newIncidencias = prev.filter(item => item.id !== incidenciaId);
                toast.warning(`Incidencia desmarcada: ${incidenciaName}`);
            }
            return newIncidencias;
        });
    };
    // Función auxiliar para determinar si un checkbox debe estar marcado
    // Usa un Set para búsquedas más rápidas si la lista es grande
    const checkedIds = new Set(incidenciasMarcadas.map(item => item.id));
    const isIncidenciaChecked = (id) => checkedIds.has(id);


    return (
        <div className="relative h-[100%] pb-4 px-3 overflow-auto blue-scroll" style={{  padding: '15px' }}>
            
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)', // Dos columnas de igual ancho
                gap: '20px',
                paddingBottom: '10px',
            }} className="image-grid-container">

                {Object.keys(imagesMap).map((viewKey) => {
                    const src = imagesMap[viewKey];
                    const puntosDeVista = INCIDENCIA_PUNTOS.filter(p => p.view === viewKey);

                    return (
                        <div
                            key={viewKey}
                            style={{
                                position: 'relative',
                                width: IMAGE_WIDTH, // 100% de la columna del grid
                                height: CARD_HEIGHT,
                                borderRadius: '8px',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                                overflow: 'hidden',
                                backgroundColor: '#f9f9f9',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid #ddd'
                            }}
                        >
                            {/* Imagen de Fondo */}
                            <img
                                src={src}
                                alt={`Vista ${viewKey}`}
                                style={{
                                    // La imagen debe llenar el espacio sin desbordarse
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    height: 'auto',
                                    width: 'auto',
                                    objectFit: 'contain',
                                    objectPosition: 'center',
                                    display: 'block',
                                }}
                            />
                            <div style={{ position: 'absolute', top: '5px', left: '10px', fontWeight: 'bold', textTransform: 'uppercase', color: '#333', background: 'rgba(255,255,255,0.7)', padding: '2px 5px', borderRadius: '3px' }}>
                                {viewKey}
                            </div>

                            {/* Puntos de Incidencia (Checkboxes) */}
                            {puntosDeVista.map((punto) => (
                                <div
                                    key={punto.id}
                                    title={`${punto.name} (ID: ${punto.id})`}
                                    style={{
                                        position: 'absolute',
                                        left: `${punto.x}%`,
                                        top: `${punto.y}%`,
                                        transform: 'translate(-50%, -50%)',
                                        cursor: 'pointer',
                                        zIndex: 10,
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        id={`incidencia-${punto.id}`}
                                        checked={isIncidenciaChecked(punto.id)}
                                        onChange={(e) =>
                                            handleCheckboxChange(punto.id, punto.name, e.target.checked)
                                        }
                                        style={{ width: '30px', height: '30px', accentColor: '#007bff' }}
                                    />
                                </div>
                            ))}
                        </div>
                    );
                })}

            </div>

        </div>
    );
}







//     return (
//         <div className="relative h-[100%] pb-4 px-3 overflow-auto blue-scroll" style={{ padding: '15px' }}>
            
//             <div style={{
//                 display: 'grid',
//                 gridTemplateColumns: 'repeat(2, 1fr)', // Dos columnas de igual ancho
//                 gap: '20px',
//                 paddingBottom: '10px',
//             }} className="image-grid-container">

//                 {Object.keys(imagesMap).map((viewKey) => {
//                     const src = imagesMap[viewKey];
//                     // Filtramos los puntos relevantes para la vista actual
//                     const puntosDeVista = INCIDENCIA_PUNTOS.filter(p => p.view === viewKey);

//                     return (
//                         <div
//                             key={viewKey}
//                             style={{
//                                 position: 'relative',
//                                 width: IMAGE_WIDTH, // 100% de la columna del grid
//                                 height: CARD_HEIGHT,
//                                 borderRadius: '8px',
//                                 boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
//                                 overflow: 'hidden',
//                                 backgroundColor: '#f9f9f9',
//                                 display: 'flex',
//                                 alignItems: 'center',
//                                 justifyContent: 'center',
//                                 border: '1px solid #ddd'
//                             }}
//                         >
//                             {/* Imagen de Fondo */}
//                             <img
//                                 src={src}
//                                 alt={`Vista ${viewKey}`}
//                                 style={{
//                                     maxWidth: '100%',
//                                     maxHeight: '100%',
//                                     height: 'auto',
//                                     width: 'auto',
//                                     objectFit: 'contain',
//                                     objectPosition: 'center',
//                                     display: 'block',
//                                 }}
//                             />
//                             <div style={{ position: 'absolute', top: '5px', left: '10px', fontWeight: 'bold', textTransform: 'uppercase', color: '#333', background: 'rgba(255,255,255,0.7)', padding: '2px 5px', borderRadius: '3px' }}>
//                                 {viewKey}
//                             </div>

//                             {/* Puntos de Incidencia (Checkboxes) */}
//                             {puntosDeVista.map((punto) => (
//                                 <div
//                                     key={punto.id}
//                                     title={`${punto.name} (ID: ${punto.id})`}
//                                     style={{
//                                         position: 'absolute',
//                                         left: `${punto.x}%`,
//                                         top: `${punto.y}%`,
//                                         transform: 'translate(-50%, -50%)',
//                                         cursor: 'pointer',
//                                         zIndex: 10,
//                                     }}
//                                 >
//                                     <input
//                                         type="checkbox"
//                                         id={`incidencia-${punto.id}`}
//                                         checked={isIncidenciaChecked(punto.id)}
//                                         onChange={(e) =>
//                                             handleCheckboxChange(punto.id, punto.name, e.target.checked)
//                                         }
//                                         style={{ 
//                                             width: '20px', // Reduje un poco el tamaño para un mejor look en general
//                                             height: '20px', 
//                                             accentColor: '#dc3545', // Un color más notable para un "daño"
//                                             border: '2px solid white', 
//                                             borderRadius: '3px'
//                                         }}
//                                     />
//                                 </div>
//                             ))}
//                         </div>
//                     );
//                 })}

//             </div>

//         </div>
//     );
// }