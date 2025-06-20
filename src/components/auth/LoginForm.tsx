import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiUrls } from '../../configs/api';

interface LoginFormData {
  email: string;
  contraseña: string;
}

interface LoginResponse {
  access_token: string;
  user: {
    id: number;
    email: string;
    rol: string;
    nombre: string;
    apellido: string;
  };
}

export const LoginForm = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    contraseña: '',
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('countryag-user') || 'null');
    if (user && user.role) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'usuario') navigate('/home');
    }
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(apiUrls.users.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      const data: LoginResponse = await response.json();
      
      // Guardar el token JWT
      localStorage.setItem('access_token', data.access_token);
      
      // Guardar el usuario con la estructura que espera la aplicación
      const userToSave = {
        id: data.user.id.toString(),
        name: `${data.user.nombre} ${data.user.apellido}`,
        role: data.user.rol.toLowerCase()
      };
      console.log('ROL recibido:', data.user.rol);
      console.log('userToSave:', userToSave);
      localStorage.setItem('countryag-user', JSON.stringify(userToSave));
      // Forzar sincronización inmediata en la misma pestaña
      window.dispatchEvent(new StorageEvent('storage', { key: 'countryag-user', newValue: JSON.stringify(userToSave) }));
      
      // Redirigir según el rol del usuario
      if (data.user.rol.toLowerCase() === 'admin') {
        navigate('/admin');
      } else {
        navigate('/home');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-light to-accent py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="flex flex-col items-center">
          {/* Logo de árbol */}
          <img 
            src="/ENPUNTO_LARGO_Mesa de trabajo 1.png"
            alt="En Punto Banner"
            className="w-full max-w-xs mb-4"
          />
          <h2 className="text-center text-3xl font-extrabold text-primary">
            EnPunto
          </h2>
          <p className="mt-2 text-center text-sm text-secondary">
            Viaja seguro y cómodo con nosotros
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-t-md relative block w-full px-3 py-3 border border-secondary placeholder-gray-400 text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="contraseña" className="sr-only">Contraseña</label>
              <input
                id="contraseña"
                name="contraseña"
                type="password"
                required
                className="appearance-none rounded-b-md relative block w-full px-3 py-3 border border-secondary placeholder-gray-400 text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Contraseña"
                value={formData.contraseña}
                onChange={handleChange}
              />
            </div>
          </div>


          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-md border border-red-200">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
            >
              Iniciar Sesión
            </button>
          </div>

          <div className="text-sm text-center mt-4">
            <Link to="/register" className="font-medium text-primary hover:text-secondary transition-colors duration-200">
              ¿No tienes cuenta? Regístrate aquí
            </Link>
          </div>

          {/* Credenciales de prueba */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3 text-center">
              Credenciales de Prueba
            </h3>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex justify-between items-center">
                <span className="font-medium">Admin:</span>
                <span>admin@admin.com / 123456san</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Usuario:</span>
                <span>user@user.com / 123456san</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}; 