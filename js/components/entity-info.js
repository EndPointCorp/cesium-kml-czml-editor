function round(value, step = 1.0) {
    const inv = 1.0 / step;
    return Math.round(value * inv) / inv;
}

function getLonLatHeight(entity) {
    if (entity.position) {
        const cartographic = Cesium.Cartographic.fromCartesian(entity.position.getValue());

        return {
            latitude: Cesium.Math.toDegrees(cartographic.latitude),
            longitude: Cesium.Math.toDegrees(cartographic.longitude),
            height: cartographic.height
        }
    }

    return null;
}

const template = `
    <div v-if="entity && position">
        <h4>Position</h4>
        <div>
            Latitude: {{ round(position.latitude, 0.0001) }}
            Longitude: {{ round(position.longitude, 0.0001) }}
        </div><div>
            Altitude: <input :value="round(position.height)"
                         v-on:input="updateAltitude($event.target.value)"></input>
        </div>
    </div>
`;

Vue.component('entity-info', {
    props: ['entity'],
    template: template,
    data: () => ({
        position: null
    }),
    created: function() {
        this.position = this.entity
            && this.entity.position
            && getLonLatHeight(this.entity);
    },
    watch: {
        entity: function(entity) {
            this.position = entity
                && entity.position
                && getLonLatHeight(entity);
        }
    },
    methods: {
        round,
        updateAltitude: function(altitude) {
            let c = Cesium.Cartographic.fromCartesian(this.entity.position.getValue());
            c.height = parseFloat(altitude) || 0.0;
            this.entity.position = Cesium.Cartographic.toCartesian(c);
        }
    }
});