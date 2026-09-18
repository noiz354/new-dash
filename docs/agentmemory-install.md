# Runbook Instalasi agentmemory (Global, Codex + OpenCode)

> Sumber: fork `pa4uslf/agentmemory-for-codex` (v0.9.29 saat instalasi).
> Cakupan: instalasi **global** (satu server untuk semua agen), skill ala Addy Osmani
> untuk `codex` + `opencode`, embeddings lokal, persistensi via systemd.
> Bahasa respons repo ini: Indonesia. Terakhir dikerjakan: 2026-09-18.

## 0. Hasil akhir (state yang diharapkan)

| Komponen | Lokasi / nilai |
|---|---|
| Binary CLI | `~/.npm-global/bin/agentmemory` (v0.9.29), via symlink npm `-g` → `~/.local/share/agentmemory-src` |
| Source checkout | `~/.local/share/agentmemory-src` (shallow clone `--depth 1`, ~21 MB) |
| Server REST/MCP | `http://localhost:3111` |
| Streams | port `3112` (SSE), Viewer `3113`, iii-worker `49134` |
| State/data | `~/.local/share/agentmemory` (Linux), biner iii-engine di `~/.agentmemory/bin` |
| Systemd unit | `~/.config/systemd/user/agentmemory.service` (+ `loginctl enable-linger`) |
| MCP Codex | `~/.codex/config.toml` (oleh `agentmemory connect codex`) |
| Plugin Codex | marketplace `pa4uslf/agentmemory-for-codex`, plugin `agentmemory@agentmemory` 0.9.29, enabled |
| MCP OpenCode | `~/.config/opencode/opencode.json` (dibuat oleh `connect`; catatan: config aktif user adalah `opencode.jsonc` — tidak disentuh) |
| Plugin OpenCode | `~/.config/opencode/plugins/agentmemory-capture.ts` + `commands/recall.md`, `commands/remember.md`, key `"plugin"` di `opencode.json` |
| Skills global | `~/.agents/skills/*` (17 skills, Source: `pa4uslf/agentmemory-for-codex`), ter-link untuk `-a codex` dan `-a opencode` |
| Embeddings lokal | `EMBEDDING_PROVIDER=local`, model `Xenova/all-MiniLM-L6-v2` (q8, ±23 MB) |
| Lesson tersimpan | `mem_mu4cxrom, mem_mu4cxrpw, mem_mu4cxrqx, mem_mu4cxrrt, mem_mu4cxruv, mem_mu4cxrw5, mem_mu4cxry7` |

## 1. Prasyarat

- Node.js ≥ 20 (teruji: v22.23.0), npm 10.9.8, `npm prefix` = `~/.npm-global` dan ada di `PATH`.
- `git`, `curl`, `tar` (di WSL pastikan ketiganya ada).
- Port bebas: `3111 3112 3113 49134`.

```bash
node -v && npm -v && npm config get prefix
for p in 3111 3112 3113 49134; do ss -ltn | grep -q ":$p " && echo "port $p TERPAKAI" || echo "port $p bebas"; done
```

## 2. Clone fork + build + instal global

```bash
# Full clone sering timeout → pakai shallow clone
git clone --depth 1 https://github.com/pa4uslf/agentmemory-for-codex.git ~/.local/share/agentmemory-src
cd ~/.local/share/agentmemory-src

# npm install polos GAGAL (bug arborist npm: "edgesOut" di vitest) → wajib flag ini:
npm install --legacy-peer-deps
npm run build
npm install -g ./
agentmemory --version   # → 0.9.29
```

Gotcha: `npm install -g ./` membuat **symlink** ke checkout source. Akibatnya
ESM bare-import di-resolve via realpath — dependensi yang diinstal di prefix
global **tidak terlihat** oleh server (lihat §7 tentang `@huggingface/transformers`).

## 3. Start server + validasi 4 port

```bash
CI=1 agentmemory start   # CI=1 melewati first-run wizard; iii-engine terunduh otomatis ke ~/.agentmemory/bin
ss -ltn | grep -E ':(3111|3112|3113|49134) '   # keempatnya harus LISTEN
agentmemory demo         # harus diakhiri "agentmemory is working"
agentmemory status       # sesi/observasi > 0, Health: healthy
```

Timing: perintah kembali dalam 2–5 dtk (log "Started" muncul se-detik),
server ready 25–60 dtk, warmup model embeddings 1–3 menit. **Jangan tekan `^C`**
saat restart — walau prompt kembali, restart tetap jalan di background
(terlihat sebagai PID baru); `^C` hanya membatalkan tampilan, bukan prosesnya.

## 4. Wire Codex (MCP + plugin + hooks)

```bash
agentmemory connect codex        # menulis blok MCP ke ~/.codex/config.toml
codex plugin marketplace add pa4uslf/agentmemory-for-codex
codex plugin add agentmemory@agentmemory   # → installed, enabled 0.9.29
```

Catatan: dokumentasi upstream menyebut flag `--with-hooks` untuk mengatasi
isu Codex Desktop #16430 (6 hooks). Verifikasi hooks terpasang bila memakai Desktop.

## 5. Wire OpenCode (MCP + plugin 22 hooks)

```bash
agentmemory connect opencode     # membuat ~/.config/opencode/opencode.json
```

Lalu pasang plugin dari source checkout:

