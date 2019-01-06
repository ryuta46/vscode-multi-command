import {Command} from "./command";


export class MultiCommand {
    constructor(readonly id: string,
                readonly label: string | undefined,
                readonly description: string | undefined,
                readonly interval: number | undefined,
                readonly sequence: Array<Command>) {}

    public async execute() {
        for (let command of this.sequence) {
            await command.execute();
            await delay(this.interval || 0);
        }
    }
}

function delay(ms: number) {
    if (ms > 0) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
