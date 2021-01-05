import '../fields/components.js'
import '../fields/checkbox.js'
import '../fields/direct.js'
import '../fields/enum.js'
import '../fields/material.js'

const template = `
<div class="editor label-editor">
    <div class="py-1">
        <span class="editor-name">Label: </span>
        <v-row class="py-4">
            <v-col cols="14" class="pb-2 pt-0" style="margin-top: 8px;">
                <direct-field
                    @input="inputHandler"
                    :entity="entity"
                    :feature="feature"
                    :field="'text'"
                    :label="'Text'">
                </direct-field>
            </v-col>
        </v-row>
    </div>

    <extend-to-ground v-if="!entity.billboard"
        :entity="entity"></extend-to-ground>

    <v-divider light></v-divider>
    <slot name="advancetoggle"></slot>

    <v-col cols="12" class="py-0 px-4 advanced" v-if="advanced">
        <v-row>
            <v-col cols="12" class="pb-2 pt-0" style="margin-left: -13px;">
                <checkbox-field
                    @input="inputHandler"
                    :entity="entity"
                    :feature="feature"
                    :field="'showBackground'"
                    :label="'Show Background'">
                </checkbox-field>
            </v-col>
        </v-row>

        <v-row class="py-2">
            <v-col cols="12" class="py-1" style="margin-left: -13px;">
                <color-field
                    @input="inputHandler"
                    :entity="entity"
                    :feature="feature"
                    :field="'fillColor'"
                    :label="'Fill Color'">
                </color-field>
            </v-col>
        </v-row>

        <v-row class="py-2">
            <v-col cols="12" class="py-1" style="margin-left: -13px;">
                <color-field
                    @input="inputHandler"
                    :entity="entity"
                    :feature="feature"
                    :field="'backgroundColor'"
                    :label="'Background Color'">
                </color-field>
            </v-col>
        </v-row>

        <v-row class="py-2">
            <v-col cols="12" class="pb-2 pt-0" style="margin-left: -13px; margin-top: 8px;">
                <enum-field
                    @input="inputHandler"
                    :entity="entity"
                    :feature="feature"
                    :field="'style'"
                    :enum="'LabelStyle'"
                    :label="'Style'">
                </enum-field>
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="12" class="py-1" style="margin-left: -13px; margin-top: 8px;">
                <color-field
                    @input="inputHandler"
                    :entity="entity"
                    :feature="feature"
                    :field="'outlineColor'"
                    :label="'Outline Color'">
                </color-field>
            </v-col>
        </v-row>

        <v-row class="py-3">
            <v-col cols="12" class="py-1" style="margin-left: -13px; margin-top: 8px;">
                <direct-field
                    @input="inputHandler"
                    :entity="entity"
                    :feature="feature"
                    :validator="validators.fontValidator"
                    :field="'font'"
                    :label="'Font'">
                </direct-field>
            </v-col>
        </v-row>

        <v-row class="py-2">
            <v-col cols="6" class="py-1" style="margin-left: -13px; margin-top: 8px;">
                <direct-field
                    @input="inputHandler"
                    :entity="entity"
                    :feature="feature"
                    :field="'outlineWidth'"
                    :label="'Outline Width'">
                </direct-field>
            </v-col>
        </v-row>

        <v-row class="py-2">
            <v-col cols="6" class="pb-2 pt-0" style="margin-left: -13px; margin-top: 8px;">
                <direct-field
                    @input="inputHandler"
                    :entity="entity"
                    :feature="feature"
                    :field="'scale'"
                    :label="'Scale'">
                </direct-field>
            </v-col>
        </v-row>

        <v-row class="py-2">
            <v-col cols="6" class="pb-2 pt-0" style="margin-left: -13px; margin-top: 8px;">
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

        <v-row class="py-2">
            <v-col cols="6" class="pb-2 pt-0" style="margin-left: -13px; margin-top: 8px;">
                <enum-field
                    @input="inputHandler"
                    :entity="entity"
                    :feature="feature"
                    :field="'horizontalOrigin'"
                    :enum="'HorizontalOrigin'"
                    :label="'Horizontal Origin'">
                </enum-field>
            </v-col>
        </v-row>

        <v-row class="py-6">
            <v-col cols="12" class="pb-2 pt-0">
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

        <v-row class="py-6">
            <v-col cols="12" class="pb-2 pt-0"  style="margin-left: 0;">
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

        <v-row class="py-4">
            <v-col cols="6" class="py-2" style="margin-left: -13px;">
                <direct-field
                    @input="inputHandler"
                    :entity="entity"
                    :feature="feature"
                    :field="'disableDepthTestDistance'"
                    :label="'Disable Depth Test Distance'">
                </direct-field>
            </v-col>
        </v-row>

        <v-row class="py-4">
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

function fontValidator(value) {
    return (value || value).trim().charAt(0) !== '0';
}

Vue.component('label-editor', {
    props: ['entity', 'label', 'advanced'],
    data: () => ({
        feature: 'label',
        validators: {
            fontValidator
        }
    }),
    template,
    methods: {
        inputHandler(...args) {
            this.$emit('update', ...args);
        }
    }
});