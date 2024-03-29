import * as vscode from "vscode";
import { tryFetchCurrentIssue } from "./common/utils";

export function registerOpenIssueCommand() {
  return vscode.commands.registerCommand(
    "linear-open-issue.openIssue",
    async () => {
      const issue = await tryFetchCurrentIssue();
      if (!issue) return;

      // Preference to open the issue in the desktop app or in the browser.
      const urlPrefix = vscode.workspace
        .getConfiguration()
        .get<boolean>("openInDesktopApp")
        ? "linear://"
        : "https://linear.app/";

      // Open the URL.
      vscode.env.openExternal(
        vscode.Uri.parse(
          urlPrefix +
            issue.team.organization.urlKey +
            "/issue/" +
            issue.identifier
        )
      );
    }
  );
}
