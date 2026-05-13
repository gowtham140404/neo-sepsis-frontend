# NeoSepsis AI — Neonatal Sepsis Prediction Platform

ICU-grade AI frontend for the XGBoost neonatal sepsis prediction model.

---

## Project Structure

```
src/
  components/
    Layout.jsx         # App shell, sidebar, mobile nav
    PatientCard.jsx    # ICU patient card
    RiskGauge.jsx      # SVG arc gauge + RiskBadge
    InstallPrompt.jsx  # PWA install banner
  pages/
    Dashboard.jsx      # Overview, stats, trend charts
    PredictionPage.jsx # 4-step clinical form → real API
    AlertsPage.jsx     # High/Very High risk patients
    PatientDetail.jsx  # Risk analysis + SHAP-style chart
    SettingsPage.jsx   # Health check + model info
  services/
    api.js             # Axios client, retry, cold-start detection
  hooks/
    usePredict.js      # Prediction state machine
    usePatients.js     # LocalStorage patient store
  styles/
    index.css          # Tailwind + glass/neon utilities
  App.jsx
  main.jsx
```

---

## Local Setup

```bash
# 1. Clone / create project
git clone <your-repo> && cd neonatal-sepsis-ai

# 2. Install dependencies
npm install

# 3. Run dev server
npm run dev
# → http://localhost:3000

# 4. Build for production
npm run build

# 5. Preview production build
npm run preview
```

---

## Environment

No `.env` needed — the backend URL is hardcoded in `src/services/api.js`:

```
https://neonatal-sepsis-api-3.onrender.com
```

---

## GitHub Push

```bash
git init
git add .
git commit -m "feat: NeoSepsis AI frontend"
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```

---

## Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deploy
vercel --prod
```

Vercel auto-detects Vite. No extra config needed.

Add a `vercel.json` for SPA routing:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## PWA Installation (Chrome on Android)

1. Open deployed URL in Chrome on Android
2. Tap the "Install NeoSepsis AI" banner (auto-appears)
3. OR: tap Chrome menu → "Add to Home Screen"
4. The app installs as a standalone app with offline support

---

## Capacitor — Android APK

### Setup
```bash
npm run build
npm run cap:add      # adds Android platform
npm run cap:sync     # copies build to Android
npm run cap:open     # opens Android Studio
```

### Generate Release APK in Android Studio
1. `Build → Generate Signed Bundle / APK`
2. Choose `APK`
3. Create keystore: `keytool -genkey -v -keystore release.keystore -alias neosepsis -keyalg RSA -keysize 2048 -validity 10000`
4. Select `release` build variant
5. Click `Finish` → APK is in `android/app/release/`

### Install on device
```bash
adb install android/app/release/app-release.apk
```

---

## API Reference

| Endpoint    | Method | Description          |
|-------------|--------|----------------------|
| `/`         | GET    | Health check         |
| `/predict`  | POST   | Sepsis prediction    |
| `/docs`     | GET    | Swagger UI           |
| `/model-info` | GET  | Model metadata       |

### Prediction Request Body
```json
{
  "ga": 32,
  "bw": 1800,
  "age_onset": 48,
  "enr_leth": 1,
  "enr_cry": 0,
  "enr_refl": 1,
  "enr_fever": 1,
  "enr_tachyc": 1,
  "enr_tachyp": 0,
  "enr_apn": 0,
  "enr_retr": 1,
  "enr_cyan": 0,
  "enr_abd": 0,
  "enr_puls": 0,
  "enr_hi_cry": 0,
  "enr_cxr": 1,
  "enr_fio2": 1,
  "enr_crp_val": 48.5,
  "enr_tlc_val": 14.2
}
```

---

## Risk Stratification

| Probability | Category  | Action                    |
|-------------|-----------|---------------------------|
| 0 – 20%     | Low       | Routine monitoring        |
| 20 – 50%    | Moderate  | Enhanced surveillance     |
| 50 – 75%    | High      | Urgent evaluation         |
| 75 – 100%   | Very High | Immediate intervention    |

---

## Clinical Disclaimer

NeoSepsis AI is an AI-assisted clinical decision support tool. It is not a substitute for clinical judgment, physical examination, or laboratory confirmation. Always follow institutional protocols and consult a qualified neonatologist.
