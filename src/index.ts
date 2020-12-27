/// L -- Functional, Minimalist DOM/Browser Utils ///

/// Types /// BEGIN ///
///
type Ltgt = string | HTMLElement | HTMLElement[] | Document | Window;
interface Lobj {
  all: () => HTMLElement[];
  idx: (index: number) => HTMLElement;
  on: (events: string, fn: Function) => Lobj;
  hide: () => Lobj;
  show: () => Lobj;
  get: (key: string) => string | null;
  set: (key: string, val: string) => string;
  del: (key: string) => boolean;
  cycle: (key: string, vals: string[]) => string;
  rand: (key: string, vals: string[]) => string;
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
  params: URLSearchParams;
  config?: LstateConfig;
  aliases?: LstateAliases;

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

/// L -- DOM query & manipulation utils /// BEGIN ///
///
function L(tgt: Ltgt): Lobj {
  /// query DOM for an array of elements ///
  tgt =
    typeof tgt === `string`
      ? ((Array.from(
          document.body.querySelectorAll(tgt)
        ) as unknown) as HTMLElement[])
      : tgt;
  tgt = ((!Array.isArray(tgt) ? [tgt] : tgt) as unknown) as HTMLElement[];
  return {
    all: () => (tgt as unknown) as HTMLElement[],
    idx: (index) => tgt[0] || null,
    on: (...args) => L.on(tgt, ...args),
    hide: (...args) => L.hide(tgt, ...args),
    show: (...args) => L.show(tgt, ...args),
    get: (...args) => L.get(tgt, ...args),
    set: (...args) => L.set(tgt, ...args),
    del: (...args) => L.del(tgt, ...args),
    cycle: (...args) => L.cycle(tgt, ...args),
    rand: (...args) => L.rand(tgt, ...args),
  };
}

L.on = function (tgt: Ltgt, events: string, fn: Function): Lobj {
  /// register an event handler on DOM elements (identified by selector string or reference) ///
  const l = L(tgt);
  const eventArr = events.split(`,`).map((ev) => ev.trim());
  l.all().forEach((el) =>
    eventArr.forEach((ev) =>
      el.addEventListener(
        ev,
        (fn as unknown) as EventListenerOrEventListenerObject
      )
    )
  );
  return l;
};

L.hide = function (tgt: Ltgt): Lobj {
  /// set element opacity to zero so it may fade out ///
  const l = L(tgt);
  l.all().forEach((el) => (el.style.opacity = (0).toString()));
  return l;
};

L.show = function (tgt: Ltgt): Lobj {
  /// set element opacity to one so it may fade in ///
  const l = L(tgt);
  l.all().forEach((el) => (el.style.opacity = (1).toString()));
  return l;
};

L.get = function (tgt: Ltgt, key: string): string | null {
  const vals = L(tgt)
    .all()
    .map((el) => el.getAttribute(key));
  if (new Set(vals).size > 1) {
    throw new Error(`L.get called on multiple elements with differing values`);
  }
  return vals[0] || null;
};

L.set = function (tgt: Ltgt, key: string, val: string): string {
  if (typeof val === `string`) {
    L(tgt)
      .all()
      .forEach((el) => el.setAttribute(key, val));
  }
  return val;
};

L.del = function (tgt: Ltgt, key: string): boolean {
  const elements = L(tgt).all();
  const result = elements.some((el) => el.hasAttribute(key));
  elements.forEach((el) => el.removeAttribute(key));
  return result;
};

L.cycle = function (tgt: Ltgt, key: string, vals: string[]): string {
  const l = L(tgt);
  const val = vals[(vals.indexOf(l.get(key)) + 1) % vals.length];
  l.set(key, val);
  return val;
};

L.rand = function (tgt: Ltgt, key: string, vals: string[]): string {
  const l = L(tgt);
  const val = vals[Math.floor(Math.random() * vals.length)];
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
