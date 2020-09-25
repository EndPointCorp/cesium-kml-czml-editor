import '../fields/direct.js'
import '../fields/checkbox.js'
import '../fields/enum.js'
import '../fields/material.js'

const template = `
<div class="editor rectangle-editor">
    <div class="editor-name">Rectangle</div>

    <direct-field
        class="mt-3"
        @input="inputHandler"
        :entity="entity"
        :feature="'rectangle'"
        :field="'height'"
        :label="'Height'"
    >
    </direct-field>

    <div v-if="entity.rectangle.height" class="description">
        Boxes will be clamped to ground, if they are filled with a constant color
        and has no height or extruded height.<br/>
        NOTE: Setting height to 0 will disable clamping.<br/>
        Use clear button for Height and Extruded Height to set them to undefined and
        clamp box to ground.
    </div>

    <div class="description">
        Height is the altitude above ground of plain (not extruded) rectangle,
        or altitude of the bottom for extruded rectangle.
    </div>

    <direct-field
        class="pt-4"
        @input="inputHandler"
        :entity="entity"
        :feature="'rectangle'"
        :field="'extrudedHeight'"
        :label="'Extruded Height'"
    >
    </direct-field>
    <div class="description">
        Absolute altitude of the top edge, of extruded rectangle.
        Top edge altitude is not relative to the bottom edge of rectangle.
        see Height in advanced section of the editor.
    </div>

    <checkbox-field
        class="my-0"
        @input="inputHandler"
        :entity="entity"
        :feature="'rectangle'"
        :field="'fill'"
        :label="'Fill'"
    >
    </checkbox-field>

    <slot name="advancetoggle"></slot>

    <div class="advanced" v-if="advanced">

        <checkbox-field
            @input="inputHandler"
            :entity="entity"
            :feature="'rectangle'"
            :field="'outline'"
            :label="'Outline'"
        >
        </checkbox-field>

        <direct-field
            class="mt-4 px-1"
            @input="inputHandler"
            :entity="entity"
            :feature="'rectangle'"
            :field="'outlineWidth'"
            :label="'Outline Width'"
        >
        </direct-field>

        <color-field
            class="mt-3"
            :entity="entity"
            :feature="'rectangle'"
            :field="'outlineColor'"
            :label="'Outline Color'"
        ></color-field>

        <enum-field
            class="mt-6 mb-0 px-1"
            @input="inputHandler"
            :entity="entity"
            :feature="'rectangle'"
            :field="'heightReference'"
            :enum="'HeightReference'"
            :label="'Height Reference'">
        </enum-field>
        <div class="description">
            How the height of the rectangle should be referenced.
            This affects how rectangles interacts with 3d terrain.
        </div>

        <enum-field
            class="mt-6 mb-2 px-1"
            @input="inputHandler"
            :entity="entity"
            :feature="'rectangle'"
            :field="'extrudedHeightReference'"
            :enum="'HeightReference'"
            :label="'Extruded Height Reference'">
        </enum-field>

    </div>
</div>
`;


Vue.component('rectangle-editor', {
    props: ['entity', 'rectangle', 'advanced'],
    template: template,
    methods: {
        inputHandler(...args) {
            this.$emit('update', ...args);
        }
    }
});