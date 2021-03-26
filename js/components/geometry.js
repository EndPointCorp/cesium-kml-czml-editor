import GeometryEditor from '../util/GeometryEditor.js'

import {
    disableSelectedEntityChangeListener,
    enableSelectedEntityChangeListener
} from '../index.js'

const template = `
<v-row v-show="entity.polygon || entity.polyline" class="mb-2 ml-2">
    <v-btn small @click="edit" v-if="!active" >
    Edit geometry
    </v-btn>
    <v-col cols="12" v-if="active">
        <p>
            Click on map to add points. Or move existing points.
        </p>
        <v-btn small @click="save">
            Save
        </v-btn>
        <v-btn small @click="cancel" class="ml-2">
            Cancel
        </v-btn>
    </v-col>
</v-row>
`;

let geometryEditor;

Vue.component('geometry-editor', {
    template,
    props: ['entity'],
    data: function () {
        const active = geometryEditor && geometryEditor.entity === this.entity;
        return {
            active,
        };
    },
    mounted() {
        if (!geometryEditor) {
            geometryEditor = new GeometryEditor(viewer);
        }

        if (!this.active) {
            enableSelectedEntityChangeListener();
        }
    },
    computed: {
        type() {
            return this.entity.polygon ? 'polygon' : this.entity.polyline ? 'polyline' : null;
        }
    },
    methods: {
        edit() {
            disableSelectedEntityChangeListener();
            this.active = true;
            if (!geometryEditor.entity) {
                geometryEditor.editEntity(this.type, this.entity);
            }
        },
        save() {
            enableSelectedEntityChangeListener();
            this.active = false;
            geometryEditor.save();
        },
        cancel() {
            enableSelectedEntityChangeListener();
            this.active = false;
            geometryEditor.cancel();
        }
    }
});
