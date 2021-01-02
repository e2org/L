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
/// Types /// BEGIN ///
///
var EaseFunc;
(function (EaseFunc) {
    EaseFunc["linear"] = "linear";
    EaseFunc["quadradic"] = "quadradic";
    EaseFunc["cubic"] = "cubic";
    EaseFunc["quartic"] = "quartic";
    EaseFunc["quintic"] = "quintic";
})(EaseFunc || (EaseFunc = {}));
var EaseStyle;
(function (EaseStyle) {
    EaseStyle["default"] = "default";
    EaseStyle["in"] = "in";
    EaseStyle["out"] = "out";
    EaseStyle["both"] = "both";
})(EaseStyle || (EaseStyle = {}));
///
/// Types /// END ///
/// Utils /// BEGIN ///
///
var easeStyles = new Set(Object.values(EaseStyle));
var easeFuncs = new Set(Object.values(EaseFunc));
function _parseAnimationArgs() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return {
        easeStyle: args.filter(function (arg) { return easeStyles.has(arg); })[0] ||
            EaseStyle["default"],
        easeFunc: args.filter(function (arg) { return easeFuncs.has(arg); })[0] || null,
        durationMs: args.filter(function (arg) { return Number.isInteger(arg); })[0] || 0
    };
}
function _bezier(animation) {
    var beziers = {
        linear: "cubic-bezier(0.250, 0.250, 0.750, 0.750)",
        "in": "cubic-bezier(0.420, 0.000, 1.000, 1.000)",
        out: "cubic-bezier(0.000, 0.000, 0.580, 1.000)",
        both: "cubic-bezier(0.420, 0.000, 0.580, 1.000)",
        "default": "cubic-bezier(0.250, 0.100, 0.250, 1.000)",
        "in-quad": "cubic-bezier(0.550, 0.085, 0.680, 0.530)",
        "in-cubic": "cubic-bezier(0.550, 0.055, 0.675, 0.190)",
        "in-quartic": "cubic-bezier(0.895, 0.030, 0.685, 0.220)",
        "in-quintic": "cubic-bezier(0.755, 0.050, 0.855, 0.060)",
        "out-quad": "cubic-bezier(0.250, 0.460, 0.450, 0.940)",
        "out-cubic": "cubic-bezier(0.215, 0.610, 0.355, 1.000)",
        "out-quartic": "cubic-bezier(0.165, 0.840, 0.440, 1.000)",
        "out-quintic": "cubic-bezier(0.230, 1.000, 0.320, 1.000)",
        "both-quad": "cubic-bezier(0.455, 0.030, 0.515, 0.955)",
        "both-cubic": "cubic-bezier(0.645, 0.045, 0.355, 1.000)",
        "both-quartic": "cubic-bezier(0.770, 0.000, 0.175, 1.000)",
        "both-quintic": "cubic-bezier(0.860, 0.000, 0.070, 1.000)",
        // if ease func provided, default == both for easing:
        "default-quad": "cubic-bezier(0.455, 0.030, 0.515, 0.955)",
        "default-cubic": "cubic-bezier(0.645, 0.045, 0.355, 1.000)",
        "default-quartic": "cubic-bezier(0.770, 0.000, 0.175, 1.000)",
        "default-quintic": "cubic-bezier(0.860, 0.000, 0.070, 1.000)"
    };
    if (!animation.easeStyle && !animation.easeFunc) {
        return beziers["default"]; // browser default
    }
    else if (animation.easeStyle && !animation.easeFunc) {
        return beziers[animation.easeStyle];
    }
    else if (!animation.easeStyle && animation.easeFunc) {
        return beziers["both-" + animation.easeFunc];
    }
    else if (animation.easeFunc === EaseFunc.linear) {
        return beziers.linear;
    }
    return beziers[animation.easeStyle + "-" + animation.easeFunc];
}
///
/// Utils /// END ///
/// L -- DOM query & manipulation utils /// BEGIN ///
///
function L(tgt) {
    /// query DOM for an array of elements ///
    var l = {
        elements: [],
        all: function (requery) {
            if (requery === void 0) { requery = false; }
            if (requery || !l.elements.length) {
                var res = void 0;
                if (typeof tgt === "string") {
                    res = Array.from(document.body.querySelectorAll(tgt));
                }
                else if (typeof tgt.all === "function") {
                    res = tgt.all(); // unwrap another L object
                }
                l.elements = (!Array.isArray(res)
                    ? [res]
                    : res);
            }
            return l.elements;
        },
        idx: function (index) { return l.all()[0] || null; }
    };
    ["get", "set", "del", "cyc", "rnd"].forEach(function (func) {
        l[func] = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return L[func].apply(L, __spreadArrays([tgt], args));
        };
        l[func].cls = function () {
            var _a;
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return (_a = L[func]).cls.apply(_a, __spreadArrays([tgt], args));
        };
        l[func].sty = function () {
            var _a;
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return (_a = L[func]).sty.apply(_a, __spreadArrays([tgt], args));
        };
    });
    return __assign(__assign({}, l), { on: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return L.on.apply(L, __spreadArrays([tgt], args));
        }, off: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return L.off.apply(L, __spreadArrays([tgt], args));
        }, one: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return L.one.apply(L, __spreadArrays([tgt], args));
        }, add: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return L.add.apply(L, __spreadArrays([tgt], args));
        }, rem: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return L.rem.apply(L, __spreadArrays([tgt], args));
        }, ani: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return L.ani.apply(L, __spreadArrays([tgt], args));
        } });
}
///
L.ease = __assign(__assign({}, EaseStyle), EaseFunc);
///
L.ani = function (tgt) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    var l = L(tgt);
    var animation = _parseAnimationArgs.apply(void 0, args);
    if (animation.durationMs > 0) {
        l.animation = animation;
        var origTransition_1 = L.get.sty(l, "transition");
        L.set.sty(l, "transition", "all " + animation.durationMs + "ms " + _bezier(animation));
        setTimeout(function () {
            L.set.sty(l, "transition", origTransition_1);
            l.animation = null;
        }, animation.durationMs);
    }
    return l;
};
///
L.add = function (tgt, tagName) {
    var _a;
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    var tag = document.createElement(tagName);
    var l = (_a = L(tag)).ani.apply(_a, args);
    if (l.animation) {
        L.set.sty(l, "opacity", 0);
        requestAnimationFrame(function () { return L.set.sty(l, "opacity", 1); });
        setTimeout(function () { return L.del.sty(l, "opacity"); }, l.animation.durationMs);
    }
    if (tgt) {
        L(tgt).idx(0).appendChild(tag);
    }
    return l;
};
///
L.rem = function (tgt) {
    var _a;
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    // reverse so that later args override earlier args:
    var lastBoolArg = __spreadArrays(args).reverse().filter(function (arg) { return typeof arg === "boolean"; })[0] || null;
    var deleteElement = lastBoolArg === null ? false : lastBoolArg;
    var showElement = lastBoolArg === null ? false : !lastBoolArg;
    var animation = _parseAnimationArgs.apply(void 0, args);
    var l = (_a = L(tgt)).ani.apply(_a, args);
    if (!l.animation) {
        if (deleteElement) {
            l.all().forEach(function (el) { return el.parentNode.removeChild(el); });
        }
        else {
            L.set.sty(l, "opacity", showElement ? 1 : 0);
        }
    }
    else {
        L.set.sty(l, "opacity", L.get.sty(l, "opacity") || (showElement ? 0 : 1));
        requestAnimationFrame(function () { return L.set.sty(l, "opacity", showElement ? 1 : 0); });
        setTimeout(function () {
            if (deleteElement) {
                l.all().forEach(function (el) { return el.parentNode.removeChild(el); });
            }
            else if (showElement) {
                L.del.sty(l, "opacity");
            }
        }, l.animation.durationMs);
    }
    return l;
};
///
L.on = function (tgt, events, fn, off) {
    /// register an event handler on DOM elements (identified by selector string or reference) ///
    var l = L(tgt);
    var eventArr = events.split(",").map(function (ev) { return ev.trim(); });
    l.all().forEach(function (el) {
        return eventArr.forEach(function (ev) {
            return (off ? el.removeEventListener : el.addEventListener).call(el, ev, fn);
        });
    });
    return l;
};
///
L.off = function (tgt, events, fn, on) {
    /// remove an event handler from DOM elements (identified by selector string or reference) ///
    return L.on(tgt, events, fn, !on);
};
///
L.one = function (tgt, events, fn) {
    /// register an event handler on DOM elements to fire ONCE and only once ///
    function handler() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        L.off(tgt, events, handler);
        fn.call.apply(fn, __spreadArrays([this], args));
    }
    return L.on(tgt, events, handler);
};
///
function _lget(tgt, key, getter, name) {
    var vals = L(tgt)
        .all()
        .map(function (el) { return getter(el, key); });
    if (new Set(vals).size > 1) {
        throw new Error(name + " called on multiple elements with differing values for key \"" + key + "\"");
    }
    return vals[0] || null;
}
L.get = function (tgt, key) {
    var getAttribute = function (el, k) { return el.getAttribute(k); };
    return _lget(tgt, key, getAttribute, "L.get");
};
L.get.cls = function (tgt, key) {
    var hasClass = function (el, k) {
        return (el.className || "").split(" ").includes(k) ? k : null;
    };
    return _lget(tgt, key, hasClass, "L.get.cls");
};
L.get.sty = function (tgt, key) {
    var getStyle = function (el, k) { return el.style[k]; };
    return _lget(tgt, key, getStyle, "L.get.sty");
};
///
function _lset(tgt, key, val, setter) {
    var args = [];
    for (var _i = 4; _i < arguments.length; _i++) {
        args[_i - 4] = arguments[_i];
    }
    // treat as no-op if val is null or undefined:
    if (!(val === undefined || val === null)) {
        val = val.toString();
        L.ani.apply(L, __spreadArrays([tgt], args)).all()
            .forEach(function (el) { return setter(el, key, val); });
    }
    return val;
}
L.set = function (tgt, key, val) {
    var args = [];
    for (var _i = 3; _i < arguments.length; _i++) {
        args[_i - 3] = arguments[_i];
    }
    var setAttribute = function (el, k, v) { return el.setAttribute(k, v); };
    return _lset.apply(void 0, __spreadArrays([tgt, key, val, setAttribute], args));
};
L.set.cls = function (tgt, key) {
    var setClass = function (el, k) { return el.classlist.add(k); };
    return _lset(tgt, key, true, setClass);
};
L.set.sty = function (tgt, key, val) {
    var args = [];
    for (var _i = 3; _i < arguments.length; _i++) {
        args[_i - 3] = arguments[_i];
    }
    var setStyle = function (el, k, v) { return (el.style[k] = v); };
    return _lset.apply(void 0, __spreadArrays([tgt, key, val, setStyle], args));
};
///
function _ldel(tgt, key, checker, deleter) {
    var args = [];
    for (var _i = 4; _i < arguments.length; _i++) {
        args[_i - 4] = arguments[_i];
    }
    return !!L.ani.apply(L, __spreadArrays([tgt], args)).all()
        .filter(function (el) { return checker(el, key); })
        .map(function (el) { return deleter(el, key); }).length;
}
L.del = function (tgt, key) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    var hasAttribute = function (el, k) { return el.hasAttribute(k); };
    var delAttribute = function (el, k) { return el.removeAttribute(key); };
    return _ldel.apply(void 0, __spreadArrays([tgt, key, hasAttribute, delAttribute], args));
};
L.del.cls = function (tgt, key) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    var hasClass = function (el, k) { return el.classList.contains(k); };
    var delClass = function (el, k) { return el.removeAttribute(k); };
    return _ldel.apply(void 0, __spreadArrays([tgt, key, hasClass, delClass], args));
};
L.del.sty = function (tgt, key) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    var hasStyle = function (el) { return !!el.style[key].length; };
    var delStyle = function (el) { return (el.style[key] = ""); };
    return _ldel.apply(void 0, __spreadArrays([tgt, key, hasStyle, delStyle], args));
};
///
function _lcyc(tgt, key, vals, getter, setter) {
    var args = [];
    for (var _i = 5; _i < arguments.length; _i++) {
        args[_i - 5] = arguments[_i];
    }
    var l = L(tgt);
    vals = vals.map(function (v) { return v.toString(); });
    var val = vals[(vals.indexOf(getter(l, key)) + 1) % vals.length];
    setter(l, key, val);
    return val;
}
L.cyc = function (tgt, key, vals) {
    var args = [];
    for (var _i = 3; _i < arguments.length; _i++) {
        args[_i - 3] = arguments[_i];
    }
    return _lcyc.apply(void 0, __spreadArrays([tgt, key, vals, L.get, L.set], args));
};
L.cyc.cls = function (tgt, key, vals) {
    var args = [];
    for (var _i = 3; _i < arguments.length; _i++) {
        args[_i - 3] = arguments[_i];
    }
    return _lcyc.apply(void 0, __spreadArrays([tgt, key, vals, L.get.cls, L.set.cls], args));
};
L.cyc.sty = function (tgt, key, vals) {
    var args = [];
    for (var _i = 3; _i < arguments.length; _i++) {
        args[_i - 3] = arguments[_i];
    }
    return _lcyc.apply(void 0, __spreadArrays([tgt, key, vals, L.get.sty, L.set.sty], args));
};
///
function _lrnd(tgt, key, vals, setter) {
    var args = [];
    for (var _i = 4; _i < arguments.length; _i++) {
        args[_i - 4] = arguments[_i];
    }
    var l = L(tgt);
    vals = vals.map(function (v) { return v.toString(); });
    var val = vals[Math.floor(Math.random() * vals.length)];
    setter(l, key, val);
    return val;
}
L.rnd = function (tgt, key, vals) {
    var args = [];
    for (var _i = 3; _i < arguments.length; _i++) {
        args[_i - 3] = arguments[_i];
    }
    return _lrnd.apply(void 0, __spreadArrays([tgt, key, vals, L.set], args));
};
L.rnd.cls = function (tgt, key, vals) {
    var args = [];
    for (var _i = 3; _i < arguments.length; _i++) {
        args[_i - 3] = arguments[_i];
    }
    return _lrnd.apply(void 0, __spreadArrays([tgt, key, vals, L.set.cls], args));
};
L.rnd.sty = function (tgt, key, vals) {
    var args = [];
    for (var _i = 3; _i < arguments.length; _i++) {
        args[_i - 3] = arguments[_i];
    }
    return _lrnd.apply(void 0, __spreadArrays([tgt, key, vals, L.set.sty], args));
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
