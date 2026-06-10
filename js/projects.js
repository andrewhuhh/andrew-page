import { projects, projectsById } from "../content/projects.js";

const SECTION_IDS = ["about", "work", "fun"];
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let activeProjectId = null;
let listViewScrollY = 0;
let pointerFocusPaused = false;

/** @type {(() => void) | null} */
let resumePointerFocus = null;

/** @type {{ setActiveSection: (id: string) => void } | null} */
let siteApiRef = null;

/**
 * @returns {{ view: "section", id: string } | { view: "project", id: string }}
 */
export function parseRoute() {
  let hash = location.hash.slice(1);
  if (hash.startsWith("/")) {
    hash = hash.slice(1);
  }

  if (!hash) {
    return { view: "section", id: "about" };
  }

  if (hash.startsWith("project/")) {
    return { view: "project", id: hash.slice("project/".length) };
  }

  if (projectsById[hash]) {
    return { view: "project", id: hash };
  }

  if (SECTION_IDS.includes(hash)) {
    return { view: "section", id: hash };
  }

  return { view: "section", id: "about" };
}

export function projectHash(id) {
  return `#/${id}`;
}

export function isProjectRoute() {
  return activeProjectId !== null || parseRoute().view === "project";
}

export function getActiveProjectId() {
  return activeProjectId;
}

export function isPointerFocusPaused() {
  return pointerFocusPaused;
}

function getCategoryLabel(category) {
  return category === "work" ? "work" : "for fun";
}

function renderProjectRow(project) {
  const row = document.createElement("a");
  row.className = "row row--project";
  row.href = projectHash(project.id);
  row.dataset.projectId = project.id;
  row.innerHTML = `
    <span class="row-year">${project.year}</span>
    <span class="row-title">
      ${project.title}
      <i data-lucide="arrow-right" class="arrow" data-stroke-width="1.5" aria-hidden="true"></i>
    </span>
    <span class="row-desc">${project.summary}</span>
  `;
  return row;
}

export function renderProjectLists() {
  const workList = document.querySelector('[data-project-list="work"]');
  const funList = document.querySelector('[data-project-list="fun"]');

  for (const project of projects) {
    const row = renderProjectRow(project);
    if (project.category === "work" && workList) {
      workList.appendChild(row);
    }
    if (project.category === "fun" && funList) {
      funList.appendChild(row);
    }
  }
}

function renderDetailBody(project, container) {
  container.replaceChildren();

  const intro = document.createElement("p");
  intro.className = "project-detail__intro";
  intro.textContent = project.intro;
  container.appendChild(intro);

  for (const paragraph of project.body) {
    const p = document.createElement("p");
    p.textContent = paragraph;
    container.appendChild(p);
  }

  if (project.externalUrl) {
    const link = document.createElement("a");
    link.className = "project-detail__external";
    link.href = project.externalUrl;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.innerHTML = `
      Visit site
      <i data-lucide="arrow-up-right" class="arrow" data-stroke-width="1.5" aria-hidden="true"></i>
    `;
    container.appendChild(link);
  }
}

function getElements() {
  return {
    shell: document.querySelector(".shell"),
    content: document.querySelector(".content"),
    sections: document.querySelectorAll(".section"),
    detail: document.getElementById("project-detail"),
    mobileHeader: document.querySelector(".mobile-header"),
    mobileTitle: document.querySelector(".mobile-header__title"),
    mobileBack: document.querySelector(".mobile-back"),
    detailTitle: document.querySelector(".project-detail__title"),
    detailCategory: document.querySelector(".project-detail__category"),
    detailYear: document.querySelector(".project-detail__year"),
    detailBody: document.querySelector(".project-detail__body"),
  };
}

function setSidebarTitle(title) {
  const introName = document.querySelector(".intro-name");
  if (!introName) {
    return;
  }

  const labelNode = [...introName.childNodes].find((node) => node.nodeType === Node.TEXT_NODE);
  if (!labelNode) {
    return;
  }

  if (!introName.dataset.homeLabel) {
    introName.dataset.homeLabel = labelNode.textContent.trim();
  }

  labelNode.textContent = `${title} `;
}

function resetSidebarTitle() {
  const introName = document.querySelector(".intro-name");
  if (!introName?.dataset.homeLabel) {
    return;
  }

  const labelNode = [...introName.childNodes].find((node) => node.nodeType === Node.TEXT_NODE);
  if (labelNode) {
    labelNode.textContent = `${introName.dataset.homeLabel} `;
  }
}

function setDetailMetadata(project) {
  const { detailTitle, detailCategory, detailYear, detailBody, mobileTitle } = getElements();

  setSidebarTitle(project.title);

  if (detailTitle) {
    detailTitle.textContent = project.title;
  }
  if (detailCategory) {
    detailCategory.textContent = getCategoryLabel(project.category);
  }
  if (detailYear) {
    detailYear.textContent = project.year;
  }
  if (mobileTitle) {
    mobileTitle.textContent = project.title;
  }
  if (detailBody) {
    renderDetailBody(project, detailBody);
  }

  document.title = `${project.title} — Andrew Huang`;
}

