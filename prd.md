# PRODUCT REQUIREMENTS DOCUMENT (PRD)

# Product Name

MenuQR

## Product Type

Micro SaaS

## Version

v1.0 MVP

## Product Vision

Memungkinkan restoran kecil, cafe, warung, dan UMKM kuliner memiliki menu digital berbasis QR Code dalam waktu kurang dari 10 menit tanpa memerlukan website atau aplikasi tambahan.

---

# 1. Problem Statement

Target market memiliki beberapa masalah utama:

* Menu cetak harus dicetak ulang ketika harga berubah.
* Tidak memiliki website.
* Sulit melakukan update menu secara cepat.
* Tidak memiliki sistem digital yang sederhana.
* Membutuhkan solusi murah dan mudah digunakan.

---

# 2. Product Goal

## Business Goals

* Mendapatkan 20 pelanggan berbayar dalam 3 bulan pertama.
* Mencapai MRR Rp2.000.000 dalam 6 bulan.
* Churn rate <10%.
* CAC < Rp100.000 per pelanggan.

## Product Goals

* Setup restoran selesai dalam <10 menit.
* Membuat menu pertama dalam <5 menit.
* Public menu load time <2 detik.
* Mobile usability score >95.

---

# 3. User Persona

## Primary User

### Restaurant Owner

Profile:

* Pemilik cafe kecil.
* Pemilik warung makan.
* UMKM kuliner.
* Tidak memiliki kemampuan teknis.

Goals:

* Membuat menu digital dengan cepat.
* Mengurangi biaya cetak.
* Mengubah harga kapan saja.

Pain Points:

* Tidak punya website.
* Sulit update menu.
* Tidak ingin menggunakan sistem POS yang kompleks.

---

# 4. User Journey

## Restaurant Owner Journey

Register
→ Verify Email
→ Create Restaurant
→ Add Categories
→ Add Menu Items
→ Generate QR
→ Print QR
→ Place QR on Table

## Customer Journey

Open Camera
→ Scan QR
→ Open Menu
→ Browse Categories
→ View Items
→ Optional WhatsApp Order

---

# 5. Scope

## MVP Scope

### Authentication

* Register
* Login
* Logout
* Email verification
* Forgot password
* Reset password

### Restaurant Management

* Create restaurant
* Update restaurant profile
* Upload logo
* Upload cover image
* Configure WhatsApp number

### Category Management

* Create category
* Update category
* Delete category
* Reorder category

### Menu Management

* Create menu item
* Update menu item
* Delete menu item
* Upload image
* Change availability status
* Mark as featured

### Public Menu

* Public URL
* Mobile responsive page
* Category filtering
* Search menu
* Featured section

### QR Code

* Generate QR automatically
* Download PNG
* Download SVG

### Subscription

* Free plan
* Paid plan

---

# 6. Out of Scope

Tidak termasuk pada MVP:

* POS
* Inventory management
* Kitchen display
* Online payment
* Delivery management
* Loyalty system
* Customer account
* Table reservation

---

# 7. Pricing Strategy

## Free Plan

* 1 restaurant
* 5 menu items
* 2 categories
* QR menu

## Basic Plan

Rp50.000/month

Features:

* Unlimited menu
* Unlimited category
* Featured menu
* Analytics basic

## Pro Plan

Rp150.000/month

Features:

* Multiple branch
* Multiple staff
* Analytics advanced
* Custom theme

---

# 8. Functional Requirements

## FR-001 Authentication

User dapat:

* Register menggunakan email.
* Login menggunakan email/password.
* Reset password.
* Logout.

Acceptance Criteria:

* Email harus unik.
* Password minimal 8 karakter.
* Session otomatis diperpanjang.

---

## FR-002 Restaurant Management

Fields:

* Name
* Slug
* Description
* Phone
* WhatsApp Number
* Address
* Logo
* Cover Image

Acceptance Criteria:

* Slug harus unik.
* URL publik menggunakan slug.

Example:

menuqr.com/r/kopi-kenangan-cibubur

---

## FR-003 Category Management

Fields:

* Name
* Sort Order

Acceptance Criteria:

* User dapat drag-and-drop category order.
* Category kosong dapat dihapus.

---

## FR-004 Menu Item Management

Fields:

* Name
* Description
* Price
* Image
* Available Status
* Featured Status
* Category

