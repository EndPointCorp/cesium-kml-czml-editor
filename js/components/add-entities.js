import {cesiumToRGBA, rgbaToCesium} from '../fields/material.js'

const template = `
<v-card color="grey lighten-1" flat class="mb-1">
    <v-toolbar dense flat dark color="black">
        <v-toolbar-title>Create:</v-toolbar-title>
    </v-toolbar>

    <v-row align="center">
        <v-col cols="3" d-flex>
            <v-img :src="defaultImage" :contain="true" :width="24" :height="24"></v-img>
        </v-col>
        <v-col cols="6">
            <v-btn small @click="$refs.uploadimg.click()" small class="mx-2 white--text" color="blue-grey">Upload new</v-btn>
            <input v-show="false" type="file" ref="uploadimg"
                class="input-file" accept=".png, .jpg, .jpeg, .bmp"
                @change="fileChangeEvent($event)"
            ></input>
            <v-switch hide-details class="v-input--reverse" label="Edit Icon" v-model="defaultIconEdit"></v-switch>
        </v-col>
    </v-row>

    <v-row v-if="defaultIconEdit">
        <v-text-field v-model="pinSize" dense type="number" label="Pin Size">
        </v-text-field>
        <v-text-field v-model="pinText" dense label="Pin Text">
        </v-text-field>
        <v-color-picker
            hide-inputs
            hide-mode-switch
            v-model="colorSwitchValue"
            :mode="'rgba'"
            @input="updateDefaultIcon">
        </v-color-picker>
    </v-row>

    <v-btn small @click="addPin" v-if="!billboardInput">
        Add Pin
    </v-btn>
    <v-card-text v-if="billboardInput">
        Click on map to add a new Pin with default icon
    </v-card-text>
</v-card>
`;

let screenSpaceEventHandler;
function createScreenSpaceEventHandler() {
    if (!screenSpaceEventHandler) {
        screenSpaceEventHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    }
}

Vue.component('add-entities', {
    template,
    data: function() {
        let pinBuilder = new Cesium.PinBuilder();
        let color = Cesium.Color.fromCssColorString('#006A4D');
        let canvas = pinBuilder.fromColor(color, 50);
        return  {
            defaultImage: canvas.toDataURL(),
            defaultIconEdit: false,
            billboardInput: false,
            defaultBillboardColor: color,
            pinSize: 50,
            pinText: null
        };
    },
    watch: {
        pinSize: function(pinSize) {
            this.updateDefaultBillboard(this.colorSwitchValue, pinSize, this.pinText);
        },
        pinText: function(pinText) {
            this.updateDefaultBillboard(this.colorSwitchValue, this.pinSize, pinText);
        }
    },
    created: function() {
        createScreenSpaceEventHandler();
        screenSpaceEventHandler.setInputAction(
            this.mouseClick,
            Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },
    methods: {
        addPin: function() {
            this.billboardInput = true;

        },
        mouseClick: function(event) {
            if (this.billboardInput) {
                this.billboardInput = false;
                let position = viewer.camera.pickEllipsoid(
                    event.position,
                    viewer.scene.globe.ellipsoid);

                let entity = viewer.entities.add({
                    position: position,
                    billboard: {
                        image: this.defaultImage,
                        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
                        width: this.pinSize,
                        height: this.pinSize,
                        disableDepthTestDistance: 1000000000
                    }
                });

                this.$emit('newentity', entity);
            }
        },
        updateDefaultBillboard: function(colorVue, size, text) {
            let color = rgbaToCesium(colorVue);
            this.defaultBillboardColor = color;

            let pinBuilder = new Cesium.PinBuilder();

            let canvas = text ?
                pinBuilder.fromText(text, color, size) :
                pinBuilder.fromColor(color, size);

            this.defaultImage = canvas.toDataURL();
        }
    },
    computed: {
        colorSwitchValue: {
            get: function() {
                return cesiumToRGBA(this.defaultBillboardColor);
            },
            set: function(val) {
                this.updateDefaultBillboard(val, this.pinSize, this.pinText);
            }
        }
    }
});