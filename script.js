(function () {
    "use strict";

    const $ = (q, el = document) => el.querySelector(q);
    const $$ = (q, el = document) => Array.from(el.querySelectorAll(q));
    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;
    const isCoarse = window.matchMedia("(hover: none)").matches;

    // =========================================================
    // PAGE LOADER
    // ========================================================
    window.addEventListener("load", () => {
        const loader = $("#pageLoader");
        if (!loader) return;
        setTimeout(() => loader.classList.add("hidden"), 350);
    });

    // =========================================================
    // CURRENT YEAR
    // =========================================================
    const y = $("#currentYear");
    if (y) y.textContent = new Date().getFullYear();

    // =========================================================
    // HEADER scroll state + scroll progress
    // =========================================================
    const header = $("#header");
    const scrollBar = $("#scrollBar");
    const fab = $("#floatingWhatsapp");

    const onScroll = () => {
        const y = window.scrollY;
        if (header) header.classList.toggle("scrolled", y > 20);

        if (fab) fab.classList.toggle("visible", y > 320);

        if (scrollBar) {
            const docH = document.documentElement.scrollHeight - window.innerHeight;
            const pct = docH > 0 ? (y / docH) * 100 : 0;
            scrollBar.style.width = pct + "%";
        }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // =========================================================
    // MOBILE MENU
    // =========================================================
    const menuToggle = $("#menuToggle");
    const navMobile = $("#navMobile");
    if (menuToggle && navMobile) {
        menuToggle.addEventListener("click", () => {
            const open = navMobile.classList.toggle("active");
            menuToggle.classList.toggle("open", open);
            menuToggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
        });
        $$(".nav-mobile a").forEach((a) =>
            a.addEventListener("click", () => {
                navMobile.classList.remove("active");
                menuToggle.classList.remove("open");
            })
        );
    }

    // =========================================================
    // SMOOTH SCROLL FOR ANCHORS
    // =========================================================
    $$('a[href^="#"]').forEach((a) => {
        a.addEventListener("click", (e) => {
            const href = a.getAttribute("href");
            if (!href || href === "#") return;
            const target = document.querySelector(href);
            if (!target) return;
            e.preventDefault();
            const top = target.getBoundingClientRect().top + window.pageYOffset - 70;
            window.scrollTo({ top, behavior: "smooth" });
        });
    });

    // =========================================================
    // ACTIVE NAV LINK
    // =========================================================
    const sections = $$("section[id]");
    const navLinks = $$(".nav-desktop .nav-link");
    const linkBySection = new Map(
        navLinks.map((l) => [l.getAttribute("href").replace("#", ""), l])
    );

    const sectionObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    navLinks.forEach((l) => l.classList.remove("active"));
                    const link = linkBySection.get(entry.target.id);
                    if (link) link.classList.add("active");
                }
            });
        },
        { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    sections.forEach((s) => sectionObserver.observe(s));

    // =========================================================
    // REVEAL ON SCROLL (staggered)
    // =========================================================
    const revealObserver = new IntersectionObserver(
        (entries, obs) => {
            entries.forEach((entry, idx) => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    // stagger siblings in same parent
                    const siblings = Array.from(el.parentElement?.children || []).filter(
                        (c) => c.classList.contains("reveal")
                    );
                    const i = siblings.indexOf(el);
                    el.style.setProperty("--reveal-delay", `${i * 80}ms`);
                    el.classList.add("visible");
                    obs.unobserve(el);
                }
            });
        },
        { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    $$(".reveal").forEach((el) => revealObserver.observe(el));

    // =========================================================
    // COUNTER ANIMATION
    // =========================================================
    const animateCount = (el) => {
        const target = parseInt(el.dataset.count, 10);
        if (isNaN(target)) return;
        const duration = 1600;
        const start = performance.now();
        const step = (t) => {
            const p = Math.min((t - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(eased * target).toString();
            if (p < 1) requestAnimationFrame(step);
            else el.textContent = target.toString();
        };
        requestAnimationFrame(step);
    };

    const countObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    animateCount(entry.target);
                    countObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.4 }
    );
    $$("[data-count]").forEach((el) => countObserver.observe(el));

    // =========================================================
    // LANGUAGE BARS
    // =========================================================
    const barObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const span = entry.target.querySelector("span");
                    if (span) {
                        const w = span.style.width;
                        span.style.setProperty("--target-width", w);
                        // Trigger animation
                        span.style.width = "0";
                        requestAnimationFrame(() => {
                            entry.target.classList.add("animated");
                            span.style.width = w;
                        });
                    }
                    barObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.4 }
    );
    $$(".lang-bar").forEach((b) => barObserver.observe(b));

    
    // =========================================================
    // MAGNETIC BUTTONS
    // =========================================================
    if (!isCoarse && !prefersReducedMotion) {
        $$(".magnetic").forEach((el) => {
            const strength = 18;
            el.addEventListener("mousemove", (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                el.style.transform = `translate(${(x / rect.width) * strength}px, ${
                    (y / rect.height) * strength
                }px)`;
            });
            el.addEventListener("mouseleave", () => {
                el.style.transform = "";
            });
        });
    }

    // =========================================================
    // 3D TILT
    // =========================================================
    if (!isCoarse && !prefersReducedMotion) {
        $$("[data-tilt]").forEach((el) => {
            const max = 8;
            let rect;

            const onMove = (e) => {
                if (!rect) rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const rx = ((y / rect.height) - 0.5) * -max;
                const ry = ((x / rect.width) - 0.5) * max;
                el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
            };
            const onEnter = () => {
                rect = el.getBoundingClientRect();
                el.style.transition = "transform 0.15s var(--ease)";
            };
            const onLeave = () => {
                el.style.transform = "";
                el.style.transition = "transform 0.6s var(--ease)";
                rect = null;
            };

            el.addEventListener("mouseenter", onEnter);
            el.addEventListener("mousemove", onMove);
            el.addEventListener("mouseleave", onLeave);
        });
    }

    // =========================================================
    // PARALLAX (hero orbs + decorative)
    // =========================================================
    if (!prefersReducedMotion) {
        const orbs = $$(".orb");
        let mouseX = 0, mouseY = 0;
        window.addEventListener("mousemove", (e) => {
            mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        });

        const parallaxTick = () => {
            orbs.forEach((orb, i) => {
                const depth = (i + 1) * 8;
                orb.style.translate = `${mouseX * depth}px ${mouseY * depth}px`;
            });
            requestAnimationFrame(parallaxTick);
        };
        parallaxTick();

        // Scroll-based parallax on hero image
        const heroVisual = $(".hero-visual");
        if (heroVisual) {
            window.addEventListener("scroll", () => {
                const y = window.scrollY;
                if (y < window.innerHeight) {
                    heroVisual.style.transform = `translateY(${y * 0.08}px)`;
                }
            }, { passive: true });
        }
    }

    // =========================================================
    // PARTICLE CANVAS BACKGROUND
    // =========================================================
    if (!prefersReducedMotion) {
        const canvas = $("#particle-canvas");
        if (canvas) {
            const ctx = canvas.getContext("2d");
            let w, h, particles;

            const resize = () => {
                w = canvas.width = window.innerWidth;
                h = canvas.height = window.innerHeight;
            };
            resize();
            window.addEventListener("resize", resize);

            const count = Math.min(60, Math.floor((w * h) / 28000));
            particles = Array.from({ length: count }, () => ({
                x: Math.random() * w,
                y: Math.random() * h,
                r: Math.random() * 1.6 + 0.4,
                vx: (Math.random() - 0.5) * 0.25,
                vy: (Math.random() - 0.5) * 0.25,
                a: Math.random() * 0.6 + 0.2,
            }));

            const draw = () => {
                ctx.clearRect(0, 0, w, h);
                // Connect lines
                for (let i = 0; i < particles.length; i++) {
                    const p = particles[i];
                    p.x += p.vx;
                    p.y += p.vy;
                    if (p.x < 0 || p.x > w) p.vx *= -1;
                    if (p.y < 0 || p.y > h) p.vy *= -1;

                    ctx.beginPath();
                    ctx.fillStyle = `rgba(231, 196, 120, ${p.a})`;
                    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                    ctx.fill();

                    for (let j = i + 1; j < particles.length; j++) {
                        const q = particles[j];
                        const dx = p.x - q.x;
                        const dy = p.y - q.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < 120) {
                            ctx.beginPath();
                            ctx.strokeStyle = `rgba(231, 196, 120, ${
                                (1 - dist / 120) * 0.12
                            })`;
                            ctx.lineWidth = 0.6;
                            ctx.moveTo(p.x, p.y);
                            ctx.lineTo(q.x, q.y);
                            ctx.stroke();
                        }
                    }
                }
                requestAnimationFrame(draw);
            };
            draw();
        }
    }

    // =========================================================
    // INIT LOG
    // =========================================================
    console.log("✦ Dr. Roberto Aquino — Landing carregada com excelência ✦");
})();
