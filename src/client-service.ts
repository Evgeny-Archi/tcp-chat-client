import net, { Socket } from 'node:net';
import { Buffer } from 'node:buffer';
import { randomBytes } from 'node:crypto';
import { IPresenter, Presenter, IController, Controller, Type } from './types';

interface ClientError extends Error {
    code?: string;
}

class ClientService {
    private socket: Socket;
    private presenter: IPresenter;
    private controller: IController;
    private sessionId: string;

    constructor(Presenter: Presenter, Controller: Controller) {
        this.socket = new net.Socket();
        this.presenter = new Presenter();
        this.controller = new Controller();
        this.sessionId = randomBytes(16).toString('hex');

        this.socket.on('close', this.onClose.bind(this));
        this.socket.on('error', this.onError.bind(this));
        this.socket.on('connect', this.onConnect.bind(this));
        this.socket.on('data', this.onData.bind(this));

        this.controller.on('write', (data, encoding, cb) => {
            this.socket.write(data, encoding, cb ? cb : undefined);
        });

        this.presenter.on('applyName', (name: string) => {
            this.controller.write(Type.Greeting, name);
        });
        this.presenter.on('message', (message: string) => {
            this.controller.write(Type.Message, message);
        });

        process.on('SIGINT', () => {
            this.onEnd();
            process.exit(1);
        });
    }

    connect(cb?: () => void) {
        this.socket.connect(process.env.PORT || '0', cb);
    }

    private async onConnect() {
        try {
            await this.syn();
            const response: Buffer | Error = await this.ack();
            if (response instanceof Error) {
                throw response.message;
            }
            this.presenter.apply();
        } catch (e) {
            console.log(e.message);
        }
    }

    private async syn() {
        return new Promise<undefined>(resolve => {
            this.controller.write(Type.Init, this.sessionId, () => {
                resolve(undefined);
            });
        });
    }

    private async ack() {
        return new Promise<Buffer | Error>((resolve, reject) => {
            const rejectTimeout = setTimeout(() => reject(new Error('Timeout end')), 5000);

            this.socket.on('data', (data: Buffer) => {
                clearTimeout(rejectTimeout);
                resolve(data);
            });
        });
    }

    private onData(response: Buffer) {
        const message = this.controller.get(response);
        if (message) {
            this.presenter.emit('receiveData', message);
            this.presenter.emit('start');
        }
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
        this.presenter.removeAllListeners();
    }
}

export default ClientService;
