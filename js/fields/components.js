const template = `<span class="editor-field">
    <span v-if="entity[feature][field]">
        <input v-for="component in components"
            class="component-field-component"
            v-model="values[component]"
            v-on:input="update();"></input>
    </span>
    <button v-if="!entity[feature][field]"
        v-on:click="newValue();">set new</button>
</span>
`;

Vue.component('components-field', {
    props: ['entity', 'feature', 'field', 'type', 'components'],
    data: function() {
        const values = this.components.reduce((a, b) => (a[b] = null, a), {});

        if (this.entity[this.feature][this.field]) {
            this.components.forEach(c => {
                values[c] = parseInt(this.entity[this.feature][this.field].getValue()[c]);
            });
        }

        return { values };
    },
    methods: {
        update: function() {
            // Synchronized values from local model data to Cesium
            const values = {};

            this.components.forEach(c => {
                values[c] = parseInt(this.values[c]);
            });

            if (this.components.every(c => !isNaN(values[c]))) {
                let args = this.components.map(c => values[c]);
                this.entity[this.feature][this.field] = new Cesium[this.type](...args);
            }
        },
        newValue: function() {
            this.entity[this.feature][this.field] = new Cesium[this.type]();
        }
    },
    watch: {
        entity: function(newValue) {
            const values = this.components.reduce((a, b) => (a[b] = null, a), {});

            if (newValue[this.feature][this.field]) {
                this.components.forEach(c => {
                    values[c] = parseInt(newValue[this.feature][this.field].getValue()[c]);
                });
            }

            this.values = values;
        }
    },
    template: template
});