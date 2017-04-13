'use babel'

import { CompositeDisposable } from 'atom'
import _ from 'lodash'

export default {
  subscriptions: null,
  items: [],

  config: {
    stackLimit: {
      type: 'integer',
      default: 100,
      minimum: 2,
    },
    skipTreeView: {
      type: 'boolean',
      default: true,
    }
  },

  activate() {
    atom.workspace.onDidDestroyPaneItem(({ pane: { id: paneId }, item: { id: editorId } }) => {
      _.remove(this.items, ({ pane: { id: _paneId }, editor }) => paneId === _paneId && _.get(editor, 'id') === editorId)
    })
    atom.workspace.onDidDestroyPane(({ pane: { id: paneId, items: editors } }) => {
      _.remove(this.items, ({ pane: { id: _paneId }, editor }) => paneId === _paneId && _.find(editors, ({ id: editorId }) => _.get(editor, 'id') === editorId))
    })
    atom.workspace.onDidStopChangingActivePaneItem(editor => {
      const pane = atom.workspace.getActivePane()
      if (atom.config.get('last-buffer.skipTreeView') && _.get(pane, 'activeItem.constructor.name') === 'TreeView') {
        return
      }
      this.items.unshift({
        pane,
        editor,
      })
      if (this.items.length > atom.config.get('last-buffer.stackLimit')) {
        this.items.pop()
      }
    })
    this.subscriptions = new CompositeDisposable()
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'last-buffer:toggle': () => this.toggle()
    }))
  },

  deactivate() {
    this.subscriptions.dispose()
  },

  toggle() {
    const item = _.chain(this.items)
      .find(({ editor, pane: { id: paneId } }) => {
        const pane = _.find(atom.workspace.getPanes(), ({ id: _paneId }) => paneId === _paneId)
        return pane && ((_.isEmpty(pane.items) && !editor) || _.find(pane.items, ({ id }) => _.get(editor, 'id') === id))
      }, 1)
      .value()
    if (!item) return
    item.pane.activate()
    if (item.editor) item.pane.activateItem(item.editor)
  },

}
