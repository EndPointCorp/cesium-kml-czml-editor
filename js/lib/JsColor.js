const template = `
    <v-input class="color-input v-text-field"
        append-icon="mdi-close"
        @click:append="$emit('input', null);">

        <v-label>{{label}}</v-label>
        <span ref="color_span" class="color-preview" @click="showColorPicker">&nbsp;</span>
        <input :value="value"
            :id="id"
            :alphaChannel="alphaChannel"
            @change="onChange($event.target)"
            @input="onChange($event.target)"
            @focus="showColorPicker"
            ref="color_input"
            data-jscolor=""
        />
    </v-input>
`
Vue.component('jscolor',{
    template,
    data(){
        return {
            color: '',
            picker: null
        }
    },
    props: {
        value: String,
        removeButton: {
            default: true
        },
        label: String,
        alphaChannel: {
            default: 'true' // 'true', 'false', 'auto'
        },
        /**
        'auto' - automatically detect format from the initial color value and keep it in effect
        'any' - user can enter a color code in any supported format (and it will stay in that format until different one is used)
        'hex' - HEX color in standard CSS notation #RRGGBB
        'rgb' - RGB color in standard CSS notation rgb(r,g,b)
        'rgba' - RGBA color in standard CSS notation rgba(r,g,b,a
         */
        format: {
            default: 'any'
        },
        id: String
    },
    methods: {
        onChange(target){
            // this.color = target.jscolor.toHEXString();
            this.color = target.jscolor.channels;
            this.color.input = target;
            this.$refs.color_span.style.backgroundColor = this.color;

            let text = target.value;

            // Do not fire input and update while user enters values
            if (/\#[\dabcdef]{6}/ig.test(text) ||
                /rgb\s*\(\s*(\d{1,3})\,\s*(\d{1,3})\,\s*(\d{1,3})\s*\)/ig.test(text) ||
                /rgba\s*\(\s*(\d{1,3})\,\s*(\d{1,3})\,\s*(\d{1,3})\,\s*([\d\.]+)\s*\)/ig.test(text)) {
                this.$emit('input', this.color);
            }

            if (!text) {
                this.$emit('input', null);
            }
        },
        showColorPicker(){
            this.picker.show();
        }
    },
    mounted: function () {
        this.picker = new JSColor(this.$refs.color_input, {
            hash: true,
            format: 'any',
            value: this.value,
            valueElement: this.$refs.color_input,
            previewElement: this.$refs.color_span,
            onInput: () => {this.onChange(this.$refs.color_input);}
        });
    },
    updated: function () {
        this.$refs.color_span.style.backgroundColor = this.value;
    }
});
