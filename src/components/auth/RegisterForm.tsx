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
        let data = {};
        try {
          data = await response.json();
        } catch {}
        // Mostrar mensaje específico si lo hay
        if (data.message) {
          setError(data.message);
        } else if (typeof data === 'string') {
          setError(data);
        } else {
          setError('Error al registrar usuario');
        }
        return;
      }

      navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar usuario');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-light to-accent py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <img 
            src="/ENPUNTO_LARGO_Mesa de trabajo 1.png"
            alt="EnPunto Banner"
            className="w-full max-w-xs mx-auto mb-4"
          />
          <h2 className="text-3xl font-bold text-primary mb-2">
            Viaja con EnPunto
          </h2>
          <p className="text-secondary">
            Regístrate para acceder al servicio de transporte interno
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-accent">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Datos Personales */}
            <div>
              <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                Datos Personales
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-secondary mb-2">
                    Nombre *
                  </label>
                  <input
                    id="nombre"
                    name="nombre"
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    placeholder="Tu nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="apellido" className="block text-sm font-medium text-secondary mb-2">
                    Apellido *
                  </label>
                  <input
                    id="apellido"
                    name="apellido"
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    placeholder="Tu apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="dni" className="block text-sm font-medium text-secondary mb-2">
                    DNI *
                  </label>
                  <input
                    id="dni"
                    name="dni"
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    placeholder="12345678"
                    value={formData.dni}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="celular" className="block text-sm font-medium text-secondary mb-2">
                    Celular *
                  </label>
                  <input
                    id="celular"
                    name="celular"
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    placeholder="11 1234-5678"
                    value={formData.celular}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Datos de Acceso */}
            <div>
              <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                Datos de Acceso
              </h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-secondary mb-2">
                    Email *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="contraseña" className="block text-sm font-medium text-secondary mb-2">
                    Contraseña *
                  </label>
                  <input
                    id="contraseña"
                    name="contraseña"
                    type="password"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    placeholder="Mínimo 6 caracteres"
                    value={formData.contraseña}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Perfil */}
            <div>
              <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">3</span>
                </div>
                Perfil
              </h3>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-primary transition-colors">
                    <input
                      type="checkbox"
                      name="esPropietario"
                      checked={formData.esPropietario}
                      onChange={handleChange}
                      className="h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <span className="ml-3 text-secondary font-medium">Soy Propietario</span>
                  </label>
                  <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-primary transition-colors">
                    <input
                      type="checkbox"
                      name="esProveedor"
                      checked={formData.esProveedor}
                      onChange={handleChange}
                      className="h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <span className="ml-3 text-secondary font-medium">Soy Proveedor</span>
                  </label>
                </div>

                {formData.esPropietario && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-primary mb-3">Información del Lote</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="area" className="block text-sm font-medium text-secondary mb-2">
                          Área *
                        </label>
                        <select
                          id="area"
                          name="area"
                          required={formData.esPropietario}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-white"
                          value={formData.area || ''}
                          onChange={handleChange}
                        >
                          <option value="">Selecciona un área</option>
                          {AREAS.map(area => (
                            <option key={area} value={area}>{area}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="lote" className="block text-sm font-medium text-secondary mb-2">
                          Número de Lote *
                        </label>
                        <input
                          id="lote"
                          name="lote"
                          type="text"
                          required={formData.esPropietario}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                          placeholder="Ej: A-123"
                          value={formData.lote || ''}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formData.esProveedor && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-medium text-primary mb-3">Información Laboral</h4>
                    <div>
                      <label htmlFor="ocupacion" className="block text-sm font-medium text-secondary mb-2">
                        Ocupación *
                      </label>
                      <select
                        id="ocupacion"
                        name="ocupacion"
                        required={formData.esProveedor}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-white"
                        value={formData.ocupacion || ''}
                        onChange={handleChange}
                      >
                        <option value="">Selecciona una ocupación</option>
                        {OCUPACIONES.map(ocup => (
                          <option key={ocup} value={ocup}>{ocup}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-primary text-white py-4 px-6 rounded-lg font-semibold hover:bg-secondary transition-colors shadow-lg"
            >
              Crear Cuenta
            </button>

            <div className="text-center">
              <Link to="/login" className="text-primary hover:text-secondary transition-colors font-medium">
                ¿Ya tienes cuenta? Inicia sesión aquí
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm; 