/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * @license
 * Fuse - Lightweight fuzzy-search
 *
 * Copyright (c) 2012-2016 Kirollos Risk <kirollos@gmail.com>.
 * All Rights Reserved. Apache Software License 2.0
 *
 * Licensed under the Apache License, Version 2.0 (the "License")
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
;(function (global) {
  'use strict'

  /** @type {function(...*)} */
  function log () {
    console.log.apply(console, arguments)
  }

  var defaultOptions = {
    // The name of the identifier property. If specified, the returned result will be a list
    // of the items' dentifiers, otherwise it will be a list of the items.
    id: null,

    // Indicates whether comparisons should be case sensitive.

    caseSensitive: false,

    // An array of values that should be included from the searcher's output. When this array
    // contains elements, each result in the list will be of the form `{ item: ..., include1: ..., include2: ... }`.
    // Values you can include are `score`, `matchedLocations`
    include: [],

    // Whether to sort the result list, by score
    shouldSort: true,

    // The search function to use
    // Note that the default search function ([[Function]]) must conform to the following API:
    //
    //  @param pattern The pattern string to search
    //  @param options The search option
    //  [[Function]].constructor = function(pattern, options)
    //
    //  @param text: the string to search in for the pattern
    //  @return Object in the form of:
    //    - isMatch: boolean
    //    - score: Int
    //  [[Function]].prototype.search = function(text)
    searchFn: BitapSearcher,

    // Default sort function
    sortFn: function (a, b) {
      return a.score - b.score
    },

    // The get function to use when fetching an object's properties.
    // The default will search nested paths *ie foo.bar.baz*
    getFn: deepValue,

    // List of properties that will be searched. This also supports nested properties.
    keys: [],

    // Will print to the console. Useful for debugging.
    verbose: false,

    // When true, the search algorithm will search individual words **and** the full string,
    // computing the final score as a function of both. Note that when `tokenize` is `true`,
    // the `threshold`, `distance`, and `location` are inconsequential for individual tokens.
    tokenize: false,

    // When true, the result set will only include records that match all tokens. Will only work
    // if `tokenize` is also true.
    matchAllTokens: false,

    // Regex used to separate words when searching. Only applicable when `tokenize` is `true`.
    tokenSeparator: / +/g,

    // Minimum number of characters that must be matched before a result is considered a match
    minMatchCharLength: 1,

    // When true, the algorithm continues searching to the end of the input even if a perfect
    // match is found before the end of the same input.
    findAllMatches: false
  }

  /**
   * @constructor
   * @param {!Array} list
   * @param {!Object<string, *>} options
   */
  function Fuse (list, options) {
    var i
    var len
    var key
    var keys

    this.list = list
    this.options = options = options || {}

    for (key in defaultOptions) {
      if (!defaultOptions.hasOwnProperty(key)) {
        continue;
      }
      // Add boolean type options
      if (typeof defaultOptions[key] === 'boolean') {
        this.options[key] = key in options ? options[key] : defaultOptions[key];
      // Add all other options
      } else {
        this.options[key] = options[key] || defaultOptions[key]
      }
    }
  }

  Fuse.VERSION = '2.6.0'

  /**
   * Sets a new list for Fuse to match against.
   * @param {!Array} list
   * @return {!Array} The newly set list
   * @public
   */
  Fuse.prototype.set = function (list) {
    this.list = list
    return list
  }

  Fuse.prototype.search = function (pattern) {
    if (this.options.verbose) log('\nSearch term:', pattern, '\n')

    this.pattern = pattern
    this.results = []
    this.resultMap = {}
    this._keyMap = null

    this._prepareSearchers()
    this._startSearch()
    this._computeScore()
    this._sort()

    var output = this._format()
    return output
  }

  Fuse.prototype._prepareSearchers = function () {
    var options = this.options
    var pattern = this.pattern
    var searchFn = options.searchFn
    var tokens = pattern.split(options.tokenSeparator)
    var i = 0
    var len = tokens.length

    if (this.options.tokenize) {
      this.tokenSearchers = []
      for (; i < len; i++) {
        this.tokenSearchers.push(new searchFn(tokens[i], options))
      }
    }
    this.fullSeacher = new searchFn(pattern, options)
  }

  Fuse.prototype._startSearch = function () {
    var options = this.options
    var getFn = options.getFn
    var list = this.list
    var listLen = list.length
    var keys = this.options.keys
    var keysLen = keys.length
    var key
    var weight
    var item = null
    var i
    var j

    // Check the first item in the list, if it's a string, then we assume
    // that every item in the list is also a string, and thus it's a flattened array.
    if (typeof list[0] === 'string') {
      // Iterate over every item
      for (i = 0; i < listLen; i++) {
        this._analyze('', list[i], i, i)
      }
    } else {
      this._keyMap = {}
      // Otherwise, the first item is an Object (hopefully), and thus the searching
      // is done on the values of the keys of each item.
      // Iterate over every item
      for (i = 0; i < listLen; i++) {
        item = list[i]
        // Iterate over every key
        for (j = 0; j < keysLen; j++) {
          key = keys[j]
          if (typeof key !== 'string') {
            weight = (1 - key.weight) || 1
            this._keyMap[key.name] = {
              weight: weight
            }
            if (key.weight <= 0 || key.weight > 1) {
              throw new Error('Key weight has to be > 0 and <= 1')
            }
            key = key.name
          } else {
            this._keyMap[key] = {
              weight: 1
            }
          }
          this._analyze(key, getFn(item, key, []), item, i)
        }
      }
    }
  }

  Fuse.prototype._analyze = function (key, text, entity, index) {
    var options = this.options
    var words
    var scores
    var exists = false
    var existingResult
    var averageScore
    var finalScore
    var scoresLen
    var mainSearchResult
    var tokenSearcher
    var termScores
    var word
    var tokenSearchResult
    var hasMatchInText
    var checkTextMatches
    var i
    var j

    // Check if the text can be searched
    if (text === undefined || text === null) {
      return
    }

    scores = []

    var numTextMatches = 0

    if (typeof text === 'string') {
      words = text.split(options.tokenSeparator)

      if (options.verbose) log('---------\nKey:', key)

      if (this.options.tokenize) {
        for (i = 0; i < this.tokenSearchers.length; i++) {
          tokenSearcher = this.tokenSearchers[i]

          if (options.verbose) log('Pattern:', tokenSearcher.pattern)

          termScores = []
          hasMatchInText = false

          for (j = 0; j < words.length; j++) {
            word = words[j]
            tokenSearchResult = tokenSearcher.search(word)
            var obj = {}
            if (tokenSearchResult.isMatch) {
              obj[word] = tokenSearchResult.score
              exists = true
              hasMatchInText = true
              scores.push(tokenSearchResult.score)
            } else {
              obj[word] = 1
              if (!this.options.matchAllTokens) {
                scores.push(1)
              }
            }
            termScores.push(obj)
          }

          if (hasMatchInText) {
            numTextMatches++
          }

          if (options.verbose) log('Token scores:', termScores)
        }

        averageScore = scores[0]
        scoresLen = scores.length
        for (i = 1; i < scoresLen; i++) {
          averageScore += scores[i]
        }
        averageScore = averageScore / scoresLen

        if (options.verbose) log('Token score average:', averageScore)
      }

      mainSearchResult = this.fullSeacher.search(text)
      if (options.verbose) log('Full text score:', mainSearchResult.score)

      finalScore = mainSearchResult.score
      if (averageScore !== undefined) {
        finalScore = (finalScore + averageScore) / 2
      }

      if (options.verbose) log('Score average:', finalScore)

      checkTextMatches = (this.options.tokenize && this.options.matchAllTokens) ? numTextMatches >= this.tokenSearchers.length : true

      if (options.verbose) log('Check Matches', checkTextMatches)

      // If a match is found, add the item to <rawResults>, including its score
      if ((exists || mainSearchResult.isMatch) && checkTextMatches) {
        // Check if the item already exists in our results
        existingResult = this.resultMap[index]

        if (existingResult) {
          // Use the lowest score
          // existingResult.score, bitapResult.score
          existingResult.output.push({
            key: key,
            score: finalScore,
            matchedIndices: mainSearchResult.matchedIndices
          })
        } else {
          // Add it to the raw result list
          this.resultMap[index] = {
            item: entity,
            output: [{
              key: key,
              score: finalScore,
              matchedIndices: mainSearchResult.matchedIndices
            }]
          }

          this.results.push(this.resultMap[index])
        }
      }
    } else if (isArray(text)) {
      for (i = 0; i < text.length; i++) {
        this._analyze(key, text[i], entity, index)
      }
    }
  }

  Fuse.prototype._computeScore = function () {
    var i
    var j
    var keyMap = this._keyMap
    var totalScore
    var output
    var scoreLen
    var score
    var weight
    var results = this.results
    var bestScore
    var nScore

    if (this.options.verbose) log('\n\nComputing score:\n')

    for (i = 0; i < results.length; i++) {
      totalScore = 0
      output = results[i].output
      scoreLen = output.length

      bestScore = 1

      for (j = 0; j < scoreLen; j++) {
        score = output[j].score
        weight = keyMap ? keyMap[output[j].key].weight : 1

        nScore = score * weight

        if (weight !== 1) {
          bestScore = Math.min(bestScore, nScore)
        } else {
          totalScore += nScore
          output[j].nScore = nScore
        }
      }

      if (bestScore === 1) {
        results[i].score = totalScore / scoreLen
      } else {
        results[i].score = bestScore
      }

      if (this.options.verbose) log(results[i])
    }
  }

  Fuse.prototype._sort = function () {
    var options = this.options
    if (options.shouldSort) {
      if (options.verbose) log('\n\nSorting....')
      this.results.sort(options.sortFn)
    }
  }

  Fuse.prototype._format = function () {
    var options = this.options
    var getFn = options.getFn
    var finalOutput = []
    var item
    var i
    var len
    var results = this.results
    var replaceValue
    var getItemAtIndex
    var include = options.include

    if (options.verbose) log('\n\nOutput:\n\n', results)

    // Helper function, here for speed-up, which replaces the item with its value,
    // if the options specifies it,
    replaceValue = options.id ? function (index) {
      results[index].item = getFn(results[index].item, options.id, [])[0]
    } : function () {}

    getItemAtIndex = function (index) {
      var record = results[index]
      var data
      var j
      var output
      var _item
      var _result

      // If `include` has values, put the item in the result
      if (include.length > 0) {
        data = {
          item: record.item
        }
        if (include.indexOf('matches') !== -1) {
          output = record.output
          data.matches = []
          for (j = 0; j < output.length; j++) {
            _item = output[j]
            _result = {
              indices: _item.matchedIndices
            }
            if (_item.key) {
              _result.key = _item.key
            }
            data.matches.push(_result)
          }
        }

        if (include.indexOf('score') !== -1) {
          data.score = results[index].score
        }

      } else {
        data = record.item
      }

      return data
    }

    // From the results, push into a new array only the item identifier (if specified)
    // of the entire item.  This is because we don't want to return the <results>,
    // since it contains other metadata
    for (i = 0, len = results.length; i < len; i++) {
      replaceValue(i)
      item = getItemAtIndex(i)
      finalOutput.push(item)
    }

    return finalOutput
  }

  // Helpers

  function deepValue (obj, path, list) {
    var firstSegment
    var remaining
    var dotIndex
    var value
    var i
    var len

    if (!path) {
      // If there's no path left, we've gotten to the object we care about.
      list.push(obj)
    } else {
      dotIndex = path.indexOf('.')

      if (dotIndex !== -1) {
        firstSegment = path.slice(0, dotIndex)
        remaining = path.slice(dotIndex + 1)
      } else {
        firstSegment = path
      }

      value = obj[firstSegment]
      if (value !== null && value !== undefined) {
        if (!remaining && (typeof value === 'string' || typeof value === 'number')) {
          list.push(value)
        } else if (isArray(value)) {
          // Search each item in the array.
          for (i = 0, len = value.length; i < len; i++) {
            deepValue(value[i], remaining, list)
          }
        } else if (remaining) {
          // An object. Recurse further.
          deepValue(value, remaining, list)
        }
      }
    }

    return list
  }

  function isArray (obj) {
    return Object.prototype.toString.call(obj) === '[object Array]'
  }

  /**
   * Adapted from "Diff, Match and Patch", by Google
   *
   *   http://code.google.com/p/google-diff-match-patch/
   *
   * Modified by: Kirollos Risk <kirollos@gmail.com>
   * -----------------------------------------------
   * Details: the algorithm and structure was modified to allow the creation of
   * <Searcher> instances with a <search> method which does the actual
   * bitap search. The <pattern> (the string that is searched for) is only defined
   * once per instance and thus it eliminates redundant re-creation when searching
   * over a list of strings.
   *
   * Licensed under the Apache License, Version 2.0 (the "License")
   * you may not use this file except in compliance with the License.
   *
   * @constructor
   */
  function BitapSearcher (pattern, options) {
    options = options || {}
    this.options = options
    this.options.location = options.location || BitapSearcher.defaultOptions.location
    this.options.distance = 'distance' in options ? options.distance : BitapSearcher.defaultOptions.distance
    this.options.threshold = 'threshold' in options ? options.threshold : BitapSearcher.defaultOptions.threshold
    this.options.maxPatternLength = options.maxPatternLength || BitapSearcher.defaultOptions.maxPatternLength

    this.pattern = options.caseSensitive ? pattern : pattern.toLowerCase()
    this.patternLen = pattern.length

    if (this.patternLen <= this.options.maxPatternLength) {
      this.matchmask = 1 << (this.patternLen - 1)
      this.patternAlphabet = this._calculatePatternAlphabet()
    }
  }

  BitapSearcher.defaultOptions = {
    // Approximately where in the text is the pattern expected to be found?
    location: 0,

    // Determines how close the match must be to the fuzzy location (specified above).
    // An exact letter match which is 'distance' characters away from the fuzzy location
    // would score as a complete mismatch. A distance of '0' requires the match be at
    // the exact location specified, a threshold of '1000' would require a perfect match
    // to be within 800 characters of the fuzzy location to be found using a 0.8 threshold.
    distance: 100,

    // At what point does the match algorithm give up. A threshold of '0.0' requires a perfect match
    // (of both letters and location), a threshold of '1.0' would match anything.
    threshold: 0.6,

    // Machine word size
    maxPatternLength: 32
  }

  /**
   * Initialize the alphabet for the Bitap algorithm.
   * @return {Object} Hash of character locations.
   * @private
   */
  BitapSearcher.prototype._calculatePatternAlphabet = function () {
    var mask = {},
      i = 0

    for (i = 0; i < this.patternLen; i++) {
      mask[this.pattern.charAt(i)] = 0
    }

    for (i = 0; i < this.patternLen; i++) {
      mask[this.pattern.charAt(i)] |= 1 << (this.pattern.length - i - 1)
    }

    return mask
  }

  /**
   * Compute and return the score for a match with `e` errors and `x` location.
   * @param {number} errors Number of errors in match.
   * @param {number} location Location of match.
   * @return {number} Overall score for match (0.0 = good, 1.0 = bad).
   * @private
   */
  BitapSearcher.prototype._bitapScore = function (errors, location) {
    var accuracy = errors / this.patternLen,
      proximity = Math.abs(this.options.location - location)

    if (!this.options.distance) {
      // Dodge divide by zero error.
      return proximity ? 1.0 : accuracy
    }
    return accuracy + (proximity / this.options.distance)
  }

  /**
   * Compute and return the result of the search
   * @param {string} text The text to search in
   * @return {{isMatch: boolean, score: number}} Literal containing:
   *                          isMatch - Whether the text is a match or not
   *                          score - Overall score for the match
   * @public
   */
  BitapSearcher.prototype.search = function (text) {
    var options = this.options
    var i
    var j
    var textLen
    var findAllMatches
    var location
    var threshold
    var bestLoc
    var binMin
    var binMid
    var binMax
    var start, finish
    var bitArr
    var lastBitArr
    var charMatch
    var score
    var locations
    var matches
    var isMatched
    var matchMask
    var matchedIndices
    var matchesLen
    var match

    text = options.caseSensitive ? text : text.toLowerCase()

    if (this.pattern === text) {
      // Exact match
      return {
        isMatch: true,
        score: 0,
        matchedIndices: [[0, text.length - 1]]
      }
    }

    // When pattern length is greater than the machine word length, just do a a regex comparison
    if (this.patternLen > options.maxPatternLength) {
      matches = text.match(new RegExp(this.pattern.replace(options.tokenSeparator, '|')))
      isMatched = !!matches

      if (isMatched) {
        matchedIndices = []
        for (i = 0, matchesLen = matches.length; i < matchesLen; i++) {
          match = matches[i]
          matchedIndices.push([text.indexOf(match), match.length - 1])
        }
      }

      return {
        isMatch: isMatched,
        // TODO: revisit this score
        score: isMatched ? 0.5 : 1,
        matchedIndices: matchedIndices
      }
    }

    findAllMatches = options.findAllMatches

    location = options.location
    // Set starting location at beginning text and initialize the alphabet.
    textLen = text.length
    // Highest score beyond which we give up.
    threshold = options.threshold
    // Is there a nearby exact match? (speedup)
    bestLoc = text.indexOf(this.pattern, location)

    // a mask of the matches
    matchMask = []
    for (i = 0; i < textLen; i++) {
      matchMask[i] = 0
    }

    if (bestLoc != -1) {
      threshold = Math.min(this._bitapScore(0, bestLoc), threshold)
      // What about in the other direction? (speed up)
      bestLoc = text.lastIndexOf(this.pattern, location + this.patternLen)

      if (bestLoc != -1) {
        threshold = Math.min(this._bitapScore(0, bestLoc), threshold)
      }
    }

    bestLoc = -1
    score = 1
    locations = []
    binMax = this.patternLen + textLen

    for (i = 0; i < this.patternLen; i++) {
      // Scan for the best match; each iteration allows for one more error.
      // Run a binary search to determine how far from the match location we can stray
      // at this error level.
      binMin = 0
      binMid = binMax
      while (binMin < binMid) {
        if (this._bitapScore(i, location + binMid) <= threshold) {
          binMin = binMid
        } else {
          binMax = binMid
        }
        binMid = Math.floor((binMax - binMin) / 2 + binMin)
      }

      // Use the result from this iteration as the maximum for the next.
      binMax = binMid
      start = Math.max(1, location - binMid + 1)
      if (findAllMatches) {
        finish = textLen;
      } else {
        finish = Math.min(location + binMid, textLen) + this.patternLen
      }

      // Initialize the bit array
      bitArr = Array(finish + 2)

      bitArr[finish + 1] = (1 << i) - 1

      for (j = finish; j >= start; j--) {
        charMatch = this.patternAlphabet[text.charAt(j - 1)]

        if (charMatch) {
          matchMask[j - 1] = 1
        }

        if (i === 0) {
          // First pass: exact match.
          bitArr[j] = ((bitArr[j + 1] << 1) | 1) & charMatch
        } else {
          // Subsequent passes: fuzzy match.
          bitArr[j] = ((bitArr[j + 1] << 1) | 1) & charMatch | (((lastBitArr[j + 1] | lastBitArr[j]) << 1) | 1) | lastBitArr[j + 1]
        }
        if (bitArr[j] & this.matchmask) {
          score = this._bitapScore(i, j - 1)

          // This match will almost certainly be better than any existing match.
          // But check anyway.
          if (score <= threshold) {
            // Indeed it is
            threshold = score
            bestLoc = j - 1
            locations.push(bestLoc)

            if (bestLoc > location) {
              // When passing loc, don't exceed our current distance from loc.
              start = Math.max(1, 2 * location - bestLoc)
            } else {
              // Already passed loc, downhill from here on in.
              break
            }
          }
        }
      }

      // No hope for a (better) match at greater error levels.
      if (this._bitapScore(i + 1, location) > threshold) {
        break
      }
      lastBitArr = bitArr
    }

    matchedIndices = this._getMatchedIndices(matchMask)

    // Count exact matches (those with a score of 0) to be "almost" exact
    return {
      isMatch: bestLoc >= 0,
      score: score === 0 ? 0.001 : score,
      matchedIndices: matchedIndices
    }
  }

  BitapSearcher.prototype._getMatchedIndices = function (matchMask) {
    var matchedIndices = []
    var start = -1
    var end = -1
    var i = 0
    var match
    var len = matchMask.length
    for (; i < len; i++) {
      match = matchMask[i]
      if (match && start === -1) {
        start = i
      } else if (!match && start !== -1) {
        end = i - 1
        if ((end - start) + 1 >= this.options.minMatchCharLength) {
            matchedIndices.push([start, end])
        }
        start = -1
      }
    }
    if (matchMask[i - 1]) {
      if ((i-1 - start) + 1 >= this.options.minMatchCharLength) {
        matchedIndices.push([start, i - 1])
      }
    }
    return matchedIndices
  }

  // Export to Common JS Loader
  if (true) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = Fuse
  } else if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(function () {
      return Fuse
    })
  } else {
    // Browser globals (root is window)
    global.Fuse = Fuse
  }

})(this);


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var Fuse = __webpack_require__(0);
var books = [{
        title: "Old Man's War",
        author: {
            firstName: 'John',
            lastName: 'Scalzi'
        }
    }];
