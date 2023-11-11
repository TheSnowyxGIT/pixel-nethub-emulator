import express from "express";
import path from "path";
import fs from "fs";
import * as open from "opn";

const port = process.env.PORT || 3000;
const domain = process.env.DOMAIN || "localhost";
const wsUrl = process.env.WS_URL || "ws://localhost:3001";

const app = express();

app.get("/", (req, res) => {
  const indexFile = path.resolve(__dirname, "..", "build", "index.html");
  fs.readFile(indexFile, "utf8", (err, data) => {
    if (err) {
      console.error("Something went wrong:", err);
      return res.status(500).send("Oops, better luck next time!");
    }

    return res.send(
      data.replace(
        '<script id="ws"></script>',
        `<script id="ws">const wsUrl = '${wsUrl}'</script>`
      )
    );
  });
});

app.get("/index.html", (req, res) => {
  res.redirect("/");
});

app.use(express.static(path.resolve(__dirname, "..", "build")));

app.get("*", (req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(port, async () => {
  console.log(
    `Server is listening on port ${port} at http://${domain}:${port}`
  );
  console.log(`Emulator should communicate through ${wsUrl}`);
  await open(`http://${domain}:${port}`);
});
