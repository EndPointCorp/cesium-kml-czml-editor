const template = `<v-checkbox hide-details type="checkbox" class="direct-property-field"
    v-model="checked" :indeterminate.prop="checked === undefined"
    @change="change" :label="label"></v-checkbox>`;

Vue.component('checkbox-field', {
    props: ['entity', 'feature', 'field', 'label'],
    template: template,
    methods: {
        change: function(value) {
            this.$emit('input', value, this.field, this.feature, this.entity);
        }
    },
    computed: {
        checked: {
            get: function() {
                let fld = this.entity[this.feature][this.field];
                return fld ? fld.valueOf() : undefined;
            },
            set: function(v) {
                if (v === null || v === undefined) {
                    let pd = Object.getOwnPropertyDescriptor(this.entity[this.feature].__proto__, this.field);
                    pd.set.apply(this.entity[this.feature], [ undefined ]);
                }
                this.entity[this.feature][this.field] = v;
            }
        }
    }
});