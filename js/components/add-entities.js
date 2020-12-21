import { cesiumToCSSColor, rgbaToCesium } from '../fields/material.js'
import '../lib/JsColor.js'

const WHITE_CIRCLE = "data:image/png;base64,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";

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

class ShapeController {

    constructor(viewer, controlPointsDS) {
        this.mouseDownPosition = null;
        this.viewer = viewer;
        this.controlPointsDS = controlPointsDS;
    }

    setControlPoints(controlPoints) {
        this.controlPoints = controlPoints;
    }

    setOnControlPointMoveListener(listener) {
        this.listener = listener;
    }

    reset() {
        this.mouseDownPosition = null;
        this.mouseDownEntityPosition = null;
        this.activeControlPoint = null;
    }

    mouseMove(e) {
        if (this.mouseDownPosition && this.activeControlPoint) {
            let pc = viewer.camera.pickEllipsoid(e.endPosition, viewer.scene.globe.ellipsoid);
            let mousePosition = Cesium.Cartographic.fromCartesian(pc);

            let deltaLat = mousePosition.latitude - this.mouseDownPosition.latitude;
            let deltaLon = mousePosition.longitude - this.mouseDownPosition.longitude;

            let entityNewPosition = new Cesium.Cartographic(
                this.mouseDownEntityPosition.longitude + deltaLon,
                this.mouseDownEntityPosition.latitude + deltaLat,
                this.mouseDownEntityPosition.height
            );

            this.activeControlPoint.position = Cesium.Cartographic.toCartesian(entityNewPosition);
            this.onNewPosition(entityNewPosition, deltaLon, deltaLat);
        }
    }

    onNewPosition(entityNewPosition, deltaLon, deltaLat) {
        if (this.listener) {
            this.listener(this.activeControlPoint, entityNewPosition, deltaLon, deltaLat);
        }
    }

    mouseDown(e) {
        let pick = viewer.scene.pick(e.position);

        if (this.controlPoints && pick && this.controlPoints.indexOf(pick.id) >= 0) {
            disableDefaultControls();
            this.activeControlPoint = pick.id;
            let pc = viewer.camera.pickEllipsoid(e.position, viewer.scene.globe.ellipsoid);
            this.mouseDownPosition = Cesium.Cartographic.fromCartesian(pc);
            this.mouseDownEntityPosition = Cesium.Cartographic.fromCartesian(pick.id.position.getValue());
        }
    }

    mouseUp(e) {
        this.mouseDownPosition = null;
        this.mouseDownEntityPosition = null;
        enableDefaultControls();
    }
}

const shapeController = new ShapeController();

let screenSpaceEventHandler;
let defaultClickAction;
function createScreenSpaceEventHandler() {
    if (!screenSpaceEventHandler) {
        screenSpaceEventHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        defaultClickAction = viewer.screenSpaceEventHandler.getInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);

        screenSpaceEventHandler.setInputAction(
            shapeController.mouseDown.bind(shapeController),
            Cesium.ScreenSpaceEventType.LEFT_DOWN);
        screenSpaceEventHandler.setInputAction(
            shapeController.mouseMove.bind(shapeController),
            Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        screenSpaceEventHandler.setInputAction(
            shapeController.mouseUp.bind(shapeController),
            Cesium.ScreenSpaceEventType.LEFT_UP);
    }
}

function disableDefaultControls() {
    viewer.scene.screenSpaceCameraController.enableInputs = false;
}

function enableDefaultControls() {
    viewer.scene.screenSpaceCameraController.enableInputs = true;
}

function disableDefaultClickAction() {
    viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
}

function enableDefaultClickAction() {
    viewer.screenSpaceEventHandler.setInputAction(defaultClickAction, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}

Vue.component('add-entities', {
    template,
    props: ['kmlloaded'],
    data: function () {
        let pinBuilder = new Cesium.PinBuilder();
        let color = Cesium.Color.fromCssColorString('#006A4D');
        let canvas = pinBuilder.fromColor(color, 50);
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
            controlPoints:[],
            polygonInput: false,
            polygonE: false,
            theme_text_color: '#000000',
            maximized: true,
            shapeController: shapeController
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
        createScreenSpaceEventHandler();
        screenSpaceEventHandler.setInputAction(
            this.mouseClick,
            Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },
    methods: {
        addPin: function () {
            this.billboardInput = true;
        },
        addPolyline: function() {
            this.polylineInput = true;
            disableDefaultClickAction();
        },
        savePolyline: function() {
            this.polylineInput = false;
            this.polylineE.polyline.positions = this.controlPoints.map(cp => cp.position.getValue());
            this.$emit('newentity', this.polylineE);
            this.polylineE = undefined;
            this.controlPoints.forEach(e => viewer.entities.remove(e));
            this.controlPoints = [];
            enableDefaultClickAction();
        },
        cancelPolyline: function() {
            this.polylineInput = false;
            this.controlPoints.forEach(e => viewer.entities.remove(e));
            this.controlPoints = [];
            viewer.entities.remove(this.polylineE);
            this.polylineE = undefined;
        },
        addPolygon: function() {
            this.polygonInput = true;
        },
        savePolygon: function() {
            this.polygonInput = false;
            this.$emit('newentity', this.polygonE);
            this.polygonE = undefined;
        },
        cancelPolygon: function() {
            this.polygonInput = false;
            viewer.entities.remove(this.polygonE);
            this.polygonE = undefined;
        },
        addLabel: function() {
            this.labelInput = true;
        },
        mouseClick: function (event) {
            console.log(event);
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
            else if (this.polylineInput) {
                let position = viewer.scene.pickPosition(
                    event.position);

                let ent = viewer.scene.pick(event.position);
                if (ent && this.controlPoints.indexOf(ent.id) >= 0) {
                    let c = attachController(ent.id, entity => {
                        return entity.position.getValue();
                    },
                    positionC3 => {
                        ent.id.position = positionC3;
                    });
                    c.active = true;
                }

                if (position) {
                    this.controlPoints.push(viewer.entities.add({
                        position: position,
                        billboard: {
                            image: WHITE_CIRCLE,
                            width: 32,
                            height: 32,
                            scale: 0.4,
                            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                            disableDepthTestDistance: 1000000,
                            color: Cesium.Color.ORANGERED
                        }
                    }));

                    if (!this.polylineE) {
                        this.polylineE = viewer.entities.add({
                            polyline: {
                                positions: new Cesium.CallbackProperty(() => {
                                    return this.controlPoints.map(cp => cp.position.getValue())
                                }, false),
                                clampToGround: true,
                                width: 3,
                                material: Cesium.Color.SALMON
                            }
                        });
                    }
                    this.shapeController.setControlPoints(this.controlPoints);
                }
            }
            else if (this.polygonInput) {
                let position = viewer.camera.pickEllipsoid(
                    event.position,
                    viewer.scene.globe.ellipsoid);
                if (this.polygonE) {
                    this.polygonE.polygon.hierarchy = {
                        positions: [
                            ...this.polygonE.polygon.hierarchy.getValue().positions,
                            position
                        ]
                    };
                }
                else {
                    this.polygonE = viewer.entities.add({
                        polygon: {
                            hierarchy: {
                                positions: [position]
                            },
                            fill: true
                        }
                    });
                }
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
            else if (this.labelInput) {
                this.labelInput = false;
                let position = viewer.camera.pickEllipsoid(
                    event.position,
                    viewer.scene.globe.ellipsoid);

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
                        name: `Tileset (${tileset.url})`,
                        tileset: {
                            uri: tileset.url
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