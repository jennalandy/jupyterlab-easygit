import { JupyterLab, JupyterLabPlugin } from '@jupyterlab/application';
import { INotebookTracker } from '@jupyterlab/notebook';
import { ICommandPalette } from '@jupyterlab/apputils';
import { ServerConnection } from '@jupyterlab/services';
import { URLExt } from '@jupyterlab/coreutils';

export interface GitShowTopLevelResult {
  code: number;
  top_repo_path?: string;
}

const plugin: JupyterLabPlugin<void> = {
  id: 'jupyterlab-easygit',
  requires: [INotebookTracker, ICommandPalette],
  activate: (
    app: JupyterLab,
    tracker: INotebookTracker,
    palette: ICommandPalette
  ): void => {
    const command: string = 'easygit:store-verison';

    app.commands.addCommand(command, {
      label: 'Store Version',
      execute: async () => {
        let repoPath = await gitRefresh(app.shell.widgets('left'));
        storeVersion(
          `Storing version of ${tracker.currentWidget.context.path}`,
          tracker.currentWidget.context.path,
          repoPath
        );
      }
    });

    palette.addItem({ command, category: 'AAA' });
  },
  autoStart: true
};

async function gitRefresh(leftSidebarItems: any) {
  let fileBrowser = leftSidebarItems.next();
  while (fileBrowser && fileBrowser.id !== 'filebrowser') {
    fileBrowser = leftSidebarItems.next();
  }
  // If fileBrowser has loaded, make API request
  if (fileBrowser) {
    // Make API call to get all git info for repo
    let apiResult = await allHistory((fileBrowser as any).model.path);

    if (apiResult['code'] === 0) {
      // Get top level path of repo
      let topLevel = apiResult['data']['show_top_level']['top_repo_path'];
      console.log(topLevel);
      return topLevel;
    }
  }
}
function httpGitRequest(
  url: string,
  method: string,
  request: Object
): Promise<Response> {
  let fullRequest = {
    method: method,
    body: JSON.stringify(request)
  };

  let setting = ServerConnection.makeSettings();
  let fullUrl = URLExt.join(setting.baseUrl, url);
  return ServerConnection.makeRequest(fullUrl, fullRequest, setting);
}

/** Make request for all git info of repository 'path' */
async function allHistory(path: string) {
  try {
    let response = await httpGitRequest('/git/all_history', 'POST', {
      current_path: path
    });
    if (response.status !== 200) {
      return response.text().then(data => {
        throw new ServerConnection.ResponseError(response, data);
      });
    }
    return response.json();
  } catch (err) {
    throw ServerConnection.NetworkError;
  }
}

/** Make request to commit all staged files in repository 'path' */
async function storeVersion(
  message: string,
  fileName: string,
  repoPath: string
): Promise<Response> {
  try {
    console.log(message, fileName, repoPath);
    let addResponse = await httpGitRequest('/git/add', 'POST', {
      add_all: true,
      filename: fileName,
      top_repo_path: repoPath
    });
    let commitResponse = await httpGitRequest('/git/commit', 'POST', {
      commit_msg: message,
      top_repo_path: repoPath
    });
    if (addResponse.status !== 200 || commitResponse.status !== 200) {
      return commitResponse.json().then((data: any) => {
        throw new ServerConnection.ResponseError(commitResponse, data.message);
      });
    }
    return commitResponse;
  } catch (err) {
    throw ServerConnection.NetworkError;
  }
}

export default plugin;
