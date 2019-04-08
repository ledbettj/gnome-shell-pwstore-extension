// -*- mode: js; js-indent-level: 4;-*-
const Gio     = imports.gi.Gio;
const Signals = imports.signals;

/** Represents a single folder or password file in the store. */
var PwEntry = class PwEntry {
    constructor({ name, fullPath, isDir, parent = null }) {
        this.parent   = parent;
        this.name     = name.replace(/\.gpg$/i, '');
        this.isDir    = isDir;
        this.children = {};
        this.fullPath = fullPath.replace(/\.gpg$/i, '');
        this.search   = this.fullPath.toLowerCase();
    }
};

/**
 * Loads and stores all the entries in the password store
 * and watches for updates.
 */
var PwList = class PwList {
    /**
     * Insantiate a new PwList.
     * @constructor
     * @param {string} path - path to the password-store repo, normally ~/.password-store/
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
        this._root = new PwEntry({name: '/', isDir: true, fullPath: ''});
        this._list = [];

        this._readTree(this._passDir, this._root);
        this.emit('entries-updated');
    }

    /**
     * The parsed list of directories and passwords.
     * @return {PwEntry} the entry for the root password-store directory.
     */
    tree() {
        return this._root;
    }

    /**
     * The flattened list of only the passwords saved in the store.
     * Useful for searching, less useful for traversing (use tree() instead).
     * @return {Array} array of PwEntries for each password in the store.
     */
    list() {
        return this._list;
    }


    /** Cleanup.
     * Disconnect signals and cancel the file watcher.
     */
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
     * @param {PwEntry} parent
     */
    _readTree(dir, parent) {
        let walker = dir.enumerate_children("standard::*", Gio.FileQueryInfoFlags.NONE, null),
            info   = null;

        while((info = walker.next_file(null)) != null) {
            let child = dir.resolve_relative_path(info.get_name()),
                isDir = info.get_file_type() == Gio.FileType.DIRECTORY,
                base  = child.get_basename().toLowerCase();

            /* do not read .git directory or non-gpg files */
            if ((isDir && base === '.git') || (!isDir && !base.endsWith('.gpg')))
                continue;

            let ent = this._addEntry(parent, child, isDir);

            if (isDir) {
                this._readTree(child, ent);
            } else {
                this._list.push(ent);
            }
        }
    }

    /**
     * Add the given file to the entries list.
     * @param {PwEntry}  parent
     * @param {Gio.File} file
     * @param {boolean}  isDir
     * @return {PwEntry}
     */
    _addEntry(parent, file, isDir) {
        let relative = this._passDir.get_relative_path(file);

        let entry = new PwEntry({
            name:     file.get_basename(),
            fullPath: relative,
            isDir:    isDir,
            parent:   parent
        });

        parent.children[entry.name] = entry;
        return entry;
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

