const template = `<input
    class="direct-property-field"
    v-model="entity[feature][field]"></input>`;

Vue.component('direct-field', {
    props: ['entity', 'feature', 'field'],
    template: template
});