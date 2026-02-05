import { useEffect, useMemo, useState } from 'react'
import './App.css'
import ChatWidget from './components/ChatWidget'

import heroOne from './img/doctor-563429_1280.jpg'
import heroTwo from './img/hospital-4904920_1280.jpg'
import heroThree from './img/operation-1807543_1280.jpg'
import heroFour from './img/treatment-4099432_1280.jpg'

const services = [
  {
    title: 'Reserva de hora',
    description: 'Agenda en linea sin espera con coordinacion inmediata.',
  },
  {
    title: 'Contact center',
    description: 'Asesoria rapida con asistentes especializados 24/7.',
  },
  {
    title: 'Resultados',
    description: 'Accede a examenes digitales y seguimiento post atencion.',
  },
  {
    title: 'Telemedicina',
    description: 'Atencion remota con especialistas y recetas digitales.',
  },
]

const quickIcons = [
  { label: 'Agenda', icon: 'calendar' },
  { label: 'Valores', icon: 'wallet' },
  { label: 'Especialistas', icon: 'stethoscope' },
  { label: 'Maternidad', icon: 'baby' },
  { label: 'Cardiologia', icon: 'heart' },
  { label: 'Preferente', icon: 'star' },
  { label: 'Pediatria', icon: 'shield' },
]

const iconPaths = {
  calendar: (
    <>
      <rect x="4" y="6" width="16" height="14" rx="2" />
      <path d="M8 4v4M16 4v4M4 10h16" />
    </>
  ),
  wallet: (
    <>
      <rect x="3" y="7" width="18" height="12" rx="2" />
      <path d="M3 9h14M16 12h3" />
      <circle cx="17.5" cy="12.5" r="1" />
    </>
  ),
  stethoscope: (
    <>
      <path d="M6 5v4a4 4 0 1 0 8 0V5" />
      <path d="M14 12a4 4 0 1 0 0 8h3" />
      <circle cx="20" cy="20" r="2" />
    </>
  ),
  baby: (
    <>
      <circle cx="12" cy="10" r="4" />
      <path d="M6 20a6 6 0 0 1 12 0" />
      <path d="M10 10h4" />
    </>
  ),
  heart: (
    <path d="M12 20s-7-4.4-7-9.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 7 3.5C19 15.6 12 20 12 20z" />
  ),
  star: (
    <path d="M12 3l2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.8-5.3 2.8 1-5.8-4.2-4.1 5.9-.9L12 3z" />
  ),
  shield: (
    <>
      <path d="M12 3l7 3v5c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6l7-3z" />
      <path d="M12 8v6" />
      <path d="M9 11h6" />
    </>
  ),
}

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const slides = useMemo(() => [heroOne, heroTwo, heroThree, heroFour], [])
  const [activeSlide, setActiveSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length)
    }, 5200)

    return () => clearInterval(timer)
  }, [slides.length])

  return (
    <div className="page">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="topbar-left">
            <span className="chip">Reserva tu hora</span>
            <span className="chip chip-outline">Contact Center 800 100 555</span>
          </div>
          <div className="topbar-right">
            <span>Servicios Online</span>
            <span>Acceso Medicos</span>
            <span>Novedades</span>
          </div>
        </div>
      </header>

      <section className="masthead">
        <div className="logo">
          <div className="logo-blocks">
            <span />
            <span />
            <span />
          </div>
          <div>
            <p className="logo-name">Clinica XX</p>
            <p className="logo-tag">Atencion cercana, moderna y confiable</p>
          </div>
        </div>
        <nav className="primary-nav">
          <a href="#paciente">Informacion al paciente</a>
          <a href="#red">Red clinica</a>
          <a href="#servicios">Servicios y unidades</a>
          <a href="#medicos">Medicos</a>
          <a href="#clinica">Clinica</a>
        </nav>
        <button className="primary" onClick={() => setIsChatOpen(true)}>
          Asistente virtual
        </button>
      </section>

      <main>
        <section className="hero-banner" id="paciente">
          <div className="hero-media">
            <div className="carousel">
              {slides.map((slide, index) => (
                <img
                  key={slide}
                  src={slide}
                  alt="Clinica moderna"
                  className={`carousel-slide ${index === activeSlide ? 'active' : ''}`}
                />
              ))}
            </div>
            <div className="hero-dots">
              {slides.map((_, index) => (
                <button
                  key={`dot-${index}`}
                  type="button"
                  className={index === activeSlide ? 'active' : ''}
                  onClick={() => setActiveSlide(index)}
                  aria-label={`Ir a la imagen ${index + 1}`}
                />
              ))}
            </div>
            <div className="hero-panel">
              <p className="hero-kicker">Programa Bienestar Integral</p>
              <h1>Si la vida te da urgencias, nosotros solucionamos</h1>
              <p className="hero-copy">
                Un modelo de salud preventiva y resolutiva que integra medicina
                general, especialidades y seguimiento continuo para ti y tu familia.
              </p>
              <div className="hero-cta">
                <div>
                  <span className="hero-cta-label">Plan familiar desde</span>
                  <strong>$7.024</strong>
                  <small>UF 0,1779</small>
                </div>
                <button className="primary">Contratar</button>
              </div>
            </div>
          </div>
        </section>

        <section className="quick-access" id="servicios">
          {quickIcons.map((item) => (
            <div key={item.label} className="quick-card">
              <div className="quick-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  {iconPaths[item.icon]}
                </svg>
              </div>
              <p>{item.label}</p>
            </div>
          ))}
        </section>

        <section className="services" id="red">
          <div className="section-title">
            <h2>Servicios destacados</h2>
            <p>Acceso rapido a las principales necesidades del paciente.</p>
          </div>
          <div className="service-grid">
            {services.map((service) => (
              <article key={service.title}>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <button className="ghost">Conocer mas</button>
              </article>
            ))}
          </div>
        </section>
      </main>

      <ChatWidget isOpen={isChatOpen} setIsOpen={setIsChatOpen} />
    </div>
  )
}

export default App
