// Service info for xbit89-fortune.
module.exports = (req, res) => {
  const host = (req.headers && req.headers.host) || "localhost";
  const body = JSON.stringify({
    service: "xbit89-fortune",
    description: "A tiny paid fortune API (x402, Base USDC, 0.01 USDC per call).",
    endpoints: {
      fortune: `https://${host}/api/fortune`,
      openapi: `https://${host}/api/openapi`,
    },
  });
  res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
  res.end(body);
};
