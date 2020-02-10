// -*- mode: js; js-indent-level: 4;-*-
const {Gio, St}  = imports.gi;
const Main = imports.ui.main;

/**
 * Exposes the Password Store to the gnome-shell overview search.
 *
 */
var PwSearchProvider = class PwSearchProvider {
    /**
     * Instantiate a new PwStore Search Provider.
     * @constructor
     * @param {PassLauncher} launcher
     * @param {PwList} passList
     * @param {PwSearch} searcher
     */
    constructor(launcher, passList, searcher) {
        this._launcher = launcher;
        this._list     = passList;
        this._searcher = searcher;

        this.isRemoteProvider = false;
        this.canLaunchSearch  = false;
    }

    /* Fetch all the currently known entries in the Password Store.
     * @return {Array} list of entries in the Password Store.
     */
    entries() {
        return this._list.list();
    }

    /**
     * Add this search provider to the gnome-shell overview.
     */
    install() {
        Main.overview.viewSelector._searchResults._registerProvider(this);
    }

    /**
     * Remove this search provider to the gnome-shell overview,
     */
    uninstall() {
        Main.overview.viewSelector._searchResults._unregisterProvider(this);
    }

    /**
     * Called to retrieve an initial list of results when searching.
     * Given search a set of search terms like "work,email" we will search the
     * password store for items matching 'work/email' and 'work email'.
     *
     * This is part of the SearchProvider API.
     * @param {Array} terms - list of strings the user typed into the shell search.
     * @param {Function} callback - function to invoke with the search results.
     * @param {Gio.Cancellable} cancellable - object to check if the search has been
     *  cancelled (ie, user closed the search).
     */
    getInitialResultSet(terms, callback, cancellable) {
        let results = this._searcher.search(terms, this.entries(), cancellable);

        if (!cancellable || !cancellable.is_cancelled()) {
            callback(results);
        }
    }

    /**
     * Called to limit our result set to a subset.
     * This is part of the SearchProvider API.
     * @param {Array} results
     * @param {Integer} maxNumber
     * @return {Array}
     */
    filterResults(results, maxNumber) {
        return results.slice(0, maxNumber);
    }

    /**
     * Called to get the display information for the result IDs we returned in getInitialResultSet.
     * This is part of the SearchProvider API.
     * @param {Array} results
     * @param {Function} callback
     */
    getResultMetas(results, callback) {
        let nameCount = {};
        // Identify any duplicate names in our result set, so we can disambiguate.
        results.forEach((id) => {
            let entry = this.entries()[id];

            nameCount[entry.name] = nameCount[entry.name] || 0;
            nameCount[entry.name] += 1;
        });

        let metas = results.map((id) => {
            let entry = this.entries()[id];
            let name = entry.name;

            if (nameCount[name] > 1) {
                let parts = entry.fullPath.split('/');
                name = parts.slice(parts.length - 2, parts.length).join('/');
            }

            return {
                id:          id,
                name:        name,
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

    /**
     * Called to search a set of previous results.  We don't support this and just
     * do a new search. This is part of the SearchProvider API.
     * @param {Array} previousResults
     * @param {Array} terms
     * @param {Function} callback
     * @param {Gio.Cancellable} cancellable
     */
    getSubsearchResultSet(previousResults, terms, callback, cancellable) {
        this.getInitialResultSet(terms, callback, cancellable);
    }

    /** Called when the user has selected an item from our search results.
     * This is part of the SearchProvider API.
     * @param {Integer} id
     * @param {Array} terms
     */
    activateResult(id, terms) {
        let entry = this.entries()[id];
        this._launcher.launch(entry.fullPath);
    }
};
