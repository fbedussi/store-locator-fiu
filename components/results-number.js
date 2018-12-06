import {
    subscribePartialState
} from '../state/state-manager.js';
import {
    extendComponent,
} from '../fiu.js';

class ResultsNumber extends HTMLElement {
    constructor() {
        super();
        this.state = {
            storeNumberLabel: 'loading stores', 
        };
    }

    connectedCallback() {
        subscribePartialState('stores', (state) => {
            const numebrOfSelectedStores = state.stores.filter((store) => store.visible).length;
            const texts = [
                'No store found, check che search query',
                '1 store found',
                `${numebrOfSelectedStores} stores found`];
            this.setState({storeNumberLabel: texts[Math.min(2,numebrOfSelectedStores)]});
        });
    }
}

window.customElements.define('results-number', extendComponent(ResultsNumber));