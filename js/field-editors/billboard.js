import '../fields/components.js'
import '../fields/checkbox.js'
import '../fields/direct.js'
import '../fields/enum.js'

const template = `
<div class="editor billboard-editor">
    <div class="editor-name">Billboard</div>
    <div v-if="iconSize">
        Icon image original size: {{ iconSize && iconSize.width }}, {{ iconSize && iconSize.height }}
    </div>

    <label>width</label>
    <direct-field
        @input="inputHandler"
        :entity="entity"
        :feature="'billboard'"
        :field="'width'">
    </direct-field>

    <label>height</label>
    <direct-field
        @input="inputHandler"
        :entity="entity"
        :feature="'billboard'"
        :field="'height'">
    </direct-field>

    <div v-if="advanced">
        <label>pixelOffset</label>
        <components-field
            @input="inputHandler"
            :entity="entity"
            :feature="'billboard'"
            :field="'pixelOffset'"
            :type="'Cartesian2'"
            :components="['x', 'y']">
        </components-field>

        <label>heightReference</label>
        <enum-field
            @input="inputHandler"
            :entity="entity"
            :feature="'billboard'"
            :field="'heightReference'"
            :enum="'HeightReference'">
        </enum-field>

        <label>verticalOrigin</label>
        <enum-field
            @input="inputHandler"
            :entity="entity"
            :feature="'billboard'"
            :field="'verticalOrigin'"
            :enum="'VerticalOrigin'">
        </enum-field>

        <label>scale</label>
        <direct-field
            @input="inputHandler"
            :entity="entity"
            :feature="'billboard'"
            :field="'scale'">
        </direct-field>

        <label>rotation</label>
        <direct-field
            @input="inputHandler"
            :entity="entity"
            :feature="'billboard'"
            :field="'rotation'">
        </direct-field>

        <label>eyeOffset</label>
        <components-field
            @input="inputHandler"
            :entity="entity"
            :feature="'billboard'"
            :field="'eyeOffset'"
            :type="'Cartesian3'"
            :components="['x', 'y', 'z']">
        </components-field>
    </div>
</div>
`;

Vue.component('billboard-editor', {
    props: ['entity', 'billboard', 'advanced'],
    data: () => {
        return {
            iconSize: {}
        };
    },
    template: template,
    methods: {
        updateIconImageSize(iconSize) {
            this.iconSize = iconSize;
        },
        inputHandler(...args) {
            this.$emit('input', ...args);
        }
    },
    created: function() {
        this.updateBillboardImage = ((billboard) => {
            if (billboard.image) {
                const self = this;
                const resource = billboard.image.valueOf();
                const i = new Image();
                i.onload = () => {
                    self.updateIconImageSize({
                        width: i.width,
                        height: i.height
                    });
                };
                i.src = resource.url;
            }
        }).bind(this);
        this.updateBillboardImage(this.billboard);
    },
    watch: {
        billboard: function(newVal) {
            this.updateBillboardImage && this.updateBillboardImage(newVal);
        }
    }
});