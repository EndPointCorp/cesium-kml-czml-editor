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
            updateFunction: createUpdateFunction(this.subjectAlias, this.subjectType, fieldName, constructor),
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

    addDirectPropertyField(fieldName) {
        this.fields[fieldName] = {
            template: createDirectPropertyTemplate(this.subjectAlias, fieldName)
        };
        return this;
    }

    getTemplate(templateFunction) {
        const fieldsTemplate = Object.keys(this.fields).map(k => this.fields[k].template).join('\n');

        if (templateFunction) {
            return templateFunction(fieldsTemplate);
        }

        return `<div>
            <div>${this.subjectAlias.replace(/./, c => {return c.toUpperCase()})}</div>
            ${fieldsTemplate}
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
        }
    }

}

function createEnumUpdateFunction(subjectAlias, subjectType, fieldName, aEnum) {
    return function () {
        if (this[fieldName] === 'undefined') {
            Object.getOwnPropertyDescriptor(subjectType.prototype, fieldName).set.call(this[subjectAlias], null);
            //this[subjectAlias][fieldName] = null;
        }
        else {
            const value = aEnum[this[fieldName]];
            if (value !== undefined) {
                Object.getOwnPropertyDescriptor(subjectType.prototype, fieldName).set.call(this[subjectAlias], value);
                //this[subjectAlias][fieldName] = origin;
            }
        }
    };
}

function createEnumFieldInitFunction(subjectAlias, subjectType, fieldName, aEnum) {
    return function(subject) {
        const value = subject[fieldName] && subject[fieldName].valueOf();
        if (value !== undefined) {
            this[fieldName] = Object.keys(aEnum).find(k => {
                return aEnum[k] === origin;
            });
        }
        else {
            this[fieldName] = 'undefined';
        }
    };
}

function createEnumFieldTemplate(subjectAlias, fieldName, cesiumEnum) {
    const camelCaseFieldName = fieldName.replace(/./, c => {return c.toUpperCase()});
    return `\
    <div><label>${fieldName}:</label>
        <select v-model="${fieldName}" v-on:change="update${camelCaseFieldName}();">
            <option>undefined</option>
            ${ Object.keys(cesiumEnum).map(k => '<option>' + k + '</option>').join('\n') }
        </select>
    </div>`;
}

function createDirectPropertyTemplate(subjectAlias, fieldName) {
    return `<div><label>${fieldName}:</label> <input v-model="${subjectAlias}.${fieldName}"></input></div>`
}

function createUpdateFunction(subjectAlias, subjectType, fieldName, components, constructor) {
    return function () {
        // const x = parseInt(this.pixelOffset.x);
        // const y = parseInt(this.pixelOffset.y);

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
        Object.getOwnPropertyDescriptor(subjectType.prototype, fieldName).set.call(this[subjectAlias], constructor());
        // this[subjectAlias][fieldName] = constructor();
    };
}

function createComponentsFieldTemplate(subjectAlias, fieldName, components) {
    const camelCaseFieldName = fieldName.replace(/./, c => {return c.toUpperCase()});

    const componentsString = components.map(c => {
        return `<input v-model="${fieldName}.${c}" v-on:change="update${camelCaseFieldName}();"></input>`
    });

    const template = `<div>
        <label>${fieldName}</label>
        <div v-if="${subjectAlias}.${fieldName}">
            ${componentsString.join('\n')}
        </div>
        <button v-if="!${subjectAlias}.${fieldName}" v-on:click="new${camelCaseFieldName}();">set new</button>
    </div>`

    return template;
}

