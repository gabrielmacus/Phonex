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

module.exports = async function fetch(req, res) {

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

  async.times(t, function(n, next) {

    let currentNumber = number + n
    let url = `http://www.paginasblancas.com.ar/direccion/s/${slugify(`${street} ${currentNumber}`)}/${slugify(province)}`;
    console.log(url)
    curl.get(url,(err, response, body)=>{

      if(err){
          return next(err);

      }

    const dom = new JSDOM(body);
    let phone_numbers_dom = dom.window.document.querySelectorAll("[data-id]");
    phone_numbers_dom.forEach(el => {
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







};
