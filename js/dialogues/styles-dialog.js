const template = `
    <v-dialog
      v-model="dialog"
      width="700"
      persistent
    >
      <template v-slot:activator="{ on, attrs }">
        <v-btn
            small
            id="copy-styles"
            v-bind="attrs"
            v-on="on"
            class="mt-2"
        >
        <slot name="buttonlabel"></slot>
        </v-btn>
      </template>

      <v-card>
        <v-card-title
          class="headline grey lighten-2"
          primary-title
        >
        Apply styles
        </v-card-title>

        <v-row class="ma-1">
        <v-col cols="6">
            <v-card class="mx-auto">
                <v-toolbar color="gray" dark>
                    <v-toolbar-title>Applicable Entities</v-toolbar-title>
                </v-toolbar>
                <v-list
                color="grey lighten-1"
                dense
                height="200"
                class="overflow-y-auto py-0"
                >
                    <v-list-item-group multiple v-model="selectedEntities" color="primary">
                        <template v-for="(entity, index) in applicableEntities">
                            <v-list-item>
                                <template v-slot:default="{ active, toggle }">
                                    <v-list-item-action>
                                    <v-checkbox color="primary" @click.self="toggle" v-model="active"></v-checkbox>
                                    </v-list-item-action>
                                    <v-list-item-content>
                                    <v-list-item-title v-text="entity.name"></v-list-item-title>
                                    </v-list-item-content>
                                </template>
                            </v-list-item>
                        </template>
                    </v-list-item-group>
                </v-list>
            </v-card>
        </v-col>
        <v-col cols="6">
            <v-card class="mx-auto">
                <v-toolbar color="gray" dark>
                    <v-toolbar-title>Properties</v-toolbar-title>
                </v-toolbar>
                <v-list
                color="grey lighten-1"
                dense
                height="200"
                class="overflow-y-auto py-0"
                >
                    <v-list-item-group multiple v-model="selectedProperties" color="primary">
                        <template v-for="(value, property) in changes">
                            <v-list-item>
                            <template v-slot:default="{ active, toggle }">
                                <v-list-item-action>
                                <v-checkbox color="primary" @click.self="toggle" v-model="active"></v-checkbox>
                                </v-list-item-action>
                                <v-list-item-content>
                                    <v-list-item-title v-text="property"></v-list-item-title>
                                    <v-list-item-title v-html="preview(property, value)"></v-list-item-title>
                                </v-list-item-content>
                                </template>
                            </v-list-item>
                        </template>
                    </v-list-item-group>
                </v-list>
            </v-card>
    </v-col>
      </v-row>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="submit">Submit</v-btn>
          <v-btn @click="cancel">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
`;

export function applyProperties(src, dst, properties) {
    const source = src.clone();

    properties.forEach(p => {
        dst[p] = source[p];
    });
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function image(v) {
    return {
        text: "" + v,
        html: `<img style="max-width: 25px; max-height: 25px; width: auto; height: auto;" src="${v}"></img>`
    };
}

function direct(v) {
    return {
        text: "" + v
    };
}

function cartesian2(v) {
    return {
        text: "" + v
    };
}

function cartesian3(v) {
    // TODO
    return {
        text: "" + v
    };
}

function getEnum(enm) {
    return function(v) {
        return {
            text: Object.keys(enm)[v]
        };
    }
}

function color(v) {
    let rgb = [
        Math.floor(v.red * 255),
        Math.floor(v.green * 255),
        Math.floor(v.blue * 255)];
    let hexColor = rgbToHex(rgb[0], rgb[1], rgb[2]);
    return {
        text: "" + v,
        html: `<span style="display: inline-block;
                            width: 10px;
                            height: 10px;
                            vertical-align: middle;
                            background-color:rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]});"
                >
                    &nbsp;
                </span>
                &nbsp;${hexColor}`
    }
}

function boolean(v) {
    return v ? 'True': 'False';
}

function nearFarScalar(v) {
    // TODO
    return "" + v;
}

function distanceDisplayCondition(v) {
    // TODO
    return "" + v;
}

const meta = {
    billboard: {
        image: image,
        scale: direct,
        pixelOffset: cartesian2,
        eyeOffset: cartesian3,
        horizontalOrigin: getEnum(Cesium.HorizontalOrigin),
        verticalOrigin: getEnum(Cesium.VerticalOrigin),
        heightReference: getEnum(Cesium.HeightReference),
        color: color,
        rotation: direct,
        sizeInMeters: boolean,
        width: direct,
        height: direct,
        scaleByDistance: nearFarScalar,
        translucencyByDistance: nearFarScalar,
        pixelOffsetScaleByDistance: nearFarScalar,
        distanceDisplayCondition: distanceDisplayCondition,
        disableDepthTestDistance: direct
    }
};

Vue.component('styles-dialog-container', {
    template: template,
    props: ['entity', 'entities', 'changes'],
    data: function() {
        return {
            dialog: false,
            featureType: null,
            selectedEntities: [],
            selectedProperties: []
        };
    },
    watch: {
        dialog: function(active) {
            if (active) {
                this.featureType = null;
                if (this.entity.billboard) {
                    this.featureType = 'billboard';
                }
                else if (this.entity.polygon) {
                    this.featureType = 'polygon';
                }
                else if (this.entity.polyline) {
                    this.featureType = 'polyline';
                }
                else if (this.entity.label) {
                    this.featureType = 'label';
                }
                else if (this.entity.rectangle) {
                    this.featureType = 'rectangle';
                }
                this.selectedEntities = this.applicableEntities.map((_, i) => i);
                this.selectedProperties = Object.keys(this.changes).map((_, i) => i);
            }
        }
    },
    computed: {
        applicableEntities: function() {
            return this.entities.filter(e => e[this.featureType]);
        }
    },
    methods: {
        cancel: function () {
            this.dialog = false;
        },
        preview: function(property, value) {
            let feature = this.changes[property].feature;
            let prev = meta[feature] && meta[feature][property];
            let preview = prev ? prev(this.changes[property].value) : this.changes[property].value;
            return preview.html || `<span v-bind:text="${preview.text}"></span>`;
        },
        submit: function () {
            let changesKeys = Object.keys(this.changes);
            let propsForChanges = this.selectedProperties.map(i => changesKeys[i]);
            let entities = this.selectedEntities.map(i => this.applicableEntities[i]);

            entities.forEach(e => {
                applyProperties(this.entity[this.featureType], e[this.featureType], propsForChanges);
            });
            this.dialog = false;
        }
    }
});