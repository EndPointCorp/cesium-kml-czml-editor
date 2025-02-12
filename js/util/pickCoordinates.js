export function getPickCoordinates(viewer, position) {
    const ray = viewer.camera.getPickRay(eposition);
    return viewer.scene.globe.pick(ray, viewer.scene);
}
