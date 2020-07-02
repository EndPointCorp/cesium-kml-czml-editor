const template = `<v-checkbox hide-details type="checkbox" class="direct-property-field"
    v-model="isChecked()" :indeterminate.prop="isChecked() === undefined"
    @change="change" :label="label"></v-checkbox>`;

Vue.component('checkbox-field', {
    props: ['entity', 'feature', 'field', 'label'],
    template: template,
    methods: {
        change: function(checked) {
            this.entity[this.feature][this.field] = checked;
            this.$emit('input', checked, this.field, this.feature, this.entity);
        },
        isChecked: function() {
            let fld = this.entity[this.feature][this.field];
            return fld ? fld.valueOf() : undefined;
        }
    }
});