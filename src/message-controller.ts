import EventEmitter from 'node:events';
import readline from 'node:readline';
import { Buffer } from 'node:buffer';
import { DataController } from './types';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
});

class MessageController extends EventEmitter implements DataController {
    constructor() {
        super();

        rl.on('close', () => {
            // close readline session when CTRL-C and exit process
            process.emit('SIGINT');
        });

        this.on('receiveData', data => {
            process.stdout.clearLine(0);
            process.stdout.cursorTo(0);
            console.log(data.toString());
            // this.presentChat(data);
            rl.prompt(true);
        });

        rl.on('line', input => {
            process.stdout.moveCursor(0, -1);
            process.stdout.clearLine(1);
            const message = this.presentRequest(input);
            const buffer = Buffer.from(message, 'utf8');
            this.emit('message', buffer);
        });
    }
    apply() {
        rl.question('Take a name > ', name => {
            const message = this.presentRequest(name);
            const buffer = Buffer.from(message, 'utf8');
            this.emit('message', buffer);
            rl.prompt(true);
        });
    }

    presentRequest(name: string) {
        return JSON.stringify({
            name,
        });
    }

    presentChat(response: Buffer) {
        const data = JSON.parse(response.toString());
        if (data.message !== '') {
            console.log(`[${data.name}]: ${data.message}`);
        } else {
            console.log(`${data.name} has joined chat`);
        }
    }
}

export default MessageController;
