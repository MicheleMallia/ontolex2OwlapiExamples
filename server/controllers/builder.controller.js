const Builder = require("../models/builder.model.js");

exports.generate = (req, res) => {
    
    const builder = new Builder({
        n3Data: req.body.n3Data 
    })

    Builder.generateOwl(builder.n3Data, (err, data) =>{
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
