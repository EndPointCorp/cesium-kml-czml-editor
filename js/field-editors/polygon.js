import EditorFieldsBuilder from '../components-factory.js'

const editorBuilder = new EditorFieldsBuilder('polygon', Cesium.PolygonGraphics);

editorBuilder.addDirectPropertyField('height');
editorBuilder.addEnumField('heightReference', Cesium.HeightReference);

editorBuilder.addDirectPropertyField('extrudedHeight');
editorBuilder.addEnumField('extrudedHeightReference', Cesium.HeightReference);

const initModel = editorBuilder.getInitFunction();

Vue.component('polygon-editor', {
    props: ['polygon'],
    template: editorBuilder.getTemplate(),
    methods: editorBuilder.addComponentMethods(),
    created: function() {
        initModel(this.polygon, this);
    },
    watch: {
        polygon: function(newVal) {
            initModel(newVal, this);
        }
    }
});