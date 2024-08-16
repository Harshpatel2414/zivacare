export const maxDuration = 30;
import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MongoURI;

export const GET = async (req, { params }) => {
  const client = new MongoClient(uri);
  const { id } = params;

  try {
    await client.connect();
    const db = client.db('zivacare');
    const treatment = await db.collection('Treatments').findOne({ _id: new ObjectId(id) });

    if (!treatment) {
      return NextResponse.json({ error: 'Treatment not found' }, { status: 404 });
    }

    return NextResponse.json(treatment, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await client.close();
  }
};

export const POST = async (req, { params }) => {
  const client = new MongoClient(uri);
  const body = await req.json();

  try {
    await client.connect();
    const db = client.db('zivacare');
    const result = await db.collection('Treatments').insertOne(body);

    return NextResponse.json({ message: 'Treatment added successfully' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await client.close();
  }
};

export const PUT = async (req, { params }) => {
  const client = new MongoClient(uri);
  const { id } = params;
  const body = await req.json();

  try {
    await client.connect();
    const db = client.db('zivacare');
    const result = await db.collection('Treatments').updateOne(
      { _id: new ObjectId(id) },
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

export const DELETE = async (req, { params }) => {
  const client = new MongoClient(uri);
  const { id } = params;

  try {
    await client.connect();
    const db = client.db('zivacare');
    const result = await db.collection('Treatments').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Treatment not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Treatment deleted successfully' }, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await client.close();
  }
};
