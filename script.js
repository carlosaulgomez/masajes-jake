const body = document.body;
const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector("#mobileMenu");
const therapyGrid = document.querySelector("#therapyGrid");
const bookingForm = document.querySelector(".booking-form");
const availability = document.querySelector("#availability");
const formStatus = document.querySelector("#formStatus");
const whatsappFallback = document.querySelector("#whatsappFallback");
const whatsappLink = document.querySelector("#whatsappLink");
const availabilitySummary = document.querySelector("#availabilitySummary");
const availabilityDetail = document.querySelector("#availabilityDetail");
const sheetStatus = document.querySelector("#sheetStatus");
const testimonialGrid = document.querySelector("#testimonialGrid");
const faqList = document.querySelector("#faqList");
const structuredData = document.querySelector("#structuredData");
const mapsLink = document.querySelector("#mapsLink");
const mapFrame = document.querySelector("#mapFrame");
const therapy = document.querySelector("#therapy");
const date = document.querySelector("#date");
const whatsappFloat = document.querySelector(".whatsapp-float");
const footerContact = document.querySelector("#footerContact");

let businessWhatsapp = "56954147874";
const therapySheetId = "1ZiHZxN6T--3K_1-y2gDpLgWsBndSYxG65mOX7sfbp58";
const therapySheetGid = "0";

const optionalSheetNames = {
  config: "Config",
  blocks: "Bloqueos",
  testimonials: "Testimonios",
  faq: "FAQ",
};

let businessSchedule = {
  openDays: [2, 3, 4, 5],
  openDayText: "martes a viernes",
  hoursText: "10:00 a 19:30",
  sameDayLeadMinutes: 45,
  blockedDates: [],
  blockedReasons: {},
  opens: "10:00",
  closes: "19:30",
};

const businessInfo = {
  name: "Masajes Jacqueline",
  address: "Pasaje Tome, Peñaflor",
  areaServed: "Peñaflor, Region Metropolitana, Chile",
  phoneText: "+56 9 5414 7874",
  mapQuery: "Pasaje Tome, Peñaflor, Chile",
};

const fallbackServices = [
  {
    id: "desbloqueo-cervical",
    number: "01",
    name: "Desbloqueo cervical",
    duration: "80 min",
    price: "CLP 54.000",
    pressure: "Media a firme",
    description:
      "Trabajo profundo en trapecio, mandibula y base del craneo para descargar pantallas, bruxismo y tension acumulada.",
    slots: ["10:30", "15:00", "18:30"],
    featured: true,
  },
  {
    id: "drenaje-linfatico",
    number: "02",
    name: "Drenaje linfatico",
    duration: "50 min",
    price: "CLP 42.000",
    pressure: "Suave",
    description: "Maniobras suaves, respiracion guiada y pausa final para piernas pesadas.",
    slots: ["10:00", "13:00", "17:00"],
  },
  {
    id: "piedras-tibias",
    number: "03",
    name: "Piedras tibias",
    duration: "80 min",
    price: "CLP 58.000",
    pressure: "Media",
    description: "Calor localizado y masaje envolvente para soltar espalda baja y caderas.",
    slots: ["11:00", "16:00"],
  },
  {
    id: "ritual-jacqueline",
    number: "04",
    name: "Ritual Jacqueline",
    duration: "110 min",
    price: "CLP 72.000",
    pressure: "Suave a media",
    description: "Aromaterapia, masaje integral y descanso guiado para bajar revoluciones.",
    slots: ["12:00", "18:00"],
  },
];

const fallbackTestimonials = [
  {
    name: "Martina Rivas",
    location: "Providencia",
    text: "Ajustaron la presion sin hacerme hablar de mas. Sali liviana y sin esa niebla de oficina.",
  },
  {
    name: "Camila Soto",
    location: "Peñaflor",
    text: "Llegue con el cuello duro por semanas y al otro dia pude moverme sin esa puntada.",
  },
  {
    name: "Daniela Muñoz",
    location: "Talagante",
    text: "El drenaje fue suave, ordenado y muy respetuoso. Me explicaron lo justo y pude descansar.",
  },
];

