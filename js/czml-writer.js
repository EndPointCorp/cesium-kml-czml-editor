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

function encodeOrientation (orientation) {
    if (orientation && orientation instanceof Cesium.Quaternion) {
        return {
            unitQuaternion: Cesium.Quaternion.pack(orientation, [], 0)
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

            writeConstantProperty(material.image, imageDef, 'image', resourceEncoder());
            writeConstantProperty(material.color, imageDef, 'color', encodeColor);
            writeConstantProperty(material.repeat, imageDef, 'repeat', encodeCartesian2);
            writeConstantProperty(material.color, imageDef, 'color', encodeColor);
            writeConstantProperty(material.transparent, imageDef, 'transparent', encodeColor);

            packet[property] = {
                image: imageDef
            };
        }
        else {
            console.log('Unsupported material property', property, val);
        }
    }
}

function stringHash(str) {
    var hash = 0, i, chr;
    for (i = 0; i < str.length; i++) {
      chr   = str.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

function throughCache(url, resourceCache, ref) {
    let hash = stringHash(url);

    let existingRef = resourceCache[hash];
    if (existingRef) {
        return {
            reference: existingRef
        };
    }

    resourceCache[hash] = ref;
    return url;
}

function _resourceEncoder(ref) {
    const resourceCache = this && this.resourceCache;
    const id = this && this.id;
    return (resource) => {
        if (resource instanceof Cesium.ReferenceProperty) {
            return `${resource.targetId}#${resource.targetPropertyNames.join('.')}`;
        }
        let url = resource.url || resource;
        let isDataURL = resource.isDataURL || /^data:/.test(url);
        if (isDataURL && resourceCache && ref) {
            return throughCache(url, resourceCache, `${id}#${ref}`);
        }
        return url;
    }
}

var resourceEncoder = _resourceEncoder;

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

function encodeRectanglePositions(v) {
    return {
        wsen: [v.west, v.south, v.east, v.north]
    };
}

function encodeNodeTransformations(v) {
    console.warn("Node transformations are not supported");
    return null;
}

function encodeArticulations(v) {
    console.warn("Articulations are not supported");
    return null;
}

function writeBillboard(billboard) {
    const result = {};

    var image = billboard.image;
    if (billboard.image.valueOf() instanceof Cesium.ReferenceProperty) {
        image = billboard.image.valueOf().resolvedProperty;
    }
    writeConstantProperty(image, result, 'image', resourceEncoder('billboard.image'));
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

    if(polygon.hierarchy instanceof Cesium.ConstantProperty) {
        writeConstantProperty(polygon.hierarchy, result, 'positions', encodePolygonPositions);
        writeConstantProperty(polygon.hierarchy, result, 'holes', encodeHoles);
    }
    else {
        result['positions'] = encodePolygonPositions({
            positions: polygon._positions._value
        });
    }


    writeConstantProperty(polygon.arcType, result, 'arcType', enumEncoder(Cesium.ArcType));

    writeConstantProperty(polygon.height, result, 'height');
    writeConstantProperty(polygon.heightReference, result, 'heightReference', enumEncoder(Cesium.HeightReference));

    writeConstantProperty(polygon.extrudedHeight, result, 'extrudedHeight');
    writeConstantProperty(polygon.extrudedHeightReference, result, 'extrudedHeightReference', enumEncoder(Cesium.HeightReference));

    writeConstantProperty(polygon.stRotation, result, 'stRotation');
    writeConstantProperty(polygon.granularity, result, 'granularity');
    writeConstantProperty(polygon.fill, result, 'fill');

    writeMaterialProperty(polygon.material, result, 'material', 'polygon');

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

function writeRectangle(rectangle) {

    const result = {};

    writeConstantProperty(rectangle.coordinates, result, 'coordinates', encodeRectanglePositions);

    writeConstantProperty(rectangle.height, result, 'height');
    writeConstantProperty(rectangle.heightReference, result, 'heightReference', enumEncoder(Cesium.HeightReference));

    writeConstantProperty(rectangle.extrudedHeight, result, 'extrudedHeight');
    writeConstantProperty(rectangle.extrudedHeightReference, result, 'extrudedHeightReference', enumEncoder(Cesium.HeightReference));

    writeConstantProperty(rectangle.rotation, result, 'rotation');
    writeConstantProperty(rectangle.stRotation, result, 'stRotation');
    writeConstantProperty(rectangle.granularity, result, 'granularity');
    writeConstantProperty(rectangle.fill, result, 'fill');

    writeMaterialProperty(rectangle.material, result, 'material', 'rectangle');

    writeConstantProperty(rectangle.outline, result, 'outline');
    writeConstantProperty(rectangle.outlineColor, result, 'outlineColor', encodeColor);
    writeConstantProperty(rectangle.outlineWidth, result, 'outlineWidth');

    writeConstantProperty(rectangle.shadows, result, 'shadows', enumEncoder(Cesium.ShadowMode));

    writeConstantProperty(rectangle.distanceDisplayCondition, result, 'distanceDisplayCondition', encodeDistanceDisplayCondition);
    writeConstantProperty(rectangle.classificationType, result, 'classificationType', enumEncoder(Cesium.ClassificationType));

    writeConstantProperty(rectangle.zIndex, result, 'zIndex');

    return result;
}

function writePolyline(polyline) {
    const result = {};

    writeConstantProperty(polyline.positions, result, 'positions', encodePositions);
    writeConstantProperty(polyline.arcType, result, 'arcType', enumEncoder(Cesium.ArcType));
    writeConstantProperty(polyline.width, result, 'width');
    writeConstantProperty(polyline.granularity, result, 'granularity');
    writeMaterialProperty(polyline.material, result, 'material', 'polyline');
    writeConstantProperty(polyline.followSurface, result, 'followSurface');
    writeConstantProperty(polyline.shadows, result, 'shadows', enumEncoder(Cesium.ShadowMode));
    writeMaterialProperty(polyline.depthFailMaterial, result, 'depthFailMaterial', 'polyline');
    writeConstantProperty(polyline.distanceDisplayCondition, result, 'distanceDisplayCondition', encodeDistanceDisplayCondition);
    writeConstantProperty(polyline.clampToGround, result, 'clampToGround');
    writeConstantProperty(polyline.classificationType, result, 'classificationType', enumEncoder(Cesium.ClassificationType));
    writeConstantProperty(polyline.zIndex, result, 'zIndex');

    return result;
}

function writeModel(model) {
    const result = {};

    writeConstantProperty(model.uri, result, 'gltf', resourceEncoder('model.gltf'));
    writeConstantProperty(model.scale, result, 'scale');
    writeConstantProperty(model.minimumPixelSize, result, 'minimumPixelSize');
    writeConstantProperty(model.maximumScale, result, 'maximumScale');
    writeConstantProperty(model.incrementallyLoadTextures, result, 'incrementallyLoadTextures');
    writeConstantProperty(model.runAnimations, result, 'runAnimations');
    writeConstantProperty(model.shadows, result, 'shadows', enumEncoder(Cesium.ShadowMode));
    writeConstantProperty(model.heightReference, result, 'heightReference', enumEncoder(Cesium.HeightReference));
    writeConstantProperty(model.silhouetteColor, result, 'silhouetteColor', encodeColor);
    writeConstantProperty(model.silhouetteSize, result, 'silhouetteSize');
    writeConstantProperty(model.color, result, 'color', encodeColor);
    writeConstantProperty(model.colorBlendMode, result, 'colorBlendMode', enumEncoder(Cesium.ColorBlendMode));
    writeConstantProperty(model.colorBlendAmount, result, 'colorBlendAmount');
    writeConstantProperty(model.distanceDisplayCondition, result, 'distanceDisplayCondition', encodeDistanceDisplayCondition);

    writeConstantProperty(model.nodeTransformations, result, 'nodeTransformations', encodeNodeTransformations);
    writeConstantProperty(model.articulations, result, 'articulations', encodeArticulations);

    return result;
}

function writeTileset(tileset) {
    const result = {};

    writeConstantProperty(tileset.uri, result, 'uri');
    writeConstantProperty(tileset.maximumScreenSpaceError, result, 'maximumScreenSpaceError');

    return result;
}

function writeLabel(label) {
    const result = {};

    writeConstantProperty(label.text, result, 'text');
    writeConstantProperty(label.font, result, 'font');
    writeConstantProperty(label.style, result, 'style', enumEncoder(Cesium.LabelStyle));
    writeConstantProperty(label.scale, result, 'scale');
    writeConstantProperty(label.showBackground, result, 'showBackground');
    writeConstantProperty(label.backgroundColor, result, 'backgroundColor', encodeColor);
    writeConstantProperty(label.backgroundPadding, result, 'backgroundPadding', encodeCartesian2);
    writeConstantProperty(label.pixelOffset, result, 'pixelOffset', encodeCartesian2);
    writeConstantProperty(label.eyeOffset, result, 'eyeOffset', encodeCartesian3);
    writeConstantProperty(label.horizontalOrigin, result, 'horizontalOrigin', enumEncoder(Cesium.HorizontalOrigin));
    writeConstantProperty(label.verticalOrigin, result, 'verticalOrigin', enumEncoder(Cesium.VerticalOrigin));
    writeConstantProperty(label.heightReference, result, 'heightReference', enumEncoder(Cesium.HeightReference));
    writeConstantProperty(label.fillColor, result, 'fillColor', encodeColor);
    writeConstantProperty(label.outlineColor, result, 'outlineColor', encodeColor);
    writeConstantProperty(label.outlineWidth, result, 'outlineWidth');
    writeConstantProperty(label.translucencyByDistance, result, 'translucencyByDistance', encodeNearFarScalar);
    writeConstantProperty(label.pixelOffsetScaleByDistance, result, 'pixelOffsetScaleByDistance', encodeNearFarScalar);
    writeConstantProperty(label.scaleByDistance, result, 'scaleByDistance', encodeNearFarScalar);
    writeConstantProperty(label.distanceDisplayCondition, result, 'distanceDisplayCondition', encodeDistanceDisplayCondition);
    writeConstantProperty(label.disableDepthTestDistance, result, 'disableDepthTestDistance');

    return result;
}

export default class DocumentWriter {

    constructor () {
        this.resourceCache = {};
        this.counter = 0;
        this.document = {
            "id": "document",
            "version": "1.0"
        };
        this.packets = [];
    }

    addEntity (entity) {
        this.id = entity.id || `object${this.counter++}`
        let packet = {
            id: this.id
        };

        this.entity = entity;

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

        if (entity.orientation) {
            const orientation = entity.orientation;
            if (orientation.isConstant) {
                packet = {
                    ...packet,
                    orientation: encodeOrientation(orientation.getValue())
                }
            }
            else {
                console.warn('Not Supported');
            }
        }

        resourceEncoder = _resourceEncoder.bind(this);

        if (entity.billboard) {
            packet.billboard = writeBillboard(entity.billboard);
        }

        if (entity.polyline) {
            packet.polyline = writePolyline(entity.polyline);
        }

        if (entity.polygon) {
            packet.polygon = writePolygon(entity.polygon);
        }

        if (entity.rectangle) {
            packet.rectangle = writeRectangle(entity.rectangle);
        }

        if (entity.model) {
            packet.model = writeModel(entity.model);
        }

        if (entity.tileset) {
            packet.tileset = writeTileset(entity.tileset);
        }

        if (entity.label) {
            packet.label = writeLabel(entity.label);
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