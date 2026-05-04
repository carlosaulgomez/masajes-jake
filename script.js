const body = document.body;
const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector("#mobileMenu");
const revealItems = document.querySelectorAll("[data-reveal]");
const bookingForm = document.querySelector(".booking-form");
const availability = document.querySelector("#availability");
const formStatus = document.querySelector("#formStatus");
const whatsappFallback = document.querySelector("#whatsappFallback");
const whatsappLink = document.querySelector("#whatsappLink");
const therapy = document.querySelector("#therapy");
const date = document.querySelector("#date");

const businessWhatsapp = "56954147874";

let selectedSlot = "";
let availabilityTimer;

const slotMap = {
  "Desbloqueo cervical": ["10:30", "15:00", "18:30"],
  "Drenaje linfatico": ["09:30", "13:00", "17:00"],
  "Piedras tibias": ["11:00", "16:00"],
  "Ritual Jacqueline": ["12:00", "18:00"],
};

function getTodayValue() {
  const today = new Date();
  const timezoneOffset = today.getTimezoneOffset() * 60000;
  return new Date(today.getTime() - timezoneOffset).toISOString().split("T")[0];
}

date.min = getTodayValue();

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
      <small>Mostraremos horarios sugeridos antes de enviar.</small>
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

function renderSlots() {
  const therapyName = therapy.value;
  const chosenDate = new Date(`${date.value}T12:00:00`);
  const day = chosenDate.getDay();
  const slots = day === 0 ? [] : slotMap[therapyName] || [];

  if (!slots.length) {
    selectedSlot = "";
    availability.innerHTML = `
      <div class="empty-state">
        <strong>Sin cupos para esa fecha</strong>
        <small>Prueba con un dia de semana o elige otra terapia.</small>
      </div>
    `;
    return;
  }

  availability.innerHTML = `
    <div class="slots">
      <strong>${slots.length} horarios sugeridos</strong>
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
  availabilityTimer = setTimeout(renderSlots, 620);
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
  const name = formData.get("name").trim();
  const phone = formData.get("phone").trim();
  const messageLines = [
    "Hola Jacqueline, quiero reservar una sesion de masajes.",
    "",
    `Nombre: ${name}`,
    `Terapia: ${therapy.value}`,
    `Fecha: ${formatDateForMessage(date.value)}`,
    `Hora: ${selectedSlot}`,
  ];

  if (phone) {
    messageLines.push(`Telefono: ${phone}`);
  }

  messageLines.push("", "Quedo atenta/o a la confirmacion. Muchas gracias.");

  return `https://wa.me/${businessWhatsapp}?text=${encodeURIComponent(messageLines.join("\n"))}`;
}

function validateForm(formData) {
  const name = formData.get("name").trim();

  if (!name) {
    return "Escribe tu nombre para poder confirmar la reserva.";
  }

  if (!therapy.value || !date.value) {
    return "Selecciona terapia y fecha para ver horarios disponibles.";
  }

  if (date.value < getTodayValue()) {
    return "Selecciona una fecha desde hoy en adelante.";
  }

  if (!selectedSlot) {
    return "Elige uno de los horarios sugeridos antes de enviar.";
  }

  return "";
}

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
