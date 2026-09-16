# RUNTIME VERIFICATION — FEATURE-BY-FEATURE VIA CHROME CDP :9227

> Sumber: instruksi user 2026-09-16, branch `arena/01a0a835-new-dash`.
> Status implementasi Wave 3–4: selesai (lihat `git log` branch ini).
> Fase ini: **JANGAN menambah fitur baru terlebih dahulu** — evaluasi implementasi yang sudah dibuat satu per satu melalui browser nyata.

```text
CDP endpoint:
http://localhost:9227
```

Tujuan fase ini:

> Membuktikan bahwa setiap feature benar-benar bekerja dari perspektif pengguna dan browser, bukan hanya lolos typecheck atau terlihat benar dari source code.

Gunakan:

- browser runtime
- CDP
- screenshot
- DOM inspection
- console
- network
- Performance APIs
- storage inspection
- service worker state
- permissions
- request/response
- runtime error
- visual state

sebagai evidence.

---

## 1. MODE KERJA

Evaluasi **SATU TASK DALAM SATU WAKTU**.

Urutan:

```text
TASK-19 Barcode
TASK-20 Audit truthfulness
TASK-21 Windowing
TASK-23 PWA Manifest
TASK-24 Service Worker
TASK-25 Background Sync + Badging
TASK-26 SSE Alerts
```

Jangan berpindah ke task berikutnya sampai task saat ini memiliki verdict.

Verdict hanya:

```text
PASS
PARTIAL
FAIL
BLOCKED
```

---

## 2. ATURAN UTAMA

Jangan menganggap feature bekerja hanya karena:

- typecheck lolos
- build lolos
- code terlihat benar
- API tersedia di source
- browser mendukung API
- komponen dirender

Feature dinyatakan PASS hanya jika behavior nyata dapat dibuktikan.

Untuk setiap task kumpulkan evidence minimal:

1. screenshot UI
2. browser console
3. relevant network traffic
4. runtime state
5. expected vs actual behavior

Jika feature tidak memiliki request/network, ganti dengan runtime evidence yang relevan.

---

## 3. GUNAKAN CDP :9227

Connect ke browser Chrome yang sudah berjalan melalui CDP.

Temukan active page/tab aplikasi.

Gunakan CDP untuk menginspeksi minimal:

```text
Page
Runtime
DOM
Network
Console / Log
Performance
Storage
ServiceWorker
Target
```

Gunakan domain lain jika relevan.

Jangan membuka instance browser lain jika tab yang benar sudah tersedia di CDP :9227.

---

## 4. JANGAN MENGANDALKAN SCREENSHOT SAJA

Screenshot adalah visual evidence, bukan satu-satunya proof.

Contoh UI menunjukkan `Connected` belum membuktikan SSE benar-benar aktif. Periksa juga:

```text
Network request
Content-Type
connection lifecycle
message arrival
fallback behavior
console
```

Demikian juga PWA badge, service worker, barcode, dan audit verification.

---

## 5. FORMAT VERIFIKASI PER TASK

Gunakan format:

```text
## TASK-XX — Feature

### Expected behavior
...

### Runtime path tested
URL:
Action:
User state:
Browser state:

### Visual evidence
Screenshot:
Description:

### Runtime evidence
DOM:
Console:
Network:
Storage:
Performance:
Permissions:
Other:

### Expected vs Actual
Expected:
Actual:

### Issues found
...

### Verdict
PASS / PARTIAL / FAIL / BLOCKED

### Required fix
NONE
atau
minimal change required:
...
```

---

## 6. SCREENSHOT POLICY

Ambil screenshot pada state yang membuktikan behavior. Jangan mengambil screenshot generik halaman.

Screenshot harus menunjukkan:

```text
action
→ resulting state
```

Jika diperlukan ambil BEFORE / AFTER / ERROR-FALLBACK. Maksimal screenshot yang relevan saja.

---

## 7. TASK-19 — BARCODE

Verifikasi implementasi: `BarcodeDetector`, camera, 2-frame confirmation, AbortController/cleanup, manual fallback, camera Permissions-Policy.

Test minimal:

### A. Capability detection

Periksa `"BarcodeDetector" in window`. Catat hasil.

### B. Camera permission

Trigger scan. Periksa permission prompt, camera stream, video element, active media track.

### C. Successful scan

Gunakan barcode test nyata jika tersedia. Verifikasi barcode detected → confirmation → value masuk ke expected UI.

### D. Cancel

Mulai scanner lalu cancel. Pastikan `MediaStreamTrack.readyState === "ended"`. Tidak boleh ada camera indicator yang tetap aktif.

