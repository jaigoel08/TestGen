const { CloudClient } = require('chromadb');
const dotenv = require('dotenv');
dotenv.config();

async function testConnection() {
  const apiKey = process.env.CHROMA_API_KEY;
  const tenant = process.env.CHROMA_TENANT;
  const database = process.env.CHROMA_DATABASE;

  console.log('Testing connection with:');
  console.log('Tenant:', tenant);
  console.log('Database:', database);

  try {
    const client = new CloudClient({
      apiKey,
      tenant,
      database
    });

    console.log('Sending heartbeat...');
    const heartbeat = await client.heartbeat();
    console.log('Heartbeat success:', heartbeat);

    console.log('Listing collections...');
    const collections = await client.listCollections();
    console.log('Collections:', collections.map(c => c.name));

  } catch (error) {
    console.error('Connection failed:', error);
  }
}

testConnection();
