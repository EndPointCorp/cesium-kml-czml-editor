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

import {extrudePolygon, getCentroid, polygonAverageHeight, stickPolygonToGround} from './editors/polygon.js'
import {polylineAverageHeight} from './editors/polyline.js'

import { downloadZip } from "https://cdn.jsdelivr.net/npm/client-zip/index.js"
import * as zip from "https://deno.land/x/zipjs/index.js";

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
            if (h > 0.5) {
                extrudePolygon(e.polygon, h);
            }
            else {
                stickPolygonToGround(e.polygon);
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
        clampPolygons: function() {
            this.entities.forEach(e => {
                if (!this.isFolder(e)) {
                    stickPolygonToGround(e.polygon);
                }
            });
        }, 
        createLabels: function() {
            const newEntities = [];

            this.entities.forEach(e => {
                if (!this.isFolder(e)) {
                    let position = e.position;
                    
                    if( position === undefined ) {
                        if (e.polygon) {
                            position = getCentroid(e.polygon);
                        }
                    }
    
                    newEntities.push(viewer.entities.add({
                        show: true,
                        position: position,
                        label: new Cesium.LabelGraphics({
                            text: e.name,
                            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                            heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
                        })
                    }));
                }
            });

            console.log('Add entities ', newEntities, 'to exisiting',  this.entities);

            this.entities = [...this.entities, ...newEntities];
        }, 
        toCZML: function() {
            const w = new DocumentWriter({separateResources: false});
            this.entities.forEach(e => {
                if (e.show) {
                    w.addEntity(e);
                }
            });
            const czmlObj = w.toJSON();

            this.czml = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(czmlObj));

            let link = document.createElement('A');
            link.href = this.czml;
            link.download = this.filename;
            link.click();
            link.remove()
        },
        toZIP: async function() {
            const w = new DocumentWriter({separateResources: true});
            this.entities.forEach(e => {
                if (e.show) {
                    w.addEntity(e);
                }
            });
            const czml = JSON.stringify(w.toJSON());
            
            const resources = await w.listResources();

            const entries = [
                {
                    name: 'document.czml',
                    lastModified: new Date(), 
                    input: czml
                }, 
                ...resources
            ];
            
            const blob = await downloadZip(entries).blob();
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "scene.czmz";
            link.click();
            link.remove();
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

        readTextFromFile(file).then(text => {
            const czmljson = JSON.parse(text);
            sanitizeSelfRef(czmljson);
            loadDataSourcePromise(Cesium.CzmlDataSource.load(czmljson));
        });
    }
    else if (/\.czmz/.test(file.name)) {
        const reader = new zip.ZipReader(new zip.BlobReader(file));

        reader.getEntries().then(async entries => {
            const entriesMap = new Map();
            for (let entry of entries) {
                const blob = await entry.getData(new zip.BlobWriter());
                const blobURL = URL.createObjectURL(blob);

                entriesMap.set(entry.filename, blobURL);
                entriesMap.set('/' + entry.filename, blobURL);
            }

            console.log('CZMZ entries', Array.from(entriesMap.keys()));

            const documentEntry = entries.find(e => /\.czml$/i.test(e.filename));
            if (documentEntry) {
                documentEntry.getData(new zip.TextWriter()).then(text => {
                    const czmljson = JSON.parse(text);
                    sanitizeSelfRef(czmljson);

                    const str = JSON.stringify(czmljson);
                    const bytes = new TextEncoder().encode(str);
                    const blob = new Blob([bytes], {
                        type: "application/json;charset=utf-8"
                    });

                    loadDataSourcePromise(Cesium.CzmlDataSource.load(new Cesium.Resource({
                        url: URL.createObjectURL(blob),
                        proxy: {
                            getURL: url => {
                                if (/^blob:/.test(url)) {
                                    const blobId = new URL(url.replace(/^blob:/, '')).pathname;
                                    const blobUrl = entriesMap.get(blobId);
                                    return blobUrl ? blobUrl : url;
                                }
                                console.warn('Url not found inside czmz', url);
                                return url;
                            }
                        }
                    })));
                });
            }
        });

    }
    else if (/\.json|\.geojson/.test(file.name)) {
        readTextFromFile(file).then(text => {
            Cesium.GeoJsonDataSource.load(JSON.parse(text));
        });
    }
    else {
        console.warn("Can't recognize file type");
    }
}

function sanitizeSelfRef(czmljson) {
    // Sanitize references
    let selfRefs = 0;
    czmljson.forEach(packet => {
        const billboardIsRef = packet.billboard && 
            packet.billboard.image && 
            packet.billboard.image.reference;
        
        const selfReference = billboardIsRef && 
            packet.billboard.image.reference.split('#')[0] === packet.id;
        
        if (selfReference) {
            console.warn('Self-referencing reference for billboard image', packet);
            const pb = new Cesium.PinBuilder();
            packet.billboard.image = pb.fromText(
                "" + ++selfRefs,
                Cesium.Color.fromRandom({"alpha": 1.0}),
                32).toDataURL();
        }
    });
}

function readTextFromFile(file) {
    const reader = new FileReader();
    const promise =  new Promise((resolve) => {
        reader.onload = function() {
            resolve(reader.result);
        };
    });
    reader.readAsText(file);
    
    return promise;
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
}

export function enableSelectedEntityChangeListener() {
    viewer.selectedEntityChanged.addEventListener(viewerEntityChangeListener);
}
