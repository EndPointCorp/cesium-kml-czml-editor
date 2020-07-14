import './position.js'

function round(value, step = 1.0) {
    const inv = 1.0 / step;
    return Math.round(value * inv) / inv;
}

export function getLonLatHeight(entity) {
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
<div>
    <v-row v-if="entity && position">
        <v-col class="py-0 my-0" cols="12">
            <h4>Position</h4>
        </v-col>

        <v-col class="py-0 my-0" cols="4">
        Latitude
        </v-col>

        <v-col class="py-0 my-0" cols="4">
        Longitude
        </v-col>

        <v-col class="py-0 my-0" cols="4">
        Altitude
        </v-col>

        <v-col class="py-0 my-0" cols="4">
        {{ round(position.latitude, 0.0001) }}
        </v-col>

        <v-col class="py-0 my-0" cols="4">
        {{ round(position.longitude, 0.0001) }}
        </v-col>

        <v-col class="py-0 my-0" cols="4">
        <v-text-field
            dense
            hide-details
            :value="round(position.height)"
            v-on:input="updateAltitude">
        </v-text-field>
        </v-col>
    </v-row>
    <v-row v-if="entity">
        <position-editor :entity="entity"></position-editor>
    </v-row>
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