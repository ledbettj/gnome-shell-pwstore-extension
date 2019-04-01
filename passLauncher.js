// -*- mode: js; js-indent-level: 2;-*-
const GLib = imports.gi.GLib;

/**
 * Handle launching the pass program to copy a password to the clipboard.
 */
var PassLauncher = class PassLauncher {
  /**
   * Invoke pass -c with the given path.
   * @param {string} path - password store object to grab, e.g. "Work/email".
   */
  launch(path) {
    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 100, () => {
      GLib.spawn_async(null,
                       ['pass', '-c', path],
                       null,
                       GLib.SpawnFlags.SEARCH_PATH,
                       null);
      return false;
    });
  }
}
