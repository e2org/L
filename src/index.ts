/// L -- Functional, Minimalist DOM/Browser Utils ///

/// Types /// BEGIN ///
///
enum EaseFunc {
  linear = `linear`,
  quadradic = `quadradic`,
  cubic = `cubic`,
  quartic = `quartic`,
  quintic = `quintic`,
}
enum EaseStyle {
  default = `default`,
  in = `in`,
  out = `out`,
  both = `both`,
}
interface Animation {
  easeStyle: EaseStyle;
  easeFunc: EaseFunc;
  durationMs: number;
}
type Ltgt = Lobj | string | HTMLElement | HTMLElement[] | Document | Window;
type Lkey = string | number;
type Lval = string | number | boolean;
type Loption = boolean | number | EaseFunc | EaseStyle;
interface LsubGet {
  // allows direct manipulation of element classes & styles
  cls?: (tgt: Ltgt, key: Lkey) => string | null;
  sty?: (tgt: Ltgt, key: Lkey) => string | null;
}
interface LsubSet {
  // allows direct manipulation of element classes & styles
  cls?: (tgt: Ltgt, key: Lkey) => string;
  sty?: (tgt: Ltgt, key: Lkey, val: Lval, ...args: Loption[]) => string;
}
interface LsubDel {
  // allows direct manipulation of element classes & styles
  cls?: (tgt: Ltgt, key: Lkey) => boolean;
  sty?: (tgt: Ltgt, key: Lkey, ...args: Loption[]) => boolean;
}
interface LsubCycRnd {
  // allows direct manipulation of element classes & styles
  cls?: (tgt: Ltgt, key: Lkey, vals: Lval[]) => string;
  sty?: (tgt: Ltgt, key: Lkey, vals: Lval[], ...args: Loption[]) => string;
}
type Lget = LsubGet & ((tgt: Ltgt, key: Lkey) => string | null);
type Lset = LsubSet &
  ((tgt: Ltgt, key: Lkey, val: Lval, ...args: Loption[]) => string);
type Ldel = LsubDel & ((tgt: Ltgt, key: Lkey, ...args: Loption[]) => boolean);
type Lcyc = LsubCycRnd &
  ((tgt: Ltgt, key: Lkey, vals: Lval[], ...args: Loption[]) => string);
type Lrnd = LsubCycRnd &
  ((tgt: Ltgt, key: Lkey, vals: Lval[], ...args: Loption[]) => string);
interface Lobj {
  elements: HTMLElement[];
  animation: Animation | null;
  all: (requery?: boolean) => HTMLElement[];
  idx: (index: number) => HTMLElement;
  add: (tagName: string, ...args: Loption[]) => Lobj;
  rem: (...args: Loption[]) => Lobj;
  ani: (...args: Loption[]) => Lobj;
  on: (events: string, fn: Function, off?: boolean) => Lobj;
  off: (events: string, fn: Function, on?: boolean) => Lobj;
  one: (events: string, fn: Function) => Lobj;
  get: Lget;
  set: Lset;
  del: Ldel;
  cyc: Lcyc;
  rnd: Lrnd;
}
interface LstateConfigEntry {
  default?: string;
  options?: string[];
  aliases?: string[];
}
interface LstateConfig {
  [stateKeyName: string]: LstateConfigEntry;
}
interface LstateAliases {
  // stateKeyAlias -> stateKeyName
  [stateKeyAlias: string]: string;
}
interface Lstate {
  /// internal state ///
  params: URLSearchParams;
  config?: LstateConfig;
  aliases?: LstateAliases;
  /// access functions ///
  configure: (config: LstateConfig) => Lstate;
  load: (onLoad?: Function) => Lstate;
  aliased: (key: string) => string;
  indexed: (
    key: string,
    val: string,
    options?: { reverse?: boolean }
  ) => string;
  validate: (
    key: string,
    val: string,
    options?: { reverse?: boolean }
  ) => Lstate;
  get: (key: string) => string | null;
  set: (key: string, val: string) => string;
  del: (key: string) => boolean;
  write: (options?: { push?: boolean }) => Lstate;
}
///
/// Types /// END ///

