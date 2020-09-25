const template = `<v-text-field
    dense
    hide-details
    class="direct-property-field"
    @input="input"
    :clearable="true"
    :value="entity[feature][field]"
    :label="label"
    :rules="rules">
</v-text-field>`;

Vue.component('direct-field', {
    props: ['entity', 'feature', 'field', 'label', 'rules', 'validator'],
    methods: {
        input: function(value) {
            if (value === undefined || value === null || value === '') {
                let pd = Object.getOwnPropertyDescriptor(this.entity[this.feature].__proto__, this.field);
                pd.set.apply(this.entity[this.feature], [ undefined ]);
            } else if (this.validator) {
                if (this.validator(value)) {
                    this.entity[this.feature][this.field] = value;
                    this.handleUpdate();
                }
            }
            else {
                this.entity[this.feature][this.field] = value;
                this.handleUpdate();
            }
        },
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