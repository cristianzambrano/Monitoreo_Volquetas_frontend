import { useState, useEffect } from 'react';
import * as turf from '@turf/turf';

import { API_URL } from '../config';
import { WS_URL } from '../config';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import MapPanel from '../components/MapPanel';
import RightPanel from '../components/RightPanel';
import VolquetasModal from '../components/VolquetasModal';
import ChoferesModal from '../components/ChoferesModal'; 
import RutasActivasModal from '../components/RutasActivasModal'; 
import AgregarRutaModal from '../components/AgregarRutaModal'; 
import SuscriptoresModal from '../components/SuscriptoresModal';
import { useRef } from 'react';

function Dashboard() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [activeModal, setActiveModal] = useState(null);
  
  const [volquetas, setVolquetas] = useState([]);
  const [rutas, setRutas] = useState([]);
  const estadoRutasPrevio = useRef({});
  
  useEffect(() => {
    fetch(`${API_URL}/rutas-activas`) 
      .then(res => res.json())
      .then(data => {
        setRutas(data.map(r => ({
          ...r,
          fueraDeRuta: false,  // inicialmente no desviada
          distanciaDesvio: 0   // distancia en metros
        })));
      });
  }, []);

  const enviarAlerta = async (mensaje) => {
      try {
        await fetch(`${API_URL}/suscriptores/alertas`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mensaje })
        });
        console.log('🔔 Alerta enviada:', mensaje);
      } catch (err) {
        console.error('❌ Error al enviar alerta:', err.message);
      }
};


  function validarRutaAsignada(imei, lat, lon) {
    setRutas(prevRutas => prevRutas.map(ruta => {
      if (ruta.estado === 'en progreso' && ruta.dispositivo_id === imei) { // correlacionas IMEI con ID volqueta
        if (!ruta.trayecto) {
          console.warn('⚠️ Ruta sin trayecto, no se puede validar');
          return ruta;
        }
  
     
        const punto = turf.point([lon, lat]);
        const coords = ruta.trayecto
          .replace('LINESTRING(', '')
          .replace(')', '')
          .split(',')
          .map(p => {
            const [lonStr, latStr] = p.trim().split(' ');
            return [parseFloat(lonStr), parseFloat(latStr)];
          });
  
        const line = turf.lineString(coords);
        const distancia = turf.pointToLineDistance(punto, line, { units: 'meters' });
        const fuera = distancia > 30; // tolerancia de 30 metros
        
        const estadoAnterior = estadoRutasPrevio.current[imei];
        if (estadoAnterior !== undefined && estadoAnterior !== fuera) {
          if (fuera) {
              enviarAlerta(`🚨 Volqueta ${ruta.volqueta_placa}, con el conductor ${ruta.chofer_nombre}, se ha salido de la ruta autorizada ${ruta.ruta_nombre}.`);
          } else {
              enviarAlerta(`✅ Volqueta ${ruta.volqueta_placa}, con el conductor ${ruta.chofer_nombre}, ha regresado a la ruta autorizada ${ruta.ruta_nombre}. `);
        }
      }

      estadoRutasPrevio.current[imei] = fuera;

  
        return {
          ...ruta,
          fueraDeRuta: fuera, 
          distanciaDesvio: distancia
        };
      }
      return ruta;
    }));
  }
  
  

  useEffect(() => {
    // Cargar las volquetas activas
    fetch(`${API_URL}/volquetas`)
      .then(res => res.json())
      .then(data => {
        setVolquetas(data.map(v => ({
          ...v,
          latitud: null,
          longitud: null,
          velocidad: 0,
          estadoGPS: 'desconectado',
          lastUpdate: null
        })));
      });
  
    // Conectar al WebSocket
    const ws = new WebSocket(WS_URL);

  
    ws.onopen = () => {
      console.log('✅ WebSocket conectado');
    };
  
    ws.onerror = (error) => {
      console.error('❌ Error WebSocket:', error);
    };
  
    ws.onclose = () => {
      console.warn('⚠️ WebSocket cerrado');
    };
  
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        //console.log('📡 Datos recibidos:', data);
  
        setVolquetas(prevVolquetas =>
          prevVolquetas.map(volqueta => {
            if (volqueta.dispositivo_id === data.imei) {
              const velocidad = data.speed || 0;
              let estadoGPS = 'desconectado';
  
              if (velocidad > 0) {
                estadoGPS = 'movimiento';
              } else if (velocidad === 0) {
                estadoGPS = 'detenida';
              }
  
              return {
                ...volqueta,
                latitud: data.latitude,
                longitud: data.longitude,
                velocidad: velocidad,
                estadoGPS: estadoGPS,
                lastUpdate: new Date(data.timestamp).toLocaleString('es-EC', {
                  dateStyle: 'short',
                  timeStyle: 'medium'
                })
              };
            }
            return volqueta;
          })
        );

        validarRutaAsignada(data.imei, data.latitude, data.longitude);

      } catch (err) {
        console.error('❌ Error procesando datos WebSocket:', err);
      }
    };
  
    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, []);
  

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const openModal = (modalName) => {
    setActiveModal(modalName);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  
  return (
    <div className="flex flex-col h-screen">
      <Topbar onToggleSidebar={toggleSidebar} />
      <div className="flex flex-1">
        <Sidebar isOpen={isSidebarOpen} onOpenModal={openModal} />
        <MapPanel volquetas={volquetas} rutas={rutas} />
        <RightPanel volquetas={volquetas} rutas={rutas} />
      </div>

      {activeModal === 'volquetas' && <VolquetasModal onClose={closeModal} />}
      {activeModal === 'choferes' && <ChoferesModal onClose={closeModal} />}
      {activeModal === 'listadoRutas' && (<RutasActivasModal onClose={closeModal} 
                                          rutas={rutas} setRutas={setRutas} />)}
      {activeModal === 'nuevaRuta' && <AgregarRutaModal onClose={closeModal} />}
      {activeModal === 'suscriptores' && <SuscriptoresModal onClose={closeModal} />}
    </div>
  );
}

export default Dashboard;
