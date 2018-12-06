import { 
    dispatch,
    subscribePartialState,
} from '../state/state-manager.js';
import {
  updateSearchTermAction,
  resetSearchTermAction,
  setUserLocationAction,
  actionWithLoading,
} from '../state/actions.js';
import {
    extendComponent,
    sanitizeString,
} from '../fiu.js';

import './search-suggestions.js';


class SeachBox extends HTMLElement {
    constructor() {
        super();
        this.state = {
            seatchTerm: '',
        }
    }
    
    connectedCallback() {
        subscribePartialState(['searchTerm'], (state, oldState) => {
            this.setState({
                seatchTerm: state.seatchTerm
            });
        });
    }

    handleInput(ev) {
        dispatch(updateSearchTermAction(sanitizeString(ev.target.value)));
    }

    handleReset() {
        dispatch(actionWithLoading(resetSearchTermAction()));
    }

    handleGeoLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition( function(position) {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
  
                dispatch(updateSearchTermAction(''));
                dispatch(setUserLocationAction(pos));
            }, function(error) {
               console.log('Geolocation error:', error); 
            });
          } else {
            // Browser doesn't support Geolocation
            console.log('Geolocation error: missing support');
          }
    }
}

window.customElements.define('search-box', extendComponent(SeachBox));