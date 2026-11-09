/* Pão com Vini — site institucional
   Tudo que o cliente pode querer trocar fica em CONFIG. */
const CONFIG = {
  whatsapp: "5541997166194",
  instagram: "https://instagram.com/paocomvini_gastronomia",
  delivery: "https://oia.99app.com/dlp9/Njf0Ga",
  // cardápio digital (MenuFlix). TROCAR pelo domínio definitivo quando houver.
  menu: "https://web-production-42b5bf.up.railway.app/paocomvini/cardapio",
  // TROCAR: preencher quando o cliente confirmar. Vazio = esconde o bloco de endereço.
  address: "",
  mapsUrl: "",
  timezone: "America/Sao_Paulo",
  // 0 = domingo … 6 = sábado. close "24:00" = meia-noite.
  hours: {
    0: { open: "16:00", close: "23:00" },
    1: { open: "11:00", close: "24:00" },
    2: { open: "11:00", close: "24:00" },
    3: { open: "11:00", close: "24:00" },
    4: { open: "11:00", close: "24:00" },
    5: { open: "11:00", close: "24:00" },
    6: { open: "11:00", close: "24:00" },
  },
  // reservas: última chegada X min antes de fechar; antecedência mínima em horas
  lastArrivalBeforeCloseMin: 90,
  minAdvanceHours: 3,
};

const DAY_NAMES = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const toMin = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
const fmt = (min) => `${String(Math.floor(min / 60) % 24).padStart(2, "0")}h${min % 60 ? String(min % 60).padStart(2, "0") : ""}`;
const wa = (text) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;

/** Data/hora "agora" no fuso do restaurante (independe do fuso do visitante). */
function nowInTz() {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: CONFIG.timezone,
      weekday: "short",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(new Date())
      .map((p) => [p.type, p.value]),
  );
  const dow = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(parts.weekday);
  return { dow, minutes: Number(parts.hour) * 60 + Number(parts.minute), iso: `${parts.year}-${parts.month}-${parts.day}` };
}

/* ---------- links ---------- */
function wireLinks() {
  const map = {
    menu: CONFIG.menu,
    delivery: CONFIG.delivery,
    instagram: CONFIG.instagram,
    whatsapp: wa("Olá! Vim pelo site do Pão com Vini."),
    "whatsapp-lunch": wa("Olá! Quero encomendar marmita para hoje."),
    maps: CONFIG.mapsUrl || "#contato",
  };
  $$("[data-link]").forEach((a) => {
    const url = map[a.dataset.link];
    if (!url) return;
    a.href = url;
    if (/^https?:/.test(url)) {
      a.target = "_blank";
      a.rel = "noopener";
    }
  });
  if (CONFIG.address) {
    const li = $("[data-address]");
    li.hidden = false;
    $("[data-address-text]", li).textContent = CONFIG.address;
  }
  $("[data-year]").textContent = new Date().getFullYear();
}

/* ---------- horários / aberto agora ---------- */
function renderHours() {
  const { dow, minutes } = nowInTz();
  const today = CONFIG.hours[dow];
  const yesterday = CONFIG.hours[(dow + 6) % 7];
  const openNow =
    (today && minutes >= toMin(today.open) && minutes < toMin(today.close)) ||
    (yesterday && toMin(yesterday.close) > 1440 && minutes < toMin(yesterday.close) - 1440);

  const el = $("[data-status]");
  el.classList.add(openNow ? "is-open" : "is-closed");
  let text;
  if (openNow) text = `Aberto agora · até ${fmt(toMin(today.close))}`;
  else if (today && minutes < toMin(today.open)) text = `Fechado · abre hoje às ${fmt(toMin(today.open))}`;
  else {
    const next = (dow + 1) % 7;
    text = `Fechado · abre ${next === (dow + 1) % 7 ? "amanhã" : DAY_NAMES[next]} às ${fmt(toMin(CONFIG.hours[next].open))}`;
  }
  $("[data-status-text]").textContent = text;

  // tabela (seg → dom), agrupando dias iguais
  const order = [1, 2, 3, 4, 5, 6, 0];
  $("[data-hours-table]").innerHTML = order
    .map((d) => {
      const h = CONFIG.hours[d];
      const val = h ? `${fmt(toMin(h.open))} – ${fmt(toMin(h.close))}` : "Fechado";
      return `<li class="${d === dow ? "is-today" : ""}"><span>${DAY_NAMES[d]}${d === dow ? " (hoje)" : ""}</span><span>${val}</span></li>`;
    })
    .join("");
  $("[data-hours-list]").textContent = "Seg a sáb, 11h às 0h · Dom, 16h às 23h";
}

/* ---------- topo ---------- */
function wireNav() {
  const nav = $(".nav");
  const toggle = $(".nav__toggle");
  const links = $("#menu");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 20);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  const close = () => {
    links.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };
  toggle.addEventListener("click", () => {
    const open = !links.classList.contains("is-open");
    links.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  });
  links.addEventListener("click", (e) => e.target.closest("a") && close());
  document.addEventListener("keydown", (e) => e.key === "Escape" && close());
}

