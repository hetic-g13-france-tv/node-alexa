// IMPORTANT: Please note that this template uses Dispay Directives,
// Display Interface for your skill should be enabled through the Amazon developer console
// See this screenshot - https://alexa.design/enabledisplay

const Alexa = require('ask-sdk-core');
const fetch = require('node-fetch')

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = 'Je peux lacher une punchline sur une équipe participant à la coupe de france.';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt('Quelle équipe vous interesse j\'ai dit')
      .getResponse();
  }
};

const PunchlineIntent = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'PunchlineIntent'
  },
  async handle(handlerInput) {
    const { slots } = handlerInput.requestEnvelope.request.intent
    let param = null
    console.log(slots, slots.length)
    if(
      'punchline_about_team' in slots &&
      slots.punchline_about_team.resolutions
    )
    {
      param = slots.punchline_about_team
                .resolutions.resolutionsPerAuthority[0]
                .values[0].value.name
    }
    const req = await fetch('https://yesno.wtf/api')
    const res = await req.json()
    console.log(res.answer)
    if(param != null) {
      console.log('no params')
    }
    const punchlines = [
      "Il a mangé la feuille",
      "Il cire le banc de touche lui",
      "C'était un but venu d'ailleurs",
      "Ohlala il lui offre un caviar",
      "Cet attaquant, c'est un renard des surfaces",
      "Il lui à casser les reins",
      "Ils vont nous faire un hold-up",
      "Arriver dans la surface et ne pas pouvoir tirer au but, c'est comme danser avec sa soeur.",
      "Il pue le foot ce joueur !",
      "Mais il a complètement dévisser lui",
      "Mais il est complètement surcôté lui aussi !",
      "Il nous a fait une main de dieu",
      "C'est un missile sa frappe",
      "Il a une caravane sur le dos lui ou quoi ?",
      "Ils ont complètement fermer la boutique",
      "Il va nous faire le coup du chapeau",
    ]
    const answer = punchlines[Math.floor(Math.random() * punchlines.length)]

    return handlerInput.responseBuilder
    .speak(answer)
    .withSimpleCard('Lol World', 'speechText')
    .getResponse();
  }
}

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
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler)
  .addErrorHandlers(ErrorHandler)
  .lambda();
