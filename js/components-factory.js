export default class EditorFieldsBuilder {

    constructor(subjectAlias, subjectType) {
        this.subjectAlias = subjectAlias;
        this.subjectType = subjectType;
        this.fields = {};
    }

    addComponentsField(fieldName, components, constructor) {
        this.fields[fieldName] = {
            template: createComponentsFieldTemplate(this.subjectAlias, fieldName, components),
            initFunction: createComponentsFieldInitFunction(this.subjectAlias, this.subjectType, fieldName, components),
            updateFunction: createUpdateFunction(this.subjectAlias, this.subjectType, fieldName, components, constructor),
            newFunction: createNewFunction(this.subjectAlias, this.subjectType, fieldName, constructor)
        };
        return this;
    }

    addEnumField(fieldName, aEnum) {
        this.fields[fieldName] = {
            template: createEnumFieldTemplate(this.subjectAlias, fieldName, aEnum),
            initFunction: createEnumFieldInitFunction(this.subjectAlias, this.subjectType, fieldName, aEnum, this.propType),
            updateFunction: createEnumUpdateFunction(this.subjectAlias, this.subjectType, fieldName, aEnum, this.propType),
        };
        return this;
    }

    addDirectPropertyField(fieldName, type) {
        if (type === Boolean) {
            this.fields[fieldName] = {
                template: createDirectPropertyTemplate(this.subjectAlias, fieldName, 'checkbox'),
            };
        }
        else {
            this.fields[fieldName] = {
                template: createDirectPropertyTemplate(this.subjectAlias, fieldName)
            };
        }

        return this;
    }

    getTemplate(templateFunction) {
        const fieldsTemplate = Object.keys(this.fields).map(k => this.fields[k].template).join('\n');

        if (templateFunction) {
            return templateFunction(fieldsTemplate, '<slot></slot>');
        }

        return `<div class="editor ${this.subjectAlias}-editor" >
            <div class="editor-name">${this.subjectAlias.replace(/./, c => {return c.toUpperCase()})}</div>
            ${fieldsTemplate}
            <slot></slot>
        </div>`;
    }

    addComponentMethods(methods = {}) {
        Object.keys(this.fields).forEach(fieldName => {
            if (this.fields[fieldName].newFunction) {
                const methodName = 'new' + fieldName.replace(/./, c => {return c.toUpperCase()});
                if (!methods[methodName]) {
                    methods[methodName] = this.fields[fieldName].newFunction;
                }
            }
            if (this.fields[fieldName].updateFunction) {
                const methodName = 'update' + fieldName.replace(/./, c => {return c.toUpperCase()});
                if (!methods[methodName]) {
                    methods[methodName] = this.fields[fieldName].updateFunction;
                }
            }
        });

        methods.fieldChangeHandler = function (fieldName) {
            if (this.copyFields.indexOf(fieldName) < 0) {
                this.copyFields.push(fieldName);
            }
        };

        methods.propertyChangeHandler = function (property, checked) {
            if (checked) {
                this.copyFields.push(property);
            }
            else {
                const propIndex = this.copyFields.indexOf(property);
                if (propIndex >= 0) {
                    this.copyFields.splice(propIndex, 1);
                }
            }

            if (this.onCopyPropertiesChange) {
                this.onCopyPropertiesChange(this.copyFields);
            }
        }

        return methods;
    }

    getInitFunction() {
        const factory = this;
        return function(subject, component) {
            Object.keys(factory.fields).forEach(fieldName => {
                const initF = factory.fields[fieldName].initFunction;
                if (initF) {
                    initF.call(component, subject);
                }
            });

            if (component.onCopyPropertiesChange) {
                component.onCopyPropertiesChange(component.copyFields);
            }
        }
    }

    getFieldNames() {
        return Object.keys(this.fields);
    }

}

function createEnumUpdateFunction(subjectAlias, subjectType, fieldName, aEnum) {
    return function () {
        this.fieldChangeHandler(fieldName);

        if (this[fieldName] === 'undefined') {
            Object.getOwnPropertyDescriptor(subjectType.prototype, fieldName).set.call(this[subjectAlias], null);
        }
        else {
            const value = aEnum[this[fieldName]];
            if (value !== undefined) {
                Object.getOwnPropertyDescriptor(subjectType.prototype, fieldName).set.call(this[subjectAlias], value);
            }
        }
    };
}

