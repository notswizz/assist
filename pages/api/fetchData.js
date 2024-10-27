import clientPromise from '../../utils/mongodb';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { queryType } = req.query; // Use req.query for GET requests

    console.log('Received queryType:', queryType); // Debugging log

    if (!queryType || typeof queryType !== 'string') {
      console.error('Invalid query type format:', queryType);
      return res.status(400).json({ error: 'Invalid query type format.' });
    }

    try {
      const client = await clientPromise;
      const db = client.db('assist'); // Replace with your database name

      let data;
      if (queryType === 'todos') {
        console.log('Fetching todos from MongoDB');
        const collection = db.collection('todos');
        data = await collection.find({}).toArray();
      } else if (queryType === 'questions') {
        console.log('Fetching questions from MongoDB');
        const collection = db.collection('questions');
        data = await collection.find({}).toArray();
      } else {
        console.error('Query type not recognized:', queryType);
        return res.status(400).json({ error: 'Query type not recognized.' });
      }

      console.log('Fetched data:', data);
      res.status(200).json({ success: true, data });
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Failed to fetch data.' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}