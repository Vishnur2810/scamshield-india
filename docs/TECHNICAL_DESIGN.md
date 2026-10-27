# ScamShield India — Technical Design Document

**Version:** 1.0 (Prototype) · **Theme:** Digital Safety & Cyber Fraud Awareness · **Event:** Hack for Social Cause, VBYLD 2027

## 1. Objective
Give any Indian citizen — including first-time smartphone users, students and senior citizens — a simple, private, offline way to check whether a message is likely a scam **before** they click a link, make a payment or share an OTP.

## 2. Requirements
**Functional**
- F1: Accept free-text message input (SMS / WhatsApp / email).
- F2: Detect common Indian scam indicators.
- F3: Output a 0–100 risk score and level (SAFE / LOW / MEDIUM / HIGH).
- F4: Highlight suspicious words and explain each warning sign in plain language.
- F5: Give actionable safety tips and official reporting channels (1930, cybercrime.gov.in, Sanchar Saathi).
- F6: Provide sample messages for demonstration/awareness.

**Non-functional**
- Privacy: no data leaves the device; no storage of messages.
- Offline: works without internet after the page loads.
- Accessibility: large fonts, high contrast, keyboard operable, `aria-live` results, mobile responsive.
- Zero cost: static files, no server, no API keys.
- Speed: analysis in < 5 ms per message.

## 3. Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                    USER'S BROWSER (offline-capable)               │
│                                                                    │
│  ┌──────────────┐   text    ┌──────────────────────────────────┐  │
│  │  index.html  │ ───────▶ │      js/detector.js (Engine)       │  │
│  │  UI / Input  │          │                                    │  │
│  │  (app.js)    │          │ 1. Normalise input                 │  │
│  └──────▲───────┘          │ 2. Rule matcher (15 regex rules)   │  │
│         │                  │ 3. Weighted scoring                │  │
│         │   result JSON    │ 4. Combination bonuses             │  │
│         └──────────────────│ 5. Risk level + tips generator     │  │
│                            └──────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │ Result view: score bar · verdict · highlighted text ·    │    │
│  │ warning signs · safety tips · helpline (1930)             │    │
│  └──────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
           No server · No database · No external API calls
```

**Data flow:** Input text → `ScamShield.analyze(text)` → `{ score, level, label, indicators[], tips[], matches[] }` → rendered by `app.js`.

### Components
| Module | Responsibility |
|---|---|
| `index.html` | Page structure, input form, result containers |
| `css/style.css` | Responsive, accessible styling; colour-coded risk levels |
| `js/detector.js` | Rule definitions, scoring, risk levels, tips. Works in browser (`window.ScamShield`) and Node (`module.exports`) |
| `js/app.js` | Event handling, XSS-safe highlighting, rendering results |
| `js/samples.js` | Demo messages (generated from test data) |
| `tests/` | Labelled sample data and automated test runner |

## 4. Detection rules
| Rule | Weight | Example trigger |
|---|---|---|
| Credential request (share OTP/PIN/CVV) | 30 | "share the OTP" |
| Remote-access app | 25 | "install AnyDesk", ".apk" |
| Utility disconnection | 25 | "electricity will be disconnected" |
| Account threat / legal fear | 20 | "account will be blocked", "FIR", "digital arrest" |
| Fake KYC / PAN / Aadhaar update | 18 | "update your KYC" |
| Payment / fee / QR request | 18 | "pay processing fee Rs 4999", "scan QR to receive" |
| Suspicious link | 15 | bit.ly, `.xyz`, IP links, t.me |
| Unexpected reward | 15 | "you have won", "lucky draw" |
| Job / investment bait | 15 | "earn Rs 3000 daily", "guaranteed returns" |
| Unofficial contact number | 15 | "call officer 98XXXXXX21" |
| Urgency | 12 | "immediately", "within 2 hours" |
| Secrecy | 10 | "do not tell anyone" |
| Impersonation (bank/govt/brand) | 8 | "SBI", "customer care", "FedEx" |
| OTP mentioned (no request) | 8 | genuine OTP alerts |
| Generic link | 6 | any URL |

**Combination bonuses:** OTP request + threat/urgency (+10); KYC + link (+10); prize + payment (+15); utility/account threat + phone/urgency (+15).
**Levels:** ≥60 HIGH, 30–59 MEDIUM, 1–29 LOW, 0 SAFE.

## 5. Security & privacy
- All processing is client-side; messages are never transmitted or stored.
- Output is HTML-escaped before rendering to prevent XSS from pasted content.
- No third-party scripts, cookies or trackers.

## 6. Testing
`node tests/run_tests.js` runs 10 labelled real-world-style messages (7 scam, 3 genuine) plus an empty-input edge case. Current result: **11/11 pass**. Genuine messages (family texts, meeting reminders, real OTP alerts, bank bill reminders) score SAFE/LOW, avoiding false alarms.

## 7. Scalability & future work
| Phase | Enhancement |
|---|---|
| 1 | Tamil, Hindi + more Indian languages (rules & UI); voice output |
| 2 | Progressive Web App (installable, fully offline); share-to-app on Android |
| 3 | On-device ML (TF.js / small local model) trained on anonymised scam data for context |
| 4 | Community reporting, trending-scam feed, integration with Sanchar Saathi / 1930 reporting flows |
| 5 | Deployment through colleges, NSS/NYKS volunteers, panchayats and banks for digital-literacy drives |

Because the engine is a pure function with a data-driven rule list, new scam patterns and languages can be added without changing the architecture.

## 8. Limitations
Rule-based keyword detection can miss novel wording and may flag some legitimate messages; results are advisory only.