### E. Manual fallback

Simulasikan API tidak tersedia jika memungkinkan. Pastikan user masih bisa memasukkan barcode secara manual.

### F. Error

Permission denied harus menghasilkan UX yang masuk akal.

Verdict PASS hanya jika lifecycle camera juga bersih.

---

## 8. TASK-20 — AUDIT TRUTHFULNESS

Feature correctness/security-sensitive. Verifikasi UI tidak lagi menampilkan pseudo cryptographic claims.

Cari runtime teks seperti `Merkle`, `consensus`, `block height`, `signed proof`, `pseudo hash`. Pastikan tidak muncul jika memang sudah dihapus.

- A. Audit list: periksa hash yang muncul.
- B. Network: temukan request audit data, pastikan hash berasal dari server response.
- C. Detail pane: bandingkan server `entryHash` vs rendered hash.
- D. Verify Cryptographic Root: klik Verify, capture request `verify-chain` (method, URL, status, response, resulting UI).

PASS hanya jika UI benar-benar menggunakan hasil server. Jangan menganggap dialog sukses karena dialog menampilkan "verified".

---

## 9. TASK-21 — WINDOWING

Buktikan large list → DOM nodes significantly less than dataset size.

Audit Trail:

1. cari/list dataset cukup besar
2. hitung visible rows
3. hitung DOM rendered rows
4. scroll ke tengah
5. scroll ke bawah
6. apply filter
7. scroll lagi

Periksa missing row, duplicate, jumping, incorrect height, broken keyboard interaction.

Inventory Movement Ledger: test yang sama. Capture dataset length + rendered DOM count.

Jika dataset kecil dan fallback full-render aktif: tandai `BLOCKED FOR LARGE-DATA PROOF`, bukan PASS penuh.

---

## 10. TASK-23 — PWA MANIFEST

Periksa manifest dari browser runtime. Verifikasi name, short_name, start_url, display, theme_color, background_color, icons, maskable icon, shortcuts.

Periksa network request manifest. Pastikan seluruh icon HTTP 200, correct MIME, not broken. Periksa browser installability jika environment mendukung. Screenshot UI bila ada install surface. Jangan menilai PWA hanya dari keberadaan manifest source.

---

## 11. TASK-24 — SERVICE WORKER

Gunakan CDP ServiceWorker/Storage inspection. Buktikan registered, installed, activated, controlling page.

- Static asset: reload `_next/static`, periksa cache strategy.
- API: pastikan `/api` tidak stale-cache (expected network-only).
- Navigation: test network-first behavior.
- Offline: simulasikan offline, navigate ke route sesuai, pastikan fallback `/offline` bekerja.
- Logout purge: inspect CacheStorage sebelum logout, logout, inspect kembali, pastikan sensitive/user-specific cache tidak tertinggal (sangat penting).

---

## 12. TASK-25 — BACKGROUND SYNC + BADGING

- A. enqueue: create kondisi outbox pending, periksa storage/outbox.
- B. badge: pending count harus tercermin pada badge jika API tersedia.
- C. registration: periksa SyncManager registration bila browser mendukung.
- D. offline scenario: set offline → create action masuk outbox → online → periksa sync → flush request → server response → outbox cleared → badge updated.
- E. fallback: jika Background Sync tidak tersedia, application tidak boleh kehilangan data. Catat fallback.

---

## 13. TASK-26 — SSE ALERTS

Verifikasi via Network, bukan screenshot saja. Temukan `/api/notifications/stream`. Periksa status, Content-Type (`text/event-stream`), connection state. Periksa heartbeat sekitar interval rencana.

Trigger perubahan yang seharusnya menghasilkan alert. Buktikan backend state change → SSE message → hook receives message → NotificationsHub updates.

Test disconnect: putuskan koneksi sementara, periksa backoff + reconnect. Jika reconnect gagal cukup lama, periksa fallback 30s polling. Pastikan tidak ada duplicate alerts, SEED duplicates, multiple simultaneous streams, runaway reconnect loop.

---

## 14. NETWORK AUDIT PER FEATURE

Untuk request relevan capture: Method, URL, Status, Type, Duration, Initiator, Request size, Response size.

Cari khusus: duplicate requests, 4xx, 5xx, pending abnormal, request loop, unnecessary polling.

---

## 15. CONSOLE AUDIT

Untuk setiap task capture console sejak sebelum action. Pisahkan ERROR / WARNING / INFO. Tentukan warning NEW / PRE-EXISTING / RELATED / UNRELATED. Runtime exception baru otomatis FAIL (atau PARTIAL jika hanya optional fallback yang gagal).

