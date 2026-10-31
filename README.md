# Tanya Singh — Cinematic Editorial Portfolio

A cinematic, award-level, single-page portfolio website for **Tanya Singh**, Computer Science Engineering Aspirant at Chennai Institute of Technology (CIT). Designed with an editorial poster layout, near-black (#0b0707) and deep oxblood/crimson (#8e1b1b) aesthetics, kinetic typography, and fluid GSAP + Lenis scroll choreography.

---

## ⚡ Tech Stack

- **HTML5 & CSS3**: Semantic markup, custom properties, responsive CSS grid/flexbox, SVG filters and ambient lighting effects.
- **Vanilla ES Modules JavaScript**: Pure modern JavaScript without any bundler or build steps required.
- **Animation & Motion**:
  - [Lenis](https://github.com/darkroomengineering/lenis) (v1.1.14) for inertia-based smooth scrolling.
  - [GSAP](https://gsap.com/) & [ScrollTrigger](https://gsap.com/scrolltrigger/) (v3.12.5) for parallax, masked text reveals, count-up stats, timeline progress, and horizontal gallery pinning.
- **Typography**: Google Fonts (`Bebas Neue`, `Anton`, `Playfair Display`, `DM Sans`, `Inter`, `JetBrains Mono`).
- **Deployment**: 100% static and zero-dependency build, ready for GitHub Pages or any static host.

---

## 📂 Project Structure

```
tan/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Automated GitHub Pages CI/CD workflow
├── assets/
│   └── img/
│       ├── portrait.jpg        # Hero portrait
│       ├── guinness-1.jpg      # Guinness certificate
│       ├── guinness-2.jpg      # Guinness rocket event photo
│       ├── excellence-1.jpg    # Co-curricular awards trophy
│       ├── excellence-2.jpg    # Co-curricular ceremony photo
│       ├── sustainable-1.jpg   # Sustainable Home project model
│       ├── sustainable-2.jpg   # Sustainable Home award photo
│       ├── qr-linkedin.svg     # Cream vector QR tile for LinkedIn
│       └── qr-github.svg       # Cream vector QR tile for GitHub
├── css/
│   └── style.css               # Editorial poster styles, variables, transitions
├── js/
│   └── main.js                 # Lenis smooth scroll, GSAP timelines, tilt, modal
├── .nojekyll                   # Ensures clean static asset serving on GitHub Pages
├── README.md                   # Project documentation & configuration guide
└── index.html                  # Accessible, single-page portfolio document
```

---

## 🚀 Local Development Setup

To run and preview the portfolio locally:

### Option A: Using Python (Recommended)
```bash
# In the project root directory:
python -m http.server 8080
```
Open `http://localhost:8080` in your web browser.

### Option B: Using Node.js / npx
```bash
# Run a zero-install static server:
npx serve .
```

---

## 📝 How to Edit Content

### 1. Process Steps (Editable Framing Device)
In `index.html`, locate the section marked with `<!-- PROCESS STEPS: EDITABLE -->`.
You can update the titles (`Learn`, `Practice`, `Build`, `Break & Fix`, `Improve`) and their one-line descriptions directly inside the `.process-step` blocks.

### 2. Featured Projects & Builds
Project details, tags, and modal lists are stored inside `CONFIG.PROJECTS` in `js/main.js`:
```javascript
export const CONFIG = {
  PROJECTS: {
    c: {
      category: 'C / Systems & Logic',
      title: 'C: Game Logic Builds',
      description: '...',
      builds: [...]
    },
    // ...
  }
};
```

### 3. Contact Form Endpoint Configuration
The contact form is configured to connect to **Formspree** or **Web3Forms**:

1. Create a free form at [formspree.io](https://formspree.io) or [web3forms.com](https://web3forms.com).
2. Copy your form endpoint URL (e.g., `https://formspree.io/f/xbjvkqzp`).
3. Open `js/main.js` and update `CONFIG.FORM_ENDPOINT`:
   ```javascript
   export const CONFIG = {
     FORM_ENDPOINT: 'https://formspree.io/f/YOUR_FORM_ID',
     // ...
   };
   ```
4. Submissions automatically display the confirmation banner:
   > *"Message received. Thank you for reaching out. Tanya will reply as soon as possible."*

---

## 🌐 Deploying to GitHub Pages

All asset paths are relative (`./assets/...`), allowing the site to run under custom domains as well as user sub-paths (`https://<username>.github.io/<repo>/`).

### Option 1: Automated GitHub Actions (Included)
The repository includes `.github/workflows/deploy.yml`.
1. Push your repository to GitHub.
2. Go to **Settings** → **Pages**.
3. Under **Build and deployment** → **Source**, select **GitHub Actions**.
4. Every push to `main` will automatically build and publish the live site.

### Option 2: Deploy from Branch
1. Go to your repository on GitHub.
2. Navigate to **Settings** → **Pages**.
3. Under **Source**, select **Deploy from a branch**.
4. Choose Branch: `main`, Folder: `/ (root)`.
5. Click **Save**. Your site will be live in 1–2 minutes!

---

## 📜 Git Commands to Push to a New Repository

```bash
# Initialize git repository
git init -b main

# Stage all files
git add .

# Create initial commit
git commit -m "feat: cinematic editorial portfolio for Tanya Singh"

# Link to your remote GitHub repository (replace with your repo URL)
git remote add origin https://github.com/<your-username>/<repo-name>.git

# Push to GitHub
git push -u origin main
```
