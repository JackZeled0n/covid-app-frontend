const express = require("express");
const path = require("path");

const app = express();
const nameApp = "covid-app-frontend";

app.use(express.static(__dirname + `/dist/${nameApp}`));
app.get("/*", function (req, res) {
  res.sendFile(path.join(__dirname + `/dist/${nameApp}/index.html`));
});

app.listen(process.env.PORT || 8000);
