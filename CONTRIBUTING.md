# 🤝 Contributing to ScamShield India

Thank you for helping make digital India safer!

## Ways to help
- 🆕 **Report a new scam pattern** you've seen — open an issue using the *New scam pattern* template. **Remove all personal details** (names, phone numbers, account numbers) first.
- 🗣️ **Translate** the UI and rules into Tamil, Hindi or other Indian languages.
- 🐛 **Report a wrong result** (a scam marked safe, or a genuine message flagged).
- 💻 **Improve the code**, accessibility or tests.

## Development

```bash
git clone https://github.com/Vishnur2810/scamshield-india.git
cd scamshield-india
npm test                     # run the test suite
python3 -m http.server 8000  # preview at http://localhost:8000
```

There are no dependencies and no build step.

## Pull request checklist
- [ ] `npm test` passes
- [ ] New rules have at least one scam **and** one genuine test message
- [ ] No personal data in test messages
- [ ] UI changes checked on mobile width (≈375px)

## Code style
Plain ES6, no frameworks, 2-space indentation, descriptive names. Keep the detector a pure function so it runs both in the browser and in Node.
