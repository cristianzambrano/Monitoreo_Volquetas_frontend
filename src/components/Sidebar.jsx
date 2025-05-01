function Sidebar({ isOpen, onOpenModal }) {
  return (
    <div className={`bg-gray-800 text-white flex flex-col transition-all duration-300 ${isOpen ? 'w-64' : 'w-0 overflow-hidden'}`}>
      <div className="p-4 font-bold">{isOpen && 'Menú'}</div>
      <nav className={`flex flex-col space-y-4 p-4 ${isOpen ? '' : 'hidden'}`}>
        <div>
          <div className="text-gray-400 uppercase text-xs mb-2">Inicialización</div>
          <button onClick={() => onOpenModal('volquetas')} className="hover:bg-gray-700 p-2 rounded block w-full text-left">
            🚛 Volquetas
          </button>
          <button onClick={() => onOpenModal('choferes')} className="hover:bg-gray-700 p-2 rounded block w-full text-left">
            👨‍✈️ Choferes
          </button>
        </div>
        <div className="mt-6">
          <div className="text-gray-400 uppercase text-xs mb-2">🛣️ Rutas</div>
          <button onClick={() => onOpenModal('nuevaRuta')} className="hover:bg-gray-700 p-2 rounded block w-full text-left">
            ➕ Nueva Ruta
          </button>
          <button onClick={() => onOpenModal('listadoRutas')} className="hover:bg-gray-700 p-2 rounded block w-full text-left">
            📋 Listado
          </button>
        </div>
        <div className="mt-6">
          <div className="text-gray-400 uppercase text-xs mb-2">Eventos</div>
          <button onClick={() => onOpenModal('historialGPS')} className="hover:bg-gray-700 p-2 rounded block w-full text-left">
            🛰️ Historial GPS
          </button>
        </div>
      </nav>
    </div>
  );
}

export default Sidebar;
