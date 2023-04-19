import * as zip from "https://deno.land/x/zipjs/index.js";

export function czmlDataSourceMixin(CesiumCzmlDS) {
    CesiumCzmlDS.__load = CesiumCzmlDS.load;

    CesiumCzmlDS.load = function(czml, options) {
        if (isCzmz(czml)) {
            const url = new Cesium.Resource(czml).toString();
            const reader = new zip.ZipReader(new zip.BlobReader(file));

            reader.getEntries().then(async entries => {
                const entriesMap = new Map();
                for (let entry of entries) {
                    const blob = await entry.getData(new zip.BlobWriter());
                    const blobURL = URL.createObjectURL(blob);

                    entriesMap.set(entry.filename, blobURL);
                    entriesMap.set('/' + entry.filename, blobURL);
                }
    
                const documentEntry = entries.find(e => /\.czml$/i.test(e.filename));
                entriesMap.get(documentEntry.filename);

                const promise = CesiumCzmlDS.__load(new Cesium.Resource({
                    url: URL.createObjectURL(blob),
                    proxy: {
                        getURL: url => {
                            if (/^blob:/.test(url)) {
                                const blobId = new URL(url.replace(/^blob:/, '')).pathname;
                                const blobUrl = entriesMap.get(blobId);
                                return blobUrl ? blobUrl : url;
                            }
                            console.warn('Url not found inside czmz', url);
                            return url;
                        }
                    }
                }), options);

                promise.then(ds => {
                    ds.destroy = function () {
                        for (let blobUrl of entriesMap.values()) {
                            URL.revokeObjectURL(blobUrl);
                        }
                    }
                });

                return promise;
                
            });
        }
        else {
            return CesiumCzmlDS.__load(czml, options);
        }
    }
}

// src { Resource | string | object }
function isCzmz(src) {
    
    if (typeof src === 'string' || src instanceof String) {
        return /.czmz&/.test(new URL(src).pathname) 
    }
    
    // If it's a resource
    if (src.url) {
        return /.czmz&/.test(new URL(src.url).pathname) 
    }
    
    // if it's already loaded Czml object - it's czml
    return false;
}
