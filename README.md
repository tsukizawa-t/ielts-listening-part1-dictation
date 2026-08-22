# IELTS Listening Practice - British English TTS Setup for Chrome

This project uses the browser's built-in Text-to-Speech (TTS) engine. For IELTS practice, the voice should sound like British English, but the actual voices available depend on the operating system and the Chrome/Windows voice packages installed.

If British voices are not installed, Chrome will not be able to speak with a UK accent even if the app is set to `en-GB`.

---

## 1. Install British English voices in Windows

### Step 1: Add English (United Kingdom)
1. Open Windows Settings.
2. Go to `Time & language` -> `Language & region`.
3. Click `Add a language`.
4. Choose `English (United Kingdom)`.
5. Click `Next` and install the language pack.

### Step 2: Install speech features
1. In the same language settings, click `English (United Kingdom)`.
2. Open `Language options`.
3. Install `Text-to-speech` if available.

### Step 3: Install UK voices
On Windows, British English voices are often provided by Microsoft voices such as:
- `Microsoft David`
- `Microsoft Hazel`
- `Microsoft George`
- `Microsoft Susan`

These are usually installed by default on some systems, but if they are missing, install or update the Windows voice package from the language settings or Windows Update.

---

## 2. Make Chrome use the British voice

### Step 1: Open Chrome settings
1. Open Chrome.
2. Visit `chrome://settings/languages`.
3. Add `English (United Kingdom)` if it is not already added.
4. Move `English (United Kingdom)` to the top of the list.

### Step 2: Check the browser TTS voices
Open Chrome DevTools Console and run:

```js
speechSynthesis.getVoices().map(v => ({ name: v.name, lang: v.lang }));
```

You should see entries like:
- `Microsoft David - English (United Kingdom)`
- `Microsoft Hazel - English (United Kingdom)`
- `Microsoft George - English (United Kingdom)`

If you do not see any `en-GB` or `English (United Kingdom)` voices, the browser still has no British voice available on this machine.

---

## 3. Verify in the app

1. Open the app in Chrome.
2. Start a question.
3. Click `Listen Again`.
4. Check whether the voice sounds British and natural.

If the app still sounds non-British, it usually means the system voice package is missing rather than the app code itself.

---

## 4. If British voice still does not appear

### Option A: Install more Windows voices
Use Windows language settings and reinstall English (United Kingdom) plus speech features.

### Option B: Use a custom audio source
For IELTS practice, the most reliable method is to use a real British-English voice file instead of browser TTS. In that case, replace the browser speech output with pre-recorded MP3 files or an external TTS service such as Azure Speech with a British voice.

This is the best solution if you want stable, consistent IELTS-style listening practice.

---

## 5. Recommended IELTS setup

For realistic IELTS listening practice:
- Use British English voices only
- Keep speed around `1.2x` to `1.5x`
- Use a natural speaker such as `Microsoft David` or another UK voice
- Avoid American voices, because they can change the `r` sound and rhythm

---

## 6. Quick check

If you want to test whether British voices are available right now, run this in Chrome:

```js
console.log(speechSynthesis.getVoices().filter(v => /en-gb|english.*united kingdom|british/i.test(v.lang + ' ' + v.name)).map(v => v.name));
```

If this returns an empty array, the machine has no British English speech engine configured.

---

## Summary

British pronunciation works only when the operating system and Chrome have a UK English voice installed. The app can request `en-GB`, but it cannot invent a British voice if none exists on the machine.

If you want, the next best step is to switch this project to a fixed audio source (for example Azure Speech or recorded MP3s) so the IELTS audio stays consistent across all machines.
