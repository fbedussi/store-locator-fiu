export function extendComponent(clazz, attributes = []) {
    clazz.prototype.setState = function(stateUpdate) {
        this.state = this.state ? {...this.state, ...stateUpdate} : {...stateUpdate};
        this.update(this.state);
    }

    clazz.prototype.update = function() {
        const stateKeys = Object.keys(this.state);

        this.controlledElements
            .filter((element) => stateKeys.includes(element.bindTo))
            .forEach(this.setValue.bind(this));

        this.forElements
            .filter((element) => stateKeys.includes(element.bindTo))
            .forEach((element) => {
                element.ref.innerHTML = '';
                this.state[element.bindTo].forEach((stateVal) => {
                    const stateKeys = Object.keys(stateVal);
                    
                    const template = element.template.content.children[0].cloneNode(true);
                    const elements = [].slice.call(template.querySelectorAll('[data-fiu]'));
                    const controlledElements = elements
                        .filter((element) => element.dataset && element.dataset.value)
                        .map((ref) => ({
                            ref,
                            bindTo: ref.dataset && ref.dataset.value,
                        }));
                    const controlledElements2 = controlledElements
                        .filter((element) => stateKeys.includes(element.bindTo));
                    
                    controlledElements2
                        .forEach(function(element) {
                            if (element.ref.tagName.toLowerCase() === 'input') {
                                element.ref.value = stateVal[element.bindTo];
                            } else {
                                element.ref.textContent = stateVal[element.bindTo];
                            }                    
                        })
                    ;
                    element.ref.appendChild(template)
                })
            })

    }

    clazz.prototype.setValue = function(element) {
        if (element.ref.tagName.toLowerCase() === 'input') {
            element.ref.value = this.state[element.bindTo];
        } else {
            element.ref.textContent = this.state[element.bindTo];
        }
    }

    clazz.prototype._connectedCallback = clazz.prototype.connectedCallback;
    clazz.prototype.connectedCallback = function() {
        
        this.elements = [].slice.call(this.querySelectorAll('[data-fiu]'));
    
        this.controlledElements = this.elements
            .filter((element) => element.dataset && element.dataset.value)
            .map((ref) => ({
                ref,
                bindTo: ref.dataset && ref.dataset.value,
            }));
    
        this.forElements = this.elements
            .filter((element) => element.dataset && element.dataset.forEach)
            .map((ref) => ({
                ref,
                bindTo: ref.dataset && ref.dataset.forEach,
                template: ref.querySelector('template'),
            }));
            
        this.elements.forEach((element) => {
            if (!element.dataset) {
                return;
            } 
            const events = Object.keys(element.dataset).filter((key) => key.substring(0, 2) === 'on');
            events.forEach((event) => element.addEventListener(event.substring(2), this[element.dataset[event]].bind(this)));
        });
        clazz.prototype._connectedCallback.call(this);
    }

    return clazz;
}

export function sanitizeString(str) {
	var temp = document.createElement('div');
	temp.textContent = str;
	return temp.innerHTML;
};