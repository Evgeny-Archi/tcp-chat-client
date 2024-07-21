import { EventEmitter } from 'node:events';

export interface IPresenter extends EventEmitter {
    apply(): void;
}

export type Presenter = new () => IPresenter;

export interface IController extends EventEmitter {
    get(response: Buffer): string | null;
    write(type: Type, text: string | number, cb?: () => void): void;
}

export type Controller = new () => IController;

export enum Type {
    Init = 'init',
    Greeting = 'greeting',
    Message = 'message',
}

export interface Response {
    type: Type;
    message: string;
}
