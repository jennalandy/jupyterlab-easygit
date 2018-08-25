import { JupyterLab, JupyterLabPlugin } from '@jupyterlab/application';
import { IMainMenu } from '@jupyterlab/mainmenu';
import { INotebookTracker } from '@jupyterlab/notebook';
import { ICommandPalette, ToolbarButton } from '@jupyterlab/apputils';
import { iconStyle } from './buttonStyle'
import { showDialog, Dialog } from '@jupyterlab/apputils'
import '../style/variables.css'
import * as React from 'react';


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
      execute: () => {
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

export default plugin;