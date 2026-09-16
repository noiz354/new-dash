# AUDIT MOCKED, DEAD-END, DAN UNINTEGRATED FRONTEND–BACKEND

Anda sedang mengaudit aplikasi yang memiliki frontend dan backend terpisah.

Tujuan audit ini adalah menemukan seluruh kondisi di mana:

- frontend terlihat memiliki fitur tetapi backend belum terhubung
- backend memiliki API tetapi frontend tidak pernah memanggilnya
- UI menggunakan mock/fake/static data
- API response dipalsukan atau di-hardcode
- button/action tidak menghasilkan efek nyata
- flow berhenti di tengah
- halaman hanya visual tetapi tidak memiliki persistence
- mutation hanya mengubah local state
- success toast muncul tanpa server confirmation
- backend route tidak pernah digunakan
- frontend mengarah ke endpoint yang tidak ada
- backend mengembalikan placeholder
- feature hanya partially integrated
- data server tersedia tetapi UI masih menggunakan seed/mock
- UI menampilkan state yang berbeda dari source of truth backend
- test/mock environment bocor ke production path

Audit harus berdasarkan implementasi aktual repository.

Jangan menebak.

---

# 1. MODE KERJA

Lakukan audit secara:

`READ-ONLY`

Jangan:

- mengubah code
- membuat branch
- commit
- push
- install dependency
- memperbaiki temuan
- membuat endpoint baru
- menghubungkan frontend/backend

Tugas Anda hanya:

1. menemukan
2. mengklasifikasikan
3. membuktikan
4. memetakan flow
5. menentukan gap integrasi

---

# 2. DEFINISI

Gunakan definisi berikut secara konsisten.

## MOCKED

Data atau behavior bukan berasal dari sistem nyata.

Contoh:

```text
const users = [...]
const fakeData = [...]
Promise.resolve(...)
setTimeout(() => success)
Math.random()
mockResponse
dummyData
sampleData
seedData
```

Termasuk:

- hardcoded KPI
- hardcoded chart
- hardcoded notification
- fabricated hash
- fabricated progress
- fake status
- mock auth
- sample tenant
- static transaction history

## DEAD-END

User dapat mencapai suatu UI/action tetapi flow tidak dapat selesai.

Contoh:

```text
button
 ↓
modal
 ↓
submit
 ↓
nothing
```

atau:

```text
page
 ↓
CTA
 ↓
route missing
```

atau:

```text
form
 ↓
local state update
 ↓
no API
```

## UNINTEGRATED

Komponen sudah ada di beberapa layer tetapi belum tersambung end-to-end.

Contoh:

```text
Frontend exists
Backend exists
BUT
frontend never calls backend
```

atau:

```text
API exists
database exists
BUT
UI still uses mock data
```

## PARTIALLY INTEGRATED

Sebagian flow nyata, sebagian masih placeholder.

Contoh:

```text
GET real
POST mocked
```

atau:

```text
create works
edit does not
delete local-only
```

## ORPHAN

Code exists tetapi tidak digunakan.

Contoh:

- unused API endpoint
- unused hook
- unused component
- unused service
- route tanpa navigation
- backend handler tanpa caller

---

# 3. DISCOVERY FRONTEND

Cari seluruh indikasi mock/fake/static behavior.

Minimal cari keyword:

```text
mock
mocked
fake
dummy
sample
fixture
stub
placeholder
demo
seed
seeded
temporary
temp
TODO
FIXME
WIP
not implemented
coming soon
hardcoded
staticData
fallbackData
initialData
example
faker
Math.random
setTimeout
Promise.resolve
```

Cari juga:

```text
toast.success
alert(
console.log
onClick
onSubmit
handleSubmit
handleSave
handleDelete
handleApprove
handleReject
handleCreate
handleUpdate
```

Tujuannya menemukan action yang terlihat nyata tetapi tidak memiliki persistence/server call.

---

# 4. DISCOVERY BACKEND

Cari:

```text
TODO
FIXME
mock
dummy
fake
stub
placeholder
NotImplemented
501
return []
return {}
return null
sample
seed
temporary
hardcoded
```

Cari endpoint yang:

- return static response
- belum menyentuh database
- selalu success
- tidak melakukan mutation
- tidak melakukan validation
- tidak melakukan authorization
- tidak mempunyai caller frontend

