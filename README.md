# MenuQR

Platform menu digital berbasis QR Code untuk restoran, kafe, warung, dan UMKM kuliner. Pelanggan cukup pindai QR — langsung lihat menu, pesan, dan lacak status pesanan dari HP mereka sendiri.

---

## Fitur Utama

### Untuk Pemilik Outlet
- **Dashboard Admin** — Kelola outlet, kategori, dan menu makanan dalam satu tempat
- **Manajer Pesanan POS** — Pantau pesanan masuk secara *real-time* dengan notifikasi suara
- **Cetak Massal QR Meja** — Generate puluhan QR code meja sekaligus dengan prefix kustom
- **Dasbor Analitik** — Pantau menu terlaris dan pendapatan harian/bulanan *(Pro)*
- **Custom Domain** — Gunakan domain sendiri untuk halaman menu publik *(Pro)*
- **Multi-Cabang** — Kelola outlet tanpa batas *(Pro)*

### Untuk Pelanggan
- **Scan QR** — Buka kamera HP, scan kode QR di meja
- **Menu Digital** — Lihat foto, deskripsi, dan harga menu langsung di browser
- **Lacak Pesanan** — Pantau status masakan (Menunggu → Dimasak → Siap Disaji)
- **Order via WhatsApp** — Alternatif pemesanan untuk restoran tanpa layar dapur

---

## Paket Harga

| Fitur | Gratis | Basic | Pro |
|-------|--------|-------|-----|
| Outlet | 1 | 1 | Tak Terbatas |
| Menu | 5 | Tak Terbatas | Tak Terbatas |
| Kategori | 2 | Tak Terbatas | Tak Terbatas |
| QR Meja | Standar | ✓ | ✓ |
| POS Order Manager | ✗ | ✓ | ✓ |
| Notifikasi Suara Live | ✗ | ✓ | ✓ |
| Analitik Dashboard | ✗ | ✗ | ✓ |
| Custom Domain | ✗ | ✗ | ✓ |
| Dukungan Prioritas | ✗ | ✗ | ✓ |
| **Harga** | **Rp 0** | **Rp 50rb/bln** | **Rp 150rb/bln** |

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Bahasa | TypeScript |
| Styling | Tailwind CSS v4 + Shadcn UI v4 |
| Autentikasi | Better Auth |
| Database | PostgreSQL |
| ORM | Drizzle ORM |
| Validasi | React Hook Form + Zod |
| Ikon | lucide-react |
| Toast | sonner |
| Deploy | VPS |

---

## Struktur Proyek

```
src/
├── app/
│   ├── (auth)/            # Login, Register, Forgot/Reset Password
│   ├── (dashboard)/       # Dashboard admin (outlet, menu, pesanan, billing)
│   ├── api/               # Route handlers (upload, auth)
│   ├── r/[slug]/          # Halaman menu publik
│   ├── layout.tsx         # Root layout + ThemeProvider
│   └── page.tsx           # Landing page
├── components/
│   ├── ui/                # Komponen Shadcn (button, card, dialog, dll.)
│   ├── DashboardSidebar.tsx
│   ├── ThemeProvider.tsx
│   └── ...
├── config/                # Konfigurasi aplikasi
├── db/
│   └── schema/            # Skema Drizzle (users, restaurants, orders, dll.)
├── features/              # Schema validasi per fitur (Zod)
├── hooks/                 # Custom React hooks
├── lib/                   # Utilitas (auth-client, utils)
└── server/
    ├── actions/           # Server Actions (CRUD + business logic)
    ├── queries/           # Query database
    └── services/          # Auth service
```

---

## Memulai

### Prasyarat
- Node.js 18+
- PostgreSQL

### Install & Setup

```bash
# Clone repository
git clone https://github.com/c4turla/menuqr.git
cd menuqr

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Isi DATABASE_URL, BETTER_AUTH_SECRET, dll.

# Generate & push database schema
npx drizzle-kit push

# Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## License

Proprietary — All rights reserved.
