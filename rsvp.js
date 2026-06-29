/**
 * Cloudflare Pages Function — /rsvp
 *
 * GET  /rsvp?weddingId=khaled-khawla   → يرجع إجمالي عدد الحضور + آخر 10 ردود
 * POST /rsvp { weddingId, name, guestsCount } → يضيف رد جديد
 *
 * يتطلب ربط قاعدة بيانات D1 باسم "DB" في إعدادات Cloudflare Pages
 * (Settings → Functions → D1 database bindings → Variable name: DB)
 */

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const weddingId = url.searchParams.get('weddingId');

  if (!weddingId) {
    return jsonResponse({ error: 'weddingId مطلوب' }, 400);
  }

  try {
    const totalRow = await env.DB.prepare(
      'SELECT COALESCE(SUM(guests_count), 0) AS total FROM rsvp WHERE wedding_id = ?'
    )
      .bind(weddingId)
      .first();

    const recentRows = await env.DB.prepare(
      'SELECT name, guests_count AS guestsCount FROM rsvp WHERE wedding_id = ? ORDER BY id DESC LIMIT 10'
    )
      .bind(weddingId)
      .all();

    return jsonResponse({
      totalGuests: totalRow?.total ?? 0,
      recent: recentRows?.results ?? [],
    });
  } catch (err) {
    return jsonResponse({ error: 'خطأ في الخادم', details: String(err) }, 500);
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'بيانات غير صالحة' }, 400);
  }

  const { weddingId, name, guestsCount } = body;

  if (!weddingId || typeof weddingId !== 'string') {
    return jsonResponse({ error: 'weddingId مطلوب' }, 400);
  }
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return jsonResponse({ error: 'الاسم مطلوب' }, 400);
  }

  const safeName = name.trim().slice(0, 80); // حماية من نصوص طويلة جداً
  const safeGuestsCount = Math.min(Math.max(parseInt(guestsCount, 10) || 1, 1), 20);

  try {
    await env.DB.prepare(
      'INSERT INTO rsvp (wedding_id, name, guests_count) VALUES (?, ?, ?)'
    )
      .bind(weddingId, safeName, safeGuestsCount)
      .run();

    return jsonResponse({ success: true });
  } catch (err) {
    return jsonResponse({ error: 'خطأ في الخادم', details: String(err) }, 500);
  }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
