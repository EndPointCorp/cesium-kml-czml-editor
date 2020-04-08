const template = `
    <div id="dialog-container">
        <div class="dialog">

            <h4>Add tile set</h4>

            <div class="tr">
                <label for="resource">Ion resource</label>
                <span><input v-model="resource" id="resource"></input></span>
            </div>

            <div class="tr">
                <label for="key">Ion key</label>
                <span><input v-model="key" id="key"></input></span>
            </div>

            <div class="tr">
                <label for="url">Tileset json URL</label>
                <span><input v-model="url" id="url"></input></span>
            </div>
            <div class="controls">
                <button @click="submit">Submit</button>
                <button @click="cancel">Cancel</button>
            </div>
        </div>
    </div>
`;

export default function request3DTilesetDialog(callback) {
    let dialog = new Vue({
        el: '#dialog-container',
        template: template,
        data: {
            resource: null,
            key: null,
            url: null
        },
        methods: {
            cancel: function() {
                document.getElementById('dialog-container').classList.remove('active');
                dialog = null;

                callback(null);
            },
            submit: function() {
                let url = this.url;
                if (!url && this.resource) {
                    url = Cesium.IonResource.fromAssetId(this.resource, {
                        accessToken: this.key
                    });
                }

                if (!url) {
                    return;
                }

                document.getElementById('dialog-container').classList.remove('active');
                dialog = null;

                callback(new Cesium.Cesium3DTileset({
                    url : url
                }));
            }
        }
    });

    document.getElementById('dialog-container').classList.add('active');
}