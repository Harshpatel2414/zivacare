export const maxDuration = 30;
import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MongoURI;

export const GET = async (req) => {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('zivacare');
    const doctors = await db.collection('Doctors').find().project({name:1,imageUrl:1,specialization:1,rating:1}).toArray();

    if (!doctors) {
      return NextResponse.json({ error: 'Doctors not found' }, { status: 404 });
    }

    return NextResponse.json(doctors, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await client.close();
  }
};