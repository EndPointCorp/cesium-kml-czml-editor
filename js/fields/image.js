const template = `
<div class="text-left py-0 my-0">
    <v-row align="center">
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
        <v-btn v-bind="attrs"
        v-on="on" v-if="nativeHeight > height * 0.9" @click="resize" x-small class="mx-2 white--text" color="blue-grey">
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
        let w = null;
        let h = null;

        if (this.entity[this.feature]['width'] && this.entity[this.feature]['height']) {
            w = this.entity[this.feature]['width'].valueOf();
            h = this.entity[this.feature]['height'].valueOf();
        }

        let url = this.entity[this.feature][this.field].valueOf();
        if (url.url) {
            url = url.url;
        }

        return {
            imgUrl: url,
            width: w,
            height: h,
            nativeWidth: null,
            nativeHeight: null,
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
            this.dataUrl = true;
            this.$emit('input', dataUrl, this.field, this.feature, this.entity);
        },
        handleUpdate() {
            this.entity[this.feature][this.field] = dataUrl;
            this.dataUrl = /^data:/.test(this.imgUrl)
        },
        resize() {

        },
        updateSize(...args) {
            let w = this.entity[this.feature]['width'].valueOf();
            let h = this.entity[this.feature]['height'].valueOf();

            this.width = w;
            this.height = h;

            this.$emit('input', ...args);
        }
    }
});