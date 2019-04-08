// -*- mode: js; js-indent-level: 4;-*-
/*
 * Based on https://github.com/zdyn/jaro-winkler-js/, which is
 * Licensed under the MIT License and Copyright (c) 2014 Brian Zhou
 */

/**
 * Jaro-Winkler distance is similar to Levenshtein Distance,
 * But gives additional weight to prefix matches and transpositions.
 * https://en.wikipedia.org/wiki/Jaro%E2%80%93Winkler_distance
 */
var JaroWinkler = {
    distance(s1, s2) {
        if (s1.length > s2.length) {
            [s1, s2] = [s2, s1];
        }

        let matchWindow = ~~Math.max(0, s2.length / 2 - 1);
        let s1matches  = [],
            s2matches  = [],
            trans      = 0,
            prefix     = 0,
            numMatches = 0,
            result     = 0;

        for (let i in s1) {
            let ch = s1[i],
                winStart = Math.max(i - matchWindow),
                winEnd   = Math.min(i + matchWindow, s2.length);

            for(let j = winStart; j < winEnd; ++j) {
                if (!(j in s2matches) && ch == s2[j]) {
                    s1matches[i] = ch;
                    s2matches[j] = s2[j];
                    break;
                }
            }
        }

        s1matches = s1matches.join('');
        s2matches = s2matches.join('');

        numMatches = s1matches.length;

        if (!numMatches) {
            return 0;
        }

        for (let i in s1matches) {
            if (s1matches[i] != s2matches[i]) {
                trans++;
            }
        }

        for (let i in s1) {
            if (s1[i] == s2[i]) {
                prefix++;
            } else {
                break;
            }
        }

        result = ((numMatches / s1.length) + (numMatches / s2.length) +
                  (numMatches - ~~(trans / 2)) / numMatches) / 3.0;

        result += Math.min(prefix, 4) * 0.1 * (1 - result);

        return result;
    }
};
