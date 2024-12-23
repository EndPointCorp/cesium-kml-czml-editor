import './editors/billboard.js'
import './editors/polygon.js'
import './editors/polyline.js'
import './editors/rectangle.js'
import './editors/model.js'
import './editors/label.js'

import './components/entity-info.js'
import './components/entity-type-label.js'
import './components/entities-list.js'
import './components/add-entities.js'

import './dialogues/tileset-dialog.js'
import './dialogues/styles-dialog.js'

import DocumentWriter from './czml-writer.js'

import LabelsButton from './cities/cesium-toolbar-button.js'
import TilesetSwitch from './util/tileset-switch.js'

import {extrudePolygon, polygonAverageHeight} from './editors/polygon.js'
import {polylineAverageHeight} from './editors/polyline.js'

const getParams = new URLSearchParams(window.location.search);
Cesium.Ion.defaultAccessToken = getParams.get('ion_key') ||
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
        'eyJqdGkiOiI0YzE4M2QwNS00NjcwLTQzZGMtYmViNC1mOWJiZjljMzY3ZDAiLCJpZCI6NzMxNCwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTU0ODk1MTczNX0.' +
        'MjNWfJWsWk4lFXRoZS1EeqaFrWxEnugRqw9M3HRfAQk';

const viewer = new Cesium.Viewer('viewer', {
    fullscreenButton: false,
    homeButton: false,
    navigationInstructionsInitiallyVisible: false,
    navigationHelpButton: false,
});
window.viewer = viewer;
viewer.scene.globe.showWaterEffect = false;

// LabelsButton(viewer);
// CitiesDataSource(viewer);

TilesetSwitch(viewer);

const esriImagery = viewer.baseLayerPicker.viewModel
    .imageryProviderViewModels.find(m => m.name === 'ESRI World Imagery');
if (esriImagery) {
    viewer.baseLayerPicker.viewModel.selectedImagery = esriImagery;
}

const ionTerrain = viewer.baseLayerPicker.viewModel
    .terrainProviderViewModels.find(m => m.name === 'Cesium World Terrain');
if (ionTerrain) {
    viewer.baseLayerPicker.viewModel.selectedTerrain = ionTerrain;
}

window.dispatchEvent(new CustomEvent('viewer-created', { detail: {viewer} }));

function applyDefaults(entities) {
    billboardDefaults(entities);
    polylineDefaults(entities);
    polygonDefaults(entities);
}

function billboardDefaults(entities) {
    entities.forEach(e => {
        if (e.billboard) {
            // e.billboard.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;

            // Don't use relative height measure for Billboards with extension
            // bc. polylines doesn't have rELATIVE_TO_GROUND reference mode
            if (!e.polyline) {
                let height = Cesium.Cartographic.fromCartesian(e.position.getValue()).height;
                if (height > 0.1) {
                    e.billboard.heightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;
                }
                else {
                    e.billboard.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
                }
            }
        }
    });
}

function polylineDefaults(entities) {
    entities.forEach(e => {
        if (e.polyline && !e.billboard) {
            if(!e.polyline.arcType || e.polyline.arcType.getValue() === Cesium.ArcType.NONE) {
                e.polyline.arcType = Cesium.ArcType.GEODESIC;
            }

            let h = polylineAverageHeight(e.polyline);
            if (h < 0.1) {
                e.polyline.clampToGround = true;
            }
        }
    });
}

function polygonDefaults(entities) {
    // Convert Polygons into extrusions by default
    entities.forEach(e => {
        if (e.polygon) {
            let h = polygonAverageHeight(e.polygon);
            if (h > 0.1) {
                extrudePolygon(e.polygon, h);
            }
        }
    });
}