Acceptance Criteria:

* Harga harus angka positif.
* Menu sold out tampil berbeda pada halaman publik.
* Image bersifat optional.

---

## FR-005 QR Code

Features:

* Generate QR otomatis.
* Download PNG.
* Download SVG.

Acceptance Criteria:

* QR mengarah ke halaman publik restoran.

---

## FR-006 Public Menu

Features:

* Restaurant profile.
* Category tabs.
* Search menu.
* Featured section.
* Sold out badge.

Acceptance Criteria:

* Mobile first.
* Load time <2 detik.

---

# 9. Non Functional Requirements

## Security

* Session menggunakan secure cookies.
* Password menggunakan hashing modern.
* CSRF protection.
* Rate limiting login endpoint.

## Performance

* FCP <2 detik.
* API response <300ms.
* Database query <100ms.

## Availability

* Uptime target 99%.

## Scalability

* 10.000 restoran.
* 100.000 menu item.
* 1 juta page views per bulan.

---

# 10. Technical Stack

## Frontend

* Next.js App Router
* TypeScript
* Tailwind CSS
* Shadcn UI
* React Hook Form
* Zod

## Backend

* Next.js Route Handlers
* Server Actions

## Authentication

* Better Auth

## Database

* PostgreSQL

## ORM

* Drizzle ORM

## File Storage

* Internal VPS

## Deployment

* VPS

---

# 11. Database Schema

## users

* id UUID PK
* name
* email
* email_verified
* image
* created_at
* updated_at

## sessions

* id
* user_id
* expires_at
* token
* ip_address
* user_agent

## accounts

* id
* user_id
* provider_id
* account_id

## restaurants

* id
* owner_id FK users.id
* name
* slug
* description
* phone
* whatsapp_number
* address
* logo_url
* cover_url
* plan
* created_at
* updated_at

## categories

* id
* restaurant_id FK restaurants.id
* name
* sort_order
* created_at
* updated_at

## menu_items

* id
* restaurant_id FK restaurants.id
* category_id FK categories.id
* name
* description
* price
* image_url
* available
* featured
* created_at
* updated_at

## subscriptions

* id
* restaurant_id FK restaurants.id
* provider
* external_subscription_id
* status
* current_period_start
* current_period_end
* created_at

---

# 12. Authorization Rules

Restaurant Owner hanya dapat:

* melihat restorannya sendiri
* mengubah restorannya sendiri
* menghapus restorannya sendiri

Validation:

restaurant.owner_id == session.user.id

Category dan menu item mengikuti ownership restoran.

---

# 13. Route Structure

## Authentication

/login
/register
/forgot-password
/reset-password

## Dashboard

/dashboard
/dashboard/restaurants
/dashboard/categories
/dashboard/menu
/dashboard/settings
/dashboard/billing

## Public Routes

/r/[slug]

Example:

/r/kopi-bahagia

---

# 14. Suggested Folder Structure

src/

app/
components/
features/
server/
db/
lib/
hooks/
types/
config/

---

src/db

schema/
relations.ts
index.ts

---

src/features

auth/
restaurant/
category/
menu/
billing/

---

src/server

actions/
queries/
services/

---

# 15. Milestone

## Week 1

* Project setup
* Better Auth integration
* PostgreSQL setup
* Drizzle schema

## Week 2

* Restaurant CRUD
* Category CRUD

## Week 3

* Menu CRUD
* Upload image

## Week 4

* Public menu page
* QR generator

## Week 5

* Subscription
* Billing
* Deployment

---

# 16. Success Metrics

After Launch:

* 20 paying restaurants
* 5000 menu views/month
* 95% mobile usability score
* Average setup time <10 minutes

---

# 17. Future Roadmap

## V2

* WhatsApp ordering
* Multiple language
* Theme customization
* Analytics dashboard

## V3

* Multiple branch support
* Staff roles
* Table QR

## V4

* Online ordering
* POS integration
* Kitchen Display System

## V5

* AI generated description
* AI translation
* Recommendation engine

---

# 18. MVP Definition

MVP dianggap selesai apabila:

* User dapat membuat akun.
* User dapat membuat restoran.
* User dapat membuat kategori.
* User dapat membuat menu.
* User mendapatkan QR Code.
* Customer dapat melihat menu melalui QR.
* User dapat melakukan pembayaran subscription.


