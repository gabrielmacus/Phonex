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
const fs = require('fs');

module.exports = async function fetch(req, res) {


  res.setHeader('Connection', 'Transfer-Encoding');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Transfer-Encoding', 'chunked');

  let start_time = new Date();
  let startNumber =  req.param('start_number');
  let endNumber = req.param('end_number');
  let street = req.param('street');
  let province = req.param('province')
  let zip_code = req.param('zip_code');

  //number = parseInt(number);
  startNumber = parseInt(startNumber);
  endNumber = parseInt(endNumber);
  province = slugify(province);

  /*
  let endNumber = (Math.ceil(number/100)*100);
  if(endNumber == number){
    endNumber = endNumber + 100;
  }*/

  let phone_numbers = [];
  //let urls = [];
  let func_arr = [];
  //let t = endNumber - number;


  for(let currentNumber = startNumber;currentNumber<=endNumber;currentNumber++)
  {
    //urls.push(`http://www.paginasblancas.com.ar/direccion/s/${slugify(`${street} ${currentNumber}`)}/${slugify(province)}`);
    func_arr.push( (callback)=>{
      let url = `http://www.paginasblancas.com.ar/direccion/s/${slugify(`${street} ${currentNumber}`)}/${slugify(province)}`;

      async.retry({
        times: 10,
        interval: (retryCount) => {
          console.debug("Retry "+ retryCount,url);
          return 0;
        }
      }, (callback)=> {


        axios({
            url:url,
            method:'GET',
            headers: {
              'Accept':'text/html',
              'Origin':'http://www.paginasblancas.com.ar',
              'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36'
            }
        })
        .then((response)=>{
          let dom = new JSDOM(response.data);
          let phone_numbers_dom = dom.window.document.querySelectorAll("[data-id]");

          phone_numbers_dom.forEach(el => {

              let phone_number = {
                  name:el.querySelector(".m-results-business--name").innerHTML.replace(/(<([^>]+)>)/ig,"").trim().replace(/\s+/g,' ').replace(' --',''),
                  phone_number:el.querySelector("[data-single-phone]").innerHTML.replace(/(<([^>]+)>)/ig,"").trim().replace(/\s+/g,' '),
                  address:el.querySelector("[itemprop='streetAddress']").innerHTML.trim().replace(/\s+/g,' '),
                  province:el.querySelector("[itemprop='addressLocality']").innerHTML.trim().replace(/\s+/g,' '),
                  zip_code:el.querySelector("[itemprop='addressLocality']").nextElementSibling.innerHTML.replace(/[^0-9]/g,"")
              };

              if(!zip_code || phone_number.zip_code == zip_code)
              {

                 res.write(JSON.stringify(phone_number) + '\n');
                 res.flushHeaders();
                 phone_numbers.push(phone_number);
                //let jsonStr = JSON.stringify(phone_number) + '\n';
                //jsonStr.toStream().pipe(res);
                //phone_numbers.push(phone_number);
              }
          });
          callback();
        })
        .catch((err)=>{
          callback(err);
        })


      }, function(err, result) {

          if(err) {
            return callback(err);
          }

          return callback();
      });

    });
  }

  async.parallelLimit(func_arr,5,async (err,result)=>{

      if(err){
        res.write(JSON.stringify({error:true}) + '\n');
        res.flushHeaders();
        return res.end();
      }

      if(phone_numbers.length && req.param('spreadsheetId') && req.param('spreadsheetSheet'))
      {
        try {
           await sails.helpers.phonesToSpreadsheet(phone_numbers,req.param('spreadsheetId'),req.param('spreadsheetSheet'))

        } catch (e) {
          console.error(e);
          
          res.write(JSON.stringify({"error":true,"type":"spreadsheet-error"}) + '\n');
          res.flushHeaders();
          return res.end();
          //return res.serverError();
        }
      }


      console.debug(`Time elapsed: ${new Date() - start_time}`);

      res.write(JSON.stringify({"error":false}) + '\n');
      res.flushHeaders();
      return res.end();
  });







};
