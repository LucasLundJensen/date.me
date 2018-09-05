var _require = require('preact'),
    h = _require.h;

function DashboardContentTitle(props) {
  if (props.newFiles.length) {
    return props.i18n('xFilesSelected', { smart_count: props.newFiles.length });
  }
}

function PanelTopBar(props) {
  return h(
    'div',
    { 'class': 'uppy-DashboardContent-bar' },
    h(
      'button',
      { 'class': 'uppy-DashboardContent-back',
        type: 'button',
        onclick: props.cancelAll },
      props.i18n('cancel')
    ),
    h(
      'div',
      { 'class': 'uppy-DashboardContent-title', role: 'heading', 'aria-level': 'h1' },
      h(DashboardContentTitle, props)
    ),
    h(
      'button',
      { 'class': 'uppy-DashboardContent-addMore',
        type: 'button',
        'aria-label': props.i18n('addMoreFiles'),
        title: props.i18n('addMoreFiles'),
        onclick: function onclick() {
          return props.toggleAddFilesPanel(true);
        } },
      h(
        'svg',
        { 'class': 'UppyIcon', width: '15', height: '15', viewBox: '0 0 13 13', version: '1.1', xmlns: 'http://www.w3.org/2000/svg' },
        h('path', { d: 'M7,6 L13,6 L13,7 L7,7 L7,13 L6,13 L6,7 L0,7 L0,6 L6,6 L6,0 L7,0 L7,6 Z' })
      )
    )
  );
}

module.exports = PanelTopBar;