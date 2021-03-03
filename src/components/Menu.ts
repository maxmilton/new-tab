import h from 'stage0';

const view = h`
  <div id="menu">
    <div id="icon">☰</div>

    <div id="dropdown">
      <a href="chrome-search://local-ntp/local-ntp.html" class="menu-item">
        Open Default Tab
      </a>
      <a href="chrome://bookmarks/" class="menu-item">
        Bookmarks Manager
      </a>
      <a href="chrome://downloads/" class="menu-item">
        Downloads
      </a>
      <a href="chrome://history/" class="menu-item">
        History
      </a>
      <a href="chrome://settings/passwords" class="menu-item">
        Passwords
      </a>

      <hr>

      <a class="menu-item" #settings>
        New Tab Settings
      </a>
      <a href="https://github.com/MaxMilton/new-tab/issues" class="menu-item">
        Submit Bug
      </a>
    </div>
  </div>
`;

export function Menu() {
  const root = view;
  const { settings } = view.collect(root);

  settings.__click = () => {
    chrome.runtime.openOptionsPage();
  };

  return root;
}
