const template = `<v-checkbox type="checkbox" class="direct-property-field"
    v-model="isChecked()" :indeterminate.prop="isChecked() === undefined"
    @change="change"></v-checkbox>`;

Vue.component('checkbox-field', {
    props: ['entity', 'feature', 'field'],
    template: template,
    methods: {
        change: function($event) {
            this.entity[this.feature][this.field] = $event.target.checked;
            this.$emit('input', $event.target.checked, this.field, this.feature, this.entity);
        },
        isChecked: function() {
            let fld = this.entity[this.feature][this.field];
            return fld ? fld.valueOf() : undefined;
        }
    }
});