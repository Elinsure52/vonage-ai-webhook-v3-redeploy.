// index.js
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;

const callerData = {}; // temporary in-memory store

app.use(bodyParser.json());

// Default webhook to answer incoming call
app.post('/webhook', (req, res) => {
  res.json([
    {
      action: 'talk',
      text: 'Hello, this is E and L Insurance AI assistant. Please say Auto, Home, Business, or Agent to begin.'
    },
    {
      action: 'input',
      eventUrl: ['https://vonage-ai-webhook-v3.onrender.com/webhook/input'],
      speech: { endOnSilence: 1, language: 'en-US' }
    }
  ]);
});

// Handle user reply to main question
app.post('/webhook/input', (req, res) => {
  const speechText = req.body.speech?.results?.[0]?.text?.toLowerCase() || '';

  if (speechText.includes('auto')) {
    return res.json([
      { action: 'talk', text: "Great. Let's begin your auto insurance quote. What is your occupation?" },
      {
        action: 'input',
        eventUrl: ['https://vonage-ai-webhook-v3.onrender.com/webhook/auto/occupation'],
        speech: { endOnSilence: 1, language: 'en-US' }
      }
    ]);
  }

  if (speechText.includes('home')) {
    return res.json([
      { action: 'talk', text: "Great. Let's begin your homeowners quote. What is the address of the property?" },
      {
        action: 'input',
        eventUrl: ['https://vonage-ai-webhook-v3.onrender.com/webhook/home/address'],
        speech: { endOnSilence: 1, language: 'en-US' }
      }
    ]);
  }

  if (speechText.includes('business')) {
    return res.json([
      { action: 'talk', text: "Let's get started with your business insurance quote. What is the name of your business?" },
      {
        action: 'input',
        eventUrl: ['https://vonage-ai-webhook-v3.onrender.com/webhook/business/name'],
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

  // fallback
  return res.json([
    { action: 'talk', text: "Sorry, I didn't catch that. Please say Auto, Home, Business, or Agent." },
    {
      action: 'input',
      eventUrl: ['https://vonage-ai-webhook-v3.onrender.com/webhook/input'],
      speech: { endOnSilence: 1, language: 'en-US' }
    }
  ]);
});

// Homeowners Quote Flow
app.post('/webhook/home/address', (req, res) => {
  callerData.address = req.body.speech?.results?.[0]?.text || '';
  res.json([
    { action: 'talk', text: 'Thanks. Is the property owner-occupied, a rental, or vacant?' },
    {
      action: 'input',
      eventUrl: ['https://vonage-ai-webhook-v3.onrender.com/webhook/home/occupancy'],
      speech: { endOnSilence: 1, language: 'en-US' }
    }
  ]);
});

app.post('/webhook/home/occupancy', (req, res) => {
  callerData.occupancyType = req.body.speech?.results?.[0]?.text || '';
  res.json([
    { action: 'talk', text: 'Got it. What year was the home built?' },
    {
      action: 'input',
      eventUrl: ['https://vonage-ai-webhook-v3.onrender.com/webhook/home/yearbuilt'],
      speech: { endOnSilence: 1, language: 'en-US' }
    }
  ]);
});

app.post('/webhook/home/yearbuilt', (req, res) => {
  callerData.yearBuilt = req.body.speech?.results?.[0]?.text || '';
  res.json([
    { action: 'talk', text: 'And what type of roof does the home have? For example, shingle, tile, or metal.' },
    {
      action: 'input',
      eventUrl: ['https://vonage-ai-webhook-v3.onrender.com/webhook/home/rooftype'],
      speech: { endOnSilence: 1, language: 'en-US' }
    }
  ]);
});

app.post('/webhook/home/rooftype', (req, res) => {
  callerData.roofType = req.body.speech?.results?.[0]?.text || '';
  res.json([
    { action: 'talk', text: 'Thank you! Your homeowners quote request has been submitted. A licensed agent will follow up shortly.' }
  ]);
});

// Auto Quote Flow
app.post('/webhook/auto/occupation', (req, res) => {
  callerData.occupation = req.body.speech?.results?.[0]?.text || '';
  res.json([
    { action: 'talk', text: 'Thank you. What is your highest level of education?' },
    {
      action: 'input',
      eventUrl: ['https://vonage-ai-webhook-v3.onrender.com/webhook/auto/education'],
      speech: { endOnSilence: 1, language: 'en-US' }
    }
  ]);
});

app.post('/webhook/auto/education', (req, res) => {
  callerData.education = req.body.speech?.results?.[0]?.text || '';
  res.json([
    { action: 'talk', text: 'How do you primarily use your vehicle? For example, commuting, pleasure, or business.' },
    {
      action: 'input',
      eventUrl: ['https://vonage-ai-webhook-v3.onrender.com/webhook/auto/usetype'],
      speech: { endOnSilence: 1, language: 'en-US' }
    }
  ]);
});

app.post('/webhook/auto/usetype', (req, res) => {
  callerData.useType = req.body.speech?.results?.[0]?.text || '';
  res.json([
    { action: 'talk', text: 'Approximately how many miles do you drive to work one way?' },
    {
      action: 'input',
      eventUrl: ['https://vonage-ai-webhook-v3.onrender.com/webhook/auto/miles'],
      speech: { endOnSilence: 1, language: 'en-US' }
    }
  ]);
});

app.post('/webhook/auto/miles', (req, res) => {
  callerData.milesToWork = req.body.speech?.results?.[0]?.text || '';
  res.json([
    { action: 'talk', text: 'Thank you. Your auto quote request has been received. A licensed agent will follow up shortly.' }
  ]);
});

// Business Quote Flow
app.post('/webhook/business/name', (req, res) => {
  callerData.businessName = req.body.speech?.results?.[0]?.text || '';
  res.json([
    { action: 'talk', text: 'What type of business is it?' },
    {
      action: 'input',
      eventUrl: ['https://vonage-ai-webhook-v3.onrender.com/webhook/business/type'],
      speech: { endOnSilence: 1, language: 'en-US' }
    }
  ]);
});

app.post('/webhook/business/type', (req, res) => {
  callerData.businessType = req.body.speech?.results?.[0]?.text || '';
  res.json([
    { action: 'talk', text: 'Approximately how many employees does your business have?' },
    {
      action: 'input',
      eventUrl: ['https://vonage-ai-webhook-v3.onrender.com/webhook/business/employees'],
      speech: { endOnSilence: 1, language: 'en-US' }
    }
  ]);
});

app.post('/webhook/business/employees', (req, res) => {
  callerData.employees = req.body.speech?.results?.[0]?.text || '';
  res.json([
    { action: 'talk', text: 'And what is your estimated annual revenue?' },
    {
      action: 'input',
      eventUrl: ['https://vonage-ai-webhook-v3.onrender.com/webhook/business/revenue'],
      speech: { endOnSilence: 1, language: 'en-US' }
    }
  ]);
});

app.post('/webhook/business/revenue', (req, res) => {
  callerData.revenue = req.body.speech?.results?.[0]?.text || '';
  res.json([
    { action: 'talk', text: 'Thank you! Your business insurance request has been submitted. A licensed agent will follow up shortly.' }
  ]);
});

// Start the Express server
app.listen(port, () => {
  console.log(`Vonage webhook listening at http://localhost:${port}`);
});
