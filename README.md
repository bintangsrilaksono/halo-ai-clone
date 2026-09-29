# Halo AI Clone

Skeleton AI sales agent untuk WhatsApp + Instagram DM: jawab pertanyaan produk, cek ongkir, closing, dan buat invoice pembayaran — sama seperti alur "Halo AI".

## Yang sudah jalan
- Backend Fastify menerima webhook WhatsApp Cloud API & Instagram Messaging API.
- Agent Claude dengan tool-calling: `search_product`, `check_stock`, `check_shipping`, `create_invoice`.
- Katalog produk contoh di [data/products.json](data/products.json).
- Integrasi Biteship (ongkir) & Midtrans (pembayaran) — jatuh ke data mock kalau API key belum diisi, supaya bisa dites dulu tanpa akun vendor.

## Yang masih perlu kamu isi sebelum production
1. **Akun WhatsApp Business Cloud API** — daftar via business.facebook.com, ambil `WHATSAPP_TOKEN` & `WHATSAPP_PHONE_NUMBER_ID`.
2. **Instagram Business Account** terhubung ke Facebook Page, ambil `IG_PAGE_ACCESS_TOKEN`.
3. **Akun Biteship** untuk ongkir real, isi `BITESHIP_API_KEY` + `ORIGIN_AREA_ID` gudangmu.
4. **Akun Midtrans** untuk pembayaran real, isi `MIDTRANS_SERVER_KEY`.
5. Ganti [data/products.json](data/products.json) dengan katalog asli (atau sambungkan `src/catalog.ts` ke database/toko online kamu).
6. Ganti conversation store ([src/store/conversations.ts](src/store/conversations.ts)) dari in-memory ke Postgres/Redis — saat ini histori chat hilang tiap restart.
7. Tambahkan webhook konfirmasi pembayaran Midtrans (`POST /webhooks/midtrans`) supaya order otomatis ditandai lunas.

## Menjalankan

```bash
npm install
cp .env.example .env   # isi API key yang sudah kamu punya
```

**Test otak AI-nya dulu (tanpa WA/IG, cukup ANTHROPIC_API_KEY):**
```bash
npm run chat
```
Ini buka chat langsung di terminal — cara tercepat untuk cek persona, tool-calling (cek ongkir/stok/invoice pakai data mock), sebelum akun WhatsApp/Instagram beres.

**Jalankan server webhook (untuk WA/IG beneran):**
```bash
npm run dev
```
Server jalan di `http://localhost:3000`. Untuk terima webhook dari Meta saat development, expose lewat tunnel (mis. `ngrok http 3000`) dan daftarkan URL `https://<tunnel>/webhooks/whatsapp` dan `/webhooks/instagram` di Meta App Dashboard, dengan verify token yang sama seperti di `.env`.

> `DEEPSEEK_API_KEY` wajib diisi (dari platform.deepseek.com > API keys) supaya agent bisa jawab. `BITESHIP_API_KEY` dan `MIDTRANS_SERVER_KEY` boleh kosong dulu — otomatis pakai data mock.

## Struktur
```
src/
  index.ts              entrypoint Fastify
  config.ts             load semua env var
  catalog.ts             baca data/products.json
  ai/
    agent.ts             loop tool-calling Claude
    tools.ts              definisi & eksekusi tool
    systemPrompt.ts        persona sales
  tools/
    shipping.ts           integrasi Biteship
    payment.ts             integrasi Midtrans
  webhooks/
    whatsapp.ts            terima & balas pesan WA
    instagram.ts            terima & balas DM IG
  store/
    conversations.ts        histori chat per customer (in-memory, ganti sebelum production)
```
