import OpenAI from 'openai'; // Import OpenAI client

// Configure OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure your API key is stored in an environment variable
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { messages, queryType } = req.body;

      console.log('Received queryType in chat.js:', queryType); // Debugging log

      // Fetch all data from MongoDB using the deployed API
      let fetchedData = {};
      try {
        const fetchResponse = await fetch(`https://assist-five.vercel.app/api/fetchData`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (fetchResponse.ok) {
          const fetchData = await fetchResponse.json();
          fetchedData = fetchData.data;
          console.log('Fetched data:', fetchedData);
        } else {
          console.error('Failed to fetch data from MongoDB');
        }
      } catch (fetchError) {
        console.error('Error fetching data:', fetchError);
      }

      // Check if the new message is a duplicate
      const isDuplicate = (type, text) => {
        return fetchedData[type]?.some(item => item.text.toLowerCase() === text.toLowerCase());
      };

      // Process each message
      for (const message of messages) {
        const messageType = queryType === 'todos' ? 'todos' : 'questions';
        if (isDuplicate(messageType, message.content)) {
          console.log(`Duplicate ${messageType} found:`, message.content);
          continue; // Skip adding this message if it's a duplicate
        }

        // Add logic here to save the new reminder or question if it's not a duplicate
        console.log(`Adding new ${messageType}:`, message.content);
        // Example: await saveToDatabase(messageType, message.content);
      }

      // Log conversation insights
      console.log('Generating AI response with fetched data...');
      const conversationResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a helpful assistant. Use the following data if needed: " + JSON.stringify(fetchedData) },
          ...messages.map(message => ({ role: "user", content: message.content }))
        ],
        temperature: 1,
        max_tokens: 2048,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });

      const aiResponse = conversationResponse.choices[0].message.content;
      console.log('AI Response:', aiResponse);

      // Respond with the AI's response
      res.status(200).json({ response: aiResponse });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}