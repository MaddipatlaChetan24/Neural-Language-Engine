/**
 * Neural Language Engine — Premium AI SaaS Frontend
 * ═══════════════════════════════════════════════════
 * Vanta.js background, GSAP animations, neural network canvas,
 * API integration, typewriter, gauges, and micro-interactions.
 */

document.addEventListener("DOMContentLoaded", () => {

  // ═══════════════════════════════════════════════
  //  1. VANTA.JS NET BACKGROUND
  // ═══════════════════════════════════════════════
  if (window.VANTA && window.VANTA.NET) {
    try {
      window.VANTA.NET({
        el: "#vanta-bg",
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        scale: 1.0,
        scaleMobile: 1.0,
        color: 0x00F5FF,
        backgroundColor: 0x050816,
        points: 8,
        maxDistance: 23,
        spacing: 18,
        showDots: true,
      });
    } catch (e) {
      console.warn("Vanta.js init failed:", e);
    }
  }

  // ═══════════════════════════════════════════════
  //  2. TYPEWRITER EFFECT
  // ═══════════════════════════════════════════════
  const heroTitle = document.getElementById("heroTitle");
  const cursor = document.getElementById("cursor");
  const fullText = "Neural Language Engine";
  let charIndex = 0;

  function typeWriter() {
    if (charIndex < fullText.length) {
      heroTitle.textContent += fullText.charAt(charIndex);
      charIndex++;
      setTimeout(typeWriter, 70);
    } else {
      // Hide cursor after typing completes
      setTimeout(() => {
        if (cursor) cursor.style.opacity = "0";
      }, 2000);
    }
  }
  typeWriter();

  // ═══════════════════════════════════════════════
  //  3. GSAP ANIMATIONS
  // ═══════════════════════════════════════════════
  if (window.gsap) {
    gsap.registerPlugin(ScrollTrigger);

    // Hero entrance
    gsap.from(".hero-badge", { y: -20, opacity: 0, duration: 0.8, delay: 0.2 });
    gsap.from(".hero-subtitle", { y: 30, opacity: 0, duration: 0.8, delay: 1.8 });
    gsap.from(".hero-tags", { y: 20, opacity: 0, duration: 0.8, delay: 2.2 });

    // Metrics with scroll trigger
    gsap.from(".metric-card", {
      scrollTrigger: { trigger: ".metrics-section", start: "top 80%" },
      y: 40, opacity: 0, duration: 0.6, stagger: 0.12, ease: "power3.out",
    });

    // Workspace
    gsap.from(".input-panel", {
      scrollTrigger: { trigger: ".workspace-section", start: "top 80%" },
      x: -40, opacity: 0, duration: 0.8, ease: "power3.out",
    });
    gsap.from(".output-panel", {
      scrollTrigger: { trigger: ".workspace-section", start: "top 80%" },
      x: 40, opacity: 0, duration: 0.8, delay: 0.2, ease: "power3.out",
    });

    // Neural section
    gsap.from(".neural-canvas-wrapper", {
      scrollTrigger: { trigger: ".neural-section", start: "top 80%" },
      y: 50, opacity: 0, duration: 1, ease: "power3.out",
    });

    // Architecture nodes
    gsap.from(".arch-node", {
      scrollTrigger: { trigger: ".arch-section", start: "top 80%" },
      y: 30, opacity: 0, duration: 0.5, stagger: 0.1, ease: "power3.out",
    });
    gsap.from(".arch-arrow", {
      scrollTrigger: { trigger: ".arch-section", start: "top 80%" },
      opacity: 0, duration: 0.3, stagger: 0.1, delay: 0.3,
    });

    // About cards
    gsap.from(".about-card", {
      scrollTrigger: { trigger: ".about-section", start: "top 80%" },
      y: 40, opacity: 0, duration: 0.6, stagger: 0.12, ease: "power3.out",
    });
  }

  // ═══════════════════════════════════════════════
  //  4. NAVBAR SCROLL EFFECT
  // ═══════════════════════════════════════════════
  const navbar = document.getElementById("navbar");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });

  // ═══════════════════════════════════════════════
  //  5. ANIMATED COUNTERS
  // ═══════════════════════════════════════════════
  function animateCounter(el, target, suffix = "", isFloat = false) {
    const duration = 2000;
    const start = performance.now();
    const numTarget = parseFloat(target);

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = numTarget * eased;

      if (isFloat) {
        el.textContent = current.toFixed(1) + suffix;
      } else {
        el.textContent = Math.floor(current).toLocaleString() + suffix;
      }

      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  // Trigger counters on scroll
  const metricsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const values = entry.target.querySelectorAll(".metric-value");
        values.forEach(v => {
          const target = v.dataset.target;
          const suffix = v.dataset.suffix || "";
          const isFloat = target.includes(".");
          animateCounter(v, target, suffix, isFloat);
        });
        metricsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  const metricsGrid = document.querySelector(".metrics-grid");
  if (metricsGrid) metricsObserver.observe(metricsGrid);

  // ═══════════════════════════════════════════════
  //  6. FETCH MODEL INFO
  // ═══════════════════════════════════════════════
  fetchModelInfo();

  async function fetchModelInfo() {
    try {
      const res = await fetch("/model-info");
      const data = await res.json();

      // Update metric card targets with real data
      const vocabEl = document.querySelector("#metricVocab .metric-value");
      const paramsEl = document.querySelector("#metricParams .metric-value");
      const seqEl = document.querySelector("#metricSamples .metric-value");

      if (vocabEl && data.vocabulary) {
        vocabEl.dataset.target = data.vocabulary.replace(/,/g, "");
      }
      if (paramsEl && data.parameters) {
        const paramNum = parseFloat(data.parameters);
        if (!isNaN(paramNum)) {
          paramsEl.dataset.target = paramNum;
          paramsEl.dataset.suffix = data.parameters.replace(/[0-9.]/g, "");
        }
      }
    } catch (e) {
      console.warn("Could not fetch model info:", e);
    }
  }

  // ═══════════════════════════════════════════════
  //  7. CHARACTER COUNT
  // ═══════════════════════════════════════════════
  const inputText = document.getElementById("inputText");
  const charCount = document.getElementById("charCount");

  inputText.addEventListener("input", () => {
    const len = inputText.value.length;
    charCount.textContent = `${len} char${len !== 1 ? "s" : ""}`;
  });

  // ═══════════════════════════════════════════════
  //  8. PREDICTION HANDLER
  // ═══════════════════════════════════════════════
  const predictBtn = document.getElementById("predictBtn");
  const btnLabel = document.getElementById("btnLabel");
  const processing = document.getElementById("processing");
  const resultCard = document.getElementById("resultCard");
  const resultPlaceholder = document.getElementById("resultPlaceholder");
  const resultContent = document.getElementById("resultContent");
  const resultWord = document.getElementById("resultWord");
  const resultConfInline = document.getElementById("resultConfInline");

  predictBtn.addEventListener("click", handlePredict);

  // Enter key
  inputText.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      predictBtn.click();
    }
  });

  async function handlePredict() {
    const text = inputText.value.trim();
    if (!text) {
      shakeElement(inputText);
      return;
    }

    // Disable & show processing
    predictBtn.disabled = true;
    btnLabel.textContent = "Processing...";
    processing.classList.add("active");
    resultPlaceholder.style.display = "none";
    resultContent.style.display = "none";

    // Animate processing steps
    await animateProcessingSteps();

    try {
      const res = await fetch("/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();

      if (data.error) {
        showError(data.error);
        return;
      }

      if (data.predictions && data.predictions.length > 0) {
        displayResults(data.predictions);
        animateArchitectureFlow();
      }
    } catch (err) {
      showError("Connection error — is the server running?");
    } finally {
      predictBtn.disabled = false;
      btnLabel.textContent = "Generate Prediction";
      processing.classList.remove("active");
      resetProcessingSteps();
    }
  }

  function shakeElement(el) {
    el.style.animation = "none";
    el.offsetHeight; // reflow
    el.style.animation = "shake 0.4s ease";
    setTimeout(() => el.style.animation = "", 400);
  }

  function showError(msg) {
    resultPlaceholder.style.display = "block";
    resultPlaceholder.innerHTML = `<div class="placeholder-icon">⚠️</div><p style="color:#ff6b6b">${msg}</p>`;
    resultContent.style.display = "none";
  }

  // ═══════════════════════════════════════════════
  //  9. PROCESSING STEPS ANIMATION
  // ═══════════════════════════════════════════════
  async function animateProcessingSteps() {
    const steps = [
      document.getElementById("step1"),
      document.getElementById("step2"),
      document.getElementById("step3"),
    ];

    for (let i = 0; i < steps.length; i++) {
      steps[i].classList.add("active");
      steps[i].querySelector(".step-indicator").textContent = "◠";
      await delay(400 + Math.random() * 300);
      steps[i].classList.remove("active");
      steps[i].classList.add("done");
      steps[i].querySelector(".step-indicator").textContent = "✓";
    }
    await delay(200);
  }

  function resetProcessingSteps() {
    ["step1", "step2", "step3"].forEach(id => {
      const el = document.getElementById(id);
      el.classList.remove("active", "done");
      el.querySelector(".step-indicator").textContent = "◌";
    });
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ═══════════════════════════════════════════════
  //  10. DISPLAY RESULTS
  // ═══════════════════════════════════════════════
  function displayResults(predictions) {
    const top = predictions[0];

    // Show result card
    resultPlaceholder.style.display = "none";
    resultContent.style.display = "block";
    resultCard.classList.add("has-result");

    // Animate word appearance
    resultWord.textContent = top.word.toUpperCase();
    resultWord.style.animation = "none";
    resultWord.offsetHeight;
    resultWord.style.animation = "word-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1)";

    const confPct = (top.confidence * 100).toFixed(1);
    resultConfInline.textContent = confPct + "%";

    // Update gauge
    animateGauge(top.confidence);

    // Update prediction bars
    renderPredBars(predictions);
  }

  // ═══════════════════════════════════════════════
  //  11. CONFIDENCE GAUGE
  // ═══════════════════════════════════════════════
  function animateGauge(confidence) {
    const gaugeProgress = document.getElementById("gaugeProgress");
    const gaugePct = document.getElementById("gaugePct");
    if (!gaugeProgress || !gaugePct) return;

    const circumference = 2 * Math.PI * 60; // r=60
    const offset = circumference - (confidence * circumference);

    gaugeProgress.style.strokeDasharray = circumference;
    gaugeProgress.style.strokeDashoffset = circumference;

    // Trigger reflow, then animate
    requestAnimationFrame(() => {
      gaugeProgress.style.strokeDashoffset = offset;
    });

    // Animate percentage text
    const targetPct = Math.round(confidence * 100);
    let current = 0;
    const step = Math.max(1, Math.floor(targetPct / 30));
    const interval = setInterval(() => {
      current = Math.min(current + step, targetPct);
      gaugePct.textContent = current + "%";
      if (current >= targetPct) clearInterval(interval);
    }, 30);
  }

  // ═══════════════════════════════════════════════
  //  12. PREDICTION BARS
  // ═══════════════════════════════════════════════
  function renderPredBars(predictions) {
    const container = document.getElementById("predBars");
    if (!container) return;
    container.innerHTML = "";

    const maxConf = predictions[0].confidence;

    predictions.forEach((pred, i) => {
      const widthPct = maxConf > 0 ? (pred.confidence / maxConf) * 100 : 0;
      const confPct = (pred.confidence * 100).toFixed(1);

      const bar = document.createElement("div");
      bar.className = "pred-bar";
      bar.innerHTML = `
        <div class="pred-bar-header">
          <span class="pred-word">${pred.word}</span>
          <span class="pred-pct">${confPct}%</span>
        </div>
        <div class="pred-track">
          <div class="pred-fill" style="width: 0%"></div>
        </div>
      `;
      container.appendChild(bar);

      // Staggered animation
      setTimeout(() => {
        bar.querySelector(".pred-fill").style.width = widthPct + "%";
      }, 100 * (i + 1));
    });
  }
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Neural network layers
    const layerConfig = [
      { name: "Input", neurons: 4, color: "#00F5FF" },
      { name: "Embedding", neurons: 6, color: "#3B82F6" },
      { name: "LSTM", neurons: 8, color: "#7B61FF" },
      { name: "Dense", neurons: 6, color: "#A855F7" },
      { name: "Softmax", neurons: 4, color: "#EC4899" },
      { name: "Output", neurons: 1, color: "#10B981" },
    ];

    let particles = [];
    let time = 0;

    // Create particles flowing through network
    function spawnParticle() {
      if (particles.length > 25) return;
      const layerIdx = Math.floor(Math.random() * (layerConfig.length - 1));
      particles.push({
        fromLayer: layerIdx,
        toLayer: layerIdx + 1,
        fromNeuron: Math.floor(Math.random() * layerConfig[layerIdx].neurons),
        toNeuron: Math.floor(Math.random() * layerConfig[layerIdx + 1].neurons),
        progress: 0,
        speed: 0.008 + Math.random() * 0.012,
        alpha: 0.6 + Math.random() * 0.4,
      });
    }

    function getNeuronPos(layerIdx, neuronIdx, totalNeurons) {
      const padding = 80;
      const layerSpacing = (canvas.width - padding * 2) / (layerConfig.length - 1);
      const x = padding + layerIdx * layerSpacing;
      const neuronSpacing = Math.min(40, (canvas.height - 120) / (totalNeurons + 1));
      const startY = (canvas.height - (totalNeurons - 1) * neuronSpacing) / 2;
      const y = startY + neuronIdx * neuronSpacing;
      return { x, y };
    }

    function drawNetwork() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.015;

      // Draw connections (faint lines)
      for (let i = 0; i < layerConfig.length - 1; i++) {
        for (let j = 0; j < layerConfig[i].neurons; j++) {
          for (let k = 0; k < layerConfig[i + 1].neurons; k++) {
            const from = getNeuronPos(i, j, layerConfig[i].neurons);
            const to = getNeuronPos(i + 1, k, layerConfig[i + 1].neurons);
            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Draw particles
      if (Math.random() < 0.15) spawnParticle();

      particles = particles.filter(p => {
        p.progress += p.speed;
        if (p.progress >= 1) return false;

        const from = getNeuronPos(p.fromLayer, p.fromNeuron, layerConfig[p.fromLayer].neurons);
        const to = getNeuronPos(p.toLayer, p.toNeuron, layerConfig[p.toLayer].neurons);
        const x = from.x + (to.x - from.x) * p.progress;
        const y = from.y + (to.y - from.y) * p.progress;
        const alpha = p.alpha * Math.sin(p.progress * Math.PI);

        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = layerConfig[p.fromLayer].color + Math.floor(alpha * 255).toString(16).padStart(2, "0");
        ctx.fill();

        // Glow
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        const glow = ctx.createRadialGradient(x, y, 0, x, y, 6);
        glow.addColorStop(0, layerConfig[p.fromLayer].color + "40");
        glow.addColorStop(1, "transparent");
        ctx.fillStyle = glow;
        ctx.fill();

        // Trail line
        ctx.beginPath();
        ctx.moveTo(from.x + (to.x - from.x) * Math.max(0, p.progress - 0.1), from.y + (to.y - from.y) * Math.max(0, p.progress - 0.1));
        ctx.lineTo(x, y);
        ctx.strokeStyle = layerConfig[p.fromLayer].color + "20";
        ctx.lineWidth = 1;
        ctx.stroke();

        return true;
      });

      // Draw neurons
      for (let i = 0; i < layerConfig.length; i++) {
        for (let j = 0; j < layerConfig[i].neurons; j++) {
          const pos = getNeuronPos(i, j, layerConfig[i].neurons);
          const pulse = 1 + 0.15 * Math.sin(time * 2 + i * 0.5 + j * 0.3);
          const radius = 5 * pulse;

          // Outer glow
          const glow = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, radius * 3);
          glow.addColorStop(0, layerConfig[i].color + "30");
          glow.addColorStop(1, "transparent");
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, radius * 3, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();

          // Neuron
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
          ctx.fillStyle = layerConfig[i].color;
          ctx.fill();

          // Inner highlight
          ctx.beginPath();
          ctx.arc(pos.x - 1, pos.y - 1, radius * 0.4, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255,255,255,0.3)";
          ctx.fill();
        }

        // Layer label
        const labelPos = getNeuronPos(i, 0, layerConfig[i].neurons);
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.font = "500 11px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(layerConfig[i].name, labelPos.x, canvas.height - 15);
      }

      animId = requestAnimationFrame(drawNetwork);
    }

    // Only animate when visible
    const neuralObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          drawNetwork();
        } else {
          cancelAnimationFrame(animId);
        }
      });
    }, { threshold: 0.1 });
    neuralObserver.observe(canvas);
  }

  // ═══════════════════════════════════════════════
  //  15. SHAKE ANIMATION (CSS injection)
  // ═══════════════════════════════════════════════
  const style = document.createElement("style");
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-6px); }
      75% { transform: translateX(6px); }
    }
  `;
  document.head.appendChild(style);

});
