// Allow ES6 modules inside the application
// const XXX = require("Module_XXX") => import XXX from "Module_XXX"
// module.exports = XXX => export { XXX }
require = require("esm")(module);
module.exports = require("./server.js");