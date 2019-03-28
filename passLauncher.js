// -*- mode: js; js-indent-level: 2;-*-
const GLib = imports.gi.GLib;

var PassLauncher = class PassLauncher {
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
