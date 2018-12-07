function getElements(container) {
    return [].slice.call(container.querySelectorAll('[data-fiu]'));
}

function setBindedElements(elements) {
    return elements
        //.filter((element) => element.dataset && element.dataset.bind)
        .map((ref) => {
            const bind = ref.dataset.bind ? JSON.parse(ref.dataset.bind) : undefined;

            return {
                ref,
                bind,
                if: ref.dataset.if,
            };
        });
}

function getControlledElements(controlledElements, stateKeys) {
    return controlledElements
        .filter((element) => stateKeys.includes(element.bind));
}

function updateBindedElement(state) {
    return function setElementContent(element) {
        if (element.bind) {
            if (element.bind.value && state[element.bind.value]) {
                if (element.ref.tagName.toLowerCase() === 'input') {
                    element.ref.value = state[element.bind.value];
                } else {
                    element.ref.textContent = state[element.bind.value];
                }
            }
    
            if (element.bind.attr) {
                const attr = element.bind.attr;
                const key = Object.keys(element.bind.attr)[0];
                element.ref.setAttribute(key, state[attr[key]]);
            }
        }

        if (element.if) {
            element.ref.hidden = !Boolean(state[element.if]);
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
            //.filter((element) => stateKeys.includes(element.bind))
            .forEach(updateBindedElement(this.state));

        this.forElements
            .filter((element) => stateKeys.includes(element.bind))
            .forEach((element) => {
                element.ref.innerHTML = '';
                this.state[element.bind].forEach((stateVal) => {
                    const template = element.template.content.children[0].cloneNode(true);
                    const elements = getElements(template);
                    this.registerEvents(elements);
                    const controlledElements = setBindedElements(elements);                       
                    
                    controlledElements.forEach(updateBindedElement(stateVal));
                    
                    element.ref.appendChild(template)
                })
            })
    }

    clazz.prototype._connectedCallback = clazz.prototype.connectedCallback;
    clazz.prototype.connectedCallback = function() {
        
        this.elements = getElements(this);
    
        this.controlledElements = setBindedElements(this.elements);
    
        this.forElements = this.elements
            .filter((element) => element.dataset && element.dataset.forEach)
            .map((ref) => ({
                ref,
                bind: ref.dataset && ref.dataset.forEach,
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