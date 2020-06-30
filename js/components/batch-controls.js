const template = `
<div v-if="active">
    <button v-on:click="copyStyle('billboard')">Copy style</button>
    <button v-if="selection.length > 1" v-on:click="pasteStyle">
        Apply to {{selection.length}} objects
    </button>
</div>
`;

Vue.component('batch-style-controls', {
    props: ['active'],
    methods: {

    },
    template: template
});

