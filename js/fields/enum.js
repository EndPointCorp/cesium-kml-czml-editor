const template = `<span class="editor-field">
    <select class="enum-field" v-model="value" v-on:change="update();">
        <option>undefined</option>
        <option v-for="opt in options">{{opt}}</option>'
    </select>
</span>`;

Vue.component('enum-field', {
    props: ['entity', 'feature', 'field', 'enum'],
    data: function() {
        let value = 'undefined';

        if (this.entity[this.feature][this.field]) {
            let v = this.entity[this.feature][this.field].getValue();
            Object.keys(Cesium[this.enum]).forEach(k => {
                if( Cesium[this.enum][k] === v ) {
                    value = k;
                }
            });
        }

        return {
            value: value,
            options: Object.keys(Cesium[this.enum])
        };
    },
    methods: {
        update: function() {
            // Synchronized values from local model data to Cesium
            let val = Cesium[this.enum][this.value];
            this.entity[this.feature][this.field] = val;

            this.$emit('input', val, this.field, this.feature, this.entity);
        }
    },
    watch: {
        entity: function(newValue) {
            if (newValue[this.feature][this.field]) {
                let v = newValue[this.feature][this.field].getValue();
                Object.keys(Cesium[this.enum]).forEach(k => {
                    if( Cesium[this.enum][k] === v ) {
                        this.value = k;
                    }
                });
            }
            else {
                this.value = 'undefined';
            }
        }
    },
    template: template
});