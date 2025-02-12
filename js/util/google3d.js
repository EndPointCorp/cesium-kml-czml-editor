const getParams = new URLSearchParams(window.location.search);
Cesium.GoogleMaps.defaultApiKey = getParams.get('google_key') || 'AIzaSyCgjboUOBS_g9VjVZnTaRTg9dvfHDiZJ4k';

const googleTileset = Cesium.createGooglePhotorealistic3DTileset();

export function switchGoogleGlobeOn(viewer) {

    Promise.resolve(googleTileset).then(tileset => {

        viewer.scene.primitives.add(tileset);
        viewer.scene.globe.show = false;

    }).catch(error => {
        console.log(`Failed to load tileset: ${error}`);
    });
};

export function switchGoogleGlobeOff (viewer) {
    Promise.resolve(googleTileset).then(_ => {
        viewer.scene.primitives._primitives
            .filter(p => p._basePath && p._basePath.startsWith('https://tile.googleapis.com/'))
            .forEach(p => {
                viewer.scene.primitives.remove(p, true);
            });

        viewer.scene.globe.show = true;
    });
};