import * as vscode from "vscode";
import { getCurrentBranchName } from "./git";
import { fetchIssue } from "./linear";

export async function tryFetchCurrentIssue() {
  // Fetches Linear issue based on the current Git branch name.
  const branchName = getCurrentBranchName();
  if (!branchName) return;

  try {
    return await fetchIssue(branchName);
  } catch (error) {
    vscode.window.showErrorMessage(
      `An error occurred while trying to fetch Linear issue information. Error: ${error}`
    );
  }
}
