const template = `
    <div class="input-control color-input">
        <input :value="value"
               :id="id"
               class="{hash:true, format='any' styleElement:'', onFineChange:'jsColorOnFineChange(this)'}"
               @change="onChange($event.target)"
               @input="onChange($event.target)"
               @focus="showColorPicker"
               @onFineChange="onFineChange"
               ref="color_input"
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
