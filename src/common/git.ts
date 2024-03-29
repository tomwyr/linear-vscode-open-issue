import * as vscode from "vscode";
import { GitExtension, Repository } from "../types.d/git";

export function getCurrentBranchName() {
  // Use VS Code's built-in Git extension API to get the current branch name.
  const git = getGitExtension()?.exports?.getAPI(1);
  const branchName = git?.repositories[0]?.state.HEAD?.name;

  if (!branchName) {
    vscode.window.showErrorMessage(
      `The current branch name could not be determined.`
    );
  }

  return branchName;
}

export function onRepoChange(listener: () => any) {
  let repoOpenDisposer: (() => any) | undefined;
  let repoCloseDisposer: (() => any) | undefined;
  let repoChangeDisposer: (() => any) | undefined;

  let disposed = false;

  const listenRepoChangeAsync = async () => {
    let activeRepo: Repository | undefined;

    // Get reference to Git extension or break execution, if it's not available
    // or it wasn't activated within expected time.
    const gitExtension = await initGitExtension();

    // Return early if the listener was disposed while initializing Git extension.
    if (disposed) return;

    if (!gitExtension) {
      vscode.window.showErrorMessage(
        `Git extension could not be found in the workspace.`
      );
      return;
    }

    const onRepoOpen = (repository: Repository) => {
      if (activeRepo) return;
      activeRepo = repository;
      // Call listener on each repository change until disposed.
      repoChangeDisposer = repository.state.onDidChange(listener).dispose;
      listener();
    };

    const onRepoClose = (repository: Repository) => {
      if (activeRepo != repository) return;
      activeRepo = undefined;
      repoChangeDisposer?.();
    };

    const gitApi = gitExtension.exports.getAPI(1);
    if (gitApi.repositories.length > 0) {
      onRepoOpen(gitApi.repositories[0]);
    }
    repoOpenDisposer = gitApi.onDidOpenRepository(onRepoOpen).dispose;
    repoCloseDisposer = gitApi.onDidCloseRepository(onRepoClose).dispose;
  };

  // Listen asynchronously in order to return the disposer synchronously.
  listenRepoChangeAsync();

  return () => {
    disposed = true;
    repoOpenDisposer?.();
    repoCloseDisposer?.();
    repoChangeDisposer?.();
  };
}

async function initGitExtension() {
  const gitExtension = getGitExtension();
  if (!gitExtension) return;

  // Wait for 10s for the extension activation.
  const maxAttempts = 20;
  const retryDelayMillis = 500;

  let attempts = 0;
  while (!gitExtension.isActive && attempts != maxAttempts) {
    attempts++;
    await new Promise((resolve) => setTimeout(resolve, retryDelayMillis));
  }

  if (!gitExtension.isActive) return;

  return gitExtension;
}

function getGitExtension() {
  return vscode.extensions.getExtension<GitExtension>("vscode.git");
}
