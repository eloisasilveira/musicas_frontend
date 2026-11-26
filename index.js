const URL_API = "https://musicas-backend-blue.vercel.app";

let musicas = [];
let activeSlideIndex = 0;
let sfxEnabled = true;

const progressiveBlueScale = [
  {
    bg: "linear-gradient(155deg, rgba(125, 211, 252, 0.62) 0%, rgba(14, 165, 233, 0.52) 52%, rgba(7, 46, 84, 0.72) 100%)",
    border: "rgba(186, 230, 253, 0.62)",
    cardGlow: "rgba(125, 211, 252, 0.28)",
    vinylGlow: "rgba(125, 211, 252, 0.34)",
    vinylLabel: "radial-gradient(circle at 35% 35%, #bae6fd, #0ea5e9 62%, #0369a1 100%)"
  },
  {
    bg: "linear-gradient(155deg, rgba(56, 189, 248, 0.6) 0%, rgba(2, 132, 199, 0.52) 54%, rgba(8, 38, 78, 0.74) 100%)",
    border: "rgba(125, 211, 252, 0.52)",
    cardGlow: "rgba(56, 189, 248, 0.25)",
    vinylGlow: "rgba(56, 189, 248, 0.3)",
    vinylLabel: "radial-gradient(circle at 35% 35%, #7dd3fc, #0284c7 62%, #0c4a6e 100%)"
  },
  {
    bg: "linear-gradient(155deg, rgba(14, 165, 233, 0.58) 0%, rgba(29, 78, 216, 0.54) 55%, rgba(8, 28, 68, 0.76) 100%)",
    border: "rgba(96, 165, 250, 0.48)",
    cardGlow: "rgba(59, 130, 246, 0.24)",
    vinylGlow: "rgba(59, 130, 246, 0.28)",
    vinylLabel: "radial-gradient(circle at 35% 35%, #60a5fa, #2563eb 62%, #1e3a8a 100%)"
  },
  {
    bg: "linear-gradient(155deg, rgba(37, 99, 235, 0.6) 0%, rgba(30, 58, 138, 0.58) 56%, rgba(6, 19, 54, 0.78) 100%)",
    border: "rgba(96, 165, 250, 0.42)",
    cardGlow: "rgba(37, 99, 235, 0.24)",
    vinylGlow: "rgba(37, 99, 235, 0.28)",
    vinylLabel: "radial-gradient(circle at 35% 35%, #3b82f6, #1d4ed8 65%, #172554 100%)"
  },
  {
    bg: "linear-gradient(155deg, rgba(29, 78, 216, 0.62) 0%, rgba(23, 37, 84, 0.66) 58%, rgba(5, 13, 38, 0.84) 100%)",
    border: "rgba(59, 130, 246, 0.36)",
    cardGlow: "rgba(29, 78, 216, 0.24)",
    vinylGlow: "rgba(29, 78, 216, 0.28)",
    vinylLabel: "radial-gradient(circle at 35% 35%, #2563eb, #1e40af 65%, #0f172a 100%)"
  },
  {
    bg: "linear-gradient(155deg, rgba(30, 58, 138, 0.65) 0%, rgba(15, 23, 42, 0.76) 60%, rgba(3, 7, 22, 0.9) 100%)",
    border: "rgba(56, 189, 248, 0.28)",
    cardGlow: "rgba(30, 58, 138, 0.26)",
    vinylGlow: "rgba(30, 64, 175, 0.3)",
    vinylLabel: "radial-gradient(circle at 35% 35%, #1d4ed8, #172554 68%, #020617 100%)"
  }
];

function getProgressiveBlueTheme(index, totalCount) {
  if (totalCount <= 1) return progressiveBlueScale[0];
  const ratio = index / (totalCount - 1);
  const scaleIdx = Math.min(
    progressiveBlueScale.length - 1,
    Math.round(ratio * (progressiveBlueScale.length - 1))
  );
  return progressiveBlueScale[scaleIdx];
}

let audioCtx = null;

