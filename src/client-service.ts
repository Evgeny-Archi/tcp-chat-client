import net, { Socket } from 'node:net';
import { Buffer } from 'node:buffer';
import MessageController from './message-controller';
import EventEmitter from 'node:events';

interface ClientError extends Error {
    code?: string;
}

class ClientService {
    private socket: Socket;
    private controller: EventEmitter;

    constructor(Controller: typeof MessageController) {
        this.socket = new net.Socket();
        this.controller = new Controller();

        this.socket.on('close', this.onClose.bind(this));
        this.socket.on('error', this.onError.bind(this));
        this.socket.on('connect', this.onConnect.bind(this));
        this.socket.on('data', this.onData.bind(this));

        this.controller.on('message', (message: Buffer) => {
            this.socket.write(message);
        });

        process.on('SIGINT', () => {
            this.onEnd();
            process.exit(1);
        });
    }

    connect(cb?: () => void) {
        this.socket.connect(process.env.PORT || '0', cb);
    }

    private onData(response: Buffer) {
        this.controller.emit('receiveData', response);
    }

    private onClose() {
        const timer = setTimeout(() => {
            this.connect(() => {
                clearTimeout(timer);
            });
        }, 1500);
    }

    private onError(e: ClientError) {
        if (e.code === 'ECONNREFUSED') {
            console.log('Server down. Reconnecting...');
            return;
        }
        if (e.code === 'EPIPE') {
            console.log('Server down. Reconnecting...');
            return;
        }
        console.error(e);
    }

    private onConnect() {
        console.log('Connected to Chat');
        // @ts-expect-error: hz kak typing this oop
        this.controller.apply();
    }

    private onEnd() {
        this.socket.removeAllListeners();
        this.controller.removeAllListeners();
    }
}

export default ClientService;
