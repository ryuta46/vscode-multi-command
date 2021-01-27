import * as vscode from "vscode";

export class Command {
    constructor(
        private readonly exe: string,
        private readonly args: object | null
    ) {}

    public execute() {
        if (this.args === null) {
            return vscode.commands.executeCommand(this.exe);
        } else {
            return vscode.commands.executeCommand(this.exe, this.args);
        }
    }
}
