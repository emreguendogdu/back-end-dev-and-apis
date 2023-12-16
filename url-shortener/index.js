require("dotenv").config()
const express = require("express")
const cors = require("cors")
const dns = require("dns")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const app = express()

const Url = require("./models")
const port = process.env.PORT || 3000

mongoose
  .connect(process.env["MONGOOSE_URI"])
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use(cors())

app.use("/public", express.static(`${process.cwd()}/public`))

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html")
})

app.post("/api/shorturl", async (req, res) => {
  const originalUrl = req.body.url
  if (originalUrl.match(/^(http?s:\/\/)(www)?/gm)) {
    const testUrl = new URL(originalUrl)

    dns.lookup(testUrl.hostname, async (err) => {
      if (err) {
        res.json({ error: "invalid url" })
      } else {
        const existingUrl = await Url.findOne({ original_url: originalUrl })

        if (existingUrl) {
          res.json({
            original_url: originalUrl,
            short_url: existingUrl.short_url,
          })
        } else {
          const shortUrl = (await Url.countDocuments()) + 1
          const newUrl = new Url({
            original_url: originalUrl,
            short_url: shortUrl,
          })
          await newUrl.save()
          res.json({ original_url: originalUrl, short_url: shortUrl })
        }
      }
    })
  } else {
    res.json({ error: "invalid url" })
  }
})

app.get("/api/shorturl/:short_url", async (req, res) => {
  const short_url = req.params.short_url
  const url = await Url.findOne({ short_url: short_url })
  if (url) {
    res.redirect(url.original_url)
  } else {
    res.status(404).send("URL not found")
  }
})

app.listen(port, function () {
  console.log(`Listening on port ${port}`)
})
