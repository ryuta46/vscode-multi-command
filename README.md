# multi-command README

This extension can create command sequence as one command and bind a key.

## Features

* create command sequence as one command and bind a key.
* set interval between each command execution.

## Extension Settings

Settings has 2 steps.

1. Create command sequence as one command in settings.json.  
    For example:
    ```json:settings.json
    "multiCommand.commands": [
        {
            "command": "multiCommand.down3Lines",
            "sequence": [
                "cursorDown",
                "cursorDown",
                "cursorDown"
            ]
        },
        {
            "command": "multiCommand.swapChar",
            "interval": 30,
            "sequence": [
                "cursorLeftSelect",
                "editor.action.clipboardCutAction",
                "cursorRight",
                "editor.action.clipboardPasteAction"
            ]
        }
    ]
    ```
    First sequence is named "multiCommand.down3Lines" and executes "cursorDown" command 3 times.

    Second sequence is named "multiCommand.swapChar". This sequence swaps cursor's left character and the right character. If a command is executed asynchronousely, you can set time interval between each command execution using "interval" configuration(milliseconds).

2. Bind a key to created command sequence in keybindings.json.  
    For example:
    ```json:keybindings.json
    { "key": "F1", "command": "multiCommand.down3Lines", "when": "editorTextFocus"},
    { "key": "F2", "command": "multiCommand.swapChar", "when": "editorTextFocus"}
    ```

## Release Notes

### 1.1.0

Reload settings.json when the file is changed.  
Now, you can use a custom multi-command immediately after adding it in the settings.json without restarting vscode.

### 1.0.0

Initial release.

