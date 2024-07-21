import { EventEmitter } from 'node:events';
import { IController } from './types';
import { Type, Response } from './types';

class MessageController extends EventEmitter implements IController {
    get(response: Buffer) {
        const json: Response = JSON.parse(response.toString());
        if (json.type === Type.Init) return null;

        return json.message;
    }
    write(type: Type, text: Buffer | string | number, cb?: () => void) {
        const json = JSON.stringify({
            type,
            message: text.toString(),
        });
        this.emit('write', Buffer.from(json), 'utf-8', cb);
    }
}

export default MessageController;
