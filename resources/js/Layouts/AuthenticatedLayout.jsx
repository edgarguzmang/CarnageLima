// Archivo: resources/js/Layouts/AuthenticatedLayout.jsx (MODIFICADO)

import React, { useState } from 'react';
import LeftMenu from '@/Components/LeftMenu';
import Header from '@/Components/Header';

// Asumo que 'user' viene de la prop 'auth' que Inertia pasa al componente padre.
export default function Authenticated({ user, children }) { 
    
    // **NOTA CLAVE:** Aquí es donde se define la estructura visual del layout.

    if (!user) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                {/* Puedes poner un spinner o un mensaje de carga/error aquí si es necesario */}
                <p>Cargando usuario...</p> 
            </div>
        );
    }

    // Estructura de layout Flexbox de dos columnas (LeftMenu | Content)
    return (
        <div id="page-container" className="flex h-screen w-screen overflow-hidden">
            
            {/** 1. Menú Lateral Fijo (Columna 1) **/}
            <div className="w-64 flex-shrink-0 h-full bg-gray-800">
                {/* NOTA: Pasamos el objeto de usuario al LeftMenu */}
                <LeftMenu auth={user} /> 
            </div>
                
            {/** 2. Contenido Principal (Columna 2) - Ocupa el espacio restante **/}
            <div className="flex flex-col flex-grow min-w-0 h-full bg-gray-100"> 
                
                {/** A. Header Fijo **/}
                <Header />
                
                {/** B. Área Desplazable del Contenido de la Página Específica **/}
                <div className="flex-grow overflow-y-auto p-4 styled-scroll">
                    {/* El 'children' es el contenido de la página (e.g., Unidades, Dashboard, Usuarios) */}
                    {children} 
                </div>
            </div>
        </div>
    );
}