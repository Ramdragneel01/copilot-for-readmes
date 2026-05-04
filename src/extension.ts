import path from "node:path";

import * as vscode from "vscode";

import { generateReadme } from "./generate";

export function activate(context: vscode.ExtensionContext): void {
    const disposable = vscode.commands.registerCommand("copilotForReadmes.generateReadme", async () => {
        const folder = vscode.workspace.workspaceFolders?.[0];
        if (!folder) {
            vscode.window.showErrorMessage("Open a workspace folder to generate a README.");
            return;
        }

        await vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: "Generating README",
                cancellable: false
            },
            async () => {
                try {
                    const result = await generateReadme(folder.uri.fsPath);
                    const outputName = result.signals.readmeExists ? "README.generated.md" : "README.md";
                    const outputPath = path.join(folder.uri.fsPath, outputName);
                    const uri = vscode.Uri.file(outputPath);

                    await vscode.workspace.fs.writeFile(uri, Buffer.from(result.markdown, "utf8"));
                    const doc = await vscode.workspace.openTextDocument(uri);
                    await vscode.window.showTextDocument(doc, { preview: false });

                    vscode.window.showInformationMessage(`Generated ${outputName}`);
                } catch (error) {
                    vscode.window.showErrorMessage(`README generation failed: ${(error as Error).message}`);
                }
            }
        );
    });

    context.subscriptions.push(disposable);
}

export function deactivate(): void {
    // no-op
}
