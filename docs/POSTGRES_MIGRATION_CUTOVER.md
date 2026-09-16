# Panduan Cutover & Migrasi Hosted PostgreSQL (Neon / Supabase / AWS RDS)
Apex Ops CMMS (`new-dash`)

Dokumen ini memetakan prosedur transisi dari driver lokal **PGlite (PostgreSQL WASM)** ke **Hosted PostgreSQL Cluster** (Neon, Supabase, Crunchy Data, atau AWS RDS) untuk deployment skala produksi multi-instance (*Phase 1 Explicit Debt A.15*).

---

## 1. Arsitektur Kompatibilitas Database

Skema `db/schema.ts` ditulis menggunakan `drizzle-orm/pg-core` standar murni tanpa ekstensi khusus vendor. Seluruh DDL, indeks, constraint, dan query Drizzle kompatibel 100% baik dengan PGlite maupun PostgreSQL versi 14, 15, 16, dan 17+.

```
┌────────────────────────────────────────────────────────┐
│            Apex Ops CMMS Backend Services              │
│  (wo-service, sr-service, audit-service, billing, etc) │
└───────────────────────────┬────────────────────────────┘
                            │ (Drizzle ORM pg-core)
             ┌──────────────┴──────────────┐
             ▼                             ▼
   [Local Dev / CI]              [Production / Cloud]
  Driver: PGlite (WASM)         Driver: postgres.js / node-pg
  Target: .data/pg              Target: DATABASE_URL (Neon/Supabase/RDS)
```

---

## 2. Langkah-Langkah Cutover Produksi

### Langkah 1: Siapkan Environment Variables
Pada environment hosting (Vercel, Railway, AWS ECS, Kubernetes), tetapkan variabel berikut:

```bash
# Connection String Postgres Hosted
DATABASE_URL="postgres://apex_user:strong_password@ep-apex-cluster-01.neon.tech/apex_ops_prod?sslmode=require"

# Pool Size & Timeout
DATABASE_POOL_MIN="2"
DATABASE_POOL_MAX="20"
DATABASE_TIMEOUT_MS="5000"

# Secret & Master Keys
COOKIE_SECRET="super-secret-hex-key"
CSRF_SECRET="session-csrf-secret-key"
```

### Langkah 2: Migrasi Skema ke Database Baru
Jalankan Drizzle Kit untuk menerapkan migrasi skema lengkap ke database hosted:

```bash
# Push skema langsung ke database target
npx drizzle-kit push
```

### Langkah 3: Ekspor Data Seed dari PGlite ke Hosted Postgres (Opsional)
Bila ingin memigrasikan data operasional atau tenant master dari environment dev ke prod:

```bash
# Ekspor snapshot data lokal
npm run db:setup
```

### Langkah 4: Pergantian Driver di `db/client.ts`
Untuk beralih ke node driver saat `DATABASE_URL` didefinisikan:
```ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;
const client = postgres(connectionString, { max: 20 });
export const db = drizzle(client, { schema });
```

---

## 3. Checklist Verifikasi Pasca-Cutover

1. `GET /api/health`: Memastikan status `database.status = "UP"` dan `latencyMs < 50ms`.
2. `POST /api/audit-trail/verify-chain`: Memverifikasi integritas hash-chain Merkle pada database baru.
3. `POST /api/auth/signup`: Menguji pembuatan tenant baru dan inisialisasi urutan sequence numbering.
4. `GET /api/work-orders`: Memastikan data tiket dan penugasan teknisi terbaca akurat.
