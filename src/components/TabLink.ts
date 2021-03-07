import { Link, LinkProps, LinkComponent } from './Link';

interface TabLinkProps extends LinkProps {
  /** Tab ID. */
  id: number;
  windowId: number;
}

function handleTabClick({ id, windowId }: TabLinkProps) {
  return (_event: MouseEvent) => {
    // Switch to the clicked tab
    chrome.tabs.update(id, { active: true });

    // Switch active window if the tab isn't in the current window
    chrome.windows.getCurrent({}, (currentWindow) => {
      if (currentWindow.id !== windowId) {
        chrome.windows.update(windowId, { focused: true });
      }
    });

    // Close this "new-tab" tab
    chrome.tabs.getCurrent((currentTab) => {
      chrome.tabs.remove(currentTab!.id!);
    });
  };
}

export function TabLink(props: TabLinkProps): LinkComponent {
  const root = Link(props);

  root.__click = handleTabClick(props);

  return root;
}