function playAiryWhoosh(direction = 1) {
  if (!sfxEnabled) return;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!audioCtx) audioCtx = new AudioContextClass();
    if (audioCtx.state === "suspended") audioCtx.resume();

    const now = audioCtx.currentTime;
    const duration = 0.46;
    const bufferSize = Math.floor(audioCtx.sampleRate * duration);
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      const pink = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.16;
      b6 = white * 0.115926;

      const envelope = Math.sin((i / bufferSize) * Math.PI);
      output[i] = pink * envelope;
    }

    const noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const lowpassFilter = audioCtx.createBiquadFilter();
    lowpassFilter.type = "lowpass";
    lowpassFilter.Q.setValueAtTime(3.2, now);

    const startFreq = direction >= 0 ? 260 : 620;
    const peakFreq = direction >= 0 ? 780 : 420;
    const endFreq = 180;

    lowpassFilter.frequency.setValueAtTime(startFreq, now);
    lowpassFilter.frequency.exponentialRampToValueAtTime(peakFreq, now + 0.16);
    lowpassFilter.frequency.exponentialRampToValueAtTime(endFreq, now + duration);

    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.linearRampToValueAtTime(0.46, now + 0.13);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    noiseSource.connect(lowpassFilter);
    lowpassFilter.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    noiseSource.start(now);
    noiseSource.stop(now + duration);
  } catch (e) {}
}

document.getElementById("btnToggleSfx").addEventListener("click", () => {
  sfxEnabled = !sfxEnabled;
  const btn = document.getElementById("btnToggleSfx");
  btn.classList.toggle("muted", !sfxEnabled);
  document.getElementById("sfxIconOn").style.display = sfxEnabled ? "block" : "none";
  document.getElementById("sfxIconOff").style.display = sfxEnabled ? "none" : "block";
  if (sfxEnabled) playAiryWhoosh(1);
});

function buildWaveformBars(seed) {
  const heights = [30, 65, 45, 90, 55, 100, 70, 40, 85, 60, 95, 50, 75, 35, 80, 55, 40, 70, 45, 30];
  return heights
    .map((h, i) => {
      const mod = ((h + (Number(seed) || 1) * 17 + i * 11) % 75) + 25;
      return `<span style="height:${mod}%"></span>`;
    })
    .join("");
}

