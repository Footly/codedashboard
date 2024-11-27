import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

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

				//Get the "widgets" array from the JSON content
				const widgets = jsonContent.widgets;

				//Get the number of widgets
				const widgetCount = widgets.length;

				// Create a webview to display the dashboard
				const panel = vscode.window.createWebviewPanel(
					'dashboard',
					'Dashboard',
					vscode.ViewColumn.One,
					{}
				);

				// Create the HTML content for the dashboard
				let htmlContent = `
				<!DOCTYPE html>
				<html lang="en">
				<head>
					<meta charset="UTF-8">
					<meta http-equiv="X-UA-Compatible" content="IE=edge">
					<meta name="viewport" content="width=device-width, initial-scale=1.0">
					<title>Dashboard</title>
				</head>
				<body>
					<h1>Dashboard</h1>
					<p>Number of widgets: ${widgetCount}</p>
					<ul>
				`;

				// Add each widget to the HTML content
				widgets.forEach((widget: any) => {
					htmlContent += `<li>${widget.name}</li>`;
				});

				htmlContent += `
					</ul>
				</body>
				</html>
				`;

				// Set the HTML content in the webview
				panel.webview.html = htmlContent;

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