import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../components/Logo/Logo';
import './Home.scss';

const Home: React.FC = () => {
  return (
    <div className="home-container">
      <div className="home-background">
        <div className="home-grid"></div>
        <div className="home-glow"></div>
      </div>

      <header className="home-header">
        <Logo size="large" />
      </header>

      <main className="home-main">
        <section className="hero-section">
          <h1 className="hero-title">
            Protección Avanzada de Ciberseguridad
            <span className="gradient-text"> para tu Infraestructura</span>
          </h1>
          <p className="hero-description">
            LINCOLN es un sistema integral de seguridad diseñado para proteger tus servidores
            contra amenazas modernas. Monitoreo en tiempo real, detección proactiva y respuesta
            automatizada ante incidentes de seguridad.
          </p>
          <div className="hero-actions">
            <Link to="/login" className="cta-button primary">
              Iniciar Sesión
            </Link>
          </div>
        </section>

        <section className="features-section">
          <h2 className="section-title">Características Principales</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 2L2 7L12 12L22 7L12 2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 17L12 22L22 17"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 12L12 17L22 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="feature-title">Monitoreo en Tiempo Real</h3>
              <p className="feature-description">
                Vigilancia continua de tu infraestructura con alertas instantáneas ante cualquier
                actividad sospechosa o anomalía detectada.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 8V12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 16H12.01"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="feature-title">Detección de Ransomware</h3>
              <p className="feature-description">
                Identificación temprana de intentos de secuestro de datos mediante análisis
                avanzado de patrones y comportamiento de procesos.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect
                    x="3"
                    y="11"
                    width="18"
                    height="11"
                    rx="2"
                    ry="2"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="feature-title">Prevención de Filtraciones</h3>
              <p className="feature-description">
                Protección activa contra exfiltración de datos sensibles con políticas de seguridad
                y control de acceso granular.
              </p>
            </div>

          </div>
        </section>
      </main>

      <footer className="home-footer">
        <p>&copy; 2025 LINCOLN. Sistema de Seguridad para Servidores.</p>
      </footer>
    </div>
  );
};

export default Home;

