import {
  ComponentType,
  createContext,
  ReactNode,
  useMemo,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  AnchorHTMLAttributes,
  forwardRef,
  MouseEvent as ReactMouseEvent
} from 'react';
import { flushSync } from 'react-dom';
/// <reference path="../types/NavigationApi" />
/// <reference path="../types/DocumentTransitionApi" />

interface Location {
  hash: string;
  pathname: string;
  search: string;
  searchParams: URLSearchParams;
  state: any;
}

const LocationContext = createContext<Location | null>(null);

interface History {
  location: Location;
  push(path: string, state?: any): void;
  push(path: Partial<Location>): void;
  replace(path: string, state?: any): void;
  replace(path: Partial<Location>): void;
}

const HistoryContext = createContext<History | null>(null);

interface MiniRouterProps {
  baseUrl?: string;
  children: ReactNode;
  /** @default true */
  transitionPages?: boolean;
  /** @default false */
  transitionHashChange?: boolean;
}

export function MiniRouter({ baseUrl: baseUrlFromProps, children, transitionPages = true, transitionHashChange = false }: MiniRouterProps) {
  const baseUrl = useMemo(() => baseUrlFromProps || new URL('/', document.baseURI).href, [baseUrlFromProps]);

  const [location, setLocation] = useState<Location>(() => {
    // Use new navigation API when available
    const url = window.navigation ? window.navigation.currentEntry.url : window.location.href;
    const state = window.navigation ? window.navigation.currentEntry.getState() : window.history.state;
    const { pathname, search, searchParams, hash } = new URL(url, baseUrl);
    return { pathname, search, searchParams, hash, state };
  });

  const performTransition = useCallback(
    async (updateFn: () => void) => {
      if (!transitionPages || !document.createDocumentTransition) {
        updateFn();
      } else {
        try {
          flushSync(() => void 0);
          const transition = document.createDocumentTransition();
          return transition.start(() => {
            flushSync(() => updateFn());
          });
        } catch (err) {
          if (!(err instanceof DOMException)) {
            throw err;
          }
          updateFn();
        }
      }
    },
    [transitionPages]
  );

  useEffect(() => {
    const navigation = window.navigation;
    if (navigation) {
      // Use new navigation API
      const handleNavigation = (ev: NavigateEvent) => {
        if (!(ev.canIntercept ?? ev.canTransition) || ev.hashChange || ev.downloadRequest != null || ev.formData) {
          return;
        }

        const { pathname, search, searchParams, hash } = new URL(ev.destination.url);
        const state = ev.destination.getState();
        const newLocation: Location = { pathname, search, searchParams, hash, state };

        const handler = async () => {
          return performTransition(() => setLocation(newLocation));
        };

        if (ev.intercept) {
          // Chrome >= 105
          ev.intercept({ handler });
        } else {
          // Chrome 102-108
          ev.transitionWhile(handler());
        }
      };

      const handleCurrentEntryChange = (ev: NavigationCurrentEntryChangeEvent) => {
        const state = navigation.currentEntry.getState();
        const isNavigating = navigation.transition != null;

        if (isNavigating) {
          // On navigation, the browser fires "navigate"->"currententrychange"->"navigatesuccess".
          // If we start a transition animation on "navigate", we should not setState() here,
          // or the animation will jump between the transition and the target page.
          return setLocation(location => ({ ...location, state }));
        }

        const { pathname, search, searchParams, hash } = new URL(navigation.currentEntry.url);
        const oldUrl = new URL(ev.from.url);
        const newLocation: Location = { pathname, search, searchParams, hash, state };

        const isSameUrl = pathname === oldUrl.pathname && search === oldUrl.search;
        const onlyHashChanged = isSameUrl && hash !== oldUrl.hash;

        const shouldTransition = transitionPages && (onlyHashChanged ? transitionHashChange : !isSameUrl);
        if (shouldTransition) {
          performTransition(() => setLocation(newLocation));
        } else {
          setLocation(newLocation);
        }
      };

      navigation.addEventListener('navigate', handleNavigation);
      navigation.addEventListener('currententrychange', handleCurrentEntryChange);

      return () => {
        navigation.removeEventListener('navigate', handleNavigation);
        navigation.removeEventListener('currententrychange', handleCurrentEntryChange);
      };
    } else {
      // Use old history API & intercept links
      const handlePopState = (ev: PopStateEvent) => {
        const url = window.location.href;
        const { hash, pathname, search, searchParams } = new URL(url, baseUrl);
        setLocation({ hash, pathname, search, searchParams, state: ev.state });
      };

      const interceptLinkClicks = (event: MouseEvent) => {
        if (event.defaultPrevented || !(event.target instanceof HTMLAnchorElement) || !event.target.href) {
          return;
        }

        const url = new URL(event.target.href, window.location.href);
        if (url.href.startsWith(baseUrl)) {
          event.preventDefault();
          const { pathname, search, searchParams, hash } = url;
          window.history.pushState({}, '', url);
          setLocation({ pathname, search, searchParams, hash, state: null });
        }
      };

      window.addEventListener('popstate', handlePopState);
      document.addEventListener('click', interceptLinkClicks);

      return () => {
        window.removeEventListener('popstate', handlePopState);
        document.removeEventListener('click', interceptLinkClicks);
      };
    }
  }, [transitionPages, transitionHashChange, performTransition, baseUrl]);

  const navigateTo = useCallback(
    (replace: boolean, path: string | Partial<Location>, state?: any) => {
      let url: URL;
      if (typeof path === 'string') {
        url = new URL(path, window.location.href);
      } else {
        url = path.pathname ? new URL(path.pathname, window.location.href) : new URL(window.location.href);
        if (path.searchParams) {
          const queryString = path.searchParams.toString();
          if (queryString) {
            url.search = `?${queryString}`;
          }
        } else if (path.search) {
          url.search = path.search;
        }

        if (path.hash) {
          url.hash = path.hash;
        }
        state = path.state;
      }

      const { pathname, search, searchParams, hash } = url;
      const newLocation: Location = { pathname, search, searchParams, hash, state };

      const navigation = window.navigation;
      if (navigation) {
        // Use new Navigation API
        performTransition(() => {
          if (replace && typeof path === 'object' && Object.keys(path).join('') === 'state') {
            navigation.updateCurrentEntry({ state });
          } else {
            navigation.navigate(url.href, { state, history: replace ? 'replace' : 'push' });
          }
        });
      } else {
        // Use old History API
        if (replace) {
          window.history.replaceState(state, '', url);
        } else {
          window.history.pushState(state, '', url);
        }
        setLocation(newLocation);
      }
    },
    [performTransition]
  );

  const push = useCallback((path: string | Partial<Location>, state?: any) => navigateTo(false, path, state), [navigateTo]);
  const replace = useCallback((path: string | Partial<Location>, state?: any) => navigateTo(true, path, state), [navigateTo]);

  const historyObject: History = useMemo(() => {
    return { location: location, push, replace };
  }, [location, push, replace]);

  return (
    <LocationContext.Provider value={location}>
      <HistoryContext.Provider value={historyObject}>{children}</HistoryContext.Provider>
    </LocationContext.Provider>
  );
}

