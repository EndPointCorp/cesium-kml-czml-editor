import EditorFieldsBuilder from '../components-factory.js'

const editorBuilder = new EditorFieldsBuilder('polygon', Cesium.PolygonGraphics);

editorBuilder.addDirectPropertyField('height');
editorBuilder.addEnumField('heightReference', Cesium.HeightReference);

editorBuilder.addDirectPropertyField('extrudedHeight');
editorBuilder.addEnumField('extrudedHeightReference', Cesium.HeightReference);

editorBuilder.addDirectPropertyField('perPositionHeight', Boolean);
editorBuilder.addDirectPropertyField('closeTop', Boolean);
editorBuilder.addDirectPropertyField('closeBottom', Boolean);

const initModel = editorBuilder.getInitFunction();

Vue.component('polygon-editor', {
    props: ['polygon', 'copyMode', 'onCopyPropertiesChange'],
    data: () => {
        return {
            copyFields: [],
            avgHeight: null
        };
    },
    template: editorBuilder.getTemplate((fields, controls) => {
        return `<div class="editor polygon-editor">
            <div class="editor-name">Polygon</div>
            <div v-if="avgHeight && avgHeight > 0.1" class="editor-field">
                <label>Per position height:</label>
                {{ avgHeight }}
            </div>

            ${fields}

            ${controls}

            <div v-if="avgHeight && avgHeight > 0.1">
                <div class="description">
                    This polygon height/extrusion is encoded as per
                    point height, click Convert button to convert it
                    to extrusion.
                </div>
                <button @click="toExtrude">Convert</button>
            </div>

        </div>`;
    }),
    methods: editorBuilder.addComponentMethods({
        toExtrude: function() {

            const positions = [];
            this.polygon.hierarchy.getValue().positions.forEach(p => {
                const crtg = Cesium.Cartographic.fromCartesian(p);
                positions.push(Cesium.Cartesian3.fromRadians(crtg.longitude, crtg.latitude, 0));
            });

            const hierarchy = new Cesium.PolygonHierarchy(positions);
            this.polygon.hierarchy.setValue(hierarchy);

            this.polygon.perPositionHeight = false;
            this.polygon.extrudedHeight = true;
            this.polygon.height = 0;
            this.polygon.extrudedHeight = this.avgHeight;

            this.polygon.heightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;
            this.polygon.extrudedHeightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;
            this.heightReference = 'RELATIVE_TO_GROUND';
            this.extrudedHeightReference = 'RELATIVE_TO_GROUND';

            this.getAvgHeight(this.polygon);
        },
        getAvgHeight: function(val) {
            const positions = val.hierarchy.getValue().positions.map(v => {
                return Cesium.Cartographic.fromCartesian(v);
            });
            const heights = positions.map(p => p.height);
            this.avgHeight = heights.reduce((acc, val) => acc + val) / heights.length;
        }
    }),
    created: function() {
        initModel(this.polygon, this);
        this.getAvgHeight(this.polygon);
    },
    watch: {
        polygon: function(newVal) {
            initModel(newVal, this);

            if (this.onCopyPropertiesChange) {
                this.onCopyPropertiesChange(this.copyFields);
            }

            this.getAvgHeight(newVal);
        }
    }
});