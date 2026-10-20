/**
 * AuraBackground — Animated fluid background inspired by the portfolio.
 *
 * Props:
 *  - variant: 'animated' (default) | 'static'
 *    - 'animated': Full GIF + noise overlay (for landing/auth)
 *    - 'static': Static dark gradient with subtle accent glow (for dashboard)
 */
function AuraBackground({ variant = "animated" }) {
  if (variant === "static") {
    return (
      <>
        {/* Static dark gradient background */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            width: "100%",
            height: "100%",
            zIndex: 0,
            pointerEvents: "none",
            background:
              "radial-gradient(ellipse at 20% 20%, rgba(56, 189, 248, 0.06) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(14, 165, 233, 0.04) 0%, transparent 50%), linear-gradient(180deg, #030303 0%, #0a0a0f 50%, #030303 100%)",
          }}
        />
        {/* Subtle noise */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            width: "100vw",
            height: "100vh",
            pointerEvents: "none",
            zIndex: 1,
            opacity: 0.02,
            mixBlendMode: "overlay",
            backgroundRepeat: "repeat",
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
          }}
        />
      </>
    );
  }

  return (
    <>
      {/* Animated aura GIF background */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          pointerEvents: "none",
          backgroundImage: "url('/portfoliobg.gif')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 0.5,
          filter: "blur(2px) saturate(0.7)",
        }}
      />

      {/* Fine-grain noise overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          pointerEvents: "none",
          zIndex: 1,
          opacity: 0.035,
          mixBlendMode: "overlay",
          backgroundRepeat: "repeat",
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
        }}
      />
    </>
  );
}

export default AuraBackground;
