// -*- mode: js; js-indent-level: 2;-*-
const Gio  = imports.gi.Gio;
const Main = imports.ui.main;
const St   = imports.gi.St;

var PwSearchProvider = class PwSearchProvider {
  /* Instantiate a new PwStore Search Provider. */
  constructor(launcher) {
    this._launcher = launcher;

    this.isRemoteProvider = false;
    this.canLaunchSearch  = false;

    this._passDir = Gio.File.new_for_path('/home/john/.password-store/');
    this._entries = [];

    this._readEntries(this._passDir);

    this._mon = this._passDir.monitor(Gio.FileMonitorFlags.NONE, null);
    this._mon.connect('changed', this._onDirectoryEvent.bind(this));
  }

  install() {
    Main.overview.viewSelector._searchResults._registerProvider(this);
  }

  uninstall() {
    Main.overview.viewSelector._searchResults._unregisterProvider(this);
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

  getInitialResultSet(terms, callback, cancellable) {
    let lcaseTerms = terms.map( (term) => term.toLowerCase() ),
        results    = [];

    this._entries.forEach((entry, index) => {
      if (lcaseTerms.find((term) => entry.search.includes(term))) {
        results.push(index);
      }
    });

    callback(results);
  }

  /* Called to limit our result set to `maxNumber` results. */
  filterResults(results, maxNumber) {
    return results.slice(0, maxNumber);
  }

  /* Called to get the display information for the result IDs we returned
   * in getInitialResultSet().
   */
  getResultMetas(results, callback) {
    let metas = results.map((id) => {
      let entry = this._entries[id];
      return {
        id:          id,
        name:        entry.name,
        description: `Password for ${entry.relative}`,

        createIcon(size) {
          return new St.Icon({
            icon_size: size,
            icon_name: 'dialog-password'
          });
        }
      };
    });

    callback(metas);
  }

  getSubsearchResultSet(previousResults, terms, callback, cancellable) {
    this.getInitialResultSet(terms, callback, cancellable);
  }

  activateResult(id, terms) {
    let entry = this._entries[id];
    this._launcher.launch(entry.relative);
  }
};
