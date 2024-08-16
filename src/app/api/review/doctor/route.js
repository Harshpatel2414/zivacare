export const maxDuration = 30;
import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MongoURI;

export const POST = async (req) => {
  const client = new MongoClient(uri);
  const { doctorId, data } = await req.json();  // Expecting { doctorId, data: { ...reviewData } }

  try {
    await client.connect();
    const db = client.db('zivacare');

    // Add a new ObjectId to the review
    const reviewWithId = { ...data, _id: new ObjectId() };

    // Add the review to the reviews array in the doctor document
    const result = await db.collection('Doctors').updateOne(
      { _id: new ObjectId(doctorId) },
      { $push: { reviews: reviewWithId } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Review added successfully', reviewId: reviewWithId._id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await client.close();
  }
};

export const PUT = async (req) => {
  const client = new MongoClient(uri);
  const { doctorId, reviewId, updateData } = await req.json();  // Expecting { doctorId, reviewId, updateData: { ... } }

  try {
    await client.connect();
    const db = client.db('zivacare');

    // Update the specific review in the doctor's reviews array
    const result = await db.collection('Doctors').updateOne(
      { _id: new ObjectId(doctorId), 'reviews._id': new ObjectId(reviewId) },
      { $set: { 'reviews.$': updateData } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Doctor or review not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Review updated successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await client.close();
  }
};

export const DELETE = async (req) => {
  const client = new MongoClient(uri);
  const { doctorId, reviewId } = await req.json();  // Expecting { doctorId, reviewId }

  try {
    await client.connect();
    const db = client.db('zivacare');

    // Remove the specific review from the doctor's reviews array
    const result = await db.collection('Doctors').updateOne(
      { _id: new ObjectId(doctorId) },
      { $pull: { reviews: { _id: new ObjectId(reviewId) } } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Doctor or review not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Review deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await client.close();
  }
};
