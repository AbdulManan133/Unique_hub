document.addEventListener("mousemove", (event) => {
  // Button radial highlight
  document.querySelectorAll(".btn").forEach((btn) => {
    const rect = btn.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    btn.style.setProperty("--bx", `${x}%`);
    btn.style.setProperty("--by", `${y}%`);
  });

  document.querySelectorAll(".service-card").forEach((card) => {
    const rect = card.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty("--mx", `${x}%`);
    card.style.setProperty("--my", `${y}%`);
  });
});

// Scroll reveal for cards & key blocks
document.addEventListener("DOMContentLoaded", () => {
  const revealTargets = document.querySelectorAll(
    ".service-card, .highlight-card, .glow-card, .about-block, .contact-card, .stat-card-animated, .feature-card-flip, .floating-card, .value-card-float"
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealTargets.forEach((el) => observer.observe(el));

  // Animated counter for stats
  const statNumbers = document.querySelectorAll(".stat-number");
  const statsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = parseInt(entry.target.getAttribute("data-target"));
          const duration = 2000;
          const increment = target / (duration / 16);
          let current = 0;

          const updateCounter = () => {
            current += increment;
            if (current < target) {
              entry.target.textContent = Math.floor(current);
              requestAnimationFrame(updateCounter);
            } else {
              entry.target.textContent = target;
            }
          };

          updateCounter();
          statsObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  statNumbers.forEach((stat) => statsObserver.observe(stat));

  // Hero parallax on scroll
  const heroBg = document.querySelector(".hero-bg-gradient");
  const heroImage = document.querySelector(".hero-image-wrapper");
  const primaryCard = document.querySelector(".hero-card.primary");
  const secondaryCard = document.querySelector(".hero-card.secondary");

  window.addEventListener("scroll", () => {
    const y = window.scrollY || window.pageYOffset;
    const offset = y * 0.15;
    const offsetSmall = y * 0.08;

    if (heroBg) {
      heroBg.style.transform = `translate3d(0, ${-offset}px, 0)`;
    }
    if (heroImage) {
      heroImage.style.transform = `translate3d(0, ${offsetSmall}px, 0)`;
    }
    if (primaryCard) {
      primaryCard.style.transform = `translate3d(0, ${-offsetSmall}px, 0)`;
    }
    if (secondaryCard) {
      secondaryCard.style.transform = `translate3d(0, ${-offsetSmall * 0.7}px, 0)`;
    }
  });
});

