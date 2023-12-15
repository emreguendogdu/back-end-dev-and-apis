// index.js
// where your node app starts

// init project
var express = require("express");
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC
var cors = require("cors");
app.use(cors({ optionsSuccessStatus: 200 })); // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

// your first API endpoint...
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.get("/api/:time?", (req, res) => {
  let time = req.params.time;
  let unix = 0;
  let utc = "";

  if (time === undefined) {
    unix = new Date().getTime();
    utc = new Date(unix).toUTCString();
  } else if (isNaN(time)) {
    unix = new Date(time).getTime();
    utc = new Date(time).toUTCString();
    if (utc === "Invalid Date") {
      isValid = false;
      res.json({ error: utc });
      return;
    }
  } else {
    unix = parseInt(time);
    utc = new Date(unix).toUTCString();
  }
  res.json({ unix: unix, utc: utc });
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log("Your app is listening on port " + listener.address().port);
});

