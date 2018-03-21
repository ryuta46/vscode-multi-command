'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Disposable } from 'vscode';

class Command {
    private exe: string
    private args: any

    constructor(commandText: string | object) {
        if (typeof(commandText) === 'string') {
            this.exe = commandText
            this.args = null
        } else {
            this.exe = commandText['command']
            this.args = commandText['args']
        }
    }

    public execute() {
        if (this.args === null) {
            return vscode.commands.executeCommand(this.exe)
        } else {
            return vscode.commands.executeCommand(this.exe, this.args)
        }
    }
}

function refreshUserCommands(context: vscode.ExtensionContext) {
    let configuration = vscode.workspace.getConfiguration("multiCommand");
    let commands = configuration.get<Array<object>>("commands");
    
    // Dispose current settings.
    var element: Disposable = null;
    while((element = context.subscriptions.pop()) != null){
        element.dispose();
    }
    
    commands.forEach((value: object) => {
        let command: string = value["command"];
        let interval: number = value["interval"];
        let sequence: Array<Command> = (value["sequence"] as Array<string | object>).map(
            commandText => new Command(commandText))

        sequence = sequence.reverse();

        context.subscriptions.push(vscode.commands.registerCommand(command, () => {
            let executeCommandFunctions: Array<Function> = []
            sequence.forEach((oneCommand: Command, index: number) => {
                if (index == 0) {
                    executeCommandFunctions.push(() => {
                        oneCommand.execute();
                    });
                } else {
                    executeCommandFunctions.push(() => {
                        oneCommand.execute().then(async () => {
                            if (interval !== null) {
                                await delay(interval);
                            }
                            executeCommandFunctions[index - 1]();
                        });
                    });
                }
            });
            executeCommandFunctions[sequence.length - 1]();
        }));
    });
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    refreshUserCommands(context);

    vscode.workspace.onDidChangeConfiguration(() => {
        refreshUserCommands(context);
    });
}

// this method is called when your extension is deactivated
export function deactivate() {
}

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
