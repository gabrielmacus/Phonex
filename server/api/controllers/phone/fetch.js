/**
 * Module dependencies
 */

// ...


/**
 * phone/fetch.js
 *
 * Fetch phone.
 */

const puppeteer = require('puppeteer');
const curl = require('curl');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;


function friendlyClean(word){
	return quitarAcentos(word)
	.replace(/^\s+|\s+$/g, "")//quito los espacios
	.replace(/[_|\s]+/g, "-") // cambios los espacios y los guiones bajos por guiones
	.replace(/[^a-z0-9-]+/g, "") // remuevo todos los caracteres que no son alfanumericos menos el guion
	.replace(/[-]+/g, "-") // reemplazo varias instancias de un guion con una sola
	.replace(/^-+|-+$/g, ""); // quito espacios entre los guiones
}

function quitarAcentos(word){
	var originales = [/[Ã¡Ã Ã¤Ã¢]/g,/[Ã©Ã¨Ã«Ãª]/g,/[Ã­Ã¬Ã¯Ã®]/g,/[Ã³Ã²Ã¶Ã´]/g,/[ÃºÃ¹Ã¼Ã»]/g,/[Ã±]/g];
	var reemplazos = ["a","e","i","o","u","n"];
	var w=word.toLowerCase(); //hacemos todo en minuscula;
	for (var i = 0; i < originales.length; i++) {
		w = w.replace(originales[i],reemplazos[i]);
	}
	return w;
}

module.exports = async function fetch(req, res) {

  let number =  req.param('number');
  let street = req.param('street');
  let locality = 'entre-rios';//friendlyClean("Entre Rios");
  let endNumber = (Math.ceil(number/100)*100)-1;

  let t = endNumber - number;
  let phone_numbers = [];

  async.times(10), function(n, next) {

    let currentNumber = number + (n-1)
    let url = `http://www.paginasblancas.com.ar/direccion/s/${friendlyClean(`${street}`)}-${currentNumber}/${locality}`;
    curl.get(url,(err, response, body)=>{

      if(err){
        return next(err);

      }

      const dom = new JSDOM(body);
      let phone_numbers_dom = dom.window.document.querySelectorAll("[data-id]");
      phone_numbers_dom.forEach(el => {
        phone_numbers.push({
          name:el.querySelector(".m-results-business--name").innerHTML.replace(/(<([^>]+)>)/ig,"").trim().replace(/\s+/g,' '),
          phone_number:el.querySelector("[data-single-phone]").innerHTML.replace(/(<([^>]+)>)/ig,"").trim().replace(/\s+/g,' '),
          address:el.querySelector("[itemprop='streetAddress']").innerHTML.trim().replace(/\s+/g,' '),
          locality:el.querySelector("[itemprop='addressLocality']").innerHTML.trim().replace(/\s+/g,' '),
          zip_code:el.querySelector("[itemprop='addressLocality']").nextElementSibling.innerHTML.replace(/[^0-9]/g,"")
        })
      });

      next();

    })


  }, function(err) {
    if(err){
      console.error(err);
      return res.serverError();
    }
      // we should now have 5 users
      return res.json(phone_numbers);
  });


  console.log(url);






};
