// -*- mode: js; js-indent-level: 2;-*-
const ExtensionUtils = imports.misc.extensionUtils;

const Me = ExtensionUtils.getCurrentExtension();

const PwSearchProvider = Me.imports.pwSearchProvider.PwSearchProvider;
const PwStoreMenu      = Me.imports.pwStoreMenu.PwStoreMenu;
const PassLauncher     = Me.imports.passLauncher.PassLauncher;

let pwstore;
let pwsearch;
let launcher = new PassLauncher();


function init() {
  pwstore  = new PwStoreMenu(launcher);
  pwsearch = new PwSearchProvider(launcher);
}

function enable() {
  pwstore.install();
  pwsearch.install();
}

function disable() {
  pwstore.uninstall();
  pwsearch.uninstall();
}
