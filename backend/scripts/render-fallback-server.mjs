import http from "node:http";

const port = Number(process.env.PORT || 3000);

const server = http.createServer((req, res) => {
  if (req.url === "/api/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", mode: "fallback" }));
    return;
  }

  res.writeHead(503, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      status: "unavailable",
      message:
        "Backend source/build output is missing. Push backend src files to run full API.",
    })
  );
});

server.listen(port, "0.0.0.0", () => {
  console.log(
    `[fallback] Running on port ${port}. Health available at /api/health.`
  );
});
