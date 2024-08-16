import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MongoURI;

export const GET = async (req) => {
  const client = new MongoClient(uri);
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');

  if (!date) {
    return NextResponse.json({ error: 'Date is required' }, { status: 400 });
  }

  try {
    await client.connect();
    const db = client.db('zivacare');
    const bookedSlots = await db.collection('Appointments').find({ date }).toArray();

    // Extract the time slots from the documents
    const slots = bookedSlots.map((doc) => doc.time);

    return NextResponse.json(slots, { status: 200 });
  } catch (error) {
    console.error("Error fetching booked slots:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await client.close();
  }
};
