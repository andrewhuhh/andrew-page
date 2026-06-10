import { isPointerFocusPaused, isProjectRoute } from "./projects.js";

const validSections = ["about", "work", "fun"];
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function initSite() {
  const content = document.querySelector(".content");
  const contentScrollbar = document.querySelector(".content-scrollbar");
  const contentScrollbarThumb = document.querySelector(".content-scrollbar__thumb");
  const sections = document.querySelectorAll(".section");
  const sectionNavItems = document.querySelectorAll('a.nav-item[href^="#"]');
  const menuOverlay = document.getElementById("menu-overlay");
  const menuToggle = document.querySelector(".menu-toggle");
  const menuClose = document.querySelector(".menu-close");
  const sidebarNav = document.querySelector(".sidebar-nav");
  const navActiveDot = sidebarNav?.querySelector(".nav-active-dot");
  let navDotPositioned = false;

  function positionNavDot(navItem, { animate = true } = {}) {
    if (!sidebarNav || !navActiveDot || !navItem || !sidebarNav.contains(navItem)) {
      return;
    }

    const navRect = sidebarNav.getBoundingClientRect();
    const itemRect = navItem.getBoundingClientRect();

    navActiveDot.style.left = `${itemRect.left - navRect.left - 12}px`;
    navActiveDot.style.top = `${itemRect.top - navRect.top + itemRect.height / 2}px`;

    if (animate && navDotPositioned && !prefersReducedMotion) {
      navActiveDot.classList.add("is-ready");
    } else {
      navActiveDot.classList.remove("is-ready");
      navActiveDot.offsetHeight;
      if (!prefersReducedMotion) {
        navActiveDot.classList.add("is-ready");
      }
    }

    navActiveDot.classList.add("is-visible");
    navDotPositioned = true;
  }

  function setActiveSection(id) {
    let activeSidebarItem = null;

    sectionNavItems.forEach((item) => {
      const sectionId = item.getAttribute("href")?.slice(1);
      const isActive = sectionId === id;
      item.setAttribute("aria-current", isActive ? "page" : null);

      if (isActive && sidebarNav?.contains(item)) {
        activeSidebarItem = item;
      }
    });

    sections.forEach((section) => {
      section.classList.toggle("is-focused", section.id === id);
    });

    if (activeSidebarItem) {
      positionNavDot(activeSidebarItem);
    }
  }

  function scrollToSection(id, { updateHash = true } = {}) {
    if (!validSections.includes(id)) {
      id = "about";
    }

    const target = document.getElementById(id);
    if (!target) {
      return;
    }

    target.scrollIntoView({
      behavior: prefersReducedMotion ? "instant" : "smooth",
      block: "start",
    });

    if (updateHash) {
      history.replaceState(null, "", `#${id}`);
    }

    setActiveSection(id);
    closeMenu();
  }

  function openMenu() {
    menuOverlay.hidden = false;
    menuOverlay.classList.add("open");
    menuToggle.setAttribute("aria-expanded", "true");
    window.lucide?.createIcons();
  }

  function closeMenu() {
    menuOverlay.hidden = true;
    menuOverlay.classList.remove("open");
    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", "false");
    }
  }

  sectionNavItems.forEach((item) => {
    item.addEventListener("click", (event) => {
      event.preventDefault();
      const id = item.getAttribute("href")?.slice(1);
      if (id) {
        scrollToSection(id);
      }
    });
  });

  if (menuToggle) {
    menuToggle.addEventListener("click", openMenu);
  }

  if (menuClose) {
    menuClose.addEventListener("click", closeMenu);
  }

  initPointerFocus({ content, sections, setActiveSection });
  initCustomScrollbar({ content, contentScrollbar, contentScrollbarThumb });
  initAboutDialog();
  initThemeToggles();

  return {
    scrollToSection,
    setActiveSection,
    closeMenu,
  };
}

function initPointerFocus({ content, sections, setActiveSection }) {
  let rafId = 0;
  let lastPointer = { x: null, y: null };
  let lastActiveId = null;

  function isPointerOverContent(x, y) {
    if (!content) {
      return false;
    }

    const rect = content.getBoundingClientRect();
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  }

  function getSectionAtY(y) {
    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      if (y >= rect.top && y <= rect.bottom) {
        return section.id;
      }
    }

    let closestId = null;
    let closestDistance = Infinity;

    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const distance = Math.abs(y - center);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestId = section.id;
      }
    });

    return closestId;
  }

  function resolveSectionAt(x, y) {
    if (!isPointerOverContent(x, y)) {
      return null;
    }

    const hit = document.elementFromPoint(x, y)?.closest(".section");
    if (hit?.id && validSections.includes(hit.id)) {
      return hit.id;
    }

    return getSectionAtY(y);
  }

  function getFallbackPoint() {
    if (!content) {
      return { x: window.innerWidth / 2, y: window.innerHeight * 0.4 };
    }

    const rect = content.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height * 0.4,
    };
  }

  function applyFocus(id) {
    if (isPointerFocusPaused() || isProjectRoute()) {
      return;
    }

    if (!id || !validSections.includes(id) || id === lastActiveId) {
      return;
    }

    lastActiveId = id;
    setActiveSection(id);
    history.replaceState(null, "", `#${id}`);
  }

  function updateFocus() {
    if (isPointerFocusPaused() || isProjectRoute()) {
      return;
    }

    const point =
      lastPointer.x != null && lastPointer.y != null ? lastPointer : getFallbackPoint();

    const sectionId = resolveSectionAt(point.x, point.y);
    if (sectionId) {
      applyFocus(sectionId);
    }
  }

  function scheduleFocusUpdate() {
    if (rafId) {
      return;
    }

    rafId = requestAnimationFrame(() => {
      rafId = 0;
      updateFocus();
    });
  }

  function trackPointer(x, y) {
    lastPointer.x = x;
    lastPointer.y = y;
    scheduleFocusUpdate();
  }

  document.addEventListener(
    "mousemove",
    (event) => {
      trackPointer(event.clientX, event.clientY);
    },
    { passive: true },
  );

  document.addEventListener(
    "touchstart",
    (event) => {
      const touch = event.touches[0];
      if (touch) {
        trackPointer(touch.clientX, touch.clientY);
      }
    },
    { passive: true },
  );

  document.addEventListener(
    "touchmove",
    (event) => {
      const touch = event.touches[0];
      if (touch) {
        trackPointer(touch.clientX, touch.clientY);
      }
    },
    { passive: true },
  );

  content?.addEventListener("scroll", scheduleFocusUpdate, { passive: true });
  window.addEventListener("scroll", scheduleFocusUpdate, { passive: true });
  window.addEventListener("resize", scheduleFocusUpdate, { passive: true });

  window.addEventListener("resize", () => {
    const sidebarNav = document.querySelector(".sidebar-nav");
    const navActiveDot = sidebarNav?.querySelector(".nav-active-dot");
    const activeItem = sidebarNav?.querySelector('a.nav-item[aria-current="page"]');
    if (activeItem && navActiveDot) {
      const navRect = sidebarNav.getBoundingClientRect();
      const itemRect = activeItem.getBoundingClientRect();
      navActiveDot.style.left = `${itemRect.left - navRect.left - 12}px`;
      navActiveDot.style.top = `${itemRect.top - navRect.top + itemRect.height / 2}px`;
    }
  });

  scheduleFocusUpdate();
}

