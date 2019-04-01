// -*- mode: js; js-indent-level: 2;-*-
const ExtensionUtils = imports.misc.extensionUtils;
const GLib = imports.gi.GLib;

const Me = ExtensionUtils.getCurrentExtension();

const PwList           = Me.imports.pwList.PwList;
const PwSearchProvider = Me.imports.pwSearchProvider.PwSearchProvider;
const PwStoreMenu      = Me.imports.pwStoreMenu.PwStoreMenu;
const PassLauncher     = Me.imports.passLauncher.PassLauncher;
const PwSearch         = Me.imports.pwSearch;

const PASSWORD_STORE_DIR = GLib.build_pathv('/', [
  GLib.get_home_dir(),
  '.password-store'
]);

let pwlist   = new PwList(PASSWORD_STORE_DIR);
let launcher = new PassLauncher();

let pwstore;
let pwsearch;


function init() {
  pwstore  = new PwStoreMenu(launcher, pwlist);
  pwsearch = new PwSearchProvider(launcher, pwlist, new PwSearch.LiteralSearch());
}

function enable() {
  pwstore.install();
  pwsearch.install();
}

function disable() {
  pwstore.uninstall();
  pwsearch.uninstall();
}
