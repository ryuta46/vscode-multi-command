import { Command } from "./command";

export class MultiCommand {
    constructor(
        readonly id: string,
        readonly label: string | undefined,
        readonly description: string | undefined,
        readonly interval: number | undefined,
        readonly sequence: Array<Command>
    ) {}

    public async execute(): Promise<Thenable<unknown> | unknown> {
        let lastOutput: Thenable<unknown> | undefined;
        for (let command of this.sequence) {
            lastOutput = command.execute();
            await delay(this.interval || 0);
        }
        
        return lastOutput;
    }
}

function delay(ms: number) {
    if (ms > 0) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
