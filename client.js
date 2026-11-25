/* dsh-moyu — a build-log panel that happens to be a snake game.
 * Client half. No build step: this file is shipped as-is.
 */
window.__ModuleLoader__.load({
  id: 'dsh-moyu',
  factory(require) {
    'use strict';

    const React = require('react');
    const { useState, useEffect, useRef } = React;
    const h = React.createElement;

    const COLS = 56, ROWS = 14;

    /* ------------------------------------------------------------------ *
     * styles
     * ------------------------------------------------------------------ */

    const STYLE = `
.dshm-launch{display:inline-flex;align-items:center;gap:5px;height:26px;padding:0 9px;border-radius:7px;
  border:1px solid currentColor;background:transparent;color:inherit;opacity:.45;cursor:pointer;
  font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;letter-spacing:.02em;
  transition:opacity .15s ease}
.dshm-launch:hover{opacity:.85}
.dshm-launch b{font-weight:500}

/* fixed to the viewport, not to the slot container: the slot may only span
   part of the window (the panel could never be dragged past its edge). */
.dshm-overlay{position:fixed;inset:0;z-index:2147482000;pointer-events:none}
.dshm-host{position:absolute;inset:0;pointer-events:none}
.dshm-win{
  --dshm-bg:#FBFAF7; --dshm-chrome:#F4F2EC; --dshm-line:#E6E2D8; --dshm-ink:#3B3A35;
  --dshm-muted:#8B8880; --dshm-faint:#C9C5BA; --dshm-green:#5C8F52; --dshm-amber:#B4832B;
  --dshm-red:#B4736A; --dshm-dot:#D9D4C6; --dshm-body:#B9CFAE; --dshm-head:#7BA26F; --dshm-food:#C0912F;
  position:absolute;pointer-events:auto;width:760px;max-height:calc(100vh - 24px);
  display:flex;flex-direction:column;background:var(--dshm-bg);
  border:1px solid var(--dshm-line);border-radius:10px;overflow:hidden;color:var(--dshm-ink);
  font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  box-shadow:0 20px 44px -30px rgba(0,0,0,.6)}
@media (prefers-color-scheme: dark){
  .dshm-win{--dshm-bg:#1A1B19; --dshm-chrome:#21221F; --dshm-line:#32332E; --dshm-ink:#D9D6CD;
    --dshm-muted:#8B887E; --dshm-faint:#57554D; --dshm-green:#84B075; --dshm-amber:#CFA252;
    --dshm-red:#C08078; --dshm-dot:#3A3B35; --dshm-body:#3F5B39; --dshm-head:#6E9B60; --dshm-food:#CB9330;}
}
.dshm-tabbar{display:flex;align-items:center;gap:2px;height:36px;padding:0 10px;flex:0 0 auto;
  min-width:0;background:var(--dshm-chrome);border-bottom:1px solid var(--dshm-line);font-size:11.5px;
  cursor:grab;user-select:none;-webkit-user-select:none}
.dshm-win.dshm-drag .dshm-tabbar{cursor:grabbing}
.dshm-win.dshm-drag{box-shadow:0 26px 54px -28px rgba(0,0,0,.7)}
.dshm-tab{display:flex;align-items:center;gap:6px;padding:0 10px;height:23px;border-radius:5px;
  color:var(--dshm-muted);flex:0 0 auto;white-space:nowrap}
.dshm-tab.dshm-on{background:var(--dshm-bg);border:1px solid var(--dshm-line);color:var(--dshm-ink)}
.dshm-tab i{width:6px;height:6px;border-radius:50%;background:var(--dshm-green);display:inline-block;flex:0 0 auto}
/* the × must never be squeezed out by a narrow panel */
.dshm-tab span.dshm-close{color:var(--dshm-faint);margin-left:2px;cursor:pointer;font-style:normal;
  line-height:1;font-size:13px;padding:0 2px;border-radius:3px;flex:0 0 auto}
.dshm-tab span.dshm-close:hover{color:var(--dshm-red);background:var(--dshm-chrome)}
.dshm-badge{margin-left:auto;display:flex;align-items:center;gap:5px;font-size:10.5px;color:var(--dshm-green);
  flex:0 1 auto;min-width:0;overflow:hidden}
.dshm-badge.dshm-fail{color:var(--dshm-red)}
.dshm-badge u{width:5px;height:5px;border-radius:50%;background:currentColor;text-decoration:none;flex:0 0 auto}
.dshm-badge span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dshm-ctrls{display:flex;align-items:center;gap:1px;margin-left:8px;flex:0 0 auto}
.dshm-ctrls button{width:21px;height:21px;display:inline-flex;align-items:center;justify-content:center;
  border:0;padding:0;background:transparent;color:var(--dshm-faint);cursor:pointer;border-radius:4px;opacity:.75}
.dshm-ctrls button:hover{background:var(--dshm-bg);color:var(--dshm-ink);opacity:1}
.dshm-ctrls button.dshm-on{color:var(--dshm-ink);opacity:1}
.dshm-ctrls button[data-close]:hover{color:var(--dshm-red)}
.dshm-ctrls svg{display:block}

.dshm-body{flex:1 1 auto;min-height:0;padding:11px 16px 9px;display:flex;flex-direction:column;justify-content:center}
.dshm-log{font-size:12px;line-height:19px;white-space:pre;overflow:hidden;color:var(--dshm-muted)}
.dshm-log .dshm-ts{color:var(--dshm-faint)}
.dshm-log .dshm-info{color:var(--dshm-green)}
.dshm-log .dshm-warn{color:var(--dshm-amber)}
.dshm-log .dshm-debug{color:var(--dshm-faint)}
.dshm-log.dshm-camou{display:none}

.dshm-matrix{margin:9px 0;border:1px solid var(--dshm-line);border-radius:7px;overflow:hidden;flex:0 0 auto}
.dshm-mhead{display:flex;justify-content:space-between;align-items:center;padding:5px 9px 4px;
  font-size:10.5px;color:var(--dshm-faint)}
.dshm-grid{position:relative;width:100%;aspect-ratio:56/14}
.dshm-grid canvas{display:block;width:100%;height:100%}

.dshm-status{display:flex;align-items:center;gap:16px;height:27px;padding:0 16px;flex:0 0 auto;
  background:var(--dshm-chrome);border-top:1px solid var(--dshm-line);font-size:11px;color:var(--dshm-muted)}
.dshm-status .dshm-sp{margin-left:auto}
.dshm-status .dshm-bad{color:var(--dshm-red)}

.dshm-win.dshm-compact .dshm-log:not(.dshm-camou){display:none}
/* drop the second tab when narrow so the × and the controls always have room */
.dshm-win.dshm-compact .dshm-tab:not(.dshm-on){display:none}
.dshm-win.dshm-camo .dshm-matrix{display:none}
.dshm-win.dshm-camo .dshm-log:not(.dshm-camou){display:none}
.dshm-win.dshm-camo .dshm-log.dshm-camou{display:block}
`;

    /* ------------------------------------------------------------------ *
     * game engine (framework-free, mounted into a plain element)
     * ------------------------------------------------------------------ */

    const PKGS = ['pkg/auth/session', 'pkg/http/mw', 'internal/queue/worker',
                  'pkg/store/pg', 'cmd/api', 'internal/metrics', 'pkg/cache/lru'];

    function p2(n, l) { return String(n).padStart(l || 2, '0'); }
    function padRight(s, n) { return s.length >= n ? s.slice(0, n) : s + ' '.repeat(n - s.length); }
    function padLeft(s, n) { s = String(s); return s.length >= n ? s : ' '.repeat(n - s.length) + s; }
    function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

    function nowStr(msAgo) {
      const d = new Date(Date.now() - (msAgo || 0));
      return p2(d.getHours()) + ':' + p2(d.getMinutes()) + ':' + p2(d.getSeconds()) + '.' + p2(d.getMilliseconds(), 3);
    }

    function mountGame(root) {
      root.innerHTML = [
        '<div class="dshm-win">',
        '  <div class="dshm-tabbar">',
        '    <div class="dshm-tab dshm-on"><i></i>build.log<span class="dshm-close" title="close">\u00d7</span></div>',
        '    <div class="dshm-tab">auth-service</div>',
        '    <div class="dshm-badge"><u></u><span data-badge>ci/2841 running</span></div>',
        '    <div class="dshm-ctrls">',
        '      <button type="button" data-zoom title="panel size (' + HOTKEY.size.label + ')"><svg viewBox="0 0 12 12" width="11" height="11"><path d="M4 2H2v2M8 2h2v2M4 10H2V8M8 10h2V8" stroke="currentColor" stroke-width="1.3" fill="none" stroke-linecap="round"/></svg></button>',
        '      <button type="button" data-camo title="hide matrix (' + HOTKEY.camou.label + ')"><svg viewBox="0 0 12 12" width="11" height="11"><path d="M2 3h8M2 6h8M2 9h5" stroke="currentColor" stroke-width="1.3" fill="none" stroke-linecap="round"/></svg></button>',
        '      <button type="button" data-close title="close (' + HOTKEY.open.label + ')"><svg viewBox="0 0 12 12" width="11" height="11"><path d="M3.2 3.2l5.6 5.6M8.8 3.2l-5.6 5.6" stroke="currentColor" stroke-width="1.3" fill="none" stroke-linecap="round"/></svg></button>',
        '    </div>',
        '  </div>',
        '  <div class="dshm-body">',
        '    <div class="dshm-log" data-logtop></div>',
        '    <div class="dshm-matrix">',
        '      <div class="dshm-mhead"><span>worker pool \u00b7 shard 0</span><span data-pool>16 slots \u00b7 8 active</span></div>',
        '      <div class="dshm-grid" data-grid><canvas data-cv></canvas></div>',
        '    </div>',
        '    <div class="dshm-log" data-logbottom></div>',
        '    <div class="dshm-log dshm-camou" data-logcamou></div>',
        '  </div>',
        '  <div class="dshm-status">',
        '    <span data-stleft>\u2713 0 passed</span>',
        '    <span data-stpeak>concurrency peak 0</span>',
        '    <span class="dshm-sp" data-clock>00:00:00</span>',
        '  </div>',
        '</div>'
      ].join('\n');

      const win = root.querySelector('.dshm-win');
      const grid = root.querySelector('[data-grid]');
      const canvas = root.querySelector('[data-cv]');
      const ctx2d = canvas.getContext('2d');
      const logTop = root.querySelector('[data-logtop]');
      const logBottom = root.querySelector('[data-logbottom]');
      const logCamou = root.querySelector('[data-logcamou]');
      const stLeft = root.querySelector('[data-stleft]');
      const stPeak = root.querySelector('[data-stpeak]');
      const stClock = root.querySelector('[data-clock]');
      const poolMeta = root.querySelector('[data-pool]');
      const badge = root.querySelector('.dshm-badge');
      const badgeText = root.querySelector('[data-badge]');
      const tabbar = root.querySelector('.dshm-tabbar');
      const zoomBtn = root.querySelector('[data-zoom]');
      const camoBtn = root.querySelector('[data-camo]');

      const dotLayer = document.createElement('canvas');
      let cell = 14, ox = 0, oy = 0, dpr = 1, palette = {};

      const S = {
        snake: [], dir: { x: 1, y: 0 }, next: { x: 1, y: 0 }, food: { x: 20, y: 7 },
        score: 0, best: 0, step: 118, dead: false, deadAt: 0,
        camou: false, acc: 0, last: 0
      };

      try { S.best = Number(localStorage.getItem('dsh.moyu.best') || 0) || 0; } catch (e) { S.best = 0; }

      function readPalette() {
        const cs = getComputedStyle(win);
        const pick = (name, fb) => {
          const v = (cs.getPropertyValue(name) || '').trim();
          return v || fb;
        };
        palette = {
          bg: pick('--dshm-bg', '#FBFAF7'),
          dot: pick('--dshm-dot', '#D9D4C6'),
          body: pick('--dshm-body', '#B9CFAE'),
          head: pick('--dshm-head', '#7BA26F'),
          food: pick('--dshm-food', '#C0912F')
        };
      }

      function layout() {
        const w = grid.clientWidth, h = grid.clientHeight;
        if (!w || !h) return;
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);

        cell = Math.min(w / COLS, h / ROWS);
        ox = (w - cell * COLS) / 2;
        oy = (h - cell * ROWS) / 2;

        dotLayer.width = Math.round(w * dpr);
        dotLayer.height = Math.round(h * dpr);
        const d = dotLayer.getContext('2d');
        d.setTransform(dpr, 0, 0, dpr, 0, 0);
        d.fillStyle = palette.dot;
        for (let y = 0; y < ROWS; y++) {
          for (let x = 0; x < COLS; x++) {
            d.beginPath();
            d.arc(ox + x * cell + cell / 2, oy + y * cell + cell / 2, 1.05, 0, Math.PI * 2);
            d.fill();
          }
        }
        draw();
      }

      function rrect(x, y, w, hh, r) {
        ctx2d.beginPath();
        ctx2d.moveTo(x + r, y);
        ctx2d.arcTo(x + w, y, x + w, y + hh, r);
        ctx2d.arcTo(x + w, y + hh, x, y + hh, r);
        ctx2d.arcTo(x, y + hh, x, y, r);
        ctx2d.arcTo(x, y, x + w, y, r);
        ctx2d.closePath();
      }

      function draw() {
        if (S.camou) return;
        const w = grid.clientWidth, h = grid.clientHeight;
        if (!w || !h) return;
        ctx2d.fillStyle = palette.bg;
        ctx2d.fillRect(0, 0, w, h);
        ctx2d.drawImage(dotLayer, 0, 0, w, h);

        const pulse = 0.5 + 0.5 * Math.abs(Math.sin(performance.now() / 430));
        ctx2d.globalAlpha = 0.45 + 0.55 * pulse;
        ctx2d.fillStyle = palette.food;
        rrect(ox + S.food.x * cell + 2.4, oy + S.food.y * cell + 2.4, cell - 4.8, cell - 4.8, 2);
        ctx2d.fill();
        ctx2d.globalAlpha = 1;

        for (let i = S.snake.length - 1; i >= 0; i--) {
          const s = S.snake[i];
          const inset = i === 0 ? 1.5 : 2.5;
          ctx2d.fillStyle = S.dead ? (i === 0 ? '#C6887F' : '#DBB4AE') : (i === 0 ? palette.head : palette.body);
          rrect(ox + s.x * cell + inset, oy + s.y * cell + inset, cell - inset * 2, cell - inset * 2, 2.5);
          ctx2d.fill();
        }
      }

      function placeFood() {
        for (let t = 0; t < 400; t++) {
          const p = { x: (Math.random() * COLS) | 0, y: (Math.random() * ROWS) | 0 };
          let hit = false;
          for (let i = 0; i < S.snake.length; i++) {
            if (S.snake[i].x === p.x && S.snake[i].y === p.y) { hit = true; break; }
          }
          if (!hit) { S.food = p; return; }
        }
      }

      function syncStatus() {
        stLeft.textContent = '\u2713 ' + S.score + ' passed';
        stLeft.classList.remove('dshm-bad');
        stPeak.textContent = 'concurrency peak ' + S.best;
        poolMeta.textContent = '16 slots \u00b7 ' + Math.min(16, 8 + Math.floor(S.score / 5)) + ' active';
      }

      function reset() {
        S.snake = [{ x: 8, y: 7 }, { x: 7, y: 7 }, { x: 6, y: 7 }, { x: 5, y: 7 }];
        S.dir = { x: 1, y: 0 };
        S.next = { x: 1, y: 0 };
        S.score = 0;
        S.step = 118;
        S.dead = false;
        S.acc = 0;
        placeFood();
        syncStatus();
        badge.classList.remove('dshm-fail');
        badgeText.textContent = 'ci/2841 running';
      }

      function die() {
        S.dead = true;
        S.deadAt = performance.now();
        if (S.score > S.best) {
          S.best = S.score;
          try { localStorage.setItem('dsh.moyu.best', String(S.best)); } catch (e) { /* ignore */ }
        }
        stLeft.textContent = '\u2717 worker pool stalled \u00b7 restarting';
        stLeft.classList.add('dshm-bad');
        badge.classList.add('dshm-fail');
        badgeText.textContent = 'ci/2841 failed';
      }

      function step() {
        S.dir = S.next;
        const head = { x: S.snake[0].x + S.dir.x, y: S.snake[0].y + S.dir.y };

        if (head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS) { die(); return; }
        for (let i = 0; i < S.snake.length - 1; i++) {
          if (S.snake[i].x === head.x && S.snake[i].y === head.y) { die(); return; }
        }

        S.snake.unshift(head);
        if (head.x === S.food.x && head.y === S.food.y) {
          S.score++;
          if (S.score % 5 === 0) S.step = Math.max(S.step - 7, 66);
          placeFood();
          syncStatus();
        } else {
          S.snake.pop();
        }
      }

      /* ---- fake log ---- */

      let lastTxt = '';

      function rawLine() {
        const r = Math.random();
        const pk = PKGS[(Math.random() * PKGS.length) | 0];
        if (r < 0.32) {
          return { lvl: 'INFO', txt: 'compile ' + padRight(pk, 23) + '  ok  ' + padLeft(20 + ((Math.random() * 380) | 0), 4) + 'ms' };
        }
        if (r < 0.50) {
          return { lvl: 'DEBUG', txt: 'worker ' + p2(1 + ((Math.random() * 16) | 0)) + ' picked job #' + (28410 + ((Math.random() * 90) | 0)) };
        }
        if (r < 0.66) {
          return { lvl: 'INFO', txt: 'test    ' + padRight(pk, 23) + '  PASS ' + padLeft(6 + ((Math.random() * 40) | 0), 3) + ' cases' };
        }
        if (r < 0.78) {
          return { lvl: 'DEBUG', txt: 'cache hit ratio 0.' + (70 + ((Math.random() * 28) | 0)) + '  layer=l1  ttl=60s' };
        }
        if (r < 0.90) {
          return { lvl: 'WARN', txt: 'retry ' + (1 + ((Math.random() * 3) | 0)) + '/5 ' + pk + ' deadline=2000ms' };
        }
        return { lvl: 'INFO', txt: 'flush batch ' + (3 + ((Math.random() * 9) | 0)) + ' rows -> pg://replica-2' };
      }

      function makeLine(msAgo) {
        let l = rawLine(), guard = 0;
        while (l.txt === lastTxt && guard++ < 4) l = rawLine();
        lastTxt = l.txt;
        l.ts = nowStr(msAgo);
        return l;
      }

      function renderLine(l) {
        const cls = l.lvl === 'INFO' ? 'dshm-info' : (l.lvl === 'WARN' ? 'dshm-warn' : 'dshm-debug');
        return '<span class="dshm-ts">[' + l.ts + ']</span> <span class="' + cls + '">' + l.lvl + '</span> ' + esc(l.txt);
      }

      const TOP_N = 7, BOTTOM_N = 5, CAMOU_N = 26;
      const LOG_TOTAL = TOP_N + BOTTOM_N;

      /* One stream, split across the two panes. The pane above the worker
       * pool holds the older lines and the one below holds the newer ones; a
       * line that scrolls out of the top pane is gone for good. Two separate
       * buffers (the first cut) made the lower pane emit timestamps that had
       * already printed above it, so the log read like a rewound clock. */
      const logLines = [], camouLines = [];

      for (let i = 0; i < LOG_TOTAL; i++) logLines.push(makeLine((LOG_TOTAL - 1 - i) * 950));
      for (let i = 0; i < CAMOU_N; i++) camouLines.push(makeLine((CAMOU_N - 1 - i) * 950));

      function paintLogs() {
        logTop.innerHTML = logLines.slice(0, TOP_N).map(renderLine).join('\n');
        logBottom.innerHTML = logLines.slice(TOP_N).map(renderLine).join('\n');
        logCamou.innerHTML = camouLines.map(renderLine).join('\n');
      }

      function shiftLogs() {
        logLines.push(makeLine(0));
        logLines.shift();
        camouLines.push(makeLine(0));
        camouLines.shift();
        paintLogs();
      }

      /* ---- loop ---- */

      let rafId = 0, alive = true;

      /* Board is frozen while the window is not focused or the caret sits in
       * a text field: alt-tabbing to a real task (or typing a prompt) must not
       * kill the run. Play resumes on the next frame after focus returns. */
      function idle() {
        if (document.hidden) return true;
        if (typeof document.hasFocus === 'function' && !document.hasFocus()) return true;
        const el = document.activeElement;
        if (el) {
          const tag = (el.tagName || '').toLowerCase();
          if (tag === 'input' || tag === 'textarea' || el.isContentEditable === true) return true;
        }
        return false;
      }

      function loop(ts) {
        if (!alive) return;
        rafId = requestAnimationFrame(loop);
        if (idle()) { S.last = 0; draw(); return; }
        if (!S.last) S.last = ts;
        const dt = Math.min(ts - S.last, 120);
        S.last = ts;

        if (S.dead) {
          if (ts - S.deadAt > 950) reset();
        } else if (!S.camou) {
          S.acc += dt;
          let guard = 0;
          while (S.acc >= S.step && !S.dead && guard++ < 4) {
            step();
            S.acc -= S.step;
          }
        }
        draw();
      }

      /* ---- input ---- */

      const DIRS = {
        ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
        w: { x: 0, y: -1 }, s: { x: 0, y: 1 }, a: { x: -1, y: 0 }, d: { x: 1, y: 0 },
        W: { x: 0, y: -1 }, S: { x: 0, y: 1 }, A: { x: -1, y: 0 }, D: { x: 1, y: 0 }
      };

      function inField(el) {
        if (!el) return false;
        const tag = (el.tagName || '').toLowerCase();
        return tag === 'input' || tag === 'textarea' || el.isContentEditable === true;
      }

      function onKey(e) {
        if (inField(e.target)) return;
        if (S.camou || S.dead) return;

        const d = DIRS[e.key];
        if (!d) return;
        e.preventDefault();
        if (d.x === -S.dir.x && d.y === -S.dir.y) return;
        S.next = d;
      }

      document.addEventListener('keydown', onKey);

      /* ---- panel chrome: drag / size / camouflage ---- */

      /* Everything below works in viewport coordinates. The overlay is
       * position:fixed, so the panel can travel anywhere on screen even when
       * the host slot only occupies a slice of the window. If a transformed
       * ancestor ever hijacks the containing block, `org` absorbs the shift. */
      function org() {
        const r = root.getBoundingClientRect();
        return { x: r.left || 0, y: r.top || 0 };
      }

      function vp() {
        return {
          w: window.innerWidth || document.documentElement.clientWidth,
          h: window.innerHeight || document.documentElement.clientHeight
        };
      }

      function place(vx, vy) {
        const v = vp(), o = org();
        const w = win.offsetWidth || 320;
        const h = win.offsetHeight || 220;
        /* keep the whole panel inside the viewport; if it cannot fit, pin it */
        const maxX = w + 8 <= v.w ? v.w - w - 4 : 4;
        const maxY = h + 8 <= v.h ? v.h - h - 4 : 4;
        vx = Math.min(Math.max(4, vx), Math.max(4, maxX));
        vy = Math.min(Math.max(4, vy), Math.max(4, maxY));
        win.style.left = Math.round(vx - o.x) + 'px';
        win.style.top = Math.round(vy - o.y) + 'px';
      }

      function widthFor(m) {
        const v = vp();
        const want = m === 'compact' ? 560 : 760;
        return Math.max(320, Math.min(want, v.w - 16));
      }

      let mode = 'full';

      function setMode(next) {
        const r = win.getBoundingClientRect();
        const right = r.right, top = r.top;
        mode = next === 'compact' ? 'compact' : 'full';
        win.classList.toggle('dshm-compact', mode === 'compact');
        win.style.width = widthFor(mode) + 'px';
        zoomBtn.classList.toggle('dshm-on', mode === 'compact');
        place(right - win.offsetWidth, top);
        layout();
        save();
      }

      function setCamou(on) {
        S.camou = !!on;
        win.classList.toggle('dshm-camo', S.camou);
        camoBtn.classList.toggle('dshm-on', S.camou);
        if (!S.camou) { S.last = 0; S.acc = 0; }
        layout();
      }

      function save() {
        const r = win.getBoundingClientRect();
        try {
          localStorage.setItem('dsh.moyu.box', JSON.stringify({
            l: Math.round(r.left), t: Math.round(r.top), m: mode
          }));
        } catch (e) { /* ignore */ }
      }

      function restore() {
        let b = null;
        try { b = JSON.parse(localStorage.getItem('dsh.moyu.box') || 'null'); } catch (e) { b = null; }
        const compact = !!(b && b.m === 'compact');
        mode = compact ? 'compact' : 'full';
        win.classList.toggle('dshm-compact', compact);
        zoomBtn.classList.toggle('dshm-on', compact);
        win.style.width = widthFor(mode) + 'px';
        if (b && typeof b.l === 'number' && typeof b.t === 'number') place(b.l, b.t);
        else place(vp().w - win.offsetWidth - 12, 12);
      }

      let drag = null;

      tabbar.addEventListener('pointerdown', function (e) {
        if (e.button !== 0) return;
        if (e.target.closest && e.target.closest('button, .dshm-close')) return;
        const r = win.getBoundingClientRect();
        drag = { dx: e.clientX - r.left, dy: e.clientY - r.top };
        win.classList.add('dshm-drag');
        if (tabbar.setPointerCapture) {
          try { tabbar.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
        }
        e.preventDefault();
      });

      tabbar.addEventListener('pointermove', function (e) {
        if (!drag) return;
        place(e.clientX - drag.dx, e.clientY - drag.dy);
      });

      function endDrag(e) {
        if (!drag) return;
        drag = null;
        win.classList.remove('dshm-drag');
        save();
        if (tabbar.releasePointerCapture && e && e.pointerId != null) {
          try { tabbar.releasePointerCapture(e.pointerId); } catch (err) { /* ignore */ }
        }
      }

      tabbar.addEventListener('pointerup', endDrag);
      tabbar.addEventListener('pointercancel', endDrag);

      zoomBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        setMode(mode === 'full' ? 'compact' : 'full');
      });

      camoBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        setCamou(!S.camou);
      });

      panelApi.size = function () { setMode(mode === 'full' ? 'compact' : 'full'); };
      panelApi.camou = function () { setCamou(!S.camou); };

      const logTimer = setInterval(shiftLogs, 950);
      const clockTimer = setInterval(() => {
        const d = new Date();
        stClock.textContent = p2(d.getHours()) + ':' + p2(d.getMinutes()) + ':' + p2(d.getSeconds());
      }, 1000);

      let ro = null;
      if (window.ResizeObserver) {
        ro = new ResizeObserver(() => { readPalette(); layout(); });
        ro.observe(grid);
      }

      function onResize() {
        win.style.width = widthFor(mode) + 'px';
        const r = win.getBoundingClientRect();
        place(r.left, r.top);
        layout();
      }

      window.addEventListener('resize', onResize);

      function cleanup() {
        alive = false;
        if (rafId) cancelAnimationFrame(rafId);
        clearInterval(logTimer);
        clearInterval(clockTimer);
        document.removeEventListener('keydown', onKey);
        window.removeEventListener('resize', onResize);
        if (ro) ro.disconnect();
        panelApi.size = null;
        panelApi.camou = null;
        root.innerHTML = '';
      }

      readPalette();
      reset();
      paintLogs();
      restore();
      layout();
      rafId = requestAnimationFrame(loop);

      return cleanup;
    }

    /* ------------------------------------------------------------------ *
     * React half
     * ------------------------------------------------------------------ */

    const overlayApi = { launch: null, close: null, pending: false };
    const panelApi = { size: null, camou: null };

    /* Hotkeys are deliberately Ctrl+Alt+* — no bare Esc, no Ctrl+Shift+*
     * (that range is already crowded in the host shell). Change the combo
     * here and both the listener and the tooltips follow. */
    const HOTKEY = {
      open: { code: 'KeyM', label: 'Ctrl+Alt+M' },
      size: { code: 'KeyL', label: 'Ctrl+Alt+L' },
      camou: { code: 'KeyH', label: 'Ctrl+Alt+H' }
    };

    function MoyuLaunch() {
      return h(React.Fragment, null,
        h('style', { key: 'dshm-style' }, STYLE),
        h('button', {
          key: 'dshm-launch',
          type: 'button',
          className: 'dshm-launch',
          title: 'build.log (' + HOTKEY.open.label + ')',
          onPointerDown: (e) => {
            if (e) { e.preventDefault(); e.stopPropagation(); }
            if (overlayApi.launch) overlayApi.launch();
            else overlayApi.pending = true;
          },
          onClick: (e) => {
            if (e) { e.preventDefault(); e.stopPropagation(); }
            if (overlayApi.launch) overlayApi.launch();
            else overlayApi.pending = true;
          }
        },
          h('span', null, '\u25a4'), h('b', null, 'log'))
      );
    }

    function MoyuOverlay() {
      const [open, setOpen] = useState(false);
      const hostRef = useRef(null);
      const openRef = useRef(false);
      openRef.current = open;

      useEffect(() => {
        overlayApi.launch = () => setOpen(true);
        overlayApi.close = () => setOpen(false);
        if (overlayApi.pending) {
          overlayApi.pending = false;
          setOpen(true);
        }
        return () => {
          overlayApi.launch = null;
          overlayApi.close = null;
        };
      }, []);

      useEffect(() => {
        function onHotKey(e) {
          if (!e.ctrlKey || !e.altKey || e.shiftKey || e.metaKey) return;
          const t = e.target;
          const tag = ((t && t.tagName) || '').toLowerCase();
          if (tag === 'input' || tag === 'textarea' || (t && t.isContentEditable === true)) return;

          if (e.code === HOTKEY.open.code) {
            e.preventDefault();
            setOpen(function (v) { return !v; });
            return;
          }
          if (!openRef.current) return;
          if (e.code === HOTKEY.size.code) {
            e.preventDefault();
            if (panelApi.size) panelApi.size();
          } else if (e.code === HOTKEY.camou.code) {
            e.preventDefault();
            if (panelApi.camou) panelApi.camou();
          }
        }
        document.addEventListener('keydown', onHotKey);
        return function () { document.removeEventListener('keydown', onHotKey); };
      }, []);

      useEffect(() => {
        if (!open || !hostRef.current) return undefined;
        const host = hostRef.current;
        const cleanup = mountGame(host);
        host.querySelectorAll('.dshm-close, [data-close]').forEach(function (el) {
          el.addEventListener('click', function (ev) { ev.stopPropagation(); setOpen(false); });
        });
        return () => { cleanup(); };
      }, [open]);

      /* The panel carries its own copy of the stylesheet: the composer dock can
       * be unmounted (hidden composer, other route) while the overlay is open,
       * and losing the launch button must not strip the panel's styling. */
      if (!open) return null;
      return h(React.Fragment, null,
        h('style', { key: 'dshm-style' }, STYLE),
        h('div', { key: 'dshm-overlay', className: 'dshm-overlay' },
          h('div', { ref: hostRef, className: 'dshm-host' })));
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        ctx.slots.inject('conversation.composer.dock', () => ctx.slots.register({
          name: 'conversation.composer.dock',
          id: 'dsh-moyu.launch',
          order: 8
        }, MoyuLaunch));

        ctx.slots.inject('shell.overlay', () => ctx.slots.register({
          name: 'shell.overlay',
          id: 'dsh-moyu.panel'
        }, MoyuOverlay));
      }
    };
  }
});
