function getElements(container) {
    return [].slice.call(container.querySelectorAll('[data-fiu]'));
}

function setControlledElements(elements) {
    return elements
        .filter((element) => element.dataset && element.dataset.value)
        .map((ref) => ({
            ref,
            bindTo: ref.dataset && ref.dataset.value,
        }));
}

function getControlledElements(controlledElements, stateKeys) {
    return controlledElements
        .filter((element) => stateKeys.includes(element.bindTo));
}

function setElementContentByState(state) {
    return function setElementContent(element) {
        if (element.ref.tagName.toLowerCase() === 'input') {
            element.ref.value = state[element.bindTo];
        } else {
            element.ref.textContent = state[element.bindTo];
        }
    }
}

export function extendComponent(clazz, attributes = []) {
    clazz.prototype.setState = function(stateUpdate) {
        this.state = this.state ? {...this.state, ...stateUpdate} : {...stateUpdate};
        this.update(this.state);
    }

    clazz.prototype.registerEvents = function(elements) {
        [].concat(elements).forEach((element) => {
            if (!element.dataset) {
                return;
            } 
            const events = Object.keys(element.dataset).filter((key) => key.substring(0, 2) === 'on');
            events.forEach((event) => element.addEventListener(event.substring(2), this[element.dataset[event]].bind(this)));
        });
    }

    clazz.prototype.update = function() {
        const stateKeys = Object.keys(this.state);

        this.controlledElements
            .filter((element) => stateKeys.includes(element.bindTo))
            .forEach(setElementContentByState(this.state));

        this.forElements
            .filter((element) => stateKeys.includes(element.bindTo))
            .forEach((element) => {
                element.ref.innerHTML = '';
                this.state[element.bindTo].forEach((stateVal) => {
                    const template = element.template.content.children[0].cloneNode(true);
                    const elements = getElements(template);
                    this.registerEvents(elements);
                    const controlledElements = getControlledElements(setControlledElements(elements), Object.keys(stateVal));                       
                    
                    controlledElements.forEach(setElementContentByState(stateVal));
                    
                    element.ref.appendChild(template)
                })
            })
    }

    clazz.prototype._connectedCallback = clazz.prototype.connectedCallback;
    clazz.prototype.connectedCallback = function() {
        
        this.elements = getElements(this);
    
        this.controlledElements = setControlledElements(this.elements);
    
        this.forElements = this.elements
            .filter((element) => element.dataset && element.dataset.forEach)
            .map((ref) => ({
                ref,
                bindTo: ref.dataset && ref.dataset.forEach,
                template: ref.querySelector('template'),
            }));
            
        this.registerEvents(this.elements);
        
        clazz.prototype._connectedCallback.call(this);
    }

    return clazz;
}

export function sanitizeString(str) {
	var temp = document.createElement('div');
	temp.textContent = str;
	return temp.innerHTML;
};