# Tanya Singh — Cinematic Editorial Portfolio

A cinematic, award-level, single-page portfolio website for **Tanya Singh**, Computer Science Engineering Aspirant at Chennai Institute of Technology (CIT). Designed with an editorial poster layout, near-black (`#0b0707`) canvas with deep oxblood/crimson (`#8e1b1b` to `#c0392b`) accents, warm cream (`#efe3c9`) typography, kinetic GSAP + Lenis scroll choreography, and a real serverless contact form backend powered by Cloudflare Workers and Brevo.

---

## ⚡ Tech Stack

- **Front-End**: Semantic HTML5, modern CSS3 (custom variables, glassmorphic panels, noise grain, ambient glow effects), and vanilla ES modules JavaScript.
- **Motion & Interactions**:
  - [Lenis](https://github.com/darkroomengineering/lenis) (v1.1.14) for smooth inertia scroll.
  - [GSAP](https://gsap.com/) & [ScrollTrigger](https://gsap.com/scrolltrigger/) (v3.12.5) for text splitting, parallax, horizontal achievement gallery pinning, count-up stats, and 3D card tilt.
- **Serverless Backend**: [Cloudflare Workers](https://workers.cloudflare.com/) (`worker/index.js`) with input validation, honeypot anti-spam, strict CORS origin protection, IP rate limiting, and [Brevo SMTP API](https://www.brevo.com/) integration.
- **CI/CD Workflows**: Official GitHub Actions for Pages (`deploy-pages.yml`) and Cloudflare Workers (`deploy-worker.yml`).

---

## 📂 Project Structure

```
tan/
├── .github/
│   └── workflows/
│       ├── deploy-pages.yml    # Deploys static site to GitHub Pages
│       └── deploy-worker.yml   # Deploys Cloudflare Worker & syncs Brevo secret
├── assets/
│   └── img/
│       ├── portrait.png        # Transparent studio portrait (crimson rim-light)
│       ├── portrait.jpg        # High-res raw studio portrait
│       ├── guinness-1.jpg      # Guinness certificate
│       ├── guinness-2.jpg      # Guinness rocket event photo
│       ├── excellence-1.jpg    # Co-curricular awards trophy
│       ├── excellence-2.jpg    # Co-curricular ceremony photo
│       ├── sustainable-1.jpg   # Sustainable Home project model
│       ├── sustainable-2.jpg   # Sustainable Home award photo
│       ├── qr-linkedin.svg     # Vector cream tile QR code for LinkedIn
│       └── qr-github.svg       # Vector cream tile QR code for GitHub
├── css/
│   └── style.css               # Design system, glassmorphism, responsive styles
├── js/
│   └── main.js                 # Lenis, GSAP timelines, form validation, modals
├── worker/
│   ├── index.js                # Cloudflare Worker sending emails via Brevo
│   └── wrangler.toml           # Worker configuration & environment vars
├── .nojekyll                   # Bypasses Jekyll on GitHub Pages
├── README.md                   # Setup guide & email backend deployment
└── index.html                  # Accessible, semantic single-page document
```

---

## 📬 Real Email Delivery Setup (Brevo + Cloudflare Workers)

The contact form is configured to send real transactional emails directly to `tech.tan06@gmail.com` using a secure Cloudflare Worker and Brevo. **No API keys or secrets are ever exposed in the front end.**

Follow these steps to activate email delivery:

### Step 1: Set up Brevo (Transactional Email)
1. Sign up for a free account at [brevo.com](https://www.brevo.com/).
2. Go to **Senders, Domains & Dedicated IPs** &rarr; **Senders** and verify your sender email (e.g. `your-name@yourdomain.com` or your personal email).
3. Navigate to **SMTP & API** &rarr; **API Keys** and generate a new API key (e.g., `portfolio-contact-key`). Copy this key securely.

### Step 2: Set up Cloudflare
1. Sign up for a free account at [cloudflare.com](https://www.cloudflare.com/).
2. Go to **My Profile** &rarr; **API Tokens** &rarr; **Create Token**.
3. Select the **Edit Cloudflare Workers** template, or grant:
   - *Account* &rarr; *Workers Scripts* &rarr; *Edit*
   - *Account* &rarr; *Workers KV Storage* &rarr; *Edit*
4. Copy the API Token and note your **Account ID** (found on the right sidebar of the Workers & Pages dashboard).

### Step 3: Configure GitHub Repository Secrets
In your GitHub repository:
1. Navigate to **Settings** &rarr; **Secrets and variables** &rarr; **Actions**.
2. Click **New repository secret** and add the following 3 secrets:
   - `BREVO_API_KEY`: The Brevo API key created in Step 1.
   - `CLOUDFLARE_API_TOKEN`: The Cloudflare API token created in Step 2.
   - `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID.

### Step 4: Configure `worker/wrangler.toml` and Push
Open `worker/wrangler.toml` and configure your verified sender and allowed domain:
```toml
name = "portfolio-contact"
main = "index.js"
compatibility_date = "2024-04-01"

[vars]
ALLOWED_ORIGIN = "https://codertan06.github.io"
TO_EMAIL = "tech.tan06@gmail.com"
SENDER_EMAIL = "your-verified-sender@example.com"
```
Commit and push to `main`:
```bash
git add worker/wrangler.toml
git commit -m "chore: configure worker sender email and allowed origin"
git push origin main
```
The `.github/workflows/deploy-worker.yml` action will automatically deploy your Worker to Cloudflare and provision the `BREVO_API_KEY` secret.

### Step 5: Update `FORM_ENDPOINT` in `js/main.js`
1. After the deployment workflow finishes, check your Cloudflare dashboard for the Worker URL (typically `https://portfolio-contact.<subdomain>.workers.dev/send`).
2. Open `js/main.js` and update the first line:
   ```javascript
   const FORM_ENDPOINT = "https://portfolio-contact.<your-subdomain>.workers.dev/send";
   ```
3. Commit and push again:
   ```bash
   git add js/main.js
   git commit -m "feat: connect live Cloudflare Worker endpoint"
   git push origin main
   ```

### Step 6: Test and Confirm
1. Open your live site, scroll to the contact form, and send a test message.
2. The form will show the confirmation banner upon successful delivery:
   > *"Message received. Thank you for reaching out. Tanya will reply as soon as possible."*
3. Check `tech.tan06@gmail.com` (and your spam folder) to confirm receipt of the formatted email.

---

## 🛡️ Form Security & Validation Features

- **Anti-Spam Honeypot**: Hidden `website` input field. Any submission with this field filled is silently discarded with an HTTP 200 to confuse automated bots.
- **Client & Server Input Constraints**:
  - Name: 2–80 characters
  - Email: Valid RFC 5322 regex format (max 120 chars)
  - Subject: 2–120 characters
  - Message: 10–2000 characters
- **HTML Sanitization**: All incoming fields are escaped on the server side prior to embedding in the HTML email template to eliminate injection attacks.
- **Rate Limiting**: Protects against spam by limiting each client IP address to a maximum of 3 submissions per 10-minute window (HTTP 429).
- **Client Cooldown**: Enforces a 30-second client-side submission cooldown after a successful send.
- **CORS Protection**: Enforces origin verification matching `env.ALLOWED_ORIGIN`, returning HTTP 403 to unauthorized domains.
- **No False Positives**: If the endpoint fails or is unconfigured, the form displays:
  > *"Couldn't send your message. Please email tech.tan06@gmail.com directly."*
  and preserves the user's typed message in the fields.

---

## 💻 Local Development & Testing

```bash
# Serve the static website locally:
python -m http.server 8080

# In a separate terminal, test the Cloudflare Worker locally:
cd worker
npx wrangler dev
```
Open `http://localhost:8080` in your web browser.
