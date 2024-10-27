import clientPromise from '../../utils/mongodb';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      console.log('Connecting to MongoDB...');
      const client = await clientPromise;
      const db = client.db('assist'); // Replace with your database name
      console.log('Connected to MongoDB');

      // Fetch all data from the 'todos' collection
      const todosCollection = db.collection('todos');
      const todosData = await todosCollection.find({}).toArray();

      // Fetch all data from the 'questions' collection
      const questionsCollection = db.collection('questions');
      const questionsData = await questionsCollection.find({}).toArray();

      // Combine data from both collections
      const allData = {
        todos: todosData,
        questions: questionsData,
      };

      console.log('Fetched all data:', allData); // Log the fetched data
      res.status(200).json({ success: true, data: allData });
    } catch (error) {
      console.error('Error fetching data:', error); // Log detailed error information
      res.status(500).json({ error: 'Failed to fetch data.' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}