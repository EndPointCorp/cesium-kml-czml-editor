import '../lib/JsColor.js'

const template = `
<div>
    <jscolor id="colorThemeTextColor" v-model="value"></jscolor>

    <button v-if="!entity[feature][field]" @click="setNew">
        Set new {{ label }}
    </button>

</div>`;

export function cesiumToRGBA(c) {
    return {
        r: c.red * 255,
        g: c.green * 255,
        b: c.blue * 255,
        a: c.alpha
    };
}

export function rgbaToCesium(c) {
    return new Cesium.Color(c.r / 255, c.g / 255, c.b / 255, c.a);
}

Vue.component('material-field', {
    props: ['entity', 'feature', 'field', 'label'],
    computed: {
        value:{
            get() {
                let value = null;

                if (this.entity[this.feature][this.field]) {
                    let material = this.entity[this.feature][this.field].getValue();
                    if (material.color) {
                        value = cesiumToRGBA(material.color);
                    }
                }

                return value
            },
            set(v){
                // console.log(v)
            }
        }
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
            this.value = cesiumToRGBA(Cesium.Color.WHITE);
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

Vue.component('color-field', {
    props: ['entity', 'feature', 'field', 'label'],
    data: function() {
        let value = null;

        if (this.entity[this.feature][this.field]) {
            value = cesiumToRGBA(this.entity[this.feature][this.field].getValue());
        }

        return {
            value
        };
    },
    methods: {
        update: function(color) {
            // Synchronize values from local model data to Cesium
            let val = rgbaToCesium(color);
            this.entity[this.feature][this.field] = val;
            this.$emit('input', val, this.field, this.feature, this.entity);
        },
        setNew: function() {
            this.entity[this.feature][this.field] = new Cesium.Color();
            this.value = cesiumToRGBA(new Cesium.Color());
        }
    },
    watch: {
        entity: function(newValue) {
            this.value = null;
            if (newValue[this.feature][this.field]) {
                this.value = cesiumToRGBA(newValue[this.feature][this.field].getValue());
            }
        }
    },
    template: template
});