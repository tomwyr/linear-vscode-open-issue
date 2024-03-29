import { LinearClient } from "@linear/sdk";
import * as vscode from "vscode";

export type Issue = {
  identifier: string;
  team: {
    organization: {
      urlKey: string;
    };
  };
};

export async function fetchIssue(branchName: string) {
  const client = await createLinearClient();
  if (!client) return;

  const request: {
    issueVcsBranchSearch: Issue | null;
  } | null = await client.request(`query {
      issueVcsBranchSearch(branchName: "${branchName}") {
        identifier
        team {
          organization {
            urlKey
          }
        }
      }
    }`);

  const issue = request?.issueVcsBranchSearch;

  if (!issue) {
    vscode.window.showInformationMessage(
      `No Linear issue could be found matching the branch name ${branchName} in the authenticated workspace.`
    );
  }

  return issue;
}

async function createLinearClient() {
  const LINEAR_AUTHENTICATION_PROVIDER_ID = "linear";
  const LINEAR_AUTHENTICATION_SCOPES = ["read"];

  const session = await vscode.authentication.getSession(
    LINEAR_AUTHENTICATION_PROVIDER_ID,
    LINEAR_AUTHENTICATION_SCOPES,
    { createIfNone: true }
  );

  if (!session) {
    vscode.window.showErrorMessage(
      `We weren't able to log you into Linear when trying to open the issue.`
    );
    return;
  }

  const linearClient = new LinearClient({
    accessToken: session.accessToken,
  });

  return linearClient.client;
}
