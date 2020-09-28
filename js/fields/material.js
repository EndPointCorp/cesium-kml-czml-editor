import '../lib/JsColor.js'

const template = `
<div>
    <jscolor v-if="entity[feature][field]" id="colorThemeTextColor" v-model="value"></jscolor>

    <v-btn small v-if="!entity[feature][field]" @click="setNew">
        Set new {{ label }}
    </v-btn>

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

Cesium.Color.prototype.toCssColorString = function () {
    var red = Cesium.Color.floatToByte(this.red);
    var green = Cesium.Color.floatToByte(this.green);
    var blue = Cesium.Color.floatToByte(this.blue);
    if (this.alpha === 1) {
      return "rgb(" + red + "," + green + "," + blue + ")";
    }
    var alphaString = this.alpha.toFixed(2).replace(/0$/g, '');
    return "rgba(" + red + "," + green + "," + blue + "," + alphaString + ")";
};

export function cesiumToCSSColor(c, asHEX = c.alpha === 1) {
    if (c) {
        return asHEX ? c.toCssHexString() : c.toCssColorString();
    }
    return null;
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
            this.value = cesiumToCSSColor(Cesium.Color.WHITE);
        }
    },
    watch: {
        entity: function(newValue) {
            this.value = null;
            if (newValue[this.feature][this.field]) {
                let material = newValue[this.feature][this.field].getValue();
                if (material) {
                    this.value = cesiumToCSSColor(material.color);
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
                if (v === null || v === undefined) {
                    let pd = Object.getOwnPropertyDescriptor(this.entity[this.feature].__proto__, this.field);
                    pd.set.apply(this.entity[this.feature], [ undefined ]);
                }
                else {
                    let val = rgbaToCesium(v);
                    this.entity[this.feature][this.field] = val;
                    this.$emit('input', val, this.field, this.feature, this.entity);
                }
            }
        }
    },
    methods: {
        setNew: function() {
            this.entity[this.feature][this.field] = new Cesium.Color();
            this.value = cesiumToCSSColor(new Cesium.Color());
        }
    },
    watch: {
        entity: function(newValue) {
            this.value = null;
            if (newValue[this.feature][this.field]) {
                this.value = cesiumToCSSColor(newValue[this.feature][this.field].getValue());
            }
        }
    },
    template: template
});