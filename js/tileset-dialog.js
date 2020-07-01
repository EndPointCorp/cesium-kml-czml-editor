const template = `
    <v-dialog
      v-model="dialog"
      width="600"
      persistent
    >
      <template v-slot:activator="{ on, attrs }">
        <v-btn
            small
            class="mt-1"
            id="add-tileset"
            v-bind="attrs"
            v-on="on"
        >
        Add 3D Tile set
        </v-btn>
      </template>

      <v-card>
        <v-card-title
          class="headline grey lighten-2"
          primary-title
        >
        Add Tile Set
        </v-card-title>

        <v-card-text>
            <div class="tr">
                <span><v-text-field
                hide-details 
                v-model="resource"
                id="resource"
                label="Ion resource"></v-text-field></span>
            </div>

            <div class="tr">
                <span><v-text-field
                hide-details
                v-model="key"
                id="key"
                label="Ion key"></v-text-field></span>
            </div>

            <div class="tr">
                <label for="url"></label>
                <span><v-text-field
                hide-details
                v-model="url"
                id="url"
                label="Tileset json URL"></v-text-field></span>
            </div>  
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="submit">Submit</v-btn>
          <v-btn @click="cancel">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
`;

Vue.component('dialog-container', {
    template: template,
    data: function () {
        return {
            resource: null,
            key: null,
            url: null,
            dialog: false
        }
    },
    methods: {
        cancel: function () {
            this.dialog = false;
        },
        submit: function () {
            let url = this.url;
            if (!url && this.resource) {
                url = Cesium.IonResource.fromAssetId(this.resource, {
                    accessToken: this.key
                });
            }

            if (!url) {
                return;
            }

            this.dialog = false;

            new Cesium.Cesium3DTileset({
                url: this.url
            });
        }
    }
});