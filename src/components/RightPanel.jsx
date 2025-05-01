function RightPanel({ volquetas, rutas }) {
  // Ordenar volquetas
  const ordenadas = [...volquetas].sort((a, b) => {
    const estadoOrden = {
      'movimiento': 1,
      'detenida': 2,
      'desconectado': 3
    };
    return estadoOrden[a.estadoGPS] - estadoOrden[b.estadoGPS];
  });


  const rutasOrdenadas = [...rutas].sort((a, b) => {
    const ordenEstado = {
      'en progreso': 1,
      'activo': 2,
      'terminada': 3
    };
    return (ordenEstado[a.estado] || 99) - (ordenEstado[b.estado] || 99);
  });

  function getRutaBadgeColor(estado) {
    if (estado === 'activo') return 'bg-blue-400 text-white';
    if (estado === 'en progreso') return 'bg-green-400 text-white';
    if (estado === 'terminada') return 'bg-gray-400 text-white';
    return 'bg-gray-200 text-black';
  }
  
  function getRutaBackgroundColor(ruta) {
    if (!ruta.fueraDeRuta) return 'bg-white';
    
    const distancia = ruta.distanciaDesvio;
    if (distancia < 50) {
      return 'bg-red-100'; // Desviación leve
    } else if (distancia < 100) {
      return 'bg-red-300'; // Desviación media
    } else {
      return 'bg-red-500'; // Desviación grave
    }
  }

  
  return (
    <div className="w-80 bg-gray-100 p-4 flex flex-col h-full">
      {/* Volquetas Activas con alto fijo */}
      <div className="h-[300px] overflow-y-auto mb-4">
        <h3 className="font-bold text-lg mb-4">Volquetas Activas</h3>
        <ul className="space-y-2">
          {ordenadas.map((v, idx) => (
            <li key={idx} className="p-2 bg-white rounded shadow">
              <div className="flex justify-between items-center">
                <span>{v.nombre || v.placa}</span>
                <span className={`text-xs font-semibold rounded px-2 py-1 ${getColorClass(v.estadoGPS)}`}>
                  {v.estadoGPS}
                </span>
              </div>
              
              <div className="text-sm text-gray-500">
                Velocidad: {v.velocidad} km/h
              </div>
              <div className="text-sm text-gray-500">
                Fecha: {v.lastUpdate}
              </div>
            </li>
          ))}
        </ul>
      </div>

     
      <div className="h-[300px] overflow-y-auto border-t pt-4">
      <h3 className="font-bold text-lg mb-4">Rutas Activas</h3>
      <ul className="space-y-2">
        {rutasOrdenadas && rutasOrdenadas.length > 0 ? (
          rutasOrdenadas.map((ruta, idx) => (
            <li
              key={idx}
              className={`p-2 rounded shadow ${getRutaBackgroundColor(ruta)}`}
            >
              <div className="flex justify-between items-center">
                <span>{ruta.ruta_nombre}</span>
                <span className={`text-xs font-semibold rounded px-2 py-1 ${getRutaBadgeColor(ruta.estado)}`}>
                  {ruta.estado}
                </span>
              </div>
              <div className="text-xs mt-2">
              {ruta.fueraDeRuta ? (
                <div className="text-white">
                  🚨 Desviado {ruta.distanciaDesvio.toFixed(1)} metros
                </div>
              ) : (
                <div className="text-black">
                  ✅ En ruta
                </div>
              )}
            </div>
            </li>
          ))
        ) : (
          <li className="text-gray-500 text-sm">No hay rutas activas</li>
        )}
      </ul>
    </div>


    </div>
  );
}

function getColorClass(estadoGPS) {
  if (estadoGPS === 'movimiento') return 'bg-blue-400 text-white';
  if (estadoGPS === 'detenida') return 'bg-red-400 text-white';
  if (estadoGPS === 'desconectado') return 'bg-gray-400 text-white';
  return 'bg-gray-200 text-black';
}

export default RightPanel;
