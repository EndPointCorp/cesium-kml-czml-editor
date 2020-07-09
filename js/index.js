import './field-editors/billboard.js'
import './field-editors/polygon.js'
import './field-editors/polyline.js'
import './field-editors/rectangle.js'

import './components/entity-info.js'
import './components/entitycomponent.js'
import './components/entities-list-type-filter.js'

import './dialogues/tileset-dialog.js'
import './dialogues/styles-dialog.js'

import DocumentWriter from './czml-writer.js'

// import CitiesDataSource from './cities/CitiesDataSource.js'

import {extrudePolygon, polygonAverageHeight} from './field-editors/polygon.js'
import {polylineAverageHeight} from './field-editors/polyline.js'

const getParams = new URLSearchParams(window.location.search);
Cesium.Ion.defaultAccessToken = getParams.get('ion_key') ||
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
        'eyJqdGkiOiI0YzE4M2QwNS00NjcwLTQzZGMtYmViNC1mOWJiZjljMzY3ZDAiLCJpZCI6NzMxNCwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTU0ODk1MTczNX0.' +
        'MjNWfJWsWk4lFXRoZS1EeqaFrWxEnugRqw9M3HRfAQk';

const viewer = new Cesium.Viewer('viewer');
window.viewer = viewer;

// CitiesDataSource(viewer);

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

function applyDefaults(entities) {
    billboardDefaults(entities);
    polylineDefaults(entities);
    polygonDefaults(entities);
}

function billboardDefaults(entities) {
    entities.forEach(e => {
        if (e.billboard) {
            e.billboard.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;

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
            entities: [],
            entity: null,
            advanced: false,

            showPolygons: true,
            showBillboards: true,
            showPolylines: true,

            copyType: null,
            changes: {},
        };
    },
    methods: {
        selectEntity: function(entity) {
            viewer.selectedEntity = entity;
        },
        addTileset: function(tileset) {
            if (tileset) {
                console.log(tileset);
                viewer.scene.primitives.add(tileset);
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
        },
        updateHandler: function(value, field, feature) {
            this.changes[field] = value;
            this.copyType = feature;
        },
        flyToEntity: function() {
            if (this.entity) {
                viewer.flyTo(this.entity);
            }
        },
        zoomToEntity: function() {
            if (this.entity) {
                viewer.zoomTo(this.entity);
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
    },
    computed: {
        filteredEntities() {
            return this.entities.filter(e => {
                let billboard = this.showBillboards && e.billboard;
                let polygon =  this.showPolygons && (e.polygon || e.rectangle);
                let polyline = this.showPolylines && e.polyline && !e.billboard;

                return this.isFolder(e) || billboard || polygon || polyline;
            });
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

    console.log('load', file);

    if (/vnd.google-earth/.test(file.type) || /\.kmz|\.kml/.test(file.name)) {
        loadDataSourcePromise(Cesium.KmlDataSource.load(file));
    }
    else if (/\.czml/.test(file.name)) {
        const reader = new FileReader();
        reader.onload = function() {
            loadDataSourcePromise(Cesium.CzmlDataSource.load(JSON.parse(reader.result)));
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

viewer.selectedEntityChanged.addEventListener((selection) => {
    editor.entity = selection;

    if (selection) {
        window.selectedEntity = selection;
        console.log(selection);
    }
    else {
        editor.selectEntity(null);
    }
});
