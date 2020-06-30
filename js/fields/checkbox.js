const template = `<input type="checkbox" class="direct-property-field"
    :checked="isChecked()" :indeterminate.prop="isChecked() === undefined"
    @change="change"></input>`;

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