import { JupyterLabPlugin } from '@jupyterlab/application';
import '../style/variables.css';
export interface GitShowTopLevelResult {
    code: number;
    top_repo_path?: string;
}
declare const plugin: JupyterLabPlugin<void>;
export default plugin;
