export const maxDuration = 30;
import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MongoURI;

export const GET = async () => {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('zivacare');
    const offers = await db.collection('Offers').find().toArray();
    return NextResponse.json(offers, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await client.close();
  }
};

export const POST = async (req) => {
  const client = new MongoClient(uri);
  const offerData = await req.json();  // Expecting the offer data as JSON

  try {
    await client.connect();
    const db = client.db('zivacare');

    // Add a new ObjectId to the offer data
    const offerWithId = { ...offerData, _id: new ObjectId() };

    const result = await db.collection('Offers').insertOne(offerWithId);

    return NextResponse.json({ message: 'Offer added successfully', offerId: offerWithId._id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await client.close();
  }
};

export const PUT = async (req) => {
  const client = new MongoClient(uri);
  const { id, updateData } = await req.json();  // Expecting { id, updateData: { ... } }

  try {
    await client.connect();
    const db = client.db('zivacare');

    // Update the specific offer
    const result = await db.collection('Offers').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Offer updated successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await client.close();
  }
};

export const DELETE = async (req) => {
  const client = new MongoClient(uri);
  const { id } = await req.json();  // Expecting { id }

  try {
    await client.connect();
    const db = client.db('zivacare');

    // Remove the specific offer
    const result = await db.collection('Offers').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Offer deleted successfully' }, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await client.close();
  }
};
