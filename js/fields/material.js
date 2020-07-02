const template = `
<v-color-picker
    class="editor-field"
    :canvas-height="50"
    v-model="value"
    @input="update">
</v-color-picker>`;

Vue.component('material-field', {
    props: ['entity', 'feature', 'field'],
    data: function() {
        let value = 'undefined';

        if (this.entity[this.feature][this.field]) {
            value = this.entity[this.feature][this.field]
                .getValue().toCssColorString();
        }

        return {
            value: value
        };
    },
    methods: {
        update: function(color) {
            // Synchronize values from local model data to Cesium
            let val = Cesium.Color.fromCssColorString(color);
            this.entity[this.feature][this.field] = val;
            this.$emit('input', val, this.field, this.feature, this.entity);
        }
    },
    watch: {
        entity: function(newValue) {
            if (newValue[this.feature][this.field]) {
                this.value = newValue[this.feature][this.field]
                    .getValue().toCssColorString();
            }
        }
    },
    template: template
});