const editor = new Vue({
    el: '#editor',

    vuetify: new Vuetify(),

    data: function() {
        return {
            czml: null,
            filename: null,
            loadedFromFile: false,
            entities: [],
            entity: null,
            advanced: false,

            typeFilters: {
            },

            copyType: null,
            changes: {},

            dragover: false,
        };
    },
    mounted: function() {
        const dropzone = this.$refs.uploadContainer;

        if(dropzone) {
            // register all drag & drop event listeners
            dropzone.addEventListener("dragenter", e => {
                e.preventDefault();
                this.dragover = true;
            });
            dropzone.addEventListener("dragleave", e => {
                e.preventDefault();
                this.dragover = false;
            });
            dropzone.addEventListener("dragover", e => {
                e.preventDefault();
                this.dragover = true;
                dragCancelTimeout && resetTimeout(dragCancelTimeout);
            });
            dropzone.addEventListener("drop", e => {
                e.preventDefault();
                this.dragover = false;
                if(e.dataTransfer && e.dataTransfer.files) {
                    for (let f of e.dataTransfer.files) {
                        loadFile(f);
                    }
                }
            });
        }
    },
    methods: {
        selectEntity: function(entity) {
            viewer.selectedEntity = entity;
        },
        newEntity: function(entity) {
            this.filename = 'document.czml';
            this.entities = [...this.entities, entity];
            this.entity = entity;
            this.selectEntity(entity);
        },
        updateHandler: function(value, field, feature) {
            this.changes[field] = {
                value: value,
                feature: feature
            };
        },
        flyToEntity: function() {
            if (this.entity) {
                viewer.flyTo(this.entity);
            }
        },
        isFolder: function(entity) {
            return entity.position === undefined && this.entities.some(e => {
                return e.parent && e.parent.id === entity.id;
            });
        },
        toCZML: function() {
            const w = new DocumentWriter();
            this.entities.forEach(e => {
                if (e.show) {
                    w.addEntity(e);
                }
            });
            const czmlObj = w.toJSON();
            console.log(czmlObj);

            this.czml = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(czmlObj));

            let link = document.createElement('A');
            link.href = this.czml;
            link.download = this.filename;
            link.click();
        },
        onCopyPropertiesChange: function(properties) {
            this.copyProperties = properties;
        }
    }
});

function loadDataSourcePromise(dsPromise) {
    viewer.dataSources.add(dsPromise);
    dsPromise.then(ds => {

        applyDefaults(ds.entities.values);

        editor.entities = [
            ...editor.entities,
            ...ds.entities.values
        ];
    });
}

function handleFileSelect(evt) {
    for (let f of evt.target.files) {
        loadFile(f);
    }
}

function loadFile(file) {
    editor.filename = file.name.replace('.kml', '.czml').replace('.kmz', '.czml');
    editor.loadedFromFile = true;

    console.log('load', file);

    if (/vnd.google-earth/.test(file.type) || /\.kmz|\.kml/.test(file.name)) {
        loadDataSourcePromise(Cesium.KmlDataSource.load(file));
    }
    else if (/\.czml/.test(file.name)) {
        const reader = new FileReader();
        reader.onload = function() {
            let czmljson = JSON.parse(reader.result);
            // Sanitize references
            let selfRefs = 0;
            czmljson.forEach(packet => {
                if (packet.billboard && packet.billboard.image && packet.billboard.image.reference) {
                    if (packet.billboard.image.reference.split('#')[0] === packet.id) {
                        console.warn('Self-referencing reference for billboard image', packet);
                        let pb = new Cesium.PinBuilder();
                        packet.billboard.image = pb.fromText(
                            "" + ++selfRefs,
                            Cesium.Color.fromRandom({"alpha": 1.0}),
                            32).toDataURL();
                    }
                }
            });
            loadDataSourcePromise(Cesium.CzmlDataSource.load(czmljson));
        };
        reader.readAsText(file);
    }
    else if (/\.json|\.geojson/.test(file.name)) {
        const reader = new FileReader();
        reader.onload = function() {
            loadDataSourcePromise(Cesium.GeoJsonDataSource.load(JSON.parse(reader.result)));
        };
        reader.readAsText(file);
    }
    else {
        console.warn("Can't recognize file type");
    }
}

document.getElementById('file').addEventListener('change', handleFileSelect, false);

function viewerEntityChangeListener(selection) {
    editor.entity = selection;

    if (selection) {
        window.selectedEntity = selection;
        console.log(selection);
    }
    else {
        editor.selectEntity(null);
    }
}

viewer.selectedEntityChanged.addEventListener(viewerEntityChangeListener);

export function disableSelectedEntityChangeListener() {
    viewer.selectedEntityChanged.removeEventListener(viewerEntityChangeListener);
    editor.$refs.addEntities.maximized = false;
}

export function enableSelectedEntityChangeListener() {
    viewer.selectedEntityChanged.addEventListener(viewerEntityChangeListener);
    editor.$refs.addEntities.maximized = true;
}
