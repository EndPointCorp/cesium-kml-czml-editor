const template = `<v-text-field
    dense
    hide-details
    class="direct-property-field"
    :clearable="true"
    v-model="value"
    :label="label">
</v-text-field>`;

Vue.component('angle-field', {
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
    computed: {
        value: {
            get: function() {
                if (this.entity[this.feature][this.field]) {
                    let val = this.entity[this.feature][this.field].getValue();
                    if (!Number.isNaN(val)) {
                        return Cesium.Math.toDegrees(val);
                    }
                }
                return undefined;
            },
            set: function(value) {
                if (value === undefined || value === null || value === '') {
                    let pd = Object.getOwnPropertyDescriptor(this.entity[this.feature].__proto__, this.field);
                    pd.set.apply(this.entity[this.feature], [ undefined ]);
                }
                else {
                    let val = Cesium.Math.toRadians(value);
                    if (!Number.isNaN(val)) {
                        this.entity[this.feature][this.field] = val;
                    }
                }
                this.handleUpdate();
            }
        }
    },
    template: template
});