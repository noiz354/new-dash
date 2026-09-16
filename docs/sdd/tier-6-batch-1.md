# Tier 6 — Batch 1 Operasi (44 PROMOTE)

> Detail triase: `docs/triase-batch-1-operasi.md`. Pola per item: implementasi
> nyata + persist + audit bila mutasi; ATAU label scope jujur + hapus dari PROMOTE
> dengan alasan. Dependensi kanon (WO 0894/8802, LOTO #4092/#M-44, INS-412,
> PART-SEAL-8821, Shift A, GPS Kalimantan) TIDAK diputus di batch ini.

## WO hub (6)

- WO-2 evidence viewer LOTO: lightbox/galeri konteks-WO (hash SHA-256 sudah ada di FindingCapture) → tampilkan evidence per WO + hash; AC: foto T3-1 tampil di dossier + reload tahan.
- WO-3 drawer requisition prefill: prefill SKU dari inventaris (bukan sekadar hit 'equisition'); AC: pilih SKU → qty tersedia nyata → submit jadi movement/PO-draft.
- WO-5 tech assist flow: alur request assist khusus (bukan sebutan generik); AC: request → notifikasi/assignment → tercatat.
- WO-9 autosave + STALE: catatan WO autosave dengan badge STALE saat basi; AC: offline-edit → STALE → sync pulih (pola A.10).
- WO-10 drag pipeline: kanban drag antar-status = transisi state machine nyata (guard 409/422); AC: drop → API transition → audit.
- WO-11 labor validation: quick-log labor tervalidasi (jam wajar, tech valid); AC: input aneh ditolak jujur + tersimpan.

## SR triage (10)

- SR-3 asset drawer; SR-4 batch bar (U); SR-5 dispatch taxonomy; SR-6 export log (U); SR-7 convert confirm P1+LOTO; SR-8 breach handling; SR-9 convert validation; SR-10 optimistic STALE; SR-11 reject/dup modal; SR-12 chat retry (U).
- AC umum: tiap aksi → API nyata + toast server + `router.refresh()` (pola Slice 2); (U) verifikasi dulu — bila ternyata DONE-semu, centang + bukti.

## PM hub (7)

- PM-1 history-link target (U); PM-3 checklist detail; PM-4 row drawer; PM-6 export CSV; PM-9 STALE engine badge; PM-10 simulate marker jujur; PM-11 ready-first sort.
- AC: badge/marker jujur (pola GAP-10: NOT CONNECTED/LOCAL DEMO); export = baris nyata.

## Inspections (6)

- FI-3 unified drawer; FI-4/5 templates content+create; FI-8 fast-link a11y; FI-10 publish validation; FI-11 reorder keyboard; FI-12 IoT offline widget (jujur: unconnected-state eksplisit).
- AC: mengikuti pola GAP-11 (live + demo fallback ber-badge).

## Findings (8)

- FC-1 conversion result page; FC-3a evidence lightbox; FC-5 unresolved recount (angka ← query nyata); FC-6 batch convert (idempoten per item + partial-failure jujur); FC-7 export CSV; FC-11 convert-fail toast (error server asli); FC-12 OSHA derivation (aturan eksplisit, bukan karangan); FC-10 BOM shortage (cek stok nyata).
- AC: recount/derivasi selalu dari DB; batch lapor per-item gagal/berhasil.

## Mobile field (4)

- ME-7 site picker; ME-8 FAIL validation rule; ME-10 Modbus fail fallback (jujur NOT CONNECTED); ME-12 pinch-zoom decision (putuskan + dokumentasikan).
- AC sistem B: touch 48px, kontras, offline-first (pola Slice 6/GAP-11).

## Verdict batch

44/44 berverdict (DONE/USANG/PROMOTE-terjawab) + guard-test tiap penghapusan fiksi → Batch 1 CLOSED.
