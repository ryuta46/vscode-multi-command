import {Command} from "./command";


export class MultiCommand {
    constructor(readonly id: string, readonly interval: number, readonly sequence: Array<Command>) {}

    public async execute() {
        for (let command of this.sequence) {
            await command.execute();
            await delay(this.interval);
        }
    }
}

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
