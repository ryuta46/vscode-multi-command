// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { Command } from "./command";
import { MultiCommand } from "./multiCommand";

interface CommandSettings {
    label: string;
    description: string;
    interval: number;
    sequence: Array<string | ComplexCommand>;
}

interface CommandSettingsWithKey extends CommandSettings {
    command: string;
}

interface CommandMap {
    [key: string]: CommandSettings;
}

interface ComplexCommand {
    command: string;
    args: object;
}

function implementsCommandMap(arg: any): arg is CommandSettings {
    return arg !== null && typeof arg === "object";
}

function createMultiCommand(
    id: string,
    settings: CommandSettings
): MultiCommand {
    const label = settings.label;
    const description = settings.description;
    const interval = settings.interval;
    const sequence = settings.sequence.map((command) => {
        let exe: string;
        let args: object | null;
        if (typeof command === "string") {
            exe = command;
            args = null;
        } else {
            exe = command.command;
            args = command.args;
        }
        return new Command(exe, args);
    });

    return new MultiCommand(id, label, description, interval, sequence);
}

let multiCommands: Array<MultiCommand>;

function refreshUserCommands(context: vscode.ExtensionContext) {
    let configuration = vscode.workspace.getConfiguration("multiCommand");

    let commands = new Map<string, CommandSettings>();

    let commandList =
        configuration.get<Array<CommandSettingsWithKey> | CommandMap>(
            "commands"
        ) || [];

    // Dispose current settings.
    for (let element of context.subscriptions) {
        element.dispose();
    }

    if (Array.isArray(commandList)) {
        for (let commandSettingsWithKey of commandList) {
            commands.set(
                commandSettingsWithKey.command,
                commandSettingsWithKey
            );
        }
    } else if (implementsCommandMap(commandList)) {
        let commandObject = commandList as CommandMap;
        Object.keys(commandObject).forEach((key: string) => {
            commands.set(key, commandObject[key]);
        });
    }
    multiCommands = [];

    commands.forEach((value: CommandSettings, key: string) => {
        const multiCommand = createMultiCommand(key, value);
        multiCommands.push(multiCommand);

        context.subscriptions.push(
            vscode.commands.registerCommand(key, async () => {
                await await multiCommand.execute();
            })
        );
    });
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    refreshUserCommands(context);

    vscode.workspace.onDidChangeConfiguration(() => {
        refreshUserCommands(context);
    });

    vscode.commands.registerCommand(
        "extension.multiCommand.execute",
        async (args = {}) => {
            try {
                if (args.command) {
                    return await vscode.commands.executeCommand(args.command);
                } else if (args.sequence) {
                    const multiCommand = createMultiCommand("", args);
                    return await await multiCommand.execute();
                } else {
                    return await await pickMultiCommand();
                }
            } catch (e) {
                vscode.window.showErrorMessage(`${e.message}`);
            }
        }
    );
}

// this method is called when your extension is deactivated
export function deactivate() {}

export async function pickMultiCommand(): Promise<Thenable<unknown> | undefined> {
    const picks = multiCommands.map((multiCommand) => {
        return {
            label: multiCommand.label || multiCommand.id,
            description: multiCommand.description || "",
            multiCommand: multiCommand,
        };
    });

    const item = await vscode.window.showQuickPick(picks, {
        placeHolder: `Select one of the multi commands...`,
    });

    if (!item) {
        return;
    }
    await item.multiCommand.execute();
}
