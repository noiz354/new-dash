# PROMPT_UI_AUDIT.md — Template Prompt Audit UI → Dokumentasi Markdown (v2 Architect)

> Template baku untuk mengaudit layar Stitch (`code.html`) **sebagai bagian dari
> ekosistem 20 halaman**, dan menghasilkan dokumen teknis di
> `docs/ui-audit/<nama-layar>.md` + satu `docs/ui-audit/navigation-audit.md` global.
> Copy-paste isi blok di bawah ke coding agent (Cursor / Windsurf / Copilot / ChatGPT / Claude).
> v1 (per-halaman, 4 seksi) digantikan v2 ini pada 2026-09-13.

---

## Prompt (copy-paste dari sini)

**Role:**
Act as an Expert Frontend Architect, UI/UX Auditor, and Technical Documenter.

**Context:**
I am building a web application with approximately 20 pages. I need you to audit
the provided page(s) not just in isolation, but as part of a larger ecosystem.
You need to analyze the UI elements, the tech stack, expected APIs, mock data,
and most importantly, the **navigation flow and missing pages**.

**Task:**
Analyze the provided code/pages and generate a comprehensive technical
documentation in a Markdown (`.md`) file.

**Requirements for the Markdown Output:**
The generated Markdown file must follow this exact structure:

**1. Page Overview & UI Elements (Penjelasan Halaman)**

- Jelaskan tujuan utama dari halaman ini.
- Berikan daftar elemen UI utama (misal: Header, Navigation, Data Table, Modal, Form, Chart, Tabs).
- Jelaskan state yang mungkin terjadi pada UI (Empty state, Loading state, Error state).

**2. Navigation Flow & Routing (Alur Navigasi)**

- Identifikasi semua elemen interaktif yang memicu navigasi (contoh: Link, Buttons, Tabs, Table Rows, Breadcrumbs).
- Buat pemetaan navigasi: `[Elemen UI / Action] -> [Target URL / Destination Page]`.

**3. Missing Pages & Flow Gaps (Audit Halaman Hilang)**

- Lakukan analisis logis terhadap elemen navigasi. Apakah ada *dead-end* atau flow yang terputus?
- Tuliskan daftar halaman atau komponen yang **seharusnya ada namun tidak ditemukan/belum dibuat**
  (Misal: *"Terdapat tombol 'View Detail' pada tabel Work Order, namun halaman `/work-orders/[id]` belum ada"*
  atau *"Tab 'History' ada di UI, tetapi konten/halamannya tidak terdefinisi"*).

**4. Tech Stack & External Libraries**

- Sebutkan framework utama (misal: Next.js).
- Daftar eksternal library pendukung yang digunakan/dibutuhkan untuk halaman ini
  (misal: Tailwind CSS, Radix UI, Lucide Icons, React Hook Form, dll) beserta alasannya.

**5. Expected Backend APIs (Kontrak API yang Diharapkan)**

- Lakukan reverse-engineering dari UI untuk menentukan endpoint API apa yang dibutuhkan halaman ini.
- Buat tabel spesifikasi API:
  - **Method** (GET, POST, PUT, DELETE)
  - **Endpoint** (e.g., `/api/v1/assets/[id]`)
  - **Trigger** (Kapan API ini dipanggil? Misal: *On page load, On submit form*)
  - **Expected Payload/Response** (Struktur JSON singkat)

**6. Data Mocking Strategy (Implementasi Sementara)**

- Berikan contoh struktur data JSON statis (Mock Data) yang digunakan untuk mengisi elemen UI saat ini.
- **CRITICAL:** Pastikan setiap deklarasi data mock dan fungsi navigasi yang belum selesai
  diberi komentar dengan format `// TODO: ...`
  *(Contoh: `// TODO: Replace mock data with fetch from /api/v1/users`
  atau `// TODO: Create detail page routing for /users/[id]`)*.
- Tunjukkan contoh singkat bagaimana mock data ini di-binding ke komponen UI.

**Output Constraints:**

- Gunakan bahasa Indonesia untuk penjelasan narasi, dan bahasa Inggris untuk nama variabel,
  endpoint, route, dan istilah teknis.
- Jika saya memberikan banyak halaman sekaligus, buatkan satu file `.md` per halaman,
  ditambah satu file `navigation-audit.md` yang merangkum keseluruhan flow dan missing pages.
- Tulis output dalam raw Markdown code block.

**Input Component/Code / Project Directory:**
[ATTACH_YOUR_CODE, @FOLDER, OR DESCRIBE YOUR ROUTING ARCHITECTURE HERE]

---

## Cara Pakai di Repo Ini

1. Tempel prompt di atas ke chat AI, ganti `[ATTACH_...]` dengan isi
   `stitch_facility_maintenance_platform_ui/<modul>/code.html`
   (atau deskripsi singkat bila file terlalu besar).
2. Simpan jawaban agent sebagai `docs/ui-audit/<nama-modul>.md`
   (contoh: `docs/ui-audit/operations-dashboard.md`).
3. Jika audit mencakup banyak halaman, pastikan juga ada
   `docs/ui-audit/navigation-audit.md` (sitemap + missing pages global).
4. Update `PROGRESS.md` (Log Layar → ✅ Diaudit) dan `TODO.md` (Fase Audit).
5. Hasil audit perdana (dimigrasi ke v2): `docs/ui-audit/operations-dashboard.md`.

## Tips Eksekusi untuk 20 Halaman (Cursor / Windsurf)

1. Buka *Composer* atau *Chat*.
2. Paste prompt di atas.
3. Di bagian input, tag folder halaman (misalnya ketik `@app` atau `@pages`
   tergantung struktur Next.js).
4. Tambahkan pesan: *"Tolong audit semua halaman di dalam folder ini dan buatkan
   file markdown-nya di dalam folder `/docs/ui-audit/`"*.
   Agent membaca struktur direktori secara utuh, melihat bahwa halaman A memiliki
   `Link href="/detail/1"` tetapi file `detail/page.tsx` tidak ada, dan otomatis
   memasukkannya ke bagian **Missing Pages & Flow Gaps**.

## Catatan Hasil Pindai Global (2026-09-13, terverifikasi via script)

- 16 dari 20 `code.html` menanam sidebar desktop `<aside>` **identik** dengan
  15 `data-path` (sumber sitemap global). Semua `href="#"` — tidak ada routing nyata.
- 3 file menanam bottom-nav mobile (`my-audits`, `run-checklist`,
  `report-finding`, `sync-status`); pada `vendors_*` dan `purchasing_*` itu
  artefak copy-paste Stitch, bukan desain (catat sebagai Temuan).
- Detail lengkap: `docs/ui-audit/navigation-audit.md`.
