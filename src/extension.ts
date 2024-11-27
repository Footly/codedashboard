import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { Webview, WebviewPanelConstructor } from './Webview';

export function activate(context: vscode.ExtensionContext) {

	// Register the new command
	const createDashboardFromSelected = vscode.commands.registerCommand('codedashboard.createDashboardFromSelected', async () => {

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

				// Create a new Webview instance
				const webview = new Webview({
					extensionPath: context.extensionPath,
					jsonContent: JSON.stringify(jsonContent)
				});

				// Show the Webview
				webview.show();

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

	context.subscriptions.push(createDashboardFromSelected);
}

export function deactivate() { }