import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { MongoClient, ObjectId } from "https://deno.land/x/mongo@v0.32.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MONGODB_URI = Deno.env.get('MONGODB_URI');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (!MONGODB_URI) {
    console.error('MONGODB_URI not configured');
    return new Response(JSON.stringify({ error: 'MongoDB URI not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let client: MongoClient | null = null;

  try {
    const { action, data, id, date } = await req.json();
    console.log(`Received action: ${action}`, { data, id, date });

    client = new MongoClient();
    await client.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = client.database('barbershop');
    const appointments = db.collection('appointments');

    let result;

    switch (action) {
      case 'list':
        if (date) {
          result = await appointments.find({ date }).toArray();
        } else {
          result = await appointments.find({}).toArray();
        }
        console.log(`Found ${result.length} appointments`);
        break;

      case 'create':
        if (!data.clientName || !data.service || !data.date || !data.time) {
          throw new Error('Client name, service, date and time are required');
        }
        const newAppointment = {
          ...data,
          status: data.status || 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        const insertId = await appointments.insertOne(newAppointment);
        result = { ...newAppointment, _id: insertId };
        console.log('Created appointment:', result);
        break;

      case 'update':
        if (!id) {
          throw new Error('Appointment ID is required for update');
        }
        const updateData = {
          ...data,
          updatedAt: new Date(),
        };
        await appointments.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );
        result = { _id: id, ...updateData };
        console.log('Updated appointment:', result);
        break;

      case 'delete':
        if (!id) {
          throw new Error('Appointment ID is required for delete');
        }
        await appointments.deleteOne({ _id: new ObjectId(id) });
        result = { deleted: true, id };
        console.log('Deleted appointment:', id);
        break;

      case 'get':
        if (!id) {
          throw new Error('Appointment ID is required');
        }
        result = await appointments.findOne({ _id: new ObjectId(id) });
        console.log('Found appointment:', result);
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in mongodb-appointments function:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } finally {
    if (client) {
      try {
        client.close();
      } catch (e) {
        console.error('Error closing MongoDB connection:', e);
      }
    }
  }
});
