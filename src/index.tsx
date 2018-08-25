import { JupyterLab, JupyterLabPlugin } from '@jupyterlab/application';
import { IMainMenu } from '@jupyterlab/mainmenu';
import { INotebookTracker } from '@jupyterlab/notebook';
import { ICommandPalette, ToolbarButton } from '@jupyterlab/apputils';
import { iconStyle } from './buttonStyle'
import { showDialog, Dialog } from '@jupyterlab/apputils'
import '../style/variables.css'
import * as React from 'react';
import { ServerConnection } from '@jupyterlab/services';
import { URLExt } from '@jupyterlab/coreutils';

export interface GitShowTopLevelResult {
  code: number;
  top_repo_path?: string;
}

const plugin: JupyterLabPlugin<void> = {
  id: 'jupyterlab-easygit:plugin',
  requires: [ IMainMenu, INotebookTracker, ICommandPalette],
  activate: (
    app: JupyterLab,
    menu: IMainMenu,
    tracker: INotebookTracker,
    palette: ICommandPalette
  ): void => {
    console.log(7)

    /** Create command, add to palette and menu */
    const command: string = 'easygit:store-version';
    app.commands.addCommand(command, {
      label: 'Store Version',
      execute: async () => {
        console.log('that was easy (git)')
        let value = ''
        var textBox = React.createElement(
          'input', 
          {
            onChange: (event) => {
              value = event.currentTarget.value
            },
            className: 'input'
          }
        )
        showDialog({
          title: 'Store Version',
          body: textBox,
          buttons: [
            Dialog.cancelButton(),
            Dialog.okButton({
              label: 'STORE'
            })
          ],
        }).then(result => {
          if (result.button.accept) {
            console.log('storing!')
            console.log(value)
            let repoPath = await gitRefresh(app.shell.widgets('left'));
            storeVersion(
              value,
              tracker.currentWidget.context.path,
              repoPath
            );
          }
        })
      }
    })
    palette.addItem({command, category: 'Aaaa'})
    menu.fileMenu.addGroup([{command: command}], 14)

    /** If in a notebook, add button to toolbar
     *  update when moving between notebooks **/
    if (hasNotebook()){
      addButton()
    }
    tracker.currentChanged.connect(tracker => {
      if (hasNotebook()){
        addButton()
      }
    })

    function hasNotebook(): boolean {
      return (
        tracker.currentWidget !== null
      );
    }

    function addButton(): void {
      let notebookPanel = tracker.currentWidget;
      if (notebookPanel) {
        let button: ToolbarButton = new ToolbarButton({
          iconClassName: iconStyle + ' jp-Icon jp-Icon-16 jp-ToolbarButtonComponent-icon',
          onClick: () => {
            app.commands.execute(command);
          },
          tooltip: 'Store Version'
        });
        notebookPanel.toolbar.insertItem(1,  app.commands.label(command), button)
      }
    }
    
  },
  autoStart: true
}

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

export default plugin;
