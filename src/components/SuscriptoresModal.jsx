import React, { useEffect, useState } from 'react';
import { API_URL } from '../config';

export default function SuscriptoresModal({ onClose }) {
  const [suscriptores, setSuscriptores] = useState([]);
  const [filter, setFilter] = useState('');

  const fetchSuscriptores = async () => {
    try {
      const res = await fetch(`${API_URL}/suscriptores`);
      const data = await res.json();
      setSuscriptores(data);
    } catch (error) {
      console.error("Error al cargar suscriptores:", error.message);
    }
  };

  const activar = async (chat_id) => {
    try {
      const res = await fetch(`${API_URL}/suscriptores/activar/${chat_id}`, { method: 'PATCH' });
      const result = await res.json();
      alert(result.mensaje || 'Suscriptor activado correctamente');
      fetchSuscriptores();
    } catch (error) {
      alert('❌ Error al activar suscriptor');
    }
  };

  const desactivar = async (chat_id) => {
    try {
      const res = await fetch(`${API_URL}/suscriptores/desactivar/${chat_id}`, { method: 'PATCH' });
      const result = await res.json();
      alert(result.mensaje || 'Suscriptor desactivado correctamente');
      fetchSuscriptores();
    } catch (error) {
      alert('❌ Error al desactivar suscriptor');
    }
  };

  useEffect(() => {
    fetchSuscriptores();
  }, []);

  const filtrados = suscriptores.filter(s =>
    s.nombre.toLowerCase().includes(filter.toLowerCase()) ||
    s.username?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded w-full max-w-4xl relative">
        <button className="absolute top-2 right-2 text-gray-500" onClick={onClose}>✖️</button>
        <h2 className="text-2xl font-bold mb-4">📣 Suscriptores del Bot</h2>

        <input
          type="text"
          placeholder="Buscar por nombre o usuario..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border p-2 mb-4 rounded w-full"
        />

        <table className="w-full table-auto border-collapse">
          <thead>
            <tr>
              <th className="border p-2">Nombre</th>
              <th className="border p-2">Username</th>
              <th className="border p-2">Tipo Chat</th>
              <th className="border p-2">Activo</th>
              <th className="border p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map(s => (
              <tr key={s.chat_id}>
                <td className="border p-2">{s.nombre}</td>
                <td className="border p-2">@{s.username || '—'}</td>
                <td className="border p-2">{s.tipo_chat}</td>
                <td className="border p-2 text-center">{s.activo ? '🔔' : '🔕'}</td>
                <td className="border p-2 text-center">
     
                    {s.activo ? (
                        <button
                        onClick={() => desactivar(s.chat_id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                        >
                        Desactivar 🔕
                        </button>
                    ) : (
                        <button
                        onClick={() => activar(s.chat_id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                        >
                        Activar 🔔
                        </button>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
