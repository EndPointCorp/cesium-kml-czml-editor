import EditorFieldsBuilder from '../components-factory.js'

const polylineEditorBuilder = new EditorFieldsBuilder('polyline', Cesium.PolylineGraphics);

const template = polylineEditorBuilder.getTemplate((fields, controls) => {
    return `<div class="editor polyline-editor">
        <div class="editor-name">Polyline</div>
        <div v-if="entity.billboard">
            <button v-if="!entity.polyline" @click="createDropLine">Create drop line</button>
            <button v-if="entity.polyline" @click="removeDropLine">Remove drop line</button>
        </div>

        ${fields}

        ${controls}
    </div>`;
});

Vue.component('polyline-editor', {
    props: ['entity'],
    template: template,
    methods: {
        createDropLine() {
            const position = this.entity.position.getValue();
            const cartographic = Cesium.Cartographic.fromCartesian(position);

            this.entity.polyline = new Cesium.PolylineGraphics({
                positions: [
                    position,
                    Cesium.Cartesian3.fromRadians(
                        cartographic.longitude,
                        cartographic.latitude,
                        0)
                ]
            });
        },
        removeDropLine() {
            this.entity.polyline = null;
        }
    }
});