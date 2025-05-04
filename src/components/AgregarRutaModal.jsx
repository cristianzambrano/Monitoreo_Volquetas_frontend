import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Polygon } from "react-leaflet";
import axios from "axios";
import L from 'leaflet';
import "leaflet/dist/leaflet.css";
import { API_URL } from '../config';

const santoDomingoCenter = [-0.2531, -79.1658];

export default function AgregarRutaModal({ onClose }) {
  const [nombre, setNombre] = useState('');
  const [volquetas, setVolquetas] = useState([]);
  const [choferes, setChoferes] = useState([]);
  const [volquetaId, setVolquetaId] = useState('');
  const [choferId, setChoferId] = useState('');
  const [origen, setOrigen] = useState(santoDomingoCenter);
  const [destino, setDestino] = useState(santoDomingoCenter);
  const [trayecto, setTrayecto] = useState([]);
  const [summary, setSummary] = useState({ distance: 0, duration: 0 });
  const [loadingRuta, setLoadingRuta] = useState(false);
  const [minas, setMinas] = useState([]);
  const [minaSeleccionada, setMinaSeleccionada] = useState(null);

  const ORS_API_KEY = process.env.REACT_APP_ORS_API_KEY;
  const inicioIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  const finIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/1484/1484841.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  const guardarRuta = async () => {
    if (!nombre || !volquetaId || !choferId || trayecto.length === 0) {
      alert('Por favor, complete todos los campos antes de guardar la ruta.');
      return;
    }

    const trayectoTexto = trayecto.map(coord => `${coord[1]} ${coord[0]}`).join(', ');

    const body = {
      id_volqueta: volquetaId,
      id_chofer: choferId,
      nombre,
      fecha_inicio: null,
      fecha_fin: null,
      origen_lat: origen[0],
      origen_lon: origen[1],
      destino_lat: destino[0],
      destino_lon: destino[1],
      trayecto: trayectoTexto
    };

    try {
      const res = await axios.post(`${API_URL}/rutas-activas`, body);
      if (res.data.success) {
        alert('✅ Ruta guardada exitosamente');
        onClose();
      } else {
        alert('Error al guardar la ruta');
      }
    } catch (error) {
      console.error('Error al guardar ruta:', error);
      alert('Error al guardar la ruta: ' + error.message);
    }
  };

  useEffect(() => {
    fetch(`${API_URL}/volquetas`).then(res => res.json()).then(setVolquetas);
    fetch(`${API_URL}/choferes`).then(res => res.json()).then(setChoferes);
    fetch(`${API_URL}/minas`).then(res => res.json()).then(setMinas);
  }, []);

  useEffect(() => {
    if (origen && destino) obtenerRuta();
  }, [origen, destino]);

  const obtenerRuta = async () => {
    try {
      setLoadingRuta(true);
      const res = await axios.get(`https://api.openrouteservice.org/v2/directions/driving-hgv`, {
        params: {
          api_key: ORS_API_KEY,
          start: `${origen[1]},${origen[0]}`,
          end: `${destino[1]},${destino[0]}`
        }
      });
      const feature = res.data.features?.[0];
      if (feature) {
        setTrayecto(feature.geometry.coordinates.map(c => [c[1], c[0]]));
        const segmento = feature.properties?.segments?.[0];
        if (segmento) setSummary({ distance: segmento.distance, duration: segmento.duration });
      } else {
        alert('No se pudo calcular ruta');
      }
    } catch (error) {
      console.error('Error obteniendo ruta:', error);
      alert('Error al obtener la ruta ' + origen + ' ' + destino + ': ' + error.message);
    } finally {
      setLoadingRuta(false);
    }
  };

  const handleSelectMina = (id) => {
    const mina = minas.find(m => m.id === parseInt(id));
    if (mina) {
      setMinaSeleccionada(mina);
      const [lon, lat] = mina.ubicacion.coordinates;
      setOrigen([lat, lon]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded w-full max-w-7xl relative">
        <button className="absolute top-2 right-2 text-gray-500" onClick={onClose}>✖️</button>
        <h2 className="text-2xl font-bold mb-6">🛣️ Agregar Nueva Ruta</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="flex flex-col">
            <label className="text-gray-600 text-sm mb-1">🛠️ Seleccione Mina</label>
            <select className="border p-2 rounded w-full" onChange={(e) => handleSelectMina(e.target.value)}>
              <option value="">Seleccione Mina</option>
              {minas.map(mina => (
                <option key={mina.id} value={mina.id}>{mina.nombre}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-gray-600 text-sm mb-1">🛣️ Nombre de la Ruta</label>
            <input type="text" className="border p-2 rounded w-full" value={nombre} onChange={e => setNombre(e.target.value)} />
          </div>
          <div className="flex flex-col">
            <label className="text-gray-600 text-sm mb-1">🚛 Volqueta</label>
            <select className="border p-2 rounded w-full" value={volquetaId} onChange={e => setVolquetaId(e.target.value)}>
              <option value="">Seleccione Volqueta</option>
              {volquetas.map(v => (<option key={v.id} value={v.id}>{v.placa}</option>))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-gray-600 text-sm mb-1">👨‍✈️ Chofer</label>
            <select className="border p-2 rounded w-full" value={choferId} onChange={e => setChoferId(e.target.value)}>
              <option value="">Seleccione Chofer</option>
              {choferes.map(c => (<option key={c.id} value={c.id}>{c.nombre}</option>))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-600 text-sm mb-2">Punto Inicio (Fijo desde Mina)</label>
            <div className="grid grid-cols-2 gap-2">
              <input type="text" value={origen[0].toFixed(6)} readOnly className="border p-2 rounded w-full bg-gray-100" placeholder="Latitud" />
              <input type="text" value={origen[1].toFixed(6)} readOnly className="border p-2 rounded w-full bg-gray-100" placeholder="Longitud" />
            </div>
          </div>

          <div>
            <label className="block text-gray-600 text-sm mb-2">Punto Fin</label>
            <div className="grid grid-cols-2 gap-2">
              <input type="text" value={destino[0].toFixed(6)} readOnly className="border p-2 rounded w-full bg-gray-100" placeholder="Latitud" />
              <input type="text" value={destino[1].toFixed(6)} readOnly className="border p-2 rounded w-full bg-gray-100" placeholder="Longitud" />
            </div>
          </div>
        </div>

        <div className="relative h-96 mb-4">
          <MapContainer center={santoDomingoCenter} zoom={14} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {minaSeleccionada && (
              <>
                <Polygon positions={minaSeleccionada.poligono.coordinates[0].map(([lon, lat]) => [lat, lon])} color="orange" />
                <Marker position={[minaSeleccionada.ubicacion.coordinates[1], minaSeleccionada.ubicacion.coordinates[0]]} icon={inicioIcon} />
              </>
            )}
            <Marker
              position={destino}
              draggable={true}
              icon={finIcon}
              eventHandlers={{
                dragend: (e) => {
                  const latlng = e.target.getLatLng();
                  setDestino([latlng.lat, latlng.lng]);
                }
              }}
            />
            {trayecto.length > 0 && (
              <Polyline positions={trayecto} color="blue" />
            )}
          </MapContainer>

          {loadingRuta && (
            <div className="absolute top-0 left-0 w-full h-full bg-gray-500 bg-opacity-50 flex flex-col items-center justify-center z-10">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-white"></div>
              <p className="text-white font-bold mt-4">Calculando ruta...</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center space-x-8 my-4">
          <div className="flex items-center space-x-2">
            <span>🛣️</span>
            <span className="font-bold text-gray-700">{(summary.distance / 1000).toFixed(2)} km</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>⏱️</span>
            <span className="font-bold text-gray-700">{(summary.duration / 60).toFixed(1)} min</span>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button onClick={obtenerRuta} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
            Obtener Ruta
          </button>
          <button onClick={guardarRuta} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
            Guardar Ruta
          </button>
        </div>
      </div>
    </div>
  );
}
