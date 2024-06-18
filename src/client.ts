import net, { Socket } from 'node:net';
import readline from 'node:readline';
import { Buffer } from 'node:buffer';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
});

class Client {
    private name: string;
    constructor() {
        this.name;
    }
    connect(port: string) {
        const client = net.connect(port);
        this.broadcast(client);
    }
    private broadcast(socket: Socket) {
        rl.question('Take a name > ', input => {
            this.name = input;
            socket.write(this.presentRequest());

            rl.prompt(true);
        });

        rl.on('line', input => {
            process.stdout.moveCursor(0, -1);
            process.stdout.clearLine(1);
            socket.write(this.presentRequest(input));
        });

        socket.on('data', stream => {
            process.stdout.clearLine(0);
            process.stdout.cursorTo(0);
            this.presentChat(stream);
            rl.prompt(true);
        });

        socket.on('close', () => {
            console.log('System: Server shoot down');
        });
    }
    private presentRequest(text?: string) {
        return JSON.stringify({
            name: this.name,
            message: text || '',
        });
    }
    private presentChat(response: Buffer) {
        const data = JSON.parse(response.toString());
        if (data.message !== '') {
            console.log(`[${data.name}]: ${data.message}`);
        } else {
            console.log(`${data.name} has joined chat`);
        }
    }
}

export default Client;
