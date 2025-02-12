import { cesiumToCSSColor, rgbaToCesium } from '../fields/material.js'
import '../lib/JsColor.js'
import GeometryEditor from '../util/GeometryEditor.js'
import { getPickCoordinates } from "../util/pickCoordinates.js"

const template = `
<v-card color="grey lighten-1" flat class="mb-1">
    <v-toolbar dense flat dark color="black">
        <v-toolbar-title>Create</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="maximized = !maximized">
            <v-icon v-if="maximized">mdi-chevron-up</v-icon>
            <v-icon v-if="!maximized">mdi-chevron-down</v-icon>
        </v-btn>
    </v-toolbar>

    <v-expansion-panel v-if="maximized">
        <v-row class="mx-2">
            <v-col cols="2" class="pt-5">
                <v-img :src="defaultImage" :contain="true" :width="24" :height="24"></v-img>
            </v-col>
            <v-col cols="5" class="pt-0">
                <v-switch hide-details class="v-input--reverse" label="Edit Icon" v-model="defaultIconEdit"></v-switch>
            </v-col>
            <v-col cols="4" class="pt-4">
                <v-btn small @click="$refs.uploadimg.click()" small class="white--text" color="blue-grey">Upload Icon</v-btn>
                    <input v-show="false" type="file" ref="uploadimg"
                        class="input-file" accept=".png, .jpg, .jpeg, .bmp"
                        @change="fileChangeEvent($event)"
                    ></input>
                </v-btn>
            </v-col>
        </v-row>

        <v-row v-if="maximized && defaultIconEdit" class="mx-2 ml-8 mb-3">
            <v-text-field v-model="pinSize" dense type="number" label="Pin Size">
            </v-text-field>
            <v-text-field v-model="pinText" dense label="Pin Text">
            </v-text-field>

            <jscolor id="colorThemeTextColor" v-model="colorSwitchValue"></jscolor>
        </v-row>

        <v-row align="center" class="mx-2" >
            <v-col cols="12">
                <v-btn small @click="addPin" v-if="!billboardInput">
                Add Pin
                </v-btn>
            </v-col>
            <v-card-text v-if="billboardInput">
                Click on map to add a new Pin with default icon
            </v-card-text>
        </v-row>

        <v-row align="center" class="mx-2" >
            <v-col cols="12">
                <v-btn small @click="addPolyline" v-if="!polylineInput">
                Add Polyline
                </v-btn>
            </v-col>
            <v-col cols="6" v-if="polylineInput">
                <v-btn small @click="savePolyline">
                Save
                </v-btn>
            </v-col>
            <v-col cols="6" v-if="polylineInput">
                <v-btn small @click="cancelPolyline">
                Cancel
                </v-btn>
            </v-col>
            <v-card-text v-if="polylineInput">
                Click on map to add points to polyline
            </v-card-text>
        </v-row>

        <v-row align="center" class="mx-2" >
            <v-col cols="12">
                <v-btn small @click="addPolygon" v-if="!polygonInput">
                Add Polygon
                </v-btn>
            </v-col>
            <v-col cols="6" v-if="polygonInput">
                <v-btn small @click="savePolygon">
                Save
                </v-btn>
            </v-col>
            <v-col cols="6" v-if="polygonInput">
                <v-btn small @click="cancelPolygon">
                Cancel
                </v-btn>
            </v-col>
            <v-card-text v-if="polygonInput">
                Click on map to add points to polygon
            </v-card-text>
        </v-row>

        <v-row align="center" class="mx-2">
            <v-col cols="12" class="pb-0">
                <v-text-field v-model="labelText" hide-details dense label="Label Text">
                </v-text-field>
            </v-col>
            <v-col cols="12" v-if="!labelInput" class="pt-1">
                <v-btn small @click="addLabel">
                Add Label
                </v-btn>
            </v-col>
            <v-card-text v-if="labelInput">
                Click on map to add a new Label
            </v-card-text>
        </v-row>

        <v-row align="center" class="mx-2">
            <v-col cols="12">
                <tileset-dialog-container
                    @addtileset="addTileset"
                    @deletetileset="deleteTileset">
                </tileset-dialog-container>
            </v-col>
        </v-row>

        <v-row align="center" class="mx-2">
            <v-col cols="12">
                <v-btn v-if="!model" small @click="$refs.uploadmodel.click()" small class="mb-2">Add model</v-btn>
            </v-col>
        </v-row>

        <input v-show="false" type="file" ref="uploadmodel"
            class="input-file" accept=".glb"
            @change="uploadModelFile($event)"
        ></input>
        <v-card-text v-if="model">
            Click on map set model position
        </v-card-text>
    </v-expansion-panel>
</v-card>
`;

let shapeEditController;

