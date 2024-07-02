import ClientService from './client-service';
import MessageController from './message-controller';

const client = new ClientService(MessageController);

client.connect();
