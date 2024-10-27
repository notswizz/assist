import clientPromise from '../../utils/mongodb';
import OpenAI from 'openai'; // Import OpenAI client

// Configure OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure your API key is stored in an environment variable
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Invalid message format.' });
    }

    try {
      // Use OpenAI to analyze the message
      const analysisResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a helpful assistant. Determine if the following message is a task, a reminder, a question, or just a regular message. Respond with 'task', 'reminder', 'question', or 'message'." },
          { role: "user", content: message }
        ],
        temperature: 0.5,
        max_tokens: 10,
      });

      const analysisResult = analysisResponse.choices[0].message.content.trim().toLowerCase();

      // Determine the type of message and log accordingly
      if (analysisResult === 'task' || analysisResult === 'reminder') {
        // Transform the message into a concise reminder
        const reminderMessage = await transformMessageWithAI(message);
        // Log to the todos collection
        await logToDatabase('todos', reminderMessage);
      } else if (analysisResult === 'question') {
        // Log to the questions collection
        await logToDatabase('questions', message);
      } else if (analysisResult === 'message') {
        return res.status(200).json({ success: true, type: 'message', info: 'No logging required for regular messages.' });
      } else {
        return res.status(400).json({ error: 'Message type not recognized.' });
      }

      res.status(200).json({ success: true, type: analysisResult });
    } catch (error) {
      console.error('Error analyzing and logging message:', error);
      res.status(500).json({ error: 'Failed to analyze and log message.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// Function to use AI to transform a message into a concise reminder
async function transformMessageWithAI(message) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a helpful assistant. Please transform the following message into a concise reminder by removing unnecessary phrases and focusing on the core task." },
        { role: "user", content: message }
      ],
      temperature: 0.5,
      max_tokens: 50,
    });

    const transformedMessage = response.choices[0].message.content.trim();
    return transformedMessage;
  } catch (error) {
    console.error('Error transforming message with AI:', error);
    throw new Error('Failed to transform message with AI.');
  }
}

// Helper function to log message to the database
async function logToDatabase(collectionName, message) {
  try {
    const client = await clientPromise;
    const db = client.db('assist'); // Replace with your database name
    const collection = db.collection(collectionName);

    await collection.insertOne({ text: message, createdAt: new Date() });
    console.log(`Message logged in ${collectionName}:`, message);
  } catch (error) {
    console.error(`Error logging message to ${collectionName}:`, error);
    throw error;
  }
}