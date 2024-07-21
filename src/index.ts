import ClientService from './client-service';
import MessageController from './message-controller';
import Presenter from './presenter';

const client = new ClientService(Presenter, MessageController);

client.connect();
