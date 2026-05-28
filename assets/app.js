const state = {
  site: {},
  extensions: [],
  query: "",
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const labels = {
  chromiumCrx: "Baixar CRX",
  chromiumZip: "Baixar ZIP",
  firefoxXpi: "Baixar XPI",
  source: "Código-fonte",
};

const browserNames = {
  chromium: "Chromium",
  chrome: "Chrome",
  edge: "Edge",
  firefox: "Firefox",
};

function formatDate(value) {
  if (!value) return "sem data";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(date);
}

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function extensionMatches(extension, query) {
  if (!query) return true;
  const haystack = [
    extension.name,
    extension.description,
    extension.version,
    ...(extension.tags || []),
    ...(extension.browsers || []),
  ].join(" ");
  return normalize(haystack).includes(normalize(query));
}

function downloadButton(label, url) {
  const a = document.createElement("a");
  a.className = "button primary small";
  a.href = url;
  a.target = "_blank";
  a.rel = "noreferrer";
  a.textContent = label;
  return a;
}

function copyButton(label, value) {
  const wrap = document.createElement("button");
  wrap.className = "button copy small";
  wrap.type = "button";
  wrap.innerHTML = `<span>${label}</span><span>Copiar</span>`;
  wrap.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(value);
      wrap.lastElementChild.textContent = "Copiado";
      setTimeout(() => (wrap.lastElementChild.textContent = "Copiar"), 1400);
    } catch {
      prompt("Copie a URL:", value);
    }
  });
  return wrap;
}

function updateRow(label, url) {
  const div = document.createElement("div");
  div.append(copyButton(label, url));
  const p = document.createElement("p");
  p.className = "update-url";
  p.textContent = url;
  div.append(p);
  return div;
}

function renderCards() {
  const root = $("#cards");
  const empty = $("#emptyState");
  const template = $("#cardTemplate");
  root.innerHTML = "";

  const filtered = state.extensions.filter((extension) => extensionMatches(extension, state.query));
  empty.hidden = filtered.length > 0;

  for (const extension of filtered) {
    const node = template.content.cloneNode(true);
    const card = $(".card", node);
    const icon = $(".card-icon", node);
    const title = $(".card-title", node);
    const version = $(".card-version", node);
    const description = $(".card-description", node);
    const tags = $(".tags", node);
    const downloads = $(".downloads", node);
    const updateList = $(".update-list", node);
    const changelog = $(".changelog", node);

    icon.src = extension.icon || "assets/icon.svg";
    icon.alt = `Ícone de ${extension.name}`;
    title.textContent = extension.name;
    version.textContent = `v${extension.version || "?"} · atualizado em ${formatDate(extension.updated)}`;
    description.textContent = extension.description || "Sem descrição.";

    for (const browser of extension.browsers || []) {
      const span = document.createElement("span");
      span.className = "tag";
      span.textContent = browserNames[browser] || browser;
      tags.append(span);
    }

    for (const tag of extension.tags || []) {
      const span = document.createElement("span");
      span.className = "tag";
      span.textContent = tag;
      tags.append(span);
    }

    const files = extension.downloads || {};
    for (const [key, label] of Object.entries(labels)) {
      if (files[key]) downloads.append(downloadButton(label, files[key]));
    }

    const update = extension.update || {};
    if (update.chromeUpdateUrl) updateList.append(updateRow("Chromium update_url", update.chromeUpdateUrl));
    if (update.firefoxUpdateUrl) updateList.append(updateRow("Firefox update_url", update.firefoxUpdateUrl));
    if (!update.chromeUpdateUrl && !update.firefoxUpdateUrl) {
      $(".updates-box", card).remove();
    }

    for (const item of extension.changelog || []) {
      const li = document.createElement("li");
      li.textContent = item;
      changelog.append(li);
    }
    if (!extension.changelog?.length) $(".changelog-box", card).remove();

    root.append(node);
  }
}

async function loadData() {
  const response = await fetch("data/extensions.json", { cache: "no-store" });
  if (!response.ok) throw new Error("Não foi possível carregar data/extensions.json");
  const data = await response.json();
  state.site = data.site || {};
  state.extensions = data.extensions || [];

  document.title = state.site.title || "Extension Hub";
  $("#siteName").textContent = state.site.title || "Extension Hub";
  $("#heroTitle").textContent = state.site.heroTitle || "Minhas extensões em um lugar só.";
  $("#heroSubtitle").textContent = state.site.subtitle || "Baixe, veja versões e copie URLs de atualização.";
  const repoLink = $("#repoLink");
  if (state.site.repositoryUrl) repoLink.href = state.site.repositoryUrl;
  else repoLink.remove();

  renderCards();
}

$("#searchInput").addEventListener("input", (event) => {
  state.query = event.target.value.trim();
  renderCards();
});

loadData().catch((error) => {
  console.error(error);
  $("#cards").innerHTML = `<article class="card"><h3>Erro ao carregar</h3><p class="muted">${error.message}</p></article>`;
});
