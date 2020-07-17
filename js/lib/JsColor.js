const template = `
    <div class="input-control color-input">
        <input :value="value"
               :id="id"
               class="{hash:true,styleElement:'',onFineChange:'jsColorOnFineChange(this)'}"
               @change="onChange($event.target)"
               @input="onChange($event.target)"
               @focus="showColorPicker"
               @onFineChange="onFineChange"
               ref="color_input"
               maxlength="7"
               data-jscolor=""
        />
        <span class="color-value" ref="color_span" @click="showColorPicker"></span>
    </div>
`
Vue.component('jscolor',{
    template,
    data(){
        return {
            color: ''
        }
    },
    props: [
        'value',
        'id'
    ],
    methods: {
        onChange(target){
            // this.color = target.jscolor.toHEXString();
            this.color = target.jscolor.channels;
            this.$refs.color_span.style.backgroundColor = this.color;
            this.$emit('input', this.color);
        },
        onFineChange(e){
            this.color = '#' + e.detail.jscolor;
            this.$refs.color_span.style.backgroundColor = this.color;
            this.$emit('input', this.color);
        },
        showColorPicker(){
            this.$refs.color_input.jscolor.show();
        }
    },
    mounted: function () {
        window.jscolor.install()
    },
    updated: function () {
        this.$refs.color_span.style.backgroundColor = this.value;
    }
});

window.jsColorOnFineChange = function(thisObj){
    thisObj.valueElement.dispatchEvent(new CustomEvent("onFineChange", {detail: {jscolor: thisObj}}));
}
