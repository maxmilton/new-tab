import { Link, type LinkComponent, type LinkProps } from './Link';

export interface TabLinkProps extends LinkProps {
  /** Tab ID. */
  id: number;
  windowId: number;
}

export const TabLink = (props: TabLinkProps): LinkComponent => {
  const root = Link(props);

  root.__click = () => {
    // Switch to the clicked tab
    void chrome.tabs.update(props.id, { active: true });

    // Switch active window if the tab isn't in the current window
    chrome.windows.getCurrent({}, (currentWindow) => {
      if (currentWindow.id !== props.windowId) {
        void chrome.windows.update(props.windowId, { focused: true });
      }
    });

    // Close current "new-tab" page
    chrome.tabs.getCurrent((currentTab) => {
      void chrome.tabs.remove(currentTab!.id!);
    });
  };

  return root;
};
