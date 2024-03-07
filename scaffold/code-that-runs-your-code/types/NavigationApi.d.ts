/**
 * @file Types for the upcoming navigation API
 * https://developer.chrome.com/docs/web-platform/navigation-api/
 * https://github.com/WICG/navigation-api
 * https://wicg.github.io/navigation-api/
 */

export {};

type TODO = unknown;

declare global {
  interface Window {
    navigation?: Navigation;
  }

  /**
   * @see https://wicg.github.io/navigation-api/#navigation
   */
  interface Navigation extends EventTarget {
    readonly canGoBack: boolean;
    readonly canGoForward: boolean;
    readonly currentEntry: NavigationHistoryEntry;
    oncurrententrychange: ((this: Navigation, ev: NavigationCurrentEntryChangeEvent) => any) | null;
    onnavigate: ((this: Navigation, ev: NavigateEvent) => any) | null;
    onnavigateerror: ((this: Navigation, ev: ErrorEvent) => any) | null;
    onnavigatesuccess: ((this: Navigation, ev: Event) => any) | null;
    transition: NavigationTransition | null;
    addEventListener<K extends keyof NavigationEventMap>(
      type: K,
      listener: (this: Navigation, ev: NavigationEventMap[K]) => any,
      options?: boolean | AddEventListenerOptions
    ): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    back(options?: NavigationOptions): void;
    entries(): NavigationHistoryEntry[];
    forward(options?: NavigationOptions): void;
    navigate(href: string, options?: { state?: any; history?: NavigationHistoryBehavior }): NavigationResult;
    reload(options?: NavigationReloadOptions): NavigationResult;
    removeEventListener<K extends keyof NavigationEventMap>(
      type: K,
      listener: (this: Navigation, ev: NavigationEventMap[K]) => any,
      options?: boolean | AddEventListenerOptions
    ): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    traverseTo(key: string, options?: NavigationOptions): void;
    updateCurrentEntry(entry: NavigationUpdateCurrentEntryOptions);
  }

  type NavigationType = 'push' | 'replace' | 'reload' | 'traverse';

  type NavigationHistoryBehavior = 'auto' | 'push' | 'replace';

  interface NavigationOptions {
    info: any;
  }

  interface NavigationNavigateOptions extends NavigationOptions {
    /** @default "auto" */
    history?: NavigationHistoryBehavior;
    state: any;
  }

  interface NavigationReloadOptions extends NavigationOptions {
    state: any;
  }

  interface NavigationUpdateCurrentEntryOptions {
    state: any;
  }

  interface NavigationResult {
    committed: Promise<NavigationHistoryEntry>;
    finished: Promise<NavigationHistoryEntry>;
  }

  interface NavigationTransition {
    readonly navigationType: NavigationType;
    readonly from: NavigationHistoryEntry;
    readonly finished: Promise<undefined>;
  }

  interface NavigationHistoryEntry {
    id: string;
    index: number;
    key: string;
    ondispose: ((ev: Event) => void) | null;
    sameDocument: boolean;
    url: string;
    addEventListener(type: 'dispose', listener: (ev: Event) => void, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    getState(): any;
    removeEventListener(type: 'dispose', listener: (ev: Event) => void, options?: boolean | AddEventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  }

  interface NavigationDestination {
    readonly key: string | null;
    readonly id: string | null;
    readonly url: string;
    readonly index: number;
    readonly sameDocument: boolean;
    getState(): any;
  }

  interface NavigateEvent extends Event {
    readonly canIntercept: boolean;
    /**
     * @deprecated
     * Introduced in Chrome 102, will be removed in Chrome 108.
     * Use {@link canIntercept} instead (Chrome >=105).
     */
    readonly canTransition: boolean;
    readonly currentTarget: Navigation;
    readonly destination: NavigationDestination;
    readonly downloadRequest: string | null;
    readonly formData: FormData | null;
    readonly hashChange: boolean;
    /** See {@link NavigationOptions.info} */
    readonly info: any;
    readonly navigationType: NavigationType;
    readonly path: EventTarget[];
    readonly signal: AbortSignal;
    readonly srcElement: Navigation;
    readonly target: Navigation;
    readonly type: 'navigate';
    readonly userInitiated: boolean;
    intercept(options?: NavigationInterceptOptions): void;
    scroll(): void;
    /**
     * @deprecated
     * Introduced in Chrome 102, will be removed in Chrome 108.
     * Use {@link intercept intercept()} instead (Chrome >=105).
     */
    transitionWhile(promise: Promise<any>): void;
    /**
     * @deprecated
     * Introduced in Chrome 102, will be removed in Chrome 108.
     * Use {@link scroll scroll()} instead (Chrome >=105).
     */
    restoreScroll(): void;
  }

  interface NavigationInterceptOptions {
    focusReset?: NavigationFocusReset;
    handler?: () => Promise<any>;
    scroll?: NavigationScrollBehavior;
  }

  type NavigationFocusReset = 'after-transition' | 'manual';

  type NavigationScrollBehavior = 'after-transition' | 'manual';

  interface NavigationCurrentEntryChangeEvent extends Event {
    readonly currentTarget: Navigation;
    readonly from: NavigationHistoryEntry;
    readonly navigationType?: NavigationType;
    readonly path: EventTarget[];
    readonly srcElement: Navigation;
    readonly target: Navigation;
    readonly type: 'currententrychange';
  }

  interface NavigationEventMap {
    currententrychange: NavigationCurrentEntryChangeEvent;
    navigate: NavigateEvent;
    navigateerror: ErrorEvent;
    navigatesuccess: Event;
  }
}
