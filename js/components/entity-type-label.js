const template = `
    <span v-if="label">{{ label }}</span>
`;

const LABELS = {
    billboard: 'Pin',
    polyline: 'Line',
    polygon: 'Polygon',
    model: '3d Model',
    rectangle: 'Rectangle',
    label: 'Label'
}

const PLURALS = {
    billboard: 'Pins',
    polyline: 'Lines',
    polygon: 'Polygons',
    model: '3d Models',
    rectangle: 'Rectangles',
    label: 'Labels'
}

export function entityType(entity) {
    return Object.keys(LABELS).find(t => {
        if (t === 'polyline') {
            return entity.polyline && !entity.billboard;
        }
        return entity[t];
    });
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