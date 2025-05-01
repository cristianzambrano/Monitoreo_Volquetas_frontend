import React, { useState, useEffect } from "react";
import { API_URL } from '../config';

export default function RutasActivasModal({ onClose, rutas, setRutas }) {
  //const [rutas, setRutas] = useState([]);
  const [filter, setFilter] = useState('');
  const [sortKey, setSortKey] = useState('estado');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta ruta activa?')) {
      return;
    }
    try {
      const res = await fetch(`${API_URL}/rutas-activas/${id}`, {
        method: 'DELETE'
      });
      const result = await res.json();
      if (result.success) {
        alert('✅ Ruta eliminada correctamente');
        fetchRutas(); // Refrescar la tabla
      } else {
        alert('❌ Error: ' + result.message);
      }
    } catch (error) {
      console.error('Error al eliminar ruta:', error);
      alert('❌ Error de conexión al eliminar ruta');
    }
  };

  const fetchRutas = async () => {
    try {
      const res = await fetch(`${API_URL}/rutas-activas`);
      const data = await res.json();
      setRutas(data);
    } catch (error) {
      console.error('Error al cargar rutas activas:', error);
    }
  };

  

  useEffect(() => {
    fetchRutas();
  }, []);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const handleIniciarRuta = async (id) => {
    if (!window.confirm('¿Iniciar esta ruta ahora?')) return;
  
    try {
      const now = new Date();
      const fechaInicio = now.toISOString().slice(0, 19).replace('T', ' '); 
  
      const res = await fetch(`${API_URL}/rutas-activas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fecha_inicio: fechaInicio,
          estado: 'en progreso'
        })
      });
  
      const result = await res.json();
      if (result.success) {
        alert('✅ Ruta iniciada correctamente');
        fetchRutas(); 
      } else {
        alert('❌ Error: ' + result.message);
      }
    } catch (error) {
      console.error('Error al iniciar ruta:', error);
      alert('❌ Error al iniciar ruta');
    }
  };
  
  const handleFinalizarRuta = async (id) => {
    if (!window.confirm('¿Finalizar esta ruta ahora?')) return;
  
    try {
      const now = new Date();
      const fechaFin = now.toISOString().slice(0, 19).replace('T', ' '); // Formato MySQL
  
      const res = await fetch(`${API_URL}/rutas-activas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fecha_fin: fechaFin,
          estado: 'terminada'
        })
      });
  
      const result = await res.json();
      if (result.success) {
        alert('✅ Ruta finalizada correctamente');
        fetchRutas(); // Refrescar listado
      } else {
        alert('❌ Error: ' + result.message);
      }
    } catch (error) {
      console.error('Error al finalizar ruta:', error);
      alert('❌ Error al finalizar ruta');
    }
  };
  

  const filteredRutas = rutas
  .filter(r =>
    (r.ruta_nombre || '').toLowerCase().includes(filter.toLowerCase()) ||
    (r.volqueta_placa || '').toLowerCase().includes(filter.toLowerCase()) ||
    (r.chofer_nombre || '').toLowerCase().includes(filter.toLowerCase())
  )
  .sort((a, b) => {
    if (a[sortKey] < b[sortKey]) return sortOrder === 'asc' ? -1 : 1;
    if (a[sortKey] > b[sortKey]) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(filteredRutas.length / itemsPerPage);
  const paginatedRutas = filteredRutas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getEstadoIcon = (estado) => {
    if (estado === 'activo') return <span className="text-green-500 text-xl">🟢</span>;
    if (estado === 'en progreso') return <span className="text-yellow-500 text-xl">🟡</span>;
    if (estado === 'terminada') return <span className="text-red-500 text-xl">🔴</span>;
    return estado;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded w-full max-w-7xl relative">
        <button className="absolute top-2 right-2 text-gray-500" onClick={onClose}>✖️</button>
        <h2 className="text-2xl font-bold mb-4">🛣️ Listado de Rutas Activas</h2>

        <div className="flex justify-between mb-4">
          <input
            type="text"
            placeholder="Buscar por nombre, placa o chofer..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border p-2 rounded w-1/2"
          />
        </div>

        <table className="w-full table-auto border-collapse">
        <thead>
            <tr>
                <th className="border p-2 cursor-pointer" onClick={() => handleSort('estado')}>
                Estado {sortKey === 'estado' && (sortOrder === 'asc' ? '⬆️' : '⬇️')}
                </th>
                <th className="border p-2 cursor-pointer" onClick={() => handleSort('fecha_asignacion')}>
                Fecha Registro {sortKey === 'fecha_asignacion' && (sortOrder === 'asc' ? '⬆️' : '⬇️')}
                </th>
                <th className="border p-2 cursor-pointer" onClick={() => handleSort('ruta_nombre')}>
                Nombre {sortKey === 'ruta_nombre' && (sortOrder === 'asc' ? '⬆️' : '⬇️')}
                </th>
                <th className="border p-2 cursor-pointer" onClick={() => handleSort('volqueta_placa')}>
                Placa Volqueta {sortKey === 'volqueta_placa' && (sortOrder === 'asc' ? '⬆️' : '⬇️')}
                </th>
                <th className="border p-2 cursor-pointer" onClick={() => handleSort('chofer_nombre')}>
                Chofer {sortKey === 'chofer_nombre' && (sortOrder === 'asc' ? '⬆️' : '⬇️')}
                </th>
                <th className="border p-2 cursor-pointer" onClick={() => handleSort('fecha_inicio')}>
                Fecha Inicio {sortKey === 'fecha_inicio' && (sortOrder === 'asc' ? '⬆️' : '⬇️')}
                </th>
                <th className="border p-2 cursor-pointer" onClick={() => handleSort('fecha_fin')}>
                Fecha Fin {sortKey === 'fecha_fin' && (sortOrder === 'asc' ? '⬆️' : '⬇️')}
                </th>
                <th className="border p-2">
                Acciones
                </th>
            </tr>
            </thead>
          <tbody>
            {paginatedRutas.map((ruta) => (
              <tr key={ruta.id}>
                <td className="border p-2 text-center">{getEstadoIcon(ruta.estado)}</td>
                <td className="border p-2">{new Date(ruta.fecha_asignacion).toLocaleString()}</td>
                <td className="border p-2">{ruta.ruta_nombre || '-'}</td>
                <td className="border p-2">{ruta.volqueta_placa || '-'}</td>
                <td className="border p-2">{ruta.chofer_nombre || '-'}</td>
                <td className="border p-2">{ruta.fecha_inicio ? new Date(ruta.fecha_inicio).toLocaleString() : '-'}</td>
                <td className="border p-2">{ruta.fecha_fin ? new Date(ruta.fecha_fin).toLocaleString() : '-'}</td>
                <td className="border p-2 space-x-2 text-center">
                {ruta.fecha_fin ? (
                  <button
                    className="bg-gray-400 text-white px-2 py-1 rounded text-sm cursor-not-allowed"
                    disabled
                  >
                    Terminado
                  </button>
                ) : ruta.fecha_inicio ? (
                  <button
                    onClick={() => handleFinalizarRuta(ruta.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm"
                  >
                    Finalizar
                  </button>
                ) : (
                  <button
                    onClick={() => handleIniciarRuta(ruta.id)}
                    className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-sm"
                  >
                    Iniciar
                  </button>
                )}
                <button className="bg-yellow-400 hover:bg-yellow-500 text-white px-2 py-1 rounded text-sm">
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(ruta.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm"
                  title="Eliminar"
                >
                  🗑️
                </button>
              </td>

              </tr>
            ))}
          </tbody>
        </table>

        {/* Paginación */}
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            ◀️ Anterior
          </button>
          <span className="text-gray-700 font-semibold">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            Siguiente ▶️
          </button>
        </div>
      </div>
    </div>
  );
}
