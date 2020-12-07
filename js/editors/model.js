import '../fields/direct.js'
import '../fields/checkbox.js'
import '../fields/enum.js'
import '../fields/material.js'

const template = `
<div class="editor model-editor">
    <div class="editor-name">Model</div>

    <direct-field class="pt-4 pl-0"
        @input="inputHandler"
        :entity="entity"
        :feature="'model'"
        :field="'scale'"
        :label="'Scale'">
    </direct-field>

    <enum-field
        @input="inputHandler"
        :entity="entity"
        :feature="'model'"
        :field="'heightReference'"
        :enum="'HeightReference'"
        :label="'Height Reference'">
    </enum-field>

    <slot name="advancetoggle"></slot>

    <div class="advanced" v-if="advanced">

        <color-field
            class="pt-2"
            :entity="entity"
            :feature="'model'"
            :field="'color'"
            :label="'Color'"
            @input="inputHandler"
        ></color-field>

        <direct-field
            class="pt-2"
            :entity="entity"
            :feature="'model'"
            :field="'colorBlendAmount'"
            :label="'Color Blend Amount'"
            @input="inputHandler"
        ></direct-field>

        <enum-field
            @input="inputHandler"
            :entity="entity"
            :feature="'model'"
            :field="'colorBlendMode'"
            :enum="'ColorBlendMode'"
            :label="'Color Blend Mode'">
        </enum-field>

        <direct-field
            class="pt-2"
            :entity="entity"
            :feature="'model'"
            :field="'silhouetteSize'"
            :label="'Silhouette Size'"
            @input="inputHandler"
        ></direct-field>

        <color-field
            class="pt-2"
            :entity="entity"
            :feature="'model'"
            :field="'silhouetteColor'"
            :label="'Silhouette Color'"
            @input="inputHandler"
        ></color-field>

    </div>
</div>
`;

Vue.component('model-editor', {
    props: ['entity', 'model', 'advanced'],
    template: template,
    methods: {
        inputHandler(...args) {
            this.$emit('update', ...args);
        }
    }
});