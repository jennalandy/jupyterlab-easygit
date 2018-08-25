import { JupyterLab, JupyterLabPlugin } from '@jupyterlab/application';

const plugin: JupyterLabPlugin<void> = {
  id: 'jupyterlab-easygit:plugin',
  requires: [],
  activate: (app: JupyterLab): void => {
    const command: string = 'easygit:store-verison';

    app.commands.addCommand(command, {
      label: 'Store Version',
      execute: () => {
      }
    });
  }
};

export default plugin;
