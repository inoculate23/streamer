const express = require("express");
const app = express();
const fs = require("fs");

const m3u8stream = require("m3u8stream");

m3u8stream("https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8").pipe(
  fs.createWriteStream("videofile.mp4")
);
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.get("/test.mp4", function (req, res) {
  const range = req.headers.range;
  if (!range) {
    res.status(400).send("Requires Range header");
  }
  const videoPath = "/test.mp4";
  const videoSize = fs.statSync("/test.mp4").size;
  const CHUNK_SIZE = 10 ** 6;
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4"
  };
  res.writeHead(206, headers);
  const videoStream = fs.createReadStream(videoPath, { start, end });
  videoStream.pipe(res);
});

app.listen(8000, function () {
  console.log("Listening on port 8000!");
});
