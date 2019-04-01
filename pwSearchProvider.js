// -*- mode: js; js-indent-level: 2;-*-
const Gio  = imports.gi.Gio;
const Main = imports.ui.main;
const St   = imports.gi.St;

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
   */
  constructor(launcher, passList) {
    this._launcher = launcher;
    this._list     = passList;

    this.isRemoteProvider = false;
    this.canLaunchSearch  = false;
  }

  /* Fetch all the currently known entries in the Password Store.
   * @return {Array} list of entries in the Password Store.
   */
  entries() {
    return this._list.entries();
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
   * This is part of the SearchProvider API.
   * @param {Array} terms
   * @param {Function} callback
   * @param {Gio.Cancellable} cancellable
   */
  getInitialResultSet(terms, callback, cancellable) {
    let lcaseTerms = terms.map( (term) => term.toLowerCase() ),
        results    = [];

    this.entries().forEach((entry, index) => {
      if (lcaseTerms.find((term) => entry.search.includes(term))) {
        results.push(index);
      }
    });

    callback(results);
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
    let metas = results.map((id) => {
      let entry = this.entries()[id];
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
    this._launcher.launch(entry.relative);
  }
};
