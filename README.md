# C. R. Pranav Sankar — Portfolio

A static website: plain HTML, CSS and JavaScript. No build step, no installs.

## Run it on localhost

Pick whichever is easiest:

**1. One click**
- Windows: double-click `start.bat`
- macOS: double-click `start.command` (first time: right-click → Open)
- Linux: run `./start.sh`

It starts a local server and opens http://localhost:8000 in your browser. Close the terminal window to stop it.

**2. Python (any OS)**
```
cd pranav-portfolio
python -m http.server 8000        # Windows may need: py -m http.server 8000
```
Then open http://localhost:8000

**3. Node**
```
cd pranav-portfolio
npx serve .
```

**4. VS Code**
Open the folder, install the "Live Server" extension, right-click `index.html` → *Open with Live Server*.

> Use `http://localhost`, not a double-clicked `file://` page, so the videos and fonts load reliably.

## What's where

```
index.html            all five sections (About, Work, Gigs, Reels, Contact)
css/styles.css        the whole look
js/nav.js             pinned menu, smooth scroll, active-section highlight
js/hero.js            landing photo + liquid reveal of the second angle
js/projects.js        project list (edit the SETS array to add films / links / stills)
js/gigs.js            the two spider webs
js/reels.js           3D reel cylinder (edit the REELS array to add reels)
js/contact.js         "Camera rolling" — Roll button, flash and polaroid
js/audio.js           synthesised sound effects
assets/img, assets/video
```

### Common edits
- **Add a still or link to a project:** in `js/projects.js`, set `image: 'assets/img/your-file.jpg'` and `link: 'https://…'` on that item.
- **Add a reel:** drop the `.mp4` in `assets/video/`, a cover `.jpg` in `assets/img/`, and add an entry to `REELS` in `js/reels.js`. The arrows and dots adapt automatically.
- **Change phone / email:** search `index.html` for `tel:` and `mailto:`.

## Notes
- Fonts load from Google Fonts, so the first load needs internet.
- Sound only plays after the visitor clicks or taps something (browser rule).
- To put it online, upload this folder as-is to Netlify, Vercel, GitHub Pages or any web host.
