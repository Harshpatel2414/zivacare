export const maxDuration = 30;
import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MongoURI;

export const GET = async (req) => {
  const client = new MongoClient(uri);
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    await client.connect();
    const db = client.db('zivacare');
    const user = await db.collection('Users').findOne({ userId: id });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await client.close();
  }
};

export const POST = async (req) => {
  const client = new MongoClient(uri);
  const body = await req.json();
  body._id = new ObjectId()
  console.log("body >>>", body)

  try {
    await client.connect();
    const db = client.db('zivacare');
    const result = await db.collection('Users').insertOne(body);

    return NextResponse.json({message: 'user created succesfully',result}, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await client.close();
  }
};

export const PUT = async (req) => {
  const client = new MongoClient(uri);
  const body = await req.json();
  const { userId, data } = body;

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    await client.connect();
    const db = client.db('zivacare');
    const result = await db.collection('Users').updateOne(
      { userId },
      { $set: data }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User updated' }, { status: 200 });
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
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    await client.connect();
    const db = client.db('zivacare');
    const result = await db.collection('Users').deleteOne({ userId: id });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User deleted' }, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await client.close();
  }
};
