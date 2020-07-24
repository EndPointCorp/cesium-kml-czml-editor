import '../fields/components.js'
import '../fields/checkbox.js'
import '../fields/direct.js'
import '../fields/enum.js'
import '../fields/material.js'

const template = `
<div class="editor label-editor">
    <v-row>
        <v-col cols="6" class="pb-2 pt-0">
            <direct-field
                @input="inputHandler"
                :entity="entity"
                :feature="feature"
                :field="'text'"
                :label="'Text'">
            </direct-field>
        </v-col>
    </v-row>

    <extend-to-ground :entity="entity"></extend-to-ground>

    <v-divider light></v-divider>
    <slot name="advancetoggle"></slot>

    <v-col cols="12" class="py-0 px-4 advanced" v-if="advanced">

        <v-row>
            <v-col cols="12" class="py-1">
                <color-field
                    @input="inputHandler"
                    :entity="entity"
                    :feature="feature"
                    :field="'fillColor'"
                    :label="'Fill Color'">
                </color-field>
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="12" class="py-1">
                <checkbox-field
                    @input="inputHandler"
                    :entity="entity"
                    :feature="feature"
                    :field="'showBackground'"
                    :label="'Show Background'">
                </checkbox-field>
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="12" class="py-1">
                <color-field
                    @input="inputHandler"
                    :entity="entity"
                    :feature="feature"
                    :field="'backgroundColor'"
                    :label="'Background Color'">
                </color-field>
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="6" class="pb-2 pt-0">
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
            <v-col cols="12" class="py-1">
                <color-field
                    @input="inputHandler"
                    :entity="entity"
                    :feature="feature"
                    :field="'outlineColor'"
                    :label="'Outline Color'">
                </color-field>
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="12" class="py-1">
                <direct-field
                    @input="inputHandler"
                    :entity="entity"
                    :feature="feature"
                    :field="'outlineWidth'"
                    :label="'Outline Width'">
                </direct-field>
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="12" class="py-1">
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

        <v-row>
            <v-col cols="6" class="pb-2 pt-0">
                <direct-field
                    @input="inputHandler"
                    :entity="entity"
                    :feature="feature"
                    :field="'scale'"
                    :label="'Scale'">
                </direct-field>
            </v-col>
        </v-row>

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

        <v-row>
            <v-col cols="6" class="pb-2 pt-0">
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

        <v-row>
            <v-col cols="6" class="pb-2 pt-0">
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
            <v-col cols="6" class="pb-2 pt-0">
                <components-field
                    @input="inputHandler"
                    :entity="entity"
                    :feature="feature"
                    :field="'translucencyByDistance'"
                    :type="'NearFarScalar'"
                    :components="['near', 'nearValue', 'far', 'farValue']"
                    :label="'Translucency By Distance'">
                </components-field>
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