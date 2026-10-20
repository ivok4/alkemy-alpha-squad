import { useNavigate } from "react-router-dom";
import AuraBackground from "../Components/AuraBackground";
import {
  AccountBalanceWallet,
  ArrowForward,
  CheckCircle,
  Security,
  Speed,
  TrendingUp,
  ReceiptLong,
  FlashOn,
  ShieldOutlined,
  PaymentsOutlined,
  SyncAlt,
} from "@mui/icons-material";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <>
      {/* Background with low-motion subtle aura */}
      <AuraBackground variant="animated" />

      {/* Inline styles scoped to landing page */}
      <style>{`
        .landing-root {
          position: relative;
          z-index: 2;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          color: #f3f4f6;
          font-family: 'Plus Jakarta Sans', sans-serif;
          overflow-x: hidden;
        }

        /* ── Navbar ─────────────────────────────────────────────────── */
        .landing-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 48px;
          background: rgba(3, 3, 5, 0.75);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .landing-nav__brand {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 1.35rem;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.02em;
          text-decoration: none;
          cursor: pointer;
        }

        .landing-nav__brand-icon {
          width: 38px;
          height: 38px;
          background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #030303;
          box-shadow: 0 4px 16px rgba(56, 189, 248, 0.4);
        }

        .landing-nav__links {
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .landing-nav__link {
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          font-size: 0.95rem;
          font-weight: 500;
          transition: color 0.2s;
        }
        .landing-nav__link:hover {
          color: #38bdf8;
        }

        .landing-nav__actions {
          display: flex;
          gap: 14px;
          align-items: center;
        }

        /* ── Buttons ─────────────────────────────────────────────────── */
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 28px;
          border-radius: 12px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          border: none;
          outline: none;
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          text-decoration: none;
        }
        .btn:active {
          transform: scale(0.98);
        }

        .btn--nav {
          padding: 10px 22px;
          font-size: 0.88rem;
          border-radius: 10px;
        }

        .btn--primary {
          background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
          color: #030303;
          box-shadow: 0 4px 20px rgba(56, 189, 248, 0.4);
        }
        .btn--primary:hover {
          background: linear-gradient(135deg, #7dd3fc 0%, #38bdf8 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(56, 189, 248, 0.55);
        }

        .btn--outline {
          background: rgba(13, 17, 24, 0.85);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
        }
        .btn--outline:hover {
          background: rgba(56, 189, 248, 0.1);
          border-color: rgba(56, 189, 248, 0.4);
          color: #38bdf8;
          transform: translateY(-2px);
        }

        /* ── Hero Split Layout ───────────────────────────────────────── */
        .hero-section {
          padding: 150px 32px 90px;
          max-width: 1240px;
          margin: 0 auto;
          width: 100%;
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 60px;
          align-items: center;
        }

        .hero-left {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: rgba(56, 189, 248, 0.1);
          border: 1px solid rgba(56, 189, 248, 0.3);
          border-radius: 999px;
          padding: 8px 20px;
          margin-bottom: 24px;
          backdrop-filter: blur(10px);
          animation: fadeSlideDown 0.6s ease both;
        }
        .hero-badge__dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #38bdf8;
          box-shadow: 0 0 8px #38bdf8;
          animation: pulse 2s infinite;
        }
        .hero-badge__text {
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #7dd3fc;
        }

        .hero-title {
          font-size: clamp(2.6rem, 4.8vw, 4.2rem);
          font-weight: 900;
          line-height: 1.1;
          letter-spacing: -0.03em;
          color: #ffffff;
          margin-bottom: 20px;
          animation: fadeSlideDown 0.7s 0.1s ease both;
        }
        .hero-title--gradient {
          background: linear-gradient(135deg, #7dd3fc 0%, #38bdf8 50%, #0ea5e9 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          display: inline-block;
        }

        .hero-subtitle {
          font-size: clamp(1rem, 1.8vw, 1.15rem);
          font-weight: 400;
          color: rgba(255, 255, 255, 0.65);
          line-height: 1.65;
          margin-bottom: 36px;
          max-width: 540px;
          animation: fadeSlideDown 0.7s 0.2s ease both;
        }

        .hero-cta-group {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 36px;
          animation: fadeSlideDown 0.7s 0.3s ease both;
        }

        .hero-trust {
          display: flex;
          gap: 24px;
          flex-wrap: wrap;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          width: 100%;
          max-width: 520px;
          animation: fadeSlideDown 0.7s 0.4s ease both;
        }
        .hero-trust__item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.75);
        }
        .hero-trust__icon {
          color: #38bdf8;
          font-size: 1.1rem;
        }

        /* ── Hero Right: Floating Card Mockup ────────────────────────── */
        .hero-right {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          animation: fadeInUp 0.8s 0.2s ease both;
        }

        .hero-mockup-wrapper {
          position: relative;
          width: 100%;
          max-width: 460px;
        }

        .hero-mockup-img {
          width: 100%;
          height: auto;
          border: none;
          background: transparent;
          filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.6)) drop-shadow(0 0 35px rgba(56, 189, 248, 0.2));
          display: block;
          transition: transform 0.4s ease;
        }
        .hero-mockup-img:hover {
          transform: translateY(-4px) scale(1.02);
        }

        /* Floating badges */
        .float-badge {
          position: absolute;
          background: rgba(13, 17, 24, 0.92);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 16px;
          padding: 14px 18px;
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.6), 0 0 20px rgba(56, 189, 248, 0.15);
          display: flex;
          align-items: center;
          gap: 12px;
          z-index: 3;
        }

        .float-badge--top-right {
          top: -20px;
          right: -24px;
          animation: floatSlow 5s ease-in-out infinite;
        }

        .float-badge--bottom-left {
          bottom: -20px;
          left: -24px;
          animation: floatSlowReverse 6s ease-in-out infinite;
        }

        .float-badge__icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .float-badge__icon--success {
          background: rgba(16, 185, 129, 0.18);
          color: #10b981;
        }
        .float-badge__icon--primary {
          background: rgba(56, 189, 248, 0.18);
          color: #38bdf8;
        }

        .float-badge__title {
          font-size: 0.75rem;
          color: #9ca3af;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .float-badge__value {
          font-size: 1rem;
          font-weight: 800;
          color: #f3f4f6;
        }

        /* ── Features Section ───────────────────────────────────────── */
        .features-section {
          padding: 80px 32px;
          max-width: 1240px;
          margin: 0 auto;
          width: 100%;
        }

        .section-header {
          text-align: center;
          margin-bottom: 56px;
        }
        .section-tag {
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #38bdf8;
          margin-bottom: 12px;
          display: block;
        }
        .section-title {
          font-size: clamp(2rem, 3.5vw, 2.8rem);
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #ffffff;
        }
        .section-subtitle {
          color: rgba(255, 255, 255, 0.6);
          font-size: 1.05rem;
          max-width: 600px;
          margin: 12px auto 0;
          line-height: 1.6;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 24px;
        }

        .feature-card {
          background: rgba(13, 17, 24, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 32px 28px;
          backdrop-filter: blur(20px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .feature-card:hover {
          transform: translateY(-6px);
          border-color: rgba(56, 189, 248, 0.4);
          background: rgba(18, 24, 35, 0.95);
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.5), 0 0 24px rgba(56, 189, 248, 0.12);
        }

        .feature-card__icon {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background: rgba(56, 189, 248, 0.12);
          border: 1px solid rgba(56, 189, 248, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #38bdf8;
          margin-bottom: 20px;
        }

        .feature-card__title {
          font-size: 1.2rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 10px;
        }
        .feature-card__desc {
          font-size: 0.92rem;
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.6;
        }

        /* ── How it works Steps ─────────────────────────────────────── */
        .steps-section {
          padding: 60px 32px 90px;
          max-width: 1240px;
          margin: 0 auto;
          width: 100%;
        }

        .steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 28px;
          margin-top: 48px;
        }

        .step-card {
          background: rgba(13, 17, 24, 0.88);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 32px;
          position: relative;
          overflow: hidden;
        }
        .step-card__number {
          font-size: 3rem;
          font-weight: 900;
          color: rgba(56, 189, 248, 0.18);
          position: absolute;
          top: 16px;
          right: 20px;
          line-height: 1;
        }
        .step-card__title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 12px;
        }
        .step-card__desc {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.95rem;
          line-height: 1.6;
        }

        /* ── Bottom CTA Banner ──────────────────────────────────────── */
        .cta-banner-section {
          padding: 40px 32px 100px;
          max-width: 1240px;
          margin: 0 auto;
          width: 100%;
        }

        .cta-banner {
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(10, 15, 28, 0.98) 100%);
          border: 1px solid rgba(56, 189, 248, 0.3);
          border-radius: 28px;
          padding: 60px 48px;
          text-align: center;
          position: relative;
          overflow: hidden;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(56, 189, 248, 0.15);
        }

        .cta-banner__title {
          font-size: clamp(2rem, 3.5vw, 2.8rem);
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 16px;
          letter-spacing: -0.02em;
        }
        .cta-banner__subtitle {
          color: rgba(255, 255, 255, 0.65);
          font-size: 1.1rem;
          max-width: 560px;
          margin: 0 auto 32px;
          line-height: 1.6;
        }

        /* ── Footer ─────────────────────────────────────────────────── */
        .landing-footer {
          width: 100%;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding: 36px 32px;
          background: rgba(3, 3, 5, 0.85);
          text-align: center;
          color: rgba(255, 255, 255, 0.4);
          font-size: 0.88rem;
        }
        .landing-footer a {
          color: #38bdf8;
          text-decoration: none;
          transition: color 0.2s;
        }
        .landing-footer a:hover {
          color: #7dd3fc;
        }

        /* ── Responsive ─────────────────────────────────────────────── */
        @media (max-width: 980px) {
          .landing-nav {
            padding: 16px 24px;
          }
          .landing-nav__links {
            display: none;
          }
          .hero-section {
            grid-template-columns: 1fr;
            padding: 120px 24px 60px;
            gap: 48px;
            text-align: center;
          }
          .hero-left {
            align-items: center;
          }
          .hero-cta-group {
            justify-content: center;
          }
          .hero-trust {
            justify-content: center;
          }
          .float-badge--top-right {
            right: 0px;
          }
          .float-badge--bottom-left {
            left: 0px;
          }
        }

        @media (max-width: 640px) {
          .landing-nav__actions .btn--outline {
            display: none;
          }
          .hero-title {
            font-size: 2.3rem;
          }
          .float-badge {
            display: none;
          }
          .cta-banner {
            padding: 40px 24px;
          }
        }
      `}</style>

      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <nav className="landing-nav">
        <div className="landing-nav__brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <div className="landing-nav__brand-icon">
            <AccountBalanceWallet sx={{ fontSize: 22 }} />
          </div>
          Digital·Ars
        </div>

        <div className="landing-nav__links">
          <a href="#beneficios" className="landing-nav__link">Beneficios</a>
          <a href="#como-funciona" className="landing-nav__link">Cómo funciona</a>
          <a href="#seguridad" className="landing-nav__link">Seguridad</a>
        </div>

        <div className="landing-nav__actions">
          <button
            id="nav-login-btn"
            className="btn btn--outline btn--nav"
            onClick={() => navigate("/auth")}
          >
            Iniciar Sesión
          </button>
          <button
            id="nav-register-btn"
            className="btn btn--primary btn--nav"
            onClick={() => navigate("/auth")}
          >
            Crear Cuenta
          </button>
        </div>
      </nav>

      {/* ── Main Content ───────────────────────────────────────────── */}
      <main className="landing-root">
        {/* ── Hero Split Section ──────────────────────────────────── */}
        <section className="hero-section">
          {/* Left Column */}
          <div className="hero-left">
            <div className="hero-badge">
              <div className="hero-badge__dot" />
              <span className="hero-badge__text">✦ Billetera Digital en Pesos</span>
            </div>

            <h1 className="hero-title">
              Tu dinero seguro, simple y al instante con{" "}
              <span className="hero-title--gradient">Digital·Ars</span>
            </h1>

            <p className="hero-subtitle">
              Manejá tus pesos argentinos sin comisiones ocultas ni trámites burocráticos. 
              Transferencias instantáneas 24/7, depósitos inmediatos y control total desde cualquier dispositivo.
            </p>

            <div className="hero-cta-group">
              <button
                id="hero-register-btn"
                className="btn btn--primary"
                onClick={() => navigate("/auth")}
              >
                Abrir cuenta gratis
                <ArrowForward sx={{ fontSize: 18 }} />
              </button>
              <button
                id="hero-login-btn"
                className="btn btn--outline"
                onClick={() => navigate("/auth")}
              >
                Iniciar Sesión
              </button>
            </div>

            <div className="hero-trust">
              <div className="hero-trust__item">
                <CheckCircle className="hero-trust__icon" />
                <span>0% Comisión de apertura</span>
              </div>
              <div className="hero-trust__item">
                <FlashOn className="hero-trust__icon" />
                <span>Transferencias 24/7</span>
              </div>
              <div className="hero-trust__item">
                <Security className="hero-trust__icon" />
                <span>Protección avanzada</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual with Mockup Cards & Badges */}
          <div className="hero-right">
            <div className="hero-mockup-wrapper">
              <img
                src="/hero-cards.jpg"
                alt="DigitalArs Tarjetas y Billetera Virtual"
                className="hero-mockup-img"
              />

              {/* Top Floating Badge */}
              <div className="float-badge float-badge--top-right">
                <div className="float-badge__icon float-badge__icon--success">
                  <CheckCircle sx={{ fontSize: 22 }} />
                </div>
                <div>
                  <div className="float-badge__title">Transferencia Recibida</div>
                  <div className="float-badge__value">+$ 75.000,00 ARS</div>
                </div>
              </div>

              {/* Bottom Floating Badge */}
              <div className="float-badge float-badge--bottom-left">
                <div className="float-badge__icon float-badge__icon--primary">
                  <AccountBalanceWallet sx={{ fontSize: 22 }} />
                </div>
                <div>
                  <div className="float-badge__title">Saldo Disponible</div>
                  <div className="float-badge__value">$ 450.000,00</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features Section ─────────────────────────────────────── */}
        <section id="beneficios" className="features-section">
          <div className="section-header">
            <span className="section-tag">Beneficios exclusivos</span>
            <h2 className="section-title">Pensada para tu comodidad financiera</h2>
            <p className="section-subtitle">
              Todo lo que necesitás para mover tu dinero con la máxima fluidez, rapidez y seguridad.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-card__icon">
                <Speed sx={{ fontSize: 28 }} />
              </div>
              <h3 className="feature-card__title">Transferencias Inmediatas</h3>
              <p className="feature-card__desc">
                Enviá y recibí dinero al instante ingresando un CVU de 22 dígitos o tu Alias preferido.
              </p>
            </div>

            <div className="feature-card" id="seguridad">
              <div className="feature-card__icon">
                <ShieldOutlined sx={{ fontSize: 28 }} />
              </div>
              <h3 className="feature-card__title">Seguridad Bancaria</h3>
              <p className="feature-card__desc">
                Validación estricta y protección de tus transacciones para que operes con total tranquilidad.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-card__icon">
                <PaymentsOutlined sx={{ fontSize: 28 }} />
              </div>
              <h3 className="feature-card__title">Cero Costos Ocultos</h3>
              <p className="feature-card__desc">
                Abrí tu cuenta gratis sin costos de mantenimiento ni cargos mensuales sorpresa.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-card__icon">
                <ReceiptLong sx={{ fontSize: 28 }} />
              </div>
              <h3 className="feature-card__title">Historial Completo</h3>
              <p className="feature-card__desc">
                Revisá tus movimientos, filtrá por tipo de operación y fecha en tiempo real.
              </p>
            </div>
          </div>
        </section>

        {/* ── How it works Steps ───────────────────────────────────── */}
        <section id="como-funciona" className="steps-section">
          <div className="section-header">
            <span className="section-tag">Paso a paso</span>
            <h2 className="section-title">Empezá a operar en 3 simples pasos</h2>
            <p className="section-subtitle">
              Crear tu cuenta toma menos de un minuto. Sin papeles ni demoras.
            </p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-card__number">01</div>
              <h3 className="step-card__title">Creá tu cuenta</h3>
              <p className="step-card__desc">
                Completá tus datos básicos en el formulario de registro y accedé a tu cuenta al instante.
              </p>
            </div>

            <div className="step-card">
              <div className="step-card__number">02</div>
              <h3 className="step-card__title">Ingresá dinero</h3>
              <p className="step-card__desc">
                Realizá depósitos directamente a tu cuenta con acreditación en el acto.
              </p>
            </div>

            <div className="step-card">
              <div className="step-card__number">03</div>
              <h3 className="step-card__title">Transferí sin límites</h3>
              <p className="step-card__desc">
                Enviá dinero a quien quieras usando Alias o CVU de 22 dígitos las 24 horas del día.
              </p>
            </div>
          </div>
        </section>

        {/* ── Bottom CTA Banner ────────────────────────────────────── */}
        <section className="cta-banner-section">
          <div className="cta-banner">
            <h2 className="cta-banner__title">¿Listo para transformar tus finanzas?</h2>
            <p className="cta-banner__subtitle">
              Sumate a DigitalArs y disfrutá de una billetera digital diseñada para darte el control total de tus pesos argentinos.
            </p>
            <button
              id="bottom-cta-btn"
              className="btn btn--primary"
              style={{ fontSize: "1.05rem", padding: "16px 36px" }}
              onClick={() => navigate("/auth")}
            >
              Crear mi cuenta gratis
              <ArrowForward sx={{ fontSize: 20 }} />
            </button>
          </div>
        </section>

        {/* ── Footer ───────────────────────────────────────────────── */}
        <footer className="landing-footer">
          <p>
            © {new Date().getFullYear()}{" "}
            <strong style={{ color: "rgba(255,255,255,0.7)" }}>DigitalArs</strong>
            &nbsp;·&nbsp; Todos los derechos reservados
            &nbsp;·&nbsp; <a href="#beneficios">Beneficios</a>
            &nbsp;·&nbsp; <a href="#como-funciona">Cómo Funciona</a>
            &nbsp;·&nbsp; <a href="#seguridad">Seguridad</a>
          </p>
        </footer>
      </main>
    </>
  );
}

export default LandingPage;
