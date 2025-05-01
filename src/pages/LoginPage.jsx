import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/dashboard');
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="p-8 bg-white rounded shadow-md w-80">
        <h2 className="text-2xl font-bold mb-6 text-center">Iniciar Sesión</h2>
        <button onClick={handleLogin} className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
          Entrar
        </button>
      </div>
    </div>
  );
}

export default LoginPage;