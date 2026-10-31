var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-UpVnNf/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// index.js
var rateLimitMap = /* @__PURE__ */ new Map();
var RATE_LIMIT_WINDOW_MS = 10 * 60 * 1e3;
var RATE_LIMIT_MAX = 3;
function escapeHtml(text) {
  if (!text) return "";
  return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
__name(escapeHtml, "escapeHtml");
function matchOrigin(request, env) {
  const origin = request.headers.get("Origin");
  if (!origin) {
    return env.ALLOWED_ORIGIN || "*";
  }
  const configured = (env.ALLOWED_ORIGIN || "").trim();
  const allowedList = configured.split(",").map((o) => o.trim()).filter(Boolean);
  if (allowedList.includes("*") || allowedList.includes(origin)) {
    return origin;
  }
  return null;
}
__name(matchOrigin, "matchOrigin");
function jsonResponse(data, status = 200, origin = null) {
  const headers = {
    "Content-Type": "application/json"
  };
  if (origin) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Vary"] = "Origin";
  }
  return new Response(JSON.stringify(data), { status, headers });
}
__name(jsonResponse, "jsonResponse");
function isRateLimited(clientIp) {
  const now = Date.now();
  const timestamps = rateLimitMap.get(clientIp) || [];
  const validTimestamps = timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
  if (validTimestamps.length >= RATE_LIMIT_MAX) {
    return true;
  }
  validTimestamps.push(now);
  rateLimitMap.set(clientIp, validTimestamps);
  return false;
}
__name(isRateLimited, "isRateLimited");
var index_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const matchedOrigin = matchOrigin(request, env);
    const originHeader = request.headers.get("Origin");
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
    if (originHeader && !matchedOrigin) {
      return jsonResponse({ ok: false, error: "Origin not allowed" }, 403);
    }
    if (url.pathname !== "/send") {
      return jsonResponse({ ok: false, error: "Not found" }, 404, matchedOrigin);
    }
    if (request.method !== "POST") {
      return jsonResponse({ ok: false, error: "Method not allowed" }, 405, matchedOrigin);
    }
    const clientIp = request.headers.get("cf-connecting-ip") || "unknown";
    if (isRateLimited(clientIp)) {
      return jsonResponse({ ok: false, error: "Rate limit exceeded. Please try again later." }, 429, matchedOrigin);
    }
    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ ok: false, error: "Invalid JSON payload" }, 400, matchedOrigin);
    }
    const website = (body.website || "").trim();
    if (website !== "") {
      return jsonResponse({ ok: true }, 200, matchedOrigin);
    }
    const name = (body.name || "").trim();
    const email = (body.email || "").trim();
    const subject = (body.subject || "").trim();
    const message = (body.message || "").trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (name.length < 2 || name.length > 80 || !emailRegex.test(email) || email.length > 120 || subject.length < 2 || subject.length > 120 || message.length < 10 || message.length > 2e3) {
      return jsonResponse({ ok: false, error: "Validation failed" }, 400, matchedOrigin);
    }
    if (!env.BREVO_API_KEY) {
      console.error("[Worker Error] Missing secret BREVO_API_KEY in worker environment.");
      return jsonResponse({ ok: false, error: "Server configuration error" }, 502, matchedOrigin);
    }
    const senderEmail = env.SENDER_EMAIL || "noreply@tanyasingh.dev";
    const toEmail = env.TO_EMAIL || "tech.tan06@gmail.com";
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
    const textContent = `PORTFOLIO INBOUND INQUIRY
-------------------------
From: ${name} <${email}>
Subject: ${subject}

Message:
${message}

---
Delivered via Tanya Singh Portfolio`;
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
        email,
        name
      },
      subject: `[Portfolio] ${subject}`,
      htmlContent,
      textContent
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
        return jsonResponse({ ok: false, error: "Failed to dispatch email" }, 502, matchedOrigin);
      }
    } catch (err) {
      console.error("[Worker Network Error]:", err);
      return jsonResponse({ ok: false, error: "Network error communicating with mail provider" }, 502, matchedOrigin);
    }
  }
};

// ../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    const body = JSON.stringify(error);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-UpVnNf/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = index_default;

// ../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-UpVnNf/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
