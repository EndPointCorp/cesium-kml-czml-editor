
const WHITE_CIRCLE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAC4jAAAuIw" +
"F4pT92AAAF90lEQVR4Xu2bS4/jRBSFb/N+jEDADAjEIgKJYcWS/79mOStAAmUxAgHdIJB4gxp/qTrJrfJ1bCf2tJ3hSDV2exK7zrmPKtetmD3" +
"luKovzI3b29v79bUaV1dX1/W1uTCrAI7sW+5yrwANvAA3/DOXKJMLUJHWuY6vNe3NfH4MPzbtl3wu4hwnF2MyATJxWZpzmgi/n6+/2rTX8zl4" +
"2Z3/7s5/btqv+fyxHQSBuMjfTCHEc/WFsQgsTttYIi3CEEWMl/I18EI+evyVj5D/wxLp9+wgCGJsLYvQPHv34XOEOEsAZ/WaOJ1+xw6EIcuR57"+
"1iyfOetTb+bRqsfmvaP5ZII4oE4b7c3wtxjRCninByCDQPfWjdxBEF0lgf4pB90dLznrd+/G1JiD8tiYIAeAFikAe+a9o3VgnRiPAFXx6D0R5" +
"QWf2Dpn1iJfE3LN1XLj+EcA19R2GCiNyPkOD+PIfnySMe8aEcEqNywygBHPmP7WD1D5v2tqWOYfFziHeBe9G4L6FAvxGHv5VISbbbpn0+JiQG" +
"CxCQJwQ+ytce2DzEa3gheJ5CjHMlVzBYhEECBOQ/teSC71rqBAJEWX0uSAjyCtCz/RA7SIReAXrIE4MoP6fVjwHihJ+3Pv0TekXoFcCWS17g+" +
"fSD/giFCFZOrQscFcANdRtLMe/J37Oe7z9BIAL98SLQX6B5QjhEdhLIrq+hjmxPwvOW7/zuHYH+1J7A/IFpNHzC4TEkUY31jPMMdfytrHvXbt" +
"8FhQP9ZNJEv8HuPSLKB6EAGXJ9FCXRkOlpSyUv0D/6CfAAXrI25t4mPZ6pL1TWx/WJeyY5jLVPcqg7B/ST/tJv+g+PHa/Mb4/IA0R+Y8n6cn0" +
"mH2sC/VUowGNj5drCDoUHOHUi6y/d9WvQ38gLPM92CFjb+njJ2qwv0G/6Dw95QRECtQB17CuW1mZ9QV4AjyIX6AN7Ady4rxcLxdBarS94Hnpx" +
"uq8wqD0A8Fqp8X7JY/5QaG6g+UGxKOsF8O7POzZuEy1brRHwgA+8ijCIPAAoDPS6uXbAQ+5foBbAxz/Z8+Q1w4UBHhrNCiF2EyGXAH38s3q79" +
"vgX4AEfnwdIhDe1B3hcivWFkE+XAJeUAAUlwgKRAL5cdYko+EUCPFX4X4D6gpVV2ktEwS8SAPAOTU3ukgAfeBXoEgCk2vPlIOSzEyAvFNJYQV" +
"UtnhI1VdpLADzgoyozPKkmX9cewOqpavHU50PVVgh4wAde8NP2m84QkBDU5y8B8CiIC14AlowJg8eWMuUlJUIlQHjBb79EHnmAzwO0tecB+i8" +
"uiv899gK4ROjzAF/guGZ4HgqDXQLkP2sP8GHAPhzchi+s1QvoN/2HB3wK9we1AIAPbC1tQuKDyp5rhEYzeMBna1WpvBDAFQ69F/xk6/QCWZ/+" +
"e+sXBdKoNCb32Nq66wOK/dr6RYG0JQDqUEa2gxdQUdHaOouLrUWFBUK5q7Z+a49ASwAH5QItk7OeBiiVL9kTcP0fcvveOmJfCAWovOBRvqwS0" +
"5ILJhrz5fpfWep/aH0QCgCyCKqhsYoqDwCExT078v07ANke8lj826Z9acn1vzY37tc4SoCNRdkTtvmS34eHCEvxBFle5Il7NkVtLZEPN0iBow" +
"Jk4EpsNRP8FrQliBCR/8zytlkLtsV49Arg8kGXCHjFA7ub0YFsT7Ij5kPyXa4v9AoAOkR4mI9aZiJJzr1XWMDqjPMMdQiAlYl5uf0g8mCQAKB" +
"DBFyPrWgc59wtLnjiWJ1xnqGObE/C29oI8mCwAKASgQfo1ZL3bDqGN5CNue+UQnji3B/i/ocTDHW7bM/1oeTBKAFAvrmEAHRqY+1fjGAhFVoX" +
"+4uRsGA4FLmqrI0V2lzlhVA5WhMoBD/nN0MhcRtpdY+zBABuy1kkhMrRTKUVEppQRaOGEqoI412El1aoWsT58KnkwdkCCM4bgN9wxSwSMYAEE" +
"Xyh0ldsRBhAmlyzW8nJDZxsdY/JBBACjwA6SpA+iDAQyUksXmNyATwqMQRdOwZPcHLSHrMKEMGJ0om5yEb4D1gsLPtR6hv3AAAAAElFTkSuQmCC";