---

# 5. INVENTORY FRONTEND DATA SOURCES

Untuk setiap halaman/feature, identifikasi source data.

Kategori hanya:

```text
REAL API
SERVER ACTION
DATABASE-DIRECT VIA SERVER
LOCAL STORAGE
INDEXEDDB
STATIC
MOCK
SEED
HARDCODED
DERIVED
UNKNOWN
```

Buat tabel:

| Feature/Page | Data displayed | Data source | Mutation source | Status |
|---|---|---|---|---|

---

# 6. INVENTORY FRONTEND MUTATIONS

Cari seluruh user action yang seharusnya mengubah state bisnis.

Contoh:

- Create
- Save
- Edit
- Delete
- Approve
- Reject
- Submit
- Confirm
- Checkout
- Pay
- Upload
- Assign
- Complete
- Cancel
- Retry
- Verify
- Export
- Import
- Invite
- Logout
- Reset

Untuk setiap action buat:

| Action | UI location | Handler | API call | Persistence | Result |
|---|---|---|---|---|---|

Result:

- REAL
- LOCAL ONLY
- MOCKED
- DEAD-END
- UNKNOWN

---

# 7. TRACE SETIAP FEATURE END-TO-END

Gunakan flow:

```text
User Action
 ↓
Component
 ↓
Handler
 ↓
Hook / Service
 ↓
HTTP / Server Action
 ↓
Backend Route
 ↓
Use Case / Service
 ↓
Repository / DB
 ↓
Response
 ↓
Frontend state refresh
```

Untuk setiap layer, tulis:

- FOUND
- NOT FOUND
- BYPASSED
- MOCKED

Jika rantai putus, tandai titik putusnya.

---

# 8. DETEKSI FAKE SUCCESS

Cari kondisi seperti:

```text
toast.success(...)
setSuccess(true)
router.push(...)
modal.close()
```

yang terjadi:

- sebelum response server
- tanpa API call
- setelah fake Promise
- setelah setTimeout
- tanpa checking HTTP status
- tanpa checking mutation result

Klasifikasikan:

`FAKE SUCCESS STATE`

Ini harus dianggap severity tinggi jika user dapat percaya data sudah tersimpan.

---

# 9. DETEKSI LOCAL-ONLY MUTATION

Cari:

```text
setState
setItems
filter(...)
map(...)
splice
zustand update
redux reducer
context mutation
```

pada aksi bisnis.

Jika tidak ada server persistence:

`LOCAL-ONLY BUSINESS MUTATION`

Contoh bahaya:

```text
Delete user
→ row hilang dari UI
→ refresh
→ user muncul lagi
```

---

# 10. DETEKSI STATIC KPI / DASHBOARD

Audit seluruh:

- cards
- charts
- summary
- counters
- percentages
- status indicators
- trend arrows
- SLA numbers
- revenue
- conversion
- inventory totals

Cari apakah data berasal dari:

```text
constant
array
mock
random number
calculation dari seed data
```

Tandai:

`FABRICATED BUSINESS METRIC`

jika UI dapat disalahartikan sebagai real production information.

---

# 11. DETEKSI MOCK AUTH / ROLE / PERMISSION

Audit:

```text
currentUser
role
permission
tenant
organization
shop
workspace
session
```

Cari:

```text
const currentUser = ...
const role = "admin"
isAdmin = true
permissions = [...]
```

Bandingkan dengan auth/backend nyata.

Tandai:

- MOCK AUTH
- MOCK ROLE
- MOCK TENANT
- CLIENT-ONLY AUTHORIZATION

Authorization bisnis tidak boleh hanya berdasarkan frontend.

---

# 12. DETEKSI MOCKED REALTIME

Audit:

- WebSocket
- SSE
- polling
- notifications
- live dashboard
- activity feed

Cari:

```text
setInterval
Math.random
random status changes
fake notifications
seed events
simulated data
```

Jika UI menyebut:

```text
LIVE
REALTIME
CONNECTED
```

tetapi sumbernya tidak realtime:

`MISLEADING REALTIME CLAIM`

---

# 13. DETEKSI MOCKED PROGRESS

Cari progress:

```text
0 → 100
upload progress
processing progress
sync progress
job progress
```

Jika menggunakan timer/setInterval bukan progress nyata:

