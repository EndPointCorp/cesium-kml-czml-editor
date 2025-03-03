
const polygonProps = [
    'hierarchy',
    'height', 
    'extrudedHeight', 
    'closeBottom', 
    'closeTop',
    'material', 
    'fill',
    'heightReference', 
    'extrudedHeightReference',
    'classificationType', 
    'zIndex', 
    'distanceDisplayCondition',
    'perPositionHeight',
    'outline', 
    'outlineColor', 
    'outlineWidth',
];

export function createProxyPolygon() {
    const polygon = {};

    for (let prop of polygonProps) {
        Object.defineProperty(polygon, prop, {
            get() {
                return this._polygon?.[prop];
            },
            set(value) {
                if (this._polygon) {
                    this._polygon[prop] = value;
                }
            }
        });
    }

    return polygon;
}

const polylineProps = [
    'positions',
    'width',
    'material',
];

export function createProxyPolyline() {
    const polyline = {};

    for (let prop of polylineProps) {
        Object.defineProperty(polyline, prop, {
            get() {
                return this._polyline?.[prop];
            },
            set(value) {
                if (this._polyline) {
                    this._polyline[prop] = value;
                }
            }
        });
    }

    return polyline;
}

const billboardProps = [
    'image',
    'scale',
    'pixelOffset',
    'eyeOffset',
    'horizontalOrigin',
    'verticalOrigin',
    'heightReference',
    'color',
    'sizeInMeters',
    'width',
    'height',
    'scaleByDistance',
    'translucencyByDistance',
    'pixelOffsetScaleByDistance',
    'distanceDisplayCondition',
    'disableDepthTestDistance',
];

export function createProxyBillboard() {
    const billboard = {};

    for (let prop of billboardProps) {
        Object.defineProperty(billboard, prop, {
            get() {
                return this._billboard?.[prop];
            },
            set(value) {
                if (this._billboard) {
                    this._billboard[prop] = value;
                }
            }
        });
    }

    return billboard;
}