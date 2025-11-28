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
    const { action, data, id, startDate, endDate } = await req.json();
    console.log(`Received action: ${action}`, { data, id, startDate, endDate });

    client = new MongoClient();
    await client.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = client.database('salao-do-ratinho');
    const transactions = db.collection('transactions');

    let result;

    switch (action) {
      case 'list':
        const query: Record<string, unknown> = {};
        if (startDate && endDate) {
          query.date = { $gte: startDate, $lte: endDate };
        }
        result = await transactions.find(query).toArray();
        console.log(`Found ${result.length} transactions`);
        break;

      case 'create':
        if (!data.type || data.amount === undefined || !data.description) {
          throw new Error('Type, amount and description are required');
        }
        const newTransaction = {
          ...data,
          date: data.date || new Date().toISOString().split('T')[0],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        const insertId = await transactions.insertOne(newTransaction);
        result = { ...newTransaction, _id: insertId };
        console.log('Created transaction:', result);
        break;

      case 'update':
        if (!id) {
          throw new Error('Transaction ID is required for update');
        }
        const updateData = {
          ...data,
          updatedAt: new Date(),
        };
        await transactions.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );
        result = { _id: id, ...updateData };
        console.log('Updated transaction:', result);
        break;

      case 'delete':
        if (!id) {
          throw new Error('Transaction ID is required for delete');
        }
        await transactions.deleteOne({ _id: new ObjectId(id) });
        result = { deleted: true, id };
        console.log('Deleted transaction:', id);
        break;

      case 'summary':
        const summaryQuery: Record<string, unknown> = {};
        if (startDate && endDate) {
          summaryQuery.date = { $gte: startDate, $lte: endDate };
        }
        const allTransactions = await transactions.find(summaryQuery).toArray() as Array<{ type: string; amount: number }>;
        let income = 0;
        let expense = 0;
        for (const t of allTransactions) {
          if (t.type === 'income') {
            income += t.amount;
          } else if (t.type === 'expense') {
            expense += t.amount;
          }
        }
        result = {
          income,
          expense,
          balance: income - expense,
          count: allTransactions.length,
        };
        console.log('Summary:', result);
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in mongodb-transactions function:', errorMessage);
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
