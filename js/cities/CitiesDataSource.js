class FeaturesMap {
    constructor() {
        this.features = {};
    }

    add(tileId, featureId) {
        if (this.features[tileId] === undefined) {
            this.features[tileId] = [];
        }

        if (this.features[tileId].indexOf(featureId) < 0) {
            this.features[tileId].push(featureId);
            return true;
        }

        return false;
    }

    get(tileId) {
        return this.features[tileId];
    }

    remove(tileId) {
        delete this.features[tileId];
    }
}

function disablePick(viewer, ds) {
    const entities = ds.entities;
    const pick = viewer.scene.pick;
    viewer.scene.pick = function(...args) {
        const picked = pick.call(viewer.scene, ...args);
        if (picked) {
            const id = Cesium.defaultValue(picked.id, picked.primitive.id);
            if (id instanceof Cesium.Entity && entities.contains(id)) {
                return null;
            }
        }
        return picked;
    };
}

export default function CitiesDataSource(viewer) {
    const tilingScheme = new Cesium.GeographicTilingScheme();
    const visibleFeatures = new FeaturesMap();

    let lastElevation = viewer.camera.positionCartographic.height;

    const tilesDS = new Cesium.CustomDataSource('tiles');
    viewer.dataSources.add(tilesDS);

    disablePick(viewer, tilesDS);

    const activeTiles = [];

    function cameraChanged() {
        let camera = viewer.camera;
        let bbox = camera.computeViewRectangle();
        let heightDelta = lastElevation - camera.positionCartographic.height;
        lastElevation = camera.positionCartographic.height;

        let tilesToRender = viewer.scene.globe._surface._tilesToRender;
        let tmsCoords = tilesToRender.map(t => {
            return {
                level: t._level,
                x: t._x,
                y: t._y,
                bbox: tilingScheme.tileXYToRectangle(t._x, t._y, t._level)
            };
        });

        updateTiles(bbox, tmsCoords, heightDelta);
    }

    function getParentTile(tile) {
        if (tile.level == 0) {
            return tile;
        }
        let level = tile.level;
        let bbox = tile.bbox || tilingScheme.tileXYToRectangle(tile.x, tile.y, tile.level)
        let c = Cesium.Rectangle.center(bbox);

        return tileFromCoordinates(c, level - 1);
    }

    function getChildrenTiles(tile) {
        let level = tile.level;
        let bbox = tile.bbox || tilingScheme.tileXYToRectangle(tile.x, tile.y, tile.level)

        let c = Cesium.Rectangle.center(bbox);
        let dx = bbox.width / 4;
        let dy = bbox.height / 4;

        let cnw = new Cesium.Cartographic(c.longitude - dx, c.latitude + dy, c.height);
        let cne = new Cesium.Cartographic(c.longitude + dx, c.latitude + dy, c.height);
        let snw = new Cesium.Cartographic(c.longitude - dx, c.latitude - dy, c.height);
        let sne = new Cesium.Cartographic(c.longitude + dx, c.latitude - dy, c.height);

        return [
            tileFromCoordinates(cnw, level + 1),
            tileFromCoordinates(cne, level + 1),
            tileFromCoordinates(snw, level + 1),
            tileFromCoordinates(sne, level + 1),
        ];
    }

    function tileFromCoordinates(cartographic, level) {
        let xy = tilingScheme.positionToTileXY(cartographic, level);
        return {
            x: xy.x,
            y: xy.y,
            level: level
        }
    }

    function listAllParents(tile) {
        if (tile.level === 0) {
            return [];
        }

        let result = [getParentTile(tile)];

        while (result[0].level !== 0) {
            result.unshift(getParentTile(result[0]));
        }

        return result;
    }

    function findAndRemove(arr, tile) {
        let index = arr.indexOf(tile);
        if (index >= 0) {
            arr.splice(index, 1);
        }
    }

    function tms(t) {
        return `${t.level}/${t.x}/${t.y}`;
    }

    function removeTile(t) {
        let tileId = tms(t);
        if (visibleFeatures.get(tileId)) {
            // DataSource doesn't remove children, do it manually
            visibleFeatures.get(tileId).forEach(featureId => {
                tilesDS.entities.removeById(featureId);
            });
            visibleFeatures.remove(tileId);
        }
        tilesDS.entities.removeById(tileId);
    }

    function filterTileData(data) {
        let city = data[0];
        data.forEach(c => {
            if (c.population > city.population) {
                city = c;
            }
        });
        return [city];
    }

    function tileMatch(a, b) {
        return a.x === b.x && a.y === b.y && a.level === b.level
    }

    function updateTiles(viewBBOX, newTiles, heightDelta) {

        const tilesToAdd = [];
        const tilesToRemove = [...activeTiles];

        newTiles.forEach(t => {
            const i = tilesToRemove.find(a => tileMatch(a, t))

            if (i >= 0) {
                tilesToRemove.splice(i, 1);
            }
            else {
                tilesToAdd.push(t);
            }
        });

        // tilesDS.entities.removeAll();
        const entitiesToRemove = new Map();
        tilesToRemove.forEach(t => {
            tilesDS.entities.values
                .filter(e => tileMatch(e.properties.tile.getValue(), t))
                .forEach(e => entitiesToRemove.set(e.id, e))
        });

        // entitiesToRemove.forEach(entity => {
        //     tilesDS.entities.remove(entity);
        // });

        const loadingTiles = [];

        // Because there is a delay between old feature was removed and
        // a new one were loaded and added, features are flickering.
        tilesToAdd.forEach(t => {
            activeTiles.push(t);
            loadingTiles.push(new Promise((resolve, reject) => {
                queryData(t.x, t.y, t.level).then(data => {
                    if (!data) {
                        reject('Empty response');
                        return;
                    }

                    data.features.forEach(city => {
                        entitiesToRemove.delete(city.id);

                        const existingEntity = tilesDS.entities.getById(city.id);
                        if(existingEntity) {
                            existingEntity.properties.tile.setValue(t);
                            return;
                        }

                        tilesDS.entities.add(createEntity(city, t));
                    });

                    resolve(t);
                }).catch(err => reject(err));
            }));
        });

        
        Promise.allSettled(loadingTiles).then(loadedTiles => {
            entitiesToRemove.forEach(entity => {
                tilesDS.entities.remove(entity);
            });
        });
    }

    function createEntity(city, tile) {
        const ele = city.elevation + 500;
        let size = 48;
        if (city.population > 50000) {
            size = 52;
        }
        if (city.population > 250000) {
            size = 64;
        }
        if (city.population > 1000000) {
            size = 72;
        }

        return new Cesium.Entity({
            id: city.id,
            position : Cesium.Cartesian3.fromDegrees(city.position[0], city.position[1], ele),
            label: {
                font: `${size}px sans-serif`,
                text: city.name,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                eyeOffset: new Cesium.Cartesian3(0, 0, -1000),
                pixelOffset: new Cesium.Cartesian2(0, -15),
                outlineWidth: 4,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                fillColor: Cesium.Color.LEMONCHIFFON,
                outlineColor: Cesium.Color.BLACK,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                translucencyByDistance: new Cesium.NearFarScalar(10000, 0, 20000, 1),
                scale: 0.25
            },
            point: {
                color: Cesium.Color.FIREBRICK,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                pixelSize: 6,
                disableDepthTestDistance: 6000000,
                translucencyByDistance: new Cesium.NearFarScalar(10000, 0, 20000, 1)
            },
            properties: {
                tile: {...tile}
            }
        });
    }

    function queryData(x, y, level) {
        return fetch(`http://localhost:48088/geo/${level}/${x}/${y}.json`).then(resp => {
            return resp.json();
        });
    }

    viewer.camera.changed.addEventListener(cameraChanged);

    return tilesDS;
}
