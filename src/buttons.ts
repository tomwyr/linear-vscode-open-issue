import * as vscode from "vscode";
import { getCurrentBranchName, onRepoChange } from "./common/git";
import { tryFetchCurrentIssue } from "./common/utils";

let openIssueButton: vscode.StatusBarItem;
let lastBranchName: string | undefined;

export function createOpenIssueButton(): { dispose(): any } {
  const disposeButton = createButton();
  const disposeSyncButton = syncButtonOnIssueChange();

  return {
    dispose: () => {
      disposeButton();
      disposeSyncButton();
    },
  };
}

function createButton() {
  openIssueButton = vscode.window.createStatusBarItem(
    "linear-open-issue.openIssueButton",
    vscode.StatusBarAlignment.Left
  );
  openIssueButton.command = "linear-open-issue.openIssue";
  openIssueButton.name = "Open Issue";
  openIssueButton.tooltip = "Open in Linear";

  return openIssueButton.dispose;
}

// Observes current branch of the Git repo and fetches corresponding Linear
// issue on each change, updating the button with resulting issue data.
function syncButtonOnIssueChange() {
  let repoChangeDisposer: () => any;

  let disposed = false;

  repoChangeDisposer = onRepoChange(async () => {
    const branchName = getCurrentBranchName();
    if (branchName == lastBranchName) return;
    lastBranchName = branchName;

    hideButton();

    if (!branchName) return;

    const issue = await tryFetchCurrentIssue();

    // Return early if the listener was disposed while fetching issue.
    if (disposed) return;

    if (issue) {
      showButton(issue.identifier);
    } else {
      hideButton();
    }
  });

  return () => {
    disposed = true;
    repoChangeDisposer();
  };
}

function showButton(issueIdentifier: string) {
  openIssueButton.text = `$(linear-dark-logo) ${issueIdentifier}`;
  openIssueButton.show();
}

function hideButton() {
  openIssueButton.hide();
  openIssueButton.text = "";
}
