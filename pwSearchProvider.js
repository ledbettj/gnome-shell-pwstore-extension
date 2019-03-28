// -*- mode: js; js-indent-level: 2;-*-
const Gio  = imports.gi.Gio;
const Main = imports.ui.main;
const St   = imports.gi.St;

var PwSearchProvider = class PwSearchProvider {
  /* Instantiate a new PwStore Search Provider. */
  constructor(launcher, passList) {
    this._launcher = launcher;
    this._list     = passList;

    this.isRemoteProvider = false;
    this.canLaunchSearch  = false;
  }

  entries() {
    return this._list.entries();
  }

  install() {
    Main.overview.viewSelector._searchResults._registerProvider(this);
  }

  uninstall() {
    Main.overview.viewSelector._searchResults._unregisterProvider(this);
  }

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

  /* Called to limit our result set to `maxNumber` results. */
  filterResults(results, maxNumber) {
    return results.slice(0, maxNumber);
  }

  /* Called to get the display information for the result IDs we returned
   * in getInitialResultSet().
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

  getSubsearchResultSet(previousResults, terms, callback, cancellable) {
    this.getInitialResultSet(terms, callback, cancellable);
  }

  activateResult(id, terms) {
    let entry = this.entries()[id];
    this._launcher.launch(entry.relative);
  }
};
