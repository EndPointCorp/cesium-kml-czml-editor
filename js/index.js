import './field-editors/billboard.js'
import './field-editors/polygon.js'

const viewer = new Cesium.Viewer('viewer');

const editor = new Vue({
    el: '#editor',
    data: {
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
        }
    }
});

function handleFileSelect(evt) {
    const file = evt.target.files[0]; // FileList object
    const dsPromise = Cesium.KmlDataSource.load(file);
    viewer.dataSources.add(dsPromise);
    dsPromise.then(ds => {
        editor.entities = ds.entities.values;
    });
}

document.getElementById('file').addEventListener('change', handleFileSelect, false);

viewer.selectedEntityChanged.addEventListener((selection) => {
    editor.entity = selection;
    console.log(selection);
});

