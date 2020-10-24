const N3 = require('n3')
const turtleParser = new N3.Parser({ format: 'Turtle' })
const ntriplesParser = new N3.Parser({ format: 'N-Triples' })

const Parser = function(parser){
    this.turtleData = parser.turtleData;
}


Parser.parseTurtle = (turtleData, result) => {

  var finalJSON = [];
  turtleParser.parse(turtleData, (err, quad, prefixes) => {
      if (err) {
        console.log("Not well formed Turtle");          
        throw err;          
      }
      if (quad) {                 
        /* console.log({ quad }); */
        /* result(null, JSON.stringify(quad)); */
        finalJSON.push(quad);
        return;          
      }
      else {                           
        /* console.log({ prefixes }); */
        /* result(null, JSON.stringify(prefixes)); */
        finalJSON.push(prefixes);
        finalPost(finalJSON);
        return;          
      }
  });

  function finalPost(items){
    /* console.log(items); */
    result(null, items);
  }
};



module.exports = Parser;