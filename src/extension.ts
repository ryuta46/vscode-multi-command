// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

interface CommandSettings{
    command: string,
    interval: number,
    sequence: Array<string | ComplexCommand>
}

interface ComplexCommand {
    command: string,
    args: object
}

class Command {
    constructor(private readonly exe: string, private readonly args: object | null) {}

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
    let commands = configuration.get<Array<CommandSettings>>("commands");

    // Dispose current settings.
    for (let element of context.subscriptions) {
        element.dispose();
    }

    if (!commands) {
        return;
    }

    for (let commandSettings of commands) {
        let commandName = commandSettings.command;
        let interval = commandSettings.interval;
        let sequence = commandSettings.sequence.map(command => {
            let exe: string;
            let args: object | null;
            if (typeof(command) === "string" ) {
                exe = command;
                args = null;
            } else {
                exe = command.command;
                args = command.args;
            }
            return new Command(exe, args);
        });

        context.subscriptions.push(vscode.commands.registerCommand(commandName, async () => {
            for (let command of sequence) {
                await command.execute();
                await delay(interval);
            }
        }));
    }
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
