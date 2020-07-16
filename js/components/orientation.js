const template = `
<v-row class="px-4" v-if="entity.position">
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
                if (this.entity.orientation) {
                    return globalOrientationQuaternionToLocalHPR(
                        this.entity.position.getValue(),
                        this.entity.orientation.getValue()
                    );
                }
                return null;
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
                if (this.hpr) {
                    return Math.round(Cesium.Math.toDegrees(this.hpr.heading));
                }
                return null;
            },
            set: function(heading) {
                this.hpr = Cesium.HeadingPitchRoll.fromDegrees(heading, this.pitch, this.roll);
            }
        },
        pitch: {
            get: function() {
                if (this.hpr) {
                    return Math.round(Cesium.Math.toDegrees(this.hpr.pitch));
                }
                return null;
            },
            set: function(pitch) {
                this.hpr = Cesium.HeadingPitchRoll.fromDegrees(this.heading, pitch, this.roll);
            }
        },
        roll: {
            get: function() {
                if (this.hpr) {
                    return Math.round(Cesium.Math.toDegrees(this.hpr.roll));
                }
                return null;
            },
            set: function(roll) {
                this.hpr = Cesium.HeadingPitchRoll.fromDegrees(this.heading, this.pitch, roll);
            }
        }
    }
});