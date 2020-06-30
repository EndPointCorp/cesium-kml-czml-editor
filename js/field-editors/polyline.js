import EditorFieldsBuilder from '../components-factory.js'

const polylineEditorBuilder = new EditorFieldsBuilder('polyline', Cesium.PolylineGraphics);

const template = polylineEditorBuilder.getTemplate((fields, controls) => {
    return `<div class="editor polyline-editor text-left py-0 my-0" v-if="entity.billboard">
        <div class="editor-name">Lines</div>
        <div>
            <v-switch id="extend" class="v-input--reverse" label="Extend to ground" v-model="extend" @change="handleChange"></v-switch>
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