interface RouteProps {
  path: string;
  component: ComponentType<{}>;
}

export function Route({ path, component: Component }: RouteProps) {
  const location = useContext(LocationContext);
  if (!location) {
    throw new Error('<Route> must be rendered inside <MiniRouter>!');
  }

  // TODO: Implement pattern matching - currently only static paths match
  // https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API
  const isMatch = location.pathname === path;

  if (isMatch) {
    return <Component />;
  } else {
    return null;
  }
}

export function useLocation() {
  const location = useContext(LocationContext);
  if (!location) {
    throw new Error('useLocation() must be used inside <MiniRouter>!');
  }
  return location;
}

export function useHistory() {
  const history = useContext(HistoryContext);
  if (!history) {
    throw new Error('useHistory() must be used inside <MiniRouter>!');
  }
  return history;
}

export function useParams() {
  const location = useContext(LocationContext);
  if (!location) {
    throw new Error('useParams() must be used inside <MiniRouter>!');
  }

  const params = useMemo(() => {
    const paramsMap: Record<string, string> = {};
    new URLSearchParams(location.search).forEach((value, key) => {
      paramsMap[key] = value;
    });
    return paramsMap;
  }, [location.search]);

  return params;
}

interface UseLocationStateOptions {
  /** @default true */
  replace?: boolean;
}

type UseLocationSetState<T> = (state: T | ((currentState: T) => T)) => void;
type UseLocationStateReturn<T> = [state: Partial<T> | undefined, setState: UseLocationSetState<T>];

export function useLocationState<T extends object>({ replace = true }: UseLocationStateOptions = {}): UseLocationStateReturn<T> {
  const history = useContext(HistoryContext);
  const currentlocation = useContext(LocationContext);

  if (!history || !currentlocation) {
    throw new Error('useRouteState() must be rendered inside <MiniRouter>!');
  }

  const historyRef = useRef(history);
  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  const setState: UseLocationSetState<T> = useCallback(
    stateOrUpdate => {
      const history = historyRef.current;
      const currentState: T = history.location.state;
      let state: T;
      if (typeof stateOrUpdate === 'function') {
        const update = stateOrUpdate as (state: T) => T;
        state = update(currentState);
      } else {
        state = stateOrUpdate;
      }
      if (replace) {
        history.replace({ state });
      } else {
        history.push({ state });
      }
    },
    [replace]
  );

  return [currentlocation.state, setState];
}

interface LinkProps {
  to: string | Partial<Location>;
  replace?: boolean;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps & AnchorHTMLAttributes<HTMLAnchorElement>>((props, ref) => {
  const { to, replace, children, ...anchorProps } = props;

  const typecheckExcessProperties: Omit<typeof anchorProps, keyof AnchorHTMLAttributes<any>> = {};
  void typecheckExcessProperties;

  const location = useContext(LocationContext);
  const history = useContext(HistoryContext);
  if (!location || !history) {
    throw new Error('<Link> must be used inside <MiniRouter>!');
  }

  const href = useMemo(() => {
    if (typeof to === 'string') return to;
    const currentUrl = new URL(window.location.href);
    const pathname = to.pathname ?? (to.search ? currentUrl.pathname : '');
    const search = to.search ?? (to.pathname ? '' : currentUrl.search);

    return `${pathname}${search && `?${search}}`}${to.hash && `#${to.hash}`}`;
  }, [to]);

  const onClickExternal = anchorProps.onClick;

  const handleClick = useCallback(
    (event: ReactMouseEvent<HTMLAnchorElement>) => {
      if (onClickExternal) {
        onClickExternal(event);
        if (event.defaultPrevented) {
          return;
        }
      }

      event.preventDefault();

      // Type hatch as TypeScript does not consider the overloads of push/replace and props.to compatible
      const go = (replace ? history.replace : history.push) as (to: string | Partial<Location>) => void;
      go(to);
    },
    [onClickExternal, history, replace, to]
  );

  return (
    <a {...anchorProps} ref={ref} href={href} onClick={handleClick}>
      {children}
    </a>
  );
});
