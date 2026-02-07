import React from 'react';
import logo from '../../../public/img/logo.png'; 
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="w-full bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        
        {/* Left Side: Title */}
        <div className="flex items-center">
          <h1 className="text-lg font-bold text-slate-800">
            Catálogo de Usuarios
          </h1>
        </div>

        {/* Right Side: User Info & Logo/Avatar */}
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-slate-600">
            Admin Planta
          </span>
          <div className="h-10 w-10 rounded-full overflow-hidden border border-gray-300">
            <img
              src={logo} // Replace with actual user avatar if different from logo
              alt="User profile"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

      </div>
    </header>
  );
}