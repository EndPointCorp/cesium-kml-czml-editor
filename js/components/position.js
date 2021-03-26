const template = `
<v-row>
    <v-col cols="6" class="pb-0 mt-2 ml-3">Alow drag to move</v-col>
    <v-col cols="4" class="pt-0 pb-0"><v-switch v-model="active"></v-switch></v-col>
</v-row>
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

        controller.newPosition(entityNewPosition, deltaLon, deltaLat);
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

function createController(entity, getter, setter, onUpdate) {
    controller = {
        active: false,
        entity: entity,
        initialPosition: Cesium.Cartographic.fromCartesian(getter(entity)),
        pick: function(pick) {
            if (this.active) {
                return pick.id == entity;
            }
        },
        getEntityPosition: function() {
            return this.initialPosition;
        },
        newPosition: function(newPosition, ...lonlat) {
            setter(Cesium.Cartographic.toCartesian(newPosition), newPosition, ...lonlat);
            onUpdate && onUpdate();
        }
    }

    return controller;
}

function attachController(entity, onUpdate) {
    let getter, setter;

    // Billboards, Labels, Models should have position
    if (entity.position) {
        getter = () => {
            return entity.position.getValue();
        };
        setter = positionC3 => {
            entity.position = positionC3;
        };
    }
    else if (entity.polygon) {
        const hierarchy = entity.polygon.hierarchy.getValue();

        getter = () => {
            return entity.polygon.hierarchy.getValue().positions[0];
        };
        setter = (pc3, p, deltaLon, deltaLat) => {
            entity.polygon.hierarchy.setValue(moveHierarchy(hierarchy, deltaLon, deltaLat));
        };
    }
    else if(entity.polyline) {
        const positions = entity.polyline.positions.getValue().map(toCartographic);
        getter = () => {
            return entity.polyline.positions.getValue()[0];
        };
        setter = (pc3, p, deltaLon, deltaLat) => {
            entity.polyline.positions = positions
                .map(p => offsetCartographic(p, deltaLon, deltaLat))
                .map(toCartesian);
        };
    }
    else {
        return {};
    }

    return createController(entity, getter, setter, onUpdate);
}

function toCartographic(p) {
    return Cesium.Cartographic.fromCartesian(p);
}

function toCartesian(p) {
    return Cesium.Cartographic.toCartesian(p);
}

function offsetCartographic(p, deltaLon, deltaLat) {
    return new Cesium.Cartographic(p.longitude + deltaLon, p.latitude + deltaLat, p.height);
}

function moveHierarchy(h, deltaLon, deltaLat) {
    let newPositions = h.positions
        .map(toCartographic)
        .map(p => offsetCartographic(p, deltaLon, deltaLat))
        .map(toCartesian);

    let newHoles = null;
    if (h.holes) {
        newHoles = h.holes.map(hh => moveHierarchy(hh, deltaLon, deltaLat));
    }

    return new Cesium.PolygonHierarchy(newPositions, newHoles);
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
            this.controller = attachController(newEntity, this.onInput);
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