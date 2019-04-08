// -*- mode: js; js-indent-level: 4;-*-
const GObject   = imports.gi.GObject;
const Main      = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const St        = imports.gi.St;

/**
 * A Dropdown Menu in the gnome-shell status area.
 */
var PwStoreMenu = GObject.registerClass(
    class PwStoreMenu extends PanelMenu.Button {
        /**
         * @constructor
         * @param {PassLauncher} launcher
         * @param {PwList} pwlist
         */
        _init(launcher, pwlist) {
            super._init(0.0, null, false);

            this._launcher = launcher;
            this._list     = pwlist;

            this.popupMenu = new PopupMenu.PopupMenu(this.actor,
                                                     St.Align.START,
                                                     St.Side.TOP);
            this.setMenu(this.popupMenu);

            let box = new St.BoxLayout({
                style_class: 'panel-status-menu-box'
            });
            let icon = new St.Icon({
                icon_name:   'dialog-password-symbolic',
                style_class: 'system-status-icon'
            });

            box.add_child(icon);
            this.actor.add_actor(box);

            this.refresh();
            this._listSignal = this._list.connect('entries-updated', this.refresh.bind(this));
        }

        /**
         * Reset the menu back to the top level directory and redraw.
         */
        refresh() {
            this._folder = this._tree();
            this._redraw();
        }

        /**
         * Redraw the menu based on the current selected folder path.
         */
        _redraw() {
            this.menu.removeAll();

            /* If we are not in the top level directory, include a "go-up" button
             * to take us back to the parent directory. */
            if (this._folder.parent) {
                let up = new PopupMenu.PopupImageMenuItem('', 'go-up');

                /* TODO: is this necessary? Are signals automagically disconnected
                 * on destroy? */
                up._activateId = up.connect('activate', () => {
                    this._folder = this._folder.parent;
                    this._redraw();
                });

                up._destroyId = up.connect('destroy', (self) => {
                    self.disconnect(self._destroyId);
                    self.disconnect(self._activateid);
                });

                this.menu.addMenuItem(up);
            }

            /* Iterate over all child entries, creating either a new subfolder
             * or a file entry. */
            for (let name in this._folder.children) {
                let entry = this._folder.children[name],
                    item  = null;

                if (entry.isDir) {
                    item = new PopupMenu.PopupImageMenuItem(entry.name, 'folder');
                    item._activateId = item.connect('activate', () => {
                        this._folder = entry;
                        this._redraw();
                    });
                } else {
                    item = new PopupMenu.PopupImageMenuItem(entry.name, 'dialog-password');
                    item._activateId = item.connect('activate', () => {
                        this._launcher.launch(entry.fullPath);
                    });
                }

                /* TODO: is this necessary? Are signals automagically disconnected
                 * on destroy? */
                item._destroyId = item.connect('destroy', (self) => {
                    self.disconnect(self._destroyId);
                    self.disconnect(self._activateid);
                });

                this.menu.addMenuItem(item);
            }
        }

        /**
         * @return {PwEntry} the root of the password-store tree.
         */
        _tree() {
            return this._list.tree();
        }

        /**
         * Add the icon to the status area.
         */
        install() {
            Main.panel.addToStatusArea('pwstore', this);
        }

        /**
         * Remove this widget from the status area, disconnect signals,
         * and destroy the items.
         */
        uninstall() {
            this._list.disconnect(this._listSignal);
            this.destroy();
        }
    });
