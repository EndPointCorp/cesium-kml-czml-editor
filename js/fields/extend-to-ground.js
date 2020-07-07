const template = `
<div class="text-left py-0 my-0" v-if="entity.billboard">
    <div class="editor-name">Extension line</div>
    <div>
        <v-switch hide-details id="extend"
            class="v-input--reverse py-0 my-0"
            label="Extend to ground:" v-model="extend"
            @change="handleChange"></v-switch>
    </div>
    <div v-if="entity.polyline">
        <direct-field
            :entity="entity"
            :feature="'polyline'"
            :field="'width'"
            :label="'Extension Line Width'">
        </direct-field>

        <material-field
            class="pt-2"
            :entity="entity"
            :feature="'polyline'"
            :field="'material'"
            :label="'Extension Line Color'"
        ></material-field>
    </div>
</div>`

Vue.component('extend-to-ground', {
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
            // This isn't a real feature and field of Cesium entity
            this.$emit('input', this.extend, 'extend-to-ground', 'billboard', this.entity);
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