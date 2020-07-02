const template = `<v-text-field
    dense
    hide-details
    class="direct-property-field"
    @input="handleUpdate"
    v-model="entity[feature][field]"
    :label="label">
    </v-text-field>`;

Vue.component('direct-field', {
    props: ['entity', 'feature', 'field', 'label'],
    methods: {
        handleUpdate: function() {
            let val = undefined;
            if (this.entity[this.feature][this.field]) {
                val = this.entity[this.feature][this.field].getValue();
            }
            this.$emit('input', val, this.field, this.feature, this.entity);
        }
    },
    template: template
});