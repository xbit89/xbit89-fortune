// OpenAPI description for xbit89-fortune (discovery aid for vAPI Call).
module.exports = (req, res) => {
  const host = (req.headers && req.headers.host) || "localhost";
  const doc = {
    openapi: "3.0.3",
    info: {
      title: "xbit89-fortune",
      version: "1.0.0",
      description:
        "A tiny paid fortune API. Each call returns a fortune and a lucky number. Payment is x402 (exact, Base USDC), 0.01 USDC per call.",
    },
    servers: [{ url: `https://${host}` }],
    paths: {
      "/api/fortune": {
        get: {
          operationId: "getFortune",
          summary: "Get today's fortune and lucky number",
          responses: {
            "200": {
              description: "The fortune for today.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      fortune: { type: "string" },
                      luckyNumber: { type: "integer" },
                      date: { type: "string" },
                      service: { type: "string" },
                    },
                  },
                },
              },
            },
            "402": { description: "x402 payment required (exact, Base USDC, 0.01)." },
          },
        },
      },
    },
  };
  const body = JSON.stringify(doc);
  res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
  res.end(body);
};
