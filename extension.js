// -*- mode: js; js-indent-level: 2;-*-
const ExtensionUtils = imports.misc.extensionUtils;

const Me = ExtensionUtils.getCurrentExtension();

const PwList           = Me.imports.pwList.PwList;
const PwSearchProvider = Me.imports.pwSearchProvider.PwSearchProvider;
const PwStoreMenu      = Me.imports.pwStoreMenu.PwStoreMenu;
const PassLauncher     = Me.imports.passLauncher.PassLauncher;
const PwSearch         = Me.imports.pwSearch;

let pwlist   = new PwList("/home/john/.password-store/");
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
