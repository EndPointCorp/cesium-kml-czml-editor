const template = `<span >
    <v-row>
    <v-col cols="3" class="px-0">
    {{ label }}
    </v-col>
        <template v-for="component in components" v-if="entity[feature][field]">
        <v-col cols="3">
            <v-text-field
                dense
                hide-details
                :key="component"
                class="component-field-component"
                v-model="values[component]"
                v-on:input="update();">
            </v-text-field>
        </v-col>
        </template>
    <v-col cols="3" v-if="!entity[feature][field]">
    <v-btn small
        v-on:click="newValue();">set new</v-btn>
    </v-col>
    </v-row>
</span>
`;

Vue.component('components-field', {
    props: ['entity', 'feature', 'field', 'type', 'components', 'label'],
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

            let val = undefined;
            if (this.entity[this.feature][this.field]) {
                val = this.entity[this.feature][this.field].getValue();
            }

            if (this.components.every(c => !isNaN(values[c]))) {
                let args = this.components.map(c => values[c]);
                val = new Cesium[this.type](...args);
                this.entity[this.feature][this.field] = val;
            }

            this.$emit('input', val, this.field, this.feature, this.entity);
        },
        newValue: function() {
            let val = new Cesium[this.type]();
            this.entity[this.feature][this.field] = val;
            this.$emit('input', val, this.field, this.feature, this.entity);
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