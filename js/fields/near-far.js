const template = `
<v-row>
    <v-row style="margin-left: 0" class="justify-space-between">
        <span>{{ label }}</span>
        <span>
        <v-btn small align="right" v-if="!entity[feature][field]"
        v-on:click="newValue();">set new</v-btn>
    <v-btn small v-if="entity[feature][field]"
        v-on:click="remove();">delete</v-btn>
        </span>
    </v-row>
    <template v-if="entity[feature][field]">
        <v-row class="my-4 ml-0">
            <v-col cols="2" class="px-0 py-1">Near</v-col>
            <v-col cols="4" class="py-0">
                <v-text-field
                    dense
                    hide-details
                    :label="'Distance'"
                    class="component-field-component"
                    v-model="value['near']"
                    @input="update();">
                </v-text-field>
            </v-col>
            <v-col cols="4" class="py-0">
                <v-text-field
                    dense
                    hide-details
                    :label="'Value'"
                    class="component-field-component"
                    v-model="value['nearValue']"
                    @input="update();">
                </v-text-field>
            </v-col>
        </v-row>
        <v-row class="my-4 ml-0">
            <v-col cols="2" class="px-0 py-1">Far</v-col>
            <v-col cols="4" class="py-0">
                <v-text-field
                    dense
                    hide-details
                    :label="'Distance'"
                    class="component-field-component"
                    v-model="value['far']"
                    @input="update();">
                </v-text-field>
            </v-col>
            <v-col cols="4" class="py-0">
                <v-text-field
                    dense
                    hide-details
                    :label="'Value'"
                    class="component-field-component"
                    v-model="value['farValue']"
                    @input="update();">
                </v-text-field>
            </v-col>
        </v-row>
    </template>
    
</v-row>
`;

function allNumbers(numbers) {
    return numbers.every(n => {
        return n !== undefined && !Number.isNaN(n);
    });
}

Vue.component('near-far-scalar-field', {
    props: ['entity', 'feature', 'field', 'label'],
    computed: {
        value: {
            get() {
                if (this.entity[this.feature][this.field]) {
                    return this.entity[this.feature][this.field].getValue();
                }
                return {};
            }
        }
    },
    methods: {
        update: function() {
            if (this.value) {
                let near = parseFloat(this.value['near']);
                let far = parseFloat(this.value['far']);
                let nearValue = parseFloat(this.value['nearValue']);
                let farValue = parseFloat(this.value['farValue']);

                if (allNumbers([near, far, nearValue, farValue])) {
                    this.entity[this.feature][this.field] = new Cesium.NearFarScalar(near, nearValue, far, farValue);
                }
                this.$emit('input', val, this.field, this.feature, this.entity);
            }
        },
        newValue: function() {
            this.entity[this.feature][this.field] = new Cesium.NearFarScalar(10000, 1.0, 50000, 0.0);
        },
        remove: function() {
            let pd = Object.getOwnPropertyDescriptor(this.entity[this.feature].__proto__, this.field);
            pd.set.apply(this.entity[this.feature], [ undefined ]);
            this.forceUpdate();
        }
    },
    template: template
});