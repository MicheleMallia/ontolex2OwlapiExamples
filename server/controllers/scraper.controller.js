const Scraper = require("../models/scraper.model.js");
const url = 'https://www.w3.org/2016/05/ontolex/';

exports.getData = (req, res) => {
    
    const scraper = new Scraper({
        url: url
    })

    Scraper.getDOM(scraper, (err, data) =>{
        if(err){
            res.status(500).send({
                message: err.message || "Qualcosa è andato storto"
            })
        }else{
            res.send(data);
        }
    });
};