`SIMULATED PROGRESS`

Bedakan dari indeterminate UI yang memang jujur.

---

# 14. DETEKSI PLACEHOLDER EXPORT / DOWNLOAD

Audit:

- PDF export
- CSV export
- Excel
- print
- download
- invoice
- receipt

Cari apakah:

- file benar-benar dibuat
- data aktual digunakan
- backend dipanggil
- hanya download dummy file
- hardcoded CSV
- placeholder Blob

Tandai:

`FAKE EXPORT`

jika output tidak merepresentasikan state bisnis nyata.

---

# 15. DETEKSI UPLOAD PALSU

Trace:

```text
select file
 ↓
preview
 ↓
submit
 ↓
upload request
 ↓
storage
 ↓
metadata DB
 ↓
canonical URL
 ↓
response
 ↓
render
```

Cari kondisi:

- hanya preview lokal
- object URL dianggap upload selesai
- upload URL hardcoded
- backend tidak menyimpan reference
- server menerima tetapi UI tidak memakai response

---

# 16. AUDIT BACKEND ENDPOINT INVENTORY

Inventaris semua endpoint.

Buat:

| Method | Endpoint | Handler | DB/Service | Frontend Caller | Status |
|---|---|---|---|---|---|

Status:

- INTEGRATED
- FRONTEND NOT FOUND
- MOCKED
- PLACEHOLDER
- PARTIAL
- DEAD
- UNKNOWN

---

# 17. ORPHAN BACKEND API

Endpoint dianggap kandidat orphan jika:

- tidak ada frontend caller
- tidak ada internal service caller
- tidak ada documented external consumer
- tidak dipakai test penting
- tidak dipakai worker

Tandai:

`ORPHAN API CANDIDATE`

Jangan langsung menyebut aman untuk dihapus.

---

# 18. FRONTEND CALL KE ENDPOINT YANG TIDAK ADA

Inventaris seluruh:

```text
fetch
axios
ky
apiClient
server action
```

Extract URL/path.

Bandingkan dengan route backend nyata.

Tandai:

- MATCHED
- METHOD MISMATCH
- PATH MISMATCH
- ROUTE NOT FOUND
- UNKNOWN

Route missing:

`BROKEN FRONTEND INTEGRATION`

---

# 19. METHOD MISMATCH

Cari contoh:

```text
frontend POST /api/foo
backend PATCH /api/foo
```

atau:

```text
frontend DELETE /users/:id
backend POST /users/:id/delete
```

Tandai sebagai integration mismatch.

---

# 20. REQUEST CONTRACT MISMATCH

Bandingkan request frontend dengan schema backend.

Periksa:

- field names
- required fields
- enum
- nested object
- date format
- IDs
- pagination
- filters
- content-type

Buat:

| API | FE sends | BE expects | Match |
|---|---|---|---|

---

# 21. RESPONSE CONTRACT MISMATCH

Bandingkan response backend dan yang dibaca frontend.

Contoh:

```text
Backend:
{ data: [...] }

Frontend:
response.items
```

Cari:

- wrong nesting
- optional field assumption
- wrong enum
- renamed property
- wrong nullability

Tandai:

`RESPONSE CONTRACT DRIFT`

---

# 22. ENUM DRIFT

Audit seluruh status bisnis.

Contoh:

```text
PENDING
APPROVED
READY
COMPLETED
CANCELLED
FAILED
```

Bandingkan:

- frontend
- backend
- DB/schema
- validation

Cari:

```text
READY_TO_PICKUP
READY
READY_FOR_PICKUP
```

Tandai mismatch.

---

# 23. IDENTITY / ID FIELD DRIFT

Cari inkonsistensi:

```text
id
userId
user_id
uuid
orderId
order_id
```

Pastikan mapping eksplisit.

Tandai bila frontend menggunakan ID berbeda dari backend canonical ID.

---

# 24. PAGINATION DRIFT

Audit:

```text
page
limit
offset
cursor
nextCursor
total
hasMore
```

Cari kondisi frontend:

- menganggap semua data sudah ada
- pagination control tidak mengubah request
- backend cursor tapi FE pakai page
- search hanya local pada page saat ini

---

# 25. FILTER / SEARCH PALSU

Cari search/filter yang hanya dilakukan terhadap dataset client saat UI memberi kesan global.

