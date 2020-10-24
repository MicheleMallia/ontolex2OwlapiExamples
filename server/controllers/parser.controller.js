const Parser = require("../models/parser.model.js");

exports.postData = (req, res) => {
    
    const parser = new Parser({
        turtleData: req.body.turtleData
    })

    Parser.parseTurtle(parser.turtleData, (err, data) =>{
        if(err){
            res.status(500).send({
                message: err.message || "Qualcosa è andato storto"
            })
        }else{            
            /* res.write(data, function(err){res.end();}); */    
            res.send(data);
        }
    });
};
