import EditorFieldsBuilder from '../components-factory.js'

const Cartesian2Constructor = (x = 0, y = 0) => {return new Cesium.Cartesian2(x, y)};
const Cartesian3Constructor = (x = 0, y = 0, z = 0) => {return new Cesium.Cartesian3(x, y, z)};

const billboardEditorBuilder = new EditorFieldsBuilder('billboard', Cesium.BillboardGraphics);

billboardEditorBuilder.addComponentsField('pixelOffset', ['x', 'y'], Cartesian2Constructor);
billboardEditorBuilder.addComponentsField('eyeOffset', ['x', 'y', 'z'], Cartesian3Constructor);

billboardEditorBuilder.addComponentsField('alignedAxis', ['x', 'y', 'z'], Cartesian3Constructor);
billboardEditorBuilder.addDirectPropertyField('rotation');

billboardEditorBuilder.addEnumField('verticalOrigin', Cesium.VerticalOrigin);
billboardEditorBuilder.addEnumField('heightReference', Cesium.HeightReference);

billboardEditorBuilder.addDirectPropertyField('width');
billboardEditorBuilder.addDirectPropertyField('height');
billboardEditorBuilder.addDirectPropertyField('scale');

const billboardTemplate = billboardEditorBuilder.getTemplate((...templates) => {
    return `<div class="editor billboard-editor">
        <div class="editor-name">Billboard</div>
        <div v-if="iconSize">
            Icon image size: {{ iconSize && iconSize.width }}, {{ iconSize && iconSize.height }}
        </div>
        ${templates.join('\n')}
    </div>`
});

const methods = billboardEditorBuilder.addComponentMethods({
    updateIconImageSize(iconSize) {
        this.iconSize = iconSize;
    }
});

const initModel = billboardEditorBuilder.getInitFunction();

Vue.component('billboard-editor', {
    props: ['billboard'],
    data: () => {
        return {
            iconSize: {}
        };
    },
    template: billboardTemplate,
    methods: methods,
    created: function() {
        initModel(this.billboard, this);

        this.updateModelFields = ((billboard) => {

            if (billboard.image) {
                const self = this;
                const resource = billboard.image.valueOf();
                const i = new Image();
                i.onload = () => {
                    self.updateIconImageSize({
                        width: i.width,
                        height: i.height
                    });
                };
                i.src = resource.url;
            }
        }).bind(this);
        this.updateModelFields(this.billboard);
    },
    watch: {
        billboard: function(newVal) {
            this.updateModelFields && this.updateModelFields(newVal);
            initModel(newVal, this);
        }
    }
});