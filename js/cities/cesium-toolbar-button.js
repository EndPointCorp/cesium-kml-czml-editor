import CitiesDataSource from './CitiesDataSource.js'

function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}

const svg = `M 0 22.063 L 0 21.063 L 8.344 0 L 11.359 0 L 19.594 21.141 L 19.594 22.063 L 16.641 22.063 \
L 14.266 15.875 L 5.156 15.875 L 2.75 22.063 L 0 22.063 Z M 9.766 3.344 L 8.25 7.563 L 6.172 13.188 \
L 13.281 13.188 L 11.25 7.563 L 9.766 3.344 Z`;

export default function LabelsButton(viewer) {
    var container = Cesium.getElement(document.querySelector('.cesium-viewer-toolbar'));

    var element = document.createElement("button");
    element.type = "button";
    element.className = "cesium-button cesium-toolbar-button cesium-home-button";
    element.setAttribute(
        "data-bind",
        "attr: { title: tooltip }, click: command, cesiumSvgPath: { path: _svgPath, width: 32, height: 32 }"
    );

    Cesium.knockout.applyBindings({
        _svgPath: svg,
        active: true,
        ds: CitiesDataSource(viewer),
        command: function() {
            this.ds.show = !this.ds.show;
        },
        tooltip: "Labels"
    }, element);

    container.appendChild(element);
}
