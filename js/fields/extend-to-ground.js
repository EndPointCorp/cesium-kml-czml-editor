const template = `
<div class="text-left py-0 my-0" v-if="entity.billboard">
    <div class="editor-name">Extension line</div>
    <div>
        <v-switch hide-details id="extend"
            class="v-input--reverse py-0 my-0"
            label="Extend to ground:" v-model="extended"
            @change="handleChange"></v-switch>
    </div>
    <div v-if="extended">
        <direct-field
            @input="inputHandler"
            :entity="entity"
            :feature="'cylinder'"
            :field="'outlineWidth'"
            :label="'Extension Line Width'">
        </direct-field>

        <direct-field
            @input="inputHandler"
            :entity="entity"
            :feature="'cylinder'"
            :field="'length'"
            :label="'Length'">
        </direct-field>

        <color-field
            class="pt-2"
            @input="inputHandler"
            :entity="entity"
            :feature="'cylinder'"
            :field="'outlineColor'"
            :label="'Extension Line Color'"
        ></color-field>
    </div>
</div>
`;

export function createExtensionLine(entity) {
    const position = entity.position.getValue();
    const cartographic = Cesium.Cartographic.fromCartesian(position);

    entity.cylinder = new Cesium.CylinderGraphics({
        topRadius: 0.01,
        bottomRadius: 0.01,
        slices: 3,
        numberOfVerticalLines: 1,
        length: cartographic.height,
        outline: true,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        outlineWidth: 1,
        outlineColor: Cesium.Color.WHITE,
    });
}

export function removeExtensionLine(entity) {
    entity.cylinder = null;
    entity.polyline = null;
}

Vue.component('extend-to-ground', {
    props: ['entity'],
    data: function() {
        return {
            extended: !!this.entity.cylinder
        }
    },
    template: template,
    methods: {
        handleChange() {
            if (this.extended) {
                this.createDropLine();
            }
            else {
                this.removeDropLine();
            }
            // This isn't a real feature and field of Cesium entity
            this.$emit('input', this.extended, 'extend-to-ground', 'billboard', this.entity);
        },
        createDropLine() {
            createExtensionLine(this.entity);
        },
        removeDropLine() {
            removeExtensionLine(this.entity);
        },
        inputHandler(...args) {
            this.$emit('update', ...args);
        }
    }
});
