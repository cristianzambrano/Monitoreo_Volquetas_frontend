import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const volquetaIcon = new L.Icon({
  iconUrl: '/icons/volqueta.png',  
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  shadowUrl: iconShadow,
  shadowSize: [41, 41],
  shadowAnchor: [13, 41]
});

const center = {
  lat: -0.25,
  lng: -79.15
};

function MapPanel({ volquetas, rutas  }) {
  return (
    <div className="flex-1 bg-gray-200 relative">
  
      <MapContainer center={center} zoom={13} style={{ width: "100%", height: "100%", zIndex: 0}}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

     
        {rutas
          .filter(r => r.estado === 'activo' || r.estado === 'en progreso')
          .map((ruta, idx) => {
            const coords = ruta.trayecto
              .replace('LINESTRING(', '')
              .replace(')', '')
              .split(',')
              .map(p => {
                const [lonStr, latStr] = p.trim().split(' ');
                return [parseFloat(latStr), parseFloat(lonStr)]; // ¡Lat, Lon en ese orden!
              });

            return (
              <Polyline
                key={`ruta-${idx}`}
                positions={coords}
                color={ruta.estado === 'activo' ? 'blue' : 'green'}
                weight={4}
                opacity={0.7}
              />
            );
          })
        }

        {volquetas
          .filter(v => v.latitud !== null && v.longitud !== null)
          .map((v, idx) => (
            <Marker
              key={idx}
              position={{ lat: v.latitud, lng: v.longitud }}
              icon={volquetaIcon}
            >
              <Popup>
                <strong>{v.nombre || v.placa}</strong><br/>
                Velocidad: {v.velocidad} km/h
              </Popup>
            </Marker>
          ))
        }
      </MapContainer>
    </div>
  );
}

export default MapPanel;
