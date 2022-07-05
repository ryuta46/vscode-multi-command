import * as vscode from "vscode";

const vscodeVariables = require('vscode-variables');

export class Command {
    constructor(
        private readonly exe: string,
        private readonly args: object | null
    ) {}

    public execute() {
        if (this.args === null) {
            return vscode.commands.executeCommand(this.exe);
        } else {
            return vscode.commands.executeCommand(this.exe, this.resolveVariables(this.args));
        }
    }

    private resolveVariables(args: any ): any {
        if (typeof args === 'string') {
            return vscodeVariables(args);
        } else if (typeof args === 'object') {
            let rt: any = {};
            for(const key of Object.keys(args)) {
                rt[key] = this.resolveVariables(args[key]);
            }
            return rt;
        } else {
            return args;
        }
    }
    
}
