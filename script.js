const canvas = document.getElementById("shipScene");
const context = canvas.getContext("2d");

const pointer = {
  x: 0.5,
  y: 0.5,
  active: false
};

const waves = Array.from({ length: 4 }, (_, index) => ({
  amplitude: 8 + index * 4,
  wavelength: 140 + index * 70,
  speed: 0.45 + index * 0.13,
  offset: index * Math.PI * 0.7,
  alpha: 0.15 + index * 0.06
}));

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function lerp(start, end, amount) {
  return start + (end - start) * amount;
}

function drawBackground(width, height) {
  const sky = context.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, "#15384f");
  sky.addColorStop(0.5, "#0d2537");
  sky.addColorStop(1, "#09131d");
  context.fillStyle = sky;
  context.fillRect(0, 0, width, height);

  const glow = context.createRadialGradient(width * 0.52, height * 0.18, 10, width * 0.52, height * 0.18, width * 0.44);
  glow.addColorStop(0, "rgba(248, 232, 195, 0.35)");
  glow.addColorStop(0.4, "rgba(168, 219, 255, 0.12)");
  glow.addColorStop(1, "rgba(7, 20, 31, 0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, width, height);

  for (let i = 0; i < 18; i += 1) {
    const x = (width / 18) * i + ((i % 2) * width) / 40;
    const hillHeight = 70 + (i % 5) * 18;
    context.fillStyle = i % 2 === 0 ? "rgba(5, 19, 30, 0.78)" : "rgba(8, 28, 42, 0.86)";
    context.beginPath();
    context.moveTo(x - 60, height * 0.57);
    context.quadraticCurveTo(x, height * 0.57 - hillHeight, x + 60, height * 0.57);
    context.lineTo(x + 80, height * 0.82);
    context.lineTo(x - 80, height * 0.82);
    context.closePath();
    context.fill();
  }
}

function drawWater(width, height, time) {
  const waterTop = height * 0.66;
  const water = context.createLinearGradient(0, waterTop, 0, height);
  water.addColorStop(0, "rgba(36, 96, 128, 0.75)");
  water.addColorStop(0.45, "rgba(15, 51, 71, 0.94)");
  water.addColorStop(1, "rgba(4, 16, 28, 1)");
  context.fillStyle = water;
  context.fillRect(0, waterTop, width, height - waterTop);

  waves.forEach((wave, index) => {
    context.beginPath();
    context.moveTo(0, waterTop + index * 6);
    for (let x = 0; x <= width; x += 8) {
      const y = waterTop + Math.sin((x / wave.wavelength) + time * wave.speed + wave.offset) * wave.amplitude + index * 5;
      context.lineTo(x, y);
    }
    context.lineTo(width, height);
    context.lineTo(0, height);
    context.closePath();
    context.fillStyle = `rgba(140, 220, 255, ${wave.alpha})`;
    context.fill();
  });
}

