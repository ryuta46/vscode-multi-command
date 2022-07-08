import * as vscode from "vscode";

const vscodeVariables = require('vscode-variables');

export class Command {
    constructor(
        private readonly exe: string,
        private readonly args: object | null,
        private readonly variableSubstitution: boolean
    ) {}

    public execute() {
        if (this.args === null) {
            return vscode.commands.executeCommand(this.exe);
        } else {
            if (this.variableSubstitution) {
                return vscode.commands.executeCommand(this.exe, this.substituteVariables(this.args));
            } else {
                return vscode.commands.executeCommand(this.exe, this.args);
            }
            
        }
    }

    private substituteVariables(args: any ): any {
        if (typeof args === 'string') {
            args = args.replace(/\${userHome}/g, process.env['HOME'] || '');
            return vscodeVariables(args);
        } else if (typeof args === 'object') {
            let rt: any = {};
            for(const key of Object.keys(args)) {
                rt[key] = this.substituteVariables(args[key]);
            }
            return rt;
        } else {
            return args;
        }
    }
    
}
