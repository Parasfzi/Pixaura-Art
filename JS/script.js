const hamburger = document.getElementById('hamburger-btn');
      const nav = document.getElementById('main-nav');
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

  // Hero text animation
  gsap.from(".hero h1", {
    opacity: 0,
    y: 50,
    duration: 1.2,
    ease: "power4.out"
  });

  gsap.from(".hero p", {
    opacity: 0,
    y: 30,
    delay: 0.3,
    duration: 1,
    ease: "power2.out"
  });

  gsap.from(".hero .btn", {
    opacity: 0,
    scale: 0.8,
    delay: 0.6,
    duration: 0.6,
    ease: "back.out(1.7)"
  });

  // Scroll animations for sections
  gsap.utils.toArray("section").forEach(section => {
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

  // Floating WhatsApp icon pulse
  gsap.to(".whatsapp-float", {
    scale: 1.05,
    duration: 1,
    repeat: -1,
    yoyo: true,
    ease: "power1.inOut"
  });

  // Parallax effect on hero background (optional)
  gsap.to(".hero", {
    backgroundPosition: "50% 80%",
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: true
    }
  });
