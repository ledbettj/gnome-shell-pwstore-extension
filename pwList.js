// -*- mode: js; js-indent-level: 2;-*-
const Gio     = imports.gi.Gio;
const Signals = imports.signals;

/**
 * Loads and stores all the entries in the password store, and watches for
 * updates.
 */
var PwList = class PwList {
  /**
   * Insantiate a new PwList.
   * @constructor
   * @param {string} path - path to the password-store repo, normally
   *   ~/.password-store/
   */
  constructor(path) {
    this._passDir = Gio.File.new_for_path(path);

    this.refresh();

    this._mon = this._passDir.monitor(Gio.FileMonitorFlags.NONE, null);
    this._monId = this._mon.connect('changed', this._onDirectoryEvent.bind(this));
  }

  /**
   * Re-read the password-store folder from disk.
   * Runs on initialization as well as if the file watch indicates the folder
   * has changed.
   */
  refresh() {
    this._entries = [];
    this._readEntries(this._passDir);
    this.emit('entries-updated');
  }

  /**
   * Grab the current list of Password Store entries.
   * @return {Array}
   */
  entries() {
    return this._entries;
  }

  destroy() {
    this._mon.disconnect(this._monId);
    this._mon.cancel();
  }

  /**
   * Invoked when the .password-store directory is updated;
   * when fired we might need to re-read the list of pass files.
   * @param {Gio.FileMonitor} _monitor
   * @param {Gio.File} _file
   * @param {Gio.File} _otherFile
   * @param {Gio.FileMonitorEvent} eventType
   */
  _onDirectoryEvent(_monitor, _file, _otherFile, eventType) {
    switch(eventType) {
    case Gio.FileMonitorEvent.CHANGED:
    case Gio.FileMonitorEvent.CREATED:
    case Gio.FileMonitorEvent.DELETED:
    case Gio.FileMonitorEvent.MOVED:
      this.refresh();
      break;
    default:
      break;
    }
  }

  /**
   * Read all the files stored under `dir` and add any .gpg files to the
   * entry list.
   * @param {Gio.File} dir
   */
  _readEntries(dir) {
    let walker = dir.enumerate_children("standard::*", Gio.FileQueryInfoFlags.NONE, null);
    let info   = null;

    while((info = walker.next_file(null)) != null) {
      let child = dir.resolve_relative_path(info.get_name());

      if (info.get_file_type() == Gio.FileType.DIRECTORY) {
        this._readEntries(child);
      } else if (this._isGpgFile(child)) {
        this._addEntry(child);
      }
    }
  }

  /**
   * Add the given file to the entries list.
   * @param {Gio.File} file
   */
  _addEntry(file) {
    let relative = this._passDir.get_relative_path(file).replace(/\.gpg$/i, '')
    let entry = {
      parent:    this._passDir.get_relative_path(file.get_parent()),
      name:      file.get_basename().replace(/\.gpg$/i, ''),
      relative:  relative,
      search:    relative.toLowerCase()
    };

    this._entries.push(entry);
  }

  /**
   * Check if the given file is a .gpg file.
   * @param {Gio.File} file
   * @return {Boolean}
   */
  _isGpgFile(file) {
    return file.get_basename().toLowerCase().endsWith('.gpg');
  }
}


Signals.addSignalMethods(PwList.prototype);

