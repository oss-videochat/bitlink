import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import {autorun} from 'mobx';
import RoomStore from "./stores/RoomStore";
import UIStore from "./stores/UIStore";

ReactDOM.render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>,
    document.getElementById('root')
);


autorun(() => {
    if (!RoomStore.room) {
        const modalStore = UIStore.store.modalStore;
        if (modalStore.join) {
            window.history.pushState({}, "BitLink | Join ", '/join/');
        } else if (modalStore.create) {
            window.history.pushState({}, "BitLink | Create ", '/create');
        } else {
            window.history.pushState({}, "BitLink | Create ", '/');
        }
        return;
    }
    window.history.pushState({}, "BitLink | Join " + RoomStore.room.name, '/join/' + RoomStore.room.id);
});
