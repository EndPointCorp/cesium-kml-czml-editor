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
    <v-row>
        <v-col cols="6">
            <direct-field
                @input="inputHandler"
                :entity="entity"
                :feature="'billboard'"
                :field="'width'"
                :label="'Width'">
            </direct-field>
        </v-col>
        <v-col cols="6">
            <direct-field
                @input="inputHandler"
                :entity="entity"
                :feature="'billboard'"
                :field="'height'"
                :label="'Height'">
            </direct-field>
        </v-col>
        </v-row>

        <v-col cols="12" v-if="advanced">
        <v-row>
        <v-col cols="12">
            <label>pixelOffset</label>
            <components-field
                @input="inputHandler"
                :entity="entity"
                :feature="'billboard'"
                :field="'pixelOffset'"
                :type="'Cartesian2'"
                :components="['x', 'y']">
            </components-field>
            </v-col>
            </v-row>
            <v-row>
            <v-col cols="12">
            <label>heightReference</label>
            <enum-field
                @input="inputHandler"
                :entity="entity"
                :feature="'billboard'"
                :field="'heightReference'"
                :enum="'HeightReference'">
            </enum-field>
            </v-col>
            </v-row>
            <v-row>
            <v-col cols="12">
            <label>verticalOrigin</label>
            <enum-field
                @input="inputHandler"
                :entity="entity"
                :feature="'billboard'"
                :field="'verticalOrigin'"
                :enum="'VerticalOrigin'">
            </enum-field>
            </v-col>
            </v-row>
            <v-row>
            <v-col cols="6">
                <direct-field
                    @input="inputHandler"
                    :entity="entity"
                    :feature="'billboard'"
                    :field="'scale'"
                    :label="'Scale'">
                </direct-field>
            </v-col>
            <v-col cols="6">
                <direct-field
                    @input="inputHandler"
                    :entity="entity"
                    :feature="'billboard'"
                    :field="'rotation'"
                    :label="'Rotation'">
                </direct-field>
            </v-col>
            </v-row>
            <v-row>
            <v-col cols="12">
            <label>eyeOffset</label>
            <components-field
                @input="inputHandler"
                :entity="entity"
                :feature="'billboard'"
                :field="'eyeOffset'"
                :type="'Cartesian3'"
                :components="['x', 'y', 'z']">
            </components-field>
            </v-col>
            </v-row>
        </v-col>
    <slot></slot>
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