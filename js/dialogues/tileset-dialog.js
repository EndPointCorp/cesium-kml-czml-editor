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
                :readonly="isDirectJson"
                @input="validateForm"
                label="Ion resource"></v-text-field></span>
            </div>

            <div class="tr">
                <span><v-text-field
                hide-details
                v-model="key"
                id="key"
                @input="validateForm"
                :readonly="isDirectJson"
                label="Ion key"></v-text-field></span>
            </div>

            <br/>
            <br/>

            OR


            <div class="tr">
                <span><v-text-field
                hide-details
                v-model="url"
                id="url"
                @input="validateForm"
                :readonly="isIonResource"
                label="Tileset json URL"></v-text-field></span>
            </div>

            <br/>
            <br/>

            TILESETS

            <v-row>
                <template v-for="(item,index) in tilesList">
                    <v-col cols="8">
                        {{ item.url || item.resource }}
                    </v-col>
                    <v-col cols="4">
                        <v-btn @click="deleteTile(index)">Delete</v-btn>
                    </v-col>
                </template>
            </v-row>
            <br/>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
            <v-checkbox dense v-model="addToEntities"
                :readonly="isIonResource"
                label="Add to CZML entities">
            </v-checkbox>
            <v-spacer></v-spacer>
            <v-btn @click="submit">Submit</v-btn>
            <v-btn @click="cancel">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
`;

Vue.component('tileset-dialog-container', {
    template: template,
    data: function () {
        return {
            resource: null,
            key: null,
            url: null,
            dialog: false,
            tilesList: [],
            addToEntities: false,
            isIonResource: false,
            isDirectJson: false
        }
    },
    methods: {
        cancel: function () {
            this.dialog = false;
        },
        submit: function () {
            let urlPromise = Promise.resolve(this.url);
            if (!this.url && this.resource) {
                urlPromise = Cesium.IonResource.fromAssetId(this.resource, {
                    accessToken: this.key
                });
            }

            urlPromise.then((url) => {
                let tileset = new Cesium.Cesium3DTileset({
                    url: url
                });

                this.tilesList.push({
                    resource: this.resource,
                    key: this.key,
                    url: this.url,
                    asCZML: this.addToEntities
                });

                this.$emit('addtileset', tileset, this.addToEntities);

                this.dialog = false;
                this.resource = null;
                this.key = null;
                this.url = null;
            });
        },
        addTile: function() {
            this.tilesList = [...this.tilesList, {url: null}]
        },
        deleteTile: function(index) {
            let deleted = this.tilesList.splice(index, 1)[0];
            this.$emit('deletetileset', deleted);
        },
        validateForm: function() {
            if (this.key || this.resource) {
                this.addToEntities = false;
                this.url = null;
            }
            else if (this.url) {
                this.key = null;
                this.resource = null;
            }

            this.isIonResource = !!(this.resource || this.key);
            this.isDirectJson = !!this.url;

        }
    }
});