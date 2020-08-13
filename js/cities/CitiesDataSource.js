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
        let picked = pick.call(viewer.scene, ...args);
        let id = Cesium.defaultValue(picked.id, picked.primitive.id);
        if (id instanceof Cesium.Entity && entities.contains(id)) {
            return null;
        }
        return picked;
    };
}

export default function CitiesDataSource(viewer) {
    const tilingScheme = new Cesium.GeographicTilingScheme();
    let visibleTiles = [];
    const visibleFeatures = new FeaturesMap();

    let lastElevation = viewer.camera.positionCartographic.height;

    const tilesDS = new Cesium.CustomDataSource('tiles');
    viewer.dataSources.add(tilesDS);

    disablePick(viewer, tilesDS);

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

    function findByCoords(arr, x, y, level) {
        return arr.find(t => t.x === x && t.y === y && t.level === level);
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

    function updateTiles(viewBBOX, newTiles, heightDelta) {
        let tilesToRemove = [];
        let tilesToAdd = [];

        visibleTiles = visibleTiles.filter(t => {
            let inViewport = Cesium.Rectangle.simpleIntersection(viewBBOX, t.bbox);
            if (!inViewport) {
                tilesToRemove.push(t);
            }
            return inViewport;
        });

        newTiles.forEach(t => {
            let exists = findByCoords(visibleTiles, t.x, t.y, t.level);
            if (!exists) {
                tilesToAdd.push(t);
                // We add tiles to visible tiles here,
                // to be able to calculate parent/child relations
                visibleTiles.push(t);
            }
        });

        tilesToRemove.forEach(removeTile);

        // Because there is a delay between old feature was removed and
        // a new one were loaded and added, features are flickering.
        tilesToAdd.forEach(t => {
            queryData(t.x, t.y, t.level).then(data => {
                let zoomIn = (heightDelta > 0);
                if (zoomIn) {
                    // We are going down, remove parents
                    listAllParents(t).forEach(p => {
                        let parent = findByCoords(visibleTiles, p.x, p.y, p.level);
                        if (parent) {
                            removeTile(parent);
                            findAndRemove(visibleTiles, parent);
                        }
                    });
                }
                else {
                    // We are going up, remove children
                    getChildrenTiles(t).forEach(chld => {
                        let child = findByCoords(visibleTiles, chld.x, chld.y, chld.level);
                        if (child) {
                            removeTile(child);
                            findAndRemove(visibleTiles, child);
                        }
                    });
                }

                let city = filterTileData(data)[0];
                let tileEntity = tilesDS.entities.getOrCreateEntity(tms(t));

                if (city) {
                    addCityEntity(tileEntity, city);
                }
            });
        });
    }

    function addCityEntity(tileEntity, city) {
        if (visibleFeatures.add(tileEntity.id, city.name)) {
            let ce = new Cesium.Entity({
                id: city.name,
                parent: tileEntity,
                position : Cesium.Cartesian3.fromDegrees(city.position[0], city.position[1], 1000),
                properties: {
                    population: city.population,
                    name: city.name
                },
                label: {
                    font: "16px sans-serif",
                    text: city.name,
                    verticalOrigin: Cesium.VerticalOrigin.BASELINE,
                    horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                    pixelOffset: new Cesium.Cartesian2(0, 10),
                    outlineWidth: 1,
                    fillColor: Cesium.Color.AZURE,
                    disableDepthTestDistance: Number.POSITIVE_INFINITY,
                    translucencyByDistance: new Cesium.NearFarScalar(20000, 0, 30000, 1)
                }
            });
            //tilesDS.entities.removeById(ce.id);
            tilesDS.entities.add(ce);
        }
    }

    const cities = fetch('js/cities/cities.json').then(r => r.json());
    function queryData(x, y, level) {
        return cities.then(cities => {
            const bbox = tilingScheme.tileXYToRectangle(x, y, level);
            return Promise.resolve(cities.filter(city => {
                let c = Cesium.Cartographic.fromDegrees(city.position[0], city.position[1]);
                return Cesium.Rectangle.contains(bbox, c);
            }));
        });
    }

    viewer.camera.changed.addEventListener(cameraChanged);

    return tilesDS;
}
