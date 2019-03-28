// -*- mode: js; js-indent-level: 2;-*-
const Gio     = imports.gi.Gio;
const Signals = imports.signals;

var PwList = class PwList {
  constructor(path) {
    this._passDir = Gio.File.new_for_path(path);

    this._entries = [];
    this._readEntries(this._passDir);
    this.emit('entries-updated');

    this._mon = this._passDir.monitor(Gio.FileMonitorFlags.NONE, null);
    this._mon.connect('changed', this._onDirectoryEvent.bind(this));
  }

  entries() {
    return this._entries;
  }

  /* Invoked when the .password-store directory is updated;
   * when fired we might need to re-read the list of pass files.
   */
  _onDirectoryEvent(_monitor, _file, _otherFile, eventType) {
    switch(eventType) {
    case Gio.FileMonitorEvent.CHANGED:
    case Gio.FileMonitorEvent.CREATED:
    case Gio.FileMonitorEvent.DELETED:
    case Gio.FileMonitorEvent.MOVED:
      this._readEntries(this._passDir);
      this.emit('entries-updated');
      break;
    default:
      break;
    }
  }

  /* Read all the files stored under `dir` and add any .gpg files to the entry list */
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

  _isGpgFile(file) {
    return file.get_basename().toLowerCase().endsWith('.gpg');
  }
}


Signals.addSignalMethods(PwList.prototype);

