const template = `
<span>
        Show
        <template v-for="(title, type) in types">
            <v-spacer></v-spacer>
            <v-checkbox hide-details v-model="visible"></v-checkbox>{{ title }}
        </template>
</span>
`;

Vue.component('entities-list-visibility-filter', {
    props: ['types'],
    template: template,
    data: function() {
        return {
            visible: Object.keys(this.types)
        }
    }
});



