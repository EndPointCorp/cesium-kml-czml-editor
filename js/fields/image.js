const template = `
<div class="text-left py-0 my-0">
    <v-row align="center" class="my-1">
    <v-col cols="3" d-flex>
        <v-img :src="imgUrl" :contain="true" :width="50" :height="50"></v-img>
    </v-col>
    <v-col cols="6">
        <v-btn small @click="$refs.uploadimg.click()" small class="mx-2 white--text" color="blue-grey">Upload new</v-btn>
        <input v-show="false" type="file" ref="uploadimg"
            class="input-file" accept=".png, .jpg, .jpeg, .bmp"
            @change="fileChangeEvent($event)"
        ></input>
        </v-col>
    </v-row>
    <div v-if="referenceId">
        This field is a reference of billboard image of another Entity.
        <v-btn small class="mx-2 white--text" color="blue-grey" @click="findReferenced">
            Select Reference Entity
        </v-btn>
    </div>
    <div v-if="!dataUrl">
        <v-text-field
            dense
            hide-details
            class="direct-property-field"
            @input="handleUpdate"
            v-model="imgUrl"
            :label="'URL'">
        </v-text-field>
    </div>

    <div v-if="nativeWidth && nativeHeight" class="mb-2" style="margin-top: 5px;">
        Image dimensions: {{nativeWidth}}, {{nativeHeight}}

        <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
                <v-btn
                    v-bind="attrs"
                    v-on="on"
                    v-show="isImageOversized"
                    @click="resize"
                    x-small
                    class="mx-2 white--text"
                    color="blue-grey"
                >
                    Resize
                </v-btn>
            </template>
            <span>Size of native image used for an icon is bigger than<br>
            the icon displayed by Cesium. You can resize it down<br>
            to reduce czml file size and speedup the loading.</span>
        </v-tooltip>
    </div>

    <v-row>
        <v-col cols="6">
            <direct-field
                @input="updateSize"
                :entity="entity"
                :feature="'billboard'"
                :field="'width'"
                :label="'Width'">
            </direct-field>
        </v-col>
        <v-col cols="6">
            <direct-field
                @input="updateSize"
                :entity="entity"
                :feature="'billboard'"
                :field="'height'"
                :label="'Height'">
            </direct-field>
        </v-col>
    </v-row>

</div>`;

Vue.component('image-field', {
    props: ['entity', 'feature', 'field'],
    data: function() {
        let referenceId = null;
        let url = this.entity[this.feature][this.field].valueOf();
        if (url instanceof Cesium.ReferenceProperty) {
            referenceId = url.targetId;
            url = url.resolvedProperty.valueOf();
        }
        if (url.url) {
            url = url.url;
        }
        if (url instanceof HTMLCanvasElement) {
            url = url.toDataURL();
        }

        return {
            imgUrl: url,
            nativeWidth: null,
            nativeHeight: null,
            referenceId: referenceId
        }
    },
    template: template,
    created: function() {
        this.updateImageOriginalSize(this.imgUrl);
    },
    watch: {
        imgUrl: function(newVal) {
            this.updateImageOriginalSize(newVal);
        }
    },
    computed: {
        dataUrl: function() {
            return /^data:/.test(this.imgUrl);
        },
        isImageOversized: function() {
            const oversizedHeight = Math.round(this.nativeHeight * 0.9) > Math.round(this.height);
            const oversizedWidth = Math.round(this.nativeWidth * 0.9) > Math.round(this.width);
            return oversizedHeight || oversizedWidth;
        },
        width: function() {
            if (this.entity[this.feature]['width']) {
                return  this.entity[this.feature]['width'].valueOf();
            }
            return null;
        },
        height: function() {
            if (this.entity[this.feature]['height']) {
                return this.entity[this.feature]['height'].valueOf();
            }
            return null;
        }
    },
    methods: {
        updateImageOriginalSize(url) {
            const self = this;
            const i = new Image();
            i.onload = () => {
                self.nativeWidth = i.width;
                self.nativeHeight = i.height;
            };
            i.src = url;
        },
        findReferenced() {
            let ent = viewer.entities.getById(this.referenceId);
            if (!ent) {
                for (let i = 0; i < viewer.dataSources.length; i++) {
                    ent = viewer.dataSources.get(i).entities.getById(this.referenceId);
                    if (ent) {
                        break;
                    }
                }
            }
            if (ent) {
                viewer.selectedEntity = ent;
            }
        },
        fileChangeEvent(evnt) {
            const self = this;

            let reader = new FileReader();
            reader.onload = (e) => {
                self.upload(e.target.result);
            };
            reader.readAsDataURL(evnt.target.files[0]);
        },
        upload(dataUrl) {
            this.entity[this.feature][this.field] = dataUrl;
            this.imgUrl = dataUrl;
            this.$emit('input', dataUrl, this.field, this.feature, this.entity);
        },
        handleUpdate() {
            this.entity[this.feature][this.field] = dataUrl;
        },
        resize() {
            const targetWidth = this.width;
            const targeHeight = this.height;

            const i = new Image();
            i.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = targetWidth;
                canvas.height = targeHeight;

                const ctx = canvas.getContext('2d');

                ctx.drawImage(i, 0, 0, targetWidth, targeHeight);

                this.imgUrl = canvas.toDataURL();
                this.entity[this.feature][this.field] = this.imgUrl;
            };
            i.src = this.imgUrl;
        },
        updateSize(...args) {
            this.$emit('input', ...args);
        }
    }
});