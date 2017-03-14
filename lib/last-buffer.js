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
    }
  },

  activate() {
    atom.workspace.paneContainer.onDidChangeActivePaneItem(this.save.bind(this))
    this.subscriptions = new CompositeDisposable()
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'last-buffer:toggle': () => this.toggle()
    }))
  },

  deactivate() {
    this.subscriptions.dispose()
  },

  toggle() {
    const id = _.get(atom.workspace.getActivePane().getActiveEditor(), 'id')
    const item = _.chain(this.items)
      .findLast(i => (_.get(i.editor, 'id') !== id) && !i.pane.isDestroyed() && (!i.editor || !i.editor.isDestroyed()))
      .value()
    if (!item) return
    item.pane.activate()
    if (item.editor) item.pane.activateItem(item.editor)
  },

  save(editor) {
    this.items.push({
      pane: atom.workspace.getActivePane(),
      editor,
    })
    if (this.items.length > atom.config.get('last-buffer.stackLimit') ) {
      this.items.shift()
    }
  },

}