/// Utils /// BEGIN ///
///
const easeStyles: Set<Loption> = new Set(Object.values(EaseStyle));
const easeFuncs: Set<Loption> = new Set(Object.values(EaseFunc));
function _parseAnimationArgs(...args: Loption[]): Animation {
  return {
    easeStyle:
      (args.filter((arg) => easeStyles.has(arg))[0] as EaseStyle) ||
      EaseStyle.default,
    easeFunc: (args.filter((arg) => easeFuncs.has(arg))[0] as EaseFunc) || null,
    durationMs: (args.filter((arg) => Number.isInteger(arg))[0] as number) || 0, // default: immediate, no animation
  };
}
function _bezier(animation: Animation): string {
  const beziers = {
    linear: `cubic-bezier(0.250, 0.250, 0.750, 0.750)`,

    in: `cubic-bezier(0.420, 0.000, 1.000, 1.000)`,
    out: `cubic-bezier(0.000, 0.000, 0.580, 1.000)`,
    both: `cubic-bezier(0.420, 0.000, 0.580, 1.000)`,
    default: `cubic-bezier(0.250, 0.100, 0.250, 1.000)`,

    "in-quad": `cubic-bezier(0.550, 0.085, 0.680, 0.530)`,
    "in-cubic": `cubic-bezier(0.550, 0.055, 0.675, 0.190)`,
    "in-quartic": `cubic-bezier(0.895, 0.030, 0.685, 0.220)`,
    "in-quintic": `cubic-bezier(0.755, 0.050, 0.855, 0.060)`,

    "out-quad": `cubic-bezier(0.250, 0.460, 0.450, 0.940)`,
    "out-cubic": `cubic-bezier(0.215, 0.610, 0.355, 1.000)`,
    "out-quartic": `cubic-bezier(0.165, 0.840, 0.440, 1.000)`,
    "out-quintic": `cubic-bezier(0.230, 1.000, 0.320, 1.000)`,

    "both-quad": `cubic-bezier(0.455, 0.030, 0.515, 0.955)`,
    "both-cubic": `cubic-bezier(0.645, 0.045, 0.355, 1.000)`,
    "both-quartic": `cubic-bezier(0.770, 0.000, 0.175, 1.000)`,
    "both-quintic": `cubic-bezier(0.860, 0.000, 0.070, 1.000)`,

    // if ease func provided, default == both for easing:
    "default-quad": `cubic-bezier(0.455, 0.030, 0.515, 0.955)`,
    "default-cubic": `cubic-bezier(0.645, 0.045, 0.355, 1.000)`,
    "default-quartic": `cubic-bezier(0.770, 0.000, 0.175, 1.000)`,
    "default-quintic": `cubic-bezier(0.860, 0.000, 0.070, 1.000)`,
  };

  if (!animation.easeStyle && !animation.easeFunc) {
    return beziers.default; // browser default
  } else if (animation.easeStyle && !animation.easeFunc) {
    return beziers[animation.easeStyle];
  } else if (!animation.easeStyle && animation.easeFunc) {
    return beziers[`both-${animation.easeFunc}`];
  } else if (animation.easeFunc === EaseFunc.linear) {
    return beziers.linear;
  }

  return beziers[`${animation.easeStyle}-${animation.easeFunc}`];
}
///
/// Utils /// END ///

