'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Disposable } from 'vscode';

function refreshUserCommands(context: vscode.ExtensionContext) {
    let configuration = vscode.workspace.getConfiguration("multiCommand");
    let commands = configuration.get<Array<Object>>("commands");
    
    // Dispose current settings.
    var element: Disposable = null;
    while((element = context.subscriptions.pop()) != null){
        element.dispose();
    }
    
    commands.forEach((value: Object) => {
        let command:string = value["command"];
        let interval:number = value["interval"];
        let invoke:Array<string> = value["sequence"];
        invoke = invoke.reverse();

        context.subscriptions.push(vscode.commands.registerCommand(command, () => {
            let executeCommandFunctions: Array<Function> = []
            invoke.forEach((oneCommand: string, index: number) => {
                if (index == 0) {
                    executeCommandFunctions.push(() => {
                        vscode.commands.executeCommand(oneCommand);
                    });
                } else {
                    executeCommandFunctions.push(() => {
                        vscode.commands.executeCommand(oneCommand).then(async () => {
                            if (interval !== null) {
                                await delay(interval);
                            }
                            executeCommandFunctions[index - 1]();
                        });
                    });
                }
            });
            executeCommandFunctions[invoke.length - 1]();
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
