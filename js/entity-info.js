function round(value, step = 1.0) {
    const inv = 1.0 / step;
    return Math.round(value * inv) / inv;
}

function getLonLatHeight(entity) {
    const cartographic = Cesium.Cartographic.fromCartesian(entity.position.getValue());

    return {
        latitude: Cesium.Math.toDegrees(cartographic.latitude),
        longitude: Cesium.Math.toDegrees(cartographic.longitude),
        height: cartographic.height
    }
}

const template = `
    <div v-if="entity">
        <h4>Position</h4>
        Latitude: {{ round(position.latitude, 0.0001) }}
        Longitude: {{ round(position.longitude, 0.0001) }}
        Altitude: {{ round(position.height) }}
    </div>
`;

Vue.component('entity-info', {
    props: ['entity'],
    template: template,
    data: {
        position: null
    },
    created: function() {
        this.position = this.entity && getLonLatHeight(this.entity);
    },
    watch: {
        entity: function(entity) {
            this.position = entity && getLonLatHeight(entity);
        }
    },
    methods: {
        round
    }
});