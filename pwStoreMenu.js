// -*- mode: js; js-indent-level: 2;-*-
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

      this._redraw();
      this._listSignal = this._list.connect('entries-updated', this._redraw.bind(this));
    }

    _redraw() {

    }

    /**
     * Add the icon to the status area.
     */
    install() {
      Main.panel.addToStatusArea('pwstore', this);
    }

    /**
     * Remove this widget from the status area.
     */
    uninstall() {
      this._list.disconnect(this._listSignal);
      this.destroy();
    }
  });