Contoh:

```text
API returns first 20
 ↓
frontend filter
 ↓
user mengira search seluruh data
```

Tandai:

`PARTIAL-DATA SEARCH`

---

# 26. SORT PALSU

Hal yang sama untuk sorting.

Jika backend paginated tetapi sorting dilakukan hanya pada current page:

`PARTIAL-DATA SORT`

---

# 27. DELETE FLOW

Audit delete secara khusus.

Trace:

```text
click delete
 ↓
confirmation
 ↓
request
 ↓
backend authorization
 ↓
DB mutation
 ↓
response
 ↓
UI refresh
```

Cari optimistic remove tanpa rollback.

---

# 28. CREATE FLOW

Audit:

```text
form
 ↓
validation
 ↓
request
 ↓
server validation
 ↓
DB
 ↓
returned canonical object
 ↓
UI refresh
```

Cari temporary client ID yang tidak pernah diganti canonical ID.

---

# 29. UPDATE FLOW

Cari kasus:

```text
PATCH UI
→ local state changed
→ backend unchanged
```

atau server update berhasil tetapi UI tetap stale.

---

# 30. DETAIL VS LIST CONSISTENCY

Bandingkan:

```text
list API
detail API
```

Cari kondisi:

- list real, detail mock
- list mock, detail real
- update detail tidak reflected di list
- inconsistent status mapping

---

# 31. ROUTE DEAD-END

Audit seluruh navigation action:

```text
Link
router.push
router.replace
window.location
```

Bandingkan dengan route nyata.

Klasifikasi:

- VALID
- MISSING
- DISABLED
- PLACEHOLDER
- DEAD-END

---

# 32. BUTTON DEAD-END

Cari button dengan:

```text
onClick={() => {}}
onClick={undefined}
TODO
console.log
alert
```

atau handler yang tidak melakukan business action.

Tandai:

`DEAD ACTION`

---

# 33. FORM DEAD-END

Cari form yang:

- tidak memiliki onSubmit
- preventDefault lalu tidak melakukan apa-apa
- hanya close modal
- hanya mutate local state

---

# 34. PLACEHOLDER UI

Cari:

```text
Coming soon
Not available yet
Demo
Prototype
Example
```

Bedakan:

`HONEST PLACEHOLDER`

vs

`MISLEADING FUNCTIONAL UI`

Placeholder jujur bukan bug.

---

# 35. FEATURE FLAG DEAD CODE

Audit:

```text
feature flag
environment flag
isEnabled
```

Cari code yang permanen unreachable.

Contoh:

```text
if (false)
```

atau flag tidak pernah true di environment mana pun.

Tandai:

`FEATURE-FLAGGED DEAD CODE`

---

# 36. TEST MOCK LEAK

Cari MSW, fixtures, mocked API, test helper yang bisa aktif di runtime production.

Cari:

```text
NODE_ENV
NEXT_PUBLIC
VITE_
mockServiceWorker
worker.start()
```

Tandai:

`MOCK INFRASTRUCTURE LEAK RISK`

---

# 37. ENV FALLBACK BERBAHAYA

Cari:

```text
process.env.API_URL || "http://localhost..."
```

atau:

```text
env ?? mockEndpoint
```

Tandai jika production bisa diam-diam fallback ke fake/local service.

---

# 38. ERROR SWALLOWING

Cari:

```text
catch {
  return []
}
```

atau:

```text
catch {
  toast.success(...)
}
```

atau fallback otomatis ke fake data.

Klasifikasi:

`ERROR MASKED AS VALID DATA`

Ini severity tinggi.

---

# 39. FALLBACK MOCK DATA

Cari pola:

```text
try real API
catch
return mockData
```

Jika user tidak diberi tahu:

`SILENT MOCK FALLBACK`

Ini harus diprioritaskan.

---

# 40. OPTIMISTIC UPDATE AUDIT

Optimistic update boleh.

Tetapi harus ada:

- API mutation
- rollback
- error state
- reconciliation

Jika tidak:

`UNSAFE OPTIMISTIC MUTATION`

---

# 41. CACHE VS MOCK

Jangan salah mengklasifikasikan cached real data sebagai mock.

Bedakan:

```text
REAL CACHED DATA
```

dengan:

```text
FABRICATED DATA
```

