const settings = require("./config.json");
const app = require("./app");

//Starts server
app.listen(settings.port, () =>
  console.log(`Listening on port ${settings.port}`)
);
