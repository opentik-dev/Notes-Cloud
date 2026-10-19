# NotesCloud — دليل استئناف العمل

هذا الملف مخصص للانتقال إلى جهاز جديد واستكمال العمل من آخر نقطة محفوظة.

## الحالة الحالية

- الفرع النشط: `main`
- آخر commit محفوظ: `6f0446e` — `Prepare NotesCloud for public collaboration`
- المستودع البعيد: `git@github.com:opentik-dev/Notes-Cloud.git`
- التطبيق: Cloudflare Worker مع قاعدة Cloudflare D1 باسم `notes-db`
- لا توجد تغييرات محلية غير محفوظة وقت إعداد هذا الملف.
- ملف `wrangler.toml` يحتوي عمدًا على قيمة بديلة لـ `database_id`؛ لا تستبدلها بمعرّف الإنتاج إلا في إعداد خاص غير مرفوع إلى مستودع عام.

## قبل مغادرة الجهاز القديم

1. إذا كانت لديك بيانات مهمة في قاعدة D1، أنشئ نسخة احتياطية بعيدة:

   ```bash
   npm install
   npx wrangler login
   npm run backup:remote
   ```

2. انسخ مجلد `notescloud-backup-*` الناتج إلى قرص خارجي أو تخزين آمن. لا ترفعه إلى GitHub؛ قد يحتوي على بيانات المستخدمين.
3. احتفظ بشكل آمن بمعرّف قاعدة D1، وحساب Cloudflare، وأي أسرار نشر. لا تضعها في Git أو داخل هذا الملف.
4. تأكد من دفع آخر تغييرات:

   ```bash
   git status
   git push origin main
   ```

## إعداد الجهاز الجديد

ثبّت أولًا:

- Git
- Node.js LTS مع npm
- حساب GitHub لديه صلاحية مستودع `opentik-dev/Notes-Cloud`
- حساب Cloudflare لديه صلاحية Worker وD1

ثم نفّذ:

```bash
git clone git@github.com:opentik-dev/Notes-Cloud.git
cd Notes-Cloud
npm install
git status
```

إذا لم يكن SSH مهيأً، استخدم HTTPS بدلًا من رابط SSH أو أضف مفتاح SSH إلى GitHub:

```bash
git clone https://github.com/opentik-dev/Notes-Cloud.git
```

## التشغيل المحلي

قاعدة التطوير المحلية منفصلة عن الإنتاج:

```bash
npm run db:local
npm run dev
```

افتح الرابط الذي يظهره Wrangler، وغالبًا `http://localhost:8787`.

## ربط Cloudflare والنشر

سجّل الدخول:

```bash
npx wrangler login
npx wrangler whoami
```

إذا كانت هذه أول بيئة، أنشئ قاعدة D1 واحفظ المعرّف الناتج في إعداد محلي خاص:

```bash
npx wrangler d1 create notes-db
```

قبل أي نشر، طبّق مخطط قاعدة البيانات والترحيلات البعيدة بعد التأكد من الحساب والقاعدة:

```bash
npx wrangler d1 migrations apply notes-db --remote
```

بعد ضبط `database_id` الصحيح في إعداد النشر الخاص:

```bash
npm run deploy
```

لا تشغّل `npm run db:remote` أو `npm run deploy` قبل التأكد من أن `database_id` يعود إلى قاعدة الإنتاج الصحيحة.

## النسخ الاحتياطي والاستعادة

```bash
npm run backup:local
npm run backup:remote
```

للاستعادة، استخدم ملف `RESTORE.md` داخل مجلد النسخة الاحتياطية. لا تستبدل قاعدة الإنتاج قبل أخذ نسخة جديدة منها والتحقق من الحساب والبيئة.

## دورة العمل اليومية

```bash
git pull --ff-only origin main
npm install
npm run dev
git status
git add <files>
git commit -m "Describe the change"
git push origin main
```

للتغييرات الكبيرة، أنشئ فرعًا ثم افتح Pull Request بدل الدفع المباشر إلى `main`:

```bash
git switch -c feature/short-description
git push -u origin feature/short-description
```

## نقاط معروفة قبل المتابعة

- لا توجد حاليًا مجموعة اختبارات آلية في `package.json`؛ تحقق يدويًا من التسجيل، تسجيل الدخول، إنشاء/تعديل/حذف الملاحظات، الاستيراد، رفع الصور، الأرشفة، والتصدير.
- المجلدات والملفات الحساسة مثل `.env` و`.wrangler` ونسخ D1 الاحتياطية مستبعدة من Git عبر `.gitignore`.
- لا ترفع أي بيانات مستخدمين أو مفاتيح Cloudflare أو معرّفًا سريًا إلى GitHub.
- راجع `README.md` و`SECURITY.md` و`CONTRIBUTING.md` قبل نشر تغييرات عامة.

## مرجع سريع

- الواجهة والـ API: `src/index.js`
- المخطط الأساسي: `schema.sql`
- الترحيلات: `migrations/`
- إعداد Worker وD1: `wrangler.toml`
- النسخ الاحتياطي: `scripts/backup.mjs`
