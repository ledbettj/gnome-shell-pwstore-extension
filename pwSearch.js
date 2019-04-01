// -*- mode: js; js-indent-level: 2;-*-
const ExtensionUtils = imports.misc.extensionUtils;
const Me             = ExtensionUtils.getCurrentExtension();
const JaroWinkler    = Me.imports.jaroWinkler.JaroWinkler;

class Searcher {
  computeTerms(terms) {
    let lcaseTerms  = terms.map( (term) => term.toLowerCase() ),
        searchTerms = [terms.join('/'), terms.join(' ')];

    /* don't do extra work if the terms are the same. */
    if (searchTerms[0] == searchTerms[1]) {
      searchTerms.shift();
    }

    return searchTerms;
  }
};

var LiteralSearch = class LiteralSearch extends Searcher {
  search(terms, entries, cancellable) {
    let searchTerms = this.computeTerms(terms),
        results     = [];

    entries.some((entry, index) => {
      if (searchTerms.find((term) => entry.search.includes(term))) {
        results.push(index);
      }

      return cancellable && cancellable.is_cancelled();
    });

    return results;
  }
};


var FuzzySearch = class FuzzySearch extends Searcher {
  constructor(threshold) {
    super();
    this._threshold = threshold || 0.80;
  }

  search(terms, entries, cancellable) {
    let searchTerms = this.computeTerms(terms),
        results     = [];

    entries.some((entry, index) => {
      searchTerms.forEach((term) => {
        let score = JaroWinkler.distance(term, entry.search);
        if (score >= this._threshold) {
          results.push({ id: index, score: score });
        }
      });

      return cancellable && cancellable.is_cancelled();
    });

    results.sort((a, b) => a.score < b.score ? 1 : a.score > b.score ? -1 : 0);
    results = results.map((e) => e.id);

    return results;
  }
};
