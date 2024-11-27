import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

//Create a interface for the webview panel constructor
export interface WebviewPanelConstructor {
	extensionPath: string;
	jsonContent: string;
}

//Create a class which basically creates a webview panel
export class Webview {
	private _panel: vscode.WebviewPanel | undefined;
	private _webviewPanelConstructor: WebviewPanelConstructor;

	constructor(webview: WebviewPanelConstructor) {
		this._webviewPanelConstructor = webview;
	}

	public show(): void {
		if (this._panel) {
			this._panel.reveal();
		} else {
			this._panel = vscode.window.createWebviewPanel(
				'codeDashboardWebview',
				'Code Dashboard',
				vscode.ViewColumn.One,
				{
					enableScripts: true,
					retainContextWhenHidden: true
				}
			);

			const webview = this._panel.webview;

			const indexPath = vscode.Uri.file(path.join(this._webviewPanelConstructor.extensionPath, 'resources', 'webview', 'media', 'index.html'));
			let html = fs.readFileSync(indexPath.fsPath, 'utf8');

			const styleCss = webview.asWebviewUri(vscode.Uri.joinPath(vscode.Uri.file(this._webviewPanelConstructor.extensionPath), 'resources', 'webview', 'media', 'style.css'));
			const indexJs = webview.asWebviewUri(vscode.Uri.joinPath(vscode.Uri.file(this._webviewPanelConstructor.extensionPath), 'resources', 'webview', 'media', 'index.js'));

			html = html.replace('style.css', styleCss.toString());
      html = html.replace('index.js', indexJs.toString());


			this._panel.webview.html = html;
			this._panel.onDidDispose(() => {
				this._panel = undefined;
			});
		}
	}
}