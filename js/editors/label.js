import '../fields/components.js'
import '../fields/checkbox.js'
import '../fields/direct.js'
import '../fields/enum.js'

const template = `
<div class="editor label-editor">
    <v-row>
        <v-col cols="6" class="pb-2 pt-0">
            <direct-field
                @input="inputHandler"
                :entity="entity"
                :feature="'label'"
                :field="'text'"
                :label="'Text'">
            </direct-field>
        </v-col>
    </v-row>

</div>
`;

Vue.component('label-editor', {
    props: ['entity', 'label', 'advanced'],
    template,
    methods: {
        inputHandler(...args) {
            this.$emit('update', ...args);
        }
    }
});