function resetDocumentTitle() {
  document.title = "Andrew Huang";
}

function scrollContentToTop() {
  const { content } = getElements();
  if (!content) {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "instant" : "smooth" });
    return;
  }

  const isDesktopPanel = getComputedStyle(content).overflowY === "auto";
  if (isDesktopPanel) {
    content.scrollTo({ top: 0, behavior: prefersReducedMotion ? "instant" : "smooth" });
  } else {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "instant" : "smooth" });
  }
}

function enterDetailView(projectId, { updateHash = true } = {}) {
  const project = projectsById[projectId];
  if (!project) {
    return false;
  }

  const { shell, content, sections, detail, mobileBack } = getElements();

  if (activeProjectId === projectId && detail && !detail.hidden) {
    return true;
  }

  if (!detail || !shell) {
    return false;
  }

  if (activeProjectId === null) {
    listViewScrollY = content?.scrollTop ?? window.scrollY;
  }

  activeProjectId = projectId;
  pointerFocusPaused = true;

  setDetailMetadata(project);
  shell.classList.add("is-project-detail");
  detail.hidden = false;

  sections.forEach((section) => {
    section.classList.remove("is-focused");
    section.setAttribute("aria-hidden", "true");
  });

  if (mobileBack) {
    mobileBack.hidden = false;
  }

  scrollContentToTop();

  if (updateHash) {
    history.pushState({ projectId }, "", projectHash(projectId));
  }

  window.lucide?.createIcons();
  return true;
}

function exitDetailView({ sectionId = "about", updateHash = true } = {}) {
  const { shell, content, sections, detail, mobileBack, mobileTitle } = getElements();

  if (!shell || !detail) {
    return;
  }

  activeProjectId = null;
  pointerFocusPaused = false;
  resumePointerFocus?.();

  shell.classList.remove("is-project-detail");
  detail.hidden = true;

  sections.forEach((section) => {
    section.removeAttribute("aria-hidden");
  });

  if (mobileBack) {
    mobileBack.hidden = true;
  }
  if (mobileTitle) {
    mobileTitle.textContent = "Andrew Huang";
  }

  resetSidebarTitle();
  resetDocumentTitle();

  if (updateHash) {
    history.pushState(null, "", `#${sectionId}`);
  }

  siteApiRef?.setActiveSection(sectionId);

  const isDesktopPanel = content && getComputedStyle(content).overflowY === "auto";
  if (isDesktopPanel && content) {
    content.scrollTop = listViewScrollY;
  } else {
    window.scrollTo({ top: listViewScrollY, behavior: "instant" });
  }
}

export function openProject(projectId, options = {}) {
  return enterDetailView(projectId, options);
}

export function closeProject(options = {}) {
  const fallbackSection = activeProjectId
    ? projectsById[activeProjectId]?.category === "fun"
      ? "fun"
      : "work"
    : "about";

  exitDetailView({ sectionId: options.sectionId ?? fallbackSection, ...options });
}

export function applyRoute(route, siteApi) {
  if (route.view === "project") {
    const opened = enterDetailView(route.id, { updateHash: false });
    if (!opened) {
      siteApi.scrollToSection("about", { updateHash: true });
    }
    return;
  }

  if (activeProjectId !== null) {
    exitDetailView({ sectionId: route.id, updateHash: false });
  }

  if (route.id === "about" && !location.hash) {
    siteApi.setActiveSection("about");
    return;
  }

  siteApi.scrollToSection(route.id, { updateHash: false });
}

export function initProjects(siteApi) {
  siteApiRef = siteApi;

  const { mobileBack } = getElements();

  document.addEventListener("click", (event) => {
    const row = event.target.closest(".row--project");
    if (!row) {
      return;
    }

    event.preventDefault();
    const projectId = row.dataset.projectId;
    if (projectId) {
      openProject(projectId);
    }
  });

  mobileBack?.addEventListener("click", () => {
    const sectionId =
      activeProjectId && projectsById[activeProjectId]?.category === "fun" ? "fun" : "work";
    closeProject({ sectionId, updateHash: false });
    siteApi.scrollToSection(sectionId, { updateHash: true });
  });

  document.getElementById("project-detail")?.addEventListener("click", (event) => {
    const back = event.target.closest("[data-project-back]");
    if (back) {
      event.preventDefault();
      const sectionId =
        activeProjectId && projectsById[activeProjectId]?.category === "fun" ? "fun" : "work";
      closeProject({ sectionId, updateHash: false });
      siteApi.scrollToSection(sectionId, { updateHash: true });
    }
  });

  window.addEventListener("popstate", () => {
    applyRoute(parseRoute(), siteApi);
  });

  resumePointerFocus = () => {
    pointerFocusPaused = false;
  };

  return {
    applyInitialRoute() {
      applyRoute(parseRoute(), siteApi);
    },
    handleHashChange() {
      applyRoute(parseRoute(), siteApi);
    },
  };
}
