/* ==========================================================
   Asistente virtual del Colegio Santa Isabel de Hungría
   ----------------------------------------------------------
   Funciona con el HTML del chatbot que ya existe en las
   páginas (.chatbot-toggle, #chatbot-panel, .chatbot-opciones,
   .chatbot-form, etc.). Se carga DESPUÉS de script.js y
   reemplaza su lógica del asistente para evitar que se
   dupliquen los eventos.

   Para cambiar una respuesta, editá el objeto RESPUESTAS
   más abajo. Cada respuesta es una lista de líneas; cada línea
   es un texto o una lista de partes: "texto" o { t: "texto", h: "enlace" }.
   ========================================================== */

(function () {
  "use strict";

  if (window.__asistenteColegio) return;
  window.__asistenteColegio = true;

  /* ---------- Datos del colegio ---------- */
  var MAPA =
    "https://www.google.com/maps/search/?api=1&query=Capital+Leguiz%C3%B3n+857+Salta+Argentina";

  var TEL1 = { t: "387 421-2110", h: "tel:+543874212110" };
  var TEL2 = { t: "387 502-2838", h: "tel:+543875022838" };
  var CORREO = {
    t: "colsantaisabeldehungria@gmail.com",
    h: "mailto:colsantaisabeldehungria@gmail.com"
  };

  var LINEAS_CONTACTO = [
    ["Teléfonos: ", TEL1, " / ", TEL2],
    ["Correo: ", CORREO]
  ];

  var LINEAS_HORARIOS = [
    "Lunes a miércoles: 7:30 a 12:30 h",
    "Jueves: 7:30 a 16:00 h",
    "Viernes: 7:00 a 12:00 h",
    "Sábado y domingo: cerrado"
  ];

  /* ---------- Respuestas ---------- */
  var RESPUESTAS = {
    inscripciones: [
      "Para consultar por inscripciones, comunicate directamente con el colegio:"
    ]
      .concat(LINEAS_CONTACTO)
      .concat([[{ t: "Ver horarios de atención", h: "contacto.html#horarios" }]]),

    niveles: [
      "El colegio tiene nivel inicial, nivel primario y nivel secundario, con orientación en informática.",
      [{ t: "Ver niveles educativos", h: "niveles.html" }]
    ],

    informatica: [
      "El colegio tiene orientación en informática: acerca a los estudiantes al mundo de la tecnología.",
      [{ t: "Conocer la propuesta", h: "niveles.html#informatica" }],
      "Para más detalles, comunicate con el colegio."
    ],

    horarios: ["Horarios de atención:"]
      .concat(LINEAS_HORARIOS),

    contacto: [
      "Podés comunicarte con el colegio por estos medios:",
      "Dirección: Capital Leguizamón 857, Salta, Argentina"
    ]
      .concat(LINEAS_CONTACTO)
      .concat([[{ t: "Ir a la página de Contacto", h: "contacto.html" }]]),

    ubicacion: [
      "Estamos en Capital Leguizamón 857, Salta, Argentina.",
      [{ t: "Ver en el mapa", h: MAPA }]
    ],

    novedades: [
      "Los comunicados, actividades y avisos se publican en la sección Novedades.",
      [{ t: "Ver novedades", h: "noticias.html" }]
    ],

    identidad: [
      "Podés conocer la identidad, los valores y la historia de Santa Isabel de Hungría en la sección La institución.",
      [{ t: "Ir a La institución", h: "institucion.html" }]
    ],

    saludo: [
      "¡Hola! Puedo ayudarte con inscripciones, niveles, horarios y datos de contacto. ¿Sobre qué querés consultar?"
    ],

    gracias: ["¡De nada! Si necesitás algo más, escribime."],

    desconocida: [
      "No tengo esa información. Para una consulta puntual, comunicate con el colegio:"
    ]
      .concat(LINEAS_CONTACTO)
      .concat([[{ t: "Ver horarios de atención", h: "contacto.html#horarios" }]])
  };

  /* Palabras que activan cada tema (se comparan sin tildes ni mayúsculas) */
  var TEMAS = [
    ["inscripciones", ["inscrip", "inscrib", "matricul", "vacante", "anotar", "ingres", "admision"]],
    ["informatica", ["informatic", "computacion", "programacion", "tecnolog", "sistemas", "orientacion"]],
    ["niveles", ["nivel", "inicial", "primari", "secundari", "jardin", "propuesta"]],
    ["horarios", ["hora", "atienden", "atencion", "abren", "abierto", "cierran", "cerrado"]],
    ["ubicacion", ["direccion", "ubicacion", "ubicad", "donde", "queda", "mapa", "llegar", "domicilio", "calle"]],
    ["contacto", ["contact", "telefon", "llamar", "celular", "correo", "mail", "comunicar", "comunico", "whatsapp", "numero"]],
    ["novedades", ["novedad", "noticia", "comunicado", "aviso", "actividad", "evento"]],
    ["identidad", ["santa isabel", "historia", "fundad", "valores", "identidad", "institucion", "quien fue"]],
    ["gracias", ["gracias", "chau", "adios", "listo"]],
    ["saludo", ["hola", "buen dia", "buenas", "buenos"]]
  ];

  /* ---------- Utilidades ---------- */
  function normalizar(texto) {
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, " ");
  }

  function detectarTema(texto) {
    var limpio = " " + normalizar(texto) + " ";
    var mejor = null;
    var mejorPuntos = 0;

    TEMAS.forEach(function (par) {
      var puntos = 0;

      par[1].forEach(function (clave) {
        if (limpio.indexOf(" " + clave) !== -1) puntos++;
      });

      if (puntos > mejorPuntos) {
        mejor = par[0];
        mejorPuntos = puntos;
      }
    });

    return mejor || "desconocida";
  }

  function esExterno(url) {
    return /^https?:/.test(url);
  }

  function crearParte(parte) {
    if (typeof parte === "string") {
      return document.createTextNode(parte);
    }

    var enlace = document.createElement("a");
    enlace.textContent = parte.t;
    enlace.href = parte.h;

    if (esExterno(parte.h)) {
      enlace.target = "_blank";
      enlace.rel = "noopener noreferrer";
    }

    return enlace;
  }

  /* ---------- Elementos de la página ---------- */
  var panel = document.getElementById("chatbot-panel");
  var toggle = document.querySelector(".chatbot-toggle");

  if (!panel || !toggle) return;

  /* Reemplazamos los elementos por copias limpias: así se
     descartan los eventos que haya puesto script.js */
  function limpiar(elemento) {
    if (!elemento || !elemento.parentNode) return elemento;
    var copia = elemento.cloneNode(true);
    elemento.parentNode.replaceChild(copia, elemento);
    return copia;
  }

  toggle = limpiar(toggle);
  var cerrar = limpiar(panel.querySelector(".chatbot-cerrar"));
  var opciones = limpiar(panel.querySelector(".chatbot-opciones"));
  var formulario = limpiar(panel.querySelector(".chatbot-form"));
  var mensajes = panel.querySelector(".chatbot-mensajes");
  var entrada = formulario ? formulario.querySelector("input") : null;

  if (!cerrar || !opciones || !formulario || !mensajes || !entrada) return;

  /* Estilos mínimos para lo que style.css pueda no tener.
     Se agregan al principio del <head> para que style.css tenga prioridad. */
  var estilo = document.createElement("style");
  estilo.textContent =
    ".chatbot-mensajes .mensaje-usuario{margin-left:auto;background:#6d1028;color:#fff;}" +
    ".chatbot-mensajes .mensaje-escribiendo{opacity:.7;font-style:italic;}" +
    ".chatbot-mensajes .mensaje a{color:inherit;font-weight:700;text-decoration:underline;}";
  document.head.insertBefore(estilo, document.head.firstChild);

  var sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Abrir y cerrar ---------- */
  function abrir() {
    panel.hidden = false;
    toggle.setAttribute("aria-expanded", "true");

    if (window.matchMedia("(hover: hover)").matches) {
      entrada.focus();
    }
  }

  function cerrarPanel() {
    panel.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    toggle.focus();
  }

  toggle.addEventListener("click", function (evento) {
    evento.stopPropagation();

    if (panel.hidden) {
      abrir();
    } else {
      cerrarPanel();
    }
  });

  cerrar.addEventListener("click", function (evento) {
    evento.stopPropagation();
    cerrarPanel();
  });

  panel.addEventListener("keydown", function (evento) {
    if (evento.key === "Escape" && !panel.hidden) {
      evento.stopPropagation();
      cerrarPanel();
    }
  });

  /* ---------- Mensajes ---------- */
  function bajar() {
    mensajes.scrollTop = mensajes.scrollHeight;
  }

  function agregarUsuario(texto) {
    var p = document.createElement("p");
    p.className = "mensaje mensaje-usuario";
    p.textContent = texto;
    mensajes.appendChild(p);
    bajar();
  }

  function agregarBot(lineas) {
    var p = document.createElement("p");
    p.className = "mensaje mensaje-bot";

    lineas.forEach(function (linea, i) {
      if (i > 0) p.appendChild(document.createElement("br"));

      if (Array.isArray(linea)) {
        linea.forEach(function (parte) {
          p.appendChild(crearParte(parte));
        });
      } else {
        p.appendChild(document.createTextNode(linea));
      }
    });

    mensajes.appendChild(p);
    bajar();
  }

  function responder(tema) {
    var lineas = RESPUESTAS[tema] || RESPUESTAS.desconocida;

    if (sinMovimiento) {
      agregarBot(lineas);
      return;
    }

    var escribiendo = document.createElement("p");
    escribiendo.className = "mensaje mensaje-bot mensaje-escribiendo";
    escribiendo.textContent = "Escribiendo…";
    mensajes.appendChild(escribiendo);
    bajar();

    setTimeout(function () {
      if (escribiendo.parentNode) escribiendo.parentNode.removeChild(escribiendo);
      agregarBot(lineas);
    }, 450);
  }

  /* ---------- Botones de temas ---------- */
  opciones.addEventListener("click", function (evento) {
    var boton = evento.target.closest("button[data-pregunta]");
    if (!boton) return;

    evento.stopPropagation();

    var tema = boton.getAttribute("data-pregunta");
    agregarUsuario(boton.textContent.trim());
    responder(RESPUESTAS[tema] ? tema : detectarTema(boton.textContent));
  });

  /* ---------- Escribir una consulta ---------- */
  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();
    evento.stopPropagation();

    var texto = entrada.value.trim();
    if (!texto) return;

    agregarUsuario(texto);
    entrada.value = "";
    responder(detectarTema(texto));
  });
})();
