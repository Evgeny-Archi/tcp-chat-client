import { EventEmitter } from 'node:events';

export interface DataController extends EventEmitter {
    apply(): void;
}

export type Controller = new () => DataController;

export interface IClient {
    syn(): void;
    ack(): void;
}

export interface SYN {
    type: 'SYN';
    sessionId: string;
}
