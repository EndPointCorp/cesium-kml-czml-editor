const template = `
    <span v-if="label">{{ label }}</span>
`;

const LABELS = {
    polyline: 'Line',
    polygon: 'Polygon',
    model: '3d Model',
    rectangle: 'Rectangle',
    billboard: 'Pin',
    label: 'Label'
}

const PLURALS = {
    polyline: 'Lines',
    polygon: 'Polygons',
    model: '3d Models',
    rectangle: 'Rectangles',
    billboard: 'Pins',
    label: 'Labels'
}

export function entityType(entity) {
    return Object.keys(LABELS).find(t => {
        return entity[t] !== undefined;
    });
}

export function labelForType(type, plural = true) {
    return plural ? PLURALS[type] : LABELS[type];
}

Vue.component('entity-type-label', {
    template,
    props: {
        entity: {
            type: Object,
            required: true
        },
        plural: {
            type: Boolean,
            required: false,
            default: true
        }
    },
    computed: {
        label() {
            let type = entityType(this.entity);
            return this.plural ? PLURALS[type] : LABELS[type];
        }
    }
});