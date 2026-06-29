/* ===== Wedding Invite v2 — Shared Logic ===== */

(function () {
  const config = window.WEDDING_CONFIG;
  if (!config) {
    console.error('WEDDING_CONFIG غير موجود — تأكد من تحميل ملف JSON قبل script.js');
    return;
  }

  const API_BASE = '/rsvp';

  function fillStaticContent() {
    document.querySelectorAll('[data-field]').forEach((el) => {
      const field = el.getAttribute('data-field');
      if (config[field] !== undefined) el.textContent = config[field];
    });
    if (config.families) {
      document.querySelectorAll('[data-family]').forEach((el) => {
        const key = el.getAttribute('data-family');
        if (config.families[key]) el.textContent = config.families[key];
      });
    }
  }

  /* ---------- بناء الخط الزمني (Timeline) بأيقونات ---------- */
  function renderEvents() {
    const wrap = document.getElementById('eventsWrap');
    if (!wrap || !Array.isArray(config.events)) return;

    wrap.innerHTML = config.events
      .map((ev, i) => {
        const mapsUrl = `https://www.google.com/maps?q=${ev.lat},${ev.lng}`;
        const delay = (i * 0.12).toFixed(2);
        return `
        <div class="timeline-item" style="animation-delay:${delay}s">
          <div class="timeline-dot"></div>
          <div class="timeline-icon">${ev.icon || '✦'}</div>
          <div class="timeline-card">
            <div class="event-date">${ev.dateLabel}</div>
            <div class="event-title">${ev.title}</div>
            <div class="event-meta">
              <span>${ev.locationName} — ${ev.timeLabel}</span>
              <a class="event-location-btn" href="${mapsUrl}" target="_blank" rel="noopener">📍 الموقع</a>
            </div>
          </div>
        </div>`;
      })
      .join('');
  }

  function startCountdown() {
    const target = new Date(config.mainEventDate).getTime();
    if (isNaN(target)) return;

    const elDays = document.getElementById('cdDays');
    const elHours = document.getElementById('cdHours');
    const elMin = document.getElementById('cdMin');
    const elSec = document.getElementById('cdSec');

    function tick() {
      const now = Date.now();
      let diff = Math.max(0, target - now);
      const days = Math.floor(diff / 86400000); diff -= days * 86400000;
      const hours = Math.floor(diff / 3600000); diff -= hours * 3600000;
      const mins = Math.floor(diff / 60000); diff -= mins * 60000;
      const secs = Math.floor(diff / 1000);

      if (elDays) elDays.textContent = String(days).padStart(2, '0');
      if (elHours) elHours.textContent = String(hours).padStart(2, '0');
      if (elMin) elMin.textContent = String(mins).padStart(2, '0');
      if (elSec) elSec.textContent = String(secs).padStart(2, '0');
    }
    tick();
    setInterval(tick, 1000);
  }

  async function refreshRsvpCounter() {
    const counterNum = document.getElementById('rsvpCount');
    const guestListEl = document.getElementById('guestList');
    if (!counterNum) return;

    try {
      const res = await fetch(`${API_BASE}?weddingId=${encodeURIComponent(config.weddingId)}`);
      if (!res.ok) throw new Error('فشل جلب العداد');
      const data = await res.json();
      counterNum.textContent = data.totalGuests ?? 0;

      if (guestListEl && Array.isArray(data.recent)) {
        guestListEl.innerHTML = data.recent
          .map((g) => `<div class="guest-list-item">${escapeHtml(g.name)} — ${g.guestsCount} ${g.guestsCount > 1 ? 'أشخاص' : 'شخص'}</div>`)
          .join('');
      }
    } catch (err) {
      console.error(err);
    }
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function setupRsvpForm() {
    const form = document.getElementById('rsvpForm');
    const msg = document.getElementById('rsvpMessage');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button');
      const name = form.elements['name'].value.trim();
      const guestsCount = parseInt(form.elements['guestsCount'].value, 10) || 1;

      if (!name) {
        if (msg) msg.textContent = 'الرجاء كتابة الاسم';
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'جاري التأكيد...';

      try {
        const res = await fetch(API_BASE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ weddingId: config.weddingId, name, guestsCount }),
        });
        if (!res.ok) throw new Error('فشل الإرسال');

        if (msg) msg.textContent = `شكراً ${name}! تم تأكيد حضورك 🎉`;
        form.reset();
        await refreshRsvpCounter();
      } catch (err) {
        if (msg) msg.textContent = 'حدث خطأ، حاول مرة أخرى';
        console.error(err);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'سأحضر بإذن الله';
      }
    });
  }

  /* ---------- إصلاح خلل فتح البطاقة: نخفي coverScreen فعلياً ---------- */
  function setupOpenCard() {
    const openBtn = document.getElementById('openCardBtn');
    const coverScreen = document.getElementById('coverScreen');
    const mainContent = document.getElementById('mainContent');
    if (!openBtn || !coverScreen || !mainContent) return;

    openBtn.addEventListener('click', () => {
      mainContent.classList.add('visible');
      mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    fillStaticContent();
    renderEvents();
    startCountdown();
    setupRsvpForm();
    setupOpenCard();
    refreshRsvpCounter();
    setInterval(refreshRsvpCounter, 30000);
  });
})();
