import net, { Socket } from 'node:net';
import { Buffer } from 'node:buffer';
import { randomBytes } from 'node:crypto';
import EventEmitter from 'node:events';
import { Controller } from './types';

interface ClientError extends Error {
    code?: string;
}

const SESSION_ID_LENGTH = 16;

class ClientService {
    private socket: Socket;
    private controller: EventEmitter;
    private sessionId: string;

    constructor(Controller: Controller) {
        this.socket = new net.Socket();
        this.controller = new Controller();
        this.sessionId = randomBytes(SESSION_ID_LENGTH).toString('hex');

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

    private onConnect() {
        console.log('Connected to Chat');
        // @ts-expect-error: hz kak typing this oop
        this.controller.apply();
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

    private onEnd() {
        this.socket.removeAllListeners();
        this.controller.removeAllListeners();
    }
}

export default ClientService;