---

# 42. SEED DATA

Seed data boleh di dev/test.

Audit apakah seed dapat tampil di production.

Cari label seperti:

```text
SEED
DEMO
TEST
ADMIN
```

Jika bercampur dengan real data tanpa indikator:

`SEED/PRODUCTION DATA MIXING`

---

# 43. TENANT / ORGANIZATION ISOLATION

Untuk setiap integrated flow, cek apakah tenant/shop/org context benar-benar diteruskan:

```text
frontend context
 ↓
request
 ↓
backend authorization
 ↓
DB query
```

Cari request yang kehilangan:

- tenant
- organization
- shop
- workspace

Tetapi jangan percaya tenant ID dari client tanpa server authorization.

---

# 44. AUTHENTICATION INTEGRATION

Trace:

```text
login
 ↓
session/token
 ↓
frontend auth state
 ↓
API request
 ↓
backend verification
```

Cari:

- mock login
- client-only role
- unauthenticated API
- auth state local-only
- fake logout

---

# 45. LOGOUT

Logout harus trace sampai:

- credential/session invalidation sesuai architecture
- frontend state clear
- sensitive cache clear
- persisted client state clear

Jika hanya:

```text
router.push("/login")
```

tandai:

`VISUAL-ONLY LOGOUT`

---

# 46. REALTIME INTEGRATION

Jika WebSocket/SSE ada:

trace:

```text
backend event
 ↓
transport
 ↓
frontend handler
 ↓
state
 ↓
UI
```

Cari stream yang connected tetapi datanya tidak pernah dipakai UI.

Tandai:

`CONNECTED BUT UNINTEGRATED`

---

# 47. BACKGROUND JOB INTEGRATION

Jika backend membuat job:

```text
request
 ↓
job
 ↓
status
 ↓
frontend
```

Cari:

- job dibuat tapi frontend tidak polling/listen
- frontend menunggu state yang backend tidak produce
- fake progress

---

# 48. WEBHOOK INTEGRATION

Jika backend menerima webhook:

trace:

```text
provider
 ↓
webhook
 ↓
DB update
 ↓
frontend refresh/realtime
```

Cari kondisi webhook bekerja tetapi UI tidak pernah merefresh canonical state.

---

# 49. PAYMENT / TRANSACTION

Jika ada payment flow, jangan terima status client sebagai canonical.

Trace:

```text
frontend
 ↓
create payment
 ↓
provider
 ↓
webhook
 ↓
backend canonical status
 ↓
frontend
```

Tandai UI yang menyatakan PAID sebelum server confirmation.

---

# 50. UPLOAD → STORAGE → DISPLAY

Trace penuh:

```text
file
 ↓
upload
 ↓
storage
 ↓
metadata DB
 ↓
canonical URL
 ↓
response
 ↓
render
```

Cari flow yang berhenti di salah satu layer.

---

# 51. DUPLICATE IMPLEMENTATION

Cari dua implementasi feature yang sama:

```text
old API + new API
mock path + real path
v1 + v2
local store + server state
```

Jika keduanya aktif:

`DUAL SOURCE OF TRUTH`

---

# 52. SOURCE OF TRUTH MATRIX

Untuk setiap business entity:

| Entity | Canonical source | FE source | Mutation source | Consistent? |
|---|---|---|---|---|

Contoh entity:

- user
- order
- stock
- audit
- notification
- payment
- customer
- report

---

# 53. CLASSIFICATION

Semua temuan harus memiliki satu kategori:

```text
MOCKED
DEAD-END
UNINTEGRATED
PARTIAL
ORPHAN FRONTEND
ORPHAN BACKEND
BROKEN CONTRACT
FAKE SUCCESS
LOCAL-ONLY
SILENT FALLBACK
DUAL SOURCE OF TRUTH
HONEST PLACEHOLDER
```

---

# 54. SEVERITY

Gunakan:

## P0

Dapat menyebabkan:

- security issue
- wrong transaction
- wrong payment
- data loss
- false audit/compliance information
- tenant leak
- user percaya mutation berhasil padahal tidak

## P1

Core feature tidak benar-benar bekerja.

## P2

Feature partially integrated atau misleading tetapi workaround ada.

## P3

Dead code, prototype, cleanup, UX inconsistency.

---

# 55. EVIDENCE

