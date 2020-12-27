"use strict";
/// L -- Functional, Minimalist DOM/Browser Utils ///
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
///
/// Types /// END ///
/// L -- DOM query & manipulation utils /// BEGIN ///
///
function L(tgt) {
    /// query DOM for an array of elements ///
    tgt =
        typeof tgt === "string"
            ? Array.from(document.body.querySelectorAll(tgt))
            : tgt;
    tgt = (!Array.isArray(tgt) ? [tgt] : tgt);
    return {
        all: function () { return tgt; },
        idx: function (index) { return tgt[0] || null; },
        on: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return L.on.apply(L, __spreadArrays([tgt], args));
        },
        hide: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return L.hide.apply(L, __spreadArrays([tgt], args));
        },
        show: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return L.show.apply(L, __spreadArrays([tgt], args));
        },
        get: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return L.get.apply(L, __spreadArrays([tgt], args));
        },
        set: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return L.set.apply(L, __spreadArrays([tgt], args));
        },
        del: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return L.del.apply(L, __spreadArrays([tgt], args));
        },
        cycle: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return L.cycle.apply(L, __spreadArrays([tgt], args));
        },
        rand: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return L.rand.apply(L, __spreadArrays([tgt], args));
        }
    };
}
L.on = function (tgt, events, fn) {
    /// register an event handler on DOM elements (identified by selector string or reference) ///
    var l = L(tgt);
    var eventArr = events.split(",").map(function (ev) { return ev.trim(); });
    l.all().forEach(function (el) {
        return eventArr.forEach(function (ev) {
            return el.addEventListener(ev, fn);
        });
    });
    return l;
};
L.hide = function (tgt) {
    /// set element opacity to zero so it may fade out ///
    var l = L(tgt);
    l.all().forEach(function (el) { return (el.style.opacity = (0).toString()); });
    return l;
};
L.show = function (tgt) {
    /// set element opacity to one so it may fade in ///
    var l = L(tgt);
    l.all().forEach(function (el) { return (el.style.opacity = (1).toString()); });
    return l;
};
L.get = function (tgt, key) {
    var vals = L(tgt)
        .all()
        .map(function (el) { return el.getAttribute(key); });
    if (new Set(vals).size > 1) {
        throw new Error("L.get called on multiple elements with differing values");
    }
    return vals[0] || null;
};
L.set = function (tgt, key, val) {
    if (typeof val === "string") {
        L(tgt)
            .all()
            .forEach(function (el) { return el.setAttribute(key, val); });
    }
    return val;
};
L.del = function (tgt, key) {
    var elements = L(tgt).all();
    var result = elements.some(function (el) { return el.hasAttribute(key); });
    elements.forEach(function (el) { return el.removeAttribute(key); });
    return result;
};
L.cycle = function (tgt, key, vals) {
    var l = L(tgt);
    var val = vals[(vals.indexOf(l.get(key)) + 1) % vals.length];
    l.set(key, val);
    return val;
};
L.rand = function (tgt, key, vals) {
    var l = L(tgt);
    var val = vals[Math.floor(Math.random() * vals.length)];
    l.set(key, val);
    return val;
};
///
/// L -- DOM query & manipulation utils /// END ///
/// L.state -- Url-Based State Management /// BEGIN ///
///
L.state = {
    // Internal State:
    params: new URLSearchParams(),
    config: null,
    aliases: null,
    // Configure L.state with:
    // -- set of valid of keys
    // -- optional default values
    // -- optional value lists for data validation
    // -- optional key aliases for creating short urls
    configure: function (config) {
        L.state.config = L.state.config || new Map(); // config -- store value defaults, options
        L.state.aliases = L.state.aliases || new Map(); // aliases -- store key aliases
        Object.entries(config).forEach(function (_a) {
            var _b;
            var key = _a[0], cfg = _a[1];
            L.state.config.set(key, __assign(__assign({}, (L.state.config.get(key) || {})), config[key]));
            (_b = cfg.aliases) === null || _b === void 0 ? void 0 : _b.forEach(function (alias) { return L.state.aliases.set(alias, key); });
        });
        return L.state;
    },
    // Configure L.state with:
    // -- an optional custom handler function to run whenever state is loaded from URL
    // then register event listeners to load URL state on pageload and browser back.
    load: function (onLoad) {
        L(window).on("load,popstate", function () {
            // Use L.state.set instead of constructing params directly from
            // window.location.search so that aliasing and data validation take place:
            L.state.params = new URLSearchParams();
            new URLSearchParams(window.location.search).forEach(function (val, key) {
                return L.state.set(key, val);
            });
            // For each key, if default provided, set val to default IFF no value was taken from url:
            var changed = false;
            L.state.config.forEach(function (cfg, key) {
                if (cfg["default"] && !L.state.get(key)) {
                    L.state.set(key, cfg["default"]);
                    changed = true;
                }
            });
            L.state.write({ push: false }); // update url in case aliased keys or defaults were set
            onLoad && onLoad();
        });
        return L.state;
    },
    // From an aliased or normal/longform key, return the corresponding longform key:
    // reverse=true : From a longform key, get shortest alias
    aliased: function (key, _a) {
        var _b, _c, _d;
        var _e = _a === void 0 ? {} : _a, _f = _e.reverse, reverse = _f === void 0 ? false : _f;
        if (reverse) {
            return (((_d = (_c = (_b = L.state.config) === null || _b === void 0 ? void 0 : _b.get(key)) === null || _c === void 0 ? void 0 : _c.aliases) === null || _d === void 0 ? void 0 : _d.sort(function (a, b) { return a.length - b.length; })[0]) || key);
        }
        else {
            return L.state.aliases.get(key) || key;
        }
    },
    // From and index or normal/longform val, return the corresponding longform val:
    // reverse=true : From a longform val, get index
    indexed: function (key, val, _a) {
        var _b, _c;
        var _d = _a === void 0 ? {} : _a, _e = _d.reverse, reverse = _e === void 0 ? false : _e;
        var options = (_c = (_b = L.state.config) === null || _b === void 0 ? void 0 : _b.get(L.state.aliased(key))) === null || _c === void 0 ? void 0 : _c.options;
        if (reverse) {
            return (options && options.indexOf(val).toString()) || val;
        }
        else {
            return (options && options[parseInt(val)]) || val;
        }
    },
    // Throw an error if key/value does not match provided L.state configuration:
    validate: function (key, val) {
        var _a;
        if (L.state.config) {
            // If key list was configured, validate provided key:
            if (!L.state.config.has(key)) {
                throw new Error("L.state.get given invalid key \"" + key + "\"");
            }
            if (typeof val === "string") {
                // If options list was configured for key, validate provided key/value:
                var options = (_a = L.state.config.get(key)) === null || _a === void 0 ? void 0 : _a.options;
                if (options && !options.includes(val)) {
                    throw new Error("L.state.set given invalid value \"" + val + "\" for key \"" + key + "\"");
                }
            }
        }
        return L.state;
    },
    // Get a value (or null) from URL state via key:
    get: function (key) {
        key = L.state.aliased(key);
        L.state.validate(key);
        return L.state.params.get(key) || null;
    },
    // Set a value in URL state via key/value:
    set: function (key, val) {
        key = L.state.aliased(key);
        val = L.state.indexed(key, val);
        L.state.validate(key, val);
        if (typeof val === "string") {
            if (L.state.params.get(key) !== val) {
                L.state.params.set(key, val);
                L.state.params.sort();
            }
        }
        return val;
    },
    // Delete a value from URL state via key:
    del: function (key) {
        key = L.state.aliased(key);
        L.state.validate(key);
        if (L.state.params.has(key)) {
            L.state.params["delete"](key);
            return true;
        }
        return false;
    },
    // Send updated URL state to window.history, updating address bar:
    write: function (_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.push, push = _c === void 0 ? false : _c;
        var url = new URL(window.location.href);
        url.search = L.state.params.toString();
        if (push) {
            window.history.pushState({ path: url.href }, "", url.href);
        }
        else {
            window.history.replaceState({ path: url.href }, "", url.href);
        }
        return L.state;
    },
    url: function (_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.short, short = _c === void 0 ? false : _c;
        var url = new URL(window.location.href);
        var params;
        if (short) {
            params = new URLSearchParams();
            L.state.params.forEach(function (val, key) {
                var shortKey = L.state.aliased(key, { reverse: true });
                var shortVal = L.state.indexed(key, val, { reverse: true });
                params.set(shortKey, shortVal);
            });
            params.sort();
        }
        else {
            params = L.state.params;
        }
        url.search = params.toString();
        return url.href;
    }
};
///
/// L.state -- Url-Based State Management /// END ///
/// L.copy -- copy-to-clipboard with graceful degradation /// BEGIN ///
//
L.copy = function (text) {
    var fallbackMessage = "Copy url and send to your spotter -> Press Ctrl+C then Enter";
    if (navigator.clipboard) {
        navigator.clipboard
            .writeText(text)["catch"](function () { return window.prompt(fallbackMessage, text); });
    }
    else {
        var textArea = document.createElement("textarea");
        textArea.value = text;
        // Avoid scrolling to bottom
        textArea.style.top = (0).toString();
        textArea.style.left = (0).toString();
        textArea.style.position = "fixed";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand("copy");
        }
        catch (err) {
            window.prompt(fallbackMessage, text);
        }
        document.body.removeChild(textArea);
    }
    return text;
};
//
/// L.copy -- copy-to-clipboard with graceful degradation /// END ///
exports["default"] = L;
