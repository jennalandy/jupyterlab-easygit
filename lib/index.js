"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mainmenu_1 = require("@jupyterlab/mainmenu");
const notebook_1 = require("@jupyterlab/notebook");
const apputils_1 = require("@jupyterlab/apputils");
const buttonStyle_1 = require("./buttonStyle");
const apputils_2 = require("@jupyterlab/apputils");
require("../style/variables.css");
const React = require("react");
const services_1 = require("@jupyterlab/services");
const coreutils_1 = require("@jupyterlab/coreutils");
const plugin = {
    id: 'jupyterlab-easygit:plugin',
    requires: [mainmenu_1.IMainMenu, notebook_1.INotebookTracker, apputils_1.ICommandPalette],
    activate: (app, menu, tracker, palette) => {
        console.log(9);
        /** Create command, add to palette and menu */
        const command = 'easygit:store-version';
        app.commands.addCommand(command, {
            label: 'Store Version',
            execute: () => __awaiter(this, void 0, void 0, function* () {
                console.log('that was easy (git)');
                app.commands.execute('docmanager:save');
                let value = '';
                var textBox = React.createElement('input', {
                    onChange: (event) => {
                        value = event.currentTarget.value;
                    },
                    className: 'input',
                    placeholder: 'What have you changed?'
                });
                apputils_2.showDialog({
                    title: 'Store Version',
                    body: textBox,
                    buttons: [
                        apputils_2.Dialog.cancelButton(),
                        apputils_2.Dialog.okButton({
                            label: 'STORE'
                        })
                    ],
                }).then((result) => __awaiter(this, void 0, void 0, function* () {
                    if (result.button.accept) {
                        console.log('storing!');
                        console.log(value);
                        let repoPath = yield gitRefresh(app.shell.widgets('left'));
                        storeVersion(value, tracker.currentWidget.context.path, repoPath);
                    }
                }));
            })
        });
        palette.addItem({ command, category: 'Aaaa' });
        menu.fileMenu.addGroup([{ command: command }], 14);
        /** If in a notebook, add button to toolbar
         *  update when moving between notebooks **/
        if (hasNotebook()) {
            addButton();
        }
        tracker.currentChanged.connect(tracker => {
            if (hasNotebook()) {
                addButton();
            }
        });
        function hasNotebook() {
            return (tracker.currentWidget !== null);
        }
        function addButton() {
            let notebookPanel = tracker.currentWidget;
            if (notebookPanel) {
                let button = new apputils_1.ToolbarButton({
                    iconClassName: buttonStyle_1.iconStyle + ' jp-Icon jp-Icon-16 jp-ToolbarButtonComponent-icon',
                    onClick: () => {
                        app.commands.execute(command);
                    },
                    tooltip: 'Store Version'
                });
                notebookPanel.toolbar.insertItem(1, app.commands.label(command), button);
            }
        }
    },
    autoStart: true
};
function gitRefresh(leftSidebarItems) {
    return __awaiter(this, void 0, void 0, function* () {
        let fileBrowser = leftSidebarItems.next();
        while (fileBrowser && fileBrowser.id !== 'filebrowser') {
            fileBrowser = leftSidebarItems.next();
        }
        // If fileBrowser has loaded, make API request
        if (fileBrowser) {
            // Make API call to get all git info for repo
            let apiResult = yield allHistory(fileBrowser.model.path);
            if (apiResult['code'] === 0) {
                // Get top level path of repo
                let topLevel = apiResult['data']['show_top_level']['top_repo_path'];
                console.log(topLevel);
                return topLevel;
            }
        }
    });
}
function httpGitRequest(url, method, request) {
    let fullRequest = {
        method: method,
        body: JSON.stringify(request)
    };
    let setting = services_1.ServerConnection.makeSettings();
    let fullUrl = coreutils_1.URLExt.join(setting.baseUrl, url);
    return services_1.ServerConnection.makeRequest(fullUrl, fullRequest, setting);
}
/** Make request for all git info of repository 'path' */
function allHistory(path) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let response = yield httpGitRequest('/git/all_history', 'POST', {
                current_path: path
            });
            if (response.status !== 200) {
                return response.text().then(data => {
                    throw new services_1.ServerConnection.ResponseError(response, data);
                });
            }
            return response.json();
        }
        catch (err) {
            throw services_1.ServerConnection.NetworkError;
        }
    });
}
/** Make request to commit all staged files in repository 'path' */
function storeVersion(message, fileName, repoPath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(message, fileName, repoPath);
            let addResponse = yield httpGitRequest('/git/add', 'POST', {
                add_all: true,
                filename: fileName,
                top_repo_path: repoPath
            });
            let commitResponse = yield httpGitRequest('/git/commit', 'POST', {
                commit_msg: message,
                top_repo_path: repoPath
            });
            if (addResponse.status !== 200 || commitResponse.status !== 200) {
                return commitResponse.json().then((data) => {
                    throw new services_1.ServerConnection.ResponseError(commitResponse, data.message);
                });
            }
            return commitResponse;
        }
        catch (err) {
            throw services_1.ServerConnection.NetworkError;
        }
    });
}
exports.default = plugin;
