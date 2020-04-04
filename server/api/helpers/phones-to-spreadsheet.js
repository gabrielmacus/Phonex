const {google} = require('googleapis');
const gapi_json ={
  "type": "service_account",
  "project_id": "phonex-273118",
  "private_key_id": "f43e5a773b86ee2d86d256201cd5a6718eb4a327",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDSiMi3/6fmRIVk\n3gxul1NNuhvdXdoQWBW752N0l1R2j/QjH9PPx0olQ71y43QY3a4/tEK0vyXksjks\nqCahl05Ve/r/erGppkFNK5tcrdoDKizXMxl0otJj9Vs9YTZj1aIdcG07etgKXZ/P\n4C1VMZYiBTZooLRTVjYGzpFNl5bTmgXK3ijggSQyrkjTPEnXX/6CqylsbDXP4R3V\nZZPL5e+bOUkkyudMvDHsuNF/CwJEXP9AzSAqNzlQbhj12FYCqwVAXci9jgH59i1d\nczg/PvKDaJXpZ2hl1c+/G1InlIVqXIDzh+zMh/vGLDrRSF8/jPD2r966xY7hg9z3\n9GKpOvPPAgMBAAECggEAIeFOP8H+EIHVX6KWKJPknX0GL+0DAx9RvA/kAua5emz3\nElH0YZsGFRIeIid1Tu0Ztfm5xGGAZRnDNqsGsHlrazlM7qEdhxoQpy0Nzu/RRjIa\nzjTUc18icWCSIsIKoS1HbepiQbCmpKBlb+v5D50vtmDVXSgDbOfSQO0sF+r9pCZ5\nqG8pTrcim3eNZFzLR8J/FQ1ROKhI4bJf8YHtDaIDRHI/Rn0BQkyDxy/A092JvUtP\niCWHImlHjzf5scFzk9tXOU9+DwAJ5EQhHDfcsz4U6wANmhSYH1gUq1QD2Nq7mYD+\n4lUgHArqmi4sMdx38V55CxqiCDQ3CxoDA36ABt//6QKBgQD9O+dJk1yYsC9FGK/D\nKURYpYtWnmEloMc8PJMmOJJvLjKuMnqMCStnf3HGTtBLDFfdGSvtA8ou5JbY6FLp\ndgnnPa0ZkXTf9XyfaCC7zHDF3+IbPFOAcheBUrcbSt+alsxNI3lIhmb3aPQEQQYH\nNa9YKqErRF2ZEjWuuH5LkuekJwKBgQDU1Xutuc3knXjjkYWzqFL+xrjr8M17Awz5\n+4Vh8nPGkKWRFfb83oVLnhD/noThdW5A+65fm8D3hj/e9BEiShLTA5VCKQyrzGDb\n+hSaWc8a4XjMczq24oQ1HtuJ0eD5h8d85340MwZvIOrq13Ycnv3bwOlglbNiStTo\nXU4fmRw0GQKBgDtCEVV+TmTMlcMti7O3rG6yDnEujr0nangGFMkU4+9weBubZGHw\no1+MyysEtmlZchYjFcxY3q8qfsIzW3OWU6rxG9in2RmvcII886v+o0UqptaIv2GH\nUUjJ+l9AniKmtxg1/OOjz+SFgtScArUdMvMGxsBBN0XipP1F3wgAUIRxAoGBAJYG\nyoDiic1OZ6naqanDzIVFpZLDksTUmLAaaaJqmsvsqJkGJ62GWeW8zXSy1C5tbcOm\n5fsFOtgArUNHPlCycGSIkQ0rDICJt/k4Zo+LIR9sso9D5q6GK/WaA905seGTob5d\nHCxFj5KEXLQgH2T7ei0O5jOsMt/lqgEFzI0fi675AoGBAJ/kvYqi2u53XE401i66\nZ4pEXbaWnYrqE9O6az0Ab28iG2nVJjC06i1n3XYnR02adaftYJDvfVLw7M/wER6q\ndxjNFCYrLw0COalKabJP2kEBHv5LBfNuRKo667KBMl5i/Fhb+r340w+a+HIkmiZd\nJjboXG72UZnhgzNw4QVXOP/k\n-----END PRIVATE KEY-----\n",
  "client_email": "phonexservice@phonex-273118.iam.gserviceaccount.com",
  "client_id": "102473523070802102281",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/phonexservice%40phonex-273118.iam.gserviceaccount.com"
};
const sheets = google.sheets('v4');

module.exports = {


  friendlyName: 'Phones to spreadsheet',


  description: '',


  inputs: {


    phonesArray: {
      type: 'ref',
      //example: 'Ami',
      //description: 'The name of the person to greet.',
      required: true
    },
    spreadsheetId: {
      type:'string',
      required:true,
    },
    spreadsheetSheet: {
      type:'string',
      required:true,
    }


  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs,exits) {

    let spreadsheetId = inputs.spreadsheetId;
    let spreadsheetSheet  = inputs.spreadsheetSheet;

    let jwtClient = new google.auth.JWT(
           gapi_json.client_email,
           null,
           gapi_json.private_key,
           ['https://www.googleapis.com/auth/spreadsheets']);
    //authenticate request
    jwtClient.authorize(async function (err, tokens) {

     if (err) {
       console.error(err);
       return exits.error();
     }

     try {

       let response = await sheets.spreadsheets.get({
         auth: jwtClient,
         spreadsheetId: spreadsheetId,
         ranges:[]
       });

       let sheet = response.data.sheets.filter((el)=>{return el.properties.sheetId == inputs.spreadsheetSheet});

       if(!sheet){
         return exits.error();
       }

       sheet = sheet[0].properties.title;


       response = await sheets.spreadsheets.values.get({
         auth: jwtClient,
         spreadsheetId: spreadsheetId,
         range: sheet
       });

       let existantSpreadsheetRows = response.data && response.data.values ? response.data.values : [];

       let newSpreadsheetRows = [];
       inputs.phonesArray.forEach((item, i) => {

         let idx = existantSpreadsheetRows.findIndex((row)=>{
           return row.indexOf(item.phone_number) > -1;
         });

         if(idx == -1)
         newSpreadsheetRows.push([item.phone_number,item.name,item.address,'FALSE']);

       });


       response = await sheets.spreadsheets.values.append({
           auth: jwtClient,
           spreadsheetId: spreadsheetId,
           range: sheet,
           valueInputOption: "USER_ENTERED",
           resource: {values:newSpreadsheetRows}
        });


      if(newSpreadsheetRows.length)
      {
        let startRowIndex = existantSpreadsheetRows.length ;
        let endRowIndex = startRowIndex + inputs.phonesArray.length;

        await sheets.spreadsheets.batchUpdate({
        auth: jwtClient,
         spreadsheetId,
         resource: {
           "requests": [
             {
               "setDataValidation":{
                 "range":{
                   sheetId:spreadsheetSheet,
                   startRowIndex,
                   endRowIndex,
                   startColumnIndex:3,
                   endColumnIndex:4
                 },
                 "rule":{
                   "condition": {
                      "type":"BOOLEAN",

                    },
                    "inputMessage": "",
                    "strict": true,
                    "showCustomUi": true
                 }
               }
             }
           ]
         },
       });

      }


       return exits.success();



     } catch (e) {
       return exits.error(e);
     }

    });





  }


};
