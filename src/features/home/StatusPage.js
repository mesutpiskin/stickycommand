import React, { Component, PropTypes } from 'react';
import _ from 'lodash';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Button, Col, Dropdown, Menu, Modal, message } from 'antd';
import { Link } from 'react-router';
import CmdList from './CmdList';
import { runCmd, stopCmd, deleteCmd, reorderCmds, clearOutput, selectCmd, saveCmd } from './redux/actions';
import { ConsoleOutput, Welcome, BatchAddCmds, ColResizer } from './';

export class StatusPage extends Component {
  static propTypes = {
    home: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.handleBeginEdit = this.handleBeginEdit.bind(this);
    this.handleEndEdit = this.handleEndEdit.bind(this);
    this.handleToolsMenuClick = this.handleToolsMenuClick.bind(this);
    this.showImportDialog = () => this.setState({ importDialogVisible: true });
    this.hideImportDialog = () => this.setState({ importDialogVisible: false });
  }

  state = {
    importDialogVisible: false,
    editing: false,
    npmScripts: [],
    prjName: '',
    workingDirectory: '',
  };

  handleToolsMenuClick({ key }) {
    switch (key) {
      case 'import-package':
        this.importFromPackageJson();
        break;
      case 'import-json':
        this.importFromJson();
        break;
      case 'export-json':
        this.exportCommands();
        break;
      default:
        break;
    }
  }

  renderToolsMenu = () => (
    <Menu className="tools-menu" onClick={this.handleToolsMenuClick}>
      <Menu.Item key="import-package">Import from package.json</Menu.Item>
      <Menu.Item key="import-json">Import commands JSON</Menu.Item>
      <Menu.Divider />
      <Menu.Item key="export-json">Export commands JSON</Menu.Item>
    </Menu>
  );

  showOpenDialog = (options, onSelect) => {
    const dialog = bridge.remote.dialog;
    const res = dialog.showOpenDialog(options, fileNames => {
      if (Array.isArray(fileNames)) onSelect(fileNames);
    });

    if (res && typeof res.then === 'function') {
      res.then(result => {
        if (result && !result.canceled && Array.isArray(result.filePaths)) {
          onSelect(result.filePaths);
        }
      });
    }
  };

  showSaveDialog = (options, onSelect) => {
    const dialog = bridge.remote.dialog;
    const res = dialog.showSaveDialog(options, filePath => {
      if (filePath) onSelect(filePath);
    });

    if (res && typeof res.then === 'function') {
      res.then(result => {
        if (result && !result.canceled && result.filePath) {
          onSelect(result.filePath);
        }
      });
    }
  };

  importFromPackageJson = () => {
    this.showOpenDialog(
      {
        title: 'Select package.json',
        filters: [{ name: 'package', extensions: ['json'] }],
        properties: ['openFile'],
      },
      fileNames => {
        const file = fileNames[0];
        try {
          const content = bridge.remote.require('fs').readFileSync(fileNames[0], 'utf8');
          const cwd = bridge.remote.require('path').dirname(file);
          const json = JSON.parse(content);
          const prjName = _.flow(_.camelCase, _.upperFirst)(json.name || 'NONAME');
          const npmScripts = Object.keys(json.scripts);
          this.setState({
            npmScripts,
            prjName,
            workingDirectory: cwd,
            importDialogVisible: true,
          });
          // const cmds = _.entries(json.scripts).map(entry => ({
          //   name: `${prjName} ${entry[0]}`,
          //   cmd: `npm run ${entry[0]}`,
          // }));
        } catch (e) {
          alert(`Failed to load: ${file}`); // eslint-disable-line
        }
      }
    );
  };

  exportCommands = () => {
    const cmds = this.props.home.cmdIds
      .map(id => this.props.home.cmdById[id])
      .filter(Boolean)
      .map(c => ({
        name: c.name || '',
        group: c.group || '',
        cmd: c.cmd || '',
        cwd: c.cwd || '',
        sudo: !!c.sudo,
        url: c.url || '',
        finishPrompt: !!c.finishPrompt,
      }));

    const payload = {
      app: 'StickyCommand',
      version: 1,
      exportedAt: new Date().toISOString(),
      commands: cmds,
    };

    this.showSaveDialog(
      {
        title: 'Export commands',
        defaultPath: 'stickycommand-commands.json',
        filters: [{ name: 'JSON', extensions: ['json'] }],
      },
      filePath => {
        if (!filePath) return;
        try {
          bridge.remote.require('fs').writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
          message.success(`Exported ${cmds.length} command${cmds.length > 1 ? 's' : ''}.`);
        } catch (e) {
          message.error(`Export failed: ${e.message || e.toString()}`);
        }
      }
    );
  };

