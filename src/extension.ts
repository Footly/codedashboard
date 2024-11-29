// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { join } from 'path';
import * as vscode from 'vscode';
import { ExtensionContext, ExtensionMode, Uri, Webview } from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
import { MessageHandlerData } from '@estruyf/vscode';

function getNonce(): string {
	let text: string = "";
	const possible: string =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('codedashboard.openWebview', () => {
		const panel = vscode.window.createWebviewPanel(
			'codedashboardWebview',
			'Code Dashboard',
			vscode.ViewColumn.One,
			{
				enableScripts: true,
				retainContextWhenHidden: true
			}
		);

		panel.webview.onDidReceiveMessage(message => {
			const { command, requestId, payload } = message;

			if (command === "GET_DATA") {
				// Do something with the payload
				// Send a response back to the webview
				panel.webview.postMessage({
					command,
					requestId, // The requestId is used to identify the response
					payload: `Hello from the extension!`
				} as MessageHandlerData<string>);
			} else if (command === "GET_DATA_ERROR") {
				panel.webview.postMessage({
					command,
					requestId, // The requestId is used to identify the response
					error: `Oops, something went wrong!`
				} as MessageHandlerData<string>);
			} else if (command === "POST_DATA") {
				vscode.window.showInformationMessage(`Received data from the webview: ${payload.msg}`);
			}
		}, undefined, context.subscriptions);

		panel.webview.html = getWebviewContent(context, panel.webview);
	});

	// Register the new command
	const openDashboardWith = vscode.commands.registerCommand('codedashboard.openDashboardWith', async () => {

		// Get the active text editor
		const editor = vscode.window.activeTextEditor;

		if (!editor) {
			vscode.window.showErrorMessage('No active editor found');
			return;
		}

		const filePath = editor.document.uri.fsPath;
		// Ensure the selected file is a .dash.json file
		if (filePath.endsWith('.dash.json')) {
			// Proceed with the logic for creating the dashboard from this file

			// Read the .dash.json file (or perform other operations based on the file)
			try {
				const data = fs.readFileSync(filePath, 'utf-8');
				const jsonContent = JSON.parse(data);

				const panel = vscode.window.createWebviewPanel(
					'codedashboardWebview',
					'Code Dashboard',
					vscode.ViewColumn.One,
					{
						enableScripts: true,
						retainContextWhenHidden: true
					}
				);

				panel.webview.onDidReceiveMessage(async (message) => {
					const { command, requestId, payload } = message;

					if (command === "REQUEST") {
						const backend = payload.widget.backend;

						interface Message {
							command: string;
							requestId: string;
							payload: any;
						}

						interface WidgetPayload {
							widget: {
								backend: string;
							};
						}

						const {stdout} = await exec(backend);
						const cloneWidget = { ...payload.widget };
						// Set the cloneWidget value to the stdout
						cloneWidget.value = stdout;

						const data: Message = {
							command: "UPDATE",
							requestId,
							payload: {
								widget: cloneWidget,
							},
						};
						// Optionally, show the result in VS Code UI
						vscode.window.showInformationMessage(`Command executed successfully: ${stdout}`);
						panel.webview.postMessage(data);
					}
				}, undefined, context.subscriptions);

				//Check if "widgets" key exists in the JSON content
				if (!jsonContent.widgets) {
					vscode.window.showErrorMessage('The .dash.json file does not contain a "widgets" key.');
					return;
				}

				//Iterate over the widgets and create the dashboard
				for (const widget of jsonContent.widgets) {
					//Send a message to the webview with the widget data
					panel.webview.postMessage({
						command: 'ADD_WIDGET',
						payload: widget
					});
				}

				panel.webview.html = getWebviewContent(context, panel.webview);

				// Perform further logic to create a dashboard, such as opening a UI, etc.
				vscode.window.showInformationMessage(`Dashboard created from ${path.basename(filePath)}`);

			} catch (err) {
				if (err instanceof Error) {
					vscode.window.showErrorMessage('Error reading .dash.json file: ' + err.message);
				} else {
					vscode.window.showErrorMessage('An unknown error occurred.');
				}
			}
		} else {
			vscode.window.showErrorMessage('The selected file is not a .dash.json file.');
		}
	});

	context.subscriptions.push(openDashboardWith);
	context.subscriptions.push(disposable);

}

// this method is called when your extension is deactivated
export function deactivate() { }


const getWebviewContent = (context: ExtensionContext, webview: Webview) => {
	const scriptPath = Uri.file(join(context.extensionPath, 'out', 'main.wv.js'));
	const scriptUri = webview.asWebviewUri(scriptPath);

	const cssPath = Uri.file(join(context.extensionPath, 'src', 'media', 'styles.css'));
	const cssUri = webview.asWebviewUri(cssPath);

	const nonce = getNonce();

	return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Panel Title Goes Here</title>
        <link rel="stylesheet" href="${cssUri}">
      </head>
      <body>
        <div id="root"></div>
        <script nonce="${nonce}" src="${scriptUri}"></script>
      </body>
      </html>
    `;
};