function createEnumFieldInitFunction(subjectAlias, subjectType, fieldName, aEnum) {
    return function(subject) {
        const value = subject[fieldName] && subject[fieldName].valueOf();
        if (value !== undefined) {
            this[fieldName] = Object.keys(aEnum).find(k => {
                return aEnum[k] === value;
            });
        }
        else {
            this[fieldName] = 'undefined';
        }
    };
}

function createCopyFieldCheckBox(fieldName) {
    return `\
        <span v-if="copyMode">
            <label class="copy-property-label">Copy</label>
            <input v-on:change="propertyChangeHandler('${fieldName}', $event.target.checked)" \
                :checked="copyFields.indexOf('${fieldName}') >= 0"
                type="checkbox" class="copy-property"></input>
        </span>`;
}

function createEnumFieldTemplate(subjectAlias, fieldName, cesiumEnum) {
    const camelCaseFieldName = fieldName.replace(/./, c => {return c.toUpperCase()});
    return `\
    <div class="editor-field"><label>${fieldName}:</label>
        <select class="enum-field" v-model="${fieldName}" v-on:change="update${camelCaseFieldName}();">
            <option>undefined</option>
            ${ Object.keys(cesiumEnum).map(k => '<option>' + k + '</option>').join('\n') }
        </select>
        ${createCopyFieldCheckBox(fieldName)}
    </div>`;
}

function createDirectPropertyTemplate(subjectAlias, fieldName, type='text') {
    // v-model="${subjectAlias}.${fieldName}"
    let input = `<input type="${type}"
        class="direct-property-field"
        v-on:change="fieldChangeHandler('${fieldName}');"
        v-model="${subjectAlias}.${fieldName}"></input>`;

    if (type === 'checkbox') {
        input = `\
        <input type="checkbox" class="direct-property-field" \
            v-bind:checked="\
                ${subjectAlias}.${fieldName} ? ${subjectAlias}.${fieldName}.valueOf() : undefined" \
            v-on:change="${subjectAlias}.${fieldName} = $event.target.checked; fieldChangeHandler('${fieldName}');"></input>
        `;
    }

    return `<div class="editor-field"><label>${fieldName}:</label>
        ${input}
        ${createCopyFieldCheckBox(fieldName)}
    </div>`;
}

function createUpdateFunction(subjectAlias, subjectType, fieldName, components, constructor) {
    return function () {
        // const x = parseInt(this.pixelOffset.x);
        // const y = parseInt(this.pixelOffset.y);
        this.fieldChangeHandler(fieldName);

        const values = {};
        components.forEach(c => {
            values[c] = parseInt(this[fieldName][c]);
        });

        // if (!isNaN(x) && !isNaN(y))
        if (components.every(c => !isNaN(values[c]))) {
            // this.billboard.pixelOffset = new Cesium.Cartesian2(x, y);
            const value = constructor.apply(undefined, components.map(c => values[c]));
            Object.getOwnPropertyDescriptor(subjectType.prototype, fieldName).set.call(this[subjectAlias], value);
            // this[subjectAlias][fieldName] = constructor.apply(undefined, components.map(c => values[c]));
        }
    };
}

function createComponentsFieldInitFunction(subjectAlias, subjectType, fieldName, components) {
    return function (subject) {
        const value = subject[fieldName] && subject[fieldName].valueOf();
        this[fieldName] = components.reduce((obj, k) => {
            return {
                ...obj,
                [k] : value ? value[k] : 0
            };
        }, {});
    };
}

function createNewFunction(subjectAlias, subjectType, fieldName, constructor) {
    return function () {
        this.fieldChangeHandler(fieldName);
        Object.getOwnPropertyDescriptor(subjectType.prototype, fieldName).set.call(this[subjectAlias], constructor());
    };
}

function createComponentsFieldTemplate(subjectAlias, fieldName, components) {
    const camelCaseFieldName = fieldName.replace(/./, c => {return c.toUpperCase()});

    const componentsString = components.map(c => {
        return `<input class="component-field-component ${fieldName}-${c}"
            v-model="${fieldName}.${c}"
            v-on:input="update${camelCaseFieldName}();"></input>`
    });

    const template = `<div class="editor-field">
        <label>${fieldName}:</label>
        <div v-if="${subjectAlias}.${fieldName}">
            ${componentsString.join('\n')}
        </div>
        <button v-if="!${subjectAlias}.${fieldName}" v-on:click="new${camelCaseFieldName}();">set new</button>
        ${createCopyFieldCheckBox(fieldName)}
    </div>`

    return template;
}

