require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

const SAMPLE_STORES = [
  {
    id: 1,
    name: "FreshMart",
    address: "123 Main St, Bronx, NY 10451",
    acceptsEBT: true,
    delivery: true,
    deliveryServices: ["Instacart", "DoorDash"],
    deliveryFee: 3.99
  },
  {
    id: 2,
    name: "SaveMore Grocery",
    address: "456 Oak Ave, Bronx, NY 10452",
    acceptsEBT: true,
    delivery: true,
    deliveryServices: ["Instacart"],
    deliveryFee: 5.99
  },
  {
    id: 3,
    name: "La Bodega",
    address: "789 Grand Concourse, Bronx, NY 10451",
    acceptsEBT: true,
    delivery: false,
    deliveryServices: []
  }
];

app.get('/', (req, res) => {
  res.json({ 
    message: '🥬 nurtur API is running!',
    endpoints: {
      search: 'POST /api/search'
    }
  });
});

app.post('/api/search', async (req, res) => {
  try {
    const { query, location } = req.body;
    
    if (!query || !location) {
      return res.status(400).json({ error: 'Missing query or location' });
    }

    console.log('Search request:', query);

    // MOCK RESPONSE - bypassing Gemini for now
    const mockResponse = {
      interpretedQuery: `Looking for: ${query} near ${location.city}, ${location.state}`,
      rankedStores: [
        {
          storeId: 1,
          storeName: "FreshMart",
          relevanceScore: 9,
          reasoning: "Great match! FreshMart offers halal meat with same-day delivery via Instacart and DoorDash. Delivery fee is only $3.99.",
          matchedFeatures: ["halal meat available", "same-day delivery", "affordable delivery fee"],
          potentialIssues: []
        },
        {
          storeId: 3,
          storeName: "La Bodega",
          relevanceScore: 7,
          reasoning: "Excellent halal meat selection and best prices, but no delivery service. Located 2 miles away.",
          matchedFeatures: ["halal certified", "locally owned", "best prices"],
          potentialIssues: ["no delivery available"]
        }
      ],
      conversationalResponse: "I found 2 stores for you! FreshMart is your best bet - they have halal meat and can deliver today for under $4. La Bodega has amazing selection and prices but you'd need to pick up."
    };

    res.json(mockResponse);
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n✅ nurtur API running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}\n`);
});