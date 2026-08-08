(() => {
  const progress = document.getElementById("progress");
  const topbar = document.getElementById("topbar");
  const mobileMenu = document.getElementById("mobileMenu");
  const mobileNav = document.getElementById("mobileNav");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Navigation
  mobileMenu?.addEventListener("click", () => mobileNav.classList.toggle("open"));
  mobileNav?.querySelectorAll("a").forEach(a => a.addEventListener("click", () => mobileNav.classList.remove("open")));

  // Cinematic scroll progress + compact header.
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = (max ? scrollY / max * 100 : 0) + "%";
    topbar.classList.toggle("scrolled", scrollY > 10);
  };
  addEventListener("scroll", onScroll, {passive:true});
  onScroll();

  // Reveal content.
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, {threshold:.12});
  document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

  // Count-up metrics.
  const countObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.count);
      if (reduceMotion) { el.textContent = target; countObserver.unobserve(el); return; }
      const start = performance.now(), duration = 1200;
      const tick = now => {
        const p = Math.min((now-start)/duration,1);
        const eased = 1-Math.pow(1-p,3);
        el.textContent = Math.round(target*eased);
        if(p<1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      countObserver.unobserve(el);
    });
  }, {threshold:.7});
  document.querySelectorAll("[data-count]").forEach(el => countObserver.observe(el));

  // Gentle mouse parallax for cinematic hero/orb.
  if (!reduceMotion && matchMedia("(pointer:fine)").matches) {
    const hero = document.querySelector(".launch-hero");
    const glow = document.querySelector(".hero-glow");
    const orbits = document.querySelectorAll(".hero-orbit");
    hero?.addEventListener("pointermove", e => {
      const x = e.clientX / innerWidth - .5;
      const y = e.clientY / innerHeight - .5;
      if (glow) glow.style.transform = `translate(${x*25}px,${y*20}px) scale(1)`;
      orbits.forEach((o,i) => o.style.marginLeft = `${x*(i+1)*18}px`);
    });
  }

  // Small image-like depth effect on product visuals.
  if (!reduceMotion && matchMedia("(pointer:fine)").matches) {
    document.querySelectorAll(".experience-product").forEach(section => {
      section.addEventListener("pointermove", e => {
        const rect = section.getBoundingClientRect();
        const x = (e.clientX-rect.left)/rect.width-.5;
        const y = (e.clientY-rect.top)/rect.height-.5;
        const win = section.querySelector(".framework-window");
        if(win) win.style.transform = `rotateY(${-12+x*7}deg) rotateX(${5-y*5}deg) translateY(${y*-8}px)`;
      });
      section.addEventListener("pointerleave", () => {
        const win = section.querySelector(".framework-window");
        if(win) win.style.transform = "";
      });
    });
  }
})();