const DEFAULT_COLOR = Cesium.Color.AQUAMARINE;

const CONTROL_POINT_BILLBOARD_OPTIONS = {
    image: WHITE_CIRCLE,
    width: 32,
    height: 32,
    scale: 0.4,
    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    disableDepthTestDistance: 1000000,
    color: DEFAULT_COLOR
};

export default class GeometryEditor {
    constructor(viewer) {
        this.viewer = viewer;
        this.createMode = false;

        // Static custom DatataSorce, to add it only once
        if(!GeometryEditor.controlPointsDisplay) {
            GeometryEditor.controlPointsDisplay =
                new Cesium.CustomDataSource('geometry-control-points');
            viewer.dataSources.add(GeometryEditor.controlPointsDisplay);
        }

        this._controlPoints = [];
        this._middlePoints = [];

        this._createScreenSpaceEventHandler();
    }

    newEntity(type) {
        this._type = type;
        this._setTypeOptions();
        this.createMode = true;

        this.entity = new Cesium.Entity({
            [ this._type ]: {
                [this._entityGeometryProperty]: new Cesium.CallbackProperty(this._geometryCallback.bind(this), false),
                ...this.entityOptions
            }
        });

        return this.entity;
    }

    editEntity(type, entity) {
        this._type = type;
        this._setTypeOptions();
        this.createMode = false;

        this.entity = entity;
        this._oldGeometry = this.entity[this._type][this._entityGeometryProperty].getValue();
        this._geometryAsControlPoints();

        this.entity[this._type][this._entityGeometryProperty] = new Cesium.CallbackProperty(this._geometryCallback.bind(this), false);

        return this.entity;
    }

    _geometryAsControlPoints() {
        if (this._type === 'polyline') {
            const positions = this.entity[this._type][this._entityGeometryProperty].getValue();
            positions.forEach(position => {
                this._addControlPoint(position);
            });
        }
        else if (this._type === 'polygon') {
            const hierarchy = this.entity[this._type][this._entityGeometryProperty].getValue();
            hierarchy.positions.forEach(position => {
                this._addControlPoint(position);
            });
        }
        this._createMiddlePoints();
        // this.__labels();
    }

    _geometryCallback() {
        if (this._type === 'polyline') {
            return this._controlPoints.map(cp => cp.position.getValue());
        }
        if (this._type === 'polygon') {
            return new Cesium.PolygonHierarchy(this._controlPoints.map(cp => cp.position.getValue()));
        }
    }

    _createMiddlePoints() {
        this._middlePoints.forEach(mp => {
            GeometryEditor.controlPointsDisplay.entities.remove(mp, true);
        });

        let prev = null;
        this._controlPoints.forEach(cp => {
            if (prev) {
                this._addMiddlePoint(prev, cp);
            }
            prev = cp;
        });

        // Close loop
        if (this._type === 'polygon' && prev) {
            this._addMiddlePoint(prev, this._controlPoints[0]);
        }
    }

    save() {
        // Apply changes to entity
        this.entity[this._type][this._entityGeometryProperty] = new Cesium.ConstantProperty(this._geometryCallback());

        this.reset();
    }

    cancel() {
        if (this._oldGeometry) {
            this.entity[this._type][this._entityGeometryProperty] = this._oldGeometry;
        }
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
        this._type = null;
        this._oldGeometry = null;
        this._activeControlPoint = null;
        this._entityGeometryProperty = null;
        GeometryEditor.controlPointsDisplay.entities.removeAll();
        this._controlPoints = [];
    }

    destroy() {
        if (this.screenSpaceEventHandler) {
            this.screenSpaceEventHandler.destroy();
        }
    }

    _setTypeOptions() {
        if (this._type === 'polyline') {
            this._entityGeometryProperty = 'positions';

            this.entityOptions = {
                clampToGround: true,
                width: 3,
                material: DEFAULT_COLOR,
            };
        }
        else if (this._type === 'polygon') {
            this._entityGeometryProperty = 'hierarchy';

            this.entityOptions = {
                material: DEFAULT_COLOR.withAlpha(0.3),
                outline: true,
                outlineColor: DEFAULT_COLOR,
                outlineWidth: 2,
            };
        }
    }

