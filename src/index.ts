/// L -- Functional, Minimalist DOM/Browser Utils ///

/// Types /// BEGIN ///
///
enum Easing {
  EaseInOut = `ease-in-out`,
  EaseIn = `ease-in`,
  EaseOut = `ease-out`,
}
enum EaseFunc {
  Linear = `linear`,
  Quadradic = `quadradic`,
  Cubic = `cubic`,
  Quartic = `quartic`,
  Quintic = `quintic`,
}
interface Animation {
  easing: Easing;
  easeFunc: EaseFunc;
  duration: number;
}
type Option = boolean | number | Easing | EaseFunc;
type Ltgt = Lobj | string | HTMLElement | HTMLElement[] | Document | Window;
interface LsubGet { // allows direct manipulation of element classes & styles
  cls?: (tgt: Ltgt, key: string) => string | null;
  sty?: (tgt: Ltgt, key: string) => string | null;
}
interface LsubSet { // allows direct manipulation of element classes & styles
  cls?: (tgt: Ltgt, key: string, val: string) => string;
  sty?: (tgt: Ltgt, key: string, val: string) => string;
}
interface LsubDel { // allows direct manipulation of element classes & styles
  cls?: (tgt: Ltgt, key: string) => boolean,
  sty?: (tgt: Ltgt, key: string) => boolean,
}
interface LsubCycRnd { // allows direct manipulation of element classes & styles
  cls?: (tgt: Ltgt, key: string, vals: string[]) => string;
  sty?: (tgt: Ltgt, key: string, vals: string[]) => string;
}
type Lget = LsubGet & ((tgt: Ltgt, key: string) => string | null);
type Lset = LsubSet & ((tgt: Ltgt, key: string, val: string, ...args: Option[]) => string);
type Ldel = LsubDel & ((tgt: Ltgt, key: string, ...args: Option[]) => boolean);
type Lcyc = LsubCycRnd & ((tgt: Ltgt, key: string, vals: string[], ...args: Option[]) => string);
type Lrnd = LsubCycRnd & ((tgt: Ltgt, key: string, vals: string[], ...args: Option[]) => string);
interface Lobj {
  elements: HTMLElement[];
  all: (requery?: boolean) => HTMLElement[];
  idx: (index: number) => HTMLElement;
  add: (...args: Option[]) => Lobj;
  rem: (...args: Option[]) => Lobj;
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
const easings: Set<Option> = new Set(Object.values(Easing));
const easeFuncs: Set<Option> = new Set(Object.values(EaseFunc));
function parseAnimationArgs(...args: Option[]): Animation {
  return {
    easing: args.filter((arg) => easings.has(arg))[0] as Easing || Easing.EaseInOut,
    easeFunc: args.filter((arg) => easeFuncs.has(arg))[0] as EaseFunc || EaseFunc.Cubic, // default: smooth ease timing
    duration: args.filter((arg) => Number.isInteger(arg))[0] as number || 0, // default: immediate, no animation
  };
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
        const res = typeof tgt !== `string` ? tgt : ((Array.from(
          document.body.querySelectorAll(tgt)
        ) as unknown) as HTMLElement[]);
        l.elements = ((!Array.isArray(res) ? [res] : res) as unknown) as HTMLElement[];
      }
      return l.elements;
    },
    idx: (index) => l.all()[0] || null,
  };
  [
    `get`,
    `set`,
    `del`,
    `cyc`,
    `rnd`,
  ].forEach((func) => {
    l[func] = (...args) => L[func](tgt, ...args);
    l[func].cls = (...args) => L[func].cls(tgt, ...args);
    l[func].sty = (...args) => L[func].sty(tgt, ...args);
  });
  return {
    ...l,
    on:  (...args) => L.on(tgt, ...args),
    off: (...args) => L.off(tgt, ...args),
    one: (...args) => L.one(tgt, ...args),
    add: (...args) => L.add(tgt, ...args),
    rem: (...args) => L.rem(tgt, ...args),
  } as Lobj;
}
///
L.add = function (tgt: Ltgt, ...args: Option[]): Lobj {
  return L(tgt); // TODO
};
///
L.rem = function (tgt: Ltgt, ...args: Option[]): Lobj {
  // reverse so that later args override earlier args
  const lastBoolArg = [...args].reverse().filter((arg) => typeof arg === `boolean`)[0] || null;
  const argDeleteElement = lastBoolArg === null ? false : lastBoolArg;
  const argShowElement = lastBoolArg === null ? false : !lastBoolArg;
  const animation = parseAnimationArgs(...args);

  // TODO remove element if deleteElement is true; set display=none pointer=events none if not

  return L(tgt);
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
L.get = function (tgt: Ltgt, key: string): string | null {
  const vals = L(tgt)
    .all()
    .map((el) => el.getAttribute(key));
  if (new Set(vals).size > 1) {
    throw new Error(`L.get called on multiple elements with differing values`);
  }
  return vals[0] || null;
} as Lget;
L.get.cls = function (tgt: Ltgt, key: string): string | null {
  return null; // TODO
};
L.get.sty = function (tgt: Ltgt, key: string): string | null {
  return null; // TODO
};
///
L.set = function (tgt: Ltgt, key: string, val: string, ...args: Option[]): string {
  if (typeof val === `string`) {
    L(tgt)
      .all()
      .forEach((el) => el.setAttribute(key, val));
  }
  return val;
} as Lset;
L.set.cls = function (tgt: Ltgt, key: string, val: string, ...args: Option[]): string {
  return `set`; // TODO
};
L.set.sty = function (tgt: Ltgt, key: string, val: string, ...args: Option[]): string {
  return `set`; // TODO
};
///
L.del = function (tgt: Ltgt, key: string, ...args: Option[]): boolean {
  const elements = L(tgt).all();
  const result = elements.some((el) => el.hasAttribute(key));
  elements.forEach((el) => el.removeAttribute(key));
  return result;
} as Ldel;
L.del.cls = function (tgt: Ltgt, key: string, ...args: Option[]): boolean {
  return true; // TODO
};
L.del.sty = function (tgt: Ltgt, key: string, ...args: Option[]): boolean {
  return true; // TODO
};
///
L.cyc = function (tgt: Ltgt, key: string, vals: string[], ...args: Option[]): string {
  const l = L(tgt);
  const val = vals[(vals.indexOf(L.get(l, key)) + 1) % vals.length];
  L.set(l, key, val);
  return val;
} as Lcyc;
L.cyc.cls = function (tgt: Ltgt, key: string, vals: string[], ...args: Option[]): string {
  return `cyc`; // TODO
};
L.cyc.sty = function (tgt: Ltgt, key: string, vals: string[], ...args: Option[]): string {
  return `cyc`; // TODO
};
///
L.rnd = function (tgt: Ltgt, key: string, vals: string[], ...args: Option[]): string {
  const l = L(tgt);
  const val = vals[Math.floor(Math.random() * vals.length)];
  L.set(l, key, val);
  return val;
} as Lrnd;
L.rnd.cls = function (tgt: Ltgt, key: string, vals: string[], ...args: Option[]): string {
  return `rnd`; // TODO
};
L.rnd.sty = function (tgt: Ltgt, key: string, vals: string[], ...args: Option[]): string {
  return `rnd`; // TODO
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
