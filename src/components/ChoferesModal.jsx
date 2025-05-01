import React, { useState, useEffect } from "react";
import { API_URL } from '../config';

export default function ChoferesModal({ onClose }) {
  const [choferes, setChoferes] = useState([]);
  const [filter, setFilter] = useState('');
  const [sortKey, setSortKey] = useState('nombre');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', cedula: '', telefono: '', id: null });
  const [messageModal, setMessageModal] = useState({ show: false, success: false, message: '' });

  const itemsPerPage = 10;

  const fetchChoferes = async () => {
    try {
      const res = await fetch(`${API_URL}/choferes`);
      const data = await res.json();
      setChoferes(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchChoferes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        formData.id ? `${API_URL}/choferes/${formData.id}` : `${API_URL}/choferes`,
        {
          method: formData.id ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: formData.nombre,
            cedula: formData.cedula,
            telefono: formData.telefono,
          }),
        }
      );
      const result = await res.json();
      setMessageModal({ show: true, success: result.success, message: result.message });
      if (result.success) {
        setShowForm(false);
        setFormData({ nombre: '', cedula: '', telefono: '', id: null });
        fetchChoferes();
      }
    } catch (error) {
      setMessageModal({ show: true, success: false, message: 'Error de conexión' });
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/choferes/${id}`, { method: 'DELETE' });
      const result = await res.json();
      setMessageModal({ show: true, success: result.success, message: result.message });
      if (result.success) {
        fetchChoferes();
      }
    } catch (error) {
      setMessageModal({ show: true, success: false, message: 'Error de conexión' });
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

  const filteredChoferes = choferes
    .filter(c =>
      c.nombre.toLowerCase().includes(filter.toLowerCase()) ||
      c.cedula.includes(filter)
    )
    .sort((a, b) => {
      if (a[sortKey] < b[sortKey]) return sortOrder === 'asc' ? -1 : 1;
      if (a[sortKey] > b[sortKey]) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const totalPages = Math.ceil(filteredChoferes.length / itemsPerPage);
  const paginatedChoferes = filteredChoferes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded w-full max-w-5xl relative">
        <button className="absolute top-2 right-2 text-gray-500" onClick={onClose}>✖️</button>
        <h2 className="text-2xl font-bold mb-4">👨‍✈️ - Listado de Choferes</h2>

        <div className="flex justify-between mb-4">
          <input
            type="text"
            placeholder="Buscar por nombre o cédula..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border p-2 rounded w-1/2"
          />
          <button
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            onClick={() => setShowForm(true)}
          >
            + Añadir Chofer
          </button>
        </div>

        <table className="w-full table-auto border-collapse">
          <thead>
            <tr>
              <th className="border p-2 cursor-pointer" onClick={() => handleSort('nombre')}>
                Nombre {sortKey === 'nombre' && (sortOrder === 'asc' ? '⬆️' : '⬇️')}
              </th>
              <th className="border p-2 cursor-pointer" onClick={() => handleSort('cedula')}>
                Cédula {sortKey === 'cedula' && (sortOrder === 'asc' ? '⬆️' : '⬇️')}
              </th>
              <th className="border p-2 cursor-pointer" onClick={() => handleSort('telefono')}>
                Teléfono {sortKey === 'telefono' && (sortOrder === 'asc' ? '⬆️' : '⬇️')}
              </th>
              <th className="border p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedChoferes.map((chofer) => (
              <tr key={chofer.id}>
                <td className="border p-2">{chofer.nombre}</td>
                <td className="border p-2">{chofer.cedula}</td>
                <td className="border p-2">{chofer.telefono}</td>
                <td className="border p-2 space-x-2 text-center">
                  <button
                    className="text-yellow-500 hover:text-yellow-600 text-2xl"
                    title="Editar"
                    onClick={() => {
                      setFormData(chofer);
                      setShowForm(true);
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(chofer.id)}
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

        {/* Modal formulario agregar/editar chofer */}
        {showForm && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow-md w-96">
              <h3 className="text-xl font-bold mb-4">{formData.id ? 'Editar Chofer' : 'Agregar Chofer'}</h3>
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder="Nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                  className="border p-2 mb-4 w-full rounded"
                />
                <input
                  type="text"
                  placeholder="Cédula"
                  value={formData.cedula}
                  onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                  required
                  className="border p-2 mb-4 w-full rounded"
                />
                <input
                  type="text"
                  placeholder="Teléfono"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  required
                  className="border p-2 mb-4 w-full rounded"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setFormData({ nombre: '', cedula: '', telefono: '', id: null });
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

        {/* Modal mensaje servidor */}
        {messageModal.show && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className={`p-6 rounded shadow-md ${messageModal.success ? 'bg-green-100' : 'bg-red-100'} w-80`}>
              <h2 className="text-lg font-bold mb-2">{messageModal.success ? '✔️ Éxito' : '❌ Error'}</h2>
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
