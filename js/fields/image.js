const template = `
<div class="text-left py-0 my-0">
    <v-img :src="imgUrl" :contain="true" :width="50" :height="50"></v-img>

    <v-btn small @click="$refs.uploadimg.click()" small class="mx-2 white--text" color="blue-grey">Upload new</v-btn>
    <input v-show="false" type="file" ref="uploadimg"
        class="input-file" accept=".png, .jpg, .jpeg, .bmp"
        @change="fileChangeEvent($event)"
    ></input>

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

    <div v-if="nativeWidth && nativeHeight">
        Image dimensions: {{nativeWidth}}, {{nativeHeight}}
        <div>
            Size of native image used for an icon is bigger than
            the icon displayed by Cesium. You can resize it down
            to reduce czml file size and speedup the loading.
        </div>
        <v-btn v-if="nativeHeight > height * 0.9" @click="resize" small class="mx-2 white--text" color="blue-grey">
            Resize
        </v-btn>
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
        let w = this.entity[this.feature]['width'].valueOf();
        let h = this.entity[this.feature]['height'].valueOf();

        let url = this.entity[this.feature][this.field].valueOf().url;

        return {
            imgUrl: url,
            dataUrl: /^data:/.test(url),
            componentW: Math.min(50, w),
            componentH: Math.min(50, h),
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
        },
        resize() {

        },
        updateSize(...args) {
            let w = this.entity[this.feature]['width'].valueOf();
            let h = this.entity[this.feature]['height'].valueOf();

            this.componentW = Math.min(50, w);
            this.componentH = Math.min(50, h);
            this.width = w;
            this.height = h;

            this.$emit('input', ...args);
        }
    }
});