function createCardHTML(track, indexNumber, totalCount) {
  const theme = getProgressiveBlueTheme(indexNumber, totalCount);
  const formattedIndex = String(indexNumber + 1).padStart(2, "0");

  return `
    <div class="album-tilt-shell">
      <div class="card-right-vinyl" style="--vinyl-glow: ${theme.vinylGlow}; --vinyl-label-grad: ${theme.vinylLabel};"></div>
      <div class="album-cover-surface" style="background: ${theme.bg}; --card-border: ${theme.border}; --card-ambient-glow: ${theme.cardGlow};">
        <div class="cover-header-row">
          <span class="cover-genre-pill">${track.genero}</span>
          <div class="cover-top-right-meta">
            <span class="cover-catalog-index">#${formattedIndex}</span>
            <span class="cover-year-badge">${track.ano}</span>
          </div>
        </div>

        <div class="cover-waveform-detail" aria-hidden="true">
          ${buildWaveformBars(track.id)}
        </div>

        <div class="cover-footer-row">
          <div class="cover-song-meta">
            <div class="cover-serif-title">${track.titulo}</div>
            <div class="cover-artist-line">${track.artista}</div>
            <span class="cover-duration-tag">${track.duracao} min</span>
          </div>

          <div class="cover-action-buttons">
            <a href="editar.html?id=${track.id}" class="circle-icon-action edit-btn" title="Editar música" aria-label="Editar">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
            </a>
            <button type="button" class="circle-icon-action delete-btn" onclick="apagarMusica(${track.id})" title="Apagar música" aria-label="Apagar">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderCoverflow(rebuildDom = true) {
  const stage = document.getElementById("listaMusicas");
  const dockTitle = document.getElementById("dockTrackTitle");
  const dockCounter = document.getElementById("dockTrackCounter");
  const dotsRow = document.getElementById("carouselDotsRow");

  if (musicas.length === 0) {
    stage.innerHTML = `
      <div style="text-align:center; padding: 38px 26px; border-radius: 26px; background: rgba(10, 18, 36, 0.72); backdrop-filter: blur(18px); border: 1px solid rgba(125,211,252,0.28);">
        <p style="color: var(--text-secondary); margin-bottom: 16px;">Nenhuma música cadastrada ainda.</p>
        <a href="cadastrar.html" class="primary-add-btn">+ Cadastrar primeira música</a>
      </div>
    `;
    dotsRow.innerHTML = "";
    dockTitle.textContent = "Acervo vazio";
    dockCounter.textContent = "00 / 00 • Cadastre uma faixa";
    return;
  }

  if (activeSlideIndex >= musicas.length) activeSlideIndex = musicas.length - 1;
  if (activeSlideIndex < 0) activeSlideIndex = 0;

  const currentTrack = musicas[activeSlideIndex];
  dockTitle.textContent = currentTrack.titulo;
  dockCounter.textContent = `${String(activeSlideIndex + 1).padStart(2, "0")} / ${String(musicas.length).padStart(2, "0")} • ${currentTrack.artista}`;

  if (rebuildDom || stage.querySelectorAll(".album-card-3d").length !== musicas.length) {
    stage.innerHTML = "";
    dotsRow.innerHTML = "";

    musicas.forEach((track, idx) => {
      const card = document.createElement("article");
      card.className = "album-card-3d";
      card.dataset.index = String(idx);
      card.innerHTML = createCardHTML(track, idx, musicas.length);

      const tiltShell = card.querySelector(".album-tilt-shell");
      card.addEventListener("mousemove", (e) => {
        if (Number(card.dataset.index) !== activeSlideIndex) return;
        const rect = card.getBoundingClientRect();
        const relX = (e.clientX - rect.left) / rect.width - 0.5;
        const relY = (e.clientY - rect.top) / rect.height - 0.5;
        tiltShell.style.transform = `rotateY(${relX * 12}deg) rotateX(${-relY * 12}deg) translateZ(8px)`;
      });

      card.addEventListener("mouseleave", () => {
        tiltShell.style.transform = "rotateY(0deg) rotateX(0deg) translateZ(0px)";
      });

      card.addEventListener("click", (e) => {
        if (e.target.closest("a") || e.target.closest("button")) return;
        const clickedIdx = Number(card.dataset.index);
        if (clickedIdx !== activeSlideIndex) {
          const dir = clickedIdx > activeSlideIndex ? 1 : -1;
          navigateToIndex(clickedIdx, dir);
        }
      });

      stage.appendChild(card);

      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "carousel-dot";
      dot.addEventListener("click", () => {
        if (idx === activeSlideIndex) return;
        const dir = idx > activeSlideIndex ? 1 : -1;
        navigateToIndex(idx, dir);
      });
      dotsRow.appendChild(dot);
    });
  }

  const cards = stage.querySelectorAll(".album-card-3d");
  const dots = dotsRow.querySelectorAll(".carousel-dot");

  cards.forEach((card, idx) => {
    const offset = idx - activeSlideIndex;
    const absOffset = Math.abs(offset);
    const isCenter = offset === 0;

    card.classList.toggle("is-center", isCenter);

    if (absOffset > 3) {
      card.style.opacity = "0";
      card.style.pointerEvents = "none";
      card.style.transform = `translate3d(${offset * 220}px, 36px, -380px) scale(0.56)`;
    } else {
      card.style.pointerEvents = "auto";
      const angleRad = offset * 0.44;
      const radius = 560;
      const translateX = Math.sin(angleRad) * radius;
      const translateZ = (Math.cos(angleRad) - 1) * radius + (isCenter ? 48 : -45);
      const translateY = absOffset * 8;
      const rotateY = -offset * 26;
      const scale = isCenter ? 1 : Math.max(0.74, 1 - absOffset * 0.1);

      card.style.zIndex = String(25 - absOffset);
      card.style.opacity = isCenter ? "1" : String(Math.max(0.42, 0.88 - absOffset * 0.2));
      card.style.filter = isCenter ? "none" : "brightness(0.74)";
      card.style.transform = `translate3d(${translateX}px, ${translateY}px, ${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`;
    }

    if (dots[idx]) {
      dots[idx].classList.toggle("active", isCenter);
    }
  });
}

function navigateToIndex(targetIndex, dir) {
  if (musicas.length <= 1 || targetIndex === activeSlideIndex) return;
  playAiryWhoosh(dir);
  activeSlideIndex = targetIndex;
  renderCoverflow(false);
}

function stepSlide(delta) {
  if (musicas.length <= 1) return;
  const nextIdx = (activeSlideIndex + delta + musicas.length) % musicas.length;
  navigateToIndex(nextIdx, delta);
}

function updateLibraryStats() {
  const totalTracks = musicas.length;
  const totalMinutes = musicas.reduce((acc, m) => acc + (Number(m.duracao) || 0), 0);

  document.getElementById("totalTracksBadge").textContent = String(totalTracks);
  document.getElementById("statTotalTracks").textContent = String(totalTracks).padStart(2, "0");
  document.getElementById("statTotalMinutes").textContent = `${totalMinutes} min`;

  if (totalTracks === 0) {
    document.getElementById("statTopDecade").textContent = "—";
    document.getElementById("statDecadeDetail").textContent = "Nenhuma faixa cadastrada";
    return;
  }

  const decadeCounts = {};
  let topDecade = null;
  let maxCount = 0;

  musicas.forEach((m) => {
    const year = Number(m.ano) || 2000;
    const decade = Math.floor(year / 10) * 10;
    decadeCounts[decade] = (decadeCounts[decade] || 0) + 1;
    if (decadeCounts[decade] > maxCount) {
      maxCount = decadeCounts[decade];
      topDecade = decade;
    }
  });

  document.getElementById("statTopDecade").textContent = `Anos ${topDecade}`;
  document.getElementById("statDecadeDetail").textContent =
    `${maxCount} ${maxCount === 1 ? "faixa desta década" : "faixas desta década"}`;
}

async function carregarMusicas() {
  try {
    const resposta = await fetch(URL_API);
    musicas = await resposta.json();
    updateLibraryStats();
    renderCoverflow(true);
  } catch (erro) {
    console.error("Erro ao carregar músicas:", erro);
  }
}

async function apagarMusica(id) {
  const confirmar = confirm("Tem certeza que deseja apagar esta música?");
  if (!confirmar) return;

  try {
    let resposta = await fetch(`${URL_API}/apagar/${id}`, {
      method: "DELETE"
    });

    if (!resposta.ok) {
      resposta = await fetch(`${URL_API}/deletar/${id}`, {
        method: "DELETE"
      });
    }

    if (!resposta.ok) {
      resposta = await fetch(`${URL_API}/musica/${id}`, {
        method: "DELETE"
      });
    }

    const dados = await resposta.json();
    alert(dados.mensagem || "Música apagada!");
    playAiryWhoosh(-1);
    carregarMusicas();
  } catch (erro) {
    console.error("Erro ao apagar música:", erro);
  }
}

document.getElementById("btnPrevCard").addEventListener("click", () => stepSlide(-1));
document.getElementById("btnNextCard").addEventListener("click", () => stepSlide(1));

window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") stepSlide(-1);
  if (e.key === "ArrowRight") stepSlide(1);
});

const viewport = document.getElementById("coverflowViewport");
const stageEl = document.getElementById("listaMusicas");
const hudEl = document.getElementById("spatialArHud");
const telemetryEl = document.getElementById("arCoordsTelemetry");

viewport.addEventListener("mousemove", (e) => {
  const rect = viewport.getBoundingClientRect();
  const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
  const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
  const rotY = (nx * 6.5).toFixed(1);
  const rotX = (-ny * 5.0).toFixed(1);

  stageEl.style.transform = `rotateY(${rotY}deg) rotateX(${rotX}deg)`;
  if (hudEl) {
    hudEl.style.transform = `translate3d(${(-nx * 14).toFixed(1)}px, ${(-ny * 10).toFixed(1)}px, -30px) rotateY(${(nx * 3).toFixed(1)}deg)`;
  }
  if (telemetryEl) {
    telemetryEl.textContent = `X: ${rotX}° | Y: ${rotY}° | Z: +48mm`;
  }
});

viewport.addEventListener("mouseleave", () => {
  stageEl.style.transform = "rotateY(0deg) rotateX(0deg)";
  if (hudEl) hudEl.style.transform = "translate3d(0, 0, 0)";
  if (telemetryEl) telemetryEl.textContent = "X: 00.0° | Y: 00.0° | Z: +48mm";
});

carregarMusicas();