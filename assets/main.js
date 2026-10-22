document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-year]").forEach(el => el.textContent = new Date().getFullYear());
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav-links");
  if (toggle && nav) toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("visible"); observer.unobserve(entry.target); }
    }), { threshold: 0.12 });
    revealEls.forEach(el => observer.observe(el));
  } else revealEls.forEach(el => el.classList.add("visible"));
  // Gentle pointer parallax on the decorative hero planet; no impact on touch devices.
  const planet = document.querySelector(".universe-wrap");
  if (planet && matchMedia("(pointer:fine)").matches) {
    planet.addEventListener("pointermove", e => {
      const r = planet.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      planet.style.setProperty("--tilt-x", `${-y * 8}deg`);
      planet.style.setProperty("--tilt-y", `${x * 10}deg`);
    });
    planet.addEventListener("pointerleave", () => {
      planet.style.setProperty("--tilt-x", "0deg"); planet.style.setProperty("--tilt-y", "0deg");
    });
  }
});