const fallbackFaqs = [
  {
    question: "Como reservo una hora?",
    answer: "Elige terapia, fecha y horario en el formulario. Al enviar, WhatsApp se abre con el mensaje listo para confirmar.",
  },
  {
    question: "Que pasa si tengo una lesion o embarazo?",
    answer: "Indicalo en el comentario antes de enviar. Jacqueline confirma si la terapia es adecuada o si conviene ajustar la sesion.",
  },
  {
    question: "Puedo pedir una presion especifica?",
    answer: "Si. Puedes elegir suave, media o firme, y durante la sesion se ajusta por zona segun tolerancia.",
  },
  {
    question: "Donde atiende?",
    answer: "La atencion es en Pasaje Tome, Peñaflor. La direccion se confirma por WhatsApp al reservar.",
  },
];

let services = [...fallbackServices];
let testimonials = [...fallbackTestimonials];
let faqs = [...fallbackFaqs];
let selectedSlot = "";
let availabilityTimer;
let sheetRequestId = 0;

function getTodayValue() {
  const today = new Date();
  const timezoneOffset = today.getTimezoneOffset() * 60000;
  return new Date(today.getTime() - timezoneOffset).toISOString().split("T")[0];
}

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function slugify(value) {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isTruthy(value) {
  return ["1", "si", "sí", "true", "yes", "x"].includes(normalizeText(value));
}

function isInactive(value) {
  return ["0", "no", "false", "inactivo"].includes(normalizeText(value));
}

function getCellValues(row) {
  return (row.c || []).map((cell) => (cell && cell.v != null ? String(cell.v).trim() : ""));
}

function escapeHTML(value) {
  return String(value || "").replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

function parseSheetRecords(response) {
  if (!response || response.status !== "ok" || !response.table || !response.table.rows.length) {
    throw new Error("La planilla no devolvio filas validas.");
  }

  const rows = response.table.rows.map(getCellValues);
  const headers = rows[0].map(normalizeText);
  const records = rows.slice(1).map((row) =>
    headers.reduce((record, header, index) => {
      record[header] = row[index] || "";
      return record;
    }, {})
  );

  return records;
}

function parseServicesRecords(records) {
  const parsedServices = records
    .map((record, index) => {
      if (isInactive(record.activo)) {
        return null;
      }

      const name = record.nombre;
      const slots = String(record.horarios || "")
        .split(/[|,;]/)
        .map((slot) => slot.trim())
        .filter((slot) => /^\d{1,2}:\d{2}$/.test(slot));

      if (!name || !slots.length) {
        return null;
      }

      return {
        id: record.id || slugify(name),
        number: String(index + 1).padStart(2, "0"),
        name,
        duration: record.duracion || "50 min",
        price: record.precio || "Consultar",
        pressure: record.presion || "A convenir",
        description: record.descripcion || "Sesion personalizada segun necesidad del cuerpo.",
        slots,
        featured: isTruthy(record.destacado),
      };
    })
    .filter(Boolean);

  if (!parsedServices.length) {
    throw new Error("La planilla no tiene terapias activas con horarios.");
  }

  if (!parsedServices.some((service) => service.featured)) {
    parsedServices[0].featured = true;
  }

  return parsedServices;
}

function parseTestimonialsRecords(records) {
  return records
    .filter((record) => !isInactive(record.activo))
    .map((record) => ({
      name: record.nombre || record.name || "Paciente",
      location: record.sector || record.ubicacion || record.location || "",
      text: record.texto || record.testimonio || record.opinion || "",
    }))
    .filter((testimonial) => testimonial.text);
}

function parseFaqRecords(records) {
  return records
    .filter((record) => !isInactive(record.activo))
    .map((record) => ({
      question: record.pregunta || record.question || "",
      answer: record.respuesta || record.answer || "",
    }))
    .filter((faq) => faq.question && faq.answer);
}

function normalizeDateValue(value) {
  const rawValue = String(value || "").trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(rawValue)) {
    return rawValue;
  }

  const [day, month, year] = rawValue.split(/[/-]/).map((part) => part.trim());
  if (day && month && year && year.length === 4) {
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  return "";
}

function loadSheetRecords({ gid, sheetName }) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    const handler = `__mjSheetLoaded${(sheetRequestId += 1)}`;
    const tqx = encodeURIComponent(`out:json;responseHandler:${handler}`);
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("La planilla demoro demasiado en responder."));
    }, 6000);

    function cleanup() {
      window.clearTimeout(timeout);
      delete window[handler];
      script.remove();
    }

    window[handler] = (response) => {
      try {
        const records = parseSheetRecords(response);
        cleanup();
        resolve(records);
      } catch (error) {
        cleanup();
        reject(error);
      }
    };

    script.onerror = () => {
      cleanup();
      reject(new Error("No se pudo cargar la hoja solicitada."));
    };

    const sheetSelector = gid
      ? `gid=${encodeURIComponent(gid)}`
      : `sheet=${encodeURIComponent(sheetName)}`;
    script.src = `https://docs.google.com/spreadsheets/d/${therapySheetId}/gviz/tq?tqx=${tqx}&${sheetSelector}`;
    document.head.append(script);
  });
}

