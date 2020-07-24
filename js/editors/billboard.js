import '../fields/components.js'
import '../fields/checkbox.js'
import '../fields/direct.js'
import '../fields/enum.js'
import '../fields/image.js'

import '../fields/extend-to-ground.js'

const template = `
<div class="editor billboard-editor">
    <div class="py-1">
        <span class="editor-name">Billboard: </span>
        <image-field
            @input="inputHandler"
            :entity="entity"
            :feature="feature"
            :field="'image'"
            :label="'Icon'">
        </image-field>
    </div>

    <v-row>
        <v-col cols="6" class="pb-2 pt-0">
            <enum-field
                @input="inputHandler"
                :entity="entity"
                :feature="feature"
                :field="'verticalOrigin'"
                :enum="'VerticalOrigin'"
                :label="'Vertical Origin'">
            </enum-field>
        </v-col>
    </v-row>

    <extend-to-ground :entity="entity"></extend-to-ground>

    <v-divider light></v-divider>
    <slot name="advancetoggle"></slot>

    <v-col cols="12" class="py-0 px-4 advanced" v-if="advanced">

        <v-row>
            <v-col cols="12" class="py-1">
                <direct-field
                    @input="inputHandler"
                    :entity="entity"
                    :feature="feature"
                    :field="'disableDepthTestDistance'"
                    :label="'Disable Depth Test Distance'">
                </direct-field>
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="12" class="py-1">
                <components-field
                    @input="inputHandler"
                    :entity="entity"
                    :feature="feature"
                    :field="'pixelOffset'"
                    :type="'Cartesian2'"
                    :components="['x', 'y']"
                    :label="'Pixel Offset'">
                </components-field>
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="6" class="py-1 pl-0 ">
                <enum-field
                    @input="inputHandler"
                    :entity="entity"
                    :feature="feature"
                    :field="'heightReference'"
                    :enum="'HeightReference'"
                    :label="'Height Reference'">
                </enum-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="6" class="pt-4 pl-0 ">
                <direct-field
                    @input="inputHandler"
                    :entity="entity"
                    :feature="feature"
                    :field="'scale'"
                    :label="'Scale'">
                </direct-field>
            </v-col>
            <v-col cols="6" class="pt-4">
                <direct-field
                    @input="inputHandler"
                    :entity="entity"
                    :feature="feature"
                    :field="'rotation'"
                    :label="'Rotation'">
                </direct-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12" class="py-1">
                <components-field
                    @input="inputHandler"
                    :entity="entity"
                    :feature="feature"
                    :field="'eyeOffset'"
                    :type="'Cartesian3'"
                    :components="['x', 'y', 'z']"
                    :label="'Eye Offset'">
                </components-field>
            </v-col>
        </v-row>
    </v-col>
</div>
`;

Vue.component('billboard-editor', {
    props: ['entity', 'billboard', 'advanced'],
    data: () => ({
        iconSize: {},
        feature: 'billboard'
    }),
    template: template,
    methods: {
        updateIconImageSize(iconSize) {
            this.iconSize = iconSize;
        },
        inputHandler(...args) {
            this.$emit('update', ...args);
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