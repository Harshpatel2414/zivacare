export const maxDuration = 30;
import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MongoURI;

export const GET = async (req, { params }) => {
    const client = new MongoClient(uri);
    const { id } = params;

    if (!id) {
        return NextResponse.json({ error: 'Appointment ID is required' }, { status: 400 });
    }

    try {
        await client.connect();
        const db = client.db('zivacare');

        // Fetch the appointment details
        const appointment = await db.collection('Appointments').findOne({ _id: new ObjectId(id) });

        if (!appointment) {
            return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
        }

        // Fetch the doctor details
        const doctor = await db.collection('Doctors').findOne({ _id: new ObjectId(appointment.doctorId) }, {
            projection: { name: 1, imageUrl: 1, rating: 1 }
        });

        // Fetch the treatment details
        const treatment = await db.collection('Treatments').findOne({ _id: new ObjectId(appointment.treatmentId) }, {
            projection: { name: 1, imageUrl: 1, rating: 1 }
        });

        // Combine the data
        const response = {
            ...appointment,
            doctor: doctor || null,
            treatment: treatment || null
        };

        return NextResponse.json(response, { status: 200 });
    } catch (error) {
        console.error('Error fetching appointment details:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    } finally {
        await client.close();
    }
};