function loadSheetServices() {
  return loadSheetRecords({ gid: therapySheetGid }).then(parseServicesRecords);
}

function loadOptionalSheet(sheetName) {
  return loadSheetRecords({ sheetName }).catch((error) => {
    console.info(`Hoja opcional "${sheetName}" no disponible.`, error.message);
    return [];
  });
}

function setSheetStatus(message, state = "loading") {
  sheetStatus.textContent = message;
  sheetStatus.dataset.state = state;
}

function parseOpenDays(value) {
  const dayMap = {
    domingo: 0,
    lunes: 1,
    martes: 2,
    miercoles: 3,
    jueves: 4,
    viernes: 5,
    sabado: 6,
  };

  const days = String(value || "")
    .split(/[|,;]/)
    .map((day) => normalizeText(day))
    .map((day) => (dayMap[day] != null ? dayMap[day] : Number(day)))
    .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6);

  return days.length ? days : businessSchedule.openDays;
}

function getConfigValue(records, key) {
  const normalizedKey = normalizeText(key);
  const found = records.find((record) =>
    [record.clave, record.key, record.campo, record.nombre].some((value) => normalizeText(value) === normalizedKey)
  );

  return found ? found.valor || found.value || found.contenido || "" : "";
}

function applyConfig(records) {
  if (!records.length) {
    return;
  }

  const openDays = getConfigValue(records, "dias_atencion");
  const openDayText = getConfigValue(records, "dias_texto");
  const opens = getConfigValue(records, "horario_inicio");
  const closes = getConfigValue(records, "horario_fin");
  const hoursText = getConfigValue(records, "horario_texto");
  const leadMinutes = Number(getConfigValue(records, "margen_minutos"));
  const configuredWhatsapp = getConfigValue(records, "whatsapp");
  const configuredPhone = getConfigValue(records, "telefono");
  const configuredAddress = getConfigValue(records, "direccion");
  const configuredMapQuery = getConfigValue(records, "mapa_query");

  businessSchedule = {
    ...businessSchedule,
    openDays: openDays ? parseOpenDays(openDays) : businessSchedule.openDays,
    openDayText: openDayText || openDays || businessSchedule.openDayText,
    opens: opens || businessSchedule.opens,
    closes: closes || businessSchedule.closes,
    sameDayLeadMinutes: Number.isFinite(leadMinutes) && leadMinutes >= 0 ? leadMinutes : businessSchedule.sameDayLeadMinutes,
  };
  businessSchedule.hoursText = hoursText || `${businessSchedule.opens} a ${businessSchedule.closes}`;

  if (configuredWhatsapp) {
    businessWhatsapp = configuredWhatsapp.replace(/\D/g, "");
  }

  if (configuredPhone) {
    businessInfo.phoneText = configuredPhone;
  }

  if (configuredAddress) {
    businessInfo.address = configuredAddress;
    businessInfo.mapQuery = configuredMapQuery || `${configuredAddress}, Chile`;
  }

  if (configuredMapQuery) {
    businessInfo.mapQuery = configuredMapQuery;
  }

  updateContactLinks();
}

