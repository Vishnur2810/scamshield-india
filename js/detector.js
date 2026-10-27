/**
 * ScamShield India — Rule-based scam detection engine
 * Runs fully offline in the browser (and in Node.js for tests).
 * No server, no database, no external AI service.
 * License: MIT
 */
(function (root) {
  "use strict";

  // Each rule: id, category, plain-language label, weight (0-30), regex patterns, safety tip.
  const RULES = [
    {
      id: "otp_pin",
      category: "Credential request",
      label: "Asks you to share or enter OTP, PIN, CVV or password",
      weight: 30,
      patterns: [
        /\b(share|send|tell|provide|enter|give|forward|read out)\b.{0,40}\b(otp|one[\s-]?time[\s-]?password|upi\s*pin|atm\s*pin|m-?pin|pin|cvv|password|passcode|code)\b/i,
        /\b(otp|upi\s*pin|atm\s*pin|cvv|password)\b.{0,30}\b(share|send|tell|provide|enter|give|forward)\b(?!.{0,15}\b(with )?(anyone|no ?one)\b)/i,
      ],
      tip: "Never share OTP, UPI PIN, CVV or passwords. Banks and government offices never ask for them.",
    },
    {
      id: "otp_mention",
      category: "Sensitive code mentioned",
      label: "Mentions an OTP / PIN (check who is asking)",
      weight: 8,
      patterns: [/\b(otp|one[\s-]?time[\s-]?password|upi\s*pin|cvv)\b/i],
      tip: "A genuine OTP message only informs you. If anyone calls or messages asking for it, it is a scam.",
    },
    {
      id: "unknown_contact",
      category: "Unofficial contact",
      label: "Asks you to call/WhatsApp a personal number",
      weight: 15,
      patterns: [
        /\b(call|contact|whatsapp|message|reach)\b.{0,40}(\+?91[\s-]?)?[6-9][0-9X]{9}\b/i,
        /\b(call|contact)\b.{0,30}\b(officer|executive|agent|manager)\b/i,
      ],
      tip: "Do not call numbers given in unexpected messages. Use the official helpline from the organisation's website.",
    },
    {
      id: "account_threat",
      category: "Threat / fear",
      label: "Threatens to block, suspend or penalise your account",
      weight: 20,
      patterns: [
        /\b(account|card|sim|kyc|pan|aadhaar|wallet|number|connection)\b.{0,40}\b(block(ed)?|suspend(ed)?|deactivat(e|ed)|clos(e|ed)|freez(e|ed)|terminat(e|ed)|disconnect(ed)?|expir(e|ed|ing))\b/i,
        /\b(legal action|arrest|police|fir|penalty|fine|court|cbi|customs|narcotics)\b/i,
        /\bdigital arrest\b/i,
      ],
      tip: "Real institutions do not threaten you over SMS/WhatsApp. Verify by calling the official number on their website or your card.",
    },
    {
      id: "urgency",
      category: "Urgency pressure",
      label: "Creates urgency or a deadline",
      weight: 12,
      patterns: [
        /\b(urgent(ly)?|immediately|right now|act now|asap|hurry|last chance|final (notice|warning|reminder))\b/i,
        /\b(within|in)\s+\d+\s*(min(ute)?s?|hours?|hrs?)\b/i,
        /\b(today|tonight)\b.{0,25}\b(only|before|else|otherwise)\b/i,
      ],
      tip: "Scammers rush you so you don't think. Pause and verify before acting.",
    },
    {
      id: "kyc_update",
      category: "Fake KYC / update",
      label: "Asks to update KYC, PAN or Aadhaar via a link or call",
      weight: 18,
      patterns: [
        /\b(kyc|e-?kyc|pan|aadhaar|aadhar)\b.{0,40}\b(update|verify|verification|link|pending|expired|incomplete)\b/i,
        /\b(update|complete|verify)\b.{0,25}\b(kyc|pan|aadhaar)\b/i,
      ],
      tip: "KYC is updated only at your bank branch, official app or website — never through SMS links.",
    },
    {
      id: "suspicious_link",
      category: "Suspicious link",
      label: "Contains a link (shortened or unusual)",
      weight: 15,
      patterns: [
        /\b(bit\.ly|tinyurl\.com|t\.co|goo\.gl|cutt\.ly|rb\.gy|is\.gd|shorturl\.at|tiny\.cc|ow\.ly)\b/i,
        /https?:\/\/(\d{1,3}\.){3}\d{1,3}/i,
        /\b[a-z0-9-]+\.(xyz|top|club|online|site|live|info|buzz|icu|click|link|rest|cfd|shop)\b/i,
        /\bwa\.me\/|telegram\.me\/|t\.me\//i,
      ],
      tip: "Do not open unknown links. Type the official website address yourself.",
    },
    {
      id: "any_link",
      category: "Link present",
      label: "Contains a web link",
      weight: 6,
      patterns: [/(https?:\/\/|www\.)\S+/i],
      tip: "Check the link domain carefully — fake sites copy bank names with small spelling changes.",
    },
    {
      id: "reward",
      category: "Unexpected reward",
      label: "Promises a prize, lottery, cashback or refund",
      weight: 15,
      patterns: [
        /\b(congratulations|congrats|you (have )?won|winner|lottery|lucky draw|jackpot|prize|reward points?|cash ?back|refund|free gift|selected)\b/i,
      ],
      tip: "If you did not enter a contest, you cannot win it. Ignore unexpected prize messages.",
    },
    {
      id: "payment_pressure",
      category: "Payment request",
      label: "Asks you to pay a fee, deposit or scan a QR",
      weight: 18,
      patterns: [
        /\b(pay|transfer|deposit|send)\b.{0,30}(rs\.?|₹|inr|rupees|\d{3,})/i,
        /\b(processing|registration|delivery|clearance|security)\s+(fee|charge|amount)\b/i,
        /\b(scan|qr code)\b.{0,30}\b(receive|get|claim)\b/i,
        /\b(request money|collect request)\b/i,
      ],
      tip: "You never need to pay or scan a QR code to RECEIVE money. Scanning a QR only sends money.",
    },
    {
      id: "job_investment",
      category: "Job / investment bait",
      label: "Easy money: part-time job, task earnings or guaranteed returns",
      weight: 15,
      patterns: [
        /\b(work from home|part[\s-]?time job|earn\s*(rs\.?|₹)?\s*\d+|daily (income|earning)|like (and|&) earn|youtube likes|task based)\b/i,
        /\b(guaranteed|double your money|high returns?|\d+%\s*(daily|weekly|returns?)|trading tips|crypto profit)\b/i,
      ],
      tip: "Jobs that pay for likes/reviews or 'guaranteed' high returns are common scams. Never pay to get a job.",
    },
    {
      id: "impersonation",
      category: "Impersonation",
      label: "Claims to be from a bank, government office or company",
      weight: 8,
      patterns: [
        /\b(sbi|hdfc|icici|axis|kotak|pnb|rbi|bank manager|customer care|income tax|it department|trai|electricity board|eb office|bsnl|jio|airtel|fedex|dhl|india post|amazon|flipkart|paytm|phonepe|gpay)\b/i,
      ],
      tip: "Contact the organisation only through official numbers or apps — not numbers given in the message.",
    },
    {
      id: "remote_app",
      category: "Remote access",
      label: "Asks to install an app (AnyDesk, TeamViewer, APK)",
      weight: 25,
      patterns: [/\b(anydesk|teamviewer|quicksupport|rustdesk|screen share|install (this|the) app|\.apk)\b/i],
      tip: "Never install apps or APK files sent by strangers. They can take control of your phone.",
    },
    {
      id: "electricity",
      category: "Utility disconnection",
      label: "Threatens electricity/water/gas disconnection",
      weight: 25,
      patterns: [/\b(electricity|power|light|gas|water)\b.{0,40}\b(disconnect(ed|ion)?|cut|cutoff|cut-off)\b/i],
      tip: "Utility boards send bills through official channels. Check your account on the official portal.",
    },
    {
      id: "secrecy",
      category: "Secrecy",
      label: "Asks you to keep it secret",
      weight: 10,
      patterns: [/\b(do not|don't|dont)\s+(tell|inform)\b.{0,30}\b(anyone|family|bank|police)\b/i, /\bkeep (this|it) (secret|confidential)\b/i],
      tip: "Being told to keep things secret is a major red flag. Talk to someone you trust.",
    },
  ];

  const LEVELS = [
    { min: 60, level: "HIGH", label: "High risk — very likely a scam" },
    { min: 30, level: "MEDIUM", label: "Medium risk — be careful" },
    { min: 1, level: "LOW", label: "Low risk — some warning signs" },
    { min: 0, level: "SAFE", label: "No common scam signs found" },
  ];

  function analyze(text) {
    const input = String(text || "").trim();
    if (!input) {
      return { score: 0, level: "EMPTY", label: "Please paste a message to check.", indicators: [], tips: [], matches: [] };
    }

    const indicators = [];
    const matches = [];
    let score = 0;
    const hasSuspiciousLink = RULES.find((r) => r.id === "suspicious_link").patterns.some((p) => p.test(input));

    for (const rule of RULES) {
      // Don't double-count generic link when a suspicious link was already found
      if (rule.id === "any_link" && hasSuspiciousLink) continue;
      if (rule.id === "otp_mention" && indicators.some((i) => i.id === "otp_pin")) continue;
      let hit = null;
      for (const p of rule.patterns) {
        const m = input.match(p);
        if (m) { hit = m[0]; break; }
      }
      if (hit) {
        score += rule.weight;
        indicators.push({ id: rule.id, category: rule.category, label: rule.label, weight: rule.weight, evidence: hit, tip: rule.tip });
        matches.push(hit);
      }
    }

    // Combination bonus: credential request + threat/urgency is the classic scam pattern
    const ids = new Set(indicators.map((i) => i.id));
    if (ids.has("otp_pin") && (ids.has("account_threat") || ids.has("urgency"))) score += 10;
    if (ids.has("kyc_update") && (ids.has("suspicious_link") || ids.has("any_link"))) score += 10;

    if (ids.has("reward") && ids.has("payment_pressure")) score += 15;
    if ((ids.has("electricity") || ids.has("account_threat")) && (ids.has("unknown_contact") || ids.has("urgency"))) score += 15;
    if (ids.has("otp_pin")) ids.delete("otp_mention");

    score = Math.min(100, score);
    const lv = LEVELS.find((l) => score >= l.min);
    const tips = indicators.map((i) => i.tip);
    if (lv.level === "HIGH" || lv.level === "MEDIUM") {
      tips.push("If you lost money, call the National Cyber Crime Helpline 1930 immediately or report at cybercrime.gov.in.");
      tips.push("Report suspicious calls/SMS on the Sanchar Saathi portal (Chakshu) at sancharsaathi.gov.in.");
    }
    return { score, level: lv.level, label: lv.label, indicators, tips: Array.from(new Set(tips)), matches };
  }

  const api = { analyze, RULES, LEVELS };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.ScamShield = api;
})(typeof window !== "undefined" ? window : globalThis);
