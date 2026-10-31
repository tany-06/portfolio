/**
 * Cloudflare Worker: portfolio-contact
 * Secure serverless contact form backend powered by Brevo API
 */

// In-memory rate limiting map: ip -> array of timestamps
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX = 3; // Max 3 requests per IP per 10 minutes

// Helper to escape HTML entities to prevent HTML injection in emails
function escapeHtml(text) {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// CORS Origin Validator
function matchOrigin(request, env) {
  const origin = request.headers.get("Origin");
  if (!origin) {
    // Non-browser / curl requests without Origin header
    return env.ALLOWED_ORIGIN || "*";
  }

  const configured = (env.ALLOWED_ORIGIN || "").trim();
  const allowedList = configured.split(",").map(o => o.trim()).filter(Boolean);

  // If wildcard or matches configured origin
  if (allowedList.includes("*") || allowedList.includes(origin)) {
    return origin;
  }

  // Reject all other origins
  return null;
}

// Helper to construct JSON response with CORS headers
function jsonResponse(data, status = 200, origin = null) {
  const headers = {
    "Content-Type": "application/json",
  };
  if (origin) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Vary"] = "Origin";
  }
  return new Response(JSON.stringify(data), { status, headers });
}

// Check rate limit for client IP
function isRateLimited(clientIp) {
  const now = Date.now();
  const timestamps = rateLimitMap.get(clientIp) || [];
  const validTimestamps = timestamps.filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= RATE_LIMIT_MAX) {
    return true;
  }

  validTimestamps.push(now);
  rateLimitMap.set(clientIp, validTimestamps);
  return false;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Origin verification for CORS
    const matchedOrigin = matchOrigin(request, env);
    const originHeader = request.headers.get("Origin");

    // Handle OPTIONS Preflight
    if (request.method === "OPTIONS") {
      if (originHeader && !matchedOrigin) {
        return new Response("Forbidden origin", { status: 403 });
      }
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": matchedOrigin || "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Accept",
          "Access-Control-Max-Age": "86400",
          "Vary": "Origin"
        }
      });
    }

    // Origin check for actual requests from browsers
    if (originHeader && !matchedOrigin) {
      return jsonResponse({ ok: false, error: "Origin not allowed" }, 403);
    }

    // Enforce endpoint path and method: POST /send only
    if (url.pathname !== "/send") {
      return jsonResponse({ ok: false, error: "Not found" }, 404, matchedOrigin);
    }

    if (request.method !== "POST") {
      return jsonResponse({ ok: false, error: "Method not allowed" }, 405, matchedOrigin);
    }

    // Client IP for rate limiting
    const clientIp = request.headers.get("cf-connecting-ip") || "unknown";
    if (isRateLimited(clientIp)) {
      return jsonResponse({ ok: false, error: "Rate limit exceeded. Please try again later." }, 429, matchedOrigin);
    }

    // Parse and validate JSON payload
    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ ok: false, error: "Invalid JSON payload" }, 400, matchedOrigin);
    }

    // Honeypot detection: non-empty "website" field returns silent success
    const website = (body.website || "").trim();
    if (website !== "") {
      return jsonResponse({ ok: true }, 200, matchedOrigin);
    }

    // Trim and sanitize input fields
    const name = (body.name || "").trim();
    const email = (body.email || "").trim();
    const subject = (body.subject || "").trim();
    const message = (body.message || "").trim();

    // Field-level validation limits
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (
      name.length < 2 || name.length > 80 ||
      !emailRegex.test(email) || email.length > 120 ||
      subject.length < 2 || subject.length > 120 ||
      message.length < 10 || message.length > 2000
    ) {
      return jsonResponse({ ok: false, error: "Validation failed" }, 400, matchedOrigin);
    }

    // Verify secret configuration
    if (!env.BREVO_API_KEY) {
      console.error("[Worker Error] Missing secret BREVO_API_KEY in worker environment.");
      return jsonResponse({ ok: false, error: "Server configuration error" }, 502, matchedOrigin);
    }

    const senderEmail = env.SENDER_EMAIL || "noreply@tanyasingh.dev";
    const toEmail = env.TO_EMAIL || "tech.tan06@gmail.com";

    // Format clean, styled HTML and plain-text emails
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message);

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0707; color: #efe3c9; margin: 0; padding: 24px; }
    .card { max-width: 620px; margin: 0 auto; background: #120b0b; border: 1px solid #8e1b1b; border-radius: 8px; padding: 28px; box-shadow: 0 10px 30px rgba(0,0,0,0.7); }
    .header { border-bottom: 2px solid #c0392b; padding-bottom: 16px; margin-bottom: 20px; }
    .title { color: #efe3c9; font-size: 22px; font-weight: 700; margin: 0 0 6px 0; letter-spacing: 0.05em; text-transform: uppercase; }
    .badge { color: #c0392b; font-size: 12px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; }
    .meta-row { margin: 12px 0; font-size: 14px; color: #b3a89b; }
    .meta-label { color: #c0392b; font-weight: 600; min-width: 80px; display: inline-block; text-transform: uppercase; font-size: 11px; letter-spacing: 0.1em; }
    .meta-val { color: #efe3c9; font-weight: 500; }
    .message-box { margin-top: 24px; padding: 18px; background: #1a0f0f; border-left: 3px solid #c0392b; border-radius: 4px; }
    .message-label { color: #c0392b; font-size: 12px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 8px; display: block; }
    .message-text { color: #faf4e8; font-size: 15px; line-height: 1.65; white-space: pre-wrap; margin: 0; }
    .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid rgba(192, 57, 43, 0.2); font-size: 12px; color: #7a7066; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="badge">Portfolio Inbound Inquiry</div>
      <h1 class="title">New Message from ${safeName}</h1>
    </div>
    <div class="meta-row"><span class="meta-label">From:</span> <span class="meta-val">${safeName} &lt;${safeEmail}&gt;</span></div>
    <div class="meta-row"><span class="meta-label">Subject:</span> <span class="meta-val">${safeSubject}</span></div>
    <div class="message-box">
      <span class="message-label">Message</span>
      <p class="message-text">${safeMessage}</p>
    </div>
    <div class="footer">
      Sent via Tanya Singh Creative Portfolio &bull; Delivered via Brevo API
    </div>
  </div>
</body>
</html>
    `.trim();

    const textContent = `PORTFOLIO INBOUND INQUIRY\n-------------------------\nFrom: ${name} <${email}>\nSubject: ${subject}\n\nMessage:\n${message}\n\n---\nDelivered via Tanya Singh Portfolio`;

    const brevoPayload = {
      sender: {
        name: "Portfolio Contact",
        email: senderEmail
      },
      to: [
        {
          email: toEmail,
          name: "Tanya Singh"
        }
      ],
      replyTo: {
        email: email,
        name: name
      },
      subject: `[Portfolio] ${subject}`,
      htmlContent: htmlContent,
      textContent: textContent
    };

    try {
      const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": env.BREVO_API_KEY,
          "Content-Type": "application/json",
          "accept": "application/json"
        },
        body: JSON.stringify(brevoPayload)
      });

      if (brevoResponse.ok) {
        return jsonResponse({ ok: true }, 200, matchedOrigin);
      } else {
        const errorText = await brevoResponse.text().catch(() => "");
        console.error(`[Brevo API Error ${brevoResponse.status}]:`, errorText);
        // Never leak raw Brevo errors or API key to the client
        return jsonResponse({ ok: false, error: "Failed to dispatch email" }, 502, matchedOrigin);
      }
    } catch (err) {
      console.error("[Worker Network Error]:", err);
      return jsonResponse({ ok: false, error: "Network error communicating with mail provider" }, 502, matchedOrigin);
    }
  }
};