function applyBlockedDates(records) {
  const blockedReasons = {};
  const blockedDates = records
    .filter((record) => !isInactive(record.activo))
    .map((record) => {
      const dateValue = normalizeDateValue(record.fecha || record.date || record.dia);
      if (dateValue) {
        blockedReasons[dateValue] = record.motivo || record.reason || "Agenda bloqueada para ese dia.";
      }
      return dateValue;
    })
    .filter(Boolean);

  businessSchedule = {
    ...businessSchedule,
    blockedDates,
    blockedReasons,
  };
}

function updateContactLinks() {
  const quickMessage = encodeURIComponent("Hola Jacqueline, quiero consultar por una sesion de masajes.");
  const whatsappUrl = `https://wa.me/${businessWhatsapp}?text=${quickMessage}`;
  const mapSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(businessInfo.mapQuery)}`;
  const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(businessInfo.mapQuery)}&output=embed`;

  whatsappFloat.href = whatsappUrl;
  mapsLink.href = mapSearchUrl;
  mapFrame.src = mapEmbedUrl;
  footerContact.textContent = `${businessInfo.address} · ${businessInfo.phoneText}`;
}

function renderTestimonials(nextTestimonials = testimonials) {
  testimonials = nextTestimonials.length ? nextTestimonials : [...fallbackTestimonials];
  testimonialGrid.innerHTML = testimonials
    .map(
      (testimonial) => `
        <article class="testimonial-card">
          <p>"${escapeHTML(testimonial.text)}"</p>
          <strong>${escapeHTML(testimonial.name)}</strong>
          ${testimonial.location ? `<span>${escapeHTML(testimonial.location)}</span>` : ""}
        </article>
      `
    )
    .join("");
}

function renderFaqs(nextFaqs = faqs) {
  faqs = nextFaqs.length ? nextFaqs : [...fallbackFaqs];
  faqList.innerHTML = faqs
    .map(
      (faq, index) => `
        <details ${index === 0 ? "open" : ""}>
          <summary>${escapeHTML(faq.question)}</summary>
          <p>${escapeHTML(faq.answer)}</p>
        </details>
      `
    )
    .join("");
}

function updateStructuredData() {
  const businessData = {
    "@context": "https://schema.org",
    "@type": "HealthAndBeautyBusiness",
    name: businessInfo.name,
    description: "Masajes terapeuticos, drenaje linfatico, piedras tibias y sesiones de relajacion en Peñaflor.",
    telephone: `+${businessWhatsapp}`,
    priceRange: services.map((service) => service.price).join(" / "),
    address: {
      "@type": "PostalAddress",
      streetAddress: businessInfo.address,
      addressLocality: "Peñaflor",
      addressCountry: "CL",
    },
    areaServed: businessInfo.areaServed,
    openingHoursSpecification: businessSchedule.openDays.map((day) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][day],
      opens: businessSchedule.opens,
      closes: businessSchedule.closes,
    })),
    contactPoint: {
      "@type": "ContactPoint",
      telephone: `+${businessWhatsapp}`,
      contactType: "reservas por WhatsApp",
    },
    makesOffer: services.map((service) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: service.name,
        description: service.description,
      },
      priceCurrency: "CLP",
      price: service.price.replace(/\D/g, ""),
    })),
  };

  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  structuredData.textContent = JSON.stringify([businessData, faqData], null, 2);
}

function applyServices(nextServices, source = "local") {
  const shouldRefreshAvailability = Boolean(therapy.value && date.value);
  services = nextServices.length ? nextServices : [...fallbackServices];
  body.dataset.therapySource = source;
  body.dataset.therapyCount = String(services.length);
  renderServices();
  if (shouldRefreshAvailability) {
    updateAvailability();
  } else {
    renderEmptyAvailability();
  }
  updateHeroAvailability();
  updateStructuredData();

  console.info(
    source === "sheet" ? "Terapias cargadas desde Google Sheets." : "Terapias locales cargadas como respaldo.",
    { source, count: services.length, names: services.map((service) => service.name) }
  );
}

function getSelectedService() {
  return services.find((service) => service.id === therapy.value);
}

function getDateDay(value) {
  return new Date(`${value}T12:00:00`).getDay();
}

function getTimeInMinutes(value) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function isToday(value) {
  return value === getTodayValue();
}

