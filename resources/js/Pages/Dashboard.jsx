import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { Download, FileSpreadsheet, ChevronDown, TrendingUp, TrendingDown } from 'lucide-react';

// --- DATOS DE EJEMPLO ---
const dataBarras = [
  { name: 'Lun', valor: 400 },
  { name: 'Mar', valor: 600 },
  { name: 'Mié', valor: 450 },
  { name: 'Jue', valor: 620 },
  { name: 'Vie', valor: 380 },
  { name: 'Sáb', valor: 320 },
  { name: 'Dom', valor: 250 },
];

const dataDona = [
  { name: 'Hígado', value: 45, color: '#991b1b' }, // Rojo oscuro
  { name: 'Tripa', value: 25, color: '#f97316' },  // Naranja
  { name: 'Pata', value: 20, color: '#3b82f6' },   // Azul
  { name: 'Otros', value: 10, color: '#0f172a' },  // Negro/Oscuro
];

const registros = [
  { id: '#L-241026-A', producto: 'Hígado', origen: 'Recepción (A1)', destino: 'Lavado (A2)', peso: '124.50 kg', hora: '10:45 AM', estado: 'Completado' },
  { id: '#L-241026-B', producto: 'Tripa', origen: 'Lavado (A2)', destino: 'Empaque (A4)', peso: '85.20 kg', hora: '11:15 AM', estado: 'Completado' },
  { id: '#L-241026-C', producto: 'Pata', origen: 'Recepción (A1)', destino: 'Corte (A3)', peso: '210.00 kg', hora: '11:30 AM', estado: 'En Proceso' },
];

// --- COMPONENTE DE TARJETA KPI ---
const StatCard = ({ title, value, subtext, trend, trendColor }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
    <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
    <h3 className="text-3xl font-black text-gray-800 mb-2">{value}</h3>
    <p className={`text-xs font-bold ${trendColor}`}>
      {trend} <span className="text-gray-400 font-normal">{subtext}</span>
    </p>
  </div>
);

export default function DashboardReportes() {
  const [periodo, setPeriodo] = useState('Semana');

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 font-sans">
      
      {/* 1. ENCABEZADO Y FILTROS */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-800">Reportes y Estadísticas</h1>
            <p className="text-gray-500 text-sm">Resumen de operaciones y métricas de rendimiento</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all">
              <Download size={18} /> Exportar PDF
            </button>
            <button className="flex items-center gap-2 bg-red-800 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-900 shadow-lg shadow-red-900/20 transition-all">
              <FileSpreadsheet size={18} /> Exportar Excel
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
            {['Hoy', 'Semana', 'Mes'].map((t) => (
              <button
                key={t}
                onClick={() => setPeriodo(t)}
                className={`px-6 py-1.5 rounded-lg text-sm font-bold transition-all ${
                  periodo === t ? 'bg-gray-100 text-gray-900 shadow-inner' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <select className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-red-500/20">
            <option>Todos los Almacenes</option>
          </select>
          <select className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-red-500/20">
            <option>Todos los Productos</option>
          </select>
        </div>
      </div>

      {/* 2. KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Recibido (A1)" value="12,450 kg" trend="+4.5%" subtext="vs ayer" trendColor="text-green-500" />
        <StatCard title="Total Procesado (A3)" value="8,320 kg" trend="+1.2%" subtext="vs ayer" trendColor="text-green-500" />
        <StatCard title="Merma Promedio" value="3.2%" trend="-0.5%" subtext="(Mejora)" trendColor="text-red-500" />
        <StatCard title="Empacado Final (A4)" value="7,850 kg" trend="98%" subtext="Eficiencia" trendColor="text-green-600" />
      </div>

      {/* 3. GRÁFICAS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Barras */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-black text-gray-800 mb-6">Volumen Procesado por Día (Última Semana)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataBarras}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis hide />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="valor" fill="#991b1b" radius={[6, 6, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dona */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-black text-gray-800 mb-6">Distribución por Producto</h3>
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={dataDona} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {dataDona.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-gray-800">100%</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase">Total</span>
            </div>
          </div>
          {/* Leyenda manual personalizada */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            {dataDona.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
                <span className="text-xs font-bold text-gray-600">{item.name} ({item.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. TABLA */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
          <h3 className="font-black text-gray-800">Registros Recientes</h3>
          <button className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            Ver Todo
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50">
              <tr>
                {['ID Lote', 'Producto', 'Origen', 'Destino', 'Peso Neto', 'Hora', 'Estado'].map((head) => (
                  <th key={head} className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-wider">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {registros.map((reg, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-gray-700">{reg.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{reg.producto}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{reg.origen}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{reg.destino}</td>
                  <td className="px-6 py-4 text-sm font-black text-gray-800">{reg.peso}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{reg.hora}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                      reg.estado === 'Completado' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {reg.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}