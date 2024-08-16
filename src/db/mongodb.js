import { MongoClient } from 'mongodb';

const uri = 'mongodb+srv://zivikacare2414:zivikacare2414@cluster0.mghza.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

export async function connectToDatabase() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('zivacare');
    return { client, db };
  } catch (error) {
    throw new Error('Failed to connect to the database');
  }
}