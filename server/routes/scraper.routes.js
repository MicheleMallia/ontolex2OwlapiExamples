module.exports = function(app){ 
    const scraper = require("../controllers/scraper.controller.js");

    app.get("/api/getOntolexDOM", scraper.getData);
}