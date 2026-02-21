"use strict";

const homeCategoryGrid = document.getElementById("homeCategoryGrid");
const homeStatus = document.getElementById("homeStatus");
const dashboardBody = document.getElementById("dashboardBody");
const dashboardSummary = document.getElementById("dashboardSummary");
const SCORE_STORE_KEY = "quiz_universe_scores";

function setStatus(message) {
  homeStatus.textContent = message || "";
}

function renderCategories(categories) {
  homeCategoryGrid.innerHTML = "";

  categories.forEach((genre) => {
    const link = document.createElement("a");
    link.className = "genre-link";
    link.href = genre.page;
    link.innerHTML = `
      <span class="genre-badge">${genre.badge}</span>
      <span class="genre-name">${genre.name}</span>
      <span class="genre-subtitle">${genre.subtitle}</span>
    `;
    homeCategoryGrid.appendChild(link);
  });
}

function getSavedScores() {
  try {
    const raw = localStorage.getItem(SCORE_STORE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    return {};
  }
}

function renderDashboard() {
  if (!dashboardBody || !dashboardSummary) return;
  const scores = getSavedScores();
  const entries = Object.entries(scores).sort((a, b) => {
    const aTime = new Date(a[1].lastPlayed || 0).getTime();
    const bTime = new Date(b[1].lastPlayed || 0).getTime();
    return bTime - aTime;
  });

  if (entries.length === 0) {
    dashboardBody.innerHTML = `<tr><td colspan="6">No quiz attempts yet. Complete a quiz to see stats here.</td></tr>`;
    dashboardSummary.textContent = "Total attempts: 0";
    return;
  }

  let totalAttempts = 0;
  dashboardBody.innerHTML = entries.map(([key, item]) => {
    totalAttempts += Number(item.attempts || 0);
    const last = item.lastPlayed ? new Date(item.lastPlayed).toLocaleString() : "-";
    return `
      <tr>
        <td>${item.genreName || "-"}</td>
        <td>${item.subcategory || "-"}</td>
        <td>${item.attempts || 0}</td>
        <td>${item.bestScore || 0}</td>
        <td>${item.bestPercent || 0}%</td>
        <td>${last}</td>
      </tr>
    `;
  }).join("");

  dashboardSummary.textContent = `Total attempts: ${totalAttempts}`;
}

async function bootstrapHome() {
  try {
    const data = Array.isArray(window.CATEGORY_DATA) ? window.CATEGORY_DATA : [];
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("No categories found.");
    }

    const valid = data.filter((item) =>
      item &&
      typeof item.name === "string" &&
      typeof item.subtitle === "string" &&
      typeof item.badge === "string" &&
      typeof item.page === "string"
    );

    if (valid.length === 0) {
      throw new Error("Category file has no valid entries.");
    }

    renderCategories(valid);
    renderDashboard();
    setStatus("");
  } catch (error) {
    setStatus("Could not load categories from JavaScript data.");
  }
}

bootstrapHome();