function addDays(value, amount) {
  const nextDate = new Date(`${value}T12:00:00`);
  nextDate.setDate(nextDate.getDate() + amount);
  return nextDate.toISOString().split("T")[0];
}

function isOpenDate(value) {
  if (!value || value < getTodayValue()) {
    return false;
  }

  return (
    businessSchedule.openDays.includes(getDateDay(value)) &&
    !businessSchedule.blockedDates.includes(value)
  );
}

function getBlockedReason(value) {
  return businessSchedule.blockedReasons[value] || "";
}

function getUniqueSlotsForDate(value) {
  return [...new Set(services.flatMap((service) => getAvailableSlots(service, value)))].sort();
}

function getAvailableSlots(service, value) {
  if (!service || !isOpenDate(value)) {
    return [];
  }

  if (!isToday(value)) {
    return service.slots;
  }

  const now = new Date();
  const minimumTime = now.getHours() * 60 + now.getMinutes() + businessSchedule.sameDayLeadMinutes;
  return service.slots.filter((slot) => getTimeInMinutes(slot) >= minimumTime);
}

function updateHeroAvailability() {
  const todayValue = getTodayValue();
  const todaySlots = getUniqueSlotsForDate(todayValue);

  if (todaySlots.length) {
    availabilitySummary.textContent = `${todaySlots.length} horarios disponibles hoy`;
    availabilityDetail.textContent = `${businessSchedule.openDayText}, ${businessSchedule.hoursText}`;
    return;
  }

  for (let dayOffset = 1; dayOffset <= 14; dayOffset += 1) {
    const nextValue = addDays(todayValue, dayOffset);
    const nextSlots = getUniqueSlotsForDate(nextValue);

    if (nextSlots.length) {
      availabilitySummary.textContent = "Proximo dia disponible";
      availabilityDetail.textContent = `${formatDateForMessage(nextValue)} · ${businessSchedule.hoursText}`;
      return;
    }
  }

  availabilitySummary.textContent = "Agenda por confirmar";
  availabilityDetail.textContent = `Atencion de ${businessSchedule.openDayText}, ${businessSchedule.hoursText}`;
}

function renderServices() {
  const featuredService = services.find((service) => service.featured) || services[0];
  const restServices = services.filter((service) => service.id !== featuredService.id);
  const previousTherapy = therapy.value;

  therapyGrid.innerHTML = `
    <article class="therapy-feature">
      <span>${escapeHTML(featuredService.number)}</span>
      <h3>${escapeHTML(featuredService.name)}</h3>
      <p>${escapeHTML(featuredService.description)}</p>
      <dl>
        <div>
          <dt>${escapeHTML(featuredService.duration)}</dt>
          <dd>${escapeHTML(featuredService.price)}</dd>
        </div>
        <div>
          <dt>Presion</dt>
          <dd>${escapeHTML(featuredService.pressure)}</dd>
        </div>
      </dl>
      <button class="secondary-button on-dark reserve-service" type="button" data-service-id="${escapeHTML(featuredService.id)}">
        Reservar esta terapia
      </button>
    </article>
    <div class="therapy-list">
      ${restServices
        .map(
          (service) => `
            <article>
              <span>${escapeHTML(service.number)}</span>
              <h3>${escapeHTML(service.name)}</h3>
              <p>${escapeHTML(service.description)}</p>
              <div class="therapy-actions">
                <strong>${escapeHTML(service.duration)} · ${escapeHTML(service.price)}</strong>
                <button class="secondary-button reserve-service" type="button" data-service-id="${escapeHTML(service.id)}">
                  Reservar
                </button>
              </div>
            </article>
          `
        )
        .join("")}
    </div>
  `;

  therapy.innerHTML = '<option value="">Seleccionar</option>';

  services.forEach((service) => {
    const option = document.createElement("option");
    option.value = service.id;
    option.textContent = `${service.name} · ${service.duration}`;
    therapy.append(option);
  });

  if (services.some((service) => service.id === previousTherapy)) {
    therapy.value = previousTherapy;
  }
}

function toggleMenu() {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Abrir menu" : "Cerrar menu");
  mobileMenu.hidden = isOpen;
  body.classList.toggle("menu-open", !isOpen);
}

