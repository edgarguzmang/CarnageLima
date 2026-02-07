import React, { useState } from 'react';

const WeighingDashboard = () => {
    const products = [
        { "id": 1, "nombre": "Hígado", "stock": 0, "unidad": "kg", "imagen": "https://images.unsplash.com/photo-1606850246029-dd00bd5ec9e9?q=80&w=400" },
        { "id": 2, "nombre": "Tripa", "stock": 45, "unidad": "kg", "imagen": "https://images.unsplash.com/photo-1593450553664-89336214041b?q=80&w=400" },
        { "id": 3, "nombre": "Pata", "stock": 120, "unidad": "kg", "imagen": "https://images.unsplash.com/photo-1628268909376-e8c44bb3153f?q=80&w=400" },
        { "id": 4, "nombre": "Lengua", "stock": 12, "unidad": "kg", "imagen": "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?q=80&w=400" },
        { "id": 5, "nombre": "Cabeza", "stock": 5, "unidad": "un.", "imagen": "https://www.transparentpng.com/download/meat/premium-fresh-meat-png-transparent-5.png" },
        { "id": 6, "nombre": "Corazón", "stock": 28, "unidad": "kg", "imagen": "https://images.unsplash.com/photo-1615937657715-bc7b4b7962c1?q=80&w=400" },
        { "id": 7, "nombre": "Riñón", "stock": 15, "unidad": "kg", "imagen": "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?q=80&w=400" },
        { "id": 8, "nombre": "Otro", "es_manual": true }
    ];

    const [selectedProduct, setSelectedProduct] = useState(products[0]);

    return (
        // Cambiamos h-screen por min-h-screen y flex-col en móviles
        <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 font-sans text-gray-800">
            
            {/* SECCIÓN: SELECCIÓN (Arriba en móvil, Izquierda en Desktop) */}
            <main className="flex-1 p-4 md:p-8 order-2 lg:order-1">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <h1 className="text-xl md:text-2xl font-bold italic text-slate-900">Almacén 1: Recepción</h1>
                    <div className="relative w-full sm:w-64">
                        <input
                            type="text"
                            placeholder="Buscar producto..."
                            className="w-full border border-gray-300 rounded-md px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </header>

                <section>
                    <h2 className="text-lg font-semibold mb-6">Seleccionar Producto</h2>
                    
                    {/* Grid responsivo: 1 col móvil, 2 tablet, 3-4 desktop */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                        {products.map((product) => (
                            product.es_manual ? (
                                <button key="manual" className="bg-slate-900 text-white rounded-lg flex flex-col items-center justify-center min-h-[140px] md:min-h-[180px] hover:bg-slate-800 transition-colors">
                                    <span className="font-bold text-lg">Otro</span>
                                    <span className="text-xs opacity-70 italic">Manual</span>
                                </button>
                            ) : (
                                <button
                                    key={product.id}
                                    onClick={() => setSelectedProduct(product)}
                                    className={`bg-white rounded-lg overflow-hidden border-2 transition-all shadow-sm
                                        ${selectedProduct?.id === product.id ? 'border-red-600 ring-1 ring-red-600' : 'border-transparent hover:border-gray-300'}`}
                                >
                                    <div className="h-24 md:h-32 bg-gray-200 overflow-hidden">
                                        <img src={product.imagen} alt={product.nombre} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="p-2 md:p-3 text-center">
                                        <p className="font-bold text-sm md:text-lg truncate">{product.nombre}</p>
                                        <p className="text-gray-500 text-xs md:text-sm">Stock: {product.stock} {product.unidad}</p>
                                    </div>
                                </button>
                            )
                        ))}
                    </div>
                </section>
            </main>

            {/* SECCIÓN: PANEL DE CONTROL (Abajo en móvil, Derecha en Desktop) */}
            <aside className="w-full lg:w-[400px] bg-white border-b lg:border-l border-gray-200 flex flex-col order-1 lg:order-2 sticky top-0 z-10 lg:h-screen lg:overflow-y-auto">
                {/* Cabecera del Panel con Display de Peso */}
                <div className="bg-slate-950 p-4 md:p-6">
                    <div className="flex bg-slate-900 rounded-md p-1 mb-4 md:mb-6">
                        <button className="flex-1 py-1.5 md:py-2 text-xs md:text-sm font-medium bg-white text-slate-900 rounded shadow">Entrada</button>
                        <button className="flex-1 py-1.5 md:py-2 text-xs md:text-sm font-medium text-slate-400">Salida</button>
                    </div>

                    <div className="bg-black rounded-xl p-4 md:p-6 flex justify-between items-center border border-slate-700">
                        <span className="text-4xl md:text-5xl font-mono text-green-500 tracking-tighter">45.20</span>
                        <span className="text-green-800 font-bold text-lg md:text-xl">kg</span>
                    </div>
                </div>

                {/* Formulario */}
                <div className="p-4 md:p-6 space-y-4 md:space-y-6 bg-white">
                    <div>
                        <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Producto Seleccionado</label>
                        <p className="text-lg md:text-xl font-bold text-slate-700">{selectedProduct?.nombre} de Res</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                        <div>
                            <label className="text-[10px] font-semibold text-gray-400 uppercase">Proveedor</label>
                            <input type="text" className="w-full mt-1 bg-gray-50 border border-gray-200 rounded p-2 md:p-3 text-sm" defaultValue="Carnes del Norte S.A." />
                        </div>
                        <div>
                            <label className="text-[10px] font-semibold text-gray-400 uppercase">Lote / Referencia</label>
                            <input type="text" className="w-full mt-1 bg-gray-50 border border-gray-200 rounded p-2 md:p-3 font-mono text-sm" defaultValue="LT-2023-889" />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button className="flex-1 bg-slate-100 text-slate-600 font-bold py-3 md:py-4 rounded-lg text-sm md:text-base">Cancelar</button>
                        <button className="flex-1 bg-red-700 text-white font-bold py-3 md:py-4 rounded-lg hover:bg-red-800 transition-colors text-sm md:text-base">Registrar</button>
                    </div>
                    
                    {/* Historial colapsable o simplificado en móvil si deseas */}
                    <div className="pt-4 border-t border-gray-100">
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase mb-3">Últimos Registros</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-xs md:text-sm">
                                <span>Tripa - 10:45 AM</span>
                                <span className="font-bold">+24.5 kg</span>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    );
};

export default WeighingDashboard;