const template = `<input
    class="direct-property-field"
    @input="handleUpdate"
    v-model="entity[feature][field]"></input>`;

Vue.component('direct-field', {
    props: ['entity', 'feature', 'field'],
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