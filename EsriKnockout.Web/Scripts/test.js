require(["Scripts/models.js",
         "dojo/domReady"],
function (models, domReady) {
    var viewModel;

    domReady(domIsReady);

    function domIsReady() {
        //Setup viewmodel and tell Knockout to track it.
        viewModel = new models.CensusViewModel(loadTestData);
        ko.applyBindings(viewModel);

        viewModel.loadData();

        //Open the modal dialog
        $('#censusDetailModal').modal('show');
    }

    function loadTestData() {
        var testFeature = {
            attributes: {
                STATE_NAME: "TestState",
                AGE_5_17: "1",
                AGE_18_21: "2",
                AGE_22_29: "3",
                AGE_30_39: "4",
                AGE_40_49: "5",
                AGE_50_64: "6",
                AGE_65_UP: "7"
            }
        }

        var model = new models.CensusModel(testFeature);

        viewModel.setFromModel(model);
    }
});
