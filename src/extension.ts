import * as vscode from "vscode";
import { registerOpenIssueCommand } from "./commands";
import { createOpenIssueButton } from "./buttons";

/**
 * This extension registers:
 * - the "Open in Linear" command upon activation.
 * - the "Open Issue" status bar button upon workspace startup.
 */

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(registerOpenIssueCommand());
  context.subscriptions.push(createOpenIssueButton());
}

export function deactivate() {}
