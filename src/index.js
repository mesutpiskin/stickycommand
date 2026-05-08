import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { hashHistory, Router } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';

import configStore from './common/configStore';
import routeConfig from './common/routeConfig';

const store = configStore();
const history = syncHistoryWithStore(hashHistory, store);
window.globalHistory = history;

const systemDarkQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

function resolveTheme(themeMode) {
  if (themeMode === 'dark' || themeMode === 'light') return themeMode;
  if (systemDarkQuery && systemDarkQuery.matches) return 'dark';
  return 'light';
}

function applyTheme(themeMode) {
  const theme = resolveTheme(themeMode);
  document.body.classList.remove('theme-dark', 'theme-light');
  document.body.classList.add(`theme-${theme}`);
}

let currentThemeMode = 'system';
applyTheme(currentThemeMode);

store.subscribe(() => {
  const state = store.getState();
  const home = state && state.home;
  if (!home) return;
  const themeMode = home.theme || 'system';
  if (themeMode !== currentThemeMode) {
    currentThemeMode = themeMode;
  }
  applyTheme(currentThemeMode);
});

if (systemDarkQuery && typeof systemDarkQuery.addEventListener === 'function') {
  systemDarkQuery.addEventListener('change', () => {
    if (currentThemeMode === 'system') applyTheme('system');
  });
} else if (systemDarkQuery && typeof systemDarkQuery.addListener === 'function') {
  systemDarkQuery.addListener(() => {
    if (currentThemeMode === 'system') applyTheme('system');
  });
}

const root = document.createElement('div');
document.body.appendChild(root);

bridge.ipcRenderer.on('CMD_FINISHED', (evt, cmdId, code, error) => {
  console.log('cmd finished: ', cmdId, code);
  if (store.getState().home.appVersion) {
    store.dispatch({
      type: 'CMD_FINISHED',
      data: {
        cmdId,
        code,
        error,
      },
    });
  }
});

bridge.ipcRenderer.on('CMD_OUTPUT', (evt, cmdId, outputs) => {
  if (store.getState().home.appVersion) {
    store.dispatch({
      type: 'CMD_OUTPUT',
      data: {
        cmdId,
        outputs,
      },
    });
  }
});

render(
  <Provider store={store}>
    <Router history={history} routes={routeConfig} />
  </Provider>,
  root
);

// import './test.js';