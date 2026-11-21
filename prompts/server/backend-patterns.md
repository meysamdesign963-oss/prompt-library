---
name: backend-patterns
title: Backend Patterns
description: "(دسته: بک‌اند) الگوهای استاندارد ساخت بک‌اند — زنجیره Route→Controller→Service، گاردها (requireRole/assertCsrf)، پارس ورودی ضد NoSQL Injection، AuditLog، ریت‌لیمیت، Idempotency، revalidatePath، صفحه‌بندی و تست E2E با curl. هر وقت اندپوینت/سرویس/مدل جدید ساخته می‌شود یا منطق بک‌اند تغییر می‌کند، همراه اسکیل security اجرا شود."
category: server
version: 1.0.0
status: Ready
tags: backend, api, patterns, nextjs
fa: الگوهای استاندارد بک‌اند — زنجیره Route→Controller→Service، گاردها، پارس ورودی، AuditLog و تست E2E.
---

# اسکیل الگوهای بک‌اند

> قواعد امنیتی کامل: اسکیل `security`. گیت کیفیت هر تسک بک‌اند:
> `npx tsc --noEmit` + eslint فایل‌های خودت + تست زنده curl (الگوی بخش ۶).

## ۱) زنجیره ثابت — هیچ لایه‌ای حذف نمی‌شود

```ts
// src/app/api/<domain>/route.ts — فایل نازک؛ منطق اینجا ممنوع
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const actor = requireRole(req, ["system_boss"]);
    assertCsrf(req);
    const body = await readJson<Record<string, unknown>>(req);
    return ok(await domainController.adminSave(body, actor, req));
  } catch (error) { return fail(error); }
}
// پارامتری: { params }: { params: Promise<{ id: string }> } → const { id } = await params;
```
- کنترلر: بدنه را می‌خواند، فیلد الزامی را چک می‌کند، سرویس را صدا می‌زند، `ok()` برمی‌گرداند. خطا همیشه `fail(error)` — هرگز throw خام به بیرون.
- سرویس: منطق واقعی. ورودی با `parseInput` پاک‌سازی می‌شود.

## ۲) گاردها

| گارد | کِی |
|---|---|
| `requireAuth(req)` / `requireRole(req, [roles])` | هر اندپوینت غیرعمومی — payload کاربر را برمی‌گرداند (`{id, role, firstName}`) |
| `assertCsrf(req)` | هر متد تغییردهنده (POST/PUT/PATCH/DELETE) — هدر سفارشی که fetcher کلاینت خودکار می‌فرستد |
| `assertStaff` / `assertBoss` | داخل سرویس وقتی لایه route فقط requireAuth است |
| ریت‌لیمیت با IP | `limitByIp(req, "key", n, min)` + نسخه‌ی بازدیدکننده برای اندپوینت‌های عمومی |
| ریت‌لیمیت با شماره | OTP login/setup |

## ۳) ورودی — readJson + parseInput (بدون اعتماد به کلاینت)

```ts
function parseInput(b: Body): Body {
  const out: Body = {};
  if (b.title !== undefined) out.title = txt(b.title, 200);       // الزامی: خالی = throw
  if (b.metaTitle !== undefined) out.metaTitle = txt(b.metaTitle, 200);
  if (b.rating !== undefined) out.rating = clampNum(b.rating, 1, 5, 5);
  if (b.consentSigned !== undefined) out.consentSigned = bool(b.consentSigned) ?? false;
  return out;
}
```
- **$set جزئی:** فقط فیلدهای ارسالی در data می‌روند → `findByIdAndUpdate(id, { $set: data })` — ویرایش partial امن است.
- **استثنا:** زیرسند کامل (مثل شیء سئو) کل زیرسند را جایگزین می‌کند — فرم/عامل باید آن را کامل بفرستد (اول سند را با read بخواند).
- `searchOr(["name","quote"], q)` برای جستجوی متنی؛ `pageParams(sp, default, max)` + `paginate()` برای فهرست‌ها → پاسخ `{items,total,page,totalPages}`.
- شناسه: `mustId(id, "نام موجودیت")` — پیام فارسی + ۴۰۰ تمیز، نه ۵۰۰.

## ۴) قواعد نوشتن

1. **هر اقدام حساس AuditLog می‌شود:** `logAudit({ req, actorId, actorName, action: "create|update|delete|...", entity, entityId, before, after, meta })` — قبل از تغییر، `before` را `.lean()` بگیر.
2. **بعد از هر نوشتن مؤثر روی صفحات عمومی:** `revalidatePath("/")` یا مسیرهای متأثر (+ `revalidatePath("/sitemap.xml")` برای محتوای ایندکس‌پذیر) داخل `try{}catch{}`.
3. **حذف = حذف واقعی (سخت)** با snapshot در AuditLog — اگر soft-delete لازم شد، صریح تصمیم‌گیری و مستند شود.
4. **کلید Idempotency** برای هر نوشتن قابل‌تکرار از کلاینت/عامل: `consumeIdempotencyKey(req, "bucket")` → در catch هم `releaseIdempotencyKey` فراموش نشود.
5. **قواعد دامنه‌ای سفت:** مثال‌های مرجع — نظر بدون رضایت‌نامه انتشار نمی‌شود؛ هیچ نظری بی‌نام نیست؛ پیام چت همیشه با REST ارسال می‌شود (WS فقط پوش).
6. **همه پیام‌های خطا فارسی و کاربر-محور** — `Errors.badRequest/notFound/...` یا `new ApiError(400, "…", "CODE")`.

## ۵) مالکیت دیتا

- مدل‌ها به تفکیک دامنه: auth / crm / finance / content / academy / system / chat / broadcast / media / backup.
- اسکیمای مشترک سئو (ContentSeo زیرسند: canonical/noindex/og*/jsonLd) برای هر محتوای ایندکس‌پذیر.
- مهاجرت داده نیازمند `scripts/` + هماهنگی در برد — دیتابیس پروداکشن واقعی است.

## ۶) تست زنده E2E — الگوی استاندارد (بدون تکیه بر حدس)

الگوی کامل که در جلسه‌های واقعی جواب داده:

1. **ورود تستی مدیر:** درخواست OTP → `devCode` در پاسخ (فقط dev) → login — کوکی‌ها را از `set-cookie` جمع کن. روی 429: ثانیه‌های پیام را parse و صبر کن.
2. **سناریو را با curl/node بزن** (ساخت → ویرایش → تاگل → حذف) و **persistence واقعی** را با GET بعدی چک کن — «200 گرفتن» کافی نیست.
3. **NEG test:** id ناموجود → ۴۰۴، id خراب → ۴۰۰ تمیز؛ قانون دامنه (مثلاً انتشار بدون رضایت‌نامه) → ۴۰۰ با پیام فارسی.
4. هیچ mutation روی داده واقعی بدون مسیر پاکسازی/برگرداندن انجام نشود.
5. گیت نهایی: `npx tsc --noEmit` صفر + eslint فایل‌های خودت صفر (قبل از کامیت، هر دو).

## ۷) چک‌لیست قبل از کامیت بک‌اند

- [ ] زنجیره کامل route→controller→service و هیچ منطقی در route نیست
- [ ] گارد نقش + CSRF + ریت‌لیمیت (عمومی) + AuditLog
- [ ] parseInput whitelist — هیچ فیلدی مستقیم از body به DB نمی‌رود
- [ ] revalidatePath صفحات متأثر
- [ ] NEG tests تمیز (۴۰۰/۴۰۴ نه ۵۰۰) + E2E persistence
- [ ] tsc + eslint صفر + برد به‌روز + کامیت طبق اسکیل commit
