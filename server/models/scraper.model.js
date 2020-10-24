const rp = require('request-promise');
const $ = require('cheerio');
const std_prefixes = require("../assets/std_prefixes.js");

const Scraper = function(scraper){
    this.url = scraper.url;
}

Scraper.getDOM = (urlToScrape, result) => {
    rp(urlToScrape).then(function(html){                
            const outputJson =  {};        
            const key = "item";
            outputJson[key] = [];    
            $('.beispiel > div > pre', html).each(function(i, elem){   
                const adaptedTurtle = prepareForN3($(this).contents().text());
                const data = {
                    example: i+1,
                    text: adaptedTurtle
                };
                outputJson[key].push(data);
            });            
            result(null, outputJson);            
            return;
        }).catch(function(err){
            console.log("error: ", err);
            result(null, err);
            return;
    });

    function prepareForN3(item){
        
        const re = /(\w)+:(\w)+\S/g;
        const prefixes = item.match(re);

        const tmp = [];
        const tmpN3 = [];
        var adapted_turtle = '';

        for(let i = 0; i < prefixes.length; i++){
            
            const prefixRegex = /(\w)+/g;
            const prefix = prefixes[i].match(prefixRegex)[0];
            
            if(tmp.indexOf(prefix) == -1) {
                tmp.push(prefix);
            }
        }

        adapted_turtle += `PREFIX : <http://owlapi.tutorial.michele#>\n`;
        for(let i = 0; i < tmp.length; i++){            
            if(tmp[i] in std_prefixes){
                let pref = tmp[i];
                let std_pref = std_prefixes[tmp[i]];
                adapted_turtle += `PREFIX ${pref}: ${std_pref}\n`;
            }else {
                let pref_no_std = tmp[i];
                adapted_turtle += `PREFIX ${pref_no_std}: <http://nonstandardprefixes.org/${pref_no_std}#>\n`;
            }
        }

        const new_item = adapted_turtle + item;
        return new_item;
    }
};



module.exports = Scraper;