```bash
SRC=~/.local/share/agentmemory-src
cp "$SRC/plugin/opencode/agentmemory-capture.ts" ~/.config/opencode/plugins/
cp "$SRC/plugin/opencode/commands/recall.md" "$SRC/plugin/opencode/commands/remember.md" ~/.config/opencode/commands/
# daftarkan key "plugin" di opencode.json (JANGAN ubah opencode.jsonc milik user bila ada)
```

## 6. Skills global ala Addy Osmani (codex + opencode)

```bash
npx -y skills add pa4uslf/agentmemory-for-codex -y -g -a codex
npx -y skills add pa4uslf/agentmemory-for-codex -y -g -a opencode
skills list -g -a codex && skills list -g -a opencode   # 17 skills, Source: pa4uslf fork
```

PENTING — selalu pakai `-g`: tanpa `-g`, CLI menulis `.agents/skills/` +
`skills-lock.json` **di dalam repo aktif** (mengotori repo). Bila sudah terlanjur:

```bash
rm -rf .agents/skills skills-lock.json && rmdir .agents 2>/dev/null
git status --short   # pastikan bersih
```

Store global: `~/.agents/skills`. Codex membaca skills via marketplace plugin
yang enabled; OpenCode via plugin + slash commands (`recall.md`/`remember.md`).

## 7. Opt-in local embeddings

```bash
# di shell / env service:
export EMBEDDING_PROVIDER=local
agentmemory restart
```

Gotcha symlink (§2): `@huggingface/transformers` **harus** diinstal di direktori
source checkout, bukan di prefix global:

```bash
cd ~/.local/share/agentmemory-src
npm install --no-save --legacy-peer-deps @huggingface/transformers
agentmemory restart
```

Verifikasi (semua harus lolos):

```bash
agentmemory worker logs 2>&1 | grep -c "embed failed"   # harus 0
agentmemory status    # baris Embeddings: ✓ embeddings
# cache model ±23 MB ada; file indeks vektor ada di state_store.db
```

Peringatan: `✓ embeddings` pada status **bukan bukti** — pernah berstatus ✓
sementara worker log penuh `embed failed`. Selalu cek worker log.

## 8. Persistensi: systemd user service (wajib di WSL)

Server dari sesi terminal mati saat terminal/PTY ditutup. Solusi permanen:

```ini
# ~/.config/systemd/user/agentmemory.service
[Unit]
Description=agentmemory server
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
ExecStart=%h/.npm-global/bin/agentmemory start --foreground
Environment=EMBEDDING_PROVIDER=local
Environment=CI=1
Restart=always
RestartSec=5

[Install]
WantedBy=default.target
```

```bash
# hentikan instance manual dulu agar tidak rebutan port:
agentmemory stop; pkill -f "agentmemory|iii-engine" 2>/dev/null
systemctl --user daemon-reload
systemctl --user enable --now agentmemory.service
systemctl --user is-active agentmemory.service   # → active
agentmemory status   # data utuh (sesi/observasi tidak nol)
```

Di WSL, user service mati saat tidak ada sesi login → butuh (sekali, pakai password):

```bash
sudo loginctl enable-linger $USER
loginctl show-user $USER | grep Linger   # → Linger=yes
```

## 9. Flag LLM (GRAPH_EXTRACTION, CONSOLIDATION, AUTO_COMPRESS, INJECT_CONTEXT)

- Tidak ada dukungan A2A/opencode-to-agentmemory di source — provider LLM
  fixed: `anthropic | openai | gemini | openrouter | minimax | claude-agent-sdk`.
- `GRAPH_EXTRACTION`, `CONSOLIDATION`, `AUTO_COMPRESS` **wajib API key**
  provider; hanya `INJECT_CONTEXT` yang jalan tanpa key.
- Alternatif lokal tanpa keyBerbayar: arahkan `OPENAI_BASE_URL` ke Ollama
  (path chat-completions yang kompatibel).
- `claude-agent-sdk` fallback khusus Claude, berisiko rekursi bila server
  agentmemory dipakai dari dalam sesi Claude itu sendiri.

## 10. Troubleshooting cepat

| Gejala | Penyebab umum | Perintah cek / fix |
|---|---|---|
| `agentmemory status` semua nol / `v?` / `Health unknown` | server mati (PTY/terminal tertutup) — **bukan data hilang** | `systemctl --user is-active agentmemory.service`; `ss -ltn \| grep 3111` |
| `embed failed — Install @huggingface/transformers` | symlink `-g` (§2, §7) | instal di source dir (§7), lalu restart |
| Status `✓ embeddings` tapi recall buruk | klaim status ≠ bukti | `agentmemory worker logs \| grep -c "embed failed"` harus 0 |
| `npm install` error `edgesOut`/vitest | bug arborist npm | ulangi dengan `--legacy-peer-deps` |
| `.agents/skills` + `skills-lock.json` muncul di repo | lupa `-g` di skills CLI | hapus ( §6 ), pastikan `git status` bersih |
| `M next-env.d.ts` setelah install | auto-generate `next dev` Next.js, pre-existing | biarkan; jangan commit |
| Port rebutan setelah pindah ke systemd | instance manual masih hidup | `agentmemory stop` + `pkill -f "agentmemory\|iii-engine"` sebelum `enable --now` |

## 11. Referensi path

- Runbook upstream: `~/.local/share/agentmemory-src/INSTALL_FOR_AGENTS.md`
- Data: `~/.local/share/agentmemory` · biner: `~/.agentmemory/bin`
- Config Codex: `~/.codex/config.toml` · Config OpenCode: `~/.config/opencode/`
- Skills: `~/.agents/skills` · Unit systemd: `~/.config/systemd/user/agentmemory.service`
