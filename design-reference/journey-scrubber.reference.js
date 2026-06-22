/* ============================================================
   POWER STAR — "The Journey" single-clip frame scrubber (v2)
   ONE continuous cinematic take decoded into cached still frames
   at load, painted to a canvas indexed by scroll. Robust:
   - lighter frames (no upscale) + retry so extraction never stalls
   - a loading indicator while frames decode
   - scrubbing gated until ALL frames are ready (smooth, never stuck)
   API: window.JOURNEY { init, setProgress, jump, ready }
   ============================================================ */
(function () {
  const FRAMES = 96;                  // stills across the 10s clip
  const MAXW = 1280;                  // never upscale past the clip's native width
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let canvas, ctx, dpr = 1;
  let frames = new Array(FRAMES).fill(null);
  let loadedCount = 0, allReady = false, firstUp = false;
  let targetP = 0, curP = 0, raf = 0;
  let videoSrc = 'media/journey.mp4';
  let loaderEl, barEl, pctEl;

  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));

  /* ---------- hidden source video ---------- */
  function makeVideo(src) {
    const v = document.createElement('video');
    v.src = src; v.muted = true; v.defaultMuted = true;
    v.playsInline = true; v.preload = 'auto'; v.crossOrigin = 'anonymous';
    v.style.cssText = 'position:absolute;width:2px;height:2px;opacity:0;pointer-events:none;left:-10px;top:-10px;';
    document.body.appendChild(v);
    return v;
  }
  function seekTo(v, t) {
    return new Promise(res => {
      let done = false;
      const fin = () => { if (done) return; done = true; v.removeEventListener('seeked', fin); res(); };
      v.addEventListener('seeked', fin);
      try { v.currentTime = t; } catch (e) { fin(); }
      setTimeout(fin, 900);
    });
  }
  function bufferReady(v) {
    return new Promise(res => {
      if (v.readyState >= 3) return res();
      const ok = () => { v.removeEventListener('canplaythrough', ok); v.removeEventListener('canplay', ok); res(); };
      v.addEventListener('canplaythrough', ok, { once: true });
      v.addEventListener('canplay', ok, { once: true });
      try { v.load(); } catch (e) {}
      const pr = v.play(); if (pr && pr.catch) pr.catch(() => {});
      setTimeout(res, 9000);
    });
  }

  async function grab(v, w, h) {
    // try ImageBitmap (fast), retry once, then fall back to a 2D canvas copy
    for (let attempt = 0; attempt < 2; attempt++) {
      try { return await createImageBitmap(v, { resizeWidth: w, resizeHeight: h, resizeQuality: 'high' }); }
      catch (e) { await new Promise(r => setTimeout(r, 60)); }
    }
    try {
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      c.getContext('2d').drawImage(v, 0, 0, w, h);
      return c;   // canvas is drawable too
    } catch (e) { return null; }
  }

  async function extract() {
    const v = makeVideo(videoSrc);
    await bufferReady(v);
    try { v.pause(); } catch (e) {}
    const dur = (v.duration && isFinite(v.duration)) ? v.duration : 10;
    const nativeW = v.videoWidth || MAXW, nativeH = v.videoHeight || 720;
    const w = Math.min(MAXW, nativeW);
    const h = Math.round(w * (nativeH / nativeW));

    for (let i = 0; i < FRAMES; i++) {
      const t = (i / (FRAMES - 1)) * (dur - 0.05);
      await seekTo(v, t);
      let img = await grab(v, w, h);
      if (!img && i > 0) img = frames[i - 1];      // last-resort: reuse previous
      frames[i] = img;
      loadedCount++;
      updateLoader();
      if (i === 0 && !firstUp) { firstUp = true; begin(); }   // show first frame ASAP
      // let the decoder breathe so the page stays responsive while loading
      if (i % 6 === 5) await new Promise(r => setTimeout(r, 16));
    }
    v.remove();
    allReady = true;
    hideLoader();
  }

  /* ---------- loader UI ---------- */
  function buildLoader() {
    const host = canvas.parentElement || document.body;
    loaderEl = document.createElement('div');
    loaderEl.className = 'seq-loader';
    loaderEl.innerHTML =
      '<div class="seq-loader-inner">' +
        '<div class="seq-loader-row"><span class="seq-loader-label">Loading the journey</span>' +
        '<span class="seq-loader-pct">0%</span></div>' +
        '<div class="seq-loader-track"><div class="seq-loader-bar"></div></div>' +
      '</div>';
    host.appendChild(loaderEl);
    barEl = loaderEl.querySelector('.seq-loader-bar');
    pctEl = loaderEl.querySelector('.seq-loader-pct');
  }
  function updateLoader() {
    if (!barEl) return;
    const pct = Math.round((loadedCount / FRAMES) * 100);
    barEl.style.width = pct + '%';
    if (pctEl) pctEl.textContent = pct + '%';
  }
  function hideLoader() {
    if (!loaderEl) return;
    loaderEl.classList.add('done');
    setTimeout(() => { loaderEl && loaderEl.remove(); loaderEl = null; }, 600);
  }

  /* ---------- canvas ---------- */
  function resize() {
    if (!canvas) return;
    const host = canvas.parentElement || document.body;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = host.clientWidth, h = host.clientHeight || window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
  }
  function drawCover(bmp) {
    const cw = canvas.width, ch = canvas.height;
    const ir = bmp.width / bmp.height, cr = cw / ch;
    let dw, dh;
    if (ir > cr) { dh = ch; dw = ch * ir; } else { dw = cw; dh = cw / ir; }
    ctx.drawImage(bmp, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
  }
  function frameAt(p) {
    // until fully loaded, clamp the index to what we actually have (never jump to a missing/duplicated tail)
    const maxIdx = allReady ? FRAMES - 1 : Math.max(0, loadedCount - 1);
    const idx = Math.min(maxIdx, Math.max(0, Math.round(p * (FRAMES - 1))));
    return frames[idx] || frames[Math.max(0, Math.min(idx, loadedCount - 1))];
  }

  function render() {
    raf = requestAnimationFrame(render);
    // gentle easing toward the scroll target
    curP += (targetP - curP) * (reduced ? 1 : 0.16);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const bmp = frameAt(curP);
    if (bmp) drawCover(bmp);
  }
  function begin() { if (raf) return; resize(); render(); }

  function init() {
    canvas = document.getElementById('seq');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    const RES = window.__resources || {};
    if (RES.journey) videoSrc = RES.journey;
    resize();
    buildLoader();
    window.addEventListener('resize', resize);
    extract();
  }

  window.JOURNEY = {
    init,
    setProgress(p) { targetP = clamp(p); },
    jump(p) { targetP = curP = clamp(p); },
    get ready() { return firstUp; },
    get loaded() { return allReady; }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
