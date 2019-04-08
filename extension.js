// -*- mode: js; js-indent-level: 4;-*-
const ExtensionUtils = imports.misc.extensionUtils;
const GLib = imports.gi.GLib;

const Me = ExtensionUtils.getCurrentExtension();

const PwList           = Me.imports.pwList.PwList;
const PwSearchProvider = Me.imports.pwSearchProvider.PwSearchProvider;
const PwStoreMenu      = Me.imports.pwStoreMenu.PwStoreMenu;
const PassLauncher     = Me.imports.passLauncher.PassLauncher;
const PwSearch         = Me.imports.pwSearch;

/* TODO: is this safe? should this be done in init() ? */
const PASSWORD_STORE_DIR = GLib.build_pathv('/', [
    GLib.get_home_dir(),
    '.password-store'
]);

let pwlist,   // FileMonitor, shared by the Menu and the Search Provider.
    launcher, // Shared helper class to launch `pass -c`.
    pwstore,  // Shell menu for browsing items.
    pwsearch; // Shell search provider.


/**
 * [...] anything that needs to happen at first-run, like binding text domains.
 * Do not make any UI modifications or setup any callbacks or anything in init().
 * Do any and all modifications in enable().
 * http://blog.mecheye.net/2012/02/requirements-and-tips-for-getting-your-gnome-shell-extension-approved/
 */
function init() {
}

function enable() {
    pwlist   = new PwList(PASSWORD_STORE_DIR);
    launcher = new PassLauncher();

    pwstore  = new PwStoreMenu(launcher, pwlist);
    pwsearch = new PwSearchProvider(launcher, pwlist, new PwSearch.LiteralSearch());

    pwstore.install();
    pwsearch.install();
}

function disable() {
    pwstore.uninstall();
    pwsearch.uninstall();
    pwlist.destroy();
}
