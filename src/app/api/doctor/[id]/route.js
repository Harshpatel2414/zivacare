import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MongoURI;

export const GET = async (req, { params }) => {
  const client = new MongoClient(uri);
  const { id } = params;

  try {
    await client.connect();
    const db = client.db('zivacare');
    const doctor = await db.collection('Doctors').findOne({ _id: new ObjectId(id) });

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    return NextResponse.json(doctor, { status: 200 });
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
    const result = await db.collection('Doctors').insertOne(body);

    return NextResponse.json({ message: 'Doctor added successfully' }, { status: 201 });
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
    const result = await db.collection('Doctors').updateOne(
      { _id: new ObjectId(id) },
      { $set: body }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Doctor updated successfully' }, { status: 200 });
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
    const result = await db.collection('Doctors').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Doctor deleted successfully' }, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await client.close();
  }
};
