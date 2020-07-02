import '../fields/direct.js'
import '../fields/checkbox.js'
import '../fields/enum.js'
import '../fields/material.js'

const template = `
<div class="editor polygon-editor">
    <div class="editor-name">Polygon</div>
    <div v-if="avgHeight && avgHeight > 0.1" class="editor-field">
        <label>Polygon height:</label>
        {{ avgHeight }}
    </div>

    <material-field
        :entity="entity"
        :feature="'polygon'"
        :field="'material'"
    ></material-field>

    <direct-field
        @input="inputHandler"
        :entity="entity"
        :feature="'polygon'"
        :field="'height'"
    >
    </direct-field>

    <direct-field
        @input="inputHandler"
        :entity="entity"
        :feature="'polygon'"
        :field="'extrudedHeight'"
    >
    </direct-field>

    <checkbox-field
        @input="inputHandler"
        :entity="entity"
        :feature="'polygon'"
        :field="'closeTop'"
    >
    </checkbox-field>

    <checkbox-field
        @input="inputHandler"
        :entity="entity"
        :feature="'polygon'"
        :field="'closeBottom'"
    >
    </checkbox-field>

    <div v-if="advanced">

        <checkbox-field
            @input="inputHandler"
            :entity="entity"
            :feature="'polygon'"
            :field="'perPositionHeight'"
        >
        </checkbox-field>

        <div v-if="avgHeight && avgHeight > 0.1">
            <div class="description">
                This polygon height/extrusion is encoded as per
                point height, click Convert button to convert it
                to extrusion.
            </div>
            <button @click="toExtrude()">Convert</button>
        </div>

        <enum-field
            @input="inputHandler"
            :entity="entity"
            :feature="'polygon'"
            :field="'heightReference'"
            :enum="'HeightReference'"
            :label="'Height Reference'">
        </enum-field>

        <enum-field
            @input="inputHandler"
            :entity="entity"
            :feature="'polygon'"
            :field="'extrudedHeightReference'"
            :enum="'HeightReference'"
            :label="'Height Reference'">
        </enum-field>

    </div>

    <slot></slot>

</div>
`;

export function extrudePolygon(polygon, avgHeight) {
    const positions = [];
    polygon.hierarchy.getValue().positions.forEach(p => {
        const crtg = Cesium.Cartographic.fromCartesian(p);
        positions.push(Cesium.Cartesian3.fromRadians(crtg.longitude, crtg.latitude, 0));
    });

    const hierarchy = new Cesium.PolygonHierarchy(positions);
    polygon.hierarchy.setValue(hierarchy);

    polygon.perPositionHeight = false;
    polygon.extrudedHeight = true;
    polygon.height = 0;
    polygon.extrudedHeight = avgHeight;

    polygon.heightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;
    polygon.extrudedHeightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;
    heightReference = 'RELATIVE_TO_GROUND';
    extrudedHeightReference = 'RELATIVE_TO_GROUND';
}

export function polygonAverageHeight(polygon) {
    const positions = polygon.hierarchy.getValue().positions.map(v => {
        return Cesium.Cartographic.fromCartesian(v);
    });
    const heights = positions.map(p => p.height);
    return heights.reduce((acc, val) => acc + val) / heights.length;
}

Vue.component('polygon-editor', {
    props: ['entity', 'polygon', 'advanced'],
    data: () => ({
        avgHeight: null
    }),
    template: template,
    methods: {
        toExtrude: function() {
            extrudePolygon(this.polygon, this.avgHeight);
            this.avgHeight = polygonAverageHeight(this.polygon);
        },
        getAvgHeight: function(val) {
            this.avgHeight = polygonAverageHeight(val);
        },
        inputHandler() {

        }
    },
    created: function() {
        this.getAvgHeight(this.polygon);
    },
    watch: {
        polygon: function(newVal) {
            this.getAvgHeight(newVal);
        }
    }
});