function closeMenu() {
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Abrir menu");
  mobileMenu.hidden = true;
  body.classList.remove("menu-open");
}

function closeMenuOnDesktop() {
  if (window.innerWidth > 920) {
    closeMenu();
  }
}

function renderEmptyAvailability() {
  selectedSlot = "";
  availability.innerHTML = `
    <div class="empty-state">
      <strong>Elige terapia y fecha</strong>
      <small>Atencion de ${businessSchedule.openDayText}, ${businessSchedule.hoursText}.</small>
    </div>
  `;
}

function renderLoadingAvailability() {
  availability.innerHTML = `
    <div class="empty-state">
      <strong>Buscando horarios</strong>
      <small>Revisando espacios disponibles para esa terapia.</small>
      <div class="loading-bar" aria-hidden="true"></div>
    </div>
  `;
}

function renderClosedAvailability(message) {
  selectedSlot = "";
  availability.innerHTML = `
    <div class="empty-state">
      <strong>Sin horarios disponibles</strong>
      <small>${message}</small>
    </div>
  `;
}

function renderSlots() {
  const service = getSelectedService();
  const slots = getAvailableSlots(service, date.value);
  selectedSlot = "";

  if (!isOpenDate(date.value)) {
    const blockedReason = getBlockedReason(date.value);
    renderClosedAvailability(
      blockedReason || `Jacqueline atiende de ${businessSchedule.openDayText}, ${businessSchedule.hoursText}.`
    );
    return;
  }

  if (!slots.length) {
    renderClosedAvailability(
      isToday(date.value)
        ? "Para hoy ya no quedan horarios futuros. Elige otra fecha disponible."
        : "No hay horarios cargados para esa terapia en la fecha elegida."
    );
    return;
  }

  availability.innerHTML = `
    <div class="slots">
      <strong>${slots.length} horarios disponibles</strong>
      <small>Selecciona uno antes de enviar la solicitud.</small>
      <div class="slot-buttons">
        ${slots
          .map((slot) => `<button type="button" data-slot="${slot}" aria-pressed="false">${slot}</button>`)
          .join("")}
      </div>
    </div>
  `;
}

function updateAvailability() {
  clearTimeout(availabilityTimer);
  formStatus.textContent = "";
  formStatus.className = "form-status";
  whatsappFallback.hidden = true;

  if (!therapy.value || !date.value) {
    renderEmptyAvailability();
    return;
  }

  renderLoadingAvailability();
  availabilityTimer = setTimeout(renderSlots, 420);
}

function setStatus(message, type = "success") {
  formStatus.textContent = message;
  formStatus.className = type === "error" ? "form-status error" : "form-status";
}

