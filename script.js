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

function highlight(text, query) {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.replace(new RegExp(`(${escaped})`, "gi"), "<mark>$1</mark>");
}

function collectBioData() {
  return bioCards.map((card) => {
    const heading = card.querySelector("h3");
    const year = card.querySelector(".archive-year");
    const paragraphs = Array.from(card.querySelectorAll("p"));
    const facts = Array.from(card.querySelectorAll(".fact-list li"));
    return {
      name: heading ? heading.textContent.trim() : "",
      year: year ? year.textContent.trim() : "",
      summary: paragraphs[0] ? paragraphs[0].textContent.trim() : "",
      facts: facts.map((li) => li.textContent.trim()),
      fullText: card.textContent.toLowerCase(),
      card
    };
  });
}

function renderSpotlight(matches, query) {
  if (!spotlightList || !spotlightStatus) return;

  if (!query) {
    spotlightStatus.textContent = "Введите фамилию капитана, название судна или важную деталь биографии.";
    spotlightList.innerHTML = "";
    return;
  }

  if (matches.length === 0) {
    spotlightStatus.textContent = `По запросу «${query}» ничего не найдено`;
    spotlightList.innerHTML = "";
    return;
  }

  spotlightStatus.textContent = `Найдено: ${matches.length} ${matches.length === 1 ? "биография" : matches.length < 5 ? "биографии" : "биографий"}`;

  spotlightList.innerHTML = matches.map((bio) => {
    const factsHtml = bio.facts.length
      ? `<ul class="spotlight-facts">${bio.facts.map((f) => `<li>${highlight(f, query)}</li>`).join("")}</ul>`
      : "";
    return `
      <article class="archive-result-card">
        <div class="archive-result-meta">${highlight(bio.year, query)}</div>
        <h4>${highlight(bio.name, query)}</h4>
        <p>${highlight(bio.summary, query)}</p>
        ${factsHtml}
      </article>`;
  }).join("");

  spotlightList.querySelectorAll(".archive-result-card").forEach((el, index) => {
    el.style.cursor = "pointer";
    el.addEventListener("click", () => {
      const target = matches[index]?.card;
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        target.classList.add("is-highlighted");
        setTimeout(() => target.classList.remove("is-highlighted"), 1800);
      }
    });
  });
}

if (bioSearchInput && bioSearchClear && bioSearchStatus && bioCards.length) {
  const bios = collectBioData();

  const searchBios = () => {
    const query = bioSearchInput.value.trim();
    const q = query.toLowerCase();
    let visibleCount = 0;
    const matches = [];

    bios.forEach((bio) => {
      const matched = !q || bio.fullText.includes(q);
      bio.card.classList.toggle("is-hidden", !matched);
      if (matched) {
        visibleCount += 1;
        if (q) matches.push(bio);
      }
    });

    if (!q) {
      bioSearchStatus.textContent = "Показаны все биографии";
    } else if (visibleCount === 0) {
      bioSearchStatus.textContent = `По запросу «${query}» ничего не найдено`;
    } else {
      bioSearchStatus.textContent = `Найдено биографий: ${visibleCount}`;
    }

    renderSpotlight(matches, query);
  };

  bioSearchInput.addEventListener("input", searchBios);
  bioSearchClear.addEventListener("click", () => {
    bioSearchInput.value = "";
    searchBios();
    bioSearchInput.focus();
  });
}
