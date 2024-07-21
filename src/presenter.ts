import EventEmitter from 'node:events';
import readline from 'node:readline';
import { IPresenter } from './types';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
});

class Presenter extends EventEmitter implements IPresenter {
    constructor() {
        super();

        rl.on('close', () => {
            // close readline session when CTRL-C and exit process
            process.emit('SIGINT');
        });

        this.on('receiveData', (data: string) => {
            process.stdout.clearLine(0);
            process.stdout.cursorTo(0);
            console.log(data);
            rl.prompt(true);
        });

        this.once('start', () => {
            this.broadcast();
        });
    }

    private broadcast() {
        rl.on('line', input => {
            process.stdout.moveCursor(0, -1);
            process.stdout.clearLine(1);
            this.emit('message', input);
        });
    }

    apply() {
        rl.question('Take a name > ', name => {
            this.emit('applyName', name);
            rl.prompt(true);
        });
    }
}

export default Presenter;