Setiap finding wajib memiliki:

```text
Frontend file:
Frontend symbol:
Backend file:
Backend symbol:
Endpoint:
Observed flow:
Expected flow:
Break point:
```

Gunakan `NOT FOUND` bila layer tidak ada.

---

# 56. OUTPUT — EXECUTIVE SUMMARY

Maksimal 20 poin.

Fokus pada:

- fake functionality
- highest-risk integration gaps
- dead flows
- misleading success
- APIs tanpa consumer
- frontend yang masih mock meski backend tersedia

---

# 57. OUTPUT — MOCK INVENTORY

| Feature | Mock source | UI exposure | Production risk | Severity |
|---|---|---|---|---|

---

# 58. OUTPUT — DEAD-END INVENTORY

| Entry point | User action | Where flow stops | Consequence |
|---|---|---|---|

---

# 59. OUTPUT — FRONTEND → BACKEND MATRIX

| Feature | FE | Request | Backend | DB/External | Status |
|---|---|---|---|---|---|

Status:

- END-TO-END
- PARTIAL
- DEAD-END
- MOCKED
- BROKEN

---

# 60. OUTPUT — BACKEND → FRONTEND MATRIX

| Endpoint | Backend works? | Frontend caller | UI consumer | Status |
|---|---|---|---|---|

---

# 61. OUTPUT — CONTRACT MISMATCHES

| API | Mismatch | Frontend | Backend | Risk |
|---|---|---|---|---|

---

# 62. OUTPUT — FAKE SUCCESS STATES

| Action | Fake success mechanism | Actual persistence | Severity |
|---|---|---|---|

---

# 63. OUTPUT — LOCAL-ONLY BUSINESS STATE

| Feature | Local mutation | Expected canonical source | Risk |
|---|---|---|---|

---

# 64. OUTPUT — ORPHANS

Pisahkan:

## Orphan Frontend

- unused hook
- component
- API wrapper
- route
- dialog
- service

## Orphan Backend

- endpoint
- handler
- service
- job

Jangan rekomendasikan deletion otomatis.

---

# 65. OUTPUT — MISLEADING UI

Cari label seperti:

```text
Live
Verified
Synced
Secure
Saved
Completed
Uploaded
Real-time
Connected
```

yang tidak dibuktikan backend/runtime.

Buat:

| UI claim | Actual behavior | Classification | Severity |
|---|---|---|---|

---

# 66. OUTPUT — TOP INTEGRATION GAPS

Berikan maksimal 20.

Format:

```text
Finding:
Category:
Severity:

User-visible behavior:

Frontend:

Backend:

Actual flow:

Break point:

Risk:

What needs integration:
```

Jangan melakukan implementasi.

---

# 67. OUTPUT — END-TO-END COVERAGE

Kelompokkan seluruh feature menjadi:

## FULLY INTEGRATED

## PARTIALLY INTEGRATED

## MOCKED

## DEAD-END

## BACKEND ONLY

## FRONTEND ONLY

## UNKNOWN

---

# 68. OUTPUT — IMPLEMENTATION ORDER

Tanpa memperbaiki code, susun urutan remediation:

1. P0 fake/misleading transactional states
2. authentication/authorization gaps
3. data-loss/local-only mutations
4. core dead-end flow
5. broken FE-BE contracts
6. backend APIs yang belum dipakai
7. remaining mocks
8. orphan cleanup

---

# 69. IMPORTANT DISTINCTION

Jangan menganggap sesuatu bug hanya karena terlihat mock.

Contoh valid:

```text
Storybook mock
unit-test fixture
Playwright fixture
development seed
demo environment
```

Masalah terjadi bila mock:

- masuk production code path
- tidak jelas dilabeli
- menggantikan canonical data
- menghasilkan misleading UI

---

# 70. FINAL QUESTION

Akhiri audit dengan jawaban eksplisit:

> Dari seluruh frontend dan backend, fitur mana yang benar-benar end-to-end, mana yang hanya terlihat selesai tetapi masih mocked/partial/dead-end, di titik mana integrasi putus, dan gap mana yang paling berisiko terhadap user atau data?

Jangan memperbaiki apa pun.

Tujuan fase ini adalah menghasilkan **truth map frontend ↔ backend** sebelum coding agent melakukan remediation.
