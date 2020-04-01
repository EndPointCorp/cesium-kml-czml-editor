import './field-editors/billboard.js'
import './field-editors/polygon.js'
import './entity.js'

import DocumentWriter from './czml-writer.js'

const viewer = new Cesium.Viewer('viewer');

const editor = new Vue({
    el: '#editor',
    data: {
        czml: null,
        filename: null,
        entity: null,
        entities: []
    },
    methods: {
        selectEntity: function(entity) {
            viewer.selectedEntity = entity;
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
                w.addEntity(e);
            });
            const czmlObj = w.toJSON();
            console.log(czmlObj);

            this.czml = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(czmlObj));
        }
    }
});

function loadDataSourcePromise(dsPromise) {
    viewer.dataSources.add(dsPromise);
    dsPromise.then(ds => {
        editor.entities = ds.entities.values;
    });
}

function handleFileSelect(evt) {
    const file = evt.target.files[0]; // FileList object
    editor.filename = file.name.replace('.kml', '.czml').replace('.kmz', '.czml');

    console.log('load', file);

    if (/vnd.google-earth/.test(file.type)) {
        loadDataSourcePromise(Cesium.KmlDataSource.load(file));
    }
    else if (/.czml/.test(file.name)) {
        const reader = new FileReader();
        reader.onload = function() {
            loadDataSourcePromise(Cesium.CzmlDataSource.load(JSON.parse(reader.result)));
        };
        reader.readAsText(file)
    }
}

document.getElementById('file').addEventListener('change', handleFileSelect, false);

viewer.selectedEntityChanged.addEventListener((selection) => {
    editor.entity = selection;
    console.log(selection);
});

