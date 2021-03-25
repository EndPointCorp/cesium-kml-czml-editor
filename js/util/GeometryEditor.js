
const WHITE_CIRCLE = "data:image/png;base64,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";

const CONTROL_POINT_BILLBOARD_OPTIONS = {
    image: WHITE_CIRCLE,
    width: 32,
    height: 32,
    scale: 0.4,
    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    disableDepthTestDistance: 1000000,
    color: Cesium.Color.ORANGERED
};

export default class GeometryEditor {
    constructor(viewer) {
        this.viewer = viewer;

        // Static custom DatataSorce, to add it only once
        if(!GeometryEditor.controlPointsDisplay) {
            GeometryEditor.controlPointsDisplay =
                new Cesium.CustomDataSource('geometry-control-points');
            viewer.dataSources.add(GeometryEditor.controlPointsDisplay);
        }

        this.controlPoints = [];

        this._createScreenSpaceEventHandler();
    }

    newEntity(type) {
        this.type = type;
        this._setTypeOptions();

        this.entity = new Cesium.Entity({
            [ this.type ]: {
                [this.entityGeometryProperty]: new Cesium.CallbackProperty(this._geometryCallback.bind(this), false),
                ...this.entityOptions
            }
        });

        return this.entity;
    }

    editEntity(type, entity) {
        this.type = type;
        this._setTypeOptions();

        this.entity = entity;
        this._oldGeometry = this.entity[this.type][this.entityGeometryProperty].getValue();
        this._geometryAsControlPoints();

        this.entity[this.type][this.entityGeometryProperty] = new Cesium.CallbackProperty(this._geometryCallback.bind(this), false);

        return this.entity;
    }

    _geometryAsControlPoints() {
        if (this.type === 'polyline') {
            const positions = this.entity[this.type][this.entityGeometryProperty].getValue();
            positions.forEach(position => {
                this._addControlPoint(position);
            });
        }
        else if (this.type === 'polygon') {
            const hierarchy = this.entity[this.type][this.entityGeometryProperty].getValue();
            hierarchy.positions.forEach(position => {
                this._addControlPoint(position);
            });
        }
    }

    _geometryCallback() {
        if (this.type === 'polyline') {
            return this.controlPoints.map(cp => cp.position.getValue());
        }
        if (this.type === 'polygon') {
            return new Cesium.PolygonHierarchy(this.controlPoints.map(cp => cp.position.getValue()));
        }
    }

    save() {
        // Apply changes to entity
        this.entity[this.type][this.entityGeometryProperty] = new Cesium.ConstantProperty(this._geometryCallback());

        this.reset();
    }

    cancel() {
        this.reset();
    }

    disableDefaultControls() {
        this.viewer.scene.screenSpaceCameraController.enableInputs = false;
    }

    enableDefaultControls() {
        this.viewer.scene.screenSpaceCameraController.enableInputs = true;
    }

    reset() {
        this.entity = null;
        this.type = null;
        this.oldGeometry = null;
        this._activeControlPoint = null;
        this.entityGeometryProperty = null;
        GeometryEditor.controlPointsDisplay.entities.removeAll();
        this.controlPoints = [];
    }

    destroy() {
        if (this.screenSpaceEventHandler) {
            this.screenSpaceEventHandler.destroy();
        }
    }

    _setTypeOptions() {
        if (this.type === 'polyline') {
            this.entityGeometryProperty = 'positions';

            this.entityOptions = {
                clampToGround: true,
                width: 3,
                material: Cesium.Color.SALMON,
            };
        }
        else if (this.type === 'polygon') {
            this.entityGeometryProperty = 'hierarchy';

            this.entityOptions = {
                material: Cesium.Color.SALMON.withAlpha(0.3),
                outline: true,
                outlineColor: Cesium.Color.SALMON,
                outlineWidth: 2,
            };
        }
    }

    _mouseClick(e) {
        let ent = this.viewer.scene.pick(e.position);
        let position = this.viewer.scene.pickPosition(e.position);

        if (this.entity) {
            // CP drag is handled by this.screenSpaceEventHandler
            if (ent && this.controlPoints.indexOf(ent.id) >= 0) {
                return;
            }

            if (position) {
                this._addControlPoint(position);
            }
            return;
        }
    }

    _addControlPoint(position) {
        const cpEntity = new Cesium.Entity({
            position: position,
            billboard: CONTROL_POINT_BILLBOARD_OPTIONS
        });

        this.controlPoints.push(cpEntity);
        GeometryEditor.controlPointsDisplay.entities.add(cpEntity);
    }

    _mouseMove(e) {
        if (this._mouseDownPosition && this._activeControlPoint) {
            let pc = this.viewer.camera.pickEllipsoid(e.endPosition, this.viewer.scene.globe.ellipsoid);
            let mousePosition = Cesium.Cartographic.fromCartesian(pc);

            let deltaLat = mousePosition.latitude - this._mouseDownPosition.latitude;
            let deltaLon = mousePosition.longitude - this._mouseDownPosition.longitude;

            let entityNewPosition = new Cesium.Cartographic(
                this._mouseDownEntityPosition.longitude + deltaLon,
                this._mouseDownEntityPosition.latitude + deltaLat,
                this._mouseDownEntityPosition.height
            );

            this._activeControlPoint.position = Cesium.Cartographic.toCartesian(entityNewPosition);
        }
    }

    _mouseDown(e) {
        const pick = this.viewer.scene.pick(e.position);

        if (this.controlPoints && pick && this.controlPoints.includes(pick.id)) {
            this.disableDefaultControls();
            this._activeControlPoint = pick.id;
            // Use pick ellipsoid viewer.scene.pickPosition(e.position) returns null if we click on entity
            let pc = this.viewer.camera.pickEllipsoid(e.position, this.viewer.scene.globe.ellipsoid);
            this._mouseDownPosition = Cesium.Cartographic.fromCartesian(pc);
            this._mouseDownEntityPosition = Cesium.Cartographic.fromCartesian(pick.id.position.getValue());
        }
    }

    _mouseUp() {
        this._mouseDownPosition = null;
        this._mouseDownEntityPosition = null;
        this.enableDefaultControls();
    }

    _createScreenSpaceEventHandler() {
        this.screenSpaceEventHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);

        this.screenSpaceEventHandler.setInputAction(
            this._mouseDown.bind(this),
            Cesium.ScreenSpaceEventType.LEFT_DOWN);
        this.screenSpaceEventHandler.setInputAction(
            this._mouseMove.bind(this),
            Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        this.screenSpaceEventHandler.setInputAction(
            this._mouseUp.bind(this),
            Cesium.ScreenSpaceEventType.LEFT_UP);
        this.screenSpaceEventHandler.setInputAction(
            this._mouseClick.bind(this),
            Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }
}