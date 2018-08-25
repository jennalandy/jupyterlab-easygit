"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mainmenu_1 = require("@jupyterlab/mainmenu");
const notebook_1 = require("@jupyterlab/notebook");
const apputils_1 = require("@jupyterlab/apputils");
const buttonStyle_1 = require("./buttonStyle");
const apputils_2 = require("@jupyterlab/apputils");
require("../style/variables.css");
const React = require("react");
const plugin = {
    id: 'jupyterlab-easygit:plugin',
    requires: [mainmenu_1.IMainMenu, notebook_1.INotebookTracker, apputils_1.ICommandPalette],
    activate: (app, menu, tracker, palette) => {
        console.log(7);
        /** Create command, add to palette and menu */
        const command = 'easygit:store-version';
        app.commands.addCommand(command, {
            label: 'Store Version',
            execute: () => {
                console.log('that was easy (git)');
                let value = '';
                var textBox = React.createElement('input', {
                    onChange: (event) => { value = event.currentTarget.value; },
                    className: 'input'
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
                    focusNodeSelector: '.input'
                }).then(result => {
                    if (result.button.accept) {
                        console.log('storing!');
                        console.log(value);
                    }
                });
            }
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
exports.default = plugin;
