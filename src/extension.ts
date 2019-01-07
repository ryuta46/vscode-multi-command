// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {Command} from "./command";
import {MultiCommand} from "./multiCommand";

interface CommandSettings{
    command: string,
    label: string,
    description: string,
    interval: number,
    sequence: Array<string | ComplexCommand>
}

interface ComplexCommand {
    command: string,
    args: object
}

let multiCommands: Array<MultiCommand>;

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
    multiCommands = [];

    for (let commandSettings of commands) {
        const id = commandSettings.command;
        const label = commandSettings.label;
        const description = commandSettings.description;
        const interval = commandSettings.interval;
        const sequence = commandSettings.sequence.map(command => {
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


        const multiCommand = new MultiCommand(id, label, description, interval, sequence);
        multiCommands.push(multiCommand);

        context.subscriptions.push(vscode.commands.registerCommand(id, async () => {
            await multiCommand.execute();
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

    vscode.commands.registerCommand('extension.multiCommand.execute', async () => {
        try {
            await pickMultiCommand();
        }
        catch (e) {
            vscode.window.showErrorMessage(`${e.message}`);
        }
    });

}

// this method is called when your extension is deactivated
export function deactivate() {
}


export async function pickMultiCommand() {
    const picks = multiCommands.map(multiCommand => {
        return {
            label: multiCommand.label || multiCommand.id,
            description: multiCommand.description || "",
            multiCommand: multiCommand
        }
    });

    const item = await vscode.window.showQuickPick(picks, {
        placeHolder: `Select one of the multi commands...`,
    });

    if (!item) {
        return;
    }
    await item.multiCommand.execute();
}

