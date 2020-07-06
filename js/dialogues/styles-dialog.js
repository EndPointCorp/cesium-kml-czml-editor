const template = `
    <v-dialog
      v-model="dialog"
      width="700"
      persistent
    >
      <template v-slot:activator="{ on, attrs }">
        <v-btn
            small
            id="copy-styles"
            v-bind="attrs"
            v-on="on"
        >
        <slot name="buttonlabel"></slot>
        </v-btn>
      </template>

      <v-card>
        <v-card-title
          class="headline grey lighten-2"
          primary-title
        >
        Apply styles
        </v-card-title>

        <v-row class="ma-1">
        <v-col cols="6">
            <v-card class="mx-auto">
                <v-toolbar color="gray" dark>
                    <v-toolbar-title>Applicable Entities</v-toolbar-title>
                </v-toolbar>
                <v-list
                color="grey lighten-1"
                dense
                height="200"
                class="overflow-y-auto py-0"
                >
                    <v-list-item-group v-model="item" color="primary">
                        <template v-for="(entity, index) in applicableEntities">
                            <v-list-item>
                                <v-list-item-action>
                                <v-checkbox color="primary" @change="console.log('checked')"  v-model="inSelection"></v-checkbox>
                                </v-list-item-action>
                                <v-list-item-content>
                                <v-list-item-title v-text="entity.name"></v-list-item-title>
                                </v-list-item-content>
                            </v-list-item>
                        </template>
                    </v-list-item-group>
                </v-list>
            </v-card>
        </v-col>
        <v-col cols="6">
            <v-card class="mx-auto">
                <v-toolbar color="gray" dark>
                    <v-toolbar-title>Applicable Entities</v-toolbar-title>
                </v-toolbar>
                <v-list
                color="grey lighten-1"
                dense
                height="200"
                class="overflow-y-auto py-0"
                >
                    <v-list-item-group v-model="item" color="primary">
                        <template v-for="(entity, index) in applicableEntities">
                            <v-list-item>
                                <v-list-item-action>
                                <v-checkbox color="primary" @change="console.log('checked')"  v-model="inSelection"></v-checkbox>
                                </v-list-item-action>
                                <v-list-item-content>
                                <v-list-item-title v-text="entity.name"></v-list-item-title>
                                </v-list-item-content>
                            </v-list-item>
                        </template>
                    </v-list-item-group>
                </v-list>
            </v-card>
    </v-col>
      </v-row>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="submit">Submit</v-btn>
          <v-btn @click="cancel">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
`;

Vue.component('styles-dialog-container', {
    template: template,
    props: ['entity', 'entities'],
    data: () => ({
        dialog: false,
        featureType: null
    }),
    watch: {
        dialog: function(active) {
            if (active) {
                this.featureType = null;
                if (this.entity.billboard) {
                    this.featureType = 'billboard';
                }
                else if (this.entity.polygon) {
                    this.featureType = 'polygon';
                }
            }
        }
    },
    computed: {
        applicableEntities() {
            return this.entities.filter(e => e[this.featureType]);
        }
    },
    methods: {
        cancel: function () {
            this.dialog = false;
        },
        submit: function () {
        }
    }
});