import EventEmitter from 'node:events';

class MessageController extends EventEmitter {
    sendMessage(message: string) {
        this.emit('message', message);
    }
}

export default MessageController;
