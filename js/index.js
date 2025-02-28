import './editors/billboard.js'
import './editors/polygon.js'
import './editors/polyline.js'
import './editors/rectangle.js'
import './editors/model.js'
import './editors/label.js'

import './components/entity-info.js'
import './components/entity-type-label.js'
import './components/entities-list.js'
import './components/add-entities.js'

import './dialogues/tileset-dialog.js'
import './dialogues/styles-dialog.js'

import DocumentWriter from './czml-writer.js'
import LabelsButton from './cities/cesium-toolbar-button.js'
import TilesetSwitch from './util/tileset-switch.js'

import {extrudePolygon, polygonAverageHeight} from './editors/polygon.js'
import {polylineAverageHeight} from './editors/polyline.js'

const getParams = new URLSearchParams(window.location.search);
Cesium.Ion.defaultAccessToken = getParams.get('ion_key') ||
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
        'eyJqdGkiOiI0YzE4M2QwNS00NjcwLTQzZGMtYmViNC1mOWJiZjljMzY3ZDAiLCJpZCI6NzMxNCwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTU0ODk1MTczNX0.' +
        'MjNWfJWsWk4lFXRoZS1EeqaFrWxEnugRqw9M3HRfAQk';

const viewer = new Cesium.Viewer('viewer', {
    fullscreenButton: false,
    homeButton: false,
    navigationInstructionsInitiallyVisible: false,
    navigationHelpButton: false,
});
window.viewer = viewer;
viewer.scene.globe.showWaterEffect = false;

TilesetSwitch(viewer);

const esriImagery = viewer.baseLayerPicker.viewModel
    .imageryProviderViewModels.find(m => m.name === 'ESRI World Imagery');
if (esriImagery) {
    viewer.baseLayerPicker.viewModel.selectedImagery = esriImagery;
}

const ionTerrain = viewer.baseLayerPicker.viewModel
    .terrainProviderViewModels.find(m => m.name === 'Cesium World Terrain');
if (ionTerrain) {
    viewer.baseLayerPicker.viewModel.selectedTerrain = ionTerrain;
}

window.dispatchEvent(new CustomEvent('viewer-created', { detail: {viewer} }));

function applyDefaults(entities) {
    billboardDefaults(entities);
    polylineDefaults(entities);
    polygonDefaults(entities);
}

function billboardDefaults(entities) {
    entities.forEach(e => {
        if (e.billboard) {
            let height = Cesium.Cartographic.fromCartesian(e.position.getValue()).height;
            if (!e.polyline) {
                if (height > 0.1) {
                    e.billboard.heightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;
                }
                else {
                    e.billboard.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
                }
            }
        }
    });
}

function polylineDefaults(entities) {
    entities.forEach(e => {
        if (e.polyline && !e.billboard) {
            if(!e.polyline.arcType || e.polyline.arcType.getValue() === Cesium.ArcType.NONE) {
                e.polyline.arcType = Cesium.ArcType.GEODESIC;
            }

            let h = polylineAverageHeight(e.polyline);
            if (h < 0.1) {
                e.polyline.clampToGround = true;
            }
        }
    });
}

function polygonDefaults(entities) {
    entities.forEach(e => {
        if (e.polygon) {
            let h = polygonAverageHeight(e.polygon);
            if (h > 0.1) {
                extrudePolygon(e.polygon, h);
            }
        }
    });
}