---

## 16. PERFORMANCE CHECK

Untuk feature yang berpotensi mempengaruhi performance gunakan browser metrics minimal: JS heap, DOM nodes, request count, long tasks, interaction duration.

TASK-21 windowing khususnya harus menunjukkan benefit yang dapat diamati. Jika tidak ada baseline tulis `NO BASELINE — runtime behavior verified only`.

---

## 17. STORAGE INSPECTION

Periksa jika relevan: localStorage, sessionStorage, IndexedDB, CacheStorage, Service Worker storage, cookies.

Khusus TASK-24/25 capture before/during/after/logout. Cari stale tenant/user data.

---

## 18. PERMISSION TESTING

Untuk feature yang membutuhkan permission (camera, notifications) test minimal granted/denied (jika memungkinkan juga prompt). UI harus tetap usable saat denied.

---

## 19. FIX POLICY

Jika menemukan bug JANGAN langsung refactor besar. Tulis dulu Observed / Expected / Root cause hypothesis / Evidence / Smallest likely fix. Lalu perubahan sekecil mungkin. Setelah fix ulang hanya test relevan + smoke test dependent area.

---

## 20. ONE FEATURE = ONE VERDICT

Jangan membuat `TASK-19..26 PASS` sekaligus. Output harus `TASK-19 → PASS`, `TASK-20 → PASS`, `TASK-21 → PARTIAL`, dst. dengan evidence masing-masing.

---

## 21. STOP CONDITIONS

Berhenti pada feature saat menemukan: destructive behavior, auth/security regression, tenant data leak, stale sensitive cache, infinite request loop, major runtime exception, camera/microphone tidak dilepas, corrupt local state. Laporkan dulu. Jangan lanjut sampai issue diklasifikasikan.

---

## 22. FINAL MATRIX

| Task | Feature | Visual | Console | Network | Runtime | Fallback | Verdict |
|---|---|---|---|---|---|---|---|
| 19 | Barcode | ✓ | ✓ | ✓ | ✓ | ✓ | |
| 20 | Audit truthfulness | ✓ | ✓ | ✓ | ✓ | N/A | |
| 21 | Windowing | ✓ | ✓ | N/A | ✓ | ✓ | |
| 23 | PWA | ✓ | ✓ | ✓ | ✓ | ✓ | |
| 24 | Service Worker | ✓ | ✓ | ✓ | ✓ | ✓ | |
| 25 | Background Sync | ✓ | ✓ | ✓ | ✓ | ✓ | |
| 26 | SSE | ✓ | ✓ | ✓ | ✓ | ✓ | |

---

## 23. BUG LIST

Pisahkan temuan menjadi NEW REGRESSION / PRE-EXISTING / ENVIRONMENTAL / NEEDS DEEPER INVESTIGATION.

---

## 24. FINAL DECISION

Akhiri dengan SAFE TO KEEP / FIX BEFORE NEXT WAVE / PARTIAL-NEEDS MORE DATA / BLOCKED BY ENVIRONMENT / REGRESSIONS.

Kemudian jawab: Apakah Wave 3–4 cukup stabil untuk dipertahankan sebelum menyentuh Web Push, Passkeys, Worker CSV, Save-as picker, atau cleanup technical debt?

Jangan memulai TASK-27+ sampai evaluasi runtime ini selesai.

---

## PRINSIP UTAMA

```text
CODE IMPLEMENTED
      ↓
USER ACTION
      ↓
BROWSER BEHAVIOR
      ↓
NETWORK / DOM / STORAGE STATE
      ↓
VISUAL RESULT
      ↓
FALLBACK
      ↓
EVIDENCE
      ↓
VERDICT
```

Source code menunjukkan intent. Browser runtime menunjukkan kenyataan.

---

## STATUS EKSEKUSI (diisi agent saat verifikasi berjalan)

- [x] TASK-19 Barcode → verdict: PARTIAL (`docs/runtime-verification-task19.md`)
- [x] TASK-20 Audit truthfulness → verdict: PASS (`docs/runtime-verification-task20.md`)
- [x] TASK-21 Windowing → verdict: PASS
- [x] TASK-23 PWA Manifest → verdict: PASS (`docs/runtime-verification-task23.md`)
- [ ] TASK-24 Service Worker → verdict: _
- [ ] TASK-25 Background Sync + Badging → verdict: _
- [ ] TASK-26 SSE Alerts → verdict: _
- [ ] Final matrix + bug list + final decision
