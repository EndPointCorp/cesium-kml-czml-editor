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
    <v-switch hide-details class="v-input--reverse" label="Edit Icon" v-model="defaultIconEdit"></v-switch>

    <v-btn v-if="!model" small @click="$refs.uploadmodel.click()" small class="mx-2 white--text" color="blue-grey">Upload model</v-btn>
    <input v-show="false" type="file" ref="uploadmodel"
        class="input-file" accept=".glb"
        @change="uploadModelFile($event)"
    ></input>
    <v-card-text v-if="model">
        Click on map set model position
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
            pinText: null,
            model: null
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
            else if (this.model) {
                let position = viewer.camera.pickEllipsoid(
                    event.position,
                    viewer.scene.globe.ellipsoid);

                let entity = viewer.entities.add({
                    position: position,
                    model: {
                        uri: this.model,
                        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND
                    }
                });

                this.model = null;

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
        },
        fileChangeEvent: function(evnt) {
            let reader = new FileReader();
            reader.onload = (e) => {
                this.defaultImage = e.target.result;
            };
            reader.readAsDataURL(evnt.target.files[0]);
        },
        uploadModelFile: function(evnt) {
            let reader = new FileReader();
            reader.onload = (e) => {
                this.model = e.target.result;
            };
            reader.readAsDataURL(evnt.target.files[0]);
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