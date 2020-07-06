function copyEntityField(entity, packet, field) {
    let val = entity[field];

    if (val) {
        if (val.valueOf) {
            val = val.valueOf();
        }
        return {
            ...packet,
            [field]: val
        }
    }

    return packet;
}

function cartesianAsCartographicDegrees(cartesian3) {
    const cartographic  = Cesium.Ellipsoid.WGS84.cartesianToCartographic(cartesian3);
    const lon = Cesium.Math.toDegrees(cartographic.longitude);
    const lat = Cesium.Math.toDegrees(cartographic.latitude);

    return [lon, lat, cartographic.height]
}

function encodePosition (pos) {
    if (pos && pos instanceof Cesium.Cartesian3) {
        return {
            cartographicDegrees: cartesianAsCartographicDegrees(pos)
        }
    }
    return null;
}

function writeConstantProperty(val, packet, property, adapter) {
    if (val !== undefined && val.isConstant) {
        const v = val.valueOf();
        if (adapter) {
            const adapted = adapter(v);
            if (adapted !== undefined) {
                packet[property] = adapted;
            }
        }
        else {
            packet[property] = v;
        }
    }
}

function writeMaterialProperty(val, packet, property) {
    if (val) {
        if (val instanceof Cesium.ColorMaterialProperty) {
            packet[property] = {
                solidColor: {
                    color: encodeColor(val.valueOf().color.valueOf())
                }
            };
        }
        else if (val instanceof Cesium.ImageMaterialProperty) {
            const material = val.valueOf();
            const imageDef = {};

            writeConstantProperty(material.image, imageDef, 'image', encodeResource);
            writeConstantProperty(material.color, imageDef, 'color', encodeColor);
            writeConstantProperty(material.repeat, imageDef, 'repeat', encodeCartesian2);
            writeConstantProperty(material.color, imageDef, 'color', encodeColor);

            packet[property] = {
                image: imageDef
            };
        }
        else {
            console.log('Unsupported material property', property, val);
        }
    }
}

function encodeResource(resource) {
    if (resource.isDataUri) {
        return resource.url;
    }
    return resource;
}

function enumEncoder(enm) {
    return (v) => {
        return Object.keys(enm).find(k => enm[k] === v);
    }
}

function encodeNearFarScalar(v) {
    return {
        nearFarScalar: [v.near, v.nearValue, v.far, v.farValue]
    };
}

function encodeColor(v) {
    return {
        rgbaf: [v.red, v.green, v.blue, v.alpha]
    };
}

function encodeBoundingRectangle(v) {
    return {
        boundingRectangle: [v.x, v.y, v.width, v.height]
    };
}

function encodeDistanceDisplayCondition(v) {
    return {
        distanceDisplayCondition: [v.near, v.far]
    };
}

function encodePolygonPositions (hierarchy) {
    return {
        cartographicDegrees: hierarchy.positions.reduce((arr, p) => {
            return [...arr, ...cartesianAsCartographicDegrees(p)];
        }, [])
    };
}

function encodeHoles (hierarchy) {
    if (hierarchy.holes) {
        return hierarchy.holes.map(encodePolygonPositions);
    }

    return undefined;
}

function encodeCartesian2(v) {
    return {
        "cartesian2": [v.x, v.y]
    };
}

function encodeCartesian3(v) {
    return {
        "cartesian": [v.x, v.y, v.z]
    };
}

function encodePositions(v) {
    if(v.getValue) {
        return {
            cartographicDegrees: v.getValue().reduce((arr, p) => {
                return [...arr, ...cartesianAsCartographicDegrees(p)];
            }, [])
        };
    }
    else if (v.reduce) {
        return {
            cartographicDegrees: v.reduce((arr, p) => {
                return [...arr, ...cartesianAsCartographicDegrees(p)];
            }, [])
        };
    }
    console.warn('Failed to write positions', v);
}

function writeBillboard(billboard) {
    const result = {};

    writeConstantProperty(billboard.image, result, 'image', encodeResource);
    writeConstantProperty(billboard.scale, result, 'scale');
    writeConstantProperty(billboard.pixelOffset, result, 'pixelOffset', encodeCartesian2);
    writeConstantProperty(billboard.eyeOffset, result, 'eyeOffset', encodeCartesian3);
    writeConstantProperty(billboard.horizontalOrigin, result, 'horizontalOrigin', enumEncoder(Cesium.HorizontalOrigin));
    writeConstantProperty(billboard.verticalOrigin, result, 'verticalOrigin', enumEncoder(Cesium.VerticalOrigin));
    writeConstantProperty(billboard.heightReference, result, 'heightReference', enumEncoder(Cesium.HeightReference));
    writeConstantProperty(billboard.color, result, 'color', encodeColor);
    writeConstantProperty(billboard.rotation, result, 'rotation');
    writeConstantProperty(billboard.alignedAxis, result, 'alignedAxis', encodeCartesian3);
    writeConstantProperty(billboard.sizeInMeters, result, 'sizeInMeters');
    writeConstantProperty(billboard.width, result, 'width');
    writeConstantProperty(billboard.height, result, 'height');
    writeConstantProperty(billboard.scaleByDistance, result, 'scaleByDistance', encodeNearFarScalar);
    writeConstantProperty(billboard.translucencyByDistance, result, 'translucencyByDistance', encodeNearFarScalar);
    writeConstantProperty(billboard.pixelOffsetScaleByDistance, result, 'pixelOffsetScaleByDistance', encodeNearFarScalar);
    writeConstantProperty(billboard.imageSubRegion, result, 'imageSubRegion', encodeBoundingRectangle);
    writeConstantProperty(billboard.distanceDisplayCondition, result, 'distanceDisplayCondition', encodeDistanceDisplayCondition);
    writeConstantProperty(billboard.disableDepthTestDistance, result, 'disableDepthTestDistance');

    return result;
}

