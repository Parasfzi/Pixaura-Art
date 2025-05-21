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