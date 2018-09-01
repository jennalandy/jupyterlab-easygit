# jupyterlab-easygit

A JupyterLab extension enabling non-Git users to store versions of their work. This is intended for Git-savvy users to track changes made by team members to implement version control without teaching Git.

![](http://g.recordit.co/DxWkhlc8RB.gif)

## Prerequisites

- JupyterLab  

## Usage

- *JupyterLab must be started within a Git repository.*
- Store a version of your folder with File > Store Version or the second icon on the notebook toolbar.

## Install

```bash
jupyter labextension install jupyterlab-easygit
```

```bash
pip install jupyterlab-git
jupyter serverextension enable --py jupyterlab_git
```

## Development

### Install

Requires node 4+ and npm 4+

```bash
# Clone the repo to your local environment
git clone https://github.com/jennalandy/jupyterlab-easygit.git
cd jupyterlab-easygit
# Install dependencies
npm install # or yarn
# Build Typescript source
npm run build # or yarn build
# Link your development version of the extension with JupyterLab
jupyter labextension link .
# Rebuild Typescript source after making changes
npm run build # or yarn build
```

To rebuild the package and the JupyterLab app:

```bash
npm run build
jupyter lab build
```
