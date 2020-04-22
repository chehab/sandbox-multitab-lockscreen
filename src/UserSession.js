import React from "react";
import uuid from "uuid/v1";
import JsonView from "react-json-view";
import styled, { css } from "styled-components";

const VER = "5 1";
const ENV = "production"; // "develop";

const hideProps = ({ hide }) => {
  console.log("((hideProps))", { hide });

  return hide
    ? css`
        display: none;
      `
    : css`
        color: white;
        background: coral;
      `;
};

const activeProps = ({ isActive }) => {
  console.log("((activeProps))", { isActive });

  return isActive
    ? css`
        color: white;
        background: deepskyblue;
        &:before {
          content: "😀  Active";
        }
      `
    : css`
        color: lightgray;
        background: darkgray;

        &:before {
          content: "😴  Sleeping";
        }
      `;
};

const LockNotice = styled.div`
  background: gray;
  width: 100vw;
  height: 18px;
  position: fixed;
  top: 0;
  left: 0;
  padding: 5px;
  ${hideProps}

  &:before {
    content: "🔒 Locked";
    padding: 20px;
    top: 10px;
    margin-top: 10px;
  }
`;

const ActiveNotice = styled(LockNotice)`
  ${activeProps}
`;

const Inspect = styled.div`
  background: rgba(255, 255, 255, 0.7);
  padding: 10px;
`;

export default class UserSession extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      uuid: uuid(),
      isActive: document.hasFocus()
    };

    this.isTabFouced = JSON.stringify(document.hasFocus());
  }

  componentDidMount() {
    // document.addEventListener("onblur", () => {});
    document.body.onfocus = this.handleTabFocused;
    document.body.onblur = this.handleTabUnfocused;
    window.onstorage = this.handleActiveTabChange;
    window.onunload = this.removeTabInstance;
  }

  componentWillUnmount() {
    this.removeTabInstance();
  }

  getTabItem = tabId => {
    if (ENV === "develop") {
      return ENV_DEVL.call(this);
    } else {
      return ENV_PROD.call(this);
    }

    function ENV_DEVL() {
      try {
        const valStr = localStorage.getItem(tabId);
        const val = JSON.parse(valStr);

        console.log("[getTabItem]", {
          tabId,
          val,
          valStr
        });

        return val;
      } catch (e) {
        console.error(e);
        return null;
      }
    }

    function ENV_PROD() {
      const valB64 = localStorage.getItem(tabId);
      const valStr = atob(valB64);
      const valParsed = JSON.parse(valStr);
      const val = valParsed === tabId;

      console.log("[getTabItem]", {
        tabId,
        val,
        valStr,
        valB64
      });

      return val;
    }
  };

  removeTabInstance = () => {
    localStorage.removeItem(this.tabId);
  };

  handleTabFocused = () => {
    console.log(`[${this.tabId}] @@onfocus`);

    this.isTabFouced = true;

    this.setState(this.tabsStatus);
  };

  handleTabUnfocused = () => {
    console.log(`[${this.tabId}] @@onblur`);

    this.isTabFouced = false;

    this.setState(this.tabsStatus);
  };

  handleActiveTabChange = () => {
    console.log(`[${this.tabId}] @@onstorage`);

    this.setState(this.tabsStatus);
  };

  set isTabFouced(value) {
    if (ENV === "develop") {
      return ENV_DEVL.call(this);
    } else {
      return ENV_PROD.call(this);
    }

    function ENV_DEVL() {
      const valStr = JSON.stringify(value);
      localStorage.setItem(this.tabId, valStr);
    }

    function ENV_PROD() {
      const valStr = value
        ? JSON.stringify(this.tabId)
        : JSON.stringify(`${this.tabId}/.`);

      const valB64 = btoa(valStr);

      localStorage.setItem(this.tabId, valB64);
    }
  }

  get tabsStatus() {
    const tabsList = this.tabsList;

    const hasActiveTab = this.hasActiveTab;

    console.log(`[${this.state.uuid}] handleHasActiveTabs`, {
      tabsList,
      hasActiveTab
    });

    return {
      hasActiveTab,
      isActive: document.hasFocus()
    };
  }

  get tabsList() {
    return Object.keys(localStorage).filter(tabId =>
      tabId.match(this.tabIdRegex)
    );
  }

  get hasActiveTab() {
    return this.tabsList.reduce((hasActiveTab, tabId) => {
      const val = this.getTabItem(tabId);
      return hasActiveTab || val;
    }, false);
  }

  get isTabFouced() {
    return localStorage.getItem(this.tabId);
  }

  get tabId() {
    return `/${this.state.uuid.replace(/-/g, ".")}.i.b/t`;
  }

  get tabIdRegex() {
    return /^\/[0-9a-f]{8}.[0-9a-f]{4}.[0-9a-f]{4}.[0-9a-f]{4}.[0-9a-f]{12}\.i\.b\/t$/;
  }

  render() {
    return (
      <div>
        <LockNotice hide={this.state.hasActiveTab} />

        <ActiveNotice
          hide={!this.state.hasActiveTab}
          isActive={this.state.isActive}
        />

        <Inspect>
          <h1>
            {VER} {"//"} {ENV}
          </h1>
          <JsonView src={this.state} />
        </Inspect>

        <br />

        <div>{this.props.children}</div>
      </div>
    );
  }
}