var fuse = new Fuse(books, { keys: ['title', 'author.firstName'] });
window.alert(Object.keys(fuse).map(function (key) { return key + ": " + fuse[key]; }));


/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgOTQ3MTgwNzcwMzE4NWNhYmVmN2UiLCJ3ZWJwYWNrOi8vLy4vfi9mdXNlLmpzL3NyYy9mdXNlLmpzIiwid2VicGFjazovLy8uL21haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLG1EQUEyQyxjQUFjOztBQUV6RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7QUNoRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7O0FBRUEsYUFBYSxlQUFlO0FBQzVCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBLHdFQUF3RSwwQ0FBMEM7QUFDbEg7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7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QUNBO0FBQ0E7QUFDQSxVQUFVLFNBQVM7QUFDbkI7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxHQUFHO0FBQ0g7QUFDQTtBQUNBOztBQUVBLENBQUM7Ozs7Ozs7O0FDM3pCRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLDRCQUE0QixzQ0FBc0M7QUFDbEUsbURBQW1ELCtCQUErQixFQUFFIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKVxuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuXG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBpZGVudGl0eSBmdW5jdGlvbiBmb3IgY2FsbGluZyBoYXJtb255IGltcG9ydHMgd2l0aCB0aGUgY29ycmVjdCBjb250ZXh0XG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmkgPSBmdW5jdGlvbih2YWx1ZSkgeyByZXR1cm4gdmFsdWU7IH07XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IDEpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIDk0NzE4MDc3MDMxODVjYWJlZjdlIiwiLyoqXG4gKiBAbGljZW5zZVxuICogRnVzZSAtIExpZ2h0d2VpZ2h0IGZ1enp5LXNlYXJjaFxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxMi0yMDE2IEtpcm9sbG9zIFJpc2sgPGtpcm9sbG9zQGdtYWlsLmNvbT4uXG4gKiBBbGwgUmlnaHRzIFJlc2VydmVkLiBBcGFjaGUgU29mdHdhcmUgTGljZW5zZSAyLjBcbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpXG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG47KGZ1bmN0aW9uIChnbG9iYWwpIHtcbiAgJ3VzZSBzdHJpY3QnXG5cbiAgLyoqIEB0eXBlIHtmdW5jdGlvbiguLi4qKX0gKi9cbiAgZnVuY3Rpb24gbG9nICgpIHtcbiAgICBjb25zb2xlLmxvZy5hcHBseShjb25zb2xlLCBhcmd1bWVudHMpXG4gIH1cblxuICB2YXIgZGVmYXVsdE9wdGlvbnMgPSB7XG4gICAgLy8gVGhlIG5hbWUgb2YgdGhlIGlkZW50aWZpZXIgcHJvcGVydHkuIElmIHNwZWNpZmllZCwgdGhlIHJldHVybmVkIHJlc3VsdCB3aWxsIGJlIGEgbGlzdFxuICAgIC8vIG9mIHRoZSBpdGVtcycgZGVudGlmaWVycywgb3RoZXJ3aXNlIGl0IHdpbGwgYmUgYSBsaXN0IG9mIHRoZSBpdGVtcy5cbiAgICBpZDogbnVsbCxcblxuICAgIC8vIEluZGljYXRlcyB3aGV0aGVyIGNvbXBhcmlzb25zIHNob3VsZCBiZSBjYXNlIHNlbnNpdGl2ZS5cblxuICAgIGNhc2VTZW5zaXRpdmU6IGZhbHNlLFxuXG4gICAgLy8gQW4gYXJyYXkgb2YgdmFsdWVzIHRoYXQgc2hvdWxkIGJlIGluY2x1ZGVkIGZyb20gdGhlIHNlYXJjaGVyJ3Mgb3V0cHV0LiBXaGVuIHRoaXMgYXJyYXlcbiAgICAvLyBjb250YWlucyBlbGVtZW50cywgZWFjaCByZXN1bHQgaW4gdGhlIGxpc3Qgd2lsbCBiZSBvZiB0aGUgZm9ybSBgeyBpdGVtOiAuLi4sIGluY2x1ZGUxOiAuLi4sIGluY2x1ZGUyOiAuLi4gfWAuXG4gICAgLy8gVmFsdWVzIHlvdSBjYW4gaW5jbHVkZSBhcmUgYHNjb3JlYCwgYG1hdGNoZWRMb2NhdGlvbnNgXG4gICAgaW5jbHVkZTogW10sXG5cbiAgICAvLyBXaGV0aGVyIHRvIHNvcnQgdGhlIHJlc3VsdCBsaXN0LCBieSBzY29yZVxuICAgIHNob3VsZFNvcnQ6IHRydWUsXG5cbiAgICAvLyBUaGUgc2VhcmNoIGZ1bmN0aW9uIHRvIHVzZVxuICAgIC8vIE5vdGUgdGhhdCB0aGUgZGVmYXVsdCBzZWFyY2ggZnVuY3Rpb24gKFtbRnVuY3Rpb25dXSkgbXVzdCBjb25mb3JtIHRvIHRoZSBmb2xsb3dpbmcgQVBJOlxuICAgIC8vXG4gICAgLy8gIEBwYXJhbSBwYXR0ZXJuIFRoZSBwYXR0ZXJuIHN0cmluZyB0byBzZWFyY2hcbiAgICAvLyAgQHBhcmFtIG9wdGlvbnMgVGhlIHNlYXJjaCBvcHRpb25cbiAgICAvLyAgW1tGdW5jdGlvbl1dLmNvbnN0cnVjdG9yID0gZnVuY3Rpb24ocGF0dGVybiwgb3B0aW9ucylcbiAgICAvL1xuICAgIC8vICBAcGFyYW0gdGV4dDogdGhlIHN0cmluZyB0byBzZWFyY2ggaW4gZm9yIHRoZSBwYXR0ZXJuXG4gICAgLy8gIEByZXR1cm4gT2JqZWN0IGluIHRoZSBmb3JtIG9mOlxuICAgIC8vICAgIC0gaXNNYXRjaDogYm9vbGVhblxuICAgIC8vICAgIC0gc2NvcmU6IEludFxuICAgIC8vICBbW0Z1bmN0aW9uXV0ucHJvdG90eXBlLnNlYXJjaCA9IGZ1bmN0aW9uKHRleHQpXG4gICAgc2VhcmNoRm46IEJpdGFwU2VhcmNoZXIsXG5cbiAgICAvLyBEZWZhdWx0IHNvcnQgZnVuY3Rpb25cbiAgICBzb3J0Rm46IGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICByZXR1cm4gYS5zY29yZSAtIGIuc2NvcmVcbiAgICB9LFxuXG4gICAgLy8gVGhlIGdldCBmdW5jdGlvbiB0byB1c2Ugd2hlbiBmZXRjaGluZyBhbiBvYmplY3QncyBwcm9wZXJ0aWVzLlxuICAgIC8vIFRoZSBkZWZhdWx0IHdpbGwgc2VhcmNoIG5lc3RlZCBwYXRocyAqaWUgZm9vLmJhci5iYXoqXG4gICAgZ2V0Rm46IGRlZXBWYWx1ZSxcblxuICAgIC8vIExpc3Qgb2YgcHJvcGVydGllcyB0aGF0IHdpbGwgYmUgc2VhcmNoZWQuIFRoaXMgYWxzbyBzdXBwb3J0cyBuZXN0ZWQgcHJvcGVydGllcy5cbiAgICBrZXlzOiBbXSxcblxuICAgIC8vIFdpbGwgcHJpbnQgdG8gdGhlIGNvbnNvbGUuIFVzZWZ1bCBmb3IgZGVidWdnaW5nLlxuICAgIHZlcmJvc2U6IGZhbHNlLFxuXG4gICAgLy8gV2hlbiB0cnVlLCB0aGUgc2VhcmNoIGFsZ29yaXRobSB3aWxsIHNlYXJjaCBpbmRpdmlkdWFsIHdvcmRzICoqYW5kKiogdGhlIGZ1bGwgc3RyaW5nLFxuICAgIC8vIGNvbXB1dGluZyB0aGUgZmluYWwgc2NvcmUgYXMgYSBmdW5jdGlvbiBvZiBib3RoLiBOb3RlIHRoYXQgd2hlbiBgdG9rZW5pemVgIGlzIGB0cnVlYCxcbiAgICAvLyB0aGUgYHRocmVzaG9sZGAsIGBkaXN0YW5jZWAsIGFuZCBgbG9jYXRpb25gIGFyZSBpbmNvbnNlcXVlbnRpYWwgZm9yIGluZGl2aWR1YWwgdG9rZW5zLlxuICAgIHRva2VuaXplOiBmYWxzZSxcblxuICAgIC8vIFdoZW4gdHJ1ZSwgdGhlIHJlc3VsdCBzZXQgd2lsbCBvbmx5IGluY2x1ZGUgcmVjb3JkcyB0aGF0IG1hdGNoIGFsbCB0b2tlbnMuIFdpbGwgb25seSB3b3JrXG4gICAgLy8gaWYgYHRva2VuaXplYCBpcyBhbHNvIHRydWUuXG4gICAgbWF0Y2hBbGxUb2tlbnM6IGZhbHNlLFxuXG4gICAgLy8gUmVnZXggdXNlZCB0byBzZXBhcmF0ZSB3b3JkcyB3aGVuIHNlYXJjaGluZy4gT25seSBhcHBsaWNhYmxlIHdoZW4gYHRva2VuaXplYCBpcyBgdHJ1ZWAuXG4gICAgdG9rZW5TZXBhcmF0b3I6IC8gKy9nLFxuXG4gICAgLy8gTWluaW11bSBudW1iZXIgb2YgY2hhcmFjdGVycyB0aGF0IG11c3QgYmUgbWF0Y2hlZCBiZWZvcmUgYSByZXN1bHQgaXMgY29uc2lkZXJlZCBhIG1hdGNoXG4gICAgbWluTWF0Y2hDaGFyTGVuZ3RoOiAxLFxuXG4gICAgLy8gV2hlbiB0cnVlLCB0aGUgYWxnb3JpdGhtIGNvbnRpbnVlcyBzZWFyY2hpbmcgdG8gdGhlIGVuZCBvZiB0aGUgaW5wdXQgZXZlbiBpZiBhIHBlcmZlY3RcbiAgICAvLyBtYXRjaCBpcyBmb3VuZCBiZWZvcmUgdGhlIGVuZCBvZiB0aGUgc2FtZSBpbnB1dC5cbiAgICBmaW5kQWxsTWF0Y2hlczogZmFsc2VcbiAgfVxuXG4gIC8qKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHBhcmFtIHshQXJyYXl9IGxpc3RcbiAgICogQHBhcmFtIHshT2JqZWN0PHN0cmluZywgKj59IG9wdGlvbnNcbiAgICovXG4gIGZ1bmN0aW9uIEZ1c2UgKGxpc3QsIG9wdGlvbnMpIHtcbiAgICB2YXIgaVxuICAgIHZhciBsZW5cbiAgICB2YXIga2V5XG4gICAgdmFyIGtleXNcblxuICAgIHRoaXMubGlzdCA9IGxpc3RcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxuXG4gICAgZm9yIChrZXkgaW4gZGVmYXVsdE9wdGlvbnMpIHtcbiAgICAgIGlmICghZGVmYXVsdE9wdGlvbnMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIC8vIEFkZCBib29sZWFuIHR5cGUgb3B0aW9uc1xuICAgICAgaWYgKHR5cGVvZiBkZWZhdWx0T3B0aW9uc1trZXldID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgdGhpcy5vcHRpb25zW2tleV0gPSBrZXkgaW4gb3B0aW9ucyA/IG9wdGlvbnNba2V5XSA6IGRlZmF1bHRPcHRpb25zW2tleV07XG4gICAgICAvLyBBZGQgYWxsIG90aGVyIG9wdGlvbnNcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMub3B0aW9uc1trZXldID0gb3B0aW9uc1trZXldIHx8IGRlZmF1bHRPcHRpb25zW2tleV1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBGdXNlLlZFUlNJT04gPSAnMi42LjAnXG5cbiAgLyoqXG4gICAqIFNldHMgYSBuZXcgbGlzdCBmb3IgRnVzZSB0byBtYXRjaCBhZ2FpbnN0LlxuICAgKiBAcGFyYW0geyFBcnJheX0gbGlzdFxuICAgKiBAcmV0dXJuIHshQXJyYXl9IFRoZSBuZXdseSBzZXQgbGlzdFxuICAgKiBAcHVibGljXG4gICAqL1xuICBGdXNlLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiAobGlzdCkge1xuICAgIHRoaXMubGlzdCA9IGxpc3RcbiAgICByZXR1cm4gbGlzdFxuICB9XG5cbiAgRnVzZS5wcm90b3R5cGUuc2VhcmNoID0gZnVuY3Rpb24gKHBhdHRlcm4pIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLnZlcmJvc2UpIGxvZygnXFxuU2VhcmNoIHRlcm06JywgcGF0dGVybiwgJ1xcbicpXG5cbiAgICB0aGlzLnBhdHRlcm4gPSBwYXR0ZXJuXG4gICAgdGhpcy5yZXN1bHRzID0gW11cbiAgICB0aGlzLnJlc3VsdE1hcCA9IHt9XG4gICAgdGhpcy5fa2V5TWFwID0gbnVsbFxuXG4gICAgdGhpcy5fcHJlcGFyZVNlYXJjaGVycygpXG4gICAgdGhpcy5fc3RhcnRTZWFyY2goKVxuICAgIHRoaXMuX2NvbXB1dGVTY29yZSgpXG4gICAgdGhpcy5fc29ydCgpXG5cbiAgICB2YXIgb3V0cHV0ID0gdGhpcy5fZm9ybWF0KClcbiAgICByZXR1cm4gb3V0cHV0XG4gIH1cblxuICBGdXNlLnByb3RvdHlwZS5fcHJlcGFyZVNlYXJjaGVycyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9uc1xuICAgIHZhciBwYXR0ZXJuID0gdGhpcy5wYXR0ZXJuXG4gICAgdmFyIHNlYXJjaEZuID0gb3B0aW9ucy5zZWFyY2hGblxuICAgIHZhciB0b2tlbnMgPSBwYXR0ZXJuLnNwbGl0KG9wdGlvbnMudG9rZW5TZXBhcmF0b3IpXG4gICAgdmFyIGkgPSAwXG4gICAgdmFyIGxlbiA9IHRva2Vucy5sZW5ndGhcblxuICAgIGlmICh0aGlzLm9wdGlvbnMudG9rZW5pemUpIHtcbiAgICAgIHRoaXMudG9rZW5TZWFyY2hlcnMgPSBbXVxuICAgICAgZm9yICg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICB0aGlzLnRva2VuU2VhcmNoZXJzLnB1c2gobmV3IHNlYXJjaEZuKHRva2Vuc1tpXSwgb3B0aW9ucykpXG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuZnVsbFNlYWNoZXIgPSBuZXcgc2VhcmNoRm4ocGF0dGVybiwgb3B0aW9ucylcbiAgfVxuXG4gIEZ1c2UucHJvdG90eXBlLl9zdGFydFNlYXJjaCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9uc1xuICAgIHZhciBnZXRGbiA9IG9wdGlvbnMuZ2V0Rm5cbiAgICB2YXIgbGlzdCA9IHRoaXMubGlzdFxuICAgIHZhciBsaXN0TGVuID0gbGlzdC5sZW5ndGhcbiAgICB2YXIga2V5cyA9IHRoaXMub3B0aW9ucy5rZXlzXG4gICAgdmFyIGtleXNMZW4gPSBrZXlzLmxlbmd0aFxuICAgIHZhciBrZXlcbiAgICB2YXIgd2VpZ2h0XG4gICAgdmFyIGl0ZW0gPSBudWxsXG4gICAgdmFyIGlcbiAgICB2YXIgalxuXG4gICAgLy8gQ2hlY2sgdGhlIGZpcnN0IGl0ZW0gaW4gdGhlIGxpc3QsIGlmIGl0J3MgYSBzdHJpbmcsIHRoZW4gd2UgYXNzdW1lXG4gICAgLy8gdGhhdCBldmVyeSBpdGVtIGluIHRoZSBsaXN0IGlzIGFsc28gYSBzdHJpbmcsIGFuZCB0aHVzIGl0J3MgYSBmbGF0dGVuZWQgYXJyYXkuXG4gICAgaWYgKHR5cGVvZiBsaXN0WzBdID09PSAnc3RyaW5nJykge1xuICAgICAgLy8gSXRlcmF0ZSBvdmVyIGV2ZXJ5IGl0ZW1cbiAgICAgIGZvciAoaSA9IDA7IGkgPCBsaXN0TGVuOyBpKyspIHtcbiAgICAgICAgdGhpcy5fYW5hbHl6ZSgnJywgbGlzdFtpXSwgaSwgaSlcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fa2V5TWFwID0ge31cbiAgICAgIC8vIE90aGVyd2lzZSwgdGhlIGZpcnN0IGl0ZW0gaXMgYW4gT2JqZWN0IChob3BlZnVsbHkpLCBhbmQgdGh1cyB0aGUgc2VhcmNoaW5nXG4gICAgICAvLyBpcyBkb25lIG9uIHRoZSB2YWx1ZXMgb2YgdGhlIGtleXMgb2YgZWFjaCBpdGVtLlxuICAgICAgLy8gSXRlcmF0ZSBvdmVyIGV2ZXJ5IGl0ZW1cbiAgICAgIGZvciAoaSA9IDA7IGkgPCBsaXN0TGVuOyBpKyspIHtcbiAgICAgICAgaXRlbSA9IGxpc3RbaV1cbiAgICAgICAgLy8gSXRlcmF0ZSBvdmVyIGV2ZXJ5IGtleVxuICAgICAgICBmb3IgKGogPSAwOyBqIDwga2V5c0xlbjsgaisrKSB7XG4gICAgICAgICAga2V5ID0ga2V5c1tqXVxuICAgICAgICAgIGlmICh0eXBlb2Yga2V5ICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgd2VpZ2h0ID0gKDEgLSBrZXkud2VpZ2h0KSB8fCAxXG4gICAgICAgICAgICB0aGlzLl9rZXlNYXBba2V5Lm5hbWVdID0ge1xuICAgICAgICAgICAgICB3ZWlnaHQ6IHdlaWdodFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGtleS53ZWlnaHQgPD0gMCB8fCBrZXkud2VpZ2h0ID4gMSkge1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0tleSB3ZWlnaHQgaGFzIHRvIGJlID4gMCBhbmQgPD0gMScpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBrZXkgPSBrZXkubmFtZVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9rZXlNYXBba2V5XSA9IHtcbiAgICAgICAgICAgICAgd2VpZ2h0OiAxXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuX2FuYWx5emUoa2V5LCBnZXRGbihpdGVtLCBrZXksIFtdKSwgaXRlbSwgaSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIEZ1c2UucHJvdG90eXBlLl9hbmFseXplID0gZnVuY3Rpb24gKGtleSwgdGV4dCwgZW50aXR5LCBpbmRleCkge1xuICAgIHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zXG4gICAgdmFyIHdvcmRzXG4gICAgdmFyIHNjb3Jlc1xuICAgIHZhciBleGlzdHMgPSBmYWxzZVxuICAgIHZhciBleGlzdGluZ1Jlc3VsdFxuICAgIHZhciBhdmVyYWdlU2NvcmVcbiAgICB2YXIgZmluYWxTY29yZVxuICAgIHZhciBzY29yZXNMZW5cbiAgICB2YXIgbWFpblNlYXJjaFJlc3VsdFxuICAgIHZhciB0b2tlblNlYXJjaGVyXG4gICAgdmFyIHRlcm1TY29yZXNcbiAgICB2YXIgd29yZFxuICAgIHZhciB0b2tlblNlYXJjaFJlc3VsdFxuICAgIHZhciBoYXNNYXRjaEluVGV4dFxuICAgIHZhciBjaGVja1RleHRNYXRjaGVzXG4gICAgdmFyIGlcbiAgICB2YXIgalxuXG4gICAgLy8gQ2hlY2sgaWYgdGhlIHRleHQgY2FuIGJlIHNlYXJjaGVkXG4gICAgaWYgKHRleHQgPT09IHVuZGVmaW5lZCB8fCB0ZXh0ID09PSBudWxsKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBzY29yZXMgPSBbXVxuXG4gICAgdmFyIG51bVRleHRNYXRjaGVzID0gMFxuXG4gICAgaWYgKHR5cGVvZiB0ZXh0ID09PSAnc3RyaW5nJykge1xuICAgICAgd29yZHMgPSB0ZXh0LnNwbGl0KG9wdGlvbnMudG9rZW5TZXBhcmF0b3IpXG5cbiAgICAgIGlmIChvcHRpb25zLnZlcmJvc2UpIGxvZygnLS0tLS0tLS0tXFxuS2V5OicsIGtleSlcblxuICAgICAgaWYgKHRoaXMub3B0aW9ucy50b2tlbml6ZSkge1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy50b2tlblNlYXJjaGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHRva2VuU2VhcmNoZXIgPSB0aGlzLnRva2VuU2VhcmNoZXJzW2ldXG5cbiAgICAgICAgICBpZiAob3B0aW9ucy52ZXJib3NlKSBsb2coJ1BhdHRlcm46JywgdG9rZW5TZWFyY2hlci5wYXR0ZXJuKVxuXG4gICAgICAgICAgdGVybVNjb3JlcyA9IFtdXG4gICAgICAgICAgaGFzTWF0Y2hJblRleHQgPSBmYWxzZVxuXG4gICAgICAgICAgZm9yIChqID0gMDsgaiA8IHdvcmRzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICB3b3JkID0gd29yZHNbal1cbiAgICAgICAgICAgIHRva2VuU2VhcmNoUmVzdWx0ID0gdG9rZW5TZWFyY2hlci5zZWFyY2god29yZClcbiAgICAgICAgICAgIHZhciBvYmogPSB7fVxuICAgICAgICAgICAgaWYgKHRva2VuU2VhcmNoUmVzdWx0LmlzTWF0Y2gpIHtcbiAgICAgICAgICAgICAgb2JqW3dvcmRdID0gdG9rZW5TZWFyY2hSZXN1bHQuc2NvcmVcbiAgICAgICAgICAgICAgZXhpc3RzID0gdHJ1ZVxuICAgICAgICAgICAgICBoYXNNYXRjaEluVGV4dCA9IHRydWVcbiAgICAgICAgICAgICAgc2NvcmVzLnB1c2godG9rZW5TZWFyY2hSZXN1bHQuc2NvcmUpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBvYmpbd29yZF0gPSAxXG4gICAgICAgICAgICAgIGlmICghdGhpcy5vcHRpb25zLm1hdGNoQWxsVG9rZW5zKSB7XG4gICAgICAgICAgICAgICAgc2NvcmVzLnB1c2goMSlcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGVybVNjb3Jlcy5wdXNoKG9iailcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoaGFzTWF0Y2hJblRleHQpIHtcbiAgICAgICAgICAgIG51bVRleHRNYXRjaGVzKytcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAob3B0aW9ucy52ZXJib3NlKSBsb2coJ1Rva2VuIHNjb3JlczonLCB0ZXJtU2NvcmVzKVxuICAgICAgICB9XG5cbiAgICAgICAgYXZlcmFnZVNjb3JlID0gc2NvcmVzWzBdXG4gICAgICAgIHNjb3Jlc0xlbiA9IHNjb3Jlcy5sZW5ndGhcbiAgICAgICAgZm9yIChpID0gMTsgaSA8IHNjb3Jlc0xlbjsgaSsrKSB7XG4gICAgICAgICAgYXZlcmFnZVNjb3JlICs9IHNjb3Jlc1tpXVxuICAgICAgICB9XG4gICAgICAgIGF2ZXJhZ2VTY29yZSA9IGF2ZXJhZ2VTY29yZSAvIHNjb3Jlc0xlblxuXG4gICAgICAgIGlmIChvcHRpb25zLnZlcmJvc2UpIGxvZygnVG9rZW4gc2NvcmUgYXZlcmFnZTonLCBhdmVyYWdlU2NvcmUpXG4gICAgICB9XG5cbiAgICAgIG1haW5TZWFyY2hSZXN1bHQgPSB0aGlzLmZ1bGxTZWFjaGVyLnNlYXJjaCh0ZXh0KVxuICAgICAgaWYgKG9wdGlvbnMudmVyYm9zZSkgbG9nKCdGdWxsIHRleHQgc2NvcmU6JywgbWFpblNlYXJjaFJlc3VsdC5zY29yZSlcblxuICAgICAgZmluYWxTY29yZSA9IG1haW5TZWFyY2hSZXN1bHQuc2NvcmVcbiAgICAgIGlmIChhdmVyYWdlU2NvcmUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBmaW5hbFNjb3JlID0gKGZpbmFsU2NvcmUgKyBhdmVyYWdlU2NvcmUpIC8gMlxuICAgICAgfVxuXG4gICAgICBpZiAob3B0aW9ucy52ZXJib3NlKSBsb2coJ1Njb3JlIGF2ZXJhZ2U6JywgZmluYWxTY29yZSlcblxuICAgICAgY2hlY2tUZXh0TWF0Y2hlcyA9ICh0aGlzLm9wdGlvbnMudG9rZW5pemUgJiYgdGhpcy5vcHRpb25zLm1hdGNoQWxsVG9rZW5zKSA/IG51bVRleHRNYXRjaGVzID49IHRoaXMudG9rZW5TZWFyY2hlcnMubGVuZ3RoIDogdHJ1ZVxuXG4gICAgICBpZiAob3B0aW9ucy52ZXJib3NlKSBsb2coJ0NoZWNrIE1hdGNoZXMnLCBjaGVja1RleHRNYXRjaGVzKVxuXG4gICAgICAvLyBJZiBhIG1hdGNoIGlzIGZvdW5kLCBhZGQgdGhlIGl0ZW0gdG8gPHJhd1Jlc3VsdHM+LCBpbmNsdWRpbmcgaXRzIHNjb3JlXG4gICAgICBpZiAoKGV4aXN0cyB8fCBtYWluU2VhcmNoUmVzdWx0LmlzTWF0Y2gpICYmIGNoZWNrVGV4dE1hdGNoZXMpIHtcbiAgICAgICAgLy8gQ2hlY2sgaWYgdGhlIGl0ZW0gYWxyZWFkeSBleGlzdHMgaW4gb3VyIHJlc3VsdHNcbiAgICAgICAgZXhpc3RpbmdSZXN1bHQgPSB0aGlzLnJlc3VsdE1hcFtpbmRleF1cblxuICAgICAgICBpZiAoZXhpc3RpbmdSZXN1bHQpIHtcbiAgICAgICAgICAvLyBVc2UgdGhlIGxvd2VzdCBzY29yZVxuICAgICAgICAgIC8vIGV4aXN0aW5nUmVzdWx0LnNjb3JlLCBiaXRhcFJlc3VsdC5zY29yZVxuICAgICAgICAgIGV4aXN0aW5nUmVzdWx0Lm91dHB1dC5wdXNoKHtcbiAgICAgICAgICAgIGtleToga2V5LFxuICAgICAgICAgICAgc2NvcmU6IGZpbmFsU2NvcmUsXG4gICAgICAgICAgICBtYXRjaGVkSW5kaWNlczogbWFpblNlYXJjaFJlc3VsdC5tYXRjaGVkSW5kaWNlc1xuICAgICAgICAgIH0pXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gQWRkIGl0IHRvIHRoZSByYXcgcmVzdWx0IGxpc3RcbiAgICAgICAgICB0aGlzLnJlc3VsdE1hcFtpbmRleF0gPSB7XG4gICAgICAgICAgICBpdGVtOiBlbnRpdHksXG4gICAgICAgICAgICBvdXRwdXQ6IFt7XG4gICAgICAgICAgICAgIGtleToga2V5LFxuICAgICAgICAgICAgICBzY29yZTogZmluYWxTY29yZSxcbiAgICAgICAgICAgICAgbWF0Y2hlZEluZGljZXM6IG1haW5TZWFyY2hSZXN1bHQubWF0Y2hlZEluZGljZXNcbiAgICAgICAgICAgIH1dXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGhpcy5yZXN1bHRzLnB1c2godGhpcy5yZXN1bHRNYXBbaW5kZXhdKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChpc0FycmF5KHRleHQpKSB7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgdGV4dC5sZW5ndGg7IGkrKykge1xuICAgICAgICB0aGlzLl9hbmFseXplKGtleSwgdGV4dFtpXSwgZW50aXR5LCBpbmRleClcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBGdXNlLnByb3RvdHlwZS5fY29tcHV0ZVNjb3JlID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBpXG4gICAgdmFyIGpcbiAgICB2YXIga2V5TWFwID0gdGhpcy5fa2V5TWFwXG4gICAgdmFyIHRvdGFsU2NvcmVcbiAgICB2YXIgb3V0cHV0XG4gICAgdmFyIHNjb3JlTGVuXG4gICAgdmFyIHNjb3JlXG4gICAgdmFyIHdlaWdodFxuICAgIHZhciByZXN1bHRzID0gdGhpcy5yZXN1bHRzXG4gICAgdmFyIGJlc3RTY29yZVxuICAgIHZhciBuU2NvcmVcblxuICAgIGlmICh0aGlzLm9wdGlvbnMudmVyYm9zZSkgbG9nKCdcXG5cXG5Db21wdXRpbmcgc2NvcmU6XFxuJylcblxuICAgIGZvciAoaSA9IDA7IGkgPCByZXN1bHRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB0b3RhbFNjb3JlID0gMFxuICAgICAgb3V0cHV0ID0gcmVzdWx0c1tpXS5vdXRwdXRcbiAgICAgIHNjb3JlTGVuID0gb3V0cHV0Lmxlbmd0aFxuXG4gICAgICBiZXN0U2NvcmUgPSAxXG5cbiAgICAgIGZvciAoaiA9IDA7IGogPCBzY29yZUxlbjsgaisrKSB7XG4gICAgICAgIHNjb3JlID0gb3V0cHV0W2pdLnNjb3JlXG4gICAgICAgIHdlaWdodCA9IGtleU1hcCA/IGtleU1hcFtvdXRwdXRbal0ua2V5XS53ZWlnaHQgOiAxXG5cbiAgICAgICAgblNjb3JlID0gc2NvcmUgKiB3ZWlnaHRcblxuICAgICAgICBpZiAod2VpZ2h0ICE9PSAxKSB7XG4gICAgICAgICAgYmVzdFNjb3JlID0gTWF0aC5taW4oYmVzdFNjb3JlLCBuU2NvcmUpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdG90YWxTY29yZSArPSBuU2NvcmVcbiAgICAgICAgICBvdXRwdXRbal0ublNjb3JlID0gblNjb3JlXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGJlc3RTY29yZSA9PT0gMSkge1xuICAgICAgICByZXN1bHRzW2ldLnNjb3JlID0gdG90YWxTY29yZSAvIHNjb3JlTGVuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHRzW2ldLnNjb3JlID0gYmVzdFNjb3JlXG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMudmVyYm9zZSkgbG9nKHJlc3VsdHNbaV0pXG4gICAgfVxuICB9XG5cbiAgRnVzZS5wcm90b3R5cGUuX3NvcnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnNcbiAgICBpZiAob3B0aW9ucy5zaG91bGRTb3J0KSB7XG4gICAgICBpZiAob3B0aW9ucy52ZXJib3NlKSBsb2coJ1xcblxcblNvcnRpbmcuLi4uJylcbiAgICAgIHRoaXMucmVzdWx0cy5zb3J0KG9wdGlvbnMuc29ydEZuKVxuICAgIH1cbiAgfVxuXG4gIEZ1c2UucHJvdG90eXBlLl9mb3JtYXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnNcbiAgICB2YXIgZ2V0Rm4gPSBvcHRpb25zLmdldEZuXG4gICAgdmFyIGZpbmFsT3V0cHV0ID0gW11cbiAgICB2YXIgaXRlbVxuICAgIHZhciBpXG4gICAgdmFyIGxlblxuICAgIHZhciByZXN1bHRzID0gdGhpcy5yZXN1bHRzXG4gICAgdmFyIHJlcGxhY2VWYWx1ZVxuICAgIHZhciBnZXRJdGVtQXRJbmRleFxuICAgIHZhciBpbmNsdWRlID0gb3B0aW9ucy5pbmNsdWRlXG5cbiAgICBpZiAob3B0aW9ucy52ZXJib3NlKSBsb2coJ1xcblxcbk91dHB1dDpcXG5cXG4nLCByZXN1bHRzKVxuXG4gICAgLy8gSGVscGVyIGZ1bmN0aW9uLCBoZXJlIGZvciBzcGVlZC11cCwgd2hpY2ggcmVwbGFjZXMgdGhlIGl0ZW0gd2l0aCBpdHMgdmFsdWUsXG4gICAgLy8gaWYgdGhlIG9wdGlvbnMgc3BlY2lmaWVzIGl0LFxuICAgIHJlcGxhY2VWYWx1ZSA9IG9wdGlvbnMuaWQgPyBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgIHJlc3VsdHNbaW5kZXhdLml0ZW0gPSBnZXRGbihyZXN1bHRzW2luZGV4XS5pdGVtLCBvcHRpb25zLmlkLCBbXSlbMF1cbiAgICB9IDogZnVuY3Rpb24gKCkge31cblxuICAgIGdldEl0ZW1BdEluZGV4ID0gZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgICB2YXIgcmVjb3JkID0gcmVzdWx0c1tpbmRleF1cbiAgICAgIHZhciBkYXRhXG4gICAgICB2YXIgalxuICAgICAgdmFyIG91dHB1dFxuICAgICAgdmFyIF9pdGVtXG4gICAgICB2YXIgX3Jlc3VsdFxuXG4gICAgICAvLyBJZiBgaW5jbHVkZWAgaGFzIHZhbHVlcywgcHV0IHRoZSBpdGVtIGluIHRoZSByZXN1bHRcbiAgICAgIGlmIChpbmNsdWRlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgZGF0YSA9IHtcbiAgICAgICAgICBpdGVtOiByZWNvcmQuaXRlbVxuICAgICAgICB9XG4gICAgICAgIGlmIChpbmNsdWRlLmluZGV4T2YoJ21hdGNoZXMnKSAhPT0gLTEpIHtcbiAgICAgICAgICBvdXRwdXQgPSByZWNvcmQub3V0cHV0XG4gICAgICAgICAgZGF0YS5tYXRjaGVzID0gW11cbiAgICAgICAgICBmb3IgKGogPSAwOyBqIDwgb3V0cHV0Lmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICBfaXRlbSA9IG91dHB1dFtqXVxuICAgICAgICAgICAgX3Jlc3VsdCA9IHtcbiAgICAgICAgICAgICAgaW5kaWNlczogX2l0ZW0ubWF0Y2hlZEluZGljZXNcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChfaXRlbS5rZXkpIHtcbiAgICAgICAgICAgICAgX3Jlc3VsdC5rZXkgPSBfaXRlbS5rZXlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRhdGEubWF0Y2hlcy5wdXNoKF9yZXN1bHQpXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGluY2x1ZGUuaW5kZXhPZignc2NvcmUnKSAhPT0gLTEpIHtcbiAgICAgICAgICBkYXRhLnNjb3JlID0gcmVzdWx0c1tpbmRleF0uc2NvcmVcbiAgICAgICAgfVxuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkYXRhID0gcmVjb3JkLml0ZW1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGRhdGFcbiAgICB9XG5cbiAgICAvLyBGcm9tIHRoZSByZXN1bHRzLCBwdXNoIGludG8gYSBuZXcgYXJyYXkgb25seSB0aGUgaXRlbSBpZGVudGlmaWVyIChpZiBzcGVjaWZpZWQpXG4gICAgLy8gb2YgdGhlIGVudGlyZSBpdGVtLiAgVGhpcyBpcyBiZWNhdXNlIHdlIGRvbid0IHdhbnQgdG8gcmV0dXJuIHRoZSA8cmVzdWx0cz4sXG4gICAgLy8gc2luY2UgaXQgY29udGFpbnMgb3RoZXIgbWV0YWRhdGFcbiAgICBmb3IgKGkgPSAwLCBsZW4gPSByZXN1bHRzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICByZXBsYWNlVmFsdWUoaSlcbiAgICAgIGl0ZW0gPSBnZXRJdGVtQXRJbmRleChpKVxuICAgICAgZmluYWxPdXRwdXQucHVzaChpdGVtKVxuICAgIH1cblxuICAgIHJldHVybiBmaW5hbE91dHB1dFxuICB9XG5cbiAgLy8gSGVscGVyc1xuXG4gIGZ1bmN0aW9uIGRlZXBWYWx1ZSAob2JqLCBwYXRoLCBsaXN0KSB7XG4gICAgdmFyIGZpcnN0U2VnbWVudFxuICAgIHZhciByZW1haW5pbmdcbiAgICB2YXIgZG90SW5kZXhcbiAgICB2YXIgdmFsdWVcbiAgICB2YXIgaVxuICAgIHZhciBsZW5cblxuICAgIGlmICghcGF0aCkge1xuICAgICAgLy8gSWYgdGhlcmUncyBubyBwYXRoIGxlZnQsIHdlJ3ZlIGdvdHRlbiB0byB0aGUgb2JqZWN0IHdlIGNhcmUgYWJvdXQuXG4gICAgICBsaXN0LnB1c2gob2JqKVxuICAgIH0gZWxzZSB7XG4gICAgICBkb3RJbmRleCA9IHBhdGguaW5kZXhPZignLicpXG5cbiAgICAgIGlmIChkb3RJbmRleCAhPT0gLTEpIHtcbiAgICAgICAgZmlyc3RTZWdtZW50ID0gcGF0aC5zbGljZSgwLCBkb3RJbmRleClcbiAgICAgICAgcmVtYWluaW5nID0gcGF0aC5zbGljZShkb3RJbmRleCArIDEpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmaXJzdFNlZ21lbnQgPSBwYXRoXG4gICAgICB9XG5cbiAgICAgIHZhbHVlID0gb2JqW2ZpcnN0U2VnbWVudF1cbiAgICAgIGlmICh2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGlmICghcmVtYWluaW5nICYmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnIHx8IHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicpKSB7XG4gICAgICAgICAgbGlzdC5wdXNoKHZhbHVlKVxuICAgICAgICB9IGVsc2UgaWYgKGlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgICAgLy8gU2VhcmNoIGVhY2ggaXRlbSBpbiB0aGUgYXJyYXkuXG4gICAgICAgICAgZm9yIChpID0gMCwgbGVuID0gdmFsdWUubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgIGRlZXBWYWx1ZSh2YWx1ZVtpXSwgcmVtYWluaW5nLCBsaXN0KVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChyZW1haW5pbmcpIHtcbiAgICAgICAgICAvLyBBbiBvYmplY3QuIFJlY3Vyc2UgZnVydGhlci5cbiAgICAgICAgICBkZWVwVmFsdWUodmFsdWUsIHJlbWFpbmluZywgbGlzdClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBsaXN0XG4gIH1cblxuICBmdW5jdGlvbiBpc0FycmF5IChvYmopIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IEFycmF5XSdcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGFwdGVkIGZyb20gXCJEaWZmLCBNYXRjaCBhbmQgUGF0Y2hcIiwgYnkgR29vZ2xlXG4gICAqXG4gICAqICAgaHR0cDovL2NvZGUuZ29vZ2xlLmNvbS9wL2dvb2dsZS1kaWZmLW1hdGNoLXBhdGNoL1xuICAgKlxuICAgKiBNb2RpZmllZCBieTogS2lyb2xsb3MgUmlzayA8a2lyb2xsb3NAZ21haWwuY29tPlxuICAgKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgKiBEZXRhaWxzOiB0aGUgYWxnb3JpdGhtIGFuZCBzdHJ1Y3R1cmUgd2FzIG1vZGlmaWVkIHRvIGFsbG93IHRoZSBjcmVhdGlvbiBvZlxuICAgKiA8U2VhcmNoZXI+IGluc3RhbmNlcyB3aXRoIGEgPHNlYXJjaD4gbWV0aG9kIHdoaWNoIGRvZXMgdGhlIGFjdHVhbFxuICAgKiBiaXRhcCBzZWFyY2guIFRoZSA8cGF0dGVybj4gKHRoZSBzdHJpbmcgdGhhdCBpcyBzZWFyY2hlZCBmb3IpIGlzIG9ubHkgZGVmaW5lZFxuICAgKiBvbmNlIHBlciBpbnN0YW5jZSBhbmQgdGh1cyBpdCBlbGltaW5hdGVzIHJlZHVuZGFudCByZS1jcmVhdGlvbiB3aGVuIHNlYXJjaGluZ1xuICAgKiBvdmVyIGEgbGlzdCBvZiBzdHJpbmdzLlxuICAgKlxuICAgKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpXG4gICAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAgICpcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqL1xuICBmdW5jdGlvbiBCaXRhcFNlYXJjaGVyIChwYXR0ZXJuLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zXG4gICAgdGhpcy5vcHRpb25zLmxvY2F0aW9uID0gb3B0aW9ucy5sb2NhdGlvbiB8fCBCaXRhcFNlYXJjaGVyLmRlZmF1bHRPcHRpb25zLmxvY2F0aW9uXG4gICAgdGhpcy5vcHRpb25zLmRpc3RhbmNlID0gJ2Rpc3RhbmNlJyBpbiBvcHRpb25zID8gb3B0aW9ucy5kaXN0YW5jZSA6IEJpdGFwU2VhcmNoZXIuZGVmYXVsdE9wdGlvbnMuZGlzdGFuY2VcbiAgICB0aGlzLm9wdGlvbnMudGhyZXNob2xkID0gJ3RocmVzaG9sZCcgaW4gb3B0aW9ucyA/IG9wdGlvbnMudGhyZXNob2xkIDogQml0YXBTZWFyY2hlci5kZWZhdWx0T3B0aW9ucy50aHJlc2hvbGRcbiAgICB0aGlzLm9wdGlvbnMubWF4UGF0dGVybkxlbmd0aCA9IG9wdGlvbnMubWF4UGF0dGVybkxlbmd0aCB8fCBCaXRhcFNlYXJjaGVyLmRlZmF1bHRPcHRpb25zLm1heFBhdHRlcm5MZW5ndGhcblxuICAgIHRoaXMucGF0dGVybiA9IG9wdGlvbnMuY2FzZVNlbnNpdGl2ZSA/IHBhdHRlcm4gOiBwYXR0ZXJuLnRvTG93ZXJDYXNlKClcbiAgICB0aGlzLnBhdHRlcm5MZW4gPSBwYXR0ZXJuLmxlbmd0aFxuXG4gICAgaWYgKHRoaXMucGF0dGVybkxlbiA8PSB0aGlzLm9wdGlvbnMubWF4UGF0dGVybkxlbmd0aCkge1xuICAgICAgdGhpcy5tYXRjaG1hc2sgPSAxIDw8ICh0aGlzLnBhdHRlcm5MZW4gLSAxKVxuICAgICAgdGhpcy5wYXR0ZXJuQWxwaGFiZXQgPSB0aGlzLl9jYWxjdWxhdGVQYXR0ZXJuQWxwaGFiZXQoKVxuICAgIH1cbiAgfVxuXG4gIEJpdGFwU2VhcmNoZXIuZGVmYXVsdE9wdGlvbnMgPSB7XG4gICAgLy8gQXBwcm94aW1hdGVseSB3aGVyZSBpbiB0aGUgdGV4dCBpcyB0aGUgcGF0dGVybiBleHBlY3RlZCB0byBiZSBmb3VuZD9cbiAgICBsb2NhdGlvbjogMCxcblxuICAgIC8vIERldGVybWluZXMgaG93IGNsb3NlIHRoZSBtYXRjaCBtdXN0IGJlIHRvIHRoZSBmdXp6eSBsb2NhdGlvbiAoc3BlY2lmaWVkIGFib3ZlKS5cbiAgICAvLyBBbiBleGFjdCBsZXR0ZXIgbWF0Y2ggd2hpY2ggaXMgJ2Rpc3RhbmNlJyBjaGFyYWN0ZXJzIGF3YXkgZnJvbSB0aGUgZnV6enkgbG9jYXRpb25cbiAgICAvLyB3b3VsZCBzY29yZSBhcyBhIGNvbXBsZXRlIG1pc21hdGNoLiBBIGRpc3RhbmNlIG9mICcwJyByZXF1aXJlcyB0aGUgbWF0Y2ggYmUgYXRcbiAgICAvLyB0aGUgZXhhY3QgbG9jYXRpb24gc3BlY2lmaWVkLCBhIHRocmVzaG9sZCBvZiAnMTAwMCcgd291bGQgcmVxdWlyZSBhIHBlcmZlY3QgbWF0Y2hcbiAgICAvLyB0byBiZSB3aXRoaW4gODAwIGNoYXJhY3RlcnMgb2YgdGhlIGZ1enp5IGxvY2F0aW9uIHRvIGJlIGZvdW5kIHVzaW5nIGEgMC44IHRocmVzaG9sZC5cbiAgICBkaXN0YW5jZTogMTAwLFxuXG4gICAgLy8gQXQgd2hhdCBwb2ludCBkb2VzIHRoZSBtYXRjaCBhbGdvcml0aG0gZ2l2ZSB1cC4gQSB0aHJlc2hvbGQgb2YgJzAuMCcgcmVxdWlyZXMgYSBwZXJmZWN0IG1hdGNoXG4gICAgLy8gKG9mIGJvdGggbGV0dGVycyBhbmQgbG9jYXRpb24pLCBhIHRocmVzaG9sZCBvZiAnMS4wJyB3b3VsZCBtYXRjaCBhbnl0aGluZy5cbiAgICB0aHJlc2hvbGQ6IDAuNixcblxuICAgIC8vIE1hY2hpbmUgd29yZCBzaXplXG4gICAgbWF4UGF0dGVybkxlbmd0aDogMzJcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplIHRoZSBhbHBoYWJldCBmb3IgdGhlIEJpdGFwIGFsZ29yaXRobS5cbiAgICogQHJldHVybiB7T2JqZWN0fSBIYXNoIG9mIGNoYXJhY3RlciBsb2NhdGlvbnMuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBCaXRhcFNlYXJjaGVyLnByb3RvdHlwZS5fY2FsY3VsYXRlUGF0dGVybkFscGhhYmV0ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBtYXNrID0ge30sXG4gICAgICBpID0gMFxuXG4gICAgZm9yIChpID0gMDsgaSA8IHRoaXMucGF0dGVybkxlbjsgaSsrKSB7XG4gICAgICBtYXNrW3RoaXMucGF0dGVybi5jaGFyQXQoaSldID0gMFxuICAgIH1cblxuICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLnBhdHRlcm5MZW47IGkrKykge1xuICAgICAgbWFza1t0aGlzLnBhdHRlcm4uY2hhckF0KGkpXSB8PSAxIDw8ICh0aGlzLnBhdHRlcm4ubGVuZ3RoIC0gaSAtIDEpXG4gICAgfVxuXG4gICAgcmV0dXJuIG1hc2tcbiAgfVxuXG4gIC8qKlxuICAgKiBDb21wdXRlIGFuZCByZXR1cm4gdGhlIHNjb3JlIGZvciBhIG1hdGNoIHdpdGggYGVgIGVycm9ycyBhbmQgYHhgIGxvY2F0aW9uLlxuICAgKiBAcGFyYW0ge251bWJlcn0gZXJyb3JzIE51bWJlciBvZiBlcnJvcnMgaW4gbWF0Y2guXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBsb2NhdGlvbiBMb2NhdGlvbiBvZiBtYXRjaC5cbiAgICogQHJldHVybiB7bnVtYmVyfSBPdmVyYWxsIHNjb3JlIGZvciBtYXRjaCAoMC4wID0gZ29vZCwgMS4wID0gYmFkKS5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIEJpdGFwU2VhcmNoZXIucHJvdG90eXBlLl9iaXRhcFNjb3JlID0gZnVuY3Rpb24gKGVycm9ycywgbG9jYXRpb24pIHtcbiAgICB2YXIgYWNjdXJhY3kgPSBlcnJvcnMgLyB0aGlzLnBhdHRlcm5MZW4sXG4gICAgICBwcm94aW1pdHkgPSBNYXRoLmFicyh0aGlzLm9wdGlvbnMubG9jYXRpb24gLSBsb2NhdGlvbilcblxuICAgIGlmICghdGhpcy5vcHRpb25zLmRpc3RhbmNlKSB7XG4gICAgICAvLyBEb2RnZSBkaXZpZGUgYnkgemVybyBlcnJvci5cbiAgICAgIHJldHVybiBwcm94aW1pdHkgPyAxLjAgOiBhY2N1cmFjeVxuICAgIH1cbiAgICByZXR1cm4gYWNjdXJhY3kgKyAocHJveGltaXR5IC8gdGhpcy5vcHRpb25zLmRpc3RhbmNlKVxuICB9XG5cbiAgLyoqXG4gICAqIENvbXB1dGUgYW5kIHJldHVybiB0aGUgcmVzdWx0IG9mIHRoZSBzZWFyY2hcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRleHQgVGhlIHRleHQgdG8gc2VhcmNoIGluXG4gICAqIEByZXR1cm4ge3tpc01hdGNoOiBib29sZWFuLCBzY29yZTogbnVtYmVyfX0gTGl0ZXJhbCBjb250YWluaW5nOlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgaXNNYXRjaCAtIFdoZXRoZXIgdGhlIHRleHQgaXMgYSBtYXRjaCBvciBub3RcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3JlIC0gT3ZlcmFsbCBzY29yZSBmb3IgdGhlIG1hdGNoXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIEJpdGFwU2VhcmNoZXIucHJvdG90eXBlLnNlYXJjaCA9IGZ1bmN0aW9uICh0ZXh0KSB7XG4gICAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnNcbiAgICB2YXIgaVxuICAgIHZhciBqXG4gICAgdmFyIHRleHRMZW5cbiAgICB2YXIgZmluZEFsbE1hdGNoZXNcbiAgICB2YXIgbG9jYXRpb25cbiAgICB2YXIgdGhyZXNob2xkXG4gICAgdmFyIGJlc3RMb2NcbiAgICB2YXIgYmluTWluXG4gICAgdmFyIGJpbk1pZFxuICAgIHZhciBiaW5NYXhcbiAgICB2YXIgc3RhcnQsIGZpbmlzaFxuICAgIHZhciBiaXRBcnJcbiAgICB2YXIgbGFzdEJpdEFyclxuICAgIHZhciBjaGFyTWF0Y2hcbiAgICB2YXIgc2NvcmVcbiAgICB2YXIgbG9jYXRpb25zXG4gICAgdmFyIG1hdGNoZXNcbiAgICB2YXIgaXNNYXRjaGVkXG4gICAgdmFyIG1hdGNoTWFza1xuICAgIHZhciBtYXRjaGVkSW5kaWNlc1xuICAgIHZhciBtYXRjaGVzTGVuXG4gICAgdmFyIG1hdGNoXG5cbiAgICB0ZXh0ID0gb3B0aW9ucy5jYXNlU2Vuc2l0aXZlID8gdGV4dCA6IHRleHQudG9Mb3dlckNhc2UoKVxuXG4gICAgaWYgKHRoaXMucGF0dGVybiA9PT0gdGV4dCkge1xuICAgICAgLy8gRXhhY3QgbWF0Y2hcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGlzTWF0Y2g6IHRydWUsXG4gICAgICAgIHNjb3JlOiAwLFxuICAgICAgICBtYXRjaGVkSW5kaWNlczogW1swLCB0ZXh0Lmxlbmd0aCAtIDFdXVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFdoZW4gcGF0dGVybiBsZW5ndGggaXMgZ3JlYXRlciB0aGFuIHRoZSBtYWNoaW5lIHdvcmQgbGVuZ3RoLCBqdXN0IGRvIGEgYSByZWdleCBjb21wYXJpc29uXG4gICAgaWYgKHRoaXMucGF0dGVybkxlbiA+IG9wdGlvbnMubWF4UGF0dGVybkxlbmd0aCkge1xuICAgICAgbWF0Y2hlcyA9IHRleHQubWF0Y2gobmV3IFJlZ0V4cCh0aGlzLnBhdHRlcm4ucmVwbGFjZShvcHRpb25zLnRva2VuU2VwYXJhdG9yLCAnfCcpKSlcbiAgICAgIGlzTWF0Y2hlZCA9ICEhbWF0Y2hlc1xuXG4gICAgICBpZiAoaXNNYXRjaGVkKSB7XG4gICAgICAgIG1hdGNoZWRJbmRpY2VzID0gW11cbiAgICAgICAgZm9yIChpID0gMCwgbWF0Y2hlc0xlbiA9IG1hdGNoZXMubGVuZ3RoOyBpIDwgbWF0Y2hlc0xlbjsgaSsrKSB7XG4gICAgICAgICAgbWF0Y2ggPSBtYXRjaGVzW2ldXG4gICAgICAgICAgbWF0Y2hlZEluZGljZXMucHVzaChbdGV4dC5pbmRleE9mKG1hdGNoKSwgbWF0Y2gubGVuZ3RoIC0gMV0pXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaXNNYXRjaDogaXNNYXRjaGVkLFxuICAgICAgICAvLyBUT0RPOiByZXZpc2l0IHRoaXMgc2NvcmVcbiAgICAgICAgc2NvcmU6IGlzTWF0Y2hlZCA/IDAuNSA6IDEsXG4gICAgICAgIG1hdGNoZWRJbmRpY2VzOiBtYXRjaGVkSW5kaWNlc1xuICAgICAgfVxuICAgIH1cblxuICAgIGZpbmRBbGxNYXRjaGVzID0gb3B0aW9ucy5maW5kQWxsTWF0Y2hlc1xuXG4gICAgbG9jYXRpb24gPSBvcHRpb25zLmxvY2F0aW9uXG4gICAgLy8gU2V0IHN0YXJ0aW5nIGxvY2F0aW9uIGF0IGJlZ2lubmluZyB0ZXh0IGFuZCBpbml0aWFsaXplIHRoZSBhbHBoYWJldC5cbiAgICB0ZXh0TGVuID0gdGV4dC5sZW5ndGhcbiAgICAvLyBIaWdoZXN0IHNjb3JlIGJleW9uZCB3aGljaCB3ZSBnaXZlIHVwLlxuICAgIHRocmVzaG9sZCA9IG9wdGlvbnMudGhyZXNob2xkXG4gICAgLy8gSXMgdGhlcmUgYSBuZWFyYnkgZXhhY3QgbWF0Y2g/IChzcGVlZHVwKVxuICAgIGJlc3RMb2MgPSB0ZXh0LmluZGV4T2YodGhpcy5wYXR0ZXJuLCBsb2NhdGlvbilcblxuICAgIC8vIGEgbWFzayBvZiB0aGUgbWF0Y2hlc1xuICAgIG1hdGNoTWFzayA9IFtdXG4gICAgZm9yIChpID0gMDsgaSA8IHRleHRMZW47IGkrKykge1xuICAgICAgbWF0Y2hNYXNrW2ldID0gMFxuICAgIH1cblxuICAgIGlmIChiZXN0TG9jICE9IC0xKSB7XG4gICAgICB0aHJlc2hvbGQgPSBNYXRoLm1pbih0aGlzLl9iaXRhcFNjb3JlKDAsIGJlc3RMb2MpLCB0aHJlc2hvbGQpXG4gICAgICAvLyBXaGF0IGFib3V0IGluIHRoZSBvdGhlciBkaXJlY3Rpb24/IChzcGVlZCB1cClcbiAgICAgIGJlc3RMb2MgPSB0ZXh0Lmxhc3RJbmRleE9mKHRoaXMucGF0dGVybiwgbG9jYXRpb24gKyB0aGlzLnBhdHRlcm5MZW4pXG5cbiAgICAgIGlmIChiZXN0TG9jICE9IC0xKSB7XG4gICAgICAgIHRocmVzaG9sZCA9IE1hdGgubWluKHRoaXMuX2JpdGFwU2NvcmUoMCwgYmVzdExvYyksIHRocmVzaG9sZClcbiAgICAgIH1cbiAgICB9XG5cbiAgICBiZXN0TG9jID0gLTFcbiAgICBzY29yZSA9IDFcbiAgICBsb2NhdGlvbnMgPSBbXVxuICAgIGJpbk1heCA9IHRoaXMucGF0dGVybkxlbiArIHRleHRMZW5cblxuICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLnBhdHRlcm5MZW47IGkrKykge1xuICAgICAgLy8gU2NhbiBmb3IgdGhlIGJlc3QgbWF0Y2g7IGVhY2ggaXRlcmF0aW9uIGFsbG93cyBmb3Igb25lIG1vcmUgZXJyb3IuXG4gICAgICAvLyBSdW4gYSBiaW5hcnkgc2VhcmNoIHRvIGRldGVybWluZSBob3cgZmFyIGZyb20gdGhlIG1hdGNoIGxvY2F0aW9uIHdlIGNhbiBzdHJheVxuICAgICAgLy8gYXQgdGhpcyBlcnJvciBsZXZlbC5cbiAgICAgIGJpbk1pbiA9IDBcbiAgICAgIGJpbk1pZCA9IGJpbk1heFxuICAgICAgd2hpbGUgKGJpbk1pbiA8IGJpbk1pZCkge1xuICAgICAgICBpZiAodGhpcy5fYml0YXBTY29yZShpLCBsb2NhdGlvbiArIGJpbk1pZCkgPD0gdGhyZXNob2xkKSB7XG4gICAgICAgICAgYmluTWluID0gYmluTWlkXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYmluTWF4ID0gYmluTWlkXG4gICAgICAgIH1cbiAgICAgICAgYmluTWlkID0gTWF0aC5mbG9vcigoYmluTWF4IC0gYmluTWluKSAvIDIgKyBiaW5NaW4pXG4gICAgICB9XG5cbiAgICAgIC8vIFVzZSB0aGUgcmVzdWx0IGZyb20gdGhpcyBpdGVyYXRpb24gYXMgdGhlIG1heGltdW0gZm9yIHRoZSBuZXh0LlxuICAgICAgYmluTWF4ID0gYmluTWlkXG4gICAgICBzdGFydCA9IE1hdGgubWF4KDEsIGxvY2F0aW9uIC0gYmluTWlkICsgMSlcbiAgICAgIGlmIChmaW5kQWxsTWF0Y2hlcykge1xuICAgICAgICBmaW5pc2ggPSB0ZXh0TGVuO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZmluaXNoID0gTWF0aC5taW4obG9jYXRpb24gKyBiaW5NaWQsIHRleHRMZW4pICsgdGhpcy5wYXR0ZXJuTGVuXG4gICAgICB9XG5cbiAgICAgIC8vIEluaXRpYWxpemUgdGhlIGJpdCBhcnJheVxuICAgICAgYml0QXJyID0gQXJyYXkoZmluaXNoICsgMilcblxuICAgICAgYml0QXJyW2ZpbmlzaCArIDFdID0gKDEgPDwgaSkgLSAxXG5cbiAgICAgIGZvciAoaiA9IGZpbmlzaDsgaiA+PSBzdGFydDsgai0tKSB7XG4gICAgICAgIGNoYXJNYXRjaCA9IHRoaXMucGF0dGVybkFscGhhYmV0W3RleHQuY2hhckF0KGogLSAxKV1cblxuICAgICAgICBpZiAoY2hhck1hdGNoKSB7XG4gICAgICAgICAgbWF0Y2hNYXNrW2ogLSAxXSA9IDFcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpID09PSAwKSB7XG4gICAgICAgICAgLy8gRmlyc3QgcGFzczogZXhhY3QgbWF0Y2guXG4gICAgICAgICAgYml0QXJyW2pdID0gKChiaXRBcnJbaiArIDFdIDw8IDEpIHwgMSkgJiBjaGFyTWF0Y2hcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBTdWJzZXF1ZW50IHBhc3NlczogZnV6enkgbWF0Y2guXG4gICAgICAgICAgYml0QXJyW2pdID0gKChiaXRBcnJbaiArIDFdIDw8IDEpIHwgMSkgJiBjaGFyTWF0Y2ggfCAoKChsYXN0Qml0QXJyW2ogKyAxXSB8IGxhc3RCaXRBcnJbal0pIDw8IDEpIHwgMSkgfCBsYXN0Qml0QXJyW2ogKyAxXVxuICAgICAgICB9XG4gICAgICAgIGlmIChiaXRBcnJbal0gJiB0aGlzLm1hdGNobWFzaykge1xuICAgICAgICAgIHNjb3JlID0gdGhpcy5fYml0YXBTY29yZShpLCBqIC0gMSlcblxuICAgICAgICAgIC8vIFRoaXMgbWF0Y2ggd2lsbCBhbG1vc3QgY2VydGFpbmx5IGJlIGJldHRlciB0aGFuIGFueSBleGlzdGluZyBtYXRjaC5cbiAgICAgICAgICAvLyBCdXQgY2hlY2sgYW55d2F5LlxuICAgICAgICAgIGlmIChzY29yZSA8PSB0aHJlc2hvbGQpIHtcbiAgICAgICAgICAgIC8vIEluZGVlZCBpdCBpc1xuICAgICAgICAgICAgdGhyZXNob2xkID0gc2NvcmVcbiAgICAgICAgICAgIGJlc3RMb2MgPSBqIC0gMVxuICAgICAgICAgICAgbG9jYXRpb25zLnB1c2goYmVzdExvYylcblxuICAgICAgICAgICAgaWYgKGJlc3RMb2MgPiBsb2NhdGlvbikge1xuICAgICAgICAgICAgICAvLyBXaGVuIHBhc3NpbmcgbG9jLCBkb24ndCBleGNlZWQgb3VyIGN1cnJlbnQgZGlzdGFuY2UgZnJvbSBsb2MuXG4gICAgICAgICAgICAgIHN0YXJ0ID0gTWF0aC5tYXgoMSwgMiAqIGxvY2F0aW9uIC0gYmVzdExvYylcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIEFscmVhZHkgcGFzc2VkIGxvYywgZG93bmhpbGwgZnJvbSBoZXJlIG9uIGluLlxuICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBObyBob3BlIGZvciBhIChiZXR0ZXIpIG1hdGNoIGF0IGdyZWF0ZXIgZXJyb3IgbGV2ZWxzLlxuICAgICAgaWYgKHRoaXMuX2JpdGFwU2NvcmUoaSArIDEsIGxvY2F0aW9uKSA+IHRocmVzaG9sZCkge1xuICAgICAgICBicmVha1xuICAgICAgfVxuICAgICAgbGFzdEJpdEFyciA9IGJpdEFyclxuICAgIH1cblxuICAgIG1hdGNoZWRJbmRpY2VzID0gdGhpcy5fZ2V0TWF0Y2hlZEluZGljZXMobWF0Y2hNYXNrKVxuXG4gICAgLy8gQ291bnQgZXhhY3QgbWF0Y2hlcyAodGhvc2Ugd2l0aCBhIHNjb3JlIG9mIDApIHRvIGJlIFwiYWxtb3N0XCIgZXhhY3RcbiAgICByZXR1cm4ge1xuICAgICAgaXNNYXRjaDogYmVzdExvYyA+PSAwLFxuICAgICAgc2NvcmU6IHNjb3JlID09PSAwID8gMC4wMDEgOiBzY29yZSxcbiAgICAgIG1hdGNoZWRJbmRpY2VzOiBtYXRjaGVkSW5kaWNlc1xuICAgIH1cbiAgfVxuXG4gIEJpdGFwU2VhcmNoZXIucHJvdG90eXBlLl9nZXRNYXRjaGVkSW5kaWNlcyA9IGZ1bmN0aW9uIChtYXRjaE1hc2spIHtcbiAgICB2YXIgbWF0Y2hlZEluZGljZXMgPSBbXVxuICAgIHZhciBzdGFydCA9IC0xXG4gICAgdmFyIGVuZCA9IC0xXG4gICAgdmFyIGkgPSAwXG4gICAgdmFyIG1hdGNoXG4gICAgdmFyIGxlbiA9IG1hdGNoTWFzay5sZW5ndGhcbiAgICBmb3IgKDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBtYXRjaCA9IG1hdGNoTWFza1tpXVxuICAgICAgaWYgKG1hdGNoICYmIHN0YXJ0ID09PSAtMSkge1xuICAgICAgICBzdGFydCA9IGlcbiAgICAgIH0gZWxzZSBpZiAoIW1hdGNoICYmIHN0YXJ0ICE9PSAtMSkge1xuICAgICAgICBlbmQgPSBpIC0gMVxuICAgICAgICBpZiAoKGVuZCAtIHN0YXJ0KSArIDEgPj0gdGhpcy5vcHRpb25zLm1pbk1hdGNoQ2hhckxlbmd0aCkge1xuICAgICAgICAgICAgbWF0Y2hlZEluZGljZXMucHVzaChbc3RhcnQsIGVuZF0pXG4gICAgICAgIH1cbiAgICAgICAgc3RhcnQgPSAtMVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAobWF0Y2hNYXNrW2kgLSAxXSkge1xuICAgICAgaWYgKChpLTEgLSBzdGFydCkgKyAxID49IHRoaXMub3B0aW9ucy5taW5NYXRjaENoYXJMZW5ndGgpIHtcbiAgICAgICAgbWF0Y2hlZEluZGljZXMucHVzaChbc3RhcnQsIGkgLSAxXSlcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG1hdGNoZWRJbmRpY2VzXG4gIH1cblxuICAvLyBFeHBvcnQgdG8gQ29tbW9uIEpTIExvYWRlclxuICBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgLy8gTm9kZS4gRG9lcyBub3Qgd29yayB3aXRoIHN0cmljdCBDb21tb25KUywgYnV0XG4gICAgLy8gb25seSBDb21tb25KUy1saWtlIGVudmlyb25tZW50cyB0aGF0IHN1cHBvcnQgbW9kdWxlLmV4cG9ydHMsXG4gICAgLy8gbGlrZSBOb2RlLlxuICAgIG1vZHVsZS5leHBvcnRzID0gRnVzZVxuICB9IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgIC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cbiAgICBkZWZpbmUoZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIEZ1c2VcbiAgICB9KVxuICB9IGVsc2Uge1xuICAgIC8vIEJyb3dzZXIgZ2xvYmFscyAocm9vdCBpcyB3aW5kb3cpXG4gICAgZ2xvYmFsLkZ1c2UgPSBGdXNlXG4gIH1cblxufSkodGhpcyk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vZnVzZS5qcy9zcmMvZnVzZS5qc1xuLy8gbW9kdWxlIGlkID0gMFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIEZ1c2UgPSByZXF1aXJlKFwiZnVzZS5qc1wiKTtcclxudmFyIGJvb2tzID0gW3tcclxuICAgICAgICB0aXRsZTogXCJPbGQgTWFuJ3MgV2FyXCIsXHJcbiAgICAgICAgYXV0aG9yOiB7XHJcbiAgICAgICAgICAgIGZpcnN0TmFtZTogJ0pvaG4nLFxyXG4gICAgICAgICAgICBsYXN0TmFtZTogJ1NjYWx6aSdcclxuICAgICAgICB9XHJcbiAgICB9XTtcclxudmFyIGZ1c2UgPSBuZXcgRnVzZShib29rcywgeyBrZXlzOiBbJ3RpdGxlJywgJ2F1dGhvci5maXJzdE5hbWUnXSB9KTtcclxud2luZG93LmFsZXJ0KE9iamVjdC5rZXlzKGZ1c2UpLm1hcChmdW5jdGlvbiAoa2V5KSB7IHJldHVybiBrZXkgKyBcIjogXCIgKyBmdXNlW2tleV07IH0pKTtcclxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9tYWluLnRzXG4vLyBtb2R1bGUgaWQgPSAxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCJdLCJzb3VyY2VSb290IjoiIn0=