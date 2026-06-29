# منصة دعوات الزفاف الرقمية — تعليمات التشغيل (نسخة بدون مجلدات)

## بنية المشروع
```
wedding-invites (الـ repo)/
├── index.html              ← الصفحة الرئيسية للمنصة
├── style.css                ← تصميم مشترك لكل الأعراس
├── script.js                 ← منطق مشترك لكل الأعراس
├── khaled-khawla.html        ← دعوة عرس خالد وخولة
├── khaled-khawla.json        ← بيانات عرس خالد وخولة
├── schema.sql                ← كود SQL لإنشاء جدول RSVP (مرة واحدة)
└── functions/
    └── rsvp.js                ← API (يجب أن يبقى داخل مجلد functions/ — شرط من Cloudflare)
```

**كل عرس جديد مستقبلاً = ملفان فقط**: `اسم-العرس.html` و `اسم-العرس.json`، يُرفعان في جذر الـ repo مباشرة، بدون أي مجلد.

## 1. حذف الملفات القديمة من GitHub (المرفوعة بشكل خاطئ سابقاً)
في صفحة الـ repo على GitHub:
- احذف: `config.json`, `index.html` (القديم لو كان نسخة خاطئة), `rsvp.js`, `script.js`, `style.css`
  (لكل ملف: افتحه → زر سلة المهملات 🗑️ بالأعلى → Commit changes)
- اترك `README.md` و `schema.sql` كما هما (سيُستبدلان بنفس الاسم لاحقاً، أو احذفهما أيضاً لتبدأ نظيف)

## 2. رفع الملفات الجديدة (هذه النسخة)
من صفحة الـ repo → "Add file" → "Upload files":
- ارفع: `index.html`, `style.css`, `script.js`, `khaled-khawla.html`, `khaled-khawla.json`, `schema.sql`, `README.md`
- كلها ملفات فردية، لا مجلدات — يجب يعمل الرفع من الموبايل بدون مشاكل هذه المرة

## 3. إنشاء مجلد functions/ (الاستثناء الوحيد الذي يحتاج مجلد)
بما إن متصفح الموبايل لا يدعم رفع مجلدات، الطريقة الوحيدة لإنشاء `functions/rsvp.js`:
1. من صفحة الـ repo → اضغط **"Add file"** → **"Create new file"**
2. في خانة اسم الملف، اكتب بالضبط: `functions/rsvp.js`
   (كتابة `/` في اسم الملف تجعل GitHub ينشئ المجلد تلقائياً — هذا يعمل دائماً، حتى من الموبايل)
3. الصق محتوى ملف `rsvp.js` الذي أعطيتك بالكامل في مربع المحرر
4. اضغط **Commit changes**

## 4. ربط Cloudflare Pages
1. Cloudflare Dashboard → Workers & Pages → Create application → Pages → Connect to Git
2. اختر الـ repo `wedding-invites`
3. Build settings: اتركها فاضية (لا build command)
4. Deploy

## 5. إنشاء قاعدة بيانات D1 (مرة واحدة فقط)
1. Cloudflare Dashboard → Workers & Pages → D1 SQL Database → Create database
2. اسمها: `wedding_rsvp`
3. تبويب Console → الصق محتوى `schema.sql` بالكامل → Execute

## 6. ربط D1 بمشروع Pages
1. مشروع Pages → Settings → Functions → D1 database bindings → Add binding
2. Variable name: `DB` (بالضبط)
3. D1 database: اختر `wedding_rsvp`
4. Save → Deployments → Retry deployment لآخر نسخة

## 7. تجربة الموقع
الرابط: `https://اسم-مشروعك.pages.dev/khaled-khawla.html`
(لاحظ: الآن `.html` في نهاية الرابط، وليس مجلد فرعي)

## 8. لإضافة عرس جديد مستقبلاً
أعطِ Claude بيانات العرس، وسيُنشئ لك ملفين فقط:
- `اسم-العرس.html`
- `اسم-العرس.json`

ترفعهما في جذر الـ repo بنفس طريقة رفع الملفات (Add file → Upload files)، والنشر يحدث تلقائياً.

## 9. تعديل الإحداثيات الحقيقية لاحقاً
في `khaled-khawla.json`، كل event فيه `lat`/`lng` تجريبية. لتحديثها: Google Maps → ضغط مطوّل على الموقع الفعلي → نسخ الإحداثيات → استبدالها في الملف (من GitHub.com: افتح الملف → زر القلم ✏️ للتعديل → Commit).
