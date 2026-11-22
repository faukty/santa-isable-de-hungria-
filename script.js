document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  document.documentElement.classList.add("js-ready");

  // =====================================
  // VIDEO DE PORTADA Y MOVIMIENTO REDUCIDO
  // =====================================
  const videoPortada = document.querySelector(".video-fondo");
  const preferenciaMovimientoReducido = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  if (videoPortada) {
    const actualizarVideo = () => {
      if (preferenciaMovimientoReducido.matches) {
        videoPortada.pause();
        return;
      }

      const reproduccion = videoPortada.play();
      if (reproduccion && typeof reproduccion.catch === "function") {
        reproduccion.catch(() => {
          // La imagen de portada queda como respaldo.
        });
      }
    };

    actualizarVideo();

    if (typeof preferenciaMovimientoReducido.addEventListener === "function") {
      preferenciaMovimientoReducido.addEventListener("change", actualizarVideo);
    } else if (typeof preferenciaMovimientoReducido.addListener === "function") {
      // Compatibilidad con navegadores antiguos.
      preferenciaMovimientoReducido.addListener(actualizarVideo);
    }
  }

  // =====================================
  // WHATSAPP: SOLO SE CREA CON UN NÚMERO VÁLIDO
  // =====================================
  const numeroConfigurado = String(
    window.CONFIG_SITIO?.whatsapp || ""
  ).replace(/\D/g, "");

  if (/^\d{10,15}$/.test(numeroConfigurado)) {
    // Evita crear el botón dos veces si el script se carga accidentalmente más de una vez.
    if (!document.querySelector(".whatsapp-flotante")) {
      const enlaceWhatsApp = document.createElement("a");
      enlaceWhatsApp.className = "whatsapp-flotante";
      enlaceWhatsApp.href = `https://wa.me/${numeroConfigurado}`;
      enlaceWhatsApp.target = "_blank";
      enlaceWhatsApp.rel = "noopener noreferrer";
      enlaceWhatsApp.setAttribute(
        "aria-label",
        "Contactar al colegio por WhatsApp"
      );
      enlaceWhatsApp.innerHTML = '<span aria-hidden="true">WA</span>';
      document.body.appendChild(enlaceWhatsApp);
    }
  }

  // =====================================
  // AÑO AUTOMÁTICO
  // =====================================
  document.querySelectorAll(".anio-actual").forEach((elemento) => {
    elemento.textContent = new Date().getFullYear();
  });

  // =====================================
  // MENÚ PARA CELULARES
  // =====================================
  const botonMenu = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".menu, .navegacion, #menu");

  if (botonMenu && menu) {
    const cerrarMenu = () => {
      menu.classList.remove("abierto");
      botonMenu.setAttribute("aria-expanded", "false");
      botonMenu.setAttribute("aria-label", "Abrir menú");
    };

    botonMenu.addEventListener("click", () => {
      const abierto = menu.classList.toggle("abierto");
      botonMenu.setAttribute("aria-expanded", String(abierto));
      botonMenu.setAttribute(
        "aria-label",
        abierto ? "Cerrar menú" : "Abrir menú"
      );
    });

    menu.querySelectorAll("a").forEach((enlace) => {
      enlace.addEventListener("click", cerrarMenu);
    });

    document.addEventListener("keydown", (evento) => {
      if (evento.key === "Escape") cerrarMenu();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 720) cerrarMenu();
    });
  }

  // =====================================
  // ANIMACIONES AL DESPLAZARSE
  // =====================================
  const elementosRevelar = document.querySelectorAll(".revelar");

  if ("IntersectionObserver" in window) {
    const observador = new IntersectionObserver(
      (entradas, observer) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) {
            entrada.target.classList.add("visible");
            observer.unobserve(entrada.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    elementosRevelar.forEach((elemento) => {
      observador.observe(elemento);
    });
  } else {
    elementosRevelar.forEach((elemento) => {
      elemento.classList.add("visible");
    });
  }

  // =====================================
  // BOTÓN VOLVER ARRIBA
  // =====================================
  const botonArriba = document.querySelector(".volver-arriba");

  if (botonArriba) {
    const actualizarBoton = () => {
      botonArriba.classList.toggle("visible", window.scrollY > 400);
    };

    window.addEventListener("scroll", actualizarBoton, { passive: true });
    actualizarBoton();

    botonArriba.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: preferenciaMovimientoReducido.matches ? "auto" : "smooth"
      });
    });
  }

  // =====================================
  // GALERÍA AMPLIABLE
  // =====================================
  const visor = document.querySelector(".visor-imagen");
  const visorImagen = visor?.querySelector("img");
  const visorTexto = visor?.querySelector("p");
  const visorCerrar = visor?.querySelector(".visor-cerrar");

  document.querySelectorAll(".foto-galeria").forEach((foto) => {
    foto.addEventListener("click", () => {
      if (!visor || !visorImagen || !visorTexto) return;

      const imagen = foto.dataset.imagen;
      if (!imagen) return;

      visorImagen.src = imagen;
      visorImagen.alt = foto.dataset.descripcion || "";
      visorTexto.textContent = foto.dataset.descripcion || "";

      if (typeof visor.showModal === "function") {
        visor.showModal();
      } else {
        visor.setAttribute("open", "");
      }
    });
  });

  if (visorCerrar && visor) {
    visorCerrar.addEventListener("click", () => {
      if (typeof visor.close === "function") {
        visor.close();
      } else {
        visor.removeAttribute("open");
      }
    });
  }

  if (visor) {
    visor.addEventListener("click", (evento) => {
      if (evento.target === visor) {
        if (typeof visor.close === "function") {
          visor.close();
        } else {
          visor.removeAttribute("open");
        }
      }
    });
  }
});
