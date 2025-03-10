import '../fields/direct.js'
import '../fields/checkbox.js'
import '../fields/enum.js'
import '../fields/material.js'

const template = `
<div class="editor polygon-editor mt-4">
    <div class="editor-name">Polygon</div>

    <direct-field
        class="mt-3"
        @input="inputHandler"
        :entity="entity"
        :feature="'polygon'"
        :field="'height'"
        :label="'Height'"
    >
    </direct-field>
    <div v-if="entity.polygon.height" class="description">
        Polygons will be clamped to ground, if they are filled with a constant color
        and has no height or extruded height.<br/>
        NOTE: Setting height to 0 will disable clamping.<br/>
        Use clear button for Height and Extruded Height to set them to undefined and
        clamp polygon to ground.
    </div>

    <direct-field
        class="pt-4"
        @input="inputHandler"
        :entity="entity"
        :feature="'polygon'"
        :field="'extrudedHeight'"
        :label="'Extruded Height'"
    >
    </direct-field>
    <div class="description">
        Absolute altitude of the top edge, of the polygon.
        Top edge altitude is not relative to the bottom edge of polygon.
        see Height in advanced section of the editor.
    </div>

    <material-field
        class="pt-2"
        :entity="entity"
        :feature="'polygon'"
        :field="'material'"
        :label="'Material'"
    ></material-field>

    <checkbox-field
        class="mb-0"
        @input="inputHandler"
        :entity="entity"
        :feature="'polygon'"
        :field="'closeTop'"
        :label="'Close Top'"
    >
    </checkbox-field>

    <checkbox-field
        class="my-0"
        @input="inputHandler"
        :entity="entity"
        :feature="'polygon'"
        :field="'closeBottom'"
        :label="'Close Bottom'"
    >
    </checkbox-field>

    <checkbox-field
        class="my-0"
        @input="inputHandler"
        :entity="entity"
        :feature="'polygon'"
        :field="'fill'"
        :label="'Fill'"
    >
    </checkbox-field>

    <slot name="advancetoggle"></slot>

    <div class="advanced" v-if="advanced">

        <checkbox-field
            @input="inputHandler"
            :entity="entity"
            :feature="'polygon'"
            :field="'outline'"
            :label="'Outline'"
        >
        </checkbox-field>

        <direct-field
            class="mt-4 px-1"
            @input="inputHandler"
            :entity="entity"
            :feature="'polygon'"
            :field="'outlineWidth'"
            :label="'Outline Width'"
        >
        </direct-field>

        <color-field
            class="mt-3"
            @input="inputHandler"
            :entity="entity"
            :feature="'polygon'"
            :field="'outlineColor'"
            :label="'Outline Color'"
        ></color-field>

        <div class="description">
            Height is the altitude above ground of plain (not extruded) polygon,
            or altitude of the bottom for extruded polygon.
        </div>

        <div v-if="avgHeight && avgHeight > 0.1" class="editor-field">
            <label>Polygon height:</label>
            {{ avgHeight }}
        </div>

        <checkbox-field
            @input="inputHandler"
            :entity="entity"
            :feature="'polygon'"
            :field="'perPositionHeight'"
            :label="'Per Position Height'"
        >
        </checkbox-field>

        <div class="pl-1" v-if="avgHeight && avgHeight > 0.1">
            <div class="description">
                This polygon height/extrusion is encoded as per
                point height, click Convert button to convert it
                to extrusion.
            </div>
            <v-btn small @click="toExtrude()">Convert</v-btn>
        </div>

        <enum-field
            class="mt-6 mb-0 px-1"
            @input="inputHandler"
            :entity="entity"
            :feature="'polygon'"
            :field="'heightReference'"
            :enum="'HeightReference'"
            :label="'Height Reference'">
        </enum-field>
        <div class="description">
            How the height of the polygon should be referenced.
            This affects how polygons interacts with 3d terrain.
        </div>

        <enum-field
            class="mt-6 mb-2 px-1"
            @input="inputHandler"
            :entity="entity"
            :feature="'polygon'"
            :field="'extrudedHeightReference'"
            :enum="'HeightReference'"
            :label="'Extruded Height Reference'">
        </enum-field>

        <enum-field
            class="mt-6 mb-2 px-1"
            @input="inputHandler"
            :entity="entity"
            :feature="'polygon'"
            :field="'classificationType'"
            :enum="'ClassificationType'"
            :label="'Classification Type'">
        </enum-field>
        <div class="description">
            Property specifying whether this polygon will classify terrain, 3D Tiles,
            or both when clamped to the ground.
        </div>

    </div>
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
    polygon.height = 0;
    polygon.extrudedHeight = Math.round(avgHeight);

    polygon.heightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;
    polygon.extrudedHeightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;
}

export function polygonAverageHeight(polygon) {
    const positions = polygon.hierarchy.getValue().positions.map(v => {
        return Cesium.Cartographic.fromCartesian(v);
    });
    const heights = positions.map(p => p.height);
    return heights.reduce((acc, val) => acc + val) / heights.length;
}

export function stickPolygonToGround(polygon) {
    polygon.height = undefined;
    polygon.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
    polygon.outlineColor = Cesium.Color.BLACK;
    polygon.extrudedHeight = undefined;
    polygon.perPositionHeight = false;
}

export function getCentroid(polygon) {
    const polygonHierarchy = polygon.hierarchy.getValue(0);
    const bs = Cesium.BoundingSphere.fromPoints(polygonHierarchy.positions);
    const c = Cesium.Cartographic.fromCartesian(bs.center);
    
    c.height = 0;

    return Cesium.Cartographic.toCartesian(c);
}

Vue.component('polygon-editor', {
    props: ['entity', 'polygon', 'advanced'],
    data: () => ({
        avgHeight: null,
    }),
    template: template,
    methods: {
        toExtrude: function() {
            extrudePolygon(this.polygon, this.avgHeight);
            this.avgHeight = polygonAverageHeight(this.polygon);
            this.$forceUpdate();
        },
        getAvgHeight: function(val) {
            this.avgHeight = polygonAverageHeight(val);
        },
        inputHandler(...args) {
            this.$emit('update', ...args);
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