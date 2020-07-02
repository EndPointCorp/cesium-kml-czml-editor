const template = `
<div>
    <v-color-picker v-if="value"
        class="editor-field"
        :canvas-height="50"
        v-model="value"
        @input="update">
    </v-color-picker>
    <button v-if="!entity[feature][field]" @click="setNew">
        Set new material
    </button>
</div>`;

function cesiumToRGBA(c) {
    return {
        r: c.red * 255,
        g: c.green * 255,
        b: c.blue * 255,
        a: c.alpha
    };
}

function rgbaToCesium(c) {
    return new Cesium.Color(c.r / 255, c.g / 255, c.b / 255, c.a);
}

Vue.component('material-field', {
    props: ['entity', 'feature', 'field'],
    data: function() {
        let value = null;

        if (this.entity[this.feature][this.field]) {
            let material = this.entity[this.feature][this.field].getValue();
            if (material.color) {
                value = cesiumToRGBA(material.color);
            }
        }

        return {
            value
        };
    },
    methods: {
        update: function(color) {
            // Synchronize values from local model data to Cesium
            let val = rgbaToCesium(color);
            this.entity[this.feature][this.field] = new Cesium.ColorMaterialProperty(val);
            this.$emit('input', val, this.field, this.feature, this.entity);
        },
        setNew: function() {
            this.entity[this.feature][this.field] = new Cesium.ColorMaterialProperty();
        }
    },
    watch: {
        entity: function(newValue) {
            this.value = null;
            if (newValue[this.feature][this.field]) {
                let material = newValue[this.feature][this.field].getValue();
                if (material) {
                    this.value = cesiumToRGBA(material.color);
                }
            }
        }
    },
    template: template
});