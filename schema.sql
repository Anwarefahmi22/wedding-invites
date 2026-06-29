-- نفّذ هذا الأمر مرة واحدة فقط من Cloudflare Dashboard
-- (Workers & Pages → D1 → اختر قاعدة البيانات → Console → لصق هذا الكود → Execute)

CREATE TABLE IF NOT EXISTS rsvp (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  wedding_id TEXT NOT NULL,
  name TEXT NOT NULL,
  guests_count INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- فهرس لتسريع الاستعلامات عند زيادة عدد الأعراس مستقبلاً
CREATE INDEX IF NOT EXISTS idx_rsvp_wedding_id ON rsvp (wedding_id);