function writePolygon(polygon) {

    const result = {};

    writeConstantProperty(polygon.hierarchy, result, 'positions', encodePolygonPositions);
    writeConstantProperty(polygon.hierarchy, result, 'holes', encodeHoles);

    writeConstantProperty(polygon.arcType, result, 'arcType', enumEncoder(Cesium.ArcType));

    writeConstantProperty(polygon.height, result, 'height');
    writeConstantProperty(polygon.heightReference, result, 'heightReference', enumEncoder(Cesium.HeightReference));

    writeConstantProperty(polygon.extrudedHeight, result, 'extrudedHeight');
    writeConstantProperty(polygon.extrudedHeightReference, result, 'extrudedHeightReference', enumEncoder(Cesium.HeightReference));

    writeConstantProperty(polygon.stRotation, result, 'stRotation');
    writeConstantProperty(polygon.granularity, result, 'granularity');
    writeConstantProperty(polygon.fill, result, 'fill');

    writeMaterialProperty(polygon.material, result, 'material');

    writeConstantProperty(polygon.outline, result, 'outline');
    writeConstantProperty(polygon.outlineColor, result, 'outlineColor', encodeColor);
    writeConstantProperty(polygon.outlineWidth, result, 'outlineWidth');

    writeConstantProperty(polygon.perPositionHeight, result, 'perPositionHeight');

    writeConstantProperty(polygon.closeTop, result, 'closeTop');
    writeConstantProperty(polygon.closeBottom, result, 'closeBottom');

    writeConstantProperty(polygon.shadows, result, 'shadows', enumEncoder(Cesium.ShadowMode));
    writeConstantProperty(polygon.distanceDisplayCondition, result, 'distanceDisplayCondition', encodeDistanceDisplayCondition);
    writeConstantProperty(polygon.classificationType, result, 'classificationType', enumEncoder(Cesium.ClassificationType));

    writeConstantProperty(polygon.zIndex, result, 'zIndex');

    return result;
}

function writePolyline(polyline) {
    const result = {};

    writeConstantProperty(polyline.positions, result, 'positions', encodePositions);
    writeConstantProperty(polyline.arcType, result, 'arcType', enumEncoder(Cesium.ArcType));
    writeConstantProperty(polyline.width, result, 'width');
    writeConstantProperty(polyline.granularity, result, 'granularity');
    writeMaterialProperty(polyline.material, result, 'material');
    writeConstantProperty(polyline.followSurface, result, 'followSurface');
    writeConstantProperty(polyline.shadows, result, 'shadows', enumEncoder(Cesium.ShadowMode));
    writeMaterialProperty(polyline.depthFailMaterial, result, 'depthFailMaterial');
    writeConstantProperty(polyline.distanceDisplayCondition, result, 'distanceDisplayCondition', encodeDistanceDisplayCondition);
    writeConstantProperty(polyline.clampToGround, result, 'clampToGround');
    writeConstantProperty(polyline.classificationType, result, 'classificationType', enumEncoder(Cesium.ClassificationType));
    writeConstantProperty(polyline.zIndex, result, 'zIndex');

    return result;
}

export default class DocumentWriter {

    constructor () {
        this.document = {
            "id": "document",
            "version": "1.0"
        };
        this.packets = [];
    }

    addEntity (entity) {
        let packet = {
            id: entity.id
        };

        packet = copyEntityField(entity, packet, 'name');
        packet = copyEntityField(entity, packet, 'description');

        if (entity.parent) {
            packet = {
                ...packet,
                parent: entity.parent.id
            }
        }

        if (entity.position) {
            const position = entity.position;
            if (position.isConstant) {
                packet = {
                    ...packet,
                    position: encodePosition(position.getValue())
                }
            }
            else {
                console.warn('Not Supported');
            }
        }

        if (entity.billboard) {
            packet.billboard = writeBillboard(entity.billboard);
        }

        if (entity.polyline) {
            packet.polyline = writePolyline(entity.polyline);
        }

        if (entity.polygon) {
            packet.polygon = writePolygon(entity.polygon);
        }

        if (entity.parent) {
            packet = {
                ...packet,
                parent: entity.parent.id
            }
        }

        this.packets.push(packet);
    }

    toJSON () {
        return [this.document, ...this.packets]
    }

}