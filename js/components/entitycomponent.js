const template = `
    <v-list-item v-bind:class="{folder: isFolder(entity)}" @dblclick="doubleClick()"
    v-on:click="selectHandler">
    <template v-slot:default="{ active, toggle }">

    <v-list-item-action>
      <v-checkbox color="primary" :input-value="active" @change="appendHandler($event.target.checked)" @click="toggle" :disabled="selected" v-model="entity.show"></v-checkbox>
    </v-list-item-action>
    <v-list-item-icon>
        <v-icon small v-if="isFolder(entity)">mdi-folder</v-icon>
        <v-icon small v-if="entity.billboard">mdi-pin</v-icon>
        <v-icon small v-if="entity.polygon">mdi-widgets-outline</v-icon>
        <v-icon small v-if="entity.polyline && !entity.billboard">mdi-vector-polyline</v-icon>
    </v-list-item-icon>
    <v-list-item-content>
      <v-list-item-title v-text="entity.name"></v-list-item-title>
    </v-list-item-content>
    </template>
  </v-list-item>
`;

Vue.component('entitycomponent', {
    props: ['entity', 'select', 'isFolder', 'selected'],
    methods: {
        selectHandler: function() {
            if (this.selectable()) {
                !this.selected && this.appendHandler(!this.inSelection)
            }
            else {
                this.select && this.select(this.entity);
            }
        },
        appendHandler: function(selected) {
            this.append && this.append(this.entity, selected);
        },
        selectable: function() {
            return this.entity[this.copyType] !== undefined;
        },
        doubleClick: function() {
            this.$emit('zoom-to');
        }
    },
    template: template
});