function formatDateForMessage(value) {
  return new Intl.DateTimeFormat("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

function buildWhatsappUrl(formData) {
  const service = getSelectedService();
  const name = formData.get("name").trim();
  const phone = formData.get("phone").trim();
  const concern = formData.get("concern").trim();
  const pressure = formData.get("pressure");
  const notes = formData.get("notes").trim();
  const messageLines = [
    "Hola Jacqueline, quiero reservar una sesion de masajes.",
    "",
    `Nombre: ${name}`,
    `Terapia: ${service.name}`,
    `Duracion: ${service.duration}`,
    `Valor: ${service.price}`,
    `Fecha: ${formatDateForMessage(date.value)}`,
    `Hora: ${selectedSlot}`,
  ];

  if (phone) {
    messageLines.push(`Telefono: ${phone}`);
  }

  if (concern) {
    messageLines.push(`Zona o motivo: ${concern}`);
  }

  if (pressure) {
    messageLines.push(`Presion preferida: ${pressure}`);
  }

  if (notes) {
    messageLines.push(`Comentario: ${notes}`);
  }

  messageLines.push("", "Quedo atenta/o a la confirmacion. Muchas gracias.");

  return `https://wa.me/${businessWhatsapp}?text=${encodeURIComponent(messageLines.join("\n"))}`;
}

function validateForm(formData) {
  const name = formData.get("name").trim();
  const service = getSelectedService();

  if (!name) {
    return "Escribe tu nombre para poder confirmar la reserva.";
  }

  if (!service || !date.value) {
    return "Selecciona terapia y fecha para ver horarios disponibles.";
  }

  if (date.value < getTodayValue()) {
    return "Selecciona una fecha desde hoy en adelante.";
  }

  if (!isOpenDate(date.value)) {
    return getBlockedReason(date.value) || `Jacqueline atiende de ${businessSchedule.openDayText}, ${businessSchedule.hoursText}.`;
  }

  if (!getAvailableSlots(service, date.value).includes(selectedSlot)) {
    return "Elige uno de los horarios disponibles antes de enviar.";
  }

  return "";
}

async function hydrateRemoteData() {
  setSheetStatus("Actualizando terapias desde la planilla...", "loading");

  loadSheetServices()
    .then((sheetServices) => {
      applyServices(sheetServices, "sheet");
      setSheetStatus(`Terapias actualizadas desde planilla: ${sheetServices.length}.`, "ready");
    })
    .catch((error) => {
      setSheetStatus("Usando terapias locales. La planilla no respondio.", "fallback");
      console.warn("Usando terapias locales por respaldo:", error.message);
    });

  const [configResult, blocksResult, testimonialsResult, faqResult] = await Promise.allSettled([
    loadOptionalSheet(optionalSheetNames.config),
    loadOptionalSheet(optionalSheetNames.blocks),
    loadOptionalSheet(optionalSheetNames.testimonials),
    loadOptionalSheet(optionalSheetNames.faq),
  ]);

  if (configResult.status === "fulfilled") {
    applyConfig(configResult.value);
  }

  if (blocksResult.status === "fulfilled") {
    applyBlockedDates(blocksResult.value);
  }

  if (testimonialsResult.status === "fulfilled" && testimonialsResult.value.length) {
    renderTestimonials(parseTestimonialsRecords(testimonialsResult.value));
  }

  if (faqResult.status === "fulfilled" && faqResult.value.length) {
    renderFaqs(parseFaqRecords(faqResult.value));
  }

  updateHeroAvailability();
  updateStructuredData();

  if (therapy.value && date.value) {
    updateAvailability();
  }
}

date.min = getTodayValue();
applyServices([...fallbackServices]);
renderTestimonials([...fallbackTestimonials]);
renderFaqs([...fallbackFaqs]);
updateContactLinks();
hydrateRemoteData();

menuToggle.addEventListener("click", toggleMenu);
mobileMenu.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    closeMenu();
  }
});

window.addEventListener("resize", closeMenuOnDesktop);

therapyGrid.addEventListener("click", (event) => {
  const reserveButton = event.target.closest("[data-service-id]");
  if (!reserveButton) {
    return;
  }

  therapy.value = reserveButton.dataset.serviceId;
  updateAvailability();
  document.querySelector("#agenda").scrollIntoView({ behavior: "smooth", block: "start" });
  window.setTimeout(() => date.focus(), 450);
});

availability.addEventListener("click", (event) => {
  const slotButton = event.target.closest("[data-slot]");
  if (!slotButton) {
    return;
  }

  selectedSlot = slotButton.dataset.slot;
  availability.querySelectorAll("[data-slot]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button === slotButton));
  });
});

therapy.addEventListener("change", updateAvailability);
date.addEventListener("change", updateAvailability);

bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(bookingForm);
  const error = validateForm(formData);
  whatsappFallback.hidden = true;

  if (error) {
    setStatus(error, "error");
    return;
  }

  const whatsappUrl = buildWhatsappUrl(formData);
  const whatsappWindow = window.open(whatsappUrl, "_blank");
  const firstName = formData.get("name").trim().split(" ")[0];

  whatsappLink.href = whatsappUrl;
  whatsappFallback.hidden = false;
  setStatus(`${firstName}, tu mensaje esta listo para enviarse por WhatsApp.`);

  if (!whatsappWindow) {
    setStatus("WhatsApp quedo listo. Usa el enlace de abajo para abrirlo.", "error");
    return;
  }

  whatsappWindow.opener = null;
  bookingForm.reset();
  renderEmptyAvailability();
});

const revealItems = document.querySelectorAll("[data-reveal]");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}
