import Client from './client';

const client = new Client();

client.connect(process.env.PORT || '0');
