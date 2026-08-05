/* MAIN — cinematic interactions */
(function () {
  'use strict';

  /* ── Year ── */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* ── Loader ── */
  var loader = document.getElementById('loader');
  function hideLoader() {
    loader.classList.add('hidden');
    document.body.style.overflow = '';
  }
  document.body.style.overflow = 'hidden';
  window.addEventListener('load', function () { setTimeout(hideLoader, 1700); });
  setTimeout(hideLoader, 3500); /* safety */

  /* ── Scroll progress + nav state ── */
  var progress = document.getElementById('scrollProgress');
  var nav = document.getElementById('nav');
  function onScroll() {
    var st = window.scrollY || document.documentElement.scrollTop;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (h > 0 ? (st / h) * 100 : 0) + '%';
    if (st > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Mobile menu ── */
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  toggle.addEventListener('click', function () {
    toggle.classList.toggle('open');
    links.classList.toggle('open');
  });
  links.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      toggle.classList.remove('open');
      links.classList.remove('open');
    });
  });

  /* ── Starfield particles ── */
  var canvas = document.getElementById('stars');
  var ctx = canvas.getContext('2d');
  var particles = [];
  var W, H;
  var isMobile = window.innerWidth < 768;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  var COUNT = isMobile ? 55 : 120;
  for (var i = 0; i < COUNT; i++) {
    particles.push({
      x: Math.random() * (W || 1200),
      y: Math.random() * (H || 800),
      r: Math.random() * 1.8 + 0.3,
      speed: Math.random() * 0.22 + 0.04,
      drift: (Math.random() - 0.5) * 0.25,
      tw: Math.random() * Math.PI * 2,
      twSpeed: Math.random() * 0.02 + 0.005,
      gold: Math.random() < 0.55
    });
  }

  function drawStars() {
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.y -= p.speed;
      p.x += p.drift;
      p.tw += p.twSpeed;
      if (p.y < -5) { p.y = H + 5; p.x = Math.random() * W; }
      if (p.x < -5) p.x = W + 5;
      if (p.x > W + 5) p.x = -5;
      var alpha = 0.25 + 0.65 * (0.5 + 0.5 * Math.sin(p.tw));
      var color = p.gold ? '212,175,55' : '255,255,255';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + color + ',' + alpha.toFixed(2) + ')';
      ctx.fill();
    }
    requestAnimationFrame(drawStars);
  }
  drawStars();

  /* ── Typing effect ── */
  var typeTarget = document.getElementById('typeTarget');
  var phrases = ['Stop watching.', 'Start creating.', 'Own your story.', 'Become the Main Character.'];
  var pi = 0, ci = 0, deleting = false;
  function typeLoop() {
    var word = phrases[pi];
    typeTarget.textContent = word.substring(0, ci);
    if (!deleting) {
      if (ci < word.length) { ci++; setTimeout(typeLoop, 65); }
      else { deleting = true; setTimeout(typeLoop, 1900); }
    } else {
      if (ci > 0) { ci--; setTimeout(typeLoop, 32); }
      else { deleting = false; pi = (pi + 1) % phrases.length; setTimeout(typeLoop, 350); }
    }
  }
  typeLoop();

  /* ── Counters ── */
  var counters = document.querySelectorAll('.counter');
  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-target'), 10);
    var dur = 1500, start = null;
    function step(ts) {
      if (!start) start = ts;
      var prog = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - prog, 3);
      el.textContent = Math.floor(eased * target).toLocaleString('en-US');
      if (prog < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString('en-US');
    }
    requestAnimationFrame(step);
  }
  var counterIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { animateCounter(e.target); counterIO.unobserve(e.target); }
    });
  }, { threshold: 0.6 });
  counters.forEach(function (c) { counterIO.observe(c); });

  /* ── Spotlight follower ── */
  var stage = document.getElementById('spotlightStage');
  var beam = document.getElementById('spotlightBeam');
  if (stage && beam) {
    stage.addEventListener('mousemove', function (ev) {
      var r = stage.getBoundingClientRect();
      var x = ((ev.clientX - r.left) / r.width) * 100;
      var y = ((ev.clientY - r.top) / r.height) * 100;
      beam.style.setProperty('--mx', x + '%');
      beam.style.setProperty('--my', y + '%');
    });
    /* gentle auto-move on touch devices */
    if ('ontouchstart' in window) {
      var t = 0;
      (function autoBeam() {
        t += 0.012;
        var x = 50 + Math.sin(t) * 30;
        var y = 40 + Math.cos(t * 0.8) * 18;
        beam.style.setProperty('--mx', x + '%');
        beam.style.setProperty('--my', y + '%');
        beam.style.opacity = 1;
        requestAnimationFrame(autoBeam);
      })();
    }
  }

  /* ── Reveal on scroll ── */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ── Hero stagger (after loader) ── */
  setTimeout(function () {
    var heroReveals = document.querySelectorAll('.hero .reveal');
    heroReveals.forEach(function (el, i) {
      setTimeout(function () { el.classList.add('visible'); }, 200 + i * 160);
    });
  }, 1600);

  /* ── Hero parallax on scroll ── */
  var heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    window.addEventListener('scroll', function () {
      var st = window.scrollY;
      if (st < window.innerHeight) {
        heroBg.style.transform = 'translateY(' + st * 0.25 + 'px) scale(1.14)';
      }
    }, { passive: true });
  }
})();
