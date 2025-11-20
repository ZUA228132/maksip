# SIP Callcenter Dashboard

Next.js 14 + Prisma + Tailwind панель управления колл-центром для работы с SIP trunk `sip.xho.biz`.

## Быстрый старт (локально)

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
cp .env.example .env
# отредактируй DATABASE_URL и SIP_* переменные
npm run dev
```

По умолчанию логин/пароль: `admin` / `admin123` (создаётся автоматически при первом запросе к /api/auth/login).

## Деплой на Vercel

1. Зальи проект в GitHub.
2. Подключи репозиторий в Vercel.
3. В настройках проекта на Vercel задай переменные окружения:
   - `DATABASE_URL` (Supabase / Railway / другой Postgres)
   - `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_DISPLAY_NAME`
   - `SIP_DOMAIN`, `SIP_USERNAME`, `SIP_PASSWORD`
   - `NEXT_PUBLIC_BASE_URL` — прод-URL проекта (например, `https://yourproject.vercel.app`)

4. Запусти деплой.

## SIP интеграция

- В `lib/sipClient.ts` лежит пример HTTP-клиента к `sip.xho.biz` (подставь реальные пути API).
- В `app/api/sip/webhook/route.ts` — endpoint для приёма CDR / событий о звонках.
  Укажи его в панели `sip.xho.biz` как webhook, чтобы все звонки прилетали в твою БД.