/* ---------- entrada animada ---------- */
function wireReveal() {
  const els = $$(".reveal");
  if (!("IntersectionObserver" in window)) return els.forEach((e) => e.classList.add("is-in"));
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          io.unobserve(en.target);
        }
      }),
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
  );
  els.forEach((e) => io.observe(e));
}

/* ---------- reserva ---------- */
function wireReservation() {
  const form = $("#reserva-form");
  const date = form.elements.data;
  const hour = form.elements.hora;
  const phone = form.elements.telefone;
  const err = $(".form__error", form);
  const done = $(".form__done", form);
  const { iso: todayIso } = nowInTz();
  date.min = todayIso;
  const max = new Date();
  max.setMonth(max.getMonth() + 6);
  date.max = max.toISOString().slice(0, 10);

  // máscara simples de telefone BR
  phone.addEventListener("input", () => {
    const d = phone.value.replace(/\D/g, "").slice(0, 11);
    let v = d;
    if (d.length > 2) v = `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length > 7) v = `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
    phone.value = v;
  });

  // horários possíveis conforme o dia escolhido
  date.addEventListener("change", () => {
    hour.innerHTML = "";
    if (!date.value) {
      hour.disabled = true;
      hour.append(new Option("Escolha a data primeiro", ""));
      return;
    }
    const dow = new Date(`${date.value}T12:00:00`).getDay();
    const h = CONFIG.hours[dow];
    const slots = [];
    if (h) {
      const now = nowInTz();
      const earliest = date.value === now.iso ? now.minutes + CONFIG.minAdvanceHours * 60 : 0;
      for (let m = toMin(h.open); m <= toMin(h.close) - CONFIG.lastArrivalBeforeCloseMin; m += 30) {
        if (m >= earliest) slots.push(m);
      }
    }
    if (!slots.length) {
      hour.disabled = true;
      hour.append(new Option(h ? "Sem horários nesse dia, escolha outra data" : "Fechado nesse dia", ""));
      return;
    }
    hour.disabled = false;
    hour.append(new Option("Escolha…", ""));
    slots.forEach((m) => hour.append(new Option(fmt(m).replace(/h$/, "h00"), fmt(m).replace(/h$/, "h00"))));
  });

  const fail = (msg, field) => {
    err.textContent = msg;
    if (field) {
      if (field instanceof RadioNodeList) {
        $(".choice", form).classList.add("is-invalid");
        field[0].focus();
      } else {
        field.setAttribute("aria-invalid", "true");
        field.focus();
      }
    }
    return false;
  };
  form.addEventListener("input", (e) => {
    e.target.removeAttribute?.("aria-invalid");
    if (e.target.name === "formato") $(".choice", form).classList.remove("is-invalid");
    err.textContent = "";
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = form.elements;
    const nome = f.nome.value.trim();
    const tel = f.telefone.value.replace(/\D/g, "");
    const pessoas = Number(f.pessoas.value);
    if (nome.length < 2) return fail("Conta pra gente o seu nome.", f.nome);
    if (tel.length < 10) return fail("Informe um WhatsApp com DDD.", f.telefone);
    if (!f.tipo.value) return fail("Escolha o tipo de evento.", f.tipo);
    if (!f.data.value || f.data.value < todayIso) return fail("Escolha uma data a partir de hoje.", f.data);
    if (!f.hora.value) return fail("Escolha o horário de chegada.", f.hora.disabled ? f.data : f.hora);
    if (!Number.isInteger(pessoas) || pessoas < 2 || pessoas > 300) return fail("Informe quantas pessoas (de 2 a 300).", f.pessoas);
    if (!f.formato.value) return fail("Escolha como prefere o espaço.", f.formato);

    const [y, m, d] = f.data.value.split("-");
    const dow = DAY_NAMES[new Date(`${f.data.value}T12:00:00`).getDay()].toLowerCase();
    const lines = [
      "Olá! Quero reservar o espaço do Pão com Vini 🍔",
      "",
      `*Nome:* ${nome}`,
      `*WhatsApp:* ${f.telefone.value}`,
      `*Evento:* ${f.tipo.value}`,
      `*Data:* ${d}/${m}/${y} (${dow})`,
      `*Chegada:* ${f.hora.value}`,
      `*Pessoas:* ${pessoas}`,
      `*Formato:* ${f.formato.value}`,
    ];
    const obs = f.obs.value.trim();
    if (obs) lines.push(`*Observações:* ${obs}`);
    lines.push("", "Enviado pelo site.");

    const url = wa(lines.join("\n"));
    $("[data-done-link]", form).href = url;
    done.hidden = false;
    $("h3", done).setAttribute("tabindex", "-1");
    $("h3", done).focus();
    window.open(url, "_blank", "noopener");
  });

  $("[data-reset]", form).addEventListener("click", () => {
    form.reset();
    hour.disabled = true;
    hour.innerHTML = '<option value="">Escolha a data primeiro</option>';
    done.hidden = true;
    form.elements.nome.focus();
  });
}

wireLinks();
renderHours();
wireNav();
wireReveal();
wireReservation();
