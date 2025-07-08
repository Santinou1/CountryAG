import React, { useState } from 'react';
import { apiUrls } from '../../configs/api';
import { useNavigate, Link } from 'react-router-dom';

const ResetPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(apiUrls.auth.setPassword, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, nuevaContrasena })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al restablecer la contraseña');
      }
      setSuccess('¡Contraseña restablecida correctamente! Ahora puedes iniciar sesión.');
      setEmail('');
      setNuevaContrasena('');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-light to-accent py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-4 text-center text-primary">Restablecimiento de contraseña</h2>
          {/* Logo de árbol */}
          <img 
            src="/ENPUNTO_LARGO_Mesa de trabajo 1.png"
            alt="En Punto Banner"
            className="w-full max-w-xs mb-4"
          />
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
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="nuevaContrasena" className="sr-only">Nueva contraseña</label>
              <input
                id="nuevaContrasena"
                name="nuevaContrasena"
                type="password"
                required
                className="appearance-none rounded-b-md relative block w-full px-3 py-3 border border-secondary placeholder-gray-400 text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Nueva contraseña"
                value={nuevaContrasena}
                onChange={e => setNuevaContrasena(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-md border border-red-200">
              {error}
            </div>
          )}
          {success && (
            <div className="text-green-600 text-sm text-center bg-green-50 p-2 rounded-md border border-green-200">
              {success}
            </div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
              disabled={loading}
            >
              {loading ? 'Restableciendo...' : 'Restablecer contraseña'}
            </button>
          </div>

          <div className="text-sm text-center mt-4">
            <Link to="/login" className="font-medium text-primary hover:text-secondary transition-colors duration-200">
              ¿Ya tienes cuenta? Inicia sesión aquí
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordForm; 