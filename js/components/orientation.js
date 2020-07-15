const template = `
    <v-row class="px-4">
    <v-col cols="4">
        <v-text-field
            v-model="heading"
            type="number"
            label="Heading"
        ></v-text-field>
        </v-col>
        <v-col cols="4">
        <v-text-field
            v-model="pitch"
            type="number"
            label="Pitch"
        ></v-text-field>
        </v-col>
        <v-col cols="4">
        <v-text-field
            v-model="roll"
            type="number"
            label="Roll"
        ></v-text-field>
        </v-col>
    </v-row>
`;

export function localHPRToGlobalOrientationQuaternion(position, hpr) {
    return Cesium.Transforms.headingPitchRollQuaternion(position, hpr);
}

export function globalOrientationQuaternionToLocalHPR(position, orientation) {
    let orientationAbs = Cesium.Matrix3.fromQuaternion(orientation, new Cesium.Matrix3());

    let transform = Cesium.Matrix4.fromRotationTranslation(
        orientationAbs,
        position,
        new Cesium.Matrix4());

    return Cesium.Transforms.fixedFrameToHeadingPitchRoll(transform);
}

Vue.component('orientation-editor', {
    template,
    props: ['entity'],
    computed: {
        hpr: {
            get: function() {
                return globalOrientationQuaternionToLocalHPR(
                    this.entity.position.getValue(),
                    this.entity.orientation.getValue()
                );
            },
            set: function(newVal) {
                let orientationQ = localHPRToGlobalOrientationQuaternion(
                    this.entity.position.getValue(),
                    newVal
                );
                this.entity.orientation = orientationQ;
            }
        },
        heading: {
            get: function() {
                return Math.round(Cesium.Math.toDegrees(this.hpr.heading));
            },
            set: function(heading) {
                this.hpr = Cesium.HeadingPitchRoll.fromDegrees(heading, this.pitch, this.roll);
            }
        },
        pitch: {
            get: function() {
                return Math.round(Cesium.Math.toDegrees(this.hpr.pitch));
            },
            set: function(pitch) {
                this.hpr = Cesium.HeadingPitchRoll.fromDegrees(this.heading, pitch, this.roll);
            }
        },
        roll: {
            get: function() {
                return Math.round(Cesium.Math.toDegrees(this.hpr.roll));
            },
            set: function(roll) {
                this.hpr = Cesium.HeadingPitchRoll.fromDegrees(this.heading, this.pitch, roll);
            }
        }
    },
    created: function() {
        var hpr = Cesium.HeadingPitchRoll.fromDegrees(45, 0, 0);
        this.entity.orientation = Cesium.Transforms.headingPitchRollQuaternion(this.entity.position.getValue(), hpr);
    }
});