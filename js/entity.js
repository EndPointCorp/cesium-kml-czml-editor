const template = `
    <div class="entity"
        v-bind:class="{folder: isFolder(entity)}"
        v-on:click="selectHandler">

        <input v-on:change="appendHandler($event.target.checked)" :disabled="selected"
            type="checkbox" :checked="inSelection" v-if="selectable()"></input>&nbsp;{{entity.name}}

    </div>
`;

Vue.component('entity', {
    props: ['entity', 'select', 'isFolder', 'copyType', 'append', 'selected', 'inSelection'],
    methods: {
        selectHandler: function() {
            if (this.selectable()) {
                !this.selected && this.appendHandler(!this.inSelection)
            }
            else {
                this.select && this.select(this.entity);
            }
        },
        appendHandler: function(selected) {
            this.append && this.append(this.entity, selected);
        },
        selectable: function() {
            return this.entity[this.copyType] !== undefined;
        }
    },
    template: template
});