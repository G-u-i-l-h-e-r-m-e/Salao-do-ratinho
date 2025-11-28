require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
let db;
const client = new MongoClient(process.env.MONGODB_URI);

async function connectDB() {
  try {
    await client.connect();
    db = client.db('salao-do-ratinho');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Helper to convert _id
const formatDoc = (doc) => {
  if (!doc) return null;
  return { ...doc, _id: doc._id.toString() };
};

const formatDocs = (docs) => docs.map(formatDoc);

// ==================== CLIENTS ====================
app.get('/api/clients', async (req, res) => {
  try {
    const clients = await db.collection('clients').find().toArray();
    res.json({ success: true, data: formatDocs(clients) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/clients/:id', async (req, res) => {
  try {
    const client = await db.collection('clients').findOne({ _id: new ObjectId(req.params.id) });
    res.json({ success: true, data: formatDoc(client) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/clients', async (req, res) => {
  try {
    const clientData = {
      ...req.body,
      visits: req.body.visits || 0,
      totalSpent: req.body.totalSpent || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await db.collection('clients').insertOne(clientData);
    res.json({ success: true, data: { ...clientData, _id: result.insertedId.toString() } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/clients/:id', async (req, res) => {
  try {
    const updateData = { ...req.body, updatedAt: new Date() };
    await db.collection('clients').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );
    res.json({ success: true, data: { _id: req.params.id, ...updateData } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/clients/:id', async (req, res) => {
  try {
    await db.collection('clients').deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== SERVICES ====================
app.get('/api/services', async (req, res) => {
  try {
    const services = await db.collection('services').find().toArray();
    res.json({ success: true, data: formatDocs(services) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/services', async (req, res) => {
  try {
    const serviceData = {
      ...req.body,
      active: req.body.active !== false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await db.collection('services').insertOne(serviceData);
    res.json({ success: true, data: { ...serviceData, _id: result.insertedId.toString() } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/services/:id', async (req, res) => {
  try {
    const updateData = { ...req.body, updatedAt: new Date() };
    await db.collection('services').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );
    res.json({ success: true, data: { _id: req.params.id, ...updateData } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/services/:id', async (req, res) => {
  try {
    await db.collection('services').deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== APPOINTMENTS ====================
app.get('/api/appointments', async (req, res) => {
  try {
    const { date } = req.query;
    const query = date ? { date } : {};
    const appointments = await db.collection('appointments').find(query).sort({ date: 1, time: 1 }).toArray();
    res.json({ success: true, data: formatDocs(appointments) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/appointments', async (req, res) => {
  try {
    const appointmentData = {
      ...req.body,
      status: req.body.status || 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await db.collection('appointments').insertOne(appointmentData);
    res.json({ success: true, data: { ...appointmentData, _id: result.insertedId.toString() } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/appointments/:id', async (req, res) => {
  try {
    const updateData = { ...req.body, updatedAt: new Date() };
    await db.collection('appointments').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );
    res.json({ success: true, data: { _id: req.params.id, ...updateData } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/appointments/:id', async (req, res) => {
  try {
    await db.collection('appointments').deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== TRANSACTIONS ====================
app.get('/api/transactions', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {};
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }
    const transactions = await db.collection('transactions').find(query).sort({ date: -1 }).toArray();
    res.json({ success: true, data: formatDocs(transactions) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/transactions/summary', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {};
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }
    
    const transactions = await db.collection('transactions').find(query).toArray();
    
    const summary = transactions.reduce((acc, t) => {
      if (t.type === 'income') {
        acc.income += t.amount;
      } else {
        acc.expense += t.amount;
      }
      acc.count++;
      return acc;
    }, { income: 0, expense: 0, count: 0 });
    
    summary.balance = summary.income - summary.expense;
    
    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/transactions', async (req, res) => {
  try {
    const transactionData = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await db.collection('transactions').insertOne(transactionData);
    res.json({ success: true, data: { ...transactionData, _id: result.insertedId.toString() } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/transactions/:id', async (req, res) => {
  try {
    const updateData = { ...req.body, updatedAt: new Date() };
    await db.collection('transactions').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );
    res.json({ success: true, data: { _id: req.params.id, ...updateData } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/transactions/:id', async (req, res) => {
  try {
    await db.collection('transactions').deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});
