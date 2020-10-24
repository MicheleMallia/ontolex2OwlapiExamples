const express = require("express");
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

var corsOptions = {
    origin: "http://localhost:4200"
};



app.use(cors(corsOptions));

//parse request of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended : true}));

app.get("/", (req, res) => {
    res.json({message: "Welcome to Michele Mallia application"})
});

require("./routes/scraper.routes")(app);
require("./routes/parser.routes")(app);
require("./routes/builder.routes")(app);

const PORT = process.env.PORT || 9090;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});