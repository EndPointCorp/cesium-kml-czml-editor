import '../fields/components.js'
import '../fields/checkbox.js'
import '../fields/direct.js'
import '../fields/enum.js'
import '../fields/image.js'
import '../fields/near-far.js'
import '../fields/angle.js'

import '../fields/extend-to-ground.js'

const template = `
<div class="editor billboard-editor">
    <div class="py-1">
        <span class="editor-name">Billboard: </span>
        <image-field :key="entity.id"
            @input="inputHandler"
            :entity="entity"
            :feature="feature"
            :field="'image'"
            :label="'Icon'">
        </image-field>
    </div>

    <v-row class="py-6">
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

        <v-row class="my-4">
            <direct-field
                @input="inputHandler"
                :entity="entity"
                :feature="feature"
                :field="'disableDepthTestDistance'"
                :label="'Disable Depth Test Distance'">
            </direct-field>
        </v-row>

        <v-row class="py-4">
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

        <v-row class="py-5">
            <v-col cols="6" class="py-1 pl-0">
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
        <v-row class="py-1">
            <v-col cols="6" class="py-0 pl-0">
                <direct-field
                    @input="inputHandler"
                    :entity="entity"
                    :feature="feature"
                    :field="'scale'"
                    :label="'Scale'">
                </direct-field>
            </v-col>
            <v-col cols="6" class="py-0">
                <angle-field
                    @input="inputHandler"
                    :entity="entity"
                    :feature="feature"
                    :field="'rotation'"
                    :label="'Rotation'">
                </angle-field>
            </v-col>
        </v-row>
        <v-row>
            <checkbox-field
                class="mb-0"
                @input="inputHandler"
                :entity="entity"
                :feature="feature"
                :field="'sizeInMeters'"
                :label="'Size in meters'"
            >
            </checkbox-field>
        </v-row>
        <v-row class="my-6">
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
        <v-row>
            <color-field
                class="mt-3 mb-6"
                @input="inputHandler"
                :entity="entity"
                :feature="feature"
                :field="'color'"
                :label="'Color'">
            </color-field>
        </v-row>
        <v-row class="py-4">
            <v-col cols="12" class="py-1">
                <near-far-scalar-field
                    @input="inputHandler"
                    :entity="entity"
                    :feature="feature"
                    :field="'translucencyByDistance'"
                    :label="'Translucency By Distance'">
                </near-far-scalar-field>
            </v-col>
        </v-row>
        <v-row class="py-4">
            <v-col cols="12" class="py-1 my-1">
                <near-far-scalar-field
                    @input="inputHandler"
                    :entity="entity"
                    :feature="feature"
                    :field="'pixelOffsetScaleByDistance'"
                    :label="'Pixel Offset Scale By Distance'">
                </near-far-scalar-field>
            </v-col>
        </v-row>
        <v-row class="py-4">
            <v-col cols="12" class="py-1">
                <near-far-scalar-field
                    @input="inputHandler"
                    :entity="entity"
                    :feature="feature"
                    :field="'scaleByDistance'"
                    :label="'Scale By Distance'">
                </near-far-scalar-field>
            </v-col>
        </v-row>
        <v-row class="my-4">
            <v-col cols="12" class="py-1">
                <components-field
                    @input="inputHandler"
                    :entity="entity"
                    :feature="feature"
                    :field="'distanceDisplayCondition'"
                    :type="'DistanceDisplayCondition'"
                    :components="['near', 'far']"
                    :label="'Display Distance'">
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