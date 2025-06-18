import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiUrls } from '../../configs/api';
import { CreatePersonaBody, UserRol } from '../../configs/interfaces';

const AREAS = [
  'Nuestra Señora del Pilar',
  'Nuestra Señora del Rosario',
  'Nuestra Señora de las Mercedes',
  'Nuestra Señora de los Dolores',
  'Nuestra Señora de Itati',
  'Nuestra Señora de Loreto',
  'Nuestra Señora de Lujan',
  'Nuestra Señora de Torreciudad',
  'Nuestra Señora de la Paz',
  'Nuestra Señora de Fatima',
  'Nuestra Señora de Lourdes',
  'Nuestra Señora de la Asuncion',
  'Nuestra Señora de Carmen',
];

const OCUPACIONES = [
  'Servicios Domésticos',
  'Construcción',
  'Carpintero',
  'Jardinero',
  'Otros...'
];

export const RegisterForm = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState<CreatePersonaBody>({
    nombre: '',
    apellido: '',
    email: '',
    contraseña: '',
    dni: '',
    celular: '',
    rol: UserRol.USUARIO,
    esPropietario: false,
    esProveedor: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (e.target instanceof HTMLInputElement && e.target.type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones mínimas
    if (!formData.nombre || !formData.apellido || !formData.email || !formData.contraseña || !formData.dni || !formData.celular) {
      setError('Por favor, completa todos los campos obligatorios.');
      return;
    }
    if (!formData.esPropietario && !formData.esProveedor) {
      setError('Debes seleccionar al menos un perfil: Propietario o Proveedor.');
      return;
    }
    if (formData.esPropietario && (!formData.area || !formData.lote)) {
      setError('Si eres propietario, debes completar Área y Lote.');
      return;
    }
    if (formData.esProveedor && !formData.ocupacion) {
      setError('Si eres proveedor, debes seleccionar una ocupación.');
      return;
    }

    try {
      const response = await fetch(apiUrls.users.create, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al registrar usuario');
      }

      navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar usuario');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-green-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-green-100">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-green-800">
            Registro de Usuario
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-3">
              <label htmlFor="nombre" className="block text-sm font-medium text-green-700">Nombre</label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                required
                className="appearance-none rounded-md block w-full px-3 py-2 border border-green-300 placeholder-green-400 text-green-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Nombre"
                value={formData.nombre}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="apellido" className="block text-sm font-medium text-green-700">Apellido</label>
              <input
                id="apellido"
                name="apellido"
                type="text"
                required
                className="appearance-none rounded-md block w-full px-3 py-2 border border-green-300 placeholder-green-400 text-green-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Apellido"
                value={formData.apellido}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="dni" className="block text-sm font-medium text-green-700">DNI</label>
              <input
                id="dni"
                name="dni"
                type="text"
                required
                className="appearance-none rounded-md block w-full px-3 py-2 border border-green-300 placeholder-green-400 text-green-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="DNI"
                value={formData.dni}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="celular" className="block text-sm font-medium text-green-700">Celular</label>
              <input
                id="celular"
                name="celular"
                type="text"
                required
                className="appearance-none rounded-md block w-full px-3 py-2 border border-green-300 placeholder-green-400 text-green-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Celular"
                value={formData.celular}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="block text-sm font-medium text-green-700">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-md block w-full px-3 py-2 border border-green-300 placeholder-green-400 text-green-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="contraseña" className="block text-sm font-medium text-green-700">Contraseña</label>
              <input
                id="contraseña"
                name="contraseña"
                type="password"
                required
                className="appearance-none rounded-md block w-full px-3 py-2 border border-green-300 placeholder-green-400 text-green-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Contraseña"
                value={formData.contraseña}
                onChange={handleChange}
              />
            </div>
            <div className="flex items-center space-x-4 mb-3">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="esPropietario"
                  checked={formData.esPropietario}
                  onChange={handleChange}
                  className="form-checkbox h-5 w-5 text-green-600"
                />
                <span className="ml-2 text-green-700 font-medium">Propietario</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="esProveedor"
                  checked={formData.esProveedor}
                  onChange={handleChange}
                  className="form-checkbox h-5 w-5 text-green-600"
                />
                <span className="ml-2 text-green-700 font-medium">Proveedor</span>
              </label>
            </div>
            {formData.esPropietario && (
              <>
                <div className="mb-3">
                  <label htmlFor="area" className="block text-sm font-medium text-green-700">Área</label>
                  <select
                    id="area"
                    name="area"
                    required={formData.esPropietario}
                    className="appearance-none rounded-md block w-full px-3 py-2 border border-green-300 bg-white placeholder-green-400 text-green-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    value={formData.area || ''}
                    onChange={handleChange}
                  >
                    <option value="">Selecciona un área</option>
                    {AREAS.map(area => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="lote" className="block text-sm font-medium text-green-700">Lote</label>
                  <input
                    id="lote"
                    name="lote"
                    type="text"
                    required={formData.esPropietario}
                    className="appearance-none rounded-md block w-full px-3 py-2 border border-green-300 placeholder-green-400 text-green-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    placeholder="Número de lote"
                    value={formData.lote || ''}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}
            {formData.esProveedor && (
              <div className="mb-3">
                <label htmlFor="ocupacion" className="block text-sm font-medium text-green-700">Ocupación</label>
                <select
                  id="ocupacion"
                  name="ocupacion"
                  required={formData.esProveedor}
                  className="appearance-none rounded-md block w-full px-3 py-2 border border-green-300 bg-white placeholder-green-400 text-green-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  value={formData.ocupacion || ''}
                  onChange={handleChange}
                >
                  <option value="">Selecciona una ocupación</option>
                  {OCUPACIONES.map(ocup => (
                    <option key={ocup} value={ocup}>{ocup}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-md border border-red-200">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-md transition-colors duration-200"
            >
              Registrarse
            </button>
          </div>

          <div className="text-sm text-center mt-4">
            <Link to="/login" className="font-medium text-green-600 hover:text-green-500 transition-colors duration-200">
              ¿Ya tienes cuenta? Inicia sesión aquí
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}; 