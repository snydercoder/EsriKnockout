define({
    /*******************************************************************************
    VIEW AND VIEWMODEL
    *******************************************************************************/
    CensusModel:    function (feature) {
                        this.stateName = feature.attributes.STATE_NAME;
                        this.age5_17 = feature.attributes.AGE_5_17;
                        this.age18_21 = feature.attributes.AGE_18_21;
                        this.age22_29 = feature.attributes.AGE_22_29;
                        this.age30_39 = feature.attributes.AGE_30_39;
                        this.age40_49 = feature.attributes.AGE_40_49;
                        this.age50_64 = feature.attributes.AGE_50_64;
                        this.age65up = feature.attributes.AGE_65_UP;
    },

    CensusViewModel:    function (loadDataDelegate) {
                            var self = this;
                            _loadDataDelegate = loadDataDelegate;

                            //Setup viewmodel observables
                            self.stateName = ko.observable();
                            self.age5_17 = ko.observable();
                            self.age18_21 = ko.observable();
                            self.age22_29 = ko.observable();
                            self.age30_39 = ko.observable();
                            self.age40_49 = ko.observable();
                            self.age50_64 = ko.observable();
                            self.age65up = ko.observable();

                            self.loadData = function (point) {
                                //Identify the features
                                _loadDataDelegate(point);
                            }

                            //This is where the model data is connected to the viewmodel properties
                            self.setFromModel = function (model) {
                                self.stateName(model.stateName);
                                self.age5_17(model.age5_17);
                                self.age18_21(model.age18_21);
                                self.age22_29(model.age22_29);
                                self.age30_39(model.age30_39);
                                self.age40_49(model.age40_49);
                                self.age50_64(model.age50_64);
                                self.age65up(model.age65up);
                            }                                 
    }
});
