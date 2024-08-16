import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MongoURI;

export const GET = async () => {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('zivacare');
    const treatments = await db.collection('Treatments').find().project({name:1,imageUrl:1,rating:1}).toArray();
    return NextResponse.json(treatments, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await client.close();
  }
};

export const POST = async (req) => {
  const client = new MongoClient(uri);
  const body = await req.json();

  try {
    await client.connect();
    const db = client.db('zivacare');
    const result = await db.collection('Treatments').insertOne(body);
    return NextResponse.json({ message: 'Treatment created successfully', id: result.insertedId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await client.close();
  }
};

export const PUT = async (req) => {
  const client = new MongoClient(uri);
  const body = await req.json();

  if (!body._id) {
    return NextResponse.json({ error: 'Treatment ID is required' }, { status: 400 });
  }

  try {
    await client.connect();
    const db = client.db('zivacare');
    const result = await db.collection('Treatments').updateOne(
      { _id: new ObjectId(body._id) },
      { $set: body }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Treatment not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Treatment updated successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await client.close();
  }
};

export const DELETE = async (req) => {
  const client = new MongoClient(uri);
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Treatment ID is required' }, { status: 400 });
  }

  try {
    await client.connect();
    const db = client.db('zivacare');
    const result = await db.collection('Treatments').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Treatment not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Treatment deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await client.close();
  }
};
