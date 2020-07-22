import '../lib/JsColor.js'

const template = `
<div>
    <jscolor id="colorThemeTextColor" v-model="value"></jscolor>

    <button v-if="!entity[feature][field]" @click="setNew">
        Set new {{ label }}
    </button>

</div>`;


Cesium.Color.prototype.toCssHexString = function () {
    var r = Cesium.Color.floatToByte(this.red).toString(16);
    if (r.length < 2) {
      r = "0" + r;
    }
    var g = Cesium.Color.floatToByte(this.green).toString(16);
    if (g.length < 2) {
      g = "0" + g;
    }
    var b = Cesium.Color.floatToByte(this.blue).toString(16);
    if (b.length < 2) {
      b = "0" + b;
    }
    if (this.alpha < 1) {
      var hexAlpha = Cesium.Color.floatToByte(this.alpha).toString(16);
      if (hexAlpha.length < 2) {
        hexAlpha = "0" + hexAlpha;
      }
      return "#" + r + g + b + hexAlpha;
    }
    return "#" + r + g + b;
};

export function cesiumToRGBA(c) {
    return {
        r: c.red * 255,
        g: c.green * 255,
        b: c.blue * 255,
        a: c.alpha
    };
}

export function cesiumToCSSColor(c, asHEX = true) {
    return asHEX ? c.toCssHexString() : c.toCssColorString();
}

export function rgbaToCesium(c) {
    if (c) {
        return new Cesium.Color(c.r / 255, c.g / 255, c.b / 255, c.a);
    }
    return null;
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
                        return cesiumToCSSColor(material.color);
                    }
                }

                return value
            },
            set(v){
                // Synchronize values from local model data to Cesium
                let val = rgbaToCesium(v);
                if (val) {
                    this.entity[this.feature][this.field] = new Cesium.ColorMaterialProperty(val);
                }
                else {
                    this.entity[this.feature][this.field] = null;
                }
                this.$emit('input', val, this.field, this.feature, this.entity);
            }
        }
    },
    methods: {
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
    computed: {
        value:{
            get() {
                if (this.entity[this.feature][this.field]) {
                    return cesiumToCSSColor(this.entity[this.feature][this.field].getValue());
                }
                return null;
            },
            set(v){
                // Synchronize values from local model data to Cesium
                let val = rgbaToCesium(v);
                this.entity[this.feature][this.field] = val;
                this.$emit('input', val, this.field, this.feature, this.entity);
            }
        }
    },
    methods: {
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