function initCustomScrollbar({ content, contentScrollbar, contentScrollbarThumb }) {
  if (!content || !contentScrollbar || !contentScrollbarThumb) {
    return;
  }

  const maxThumbHeight = 96;
  const minThumbHeight = 32;

  function updateScrollbarThumb() {
    const { scrollHeight, clientHeight, scrollTop } = content;
    const maxScroll = scrollHeight - clientHeight;

    if (maxScroll <= 0) {
      contentScrollbar.hidden = true;
      return;
    }

    contentScrollbar.hidden = false;

    const trackHeight = clientHeight;
    const proportionalHeight = (clientHeight / scrollHeight) * trackHeight;
    const thumbHeight = Math.min(maxThumbHeight, Math.max(minThumbHeight, proportionalHeight));
    const maxThumbTravel = trackHeight - thumbHeight;
    const thumbOffset = (scrollTop / maxScroll) * maxThumbTravel;

    contentScrollbarThumb.style.height = `${thumbHeight}px`;
    contentScrollbarThumb.style.transform = `translateY(${thumbOffset}px)`;
  }

  content.addEventListener("scroll", updateScrollbarThumb, { passive: true });
  window.addEventListener("resize", updateScrollbarThumb, { passive: true });
  new ResizeObserver(updateScrollbarThumb).observe(content);

  contentScrollbarThumb.addEventListener("mousedown", (event) => {
    event.preventDefault();
    contentScrollbar.classList.add("is-dragging");

    const startY = event.clientY;
    const startScrollTop = content.scrollTop;
    const { clientHeight, scrollHeight } = content;
    const maxScroll = scrollHeight - clientHeight;
    const thumbHeight = contentScrollbarThumb.offsetHeight;
    const maxThumbTravel = clientHeight - thumbHeight;

    function onMouseMove(moveEvent) {
      const deltaY = moveEvent.clientY - startY;
      const scrollDelta = maxThumbTravel > 0 ? (deltaY / maxThumbTravel) * maxScroll : 0;
      content.scrollTop = startScrollTop + scrollDelta;
    }

    function onMouseUp() {
      contentScrollbar.classList.remove("is-dragging");
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });

  updateScrollbarThumb();
}

function initAboutDialog() {
  const aboutDialog = document.getElementById("about-dialog");
  const aboutOpenButton = document.querySelector("[data-about-open]");
  const aboutCloseButton = document.querySelector("[data-about-close]");
  let aboutDialogClosing = false;

  function openAboutDialog() {
    if (!aboutDialog) {
      return;
    }

    aboutDialog.classList.remove("is-closing");
    aboutDialog.showModal();
    window.lucide?.createIcons();
    aboutCloseButton?.focus();
  }

  function closeAboutDialog() {
    if (!aboutDialog || aboutDialogClosing || !aboutDialog.open) {
      return;
    }

    if (prefersReducedMotion) {
      aboutDialog.close();
      aboutOpenButton?.focus();
      return;
    }

    aboutDialogClosing = true;
    aboutDialog.classList.add("is-closing");

    aboutDialog.addEventListener(
      "animationend",
      (event) => {
        if (event.target !== aboutDialog) {
          return;
        }

        aboutDialog.classList.remove("is-closing");
        aboutDialog.close();
        aboutDialogClosing = false;
        aboutOpenButton?.focus();
      },
      { once: true },
    );
  }

  aboutOpenButton?.addEventListener("click", openAboutDialog);
  aboutCloseButton?.addEventListener("click", closeAboutDialog);

  aboutDialog?.addEventListener("click", (event) => {
    if (event.target === aboutDialog) {
      closeAboutDialog();
    }
  });

  aboutDialog?.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeAboutDialog();
  });
}

function initThemeToggles() {
  const themeToggles = document.querySelectorAll(".theme-toggle");

  function setTheme(theme) {
    if (theme === "dark") {
      document.documentElement.dataset.theme = "dark";
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("theme", "light");
    }
    window.lucide?.createIcons();
  }

  themeToggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const isDark = document.documentElement.dataset.theme === "dark";
      setTheme(isDark ? "light" : "dark");
    });
  });
}
