import './field-editors/billboard.js'
import './field-editors/polygon.js'

import './components/entity-info.js'
import './components/entity.js'
import './components/entitycomponent.js'

import './dialogues/tileset-dialog.js'
import './dialogues/styles-dialog.js'

import DocumentWriter from './czml-writer.js'

// import CitiesDataSource from './cities/CitiesDataSource.js'

import {extrudePolygon, polygonAverageHeight} from './field-editors/polygon.js'

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

function applyProperties(src, dst, properties) {
    const source = src.clone();

    properties.forEach(p => {
        dst[p] = source[p];
    });
}

function extrudePolygons(polygons) {
    // Convert Polygons into extrusions by default
    polygons.forEach(e => {
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
            advanced: false,
            czml: null,
            filename: null,
            entity: null,
            copySubject: false,
            copyType: null,
            copyProperties: [],
            selection: [],
            entities: [],
            item: null,
            showPolygons: true,
            showBillboards: true
        };
    },
    methods: {
        selectEntity: function(entity) {
            viewer.selectedEntity = entity;
        },
        appendToSelection: function(entity, selected) {
            if (entity) {
                if (selected) {
                    if (this.selection.indexOf(entity) < 0) {
                        this.selection.push(entity);
                    }
                }
                else {
                    const i = this.selection.indexOf(entity);
                    if (i >= 0) {
                        this.selection.splice(i, 1);
                    }
                }
            }
            else {
                this.selection.splice(0, this.selection.length);
            }
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
        propagateStyles: function() {
            console.log(this.entity);
        },
        copyStyle: function(type) {
            this.copySubject = this.entity[type];
            this.copyType = type;
            this.appendToSelection(this.entity, true);
        },
        pasteStyle: function() {
            this.selection.forEach(e => {
                applyProperties(this.copySubject, e[this.copyType], this.copyProperties);
            });
            this.selection = [this.entity];

            this.copySubject = null;
            this.copyType = null;
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
        selectApplicable: function() {
            this.entities
                .filter(e => e[this.copyType] !== undefined)
                .forEach(e => this.appendToSelection(e, true));
        },
        toCZML: function() {
            const w = new DocumentWriter();
            this.entities.forEach(e => {
                w.addEntity(e);
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

        extrudePolygons(ds.entities.values);

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

    if (!selection) {
        editor.selectEntity(null);
    }

    console.log(selection);
});
