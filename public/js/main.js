(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const MIN_LOADER = 1900; // ms, delay agar tampil "mahal"
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  async function init() {
    const start = performance.now();
    let p;
    try {
      const r = await fetch("/api/profile");
      if (!r.ok) throw new Error();
      p = await r.json();
    } catch {
      $("#loader p").textContent = "Gagal memuat data. Jalankan dengan vercel dev atau deploy ke Vercel.";
      return;
    }
    render(p);
    await wait(Math.max(0, MIN_LOADER - (performance.now() - start)));
    $("#loader").classList.add("done");
    await wait(reduced ? 0 : 350);
    setupReveal();
    typeRoles(p.roles || []);
  }

  function render(p) {
    document.title = `${p.name} | Portofolio`;
    $("#logo").textContent = p.name.split(" ")[0];
    $("#name").textContent = p.name;
    $("#tagline").textContent = p.tagline;
    const img = $("#photo");
    img.onerror = () => { img.onerror = null; img.src = "/assets/profile.svg"; };
    img.src = p.photo;
    $("#about-text").innerHTML = (p.about || []).map(t => `<p>${esc(t)}</p>`).join("");
    $("#foot-name").textContent = p.name;
    $("#year").textContent = "© " + new Date().getFullYear();

    $("#skill-list").innerHTML = p.skills.map((s, i) => `
      <div class="reveal" style="--d:${i * 0.08}s">
        <div class="skill-head"><span>${esc(s.name)}</span><span class="pct">0%</span></div>
        <div class="track"><div class="fill" data-level="${+s.level || 0}"></div></div>
      </div>`).join("");

    $("#project-list").innerHTML = p.projects.map((x, i) => `
      <a class="card reveal" style="--d:${i * 0.12}s" href="${esc(x.link)}" target="_blank" rel="noopener">
        <h3>${esc(x.title)}</h3><p>${esc(x.desc)}</p>
        <div class="tags">${(x.tags || []).map(t => `<span>${esc(t)}</span>`).join("")}</div>
      </a>`).join("");

    const c = p.contacts || {};
    const list = [
      ["WA", "WhatsApp", c.whatsapp && `+${c.whatsapp}`, c.whatsapp && `https://wa.me/${c.whatsapp}`],
      ["GH", "GitHub", c.github && `@${c.github}`, c.github && `https://github.com/${c.github}`],
      ["IG", "Instagram", c.instagram && `@${c.instagram}`, c.instagram && `https://instagram.com/${c.instagram}`],
      ["TT", "TikTok", c.tiktok && `@${c.tiktok}`, c.tiktok && `https://tiktok.com/@${c.tiktok}`]
    ].filter(x => x[3]);
    $("#socials").innerHTML = list.map(([ic, n, h, u]) => `
      <a class="social" href="${esc(u)}" target="_blank" rel="noopener"><b>${ic}</b><span>${n}<small>${esc(h)}</small></span></a>`).join("");
  }

  function setupReveal() {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      const fill = $(".fill", e.target);
      if (fill) animateSkill(e.target, fill);
      io.unobserve(e.target);
    }), { threshold: .15 });
    document.querySelectorAll(".reveal").forEach((el, i) => {
      if (el.closest(".hero")) el.style.setProperty("--d", `${i * 0.15}s`); // hero muncul berurutan
      io.observe(el);
    });
  }

  function animateSkill(box, fill) {
    const target = +fill.dataset.level, label = $(".pct", box), dur = reduced ? 1 : 1600, t0 = performance.now();
    fill.style.width = target + "%";
    (function tick(t) {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      label.textContent = Math.round(target * e) + "%";
      if (k < 1) requestAnimationFrame(tick);
    })(t0);
  }

  async function typeRoles(roles) {
    const el = $("#typed");
    if (!roles.length) return;
    if (reduced) { el.textContent = roles[0]; return; }
    for (let i = 0; ; i = (i + 1) % roles.length) {
      for (const ch of roles[i]) { el.textContent += ch; await wait(70); }
      await wait(1600);
      while (el.textContent) { el.textContent = el.textContent.slice(0, -1); await wait(35); }
      await wait(300);
    }
  }

  // Navbar
  const nav = $(".nav"), burger = $("#burger"), menu = $("#menu");
  addEventListener("scroll", () => nav.classList.toggle("scrolled", scrollY > 30), { passive: true });
  burger.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    burger.setAttribute("aria-expanded", open);
  });
  menu.addEventListener("click", e => { if (e.target.tagName === "A") { menu.classList.remove("open"); burger.setAttribute("aria-expanded", false); } });
  const links = [...menu.querySelectorAll("a")];
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
  }), { rootMargin: "-45% 0px -50% 0px" });
  document.querySelectorAll("main section").forEach(s => spy.observe(s));

  // Form kontak
  $("#form").addEventListener("submit", async e => {
    e.preventDefault();
    const f = e.target, st = $("#status"), btn = $("button", f);
    st.className = ""; st.textContent = "Mengirim…"; btn.disabled = true;
    try {
      const r = await fetch("/api/contact", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(f)))
      });
      const d = await r.json();
      st.className = d.ok ? "ok" : "err"; st.textContent = d.message;
      if (d.ok) f.reset();
    } catch { st.className = "err"; st.textContent = "Koneksi bermasalah. Coba lagi."; }
    btn.disabled = false;
  });

  init();
})();
