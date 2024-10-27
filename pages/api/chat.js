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

      // Optionally fetch data from MongoDB using the deployed API
      let fetchedData = '';
      if (queryType) {
        console.log('Fetching data for queryType:', queryType);
        const fetchResponse = await fetch(`https://assist-five.vercel.app/api/fetchData?queryType=${queryType}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (fetchResponse.ok) {
          const fetchData = await fetchResponse.json();
          fetchedData = JSON.stringify(fetchData.data);
          console.log('Fetched data:', fetchedData);
        } else {
          console.error('Failed to fetch data from MongoDB');
        }
      }

      // Log conversation insights
      console.log('Generating AI response with fetched data...');
      const conversationResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a helpful assistant. Use the following data if needed: " + fetchedData },
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