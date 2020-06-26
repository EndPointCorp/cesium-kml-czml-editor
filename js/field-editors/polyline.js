import EditorFieldsBuilder from '../components-factory.js'

const polylineEditorBuilder = new EditorFieldsBuilder('polyline', Cesium.PolylineGraphics);

const template = polylineEditorBuilder.getTemplate((fields, controls) => {
    return `<div class="editor polyline-editor">
        <div class="editor-name">Lines</div>
        <div v-if="entity.billboard">
            <label for="extend">Extend to ground</label>
            <input id="extend" type="checkbox" v-model="extend" v-on:change="handleChange">
        </div>

        ${fields}

        ${controls}
    </div>`;
});

Vue.component('polyline-editor', {
    props: ['entity'],
    data: function() {
        return {
            extend: !!this.entity.polyline
        }
    },
    template: template,
    methods: {
        handleChange() {
            if (this.extend) {
                this.createDropLine();
            }
            else {
                this.removeDropLine();
            }
        },
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