import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MongoURI;

export const POST = async (req) => {
  const client = new MongoClient(uri);
  const { treatmentId, data } = await req.json();  // Expecting { treatmentId, data: { ...reviewData } }

  try {
    await client.connect();
    const db = client.db('zivacare');

    // Add a new ObjectId to the review
    const reviewWithId = { ...data, _id: new ObjectId() };

    // Add the review to the reviews array in the treatment document
    const result = await db.collection('Treatments').updateOne(
      { _id: new ObjectId(treatmentId) },
      { $push: { reviews: reviewWithId } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Treatment not found' }, { status: 404 });
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
  const { treatmentId, reviewId, updateData } = await req.json();  // Expecting { treatmentId, reviewId, updateData: { ... } }

  try {
    await client.connect();
    const db = client.db('zivacare');

    // Update the specific review in the treatment's reviews array
    const result = await db.collection('Treatments').updateOne(
      { _id: new ObjectId(treatmentId), 'reviews._id': new ObjectId(reviewId) },
      { $set: { 'reviews.$': updateData } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Treatment or review not found' }, { status: 404 });
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
  const { treatmentId, reviewId } = await req.json();  // Expecting { treatmentId, reviewId }

  try {
    await client.connect();
    const db = client.db('zivacare');

    // Remove the specific review from the treatment's reviews array
    const result = await db.collection('Treatments').updateOne(
      { _id: new ObjectId(treatmentId) },
      { $pull: { reviews: { _id: new ObjectId(reviewId) } } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Treatment or review not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Review deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await client.close();
  }
};
