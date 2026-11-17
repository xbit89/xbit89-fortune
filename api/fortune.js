// xbit89-fortune: a minimal x402 (v2) paid endpoint for vAPI Call.
// Unpaid request  -> HTTP 402 with an exact-scheme challenge on Base (USDC).
// Paid request    -> HTTP 200 with the fortune JSON.
// Payment check here is header-shape level only (decodes the x402 payload and
// matches payTo + amount). On-chain settlement is handled by the buyer's
// facilitator in the full x402 flow; this endpoint's listing job is to serve
// a spec-exact live challenge.

const PAY_TO = "0xbB32eb8F9d494c61550d38D75AD5c3C8A9E2b1DD"; // his vAPI agent wallet (Base)
const ASSET = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // native USDC on Base
const NETWORK = "eip155:8453"; // Base mainnet (CAIP-2)
const AMOUNT = "10000"; // 0.01 USDC (6 decimals)
const MAX_TIMEOUT = 300;

const FORTUNES = [
  "Hari ini rezeki datang dari arah yang tidak kamu sangka.",
  "Sabar sebentar lagi — yang kamu tunggu sedang dalam perjalanan.",
  "Satu langkah kecil hari ini membuka pintu besar minggu ini.",
  "Jangan ragu: keputusan yang kamu tunda itu jawabannya iya.",
  "Ada kabar baik dari orang yang lama tidak menghubungimu.",
  "Fokus pada satu hal dulu; sisanya mengikuti sendiri.",
  "Keberuntungan berpihak pada yang berani mulai lebih pagi.",
  "Uang kecil yang kamu jaga hari ini jadi besar nanti.",
];

function challenge(resourceUrl) {
  return {
    x402Version: 2,
    resource: {
      url: resourceUrl,
      description: "One lucky fortune plus a lucky number (0.01 USDC per call).",
      mimeType: "application/json",
      serviceName: "xbit89-fortune",
      tags: ["fortune", "fun", "demo"],
    },
    accepts: [
      {
        scheme: "exact",
        network: NETWORK,
        asset: ASSET,
        amount: AMOUNT,
        payTo: PAY_TO,
        maxTimeoutSeconds: MAX_TIMEOUT,
        extra: { name: "USD Coin", version: "2", assetTransferMethod: "eip3009" },
      },
    ],
  };
}

function sendJson(res, status, obj, extraHeaders) {
  const body = JSON.stringify(obj);
  res.writeHead(
    status,
    Object.assign({ "Content-Type": "application/json; charset=utf-8" }, extraHeaders || {}),
  );
  res.end(body);
}

function paymentHeaderValue(req) {
  const h = req.headers || {};
  return h["payment-signature"] || h["x-payment"] || null;
}

function looksPaid(req) {
  const raw = paymentHeaderValue(req);
  if (!raw) return false;
  try {
    const decoded = JSON.parse(Buffer.from(String(raw), "base64").toString("utf8"));
    const accepted = decoded.accepted || {};
    const amount = String(accepted.amount ?? accepted.maxAmountRequired ?? "");
    return (
      String(accepted.payTo || "").toLowerCase() === PAY_TO.toLowerCase() &&
      /^\d+$/.test(amount) &&
      BigInt(amount) >= BigInt(AMOUNT)
    );
  } catch {
    return false;
  }
}

module.exports = (req, res) => {
  const host = (req.headers && req.headers.host) || "localhost";
  const resourceUrl = `https://${host}/api/fortune`;
  if (looksPaid(req)) {
    const now = new Date();
    const seed = now.getUTCDate() + now.getUTCMonth() * 31 + now.getUTCFullYear();
    sendJson(res, 200, {
      fortune: FORTUNES[seed % FORTUNES.length],
      luckyNumber: ((seed * 37) % 99) + 1,
      date: now.toISOString().slice(0, 10),
      service: "xbit89-fortune",
    });
    return;
  }
  const body = challenge(resourceUrl);
  const header = Buffer.from(JSON.stringify(body), "utf8").toString("base64");
  sendJson(res, 402, body, { "PAYMENT-REQUIRED": header });
};
