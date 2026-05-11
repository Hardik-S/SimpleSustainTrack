const form = document.getElementById("footprint-form");
const distanceInput = document.getElementById("distance");
const unitSelect = document.getElementById("unit");
const modeSelect = document.getElementById("mode");
const result = document.getElementById("result");
const impactLabel = document.getElementById("impact-level");
const historyList = document.getElementById("history-list");
const historyEmpty = document.getElementById("history-empty");
const newsList = document.getElementById("news-list");

const STORAGE_KEY = "legacy-modern-simple-sustain-track-runs";
const KM_TO_MILES = 0.621371;
const EMISSION_FACTORS = {
  legacy: 0.1,
  car: 0.12,
  bus: 0.08,
  train: 0.04,
  bike: 0.0,
};
const LEAVES = Array.from(document.querySelectorAll(".leaf"));

const newsHeadlines = [
  "Grid decarbonization targets are accelerating in North America.",
  "Transit and active transport policy updates landed in multiple provinces.",
  "Household energy audits can cut footprint by 10-15% in a single season.",
  "Plant-forward meals are increasingly used in corporate climate commitments.",
  "Short supply chains remain high leverage for carbon reduction.",
];

function seedHeadlines() {
  newsList.innerHTML = "";
  newsHeadlines.forEach((line, index) => {
    const item = document.createElement("li");
    item.className = "news-item";
    item.textContent = `${index + 1}. ${line}`;
    newsList.appendChild(item);
  });
}

function toDecimalNumber(raw) {
  const trimmed = String(raw).trim();
  if (trimmed === "") {
    return NaN;
  }
  return Number(trimmed);
}

function resetAnimation() {
  LEAVES.forEach((leaf) => {
    leaf.classList.remove("falling");
  });
}

function animateFallingLeaves(footprintKg) {
  resetAnimation();

  let numFalling = 0;
  if (footprintKg >= 50) {
    numFalling = 6;
  } else if (footprintKg >= 10) {
    numFalling = 3;
  }

  for (let i = 0; i < numFalling && i < LEAVES.length; i++) {
    const rotation = Math.random() * 180 - 90;
    LEAVES[i].style.setProperty("--rotation", `${rotation}deg`);
    LEAVES[i].classList.add("falling");
  }
}

function loadHistory() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveHistory(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(-30)));
}

function renderHistory(entries) {
  historyList.innerHTML = "";
  if (!entries.length) {
    historyEmpty.textContent = "No runs saved yet.";
    historyEmpty.hidden = false;
    return;
  }

  historyEmpty.hidden = true;
  entries.slice().reverse().forEach((entry) => {
    const item = document.createElement("li");
    item.className = "history-item";

    const text = document.createElement("div");
    text.textContent = `${entry.distance} ${entry.unit} by ${entry.mode}: ${entry.footprintKg.toFixed(2)} kg CO2`;

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = `${entry.timestamp} · km equivalent ${entry.kmDistance.toFixed(2)} km`;

    item.append(text, meta);
    historyList.appendChild(item);
  });
}

function currentHistory() {
  const entries = loadHistory();
  const distance = toDecimalNumber(distanceInput.value);
  if (Number.isNaN(distance) || distance < 0) {
    return entries;
  }

  const kmDistance =
    unitSelect.value === "mi" ? distance * (1 / KM_TO_MILES) : distance;
  const factor = EMISSION_FACTORS[modeSelect.value] ?? EMISSION_FACTORS.legacy;
  const footprintKg = kmDistance * factor;

  const modeLabel = modeSelect.value === "legacy" ? "legacy default (0.1)" : modeSelect.value;
  const unitLabel = unitSelect.value === "mi" ? "mi" : "km";

  return [
    {
      timestamp: new Date().toISOString(),
      distance,
      unit: unitLabel,
      mode: modeLabel,
      kmDistance,
      footprintKg,
    },
    ...entries,
  ];
}

function formatImpact(footprintKg) {
  if (footprintKg < 10) {
    return "Low impact";
  }
  if (footprintKg < 50) {
    return "Moderate impact";
  }
  return "High impact";
}

function runCalculation(event) {
  event?.preventDefault();
  const distance = toDecimalNumber(distanceInput.value);
  const kmDistance =
    unitSelect.value === "mi"
      ? distance * (1 / KM_TO_MILES)
      : distance;

  if (distanceInput.value.trim() === "" || Number.isNaN(distance) || distance < 0) {
    result.textContent = "Enter a valid non-negative distance in kilometres.";
    impactLabel.textContent = "Impact: invalid input.";
    animateFallingLeaves(0);
    return;
  }

  const factor = EMISSION_FACTORS[modeSelect.value] ?? EMISSION_FACTORS.legacy;
  const footprintKg = kmDistance * factor;
  const rounded = Number(footprintKg.toFixed(2));
  result.textContent = `Carbon Footprint: ${rounded.toFixed(2)} kg CO2`;
  impactLabel.textContent = `Impact: ${formatImpact(footprintKg)} (mode factor ${factor.toFixed(2)})`;

  animateFallingLeaves(footprintKg);

  const entry = {
    timestamp: new Date().toLocaleString(),
    distance,
    unit: unitSelect.value === "mi" ? "mi" : "km",
    mode: modeSelect.value === "legacy" ? "legacy default (0.1)" : modeSelect.value,
    kmDistance,
    footprintKg,
  };

  const entries = [entry, ...loadHistory()].slice(0, 30);
  saveHistory(entries);
  renderHistory(entries);
}

function setPresetDistance(value) {
  distanceInput.value = value;
  runCalculation();
}

function clearHistory() {
  localStorage.removeItem(STORAGE_KEY);
  renderHistory([]);
}

function exportHistory() {
  const entries = loadHistory();
  if (!entries.length) {
    return;
  }

  const payload = {
    exportedAt: new Date().toISOString(),
    entries,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "simple-sustain-track-runs.json";
  anchor.click();
  URL.revokeObjectURL(url);
}

function bootstrap() {
  seedHeadlines();
  form.addEventListener("submit", runCalculation);
  document.querySelectorAll("[data-preset]").forEach((button) => {
    button.addEventListener("click", () => setPresetDistance(button.dataset.preset));
  });
  document.getElementById("clear-history").addEventListener("click", clearHistory);
  document.getElementById("download-history").addEventListener("click", exportHistory);

  renderHistory(loadHistory());
}

bootstrap();

