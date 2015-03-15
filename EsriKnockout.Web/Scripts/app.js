require(["esri/map",
         "esri/tasks/IdentifyTask",
         "esri/tasks/IdentifyParameters",
         "esri/layers/FeatureLayer",
         "esri/sniff",
         "dojox/mobile",
         "dojox/mobile/parser",
         "dojo/dom",
         "dojo/on",
         "Scripts/config.js",
         "Scripts/models.js",
         "dojo/domReady"],
function (Map, identifyTask, identifyParameters, featureLayer, has, mobile, parser, dom, on, config, models, domReady) {
    var viewModel;
    var map, viewModel, mapOnClickEventHandler, mapOnLoadEventHandler;

    /*******************************************************************************
    MAP FUNCTIONS
    *******************************************************************************/
    //Initialize support for mobile devices
    function initMobileSupport() {
        document.dojoClick = false;
        parser.parse();
        mobile.hideAddressBar();

        if (window.onorientationchange !== undefined && !has("android")) {
            on(window, "orientationchange", onOrientationChangedOrResize);
        } else {
            on(window, "resize", onOrientationChangedOrResize);
        }
    }

    //Initialize the map, map layers, and events.
    function initMap() {
        if (!map) {
            var initialExtent = new esri.geometry.Extent(-365861.0348959854, 40264.92302540067, 1435534.9518959855, 908239.5229745994, new esri.SpatialReference({ wkid: 3071 }));

            //Create map
            map = new esri.Map("censusMap", {
                extent: initialExtent,
                logo: false,
                showAttribution: false,
                autoResize: false
            });

            //Create and add PLSS layer
            statesLayer = addMapLayer(map, config.censusServiceUrl, "dynamic");

            removeEventHandler(mapOnLoadEventHandler);
            mapOnLoadEventHandler = map.on("load", onMapLoad);
        }
    }

    //Helper for adding tiled or dynamic map layers to the map.
    function addMapLayer(baseMap, mapServiceUrl, serviceType) {
        var layer;

        if (mapServiceUrl && mapServiceUrl != "") {
            switch (serviceType) {
                case "tiled":
                    layer = new esri.layers.ArcGISTiledMapServiceLayer(mapServiceUrl, { opacity: 1.0 });
                    break;
                case "dynamic":
                    layer = new esri.layers.ArcGISDynamicMapServiceLayer(mapServiceUrl, { opacity: 1.0 });
                    layer.setDisableClientCaching(true);
                    break;
                default:
                    alert("Map service type '" + serviceType + "' not supported.");
            }

            if (baseMap) {
                map.addLayer(layer);
            }
        }
        return layer;
    }

    //When map loads setup handlers and make sure map is positioned properly within the window.
    function onMapLoad(evt) {
        removeEventHandler(mapOnClickEventHandler);
        mapOnClickEventHandler = map.on("click", onMapClicked);

        repositionMap();
    }

    //When the map is clicked we want to load the data from the map service for that click point.
    function onMapClicked(evt) {
        if (viewModel) {
            viewModel.loadData(evt.mapPoint);
        }

        //Open the modal dialog
        $('#censusDetailModal').modal('show');
    }

    function onOrientationChangedOrResize() {
        repositionMap();
    }

    //Resets map.  Good for when browser window size or orientation changes.
    function repositionMap(doRecenter) {

        if (map) {
            map.resize();
            map.reposition();
        }
    }

    //Simple helper to remove event handlers.
    function removeEventHandler(eventHandler) {
        if (eventHandler) {
            eventHandler.remove();
        }
    }

    //Run the identify against the map service.
    function identifyFeatures(point) {

        //create identify tasks and setup parameters
        var identifyTask = new esri.tasks.IdentifyTask(config.censusServiceUrl);
        var identifyParams = new esri.tasks.IdentifyParameters();
        identifyParams.tolerance = config.identifyTolerance;
        identifyParams.returnGeometry = true;
        if (config.layerIds && config.layerIds.length > 0) {
            identifyParams.layerIds = config.layerIds;
        }
        identifyParams.layerOption = esri.tasks.IdentifyParameters.LAYER_OPTION_ALL;
        identifyParams.width = map.width;
        identifyParams.height = map.height;
        identifyParams.geometry = point;
        identifyParams.mapExtent = map.extent;

        on.once(identifyTask, "complete", onLoadDataComplete);

        identifyTask.execute(identifyParams);
    }

    //Handles results of the identify.
    function onLoadDataComplete(identifyResult) {
        var census;

        if (identifyResult && identifyResult.results.length > 0) {
            if (identifyResult.results[0].layerName == "states") {
                //Create a new model object with the data returned from the identify call 
                //and set the viewmodel with it.
                viewModel.setFromModel(new models.CensusModel(identifyResult.results[0].feature));
            }
        }
    }

    //The delegate for loading map service data into the viewmodel
    function loadDataFromMapService(point) {
        identifyFeatures(point);
    }

    /*******************************************************************************
    START HERE
    *******************************************************************************/
    domReady(domIsReady);

    function domIsReady() {
        //Setup viewmodel and tell Knockout to track it.
        viewModel = new models.CensusViewModel(loadDataFromMapService);
        ko.applyBindings(viewModel);

        //Initialize things and get the map giong.
        initMobileSupport();
        initMap();
    }
});
