document.addEventListener('DOMContentLoaded', () => {
    // Register GSAP plugins if they exist
    if (window.gsap && window.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);

        // --- Animations ---

        // Check for elements before animating them
        const heroH1 = document.querySelector(".hero h1");
        if (heroH1) {
            gsap.from(heroH1, {
                opacity: 0,
                y: 50,
                duration: 1.2,
                ease: "power4.out"
            });
        }

        const heroP = document.querySelector(".hero p");
        if (heroP) {
            gsap.from(heroP, {
                opacity: 0,
                y: 30,
                delay: 0.3,
                duration: 1,
                ease: "power2.out"
            });
        }

        const heroBtn = document.querySelector(".hero .btn");
        if (heroBtn) {
            gsap.from(heroBtn, {
                opacity: 0,
                scale: 0.8,
                delay: 0.6,
                duration: 0.6,
                ease: "back.out(1.7)"
            });
        }

        // Scroll animations for sections
        const sections = gsap.utils.toArray("section");
        if (sections.length > 0) {
            sections.forEach(section => {
                gsap.from(section, {
                    scrollTrigger: {
                        trigger: section,
                        start: "top 80%",
                        toggleActions: "play none none reverse"
                    },
                    opacity: 0,
                    y: 60,
                    duration: 1,
                    ease: "power2.out"
                });
            });
        }

        const whatsappFloat = document.querySelector(".whatsapp-float");
        if (whatsappFloat) {
            gsap.to(whatsappFloat, {
                scale: 1.05,
                duration: 1,
                repeat: -1,
                yoyo: true,
                ease: "power1.inOut"
            });
        }

        const heroSection = document.querySelector(".hero");
        if (heroSection) {
            gsap.to(heroSection, {
                backgroundPosition: "50% 80%",
                ease: "none",
                scrollTrigger: {
                    trigger: heroSection,
                    start: "top top",
                    end: "bottom top",
                    scrub: true
                }
            });
        }
    }

    // --- Hamburger Menu Logic (runs on all pages) ---
    const hamburger = document.getElementById('hamburger-btn');
    const nav = document.getElementById('main-nav');

    if (hamburger && nav) {
        hamburger.addEventListener('click', () => {
            nav.classList.toggle('open');
            hamburger.classList.toggle('active');
        });

        document.querySelectorAll('#main-nav a').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('open');
                hamburger.classList.remove('active');
            });
        });
    }
});