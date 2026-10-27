# 🔎 Scam Pattern Catalogue

Every rule in [`js/detector.js`](../js/detector.js), what it looks for, a real-world-style example, and the advice shown to the user.

| # | Rule ID | Category | Weight | Example trigger | Advice shown |
|---|---|---|:---:|---|---|
| 1 | `otp_pin` | 🔐 Credential request | 30 | "share the OTP received", "enter your UPI PIN" | Never share OTP, UPI PIN, CVV or passwords |
| 2 | `remote_app` | 🖥️ Remote access | 25 | "install AnyDesk", "download this .apk" | Never install apps sent by strangers |
| 3 | `electricity` | ⚡ Utility disconnection | 25 | "power will be disconnected tonight" | Check bills only on the official portal |
| 4 | `account_threat` | 🚫 Threat / fear | 20 | "account will be BLOCKED", "FIR", "digital arrest" | Real institutions don't threaten over SMS |
| 5 | `kyc_update` | 🪪 Fake KYC | 18 | "update your KYC", "PAN not linked" | KYC is done at branch / official app only |
| 6 | `payment_pressure` | 💸 Payment request | 18 | "processing fee Rs 4999", "scan QR to receive" | You never pay or scan to *receive* money |
| 7 | `suspicious_link` | 🔗 Suspicious link | 15 | bit.ly, `.xyz`, raw IP, t.me, wa.me | Type the official website yourself |
| 8 | `reward` | 🎁 Unexpected reward | 15 | "Congratulations, you have won" | You can't win a contest you didn't enter |
| 9 | `job_investment` | 💼 Job / investment bait | 15 | "earn ₹3000 daily", "guaranteed returns" | Never pay to get a job |
| 10 | `unknown_contact` | 📞 Unofficial contact | 15 | "call our officer 98XXXXXX21" | Use helplines from official websites only |
| 11 | `urgency` | ⏰ Urgency pressure | 12 | "immediately", "within 2 hours" | Pause and verify before acting |
| 12 | `secrecy` | 🤫 Secrecy | 10 | "do not tell anyone" | Talk to someone you trust |
| 13 | `impersonation` | 🏢 Impersonation | 8 | SBI, HDFC, RBI, FedEx, customer care | Contact the organisation via official channels |
| 14 | `otp_mention` | 🔢 Code mentioned | 8 | genuine "123456 is your OTP" alerts | Genuine OTP alerts only inform you |
| 15 | `any_link` | 🌐 Link present | 6 | any URL | Check the domain spelling carefully |

## Combination bonuses

| Pair | Bonus | Why |
|---|:---:|---|
| OTP request **+** threat or urgency | +10 | The classic "share OTP or lose your account" pattern |
| KYC **+** link | +10 | Fake KYC phishing pages |
| Prize **+** payment | +15 | Advance-fee lottery fraud |
| Utility/account threat **+** phone number or urgency | +15 | Electricity-bill and bank-block call scams |

## Risk levels

| Score | Level | Message |
|:---:|---|---|
| 60–100 | 🔴 HIGH | Very likely a scam |
| 30–59 | 🟠 MEDIUM | Be careful |
| 1–29 | 🟡 LOW | Some warning signs |
| 0 | 🟢 SAFE | No common scam signs found |

## Adding a new pattern

1. Add an object to the `RULES` array in `js/detector.js` with `id`, `category`, `label`, `weight`, `patterns` and `tip`.
2. Add at least one scam **and** one genuine message to `tests/sample_messages.json`.
3. Run `npm test` and make sure every test still passes.

Spotted a new scam in the wild? [Open a "New scam pattern" issue](../../../issues/new/choose).
