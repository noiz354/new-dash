# settings_system_configuration

- File: `settings_system_configuration/screen.png`
- Design system: A
- Jenis layar: settings and system configuration
- Ringkasan visual: configuration page dengan tab categories, organization profile, dispatcher telemetry engine, numbering sequences, maintenance mode, export bundle, and save parameters.
- Kekuatan: tabs membantu membagi domain; numbering preview sangat berguna; maintenance mode prominent; telemetry engine status memberi operational feedback.
- Masalah visual: horizontal tabs dapat overflow di tablet; beberapa input terpotong seperti legal entity/timezone/work week; save button berada di header kanan dan perlu disabled/dirty state.
- Risiko rebuild: sedang-tinggi karena settings harus punya unsaved changes, validation, backup/export, and sensitive security fields.
- Komponen reusable yang teridentifikasi: SettingsTabs, ConfigFormCard, TelemetryEngineCard, NumberingSequenceTable, MaintenanceToggle, SaveParametersBar.
- Elemen yang perlu binding data/API: org profile, currency/timezone/work week, dispatcher thresholds, numbering sequences, lock policy, reset counters, save/export.
- Verifikasi tambahan terhadap `code.html`: cek tabs hidden beyond viewport, security/API key exposure, backup/restore states.
- Prioritas perbaikan:
  - P0: sensitive security tab must mask secrets and require confirmation for rotate/reset.
  - P1: tabs need responsive wrapping/scrolling.
  - P2: add dirty-state and validation messages.
