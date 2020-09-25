import '../fields/direct.js'
import '../fields/checkbox.js'
import '../fields/enum.js'
import '../fields/material.js'

const template = `
<div class="editor polyline-editor">
    <div class="editor-name">Polyline</div>

    <direct-field class="pt-4 pl-0"
        @input="inputHandler"
        :entity="entity"
        :feature="'polyline'"
        :field="'width'"
        :label="'Width'">
    </direct-field>

    <material-field
        class="pt-2"
        :entity="entity"
        :feature="'polyline'"
        :field="'material'"
        :label="'Material'"
    ></material-field>

    <slot name="advancetoggle"></slot>

    <div class="advanced" v-if="advanced">

        <div v-if="avgHeight && avgHeight > 0.1" >
            <label>Polyline height:</label>
            {{ avgHeight }}
        </div>

        <checkbox-field
            @input="inputHandler"
            :entity="entity"
            :feature="'polyline'"
            :field="'clampToGround'"
            :label="'Clamp To Ground'">
        </checkbox-field>

        <direct-field class="pt-4 pl-0"
            @input="inputHandler"
            :entity="entity"
            :feature="'polyline'"
            :field="'zIndex'"
            :label="'Z Index'">
        </direct-field>

        <enum-field
            class="mt-6 mb-2 px-1"
            @input="inputHandler"
            :entity="entity"
            :feature="'polyline'"
            :field="'classificationType'"
            :enum="'ClassificationType'"
            :label="'Classification Type'">
        </enum-field>
        <div class="description">
            Property specifying whether this polyline will classify terrain, 3D Tiles,
            or both when clamped to the ground.
        </div>
    </div>
</div>
`;

export function polylineAverageHeight(polyline) {
    const positions = polyline.positions.getValue().map(v => {
        return Cesium.Cartographic.fromCartesian(v);
    });
    const heights = positions.map(p => p.height);
    return heights.reduce((acc, val) => acc + val) / heights.length;
}

Vue.component('polyline-editor', {
    props: ['entity', 'polyline', 'advanced'],
    data: () => ({
        avgHeight: null,
    }),
    template: template,
    methods: {
        inputHandler(...args) {
            this.$emit('update', ...args);
        },
        getAvgHeight: function(val) {
            this.avgHeight = polylineAverageHeight(val);
        }
    },
    created: function() {
        this.getAvgHeight(this.polyline);
    },
    watch: {
        polyline: function(newVal) {
            this.getAvgHeight(newVal);
        }
    }
});