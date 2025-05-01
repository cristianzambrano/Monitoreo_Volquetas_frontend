import React, { useState, useEffect } from "react";
import { API_URL } from '../config';

export default function VolquetasModal({ onClose }) {
  const [volquetas, setVolquetas] = useState([]);
  const [filter, setFilter] = useState('');
  const [sortKey, setSortKey] = useState('estado');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ placa: '', dispositivo_id: '', estado: '', id: null });
  const itemsPerPage = 10;
  const [messageModal, setMessageModal] = useState({ show: false, success: false, message: '' });

  const fetchVolquetas = async () => {
    const res = await fetch(`${API_URL}/volquetas`);
    const data = await res.json();
    setVolquetas(data);
  };

  useEffect(() => {
    fetchVolquetas();
  }, []);

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/volquetas/${id}`, { method: 'DELETE' });
      const result = await res.json();
      setMessageModal({ show: true, success: result.success, message: result.message });
      if (result.success) {
        fetchVolquetas();
      }
    } catch (error) {
      setMessageModal({ show: true, success: false, message: 'Error de conexión con el servidor' });
    }
  };
  

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        formData.id ? `${API_URL}/volquetas/${formData.id}` : `${API_URL}/volquetas`,
        {
          method: formData.id ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            placa: formData.placa,
            dispositivo_id: formData.dispositivo_id,
            estado: formData.estado,
          }),
        }
      );
      const result = await res.json();
      setMessageModal({ show: true, success: result.success, message: result.message });
      if (result.success) {
        setShowForm(false);
        setFormData({ placa: '', dispositivo_id: '', estado: '', id: null });
        fetchVolquetas();
      }
    } catch (error) {
      setMessageModal({ show: true, success: false, message: 'Error de conexión con el servidor' });
    }
  };
  

  const filteredVolquetas = volquetas
    .filter(v =>
      v.placa.toLowerCase().includes(filter.toLowerCase()) ||
      v.dispositivo_id.toLowerCase().includes(filter.toLowerCase())
    )
    .sort((a, b) => {
      if (a[sortKey] < b[sortKey]) return sortOrder === 'asc' ? -1 : 1;
      if (a[sortKey] > b[sortKey]) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const totalPages = Math.ceil(filteredVolquetas.length / itemsPerPage);
  const paginatedVolquetas = filteredVolquetas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded w-full max-w-6xl relative">
        <button className="absolute top-2 right-2 text-gray-500" onClick={onClose}>✖️</button>
        <h2 className="text-2xl font-bold mb-4">🚛 Listado de Volquetas</h2>

        <div className="flex justify-between mb-4">
          <input
            type="text"
            placeholder="Buscar por placa o dispositivo..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border p-2 rounded w-1/2"
          />
          <button
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            onClick={() => setShowForm(true)}
          >
            + Añadir Volqueta
          </button>
        </div>

        <table className="w-full table-auto border-collapse">
          <thead>
            <tr>
              <th className="border p-2 cursor-pointer" onClick={() => handleSort('estado')}>
                Estado {sortKey === 'estado' && (sortOrder === 'asc' ? '⬆️' : '⬇️')}
              </th>
              <th className="border p-2 cursor-pointer" onClick={() => handleSort('placa')}>
                Placa {sortKey === 'placa' && (sortOrder === 'asc' ? '⬆️' : '⬇️')}
              </th>
              <th className="border p-2 cursor-pointer" onClick={() => handleSort('dispositivo_id')}>
                Dispositivo GPS {sortKey === 'dispositivo_id' && (sortOrder === 'asc' ? '⬆️' : '⬇️')}
              </th>
              <th className="border p-2 cursor-pointer" onClick={() => handleSort('created_at')}>
                Creación {sortKey === 'created_at' && (sortOrder === 'asc' ? '⬆️' : '⬇️')}
              </th>
              <th className="border p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedVolquetas.map((volqueta) => (
              <tr key={volqueta.id}>
                <td className="border p-2 text-center">
                  {volqueta.estado === 'activo' ? (
                    <span className="text-green-500 text-xl">🟢</span>
                  ) : (
                    <span className="text-red-500 text-xl">🔴</span>
                  )}
                </td>
                <td className="border p-2">{volqueta.placa}</td>
                <td className="border p-2">{volqueta.dispositivo_id}</td>
                <td className="border p-2">{new Date(volqueta.created_at).toLocaleString()}</td>
                <td className="border p-2 space-x-2 text-center">
                  <button
                    className="text-yellow-500 hover:text-yellow-600 text-2xl"
                    title="Editar"
                    onClick={() => {
                      setFormData(volqueta);
                      setShowForm(true);
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(volqueta.id)}
                    className="text-red-500 hover:text-red-600 text-2xl"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

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

        {showForm && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow-md w-96">
              <h3 className="text-xl font-bold mb-4">
                {formData.id ? 'Editar Volqueta' : 'Agregar Nueva Volqueta'}
              </h3>
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder="Placa"
                  value={formData.placa}
                  onChange={(e) => setFormData({ ...formData, placa: e.target.value })}
                  required
                  className="border p-2 mb-4 w-full rounded"
                />
                <input
                  type="text"
                  placeholder="Dispositivo GPS"
                  value={formData.dispositivo_id}
                  onChange={(e) => setFormData({ ...formData, dispositivo_id: e.target.value })}
                  required
                  className="border p-2 mb-4 w-full rounded"
                />
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  required
                  className="border p-2 mb-4 w-full rounded"
                >
                  <option value="">Seleccione Estado</option>
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setFormData({ placa: '', dispositivo_id: '', estado: '', id: null });
                    }}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
                  >
                    {formData.id ? 'Actualizar' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}


        {messageModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className={`p-6 rounded shadow-md ${messageModal.success ? 'bg-green-100' : 'bg-red-100'} w-80`}>
            <h2 className="text-lg font-bold mb-2">
                {messageModal.success ? '✔️ Éxito' : '❌ Error'}
            </h2>
            <p className="mb-4">{messageModal.message}</p>
            <button
                onClick={() => setMessageModal({ show: false, success: false, message: '' })}
                className={`px-4 py-2 rounded ${messageModal.success ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} text-white`}
            >
                Cerrar
            </button>
            </div>
        </div>
        )}

      </div>
    </div>
  );
}
