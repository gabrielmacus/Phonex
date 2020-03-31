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
const async = require('async');
const slugify = require('slugify')
const axios  = require('axios');
module.exports = async function fetch(req, res) {

    let response = await axios({
        url:'http://www.paginasblancas.com.ar/direccion/s/urquiza-1703/entre-rios'
    });
    console.log(response);
    return res.ok();
    let start_time = new Date();
  let number =  req.param('number');
  let street = req.param('street');
  let province = req.param('province')
  let endNumber = (Math.ceil(number/100)*100);
  let zip_code = req.param('zip_code');

  number = parseInt(number);
  province = slugify(province);

  if(endNumber == number){
    endNumber = endNumber + 100;
  }


  let t = endNumber - number;
  let phone_numbers = [];
  let body_map = {};


  async.times(t, function(n, next) {

    let currentNumber = number + n;
    let url = `http://www.paginasblancas.com.ar/direccion/s/${slugify(`${street} ${currentNumber}`)}/${slugify(province)}`;

    curl.get(url,(err, response, body)=>{

      if(err){
          return next(err);

      }
        body_map[currentNumber] = body;
    next();

  })


  }, function(err) {
    if(err){
      console.error(err);
      return res.serverError();
    }

    for(let currentNumber in body_map)
    {
        const body=  body_map[currentNumber];
        const dom = new JSDOM(body);
        let phone_numbers_dom = dom.window.document.querySelectorAll("[data-id]");

        phone_numbers_dom.forEach(el => {

            console.log(currentNumber);
            //if (url == "http://www.paginasblancas.com.ar/direccion/s/gran-chaco-90/Entre-Rios")
            //    console.log(el.querySelector(".m-results-business--name").innerHTML.replace(/(<([^>]+)>)/ig,"").trim().replace(/\s+/g,' '));

            let phone_number = {
                name:el.querySelector(".m-results-business--name").innerHTML.replace(/(<([^>]+)>)/ig,"").trim().replace(/\s+/g,' '),
                phone_number:el.querySelector("[data-single-phone]").innerHTML.replace(/(<([^>]+)>)/ig,"").trim().replace(/\s+/g,' '),
                address:el.querySelector("[itemprop='streetAddress']").innerHTML.trim().replace(/\s+/g,' '),
                province:el.querySelector("[itemprop='addressLocality']").innerHTML.trim().replace(/\s+/g,' '),
                zip_code:el.querySelector("[itemprop='addressLocality']").nextElementSibling.innerHTML.replace(/[^0-9]/g,"")
            };
            if(!zip_code || phone_number.zip_code == zip_code)
                phone_numbers.push(phone_number);

        });
    }


    console.debug(`Time elapsed: ${new Date() - start_time}`);

    return res.json(phone_numbers);
  });







};