/// L -- DOM query & manipulation utils /// BEGIN ///
///
function L(tgt: Ltgt): Lobj {
  /// query DOM for an array of elements ///
  const l = {
    elements: [],
    all: (requery = false) => {
      if (requery || !l.elements.length) {
        let res = tgt;
        if (typeof tgt === `string`) {
          res = (Array.from(
            document.body.querySelectorAll(tgt)
          ) as unknown) as HTMLElement[];
        } else if (typeof (tgt as Lobj).all === `function`) {
          const lres = (tgt as Lobj).all(); // unwrap another L object
          if (Array.isArray(lres)) {
            res = lres;
          }
        }
        l.elements = ((!Array.isArray(res)
          ? [res]
          : res) as unknown) as HTMLElement[];
      }
      return l.elements;
    },
    idx: (index) => l.all()[0] || null,
  };
  [`get`, `set`, `del`, `cyc`, `rnd`].forEach((func) => {
    l[func] = (...args) => L[func](tgt, ...args);
    l[func].cls = (...args) => L[func].cls(tgt, ...args);
    l[func].sty = (...args) => L[func].sty(tgt, ...args);
  });
  return {
    ...l,
    on: (...args) => L.on(tgt, ...args),
    off: (...args) => L.off(tgt, ...args),
    one: (...args) => L.one(tgt, ...args),
    add: (...args) => L.add(tgt, ...args),
    rem: (...args) => L.rem(tgt, ...args),
    ani: (...args) => L.ani(tgt, ...args),
  } as Lobj;
}
///
L.ease = {
  ...EaseStyle,
  ...EaseFunc,
} as Record<EaseStyle | EaseFunc, EaseStyle | EaseFunc>;
///
L.ani = function (tgt: Ltgt, ...args: Loption[]): Lobj {
  const l = L(tgt);
  const animation = _parseAnimationArgs(...args);
  if (animation.durationMs > 0) {
    l.animation = animation;
    const origTransition = L.get.sty(l, `transition`);
    L.set.sty(
      l,
      `transition`,
      `all ${animation.durationMs}ms ${_bezier(animation)}`
    );
    setTimeout(() => {
      L.set.sty(l, `transition`, origTransition);
      l.animation = null;
    }, animation.durationMs);
  }
  return l;
};
///
L.add = function (tgt: Ltgt | null, tagName: string, ...args: Loption[]): Lobj {
  const tag = document.createElement(tagName);
  const l = L(tag).ani(...args);

  if (l.animation) {
    L.set.sty(l, `opacity`, 0);
    requestAnimationFrame(() => L.set.sty(l, `opacity`, 1));
    setTimeout(() => L.del.sty(l, `opacity`), l.animation.durationMs);
  }

  if (tgt) {
    L(tgt).idx(0).appendChild(tag);
  }

  return l;
};
///
L.rem = function (tgt: Ltgt, ...args: Loption[]): Lobj {
  // reverse so that later args override earlier args:
  const boolArgs = [...args]
    .reverse()
    .filter((arg) => typeof arg === `boolean`);
  const deleteElement = !boolArgs.length ? false : boolArgs[0];
  const showElement = !boolArgs.length ? false : !boolArgs[0];
  const animation = _parseAnimationArgs(...args);
  const l = L(tgt).ani(...args);

  if (!l.animation) {
    if (deleteElement) {
      l.all().forEach((el) => el.parentNode.removeChild(el));
    } else {
      L.set.sty(l, `opacity`, showElement ? 1 : 0);
    }
  } else {
    L.set.sty(l, `opacity`, L.get.sty(l, `opacity`) || (showElement ? 0 : 1));
    requestAnimationFrame(() => L.set.sty(l, `opacity`, showElement ? 1 : 0));
    setTimeout(() => {
      if (deleteElement) {
        l.all().forEach((el) => el.parentNode.removeChild(el));
      }
    }, l.animation.durationMs);
  }

  return l;
};
///
L.on = function (tgt: Ltgt, events: string, fn: Function, off?: boolean): Lobj {
  /// register an event handler on DOM elements (identified by selector string or reference) ///
  const l = L(tgt);
  const eventArr = events.split(`,`).map((ev) => ev.trim());
  l.all().forEach((el) =>
    eventArr.forEach((ev) =>
      (off ? el.removeEventListener : el.addEventListener).call(
        el,
        ev,
        (fn as unknown) as EventListenerOrEventListenerObject
      )
    )
  );
  return l;
};
///
L.off = function (tgt: Ltgt, events: string, fn: Function, on?: boolean): Lobj {
  /// remove an event handler from DOM elements (identified by selector string or reference) ///
  return L.on(tgt, events, fn, !on);
};
///
L.one = function (tgt: Ltgt, events: string, fn: Function): Lobj {
  /// register an event handler on DOM elements to fire ONCE and only once ///
  function handler(...args) {
    L.off(tgt, events, handler);
    fn.call(this, ...args);
  }
  return L.on(tgt, events, handler);
};
///
function _lget(
  tgt: Ltgt,
  key: Lkey,
  getter: Function,
  name: string
): string | null {
  const vals = L(tgt)
    .all()
    .map((el) => getter(el, key));
  if (new Set(vals).size > 1) {
    throw new Error(
      `${name} called on multiple elements with differing values for key "${key}"`
    );
  }
  return vals[0] || null;
}
L.get = function (tgt: Ltgt, key: Lkey): string | null {
  const getAttribute = (el, k) => el.getAttribute(k);
  return _lget(tgt, key, getAttribute, `L.get`);
} as Lget;
L.get.cls = function (tgt: Ltgt, key: Lkey): string | null {
  const hasClass = (el, k) =>
    (el.className || ``).split(` `).includes(k) ? k : null;
  return _lget(tgt, key, hasClass, `L.get.cls`);
};
L.get.sty = function (tgt: Ltgt, key: Lkey): string | null {
  const getStyle = (el, k) => el.style[k];
  return _lget(tgt, key, getStyle, `L.get.sty`);
};
///
function _lset(
  tgt: Ltgt,
  key: Lkey,
  val: Lval,
  setter: Function,
  ...args: Loption[]
): string {
  // treat as no-op if val is null or undefined:
  if (!(val === undefined || val === null)) {
    val = val.toString();
    L.ani(tgt, ...args)
      .all()
      .forEach((el) => setter(el, key, val));
  }
  return val as string;
}
L.set = function (tgt: Ltgt, key: Lkey, val: Lval, ...args: Loption[]): string {
  const setAttribute = (el, k, v) => el.setAttribute(k, v);
  return _lset(tgt, key, val, setAttribute, ...args);
} as Lset;
L.set.cls = function (tgt: Ltgt, key: Lkey): string {
  const setClass = (el, k) => el.classlist.add(k);
  return _lset(tgt, key, true, setClass);
};
L.set.sty = function (
  tgt: Ltgt,
  key: Lkey,
  val: Lval,
  ...args: Loption[]
): string {
  const setStyle = (el, k, v) => (el.style[k] = v);
  return _lset(tgt, key, val, setStyle, ...args);
};
///
function _ldel(
  tgt: Ltgt,
  key: Lkey,
  checker: Function,
  deleter: Function,
  ...args: Loption[]
): boolean {
  return !!L.ani(tgt, ...args)
    .all()
    .filter((el) => checker(el, key))
    .map((el) => deleter(el, key)).length;
}
L.del = function (tgt: Ltgt, key: Lkey, ...args: Loption[]): boolean {
  const hasAttribute = (el, k) => el.hasAttribute(k);
  const delAttribute = (el, k) => el.removeAttribute(key);
  return _ldel(tgt, key, hasAttribute, delAttribute, ...args);
} as Ldel;
L.del.cls = function (tgt: Ltgt, key: Lkey, ...args: Loption[]): boolean {
  const hasClass = (el, k) => el.classList.contains(k);
  const delClass = (el, k) => el.removeAttribute(k);
  return _ldel(tgt, key, hasClass, delClass, ...args);
};
L.del.sty = function (tgt: Ltgt, key: Lkey, ...args: Loption[]): boolean {
  const hasStyle = (el) => !!el.style[key].length;
  const delStyle = (el) => (el.style[key] = ``);
  return _ldel(tgt, key, hasStyle, delStyle, ...args);
};
///
function _lcyc(
  tgt: Ltgt,
  key: Lkey,
  vals: Lval[],
  getter: Function,
  setter: Function,
  ...args: Loption[]
): string {
  const l = L(tgt);
  vals = vals.map((v) => v.toString());
  const val = vals[(vals.indexOf(getter(l, key)) + 1) % vals.length];
  setter(l, key, val);
  return val as string;
}
L.cyc = function (
  tgt: Ltgt,
  key: Lkey,
  vals: Lval[],
  ...args: Loption[]
): string {
  return _lcyc(tgt, key, vals, L.get, L.set, ...args);
} as Lcyc;
L.cyc.cls = function (
  tgt: Ltgt,
  key: Lkey,
  vals: Lval[],
  ...args: Loption[]
): string {
  return _lcyc(tgt, key, vals, L.get.cls, L.set.cls, ...args);
};
L.cyc.sty = function (
  tgt: Ltgt,
  key: Lkey,
  vals: Lval[],
  ...args: Loption[]
): string {
  return _lcyc(tgt, key, vals, L.get.sty, L.set.sty, ...args);
};
///
function _lrnd(
  tgt: Ltgt,
  key: Lkey,
  vals: Lval[],
  setter: Function,
  ...args: Loption[]
): string {
  const l = L(tgt);
  vals = vals.map((v) => v.toString());
  const val = vals[Math.floor(Math.random() * vals.length)];
  setter(l, key, val);
  return val as string;
}
L.rnd = function (
  tgt: Ltgt,
  key: Lkey,
  vals: Lval[],
  ...args: Loption[]
): string {
  return _lrnd(tgt, key, vals, L.set, ...args);
} as Lrnd;
L.rnd.cls = function (
  tgt: Ltgt,
  key: Lkey,
  vals: Lval[],
  ...args: Loption[]
): string {
  return _lrnd(tgt, key, vals, L.set.cls, ...args);
};
L.rnd.sty = function (
  tgt: Ltgt,
  key: Lkey,
  vals: Lval[],
  ...args: Loption[]
): string {
  return _lrnd(tgt, key, vals, L.set.sty, ...args);
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
  configure: (config: LstateConfig): Lstate => {
    L.state.config = L.state.config || new Map(); // config -- store value defaults, options
    L.state.aliases = L.state.aliases || new Map(); // aliases -- store key aliases
    Object.entries(config).forEach(([key, cfg]) => {
      L.state.config.set(key, {
        ...(L.state.config.get(key) || {}),
        ...config[key],
      });
      cfg.aliases?.forEach((alias) => L.state.aliases.set(alias, key));
    });
    return L.state;
  },

  // Configure L.state with:
  // -- an optional custom handler function to run whenever state is loaded from URL
  // then register event listeners to load URL state on pageload and browser back.
  load: (onLoad?: Function): Lstate => {
    L(window).on(`load,popstate`, () => {
      // Use L.state.set instead of constructing params directly from
      // window.location.search so that aliasing and data validation take place:
      L.state.params = new URLSearchParams();
      new URLSearchParams(window.location.search).forEach((val, key) =>
        L.state.set(key, val)
      );
      // For each key, if default provided, set val to default IFF no value was taken from url:
      let changed = false;
      L.state.config.forEach((cfg, key) => {
        if (cfg.default && !L.state.get(key)) {
          L.state.set(key, cfg.default);
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
  aliased: (key: string, { reverse = false } = {}): string => {
    if (reverse) {
      return (
        L.state.config
          ?.get(key)
          ?.aliases?.sort((a, b) => a.length - b.length)[0] || key
      );
    } else {
      return L.state.aliases.get(key) || key;
    }
  },

  // From and index or normal/longform val, return the corresponding longform val:
  // reverse=true : From a longform val, get index
  indexed: (key: string, val: string, { reverse = false } = {}): string => {
    const options = L.state.config?.get(L.state.aliased(key))?.options;
    if (reverse) {
      return (options && options.indexOf(val).toString()) || val;
    } else {
      return (options && options[parseInt(val)]) || val;
    }
  },

  // Throw an error if key/value does not match provided L.state configuration:
  validate: (key: string, val?: string): Lstate => {
    if (L.state.config) {
      // If key list was configured, validate provided key:
      if (!L.state.config.has(key)) {
        throw new Error(`L.state.get given invalid key "${key}"`);
      }
      if (typeof val === `string`) {
        // If options list was configured for key, validate provided key/value:
        const options = L.state.config.get(key)?.options;
        if (options && !options.includes(val)) {
          throw new Error(
            `L.state.set given invalid value "${val}" for key "${key}"`
          );
        }
      }
    }
    return L.state;
  },

  // Get a value (or null) from URL state via key:
  get: (key: string): string | null => {
    key = L.state.aliased(key);
    L.state.validate(key);
    return L.state.params.get(key) || null;
  },

  // Set a value in URL state via key/value:
  set: (key: string, val: string): string => {
    key = L.state.aliased(key);
    val = L.state.indexed(key, val);
    L.state.validate(key, val);
    if (typeof val === `string`) {
      if (L.state.params.get(key) !== val) {
        L.state.params.set(key, val);
        L.state.params.sort();
      }
    }
    return val;
  },

  // Delete a value from URL state via key:
  del: (key: string): boolean => {
    key = L.state.aliased(key);
    L.state.validate(key);
    if (L.state.params.has(key)) {
      L.state.params.delete(key);
      return true;
    }
    return false;
  },

  // Send updated URL state to window.history, updating address bar:
  write: ({ push = false }: { push?: boolean } = {}): Lstate => {
    const url = new URL(window.location.href);
    url.search = L.state.params.toString();
    if (push) {
      window.history.pushState({ path: url.href }, ``, url.href);
    } else {
      window.history.replaceState({ path: url.href }, ``, url.href);
    }
    return L.state;
  },

  url: ({ short = false } = {}): string => {
    const url = new URL(window.location.href);
    let params;
    if (short) {
      params = new URLSearchParams();
      L.state.params.forEach((val, key) => {
        const shortKey = L.state.aliased(key, { reverse: true });
        const shortVal = L.state.indexed(key, val, { reverse: true });
        params.set(shortKey, shortVal);
      });
      params.sort();
    } else {
      params = L.state.params;
    }
    url.search = params.toString();
    return url.href;
  },
};
///
/// L.state -- Url-Based State Management /// END ///

/// L.copy -- copy-to-clipboard with graceful degradation /// BEGIN ///
//
L.copy = function (text: string): string {
  const fallbackMessage = `Copy url and send to your spotter -> Press Ctrl+C then Enter`;
  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(text)
      .catch(() => window.prompt(fallbackMessage, text));
  } else {
    var textArea = document.createElement(`textarea`);
    textArea.value = text;
    // Avoid scrolling to bottom
    textArea.style.top = (0).toString();
    textArea.style.left = (0).toString();
    textArea.style.position = `fixed`;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand(`copy`);
    } catch (err) {
      window.prompt(fallbackMessage, text);
    }
    document.body.removeChild(textArea);
  }
  return text;
};
//
/// L.copy -- copy-to-clipboard with graceful degradation /// END ///

export default L;
