import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/Layout/Header/Header';
import Sidebar from '../../components/Layout/Sidebar/Sidebar';
import './Help.scss';

const Help: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile, logout } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const user = {
    name: userProfile?.displayName || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Usuario',
    email: currentUser?.email || '',
    role: userProfile?.role || 'user',
    avatar: currentUser?.photoURL || undefined,
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const categories = [
    { id: 'all', label: 'Todas', icon: '📚' },
    { id: 'getting-started', label: 'Primeros Pasos', icon: '🚀' },
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'servers', label: 'Servidores', icon: '🖥️' },
    { id: 'alerts', label: 'Alertas', icon: '🔔' },
    { id: 'reports', label: 'Reportes', icon: '📄' },
  ];

  const faqs = [
    {
      id: '1',
      category: 'getting-started',
      question: '¿Cómo inicio sesión en el sistema?',
      answer: 'Para iniciar sesión, utiliza tu email y contraseña registrados. Si olvidaste tu contraseña, puedes usar la opción "¿Olvidaste tu contraseña?" en la página de login.',
    },
    {
      id: '2',
      category: 'dashboard',
      question: '¿Qué información muestra el Dashboard?',
      answer: 'El Dashboard muestra un resumen completo del estado de seguridad: métricas generales, servidores monitoreados, amenazas activas, alertas recientes y salud del sistema.',
    },
    {
      id: '3',
      category: 'servers',
      question: '¿Cómo agrego un nuevo servidor?',
      answer: 'Ve a la sección de Servidores y haz clic en "Agregar Servidor". Completa el formulario con la información del servidor (nombre, IP, ubicación, etc.) y guarda.',
    },
    {
      id: '4',
      category: 'alerts',
      question: '¿Cómo gestiono las alertas?',
      answer: 'En la sección de Threats & Alerts puedes ver todas las alertas. Puedes reconocerlas, investigarlas, resolverlas o escalarlas según sea necesario.',
    },
    {
      id: '5',
      category: 'reports',
      question: '¿Cómo genero un reporte?',
      answer: 'Ve a la sección de Reportes, selecciona el tipo de reporte que necesitas, configura el rango de fechas y haz clic en "Generar Reporte".',
    },
  ];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="help-container dark">
      <Header
        user={user}
        notificationCount={0}
        onLogout={handleLogout}
      />
      <div className="help-content">
        <Sidebar userRole={user.role} />
        <main className="help-main">
          <div className="page-header">
            <div className="page-title-section">
              <h1 className="page-title">Centro de Ayuda</h1>
              <p className="page-subtitle">Encuentra respuestas a tus preguntas y aprende a usar el sistema</p>
            </div>
          </div>

          <div className="help-search">
            <div className="search-box-large">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                placeholder="Busca ayuda, preguntas frecuentes, guías..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="help-categories">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`category-card ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <span className="category-icon">{category.icon}</span>
                <span className="category-label">{category.label}</span>
              </button>
            ))}
          </div>

          <div className="help-section">
            <h2 className="section-title">Preguntas Frecuentes</h2>
            <div className="faqs-list">
              {filteredFaqs.length === 0 ? (
                <div className="empty-state">
                  <p>No se encontraron resultados para tu búsqueda.</p>
                </div>
              ) : (
                filteredFaqs.map((faq) => (
                  <div key={faq.id} className="faq-item">
                    <div className="faq-question">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {faq.question}
                    </div>
                    <div className="faq-answer">{faq.answer}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="help-section">
            <h2 className="section-title">Contacto y Soporte</h2>
            <div className="contact-cards">
              <div className="contact-card">
                <div className="contact-icon">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3>Email de Soporte</h3>
                <p>soporte@lincoln.security</p>
              </div>
              <div className="contact-card">
                <div className="contact-icon">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3>Teléfono</h3>
                <p>+57 1 234 5678</p>
              </div>
              <div className="contact-card">
                <div className="contact-icon">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                    <polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3>Horario de Atención</h3>
                <p>Lun - Vie: 8:00 AM - 6:00 PM</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Help;

