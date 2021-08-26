import { Link, LinkComponent, LinkProps } from './Link';

export interface TabLinkProps extends LinkProps {
  /** Tab ID. */
  id: number;
  windowId: number;
}

export const TabLink = (props: TabLinkProps): LinkComponent => {
  const root = Link(props);

  root.__click = () => {
    const { id, windowId } = props;

    // Switch to the clicked tab
    void chrome.tabs.update(id, { active: true });

    // Switch active window if the tab isn't in the current window
    chrome.windows.getCurrent({}, (currentWindow) => {
      if (currentWindow.id !== windowId) {
        void chrome.windows.update(windowId, { focused: true });
      }
    });

    // Close current "new-tab" page
    chrome.tabs.getCurrent((currentTab) => {
      void chrome.tabs.remove(currentTab!.id!);
    });
  };

  return root;
};