function drawShip(width, height, time) {
  const shiftX = (pointer.x - 0.5) * 80;
  const shiftY = (pointer.y - 0.5) * 30;
  const angle = (pointer.x - 0.5) * 0.24;
  const bob = Math.sin(time * 1.7) * 6;

  context.save();
  context.translate(width * 0.52 + shiftX, height * 0.58 + bob + shiftY);
  context.rotate(angle);

  const hullLength = width * 0.44;
  const hullHeight = height * 0.1;

  const hullGradient = context.createLinearGradient(-hullLength * 0.5, 0, hullLength * 0.5, hullHeight);
  hullGradient.addColorStop(0, "#1a2731");
  hullGradient.addColorStop(0.5, "#314553");
  hullGradient.addColorStop(1, "#111c25");

  context.beginPath();
  context.moveTo(-hullLength * 0.48, -hullHeight * 0.08);
  context.lineTo(hullLength * 0.34, -hullHeight * 0.08);
  context.lineTo(hullLength * 0.48, hullHeight * 0.28);
  context.lineTo(hullLength * 0.38, hullHeight * 0.44);
  context.lineTo(-hullLength * 0.52, hullHeight * 0.44);
  context.closePath();
  context.fillStyle = hullGradient;
  context.fill();

  context.strokeStyle = "rgba(196, 226, 241, 0.2)";
  context.lineWidth = 1.5;
  context.stroke();

  context.fillStyle = "rgba(243, 205, 133, 0.12)";
  context.fillRect(-hullLength * 0.46, hullHeight * 0.44, hullLength * 0.82, hullHeight * 0.12);

  context.fillStyle = "#d8e6ef";
  context.fillRect(-hullLength * 0.04, -hullHeight * 0.92, hullLength * 0.2, hullHeight * 0.82);
  context.fillRect(hullLength * 0.02, -hullHeight * 1.38, hullLength * 0.13, hullHeight * 0.46);

  context.fillStyle = "#f16f4a";
  context.fillRect(hullLength * 0.08, -hullHeight * 1.7, hullLength * 0.03, hullHeight * 0.34);

  context.fillStyle = "#243747";
  for (let row = 0; row < 2; row += 1) {
    for (let col = 0; col < 5; col += 1) {
      context.fillRect(
        -hullLength * 0.01 + col * hullLength * 0.036,
        -hullHeight * 0.82 + row * hullHeight * 0.24,
        hullLength * 0.02,
        hullHeight * 0.09
      );
    }
  }

  context.strokeStyle = "#e7f5ff";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(-hullLength * 0.32, -hullHeight * 0.12);
  context.lineTo(hullLength * 0.35, -hullHeight * 0.12);
  context.stroke();

  for (let i = -0.28; i < 0.34; i += 0.07) {
    context.beginPath();
    context.moveTo(hullLength * i, -hullHeight * 0.12);
    context.lineTo(hullLength * i, -hullHeight * 0.38);
    context.stroke();
  }

  context.strokeStyle = "#9ecbe3";
  context.beginPath();
  context.moveTo(hullLength * 0.11, -hullHeight * 1.38);
  context.lineTo(hullLength * 0.11, -hullHeight * 2.2);
  context.stroke();

  context.beginPath();
  context.moveTo(hullLength * 0.11, -hullHeight * 2.18);
  context.lineTo(hullLength * 0.19, -hullHeight * 1.92);
  context.stroke();

  context.fillStyle = "#f4fbff";
  context.beginPath();
  context.arc(hullLength * 0.2, -hullHeight * 1.88, 4, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "rgba(195, 234, 255, 0.1)";
  context.fillRect(-hullLength * 0.5, hullHeight * 0.5, hullLength, hullHeight * 0.18);
  context.restore();
}

function drawMist(width, height, time) {
  for (let index = 0; index < 4; index += 1) {
    const y = height * (0.16 + index * 0.12);
    const drift = ((time * 18) + index * 70) % (width + 260);
    const cloudWidth = 180 + index * 80;
    const gradient = context.createLinearGradient(drift - cloudWidth, y, drift + cloudWidth, y);
    gradient.addColorStop(0, "rgba(255, 255, 255, 0)");
    gradient.addColorStop(0.5, "rgba(210, 235, 248, 0.12)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
    context.fillStyle = gradient;
    context.fillRect(drift - cloudWidth, y - 24, cloudWidth * 2, 48);
  }
}

function render(timeStamp) {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const time = timeStamp * 0.001;

  drawBackground(width, height);
  drawMist(width, height, time);
  drawWater(width, height, time);
  drawShip(width, height, time);

  requestAnimationFrame(render);
}

canvas.addEventListener("pointermove", (event) => {
  const bounds = canvas.getBoundingClientRect();
  pointer.x = (event.clientX - bounds.left) / bounds.width;
  pointer.y = (event.clientY - bounds.top) / bounds.height;
  pointer.active = true;
});

canvas.addEventListener("pointerleave", () => {
  pointer.active = false;
});

window.addEventListener("resize", resizeCanvas);

function animatePointerReset() {
  if (!pointer.active) {
    pointer.x = lerp(pointer.x, 0.5, 0.04);
    pointer.y = lerp(pointer.y, 0.5, 0.04);
  }
  requestAnimationFrame(animatePointerReset);
}

resizeCanvas();
requestAnimationFrame(render);
requestAnimationFrame(animatePointerReset);

const bioSearchInput = document.getElementById("bioSearch");
const bioSearchClear = document.getElementById("bioSearchClear");
const bioSearchStatus = document.getElementById("bioSearchStatus");
const spotlightStatus = document.getElementById("archiveSpotlightStatus");
const spotlightList = document.getElementById("archiveSpotlightList");
const bioCards = Array.from(document.querySelectorAll(".bio-card"));

// ─── Локальная фильтрация карточек ────────────────────────────────────────────

function filterLocalCards(query) {
  let visibleCount = 0;
  bioCards.forEach((card) => {
    const matched = query === "" || card.textContent.toLowerCase().includes(query.toLowerCase());
    card.classList.toggle("is-hidden", !matched);
    if (matched) visibleCount += 1;
  });
  return visibleCount;
}

// ─── AI-поиск через Anthropic API + web_search ────────────────────────────────

let searchDebounceTimer = null;
let currentSearchAbort = null;

async function searchWithAI(query) {
  if (currentSearchAbort) {
    currentSearchAbort.abort();
  }
  currentSearchAbort = new AbortController();
  const signal = currentSearchAbort.signal;

  showSpotlightLoading(query);

  const systemPrompt = `Ты — архивист речного флота реки Лена. Твоя задача — найти и изложить биографическую информацию о речниках, капитанах, механиках, судах Ленского пароходства и связанных с ними людях.

При ответе ВСЕГДА используй инструмент web_search чтобы найти актуальную информацию в интернете, даже если запрос кажется тебе знакомым. Ищи на русском языке.

Ответ верни СТРОГО в формате JSON (без markdown-обёртки, без пояснений за пределами JSON):
{
  "found": true,
  "results": [
    {
      "name": "Полное имя человека или название судна",
      "year": "Год рождения или год постройки судна (только цифры)",
      "summary": "Краткая биография 2-3 предложения",
      "facts": ["Факт 1", "Факт 2", "Факт 3"],
      "source": "Название источника или сайта"
    }
  ],
  "note": "Короткая заметка об источниках поиска (1 предложение)"
}

Если информации нет ни в интернете, ни в твоих знаниях — верни:
{ "found": false, "message": "Объяснение на русском языке" }

Фокус: река Лена, Ленское пароходство, Киренск, речники, капитаны, пароходы, теплоходы, буксиры. Ищи до 3 результатов максимум.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "anthropic-dangerous-direct-browser-ipc": "true"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 1000,
        system: systemPrompt,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: [
          {
            role: "user",
            content: `Найди биографическую информацию о: "${query}". Это может быть капитан, речник, судно или событие связанное с рекой Лена и Ленским пароходством. Обязательно поищи в интернете.`
          }
        ]
      })
    });

    if (signal.aborted) return;

    const data = await response.json();

    if (!response.ok) {
      const errMsg = data?.error?.message || `HTTP ${response.status}`;
      throw new Error(errMsg);
    }

    // Извлекаем текстовый ответ из всех блоков
    const textContent = data.content
      .filter(block => block.type === "text")
      .map(block => block.text)
      .join("");

    // Парсим JSON из ответа
    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Нет JSON в ответе: " + textContent.slice(0, 120));

    const parsed = JSON.parse(jsonMatch[0]);
    renderSpotlightAI(parsed, query);

  } catch (err) {
    if (err.name === "AbortError") return;
    console.error("[AI Search] Ошибка:", err);
    renderSpotlightError(query, err.message);
  }
}

// ─── Отрисовка состояний spotlight ───────────────────────────────────────────

function showSpotlightLoading(query) {
  if (!spotlightStatus || !spotlightList) return;
  spotlightStatus.innerHTML = `<span class="search-spinner"></span> Ищу в интернете: «${query}»…`;
  spotlightList.innerHTML = `
    <div class="ai-loading-card">
      <div class="ai-loading-dots"><span></span><span></span><span></span></div>
      <p>Запрос к архиву и открытым источникам…</p>
    </div>`;
}

function renderSpotlightAI(data, query) {
  if (!spotlightStatus || !spotlightList) return;

  if (!data.found) {
    spotlightStatus.textContent = "Поиск завершён";
    spotlightList.innerHTML = `
      <div class="ai-empty-card">
        <p>По запросу «${query}» информация в открытых источниках не найдена.</p>
        <p class="ai-note">${data.message || ""}</p>
      </div>`;
    return;
  }

  const results = data.results || [];
  spotlightStatus.textContent = `Найдено в интернете: ${results.length} ${results.length === 1 ? "результат" : results.length < 5 ? "результата" : "результатов"}`;

  const noteHtml = data.note
    ? `<p class="ai-search-note">🔍 ${data.note}</p>`
    : "";

  spotlightList.innerHTML = noteHtml + results.map((bio) => {
    const factsHtml = (bio.facts || []).length
      ? `<ul class="spotlight-facts">${bio.facts.map(f => `<li>${f}</li>`).join("")}</ul>`
      : "";
    const sourceHtml = bio.source
      ? `<span class="ai-source-tag">Источник: ${bio.source}</span>`
      : "";

    return `
      <article class="archive-result-card ai-result-card">
        <div class="archive-result-meta ai-badge">
          ${bio.year ? `<span>${bio.year}</span>` : ""}
          <span class="ai-label">Из интернета</span>
        </div>
        <h4>${bio.name || ""}</h4>
        <p>${bio.summary || ""}</p>
        ${factsHtml}
        ${sourceHtml}
      </article>`;
  }).join("");
}

function renderSpotlightError(query, message) {
  if (!spotlightStatus || !spotlightList) return;
  spotlightStatus.textContent = "Ошибка поиска";
  spotlightList.innerHTML = `
    <div class="ai-empty-card">
      <p>Не удалось получить данные из интернета.</p>
      <p class="ai-note">${message}</p>
    </div>`;
}

function resetSpotlight() {
  if (!spotlightStatus || !spotlightList) return;
  spotlightStatus.textContent = "Введите фамилию капитана, название судна или важную деталь биографии, и сайт покажет найденный материал прямо здесь.";
  spotlightList.innerHTML = "";
}

// ─── Инициализация ────────────────────────────────────────────────────────────

if (bioSearchInput && bioSearchClear && bioSearchStatus) {

  bioSearchInput.addEventListener("input", () => {
    const query = bioSearchInput.value.trim();

    // Локальная фильтрация карточек мгновенно
    const localCount = filterLocalCards(query);

    if (query === "") {
      bioSearchStatus.textContent = "Показаны все биографии";
      resetSpotlight();
      clearTimeout(searchDebounceTimer);
      return;
    }

    bioSearchStatus.textContent = localCount > 0
      ? `В архиве: ${localCount} биографий — также ищу в интернете…`
      : "Ищу в интернете…";

    // Запускаем AI-поиск с задержкой чтобы не стрелять на каждую букву
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      searchWithAI(query);
    }, 700);
  });

  bioSearchClear.addEventListener("click", () => {
    bioSearchInput.value = "";
    filterLocalCards("");
    bioSearchStatus.textContent = "Показаны все биографии";
    resetSpotlight();
    clearTimeout(searchDebounceTimer);
    if (currentSearchAbort) currentSearchAbort.abort();
    bioSearchInput.focus();
  });
}