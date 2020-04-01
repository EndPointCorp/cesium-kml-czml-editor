const template = `
    <div class="entity" v-bind:class="{folder: isFolder(entity)}" v-on:click="selectHandler">{{entity.name}}</div>
`;
Vue.component('entity', {
    props: ['entity', 'select', 'isFolder'],
    methods: {
        selectHandler: function() {
            this.select && this.select(this.entity);
        }
    },
    template: template
});