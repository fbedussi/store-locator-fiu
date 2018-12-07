import { 
    extendComponent,
} from '../fiu.js';
import {
    openStoreDetailsAction,
} from '../state/actions.js';
import { 
    dispatch, 
    subscribePartialState 
} from '../state/state-manager.js';


class StoreDetails extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        subscribePartialState('openedStore', (state) => {
            const stateUpdate = {
                    ...state.openedStore,
                    animationClass: state.openedStore ? 'storeDetails slide-in-left' : 'storeDetails slide-out-right',    
                };
            this.setState(stateUpdate);
        });
    }

    

    closePanel() {
        dispatch(openStoreDetailsAction(null));
    }
}

window.customElements.define('store-details', extendComponent(StoreDetails));
