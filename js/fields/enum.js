const template = `
    <v-select
        dense
        class="enum-field"
        v-model="value"
        v-on:change="update();"
        hide-details
        :items="options"
        :label="label"
        :clearable="true"
    ></v-select>`;

Vue.component('enum-field', {
    props: ['entity', 'feature', 'field', 'enum', 'label'],
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
            options: [...Object.keys(Cesium[this.enum])]
        };
    },
    methods: {
        update: function() {
            // Synchronized values from local model data to Cesium
            let val = Cesium[this.enum][this.value];
            if (val === undefined) {
                let pd = Object.getOwnPropertyDescriptor(this.entity[this.feature].__proto__, this.field);
                pd.set.apply(this.entity[this.feature], [ undefined ]);
                this.value = undefined;
            }
            else {
                this.entity[this.feature][this.field] = val;
            }

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