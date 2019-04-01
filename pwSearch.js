// -*- mode: js; js-indent-level: 2;-*-
const ExtensionUtils = imports.misc.extensionUtils;
const Me             = ExtensionUtils.getCurrentExtension();
const JaroWinkler    = Me.imports.jaroWinkler.JaroWinkler;

var LiteralSearch = class LiteralSearch {

  search(terms, entries, cancellable) {
    let lcaseTerms  = terms.map( (term) => term.toLowerCase() ),
        searchTerms = [terms.join('/'), terms.join(' ')],
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


var FuzzySearch = class FuzzySearch {
  constuctor(threshold) {
    this._threshold = threshold || 0.80;
  }

  search(terms, entries, cancellable) {
    let lcaseTerms  = terms.map( (term) => term.toLowerCase() ),
        searchTerms = [terms.join('/'), terms.join(' ')],
        results     = [];

    entries.some((entry, index) => {
      searchTerms.forEach((term) => {
        let score = JaroWinkler.distance(term, entries.search);

        if (score >= this._threshold) {
          results.push({ id: index, score: score });
        }
      });

      return cancellable && cancellable.is_cancelled();
    });

    results.sort((a, b) => a.score < b.score ? -1 : a.score > b.score ? 1 : 0);
    results = results.map((e) => e.id);

    return results;
  }
};