Vue.component('ai-chat', {
  template: `
    <div class="chat-container" @mousedown="handleMouseDown">
      <div class="chat-header">AI Content Assistant</div>
      <div class="chat-messages" ref="messagesContainer" @scroll="handleScroll">
        <div v-for="(msg, idx) in messages" 
             :key="idx" 
             :class="['message', msg.sender]">
          {{ msg.text }}
        </div>
      </div>
      <div class="chat-input-container">
        <form class="chat-input" @submit.prevent="handleSubmit">
          <input
            type="text"
            v-model="input"
            placeholder="Type a command..."
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  `,
  data() {
    return {
      messages: [],
      input: '',
      isDragging: false,
      dragStart: { x: 0, y: 0 },
      SYSTEM_PROMPT: '',
      API_HOST: window.API_HOST || 'localhost:11434',
      MODEL: window.MODEL || 'tulu3:8b',
      autoScroll: true // New flag to control auto-scrolling
    };
  },
  mounted() {
    // Initial load of system prompt
    fetch('system_prompt.txt')
      .then(response => response.ok ? response.text() : Promise.reject('Failed to load system prompt'))
      .then(text => {
        this.SYSTEM_PROMPT = text;
      })
      .catch(error => {
        console.error('Error loading system prompt:', error);
        this.SYSTEM_PROMPT = `
          You are a helpful assistant that creates and edits map entities.
          Coordinates should be in [longitude, latitude] format.
          Always respond with structured JSON for creating points, lines, polygons, or labels.
        `;
      });
  },
  watch: {
    // Watch messages array for changes
    messages: {
      handler() {
        if (this.autoScroll) {
          this.$nextTick(this.scrollToBottom);
        }
      },
      deep: true
    }
  },
  methods: {
    scrollToBottom() {
      const container = this.$refs.messagesContainer;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    },
    handleScroll(event) {
      const container = event.target;
      const { scrollTop, scrollHeight, clientHeight } = container;
      
      // If user scrolls up more than 100px from bottom, disable auto-scroll
      // If user scrolls to bottom, re-enable auto-scroll
      this.autoScroll = Math.abs(scrollHeight - clientHeight - scrollTop) < 100;
    },
    handleMouseDown(e) {
      if (!e.target.closest('.chat-header')) return;
      
      e.preventDefault();
      this.isDragging = true;
      const container = this.$el.parentElement;
      const rect = container.getBoundingClientRect();
      this.dragStart = { 
        x: e.clientX - rect.left, 
        y: e.clientY - rect.top 
      };
      container.style.cursor = 'grabbing';

      const mouseMove = (e) => {
        if (!this.isDragging) return;
        const newX = e.clientX - this.dragStart.x;
        const newY = e.clientY - this.dragStart.y;
        container.style.left = `${newX}px`;
        container.style.top = `${newY}px`;
      };

      const mouseUp = () => {
        if (this.isDragging) {
          this.isDragging = false;
          container.style.cursor = '';
        }
        document.removeEventListener('mousemove', mouseMove);
        document.removeEventListener('mouseup', mouseUp);
      };

      document.addEventListener('mousemove', mouseMove);
      document.addEventListener('mouseup', mouseUp);
    },
    async handleSubmit() {
      if (!this.input.trim()) return;
      
      this.messages.push({ text: this.input, sender: 'user' });
      const currentInput = this.input;
      this.input = '';

      try {
        const response = await fetch(`http://${this.API_HOST}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: this.MODEL,
            messages: [
              { role: 'system', content: this.SYSTEM_PROMPT },
              { role: 'user', content: currentInput }
            ],
            stream: false,
            format: 'json'
          })
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        this.processAIResponse(data.message.content || 'No response content');
      } catch (error) {
        console.error('Error sending message:', error);
        this.messages.push({ text: "Couldn't process your request.", sender: 'ai' });
      }
    },
    processAIResponse(response) {
      try {
        const parsedResponse = JSON.parse(response);
        if (parsedResponse.command === 'create_entity') {
          window.editor.createEntityFromAICommand(parsedResponse);
        }
        this.messages.push({ text: parsedResponse.message, sender: 'ai' });
      } catch (error) {
        console.error('Error parsing AI response:', error);
        this.messages.push({
          text: 'I had trouble understanding the response. Please try again.',
          sender: 'ai'
        });
      }
    }
  }
});



// Create global Vue instance
const editor = new Vue({
    el: '#editor',
    vuetify: new Vuetify(),
    data: function() {
        return {
            czml: null,
            filename: null,
            loadedFromFile: false,
            entities: [],
            entity: null,
            advanced: false,
            typeFilters: {},
            copyType: null,
            changes: {},
            dragover: false
        };
    },
    mounted: function() {
        const dropzone = this.$refs.uploadContainer;
        if(dropzone) {
            dropzone.addEventListener("dragenter", e => {
                e.preventDefault();
                this.dragover = true;
            });
            dropzone.addEventListener("dragleave", e => {
                e.preventDefault();
                this.dragover = false;
            });
            dropzone.addEventListener("dragover", e => {
                e.preventDefault();
                this.dragover = true;
            });
            dropzone.addEventListener("drop", e => {
                e.preventDefault();
                this.dragover = false;
                if(e.dataTransfer && e.dataTransfer.files) {
                    for (let f of e.dataTransfer.files) {
                        loadFile(f);
                    }
                }
            });
        }
    },
    methods: {
        selectEntity: function(entity) {
            viewer.selectedEntity = entity;
        },
        newEntity: function(entity) {
            this.filename = this.filename || 'document.czml';
            this.entities = [...this.entities, entity];
            this.entity = entity;
            this.selectEntity(entity);
        },
        updateHandler: function(value, field, feature) {
            this.changes[field] = {
                value: value,
                feature: feature
            };
        },
        flyToEntity: function() {
            if (this.entity) {
                viewer.flyTo(this.entity);
            }
        },
        isFolder: function(entity) {
            return entity.position === undefined && this.entities.some(e => {
                return e.parent && e.parent.id === entity.id;
            });
        },
        toCZML: function() {
            const w = new DocumentWriter();
            this.entities.forEach(e => {
                if (e.show) {
                    w.addEntity(e);
                }
            });
            const czmlObj = w.toJSON();
            this.czml = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(czmlObj));

            let link = document.createElement('A');
            link.href = this.czml;
            link.download = this.filename;
            link.click();
        },
        // Create entities from AI commands using the same logic as add-entities, etc.
        createEntityFromAICommand: function(command) {
            const { entityType, properties } = command;

            let entity;
            switch (entityType) {
                case 'billboard':
                    entity = createBillboardEntity(properties);
                    break;
                case 'polyline':
                    entity = createPolylineEntity(properties);
                    break;
                case 'polygon':
                    entity = createPolygonEntity(properties);
                    break;
                case 'label':
                    entity = createLabelEntity(properties);
                    break;
                default:
                    console.error('Unknown entity type from AI:', entityType);
                    return;
            }
            // Use the existing workflow
            this.newEntity(entity);
        }
    }
});

window.editor = editor;

function loadDataSourcePromise(dsPromise) {
    viewer.dataSources.add(dsPromise);
    dsPromise.then(ds => {
        applyDefaults(ds.entities.values);
        editor.entities = [
            ...editor.entities,
            ...ds.entities.values
        ];
    });
}

function handleFileSelect(evt) {
    for (let f of evt.target.files) {
        loadFile(f);
    }
}

function loadFile(file) {
    editor.filename = file.name.replace('.kml', '.czml').replace('.kmz', '.czml');
    editor.loadedFromFile = true;

    if (/vnd.google-earth/.test(file.type) || /\.kmz|\.kml/.test(file.name)) {
        loadDataSourcePromise(Cesium.KmlDataSource.load(file));
    }
    else if (/\.czml/.test(file.name)) {
        const reader = new FileReader();
        reader.onload = function() {
            let czmljson = JSON.parse(reader.result);
            czmljson.forEach(packet => {
                if (packet.billboard && packet.billboard.image && packet.billboard.image.reference) {
                    if (packet.billboard.image.reference.split('#')[0] === packet.id) {
                        let pb = new Cesium.PinBuilder();
                        packet.billboard.image = pb.fromText(
                            "X",
                            Cesium.Color.fromRandom({"alpha": 1.0}),
                            32).toDataURL();
                    }
                }
            });
            loadDataSourcePromise(Cesium.CzmlDataSource.load(czmljson));
        };
        reader.readAsText(file);
    }
    else if (/\.json|\.geojson/.test(file.name)) {
        const reader = new FileReader();
        reader.onload = function() {
            loadDataSourcePromise(Cesium.GeoJsonDataSource.load(JSON.parse(reader.result)));
        };
        reader.readAsText(file);
    }
    else {
        console.warn("Can't recognize file type");
    }
}

document.getElementById('file').addEventListener('change', handleFileSelect, false);

function viewerEntityChangeListener(selection) {
    editor.entity = selection;
    if (!selection) {
        editor.selectEntity(null);
    }
}

viewer.selectedEntityChanged.addEventListener(viewerEntityChangeListener);

export function disableSelectedEntityChangeListener() {
    viewer.selectedEntityChanged.removeEventListener(viewerEntityChangeListener);
    editor.$refs.addEntities.maximized = false;
}

export function enableSelectedEntityChangeListener() {
    viewer.selectedEntityChanged.addEventListener(viewerEntityChangeListener);
    editor.$refs.addEntities.maximized = true;
}

// Entity creation helpers, now defined here:
function createBillboardEntity({ position, scale = 1.0, color = '#FF0000', height = 0 }) {
    const pinBuilder = new Cesium.PinBuilder();
    const pinColor = Cesium.Color.fromCssColorString(color);
    const canvas = pinBuilder.fromColor(pinColor, scale * 50);

    return viewer.entities.add({
        name: 'AI Pin',
        position: Cesium.Cartesian3.fromDegrees(position[0], position[1], height),
        billboard: {
            image: canvas.toDataURL(),
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND
        }
    });
}

function createPolylineEntity({ positions, width = 2, material = {color: '#FF0000'} }) {
    // Make sure we have a valid hex color string
    const colorString = material.color || '#FF0000';
    const lineColor = Cesium.Color.fromCssColorString(colorString);

    return viewer.entities.add({
        name: 'AI Polyline',
        polyline: {
            // Positions as a raw array; no need for ConstantProperty since polygons now work with raw arrays.
            // If the editor requires `ConstantProperty`, wrap them, but first try raw arrays.
            positions: Cesium.Cartesian3.fromDegreesArrayHeights(
                positions.flatMap((p) => [p[0], p[1], p[2] || 0])
            ),
            width: width, // raw number is often fine, but if needed, wrap with `new Cesium.ConstantProperty(width)`.
            material: lineColor // Raw Cesium.Color; Cesium will handle it as a ColorMaterialProperty internally.
        }
    });
}


//function createPolylineEntity({ positions, width = 2, material = {color: '#FF0000'} }) {
//    return viewer.entities.add({
//      name: 'AI Polyline',
//      polyline: {
//        positions: new Cesium.ConstantProperty(
//          Cesium.Cartesian3.fromDegreesArrayHeights(
//            positions.flatMap(p => [p[0], p[1], p[2] || 0])
//          )
//        ),
//	width: new Cesium.ConstantProperty(2),
//        material: new Cesium.ConstantProperty(material.color)
//      }
//    });
//}


function createPolygonEntity({ positions, material = {color: '#FF0000'} }) {
    return viewer.entities.add({
      name: 'AI Polygon',
      polygon: {
        hierarchy: new Cesium.ConstantProperty(
          new Cesium.PolygonHierarchy(
            Cesium.Cartesian3.fromDegreesArrayHeights(
              positions.flatMap(p => [p[0], p[1], p[2] || 0])
            )
          )
        ),
        material: Cesium.Color.fromCssColorString(material.color),
        outline: new Cesium.ConstantProperty(true),
        outlineColor: new Cesium.ConstantProperty(Cesium.Color.BLACK),
        outlineWidth: new Cesium.ConstantProperty(2)
      }
    });
}


function createLabelEntity({ position, text = 'Label', fillColor = '#000000', scale = 1.0, height = 0 }) {
    return viewer.entities.add({
        name: 'AI Label',
        position: Cesium.Cartesian3.fromDegrees(position[0], position[1], height),
        label: {
            text,
            fillColor: Cesium.Color.fromCssColorString(fillColor),
            scale,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM
        }
    });
}


