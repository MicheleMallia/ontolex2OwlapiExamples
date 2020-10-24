module.exports = function(app){ 
    const parser = require("../controllers/parser.controller.js");
    
    app.post("/api/parseTurtle", parser.postData);
}