    _addMiddlePoint(p1, p2, index) {
        const color = this._getEntityColor();
        const cpEntity = new Cesium.Entity({
            position: new Cesium.CallbackProperty(() => {
                const midPoint = Cesium.Cartesian3.midpoint(
                    p1.position.getValue(),
                    p2.position.getValue(),
                    new Cesium.Cartesian3()
                );
                return midPoint;
            }),
            billboard: {
                ...CONTROL_POINT_BILLBOARD_OPTIONS,
                scale: 0.3,
                color
            }
        });

        const inx = index === undefined ? this._middlePoints.length : index;
        this._middlePoints.splice(inx, 0, cpEntity);

        GeometryEditor.controlPointsDisplay.entities.add(cpEntity);
    }

    _addControlPoint(position, index) {
        const color = this._getEntityColor();
        const cpEntity = new Cesium.Entity({
            position: position,
            billboard: {
                ...CONTROL_POINT_BILLBOARD_OPTIONS,
                color
            }
        });

        const inx = index === undefined ? this._controlPoints.length : index;
        this._controlPoints.splice(inx, 0, cpEntity);

        GeometryEditor.controlPointsDisplay.entities.add(cpEntity);

        return cpEntity;
    }

    _removeCP(cp) {
        const cpi = this._controlPoints.indexOf(cp);

        if (cpi < 0) return;

        console.log('remove point at', cpi);

        const li = cpi;
        const ri = (cpi + 1) % this._middlePoints.length;

        const leftMP  = this._middlePoints[li];
        const rightMP = this._middlePoints[ri];

        GeometryEditor.controlPointsDisplay.entities.remove(leftMP,  true);
        GeometryEditor.controlPointsDisplay.entities.remove(rightMP, true);
        GeometryEditor.controlPointsDisplay.entities.remove(cp, true);

        this._middlePoints.splice(li,  2);
        this._controlPoints.splice(cpi, 1);
    }

    _getEntityColor() {
        if (! this.entity) {
            return DEFAULT_COLOR;
        }

        if (this._type === 'polygon') {
            const fillColor = this.entity.polygon.material.getValue();
            const outlineColor = this.entity.polygon.outlineColor.getValue();
            return outlineColor || fillColor || DEFAULT_COLOR;
        }
        else if (this._type === 'polyline') {
            return this.entity.polyline.material.getValue().color || DEFAULT_COLOR;
        }

        return DEFAULT_COLOR;
    }

    _mouseClick(e) {
        let ent = this.viewer.scene.pick(e.position);
        let position = this.viewer.scene.pickPosition(e.position);

        if (this.entity) {
            // CP drag is handled by this.screenSpaceEventHandler
            if (ent) {
                const cp = this._controlPoints.includes(ent.id);
                const mp = this._middlePoints.includes(ent.id);

                // if (cp && confirm("Delete point?")) {
                //     this._removeCP(ent.id);
                // }

                if (cp || mp) return;
            }

            if (position && this.createMode) {
                this._addControlPoint(position);
            }

            return;
        }
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
        if (!pick) return;

        const subj = pick.id;

        const isControlPoint = this._controlPoints.includes(subj);

        const middlePointIndex = this._middlePoints.indexOf(subj);
        const isMiddlePoint = middlePointIndex >= 0;

        // Use pick ellipsoid viewer.scene.pickPosition(e.position) returns null if we click on entity
        let pc = this.viewer.camera.pickEllipsoid(e.position, this.viewer.scene.globe.ellipsoid);
        this._mouseDownPosition = Cesium.Cartographic.fromCartesian(pc);
        this._mouseDownEntityPosition = Cesium.Cartographic.fromCartesian(subj.position.getValue());

        console.log(`Down on ${isControlPoint ? 'CP' : ''}${isMiddlePoint ? 'MP' : ''}`, subj);

        this.disableDefaultControls();

        if ( isControlPoint || isMiddlePoint ) {
            this._activeControlPoint = subj;

            if (isMiddlePoint) {

                const li = middlePointIndex;
                const ri = (middlePointIndex + 1) % this._controlPoints.length;
                const leftCP  = this._controlPoints[li];
                const rightCP = this._controlPoints[ri];

                this._activeControlPoint = this._addControlPoint(
                    subj.position.getValue(),
                    middlePointIndex + 1
                );

                this._middlePoints.splice(middlePointIndex, 1);

                this._addMiddlePoint(leftCP,  this._activeControlPoint, middlePointIndex);
                this._addMiddlePoint(rightCP, this._activeControlPoint, middlePointIndex + 1);
                GeometryEditor.controlPointsDisplay.entities.remove(subj, true);

            }
        }

        // this.__labels();
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

    __labels() {
        this._controlPoints.forEach((p, i) => {
            p.label = new Cesium.LabelGraphics({
                text: 'cp' + i,
                eyeOffset: new Cesium.Cartesian3(0.0, 0.0, -25.0),
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM
            });
        });

        this._middlePoints.forEach((p, i) => {
            p.label = new Cesium.LabelGraphics({
                text: 'mp' + i,
                eyeOffset: new Cesium.Cartesian3(0.0, 0.0, -25.0),
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM
            });
        });
    }
}