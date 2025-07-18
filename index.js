const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;

const callerData = {};

app.use(bodyParser.json());

app.post('/webhook', (req, res) => {
  res.json([
    {
      action: 'talk',
      text: 'Hello, this is E and L Insurance AI assistant. Please say Auto, Home, Business, or Agent to begin.'
    },
    {
      action: 'input',
      eventUrl: ['https://your-webhook-url.onrender.com/webhook/input'],
      speech: { endOnSilence: 1, language: 'en-US' }
    }
  ]);
});

app.post('/webhook/input', (req, res) => {
  const speechText = req.body.speech?.results?.[0]?.text?.toLowerCase() || '';

  if (speechText.includes('auto')) {
    return res.json([
      { action: 'talk', text: "Great. Let's begin your auto insurance quote. What is your occupation?" },
      {
        action: 'input',
        eventUrl: ['https://your-webhook-url.onrender.com/webhook/auto/occupation'],
        speech: { endOnSilence: 1, language: 'en-US' }
      }
    ]);
  }

  if (speechText.includes('home')) {
    return res.json([
      { action: 'talk', text: "Great. Let's begin your homeowners quote. What is the address of the property?" },
      {
        action: 'input',
        eventUrl: ['https://your-webhook-url.onrender.com/webhook/home/address'],
        speech: { endOnSilence: 1, language: 'en-US' }
      }
    ]);
  }

  if (speechText.includes('business')) {
    return res.json([
      { action: 'talk', text: "Let's get started with your business insurance quote. What is the name of your business?" },
      {
        action: 'input',
        eventUrl: ['https://your-webhook-url.onrender.com/webhook/business/name'],
        speech: { endOnSilence: 1, language: 'en-US' }
      }
    ]);
  }

  if (speechText.includes('agent')) {
    return res.json([
      { action: 'talk', text: 'Please hold while I connect you to a licensed agent.' },
      {
        action: 'connect',
        from: '12622581002',
        endpoint: [{ type: 'phone', number: '13055411002' }]
      }
    ]);
  }

  return res.json([
    { action: 'talk', text: "Sorry, I didn't catch that. Please say Auto, Home, Business, or Agent." },
    {
      action: 'input',
      eventUrl: ['https://your-webhook-url.onrender.com/webhook/input'],
      speech: { endOnSilence: 1, language: 'en-US' }
    }
  ]);
});

app.post('/webhook/auto/occupation', (req, res) => {
  callerData.occupation = req.body.speech?.results?.[0]?.text || '';
  res.json([{ action: 'talk', text: 'Thanks. We have recorded your information.' }]);
});
app.post('/webhook/home/address', (req, res) => {
  callerData.address = req.body.speech?.results?.[0]?.text || '';
  res.json([{ action: 'talk', text: 'Thanks. We have recorded your address.' }]);
});
app.post('/webhook/business/name', (req, res) => {
  callerData.businessName = req.body.speech?.results?.[0]?.text || '';
  res.json([{ action: 'talk', text: 'Thanks. We have recorded your business name.' }]);
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});