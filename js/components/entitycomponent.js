const template = `
    <v-list-item v-bind:class="{folder: isFolder(entity)}" @dblclick="doubleClick()"
    v-on:click="selectHandler">

    <v-list-item-action>
      <v-checkbox color="primary" v-model="entity.show"></v-checkbox>
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
    props: ['entity', 'isFolder'],
    methods: {
        selectHandler: function() {
            this.$emit('select', this.entity);
        },
        doubleClick: function() {
            this.$emit('zoom-to');
        }
    },
    template: template
});