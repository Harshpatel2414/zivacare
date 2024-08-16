import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MongoURI;

export const GET = async (req) => {
  const client = new MongoClient(uri);
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  try {
    await client.connect();
    const db = client.db('zivacare');
    const appointments = await db.collection('Appointments')
      .find({ userId: id })
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order
      .toArray();
    return NextResponse.json(appointments, { status: 200 });
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
    const result = await db.collection('Appointments').insertOne(body);

    const notification = {
      docId: result.insertedId,
      title: 'Appointment Scheduled',
      message: `Your appointment with doctor ID ${body.doctorid} has been scheduled.`,
      status: 'unread',
      markAsRead: false,
      createdAt: new Date(),
    };

    await db.collection('users').updateOne(
      { userId: body.userId },
      { $push: { notifications: notification } }
    );

    return NextResponse.json({ message: 'Appointment created successfully.' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await client.close();
  }
};

export const PUT = async (req) => {
  const client = new MongoClient(uri);
  const body = await req.json();

  if (!body.id) {
    return NextResponse.json({ error: 'Appointment ID is required' }, { status: 400 });
  }

  try {
    await client.connect();
    const db = client.db('zivacare');
    const result = await db.collection('Appointments').updateOne(
      { _id: new ObjectId(body.id) },
      { $set: { status: body.status, note: body.note } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    let responseMessage = '';
    switch (body.status) {
      case 'scheduled':
        responseMessage = 'Appointment scheduled successfully.';
        break;
      case 'rescheduled':
        responseMessage = 'Appointment rescheduled successfully.';
        break;
      case 'cancelled':
        responseMessage = 'Appointment cancelled successfully.';
        break;
      default:
        responseMessage = 'Appointment updated successfully.';
    }

    return NextResponse.json({ message: responseMessage }, { status: 200 });
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
    return NextResponse.json({ error: 'Appointment ID is required' }, { status: 400 });
  }

  try {
    await client.connect();
    const db = client.db('zivacare');
    const result = await db.collection('Appointments').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    await db.collection('users').updateMany(
      { 'notifications.docId': id },
      { $pull: { notifications: { docId: id } } }
    );

    return NextResponse.json({ message: 'Appointment deleted successfully.' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await client.close();
  }
};
