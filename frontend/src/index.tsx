import React from "react";
import ReactDOM from "react-dom";
import LogRocket from "logrocket";
import App from "./components/App";
import { autorun } from "mobx";
import RoomStore from "./stores/RoomStore";
import UIStore from "./stores/UIStore";
import debug from "debug";
import IO from "./controllers/IO";

if (process.env.NODE_ENV === "development") {
    debug.enable("BitLink:*");
} else {
    fetch("/api/analytics")
        .then((resp) => resp.json())
        .then((json) => {
            if (json.logrocket.appID) {
                LogRocket.init(json.logrocket.appID);
            }
        });
}

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById("root")
);

// @ts-ignore
if (!window.navigator.standalone) {
    // ios is stupid. If i try to change url bar stuff gets messed up in PWA
    autorun(() => {
        if (!RoomStore.info) {
            const modalStore = UIStore.store.modalStore;
            if (modalStore.join) {
                window.history.replaceState({}, "BitLink | Join ", "/join");
            } else if (modalStore.create) {
                window.history.replaceState({}, "BitLink | Create ", "/create");
            } else {
                window.history.replaceState({}, "BitLink | Create ", "/");
            }
            return;
        }
        window.history.replaceState(
            {},
            "BitLink | Join " + RoomStore.info.name,
            "/join/" + RoomStore.info.id
        );
    });
}

window.addEventListener("beforeunload", (e) => {
    if (RoomStore.info && IO.io.connected) {
        e.preventDefault();
        e.returnValue = "";
        IO.leave();
    }
});
