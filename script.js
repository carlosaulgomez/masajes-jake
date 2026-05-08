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
const therapy = document.querySelector("#therapy");
const date = document.querySelector("#date");

const businessWhatsapp = "56954147874";

const businessSchedule = {
  openDays: [2, 3, 4, 5],
  openDayText: "martes a viernes",
  hoursText: "10:00 a 19:30",
  sameDayLeadMinutes: 45,
  blockedDates: [],
};

const services = [
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

let selectedSlot = "";
let availabilityTimer;

function getTodayValue() {
  const today = new Date();
  const timezoneOffset = today.getTimezoneOffset() * 60000;
  return new Date(today.getTime() - timezoneOffset).toISOString().split("T")[0];
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

  therapyGrid.innerHTML = `
    <article class="therapy-feature">
      <span>${featuredService.number}</span>
      <h3>${featuredService.name}</h3>
      <p>${featuredService.description}</p>
      <dl>
        <div>
          <dt>${featuredService.duration}</dt>
          <dd>${featuredService.price}</dd>
        </div>
        <div>
          <dt>Presion</dt>
          <dd>${featuredService.pressure}</dd>
        </div>
      </dl>
    </article>
    <div class="therapy-list">
      ${restServices
        .map(
          (service) => `
            <article>
              <span>${service.number}</span>
              <h3>${service.name}</h3>
              <p>${service.description}</p>
              <strong>${service.duration} · ${service.price}</strong>
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
    renderClosedAvailability(
      `Jacqueline atiende de ${businessSchedule.openDayText}, ${businessSchedule.hoursText}.`
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
    return `Jacqueline atiende de ${businessSchedule.openDayText}, ${businessSchedule.hoursText}.`;
  }

  if (!getAvailableSlots(service, date.value).includes(selectedSlot)) {
    return "Elige uno de los horarios disponibles antes de enviar.";
  }

  return "";
}

renderServices();
date.min = getTodayValue();
renderEmptyAvailability();
updateHeroAvailability();

menuToggle.addEventListener("click", toggleMenu);
mobileMenu.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    closeMenu();
  }
});

window.addEventListener("resize", closeMenuOnDesktop);

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
