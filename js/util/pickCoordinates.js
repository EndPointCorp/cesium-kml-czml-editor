export function getPickCoordinates(viewer, position) {
    const ray = viewer.camera.getPickRay(position);
    const rayPP = viewer.scene.globe.pick(ray, viewer.scene);

    return rayPP || viewer.camera.pickEllipsoid(
        position,
        viewer.scene.globe.ellipsoid
    );
}
