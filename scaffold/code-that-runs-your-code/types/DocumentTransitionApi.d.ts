/**
 * @file Types for the document transition API
 * https://developer.chrome.com/blog/shared-element-transitions-for-spas/
 * https://towardsdev.com/the-page-transition-api-b37c88b37375
 */

export {};

declare global {
  interface Document {
    createDocumentTransition?: () => DocumentTransition;
  }

  /**
   * @see https://wicg.github.io/navigation-api/#navigation
   */
  interface DocumentTransition {
    start(callback: () => void): Promise<void>;
  }
}
