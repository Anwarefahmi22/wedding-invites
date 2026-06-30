(function () {
  const config = window.WEDDING_CONFIG;
  if (!config) {
    console.error('WEDDING_CONFIG missing');
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

  function renderEvents() {
    const wrap = document.getElementById('eventsWrap');
    if (!wrap || !Array.isArray(config.events)) return;

    wrap.innerHTML = config.events
      .map((ev, i) => {
        const mapsUrl = 'https://www.google.com/maps?q=' + ev.lat + ',' + ev.lng;
        const delay = (i * 0.12).toFixed(2);
        return '<div class="timeline-item" style="animation-delay:' + delay + 's">' +
          '<div class="timeline-dot"></div>' +
          '<div class="timeline-icon">' + (ev.icon || '\u2726') + '</div>' +
          '<div class="timeline-card">' +
          '<div class="event-date">' + ev.dateLabel + '</div>' +
          '<div class="event-title">' + ev.title + '</div>' +
          '<div class="event-meta">' +
          '<span>' + ev.locationName + ' \u2014 ' + ev.timeLabel + '</span>' +
          '<a class="event-location-btn" href="' + mapsUrl + '" target="_blank" rel="noopener">\uD83D\uDCCD \u0627\u0644\u0645\u0648\u0642\u0639</a>' +
          '</div></div></div>';
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

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  async function refreshRsvpCounter() {
    const counterNum = document.getElementById('rsvpCount');
    const guestListEl = document.getElementById('guestList');
    if (!counterNum) return;

    try {
      const res = await fetch(API_BASE + '?weddingId=' + encodeURIComponent(config.weddingId));
      if (!res.ok) throw new Error('counter fetch failed');
      const data = await res.json();
      counterNum.textContent = data.totalGuests ?? 0;

      if (guestListEl && Array.isArray(data.recent)) {
        guestListEl.innerHTML = data.recent
          .map(function (g) {
            const label = g.guestsCount > 1 ? '\u0623\u0634\u062E\u0627\u0635' : '\u0634\u062E\u0635';
            return '<div class="guest-list-item">' + escapeHtml(g.name) + ' \u2014 ' + g.guestsCount + ' ' + label + '</div>';
          })
          .join('');
      }
    } catch (err) {
      console.error(err);
    }
  }

  function setupRsvpForm() {
    const form = document.getElementById('rsvpForm');
    const msg = document.getElementById('rsvpMessage');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      const submitBtn = form.querySelector('button');
      const name = form.elements['name'].value.trim();
      const guestsCount = parseInt(form.elements['guestsCount'].value, 10) || 1;

      if (!name) {
        if (msg) msg.textContent = '\u0627\u0644\u0631\u062C\u0627\u0621 \u0643\u062A\u0627\u0628\u0629 \u0627\u0644\u0627\u0633\u0645';
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = '\u062C\u0627\u0631\u064A \u0627\u0644\u062A\u0623\u0643\u064A\u062F...';

      try {
        const res = await fetch(API_BASE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ weddingId: config.weddingId, name: name, guestsCount: guestsCount }),
        });
        if (!res.ok) throw new Error('submit failed');

        if (msg) msg.textContent = '\u0634\u0643\u0631\u0627\u064B ' + name + '! \u062A\u0645 \u062A\u0623\u0643\u064A\u062F \u062D\u0636\u0648\u0631\u0643 \uD83C\uDF89';
        form.reset();
        await refreshRsvpCounter();
      } catch (err) {
        if (msg) msg.textContent = '\u062D\u062F\u062B \u062E\u0637\u0623\u060C \u062D\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062E\u0631\u0649';
        console.error(err);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = '\u0633\u0623\u062D\u0636\u0631 \u0628\u0625\u0630\u0646 \u0627\u0644\u0644\u0647';
      }
    });
  }

  function setupOpenCard() {
    const openBtn = document.getElementById('openCardBtn');
    const coverScreen = document.getElementById('coverScreen');
    const mainContent = document.getElementById('mainContent');
    if (!openBtn || !coverScreen || !mainContent) return;

    openBtn.addEventListener('click', function () {
      mainContent.classList.add('visible');
      mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    fillStaticContent();
    renderEvents();
    startCountdown();
    setupRsvpForm();
    setupOpenCard();
    refreshRsvpCounter();
    setInterval(refreshRsvpCounter, 30000);
  });
})();
