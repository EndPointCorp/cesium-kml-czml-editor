import './field-editors/billboard.js'
import './field-editors/polygon.js'
import './field-editors/polyline.js'
import './entity-info.js'
import './entity.js'


// import CitiesDataSource from './cities/CitiesDataSource.js'

import request3DTilesetDialog from './tileset-dialog.js'
import DocumentWriter from './czml-writer.js'

const viewer = new Cesium.Viewer('viewer');
window.viewer = viewer;

// CitiesDataSource(viewer);

const esriImagery = viewer.baseLayerPicker.viewModel
    .imageryProviderViewModels.find(m => m.name === 'ESRI World Imagery');
if (esriImagery) {
    viewer.baseLayerPicker.viewModel.selectedImagery = esriImagery;
}

function applyProperties(src, dst, properties) {
    const source = src.clone();

    properties.forEach(p => {
        dst[p] = source[p];
    });
}

const editor = new Vue({
    el: '#editor',
    data: () => ({
        advanced: true,
        czml: null,
        filename: null,
        entity: null,
        copySubject: false,
        copyType: null,
        copyProperties: [],
        selection: [],
        entities: []
    }),
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
        request3DTileset: function() {
            request3DTilesetDialog((tileset)=>{
                if (tileset) {
                    console.log(tileset);
                    viewer.scene.primitives.add(tileset);
                }
            });
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
        },
        onCopyPropertiesChange: function(properties) {
            this.copyProperties = properties;
        }
    }
});

document.getElementById('add-tileset').onclick = editor.request3DTileset.bind(editor);

function loadDataSourcePromise(dsPromise) {
    viewer.dataSources.add(dsPromise);
    dsPromise.then(ds => {
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

    if (/vnd.google-earth/.test(file.type)) {
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
}

document.getElementById('file').addEventListener('change', handleFileSelect, false);

viewer.selectedEntityChanged.addEventListener((selection) => {
    editor.entity = selection;

    if (!selection) {
        editor.selectEntity(null);
    }

    console.log(selection);
});

document.getElementById('file-area').addEventListener('drop', ev => {
    ev.preventDefault();
    document.getElementById('file-area').classList.remove('active');
    for (let i = 0; i < ev.dataTransfer.items.length; i++) {
        // If dropped items aren't files, reject them
        if (ev.dataTransfer.items[i].kind === 'file') {
            let file = ev.dataTransfer.items[i].getAsFile();
            loadFile(file);
        }
    }
});
document.getElementById('file-area').addEventListener('dragover', ev => {
    ev.preventDefault();
    document.getElementById('file-area').classList.add('active');
});
document.getElementById('file-area').addEventListener('dragleave', ev => {
    ev.preventDefault();
    document.getElementById('file-area').classList.remove('active');
});
