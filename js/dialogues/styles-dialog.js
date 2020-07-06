const template = `
    <v-dialog
      v-model="dialog"
      width="600"
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

        <v-card-text>
            Apply to:
        </v-card-text>
        <template v-for="(entity, index) in applicableEntities">
            <v-row>
                <v-col cols="4">
                    <v-checkbox></v-checkbox>
                </v-col>
                <v-col cols="8">
                    {{ entity.name }}
                </v-col>
            </v-row>
        </template>

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