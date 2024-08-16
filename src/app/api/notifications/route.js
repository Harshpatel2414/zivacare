export const maxDuration = 30;
import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MongoURI;

// GET: Fetch user notifications
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
    const user = await db.collection('Users').aggregate([
      { $match: { userId: id } },
      { $unwind: '$notifications' }, // Deconstruct the notifications array
      { $sort: { 'notifications.createdAt': -1 } }, // Sort by createdAt in descending order
      { $group: { _id: '$userId', notifications: { $push: '$notifications' } } }, // Reconstruct the notifications array
    ]).toArray();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    let data = user[0].notifications
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await client.close();
  }
};

// POST: Add a new notification
export const POST = async (req) => {
  const client = new MongoClient(uri);
  const body = await req.json();
  const { userId, notification } = body;

  if (!userId || !notification) {
    return NextResponse.json({ error: 'User ID and notification data are required' }, { status: 400 });
  }

  try {
    await client.connect();
    const db = client.db('zivacare');

    notification._id = new ObjectId(); // Add unique _id to the notification

    const result = await db.collection('Users').updateOne(
      { userId },
      { $push: { notifications: notification } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await client.close();
  }
};

// PUT: Update a notification's status to "read"
export const PUT = async (req) => {
  const client = new MongoClient(uri);
  const body = await req.json();
  const { userId, notificationId } = body;

  if (!userId || !notificationId) {
    return NextResponse.json({ error: 'User ID and Notification ID are required' }, { status: 400 });
  }

  try {
    await client.connect();
    const db = client.db('zivacare');

    const result = await db.collection('Users').updateOne(
      { userId, 'notifications._id': new ObjectId(notificationId) },
      { $set: {'notifications.$.markAsRead': true } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Notification updated' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await client.close();
  }
};

// DELETE: Remove a notification by ID
export const DELETE = async (req) => {
  const client = new MongoClient(uri);
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('id');
  const notificationId = searchParams.get('notificationId');

  if (!userId || !notificationId) {
    return NextResponse.json({ error: 'User ID and Notification ID are required' }, { status: 400 });
  }

  try {
    await client.connect();
    const db = client.db('zivacare');

    const result = await db.collection('Users').updateOne(
      { userId },
      { $pull: { notifications: { _id: new ObjectId(notificationId) } } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Notification deleted' }, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await client.close();
  }
};
 