module.exports = function(app){ 
    const builder = require("../controllers/builder.controller.js");
    
    app.post("/api/generateOwlApi", builder.generate);
}