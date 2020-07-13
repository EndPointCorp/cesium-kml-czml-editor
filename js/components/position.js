const template = `
<span>
  Move <v-switch v-model="active"></v-switch>
</span>
`;

const hprNorth = new Cesium.HeadingPitchRoll(0, -Math.PI / 2, -Math.PI / 2);
const hprEast = new Cesium.HeadingPitchRoll(0, -Math.PI / 2, 0);

function disableDefaultControls() {
    viewer.scene.screenSpaceCameraController.enableInputs = false;
}

function enableDefaultControls() {
    viewer.scene.screenSpaceCameraController.enableInputs = true;
}

var screenSpaceEventHandler = null;

var mouseDownPosition = null;
var mouseDownEntityPosition = null;
var controller = null;

function mouseMove(movement) {
    if (mouseDownPosition && mouseDownEntityPosition && controller) {
        let pc = viewer.camera.pickEllipsoid(movement.endPosition, viewer.scene.globe.ellipsoid);
        let mousePosition = Cesium.Cartographic.fromCartesian(pc);

        let deltaLat = mousePosition.latitude - mouseDownPosition.latitude;
        let deltaLon = mousePosition.longitude - mouseDownPosition.longitude;

        let entityNewPosition = new Cesium.Cartographic(
            mouseDownEntityPosition.longitude + deltaLon,
            mouseDownEntityPosition.latitude + deltaLat,
            mouseDownEntityPosition.height
        );

        controller.newPosition(entityNewPosition);
    }
}

function mouseDown(e) {
    let pick = viewer.scene.pick(e.position)

    if (controller && pick && controller.pick(pick)) {
        disableDefaultControls();
        let cartesian = viewer.camera.pickEllipsoid(e.position, viewer.scene.globe.ellipsoid);
        mouseDownPosition = Cesium.Cartographic.fromCartesian(cartesian);
        mouseDownEntityPosition = controller.getEntityPosition(pick);
    }
}

function bindScreenSpaceEvents(viewer) {

    if (!screenSpaceEventHandler) {
        screenSpaceEventHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        screenSpaceEventHandler.setInputAction(mouseMove, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        screenSpaceEventHandler.setInputAction(mouseDown, Cesium.ScreenSpaceEventType.LEFT_DOWN);

        screenSpaceEventHandler.setInputAction((e) => {
            mouseDownPosition = null;
            controller && controller.mouseUp && controller.mouseUp();
            enableDefaultControls();
        }, Cesium.ScreenSpaceEventType.LEFT_UP);
    }
}

function attachController(entity, onUpdate) {
    controller = {
        active: false,
        entity: entity,
        initialPosition: Cesium.Cartographic.fromCartesian(entity.position.getValue()),
        pick: function(pick) {
            if (this.active) {
                return pick.id == entity;
            }
        },
        getEntityPosition: function() {
            return this.initialPosition;
        },
        newPosition: function(newPosition) {
            entity.position = Cesium.Cartographic.toCartesian(newPosition);
            onUpdate && onUpdate();
        }
    }

    return controller;
}

Vue.component('position-editor', {
    template,
    props: ['entity'],
    data: () => ({
        active: false,
        controller: null
    }),
    methods: {
        onInput() {

        }
    },
    watch: {
        entity: function(newEntity) {
            this.active = false;
            this.controller = attachController(newEntity);
        },
        active: function(active) {
            this.controller.active = active;
        }
    },
    created: function() {
        bindScreenSpaceEvents(viewer);
        this.controller = attachController(this.entity, this.onInput)
    }
});


// let position = this.entity.position.getValue();
// var modelMatrixNorth = Cesium.Transforms.headingPitchRollToFixedFrame(position, hprNorth);

// this.arrowNorth = viewer.scene.primitives.add(Cesium.Model.fromGltf({
//     url : 'assets/arrow.glb',
//     modelMatrix : modelMatrixNorth,
//     color: Cesium.Color.RED,
//     shadows: Cesium.ShadowMode.DISABLED,
//     colorBlendMode: Cesium.ColorBlendMode.REPLACE,
//     scale : 10.0
// }));

// var modelMatrixEast = Cesium.Transforms.headingPitchRollToFixedFrame(position, hprEast);
// this.arrowEast = viewer.scene.primitives.add(Cesium.Model.fromGltf({
//     url : 'assets/arrow.glb',
//     modelMatrix : modelMatrixEast,
//     color: Cesium.Color.BLUE,
//     shadows: Cesium.ShadowMode.DISABLED,
//     colorBlendMode: Cesium.ColorBlendMode.REPLACE,
//     scale : 10.0
// }));