import { 
    subscribePartialState, 
    dispatch 
} from '../state/state-manager.js';
import {
    openStoreDetailsAction,
    hideLoadingAction,
    showLoadingAction,
} from '../state/actions.js';
import { 
    extendComponent,
} from '../fiu.js';
import { throttle } from '../utils.js';

class StoresList extends HTMLElement {
    constructor() {
        super();
        this.state = {
            stores: [],
        }
    }
    
    connectedCallback() {
        subscribePartialState('stores', throttle((state) => {
            this.setState({stores: state.stores.filter((store) => store.visible)});
        }, 900));
    }

    handleStoreClick(ev) {
        const store = this.state.stores.find((store) => store.id === ev.currentTarget.dataset.storeId);
        dispatch(openStoreDetailsAction(store));
    }
}

window.customElements.define('stores-list', extendComponent(StoresList));