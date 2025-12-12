(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Year
  const year = new Date().getFullYear();
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(year);

  // Mobile nav
  const navToggle = $(".nav-toggle");
  const siteNav = $("#site-nav");
  const navLinks = $$(".site-nav .nav-link");

  const setNavOpen = (open) => {
    if (!siteNav || !navToggle) return;
    siteNav.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
      const open = !siteNav.classList.contains("is-open");
      setNavOpen(open);
    });

    navLinks.forEach((a) => a.addEventListener("click", () => setNavOpen(false)));

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setNavOpen(false);
    });

    document.addEventListener("click", (e) => {
      if (!siteNav.classList.contains("is-open")) return;
      const target = e.target;
      if (!(target instanceof Element)) return;
      if (siteNav.contains(target) || navToggle.contains(target)) return;
      setNavOpen(false);
    });
  }

  // Scroll reveal
  const revealEls = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  // Active nav link (section observer)
  const sections = $$("main section[id]");
  if (sections.length && navLinks.length && "IntersectionObserver" in window) {
    const linkById = new Map(
      navLinks
        .map((a) => {
          const href = a.getAttribute("href") || "";
          const id = href.startsWith("#") ? href.slice(1) : null;
          return id ? [id, a] : null;
        })
        .filter(Boolean)
    );

    const ioActive = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];

        if (!visible) return;

        navLinks.forEach((a) => a.classList.remove("is-active"));
        const id = visible.target.getAttribute("id");
        const link = linkById.get(id);
        if (link) link.classList.add("is-active");
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: [0.05, 0.2, 0.4] }
    );

    sections.forEach((s) => ioActive.observe(s));
  }

  // Contact form (mailto)
  const form = $("#contact-form");
  const toast = $("#toast");

  const showToast = (msg) => {
    if (!toast) return;
    toast.textContent = msg;
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => (toast.textContent = ""), 4500);
  };

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const fd = new FormData(form);
      const name = String(fd.get("name") || "").trim();
      const email = String(fd.get("email") || "").trim();
      const message = String(fd.get("message") || "").trim();

      if (!name || !email || !message) {
        showToast("Please fill in all fields.");
        return;
      }

      const subject = encodeURIComponent(`Portfolio Inquiry from ${name}`);
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
      const to = "oceanney5555@gmail.com";

      showToast("Opening your email app...");
      window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
    });
  }
})();
