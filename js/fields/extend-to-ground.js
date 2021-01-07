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

        <enum-field
            class="pt-2"
            @input="inputHandler"
            :entity="entity"
            :feature="'cylinder'"
            :field="'heightReference'"
            :enum="'HeightReference'"
            :label="'Height Reference'">
        </enum-field>
    </div>
</div>`

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
            const position = this.entity.position.getValue();
            const cartographic = Cesium.Cartographic.fromCartesian(position);

            this.entity.cylinder = new Cesium.CylinderGraphics({
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
        },
        removeDropLine() {
            this.entity.cylinder = null;
        },
        inputHandler(...args) {
            this.$emit('update', ...args);
        }
    }
});
