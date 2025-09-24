document.addEventListener("DOMContentLoaded", () => {
    // Check if GSAP and its plugins are loaded
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || typeof ScrollSmoother === 'undefined') {
        console.log("GSAP libraries not loaded, skipping animations.");
        return;
    }

    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

    // Create the smoother
    const smoother = ScrollSmoother.create({
        content: "main",
        smooth: 1.2,
        effects: true,
    });

    // Animate featured cards on scroll
    gsap.from(".featured-card", {
        scrollTrigger: {
            trigger: ".featured-section",
            start: "top 80%",
            end: "bottom 60%",
            scrub: 1,
        },
        y: 100,
        opacity: 0,
        stagger: 0.2,
    });

    // Animate about section elements
    gsap.from(".about-text, .about-image", {
        scrollTrigger: {
            trigger: ".about-section",
            start: "top 80%",
            end: "bottom 80%",
            scrub: 1,
        },
        x: (index) => (index === 0 ? -100 : 100),
        opacity: 0,
        stagger: 0.3,
    });
});
