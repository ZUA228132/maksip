# SIP Callcenter Dashboard (maksip_new)

Минималистичная панель управления колл-центром для SIP-телефонии.

## Быстрый старт

1. Установить зависимости:

   ```bash
   npm install
   ```

2. Настроить переменные окружения в `.env.local`:

   ```bash
   DATABASE_URL=postgresql://postgres:password@host:5432/postgres
   ADMIN_LOGIN=admin
   ADMIN_PASSWORD=admin123
   ADMIN_DISPLAY_NAME=Admin
   SIP_BASE_URL=https://sip.xho.biz
   SIP_LOGIN=9571421515
   SIP_PASSWORD=0038804455
   ```

3. Создать таблицы в БД (Supabase / Postgres) через Prisma или SQL (под тебя можно будет донастроить).

4. Запустить dev:

   ```bash
   npm run dev
   ```

5. Задеплоить на Vercel, прописав те же ENV.