Vue.component('add-entities', {
    template,
    props: ['kmlloaded'],
    data: function () {
        const pinBuilder = new Cesium.PinBuilder();
        const color = Cesium.Color.fromCssColorString('#006A4D');
        const canvas = pinBuilder.fromColor(color, 50);

        return {
            defaultImage: canvas.toDataURL(),
            defaultIconEdit: false,
            billboardInput: false,
            defaultBillboardColor: color,
            pinSize: 50,
            pinText: null,
            model: null,
            hex: true,
            labelText: 'Label 1',
            labelInput: false,
            polylineInput: false,
            polylineE: false,
            polygonInput: false,
            polygonE: false,
            theme_text_color: '#000000',
            maximized: true,
        };
    },
    watch: {
        pinSize: function (pinSize) {
            this.updateDefaultBillboard(this.colorSwitchValue, pinSize, this.pinText);
        },
        pinText: function (pinText) {
            this.updateDefaultBillboard(this.colorSwitchValue, this.pinSize, pinText);
        },
        kmlloaded: function (loaded) {
            if (loaded) {
                this.maximized = false;
            }
        }
    },
    created: function () {
        if (!shapeEditController) {
            shapeEditController = new GeometryEditor(viewer);
        }

        const screenSpaceEventHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        screenSpaceEventHandler.setInputAction(
            this.mouseClick.bind(this),
            Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },
    methods: {
        addPin: function () {
            this.billboardInput = true;
        },
        addPolyline: function() {
            this.polylineInput = true;
            this.polylineE = shapeEditController.newEntity('polyline');
            viewer.entities.add(this.polylineE);
        },
        savePolyline: function() {
            this.polylineInput = false;
            shapeEditController.save();
            this.$emit('newentity', this.polylineE);
            this.polylineE = null;
        },
        cancelPolyline: function() {
            this.polylineInput = false;
            viewer.entities.remove(this.polylineE);
            shapeEditController.cancel();
            this.polylineE = null;
        },
        addPolygon: function() {
            this.polygonInput = true;
            console.log('addPolygon');
            this.polygonE = shapeEditController.newEntity('polygon');
            viewer.entities.add(this.polygonE);
        },
        savePolygon: function() {
            this.polygonInput = false;
            shapeEditController.save();
            this.$emit('newentity', this.polygonE);
            this.polygonE = null;
        },
        cancelPolygon: function() {
            this.polygonInput = false;
            viewer.entities.remove(this.polygonE);
            shapeEditController.cancel();
            this.polygonE = null;
        },
        addLabel: function() {
            this.labelInput = true;
        },
        mouseClick: function (event) {
            if (this.billboardInput) {
                this.billboardInput = false;
                let position = getPickCoordinates(viewer, event.position);

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
                let position = getPickCoordinates(viewer, event.position);

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
            else if (this.labelInput) {
                this.labelInput = false;
                let position = getPickCoordinates(viewer, event.position);

                let entity = viewer.entities.add({
                    position: position,
                    label: {
                        text: this.labelText,
                        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
                        disableDepthTestDistance: 1000000000
                    }
                });

                this.$emit('newentity', entity);
            }
            else if (this.polylineInput) {
                // handled by shapeEditController
            }
            else if (this.polygonInput) {
                // handled by shapeEditController
            }
        },
        updateDefaultBillboard: function (colorVue, size, text) {
            let color = rgbaToCesium(colorVue);
            this.defaultBillboardColor = color;

            let pinBuilder = new Cesium.PinBuilder();

            let canvas = text ?
                pinBuilder.fromText(text, color, size) :
                pinBuilder.fromColor(color, size);

            this.defaultImage = canvas.toDataURL();
        },
        fileChangeEvent: function (evnt) {
            let reader = new FileReader();
            reader.onload = (e) => {
                this.defaultImage = e.target.result;
            };
            reader.readAsDataURL(evnt.target.files[0]);
        },
        uploadModelFile: function (evnt) {
            let reader = new FileReader();
            reader.onload = (e) => {
                this.model = e.target.result;
            };
            reader.readAsDataURL(evnt.target.files[0]);
        },
        addTileset: function(tileset, addToEntities) {
            if (tileset) {
                if (addToEntities) {
                    console.log(tileset);
                    let entity = viewer.entities.add({
                        name: `Tileset (${tileset.resource.url})`,
                        tileset: {
                            uri: tileset.resource.url
                        }
                    });

                    this.$emit('newentity', entity);
                }
                else {
                    viewer.scene.primitives.add(tileset);
                }
            }
        },
        deleteTileset: function(tileset) {
            for (let i = 0; i < viewer.scene.primitives.length; i++) {
                let sceneTS = viewer.scene.primitives.get(i);

                if (sceneTS.url === tileset.url || sceneTS.url.indexOf(tileset.resource) > 0) {
                    viewer.scene.primitives.remove(sceneTS);
                    break;
                }
            }
        }
    },
    computed: {
        colorSwitchValue: {
            get: function () {
                return cesiumToCSSColor(this.defaultBillboardColor, this.hex);
            },
            set: function (val) {
                if (val) {
                    this.updateDefaultBillboard(val, this.pinSize, this.pinText);
                }
            }
        }
    }
});