  importFromJson = () => {
    this.showOpenDialog(
      {
        title: 'Import commands JSON',
        filters: [{ name: 'JSON', extensions: ['json'] }],
        properties: ['openFile'],
      },
      fileNames => {
        if (!fileNames || !fileNames.length) return;
        const file = fileNames[0];
        try {
          const content = bridge.remote.require('fs').readFileSync(file, 'utf8');
          const parsed = JSON.parse(content);
          const rawCommands = Array.isArray(parsed) ? parsed : (parsed.commands || []);

          const commands = rawCommands
            .filter(c => c && c.cmd)
            .map(c => ({
              name: (c.name || c.cmd || '').trim(),
              group: (c.group || '').trim(),
              cmd: c.cmd,
              cwd: c.cwd || '',
              sudo: !!c.sudo,
              url: c.url || '',
              finishPrompt: !!c.finishPrompt,
            }));

          if (!commands.length) {
            message.warning('No valid commands found in selected file.');
            return;
          }

          commands
            .map(cmd => () => this.props.actions.saveCmd(cmd))
            .reduce((promise, task) => promise.then(() => task()), Promise.resolve())
            .then(() => {
              message.success(`Imported ${commands.length} command${commands.length > 1 ? 's' : ''}.`);
            });
        } catch (e) {
          message.error(`Import failed: ${e.message || e.toString()}`);
        }
      }
    );
  };

  handleBeginEdit() {
    this.setState({
      editing: true,
    });
  }

  handleEndEdit() {
    this.setState({
      editing: false,
    });
  }

  renderLoading() {
    return <div className="home-status-page loading" />;
  }

  render() {
    const { home } = this.props;

    const {
      runCmd,
      stopCmd,
      deleteCmd,
      reorderCmds,
      clearOutput,
      selectCmd,
    } = this.props.actions; /* eslint no-shadow: 0 */
    const { editing } = this.state;
    if (!home.appVersion) return this.renderLoading();

    const allCmds = home.cmdIds.map(id => home.cmdById[id]);
    const currentCmd = home.cmdById[this.props.home.selectedCmd];
    const outputs = currentCmd ? currentCmd.outputs : [];
    const colWidth = home.colWidth;
    return (
      <div className="rekit-page home-status-page">
        {this.state.importDialogVisible && (
          <Modal
            visible
            width={600}
            footer={null}
            style={{ top: '42px' }}
            title={`Import scripts from ${this.state.prjName}`}
          >
            <BatchAddCmds
              importedCmds={this.state.npmScripts}
              prjName={this.state.prjName}
              workingDirectory={this.state.workingDirectory}
              onClose={this.hideImportDialog}
            />
          </Modal>
        )}
        <ColResizer />
        <div className="header">
          <div className="toolbar-left">
            {!editing && (
              <Link to="/cmd/add">
                <Button className="toolbar-btn toolbar-btn-primary icon-only" size="small" icon="plus" title="New Command" />
              </Link>
            )}
            {!editing && allCmds.length > 0 && (
              <Button className="toolbar-btn icon-only" size="small" icon="edit" title="Sort" onClick={this.handleBeginEdit} />
            )}
            {editing && (
              <Button className="toolbar-btn toolbar-btn-primary icon-only" size="small" icon="check" title="Done Sorting" onClick={this.handleEndEdit} />
            )}
          </div>

          <div className="toolbar-right">
            {!editing && (
              <Dropdown overlayClassName="status-tools-dropdown" overlay={this.renderToolsMenu()} trigger={['click']}>
                <Button className="toolbar-btn icon-only" size="small" icon="appstore-o" title="More" />
              </Dropdown>
            )}
            {!editing && (
              <Link to="/settings">
                <Button className="toolbar-btn icon-only" size="small" icon="setting" title="Settings" />
              </Link>
            )}
            {!editing && (
              <Link to="/about">
                <Button className="toolbar-btn icon-only" size="small" icon="info-circle-o" title="About" />
              </Link>
            )}
          </div>
        </div>
        {allCmds.length === 0 && !editing && <Welcome onImportClick={this.importFromPackageJson} />}
        {(allCmds.length > 0 || editing) && (
          <div className="page-content" id="status-list-container">
            <div className="cmd-list-container">
              <CmdList
                cmds={allCmds}
                runCmd={runCmd}
                stopCmd={stopCmd}
                deleteCmd={deleteCmd}
                reorderCmds={reorderCmds}
                clearOutput={clearOutput}
                editing={editing}
                selectCmd={selectCmd}
                selectedCmd={this.props.home.selectedCmd}
                colWidth={this.props.home.colWidth}
              />
              {(allCmds.length > 0 || editing) && (
                <div className="footer" style={{ width: `${colWidth}px` }}>
                  Total {allCmds.length} command{allCmds.length > 1 ? 's' : ''},{' '}
                  {allCmds.filter(c => c.status === 'running').length} running.
                </div>
              )}
            </div>
            <div className="output-container" style={{ left: `${colWidth}px` }}>
              <ConsoleOutput lines={outputs} onClear={() => clearOutput(this.props.home.selectedCmd)} />
            </div>
          </div>
        )}
      </div>
    );
  }
}

/* istanbul ignore next */
function mapStateToProps(state) {
  return {
    home: state.home,
  };
}

/* istanbul ignore next */
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ runCmd, stopCmd, deleteCmd, reorderCmds, clearOutput, selectCmd, saveCmd }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(StatusPage);
