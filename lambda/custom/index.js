// IMPORTANT: Please note that this template uses Dispay Directives,
// Display Interface for your skill should be enabled through the Amazon developer console
// See this screenshot - https://alexa.design/enabledisplay

const Alexa = require('ask-sdk-core');
const fetch = require('node-fetch')

let rowData;
let actual;
let tutoDone = false;


// —————————————————GOOGLE————————————————————
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Sheets API.
  authorize(JSON.parse(content), function(auth) {
    const sheets = google.sheets({version: 'v4', auth});
    sheets.spreadsheets.values.get({
      spreadsheetId: '183Ax2YAoHpMezxi_H79z3-bMnoyiJbAkMNmnqgMqA1E',
      range: 'C2:D100',
      majorDimension: 'ROWS'
    }, (err, res) => {
      if (err) return console.log('The API returned an error: ' + err);
      const rows = res.data.values;
      rowData = rows;
      rowData = rowData.filter(el => el[0] != undefined || el != '')
    });
  });
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error while trying to retrieve access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}
// —————————————————GOOGLE————————————————————
console.log('—————————————————')
const {
  getSlotValue,
} = require('ask-sdk-core');

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    console.log('In Launcher Handler')
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = "Bonjour et bienvenue sur Footcaviar. Ici, je peux t’apprendre à donner l’illusion d’être un connaisseur en t’apprenant quelques punchlines. ";
    const secondSpeechText = "Comme c’est la première fois que tu utilises Footcaviar, je vais te donner un petit conseil. Tu peux me demander de répéter en disant, “Alexa répète”. Voulez-vous commencer ?";

    return handlerInput.responseBuilder
      .speak(`
        <speak>
        <p>${speechText}</p>
        <p>${secondSpeechText}</p>
        </speak>
      `)
      .withShouldEndSession(false)
      .getResponse();
  }
};

const PunchlineIntent = {
  canHandle(handlerInput) {
    console.log('In Punchline Intent')
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'PunchlineIntent'
  },
  handle(handlerInput) {
    const test = getSlotValue(handlerInput.requestEnvelope, 'yesNo') || null
    if(test != 'oui' && tutoDone) {
      const answer = rowData[Math.floor(Math.random() * rowData.length)]
      rowData = rowData.filter(el => el[0] !== answer[0])
      actual = answer
      console.log({ actual })
      return handlerInput.responseBuilder
      .speak(answer[0])
      .withShouldEndSession(false)
      .getResponse();
    } else {
      tutoDone = true
      return handlerInput.responseBuilder
      .speak("C'est parti, pour apprendre une punchline vous pouvez dire: \"Alexa sors moi une punchline\"")
      .withShouldEndSession(false)
      .getResponse();
    }
  }
}


const InfoIntent = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'InfoIntent';
  },
  handle(handlerInput) {
    console.log(actual)
    const res = actual && actual[1] ? actual[1] : "Il n'y a pas d'informations sur cette punchline."
    return handlerInput.responseBuilder
    .speak(res)
    .reprompt(res)
    .getResponse();
  }
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'Dis moi bonjour';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  }
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  }
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    //any cleanup logic goes here
    return handlerInput.responseBuilder.getResponse();
  }
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Y\'a une erreur go dans la console')
      .reprompt('Y\'a une erreur go dans la console')
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();
/* LAMBDA SETUP */
exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    PunchlineIntent,
    InfoIntent,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler)
  .addErrorHandlers(ErrorHandler)
  .lambda();
