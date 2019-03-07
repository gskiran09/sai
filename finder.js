var singlePageProgramFinder = {

    // handle bar template file name        
    fieldOfStudytemplate: "/components/singlepage-program-finder/prefered-programs.handlebars",
    degreeLeveltemplate: "/components/singlepage-program-finder/degree-levels.handlebars",
    areaOfInteresttemplate: "/components/singlepage-program-finder/area-of-interest.handlebars",
    programFinderResulttemplate: "/components/singlepage-program-finder/program-finder-result.handlebars",
    plctServiceUrl: "/api/plct/3/uopx",
    plctValidationUrl: "/api/validation-service/1/uopx",
    //program tiles filtering var's
    oldSelectedFOSTile: '',
    oldSelectedDegreeLevelTile: '',
    oldSelectedAOITile: '',
    progressBarClickedFlag: false,
    progressBarClickedItem: '',
    progressBarShowFlag: false,
    jsonResponse: "",
    zipcodeCounter:0,
    timerDelay : 50,
    allProgramsObj: {},
    orgDetail: "/locations?siteFinId=",
    campusName: "",
    campusZipCode:"",
    campusStateAbb: "",
    certificateArray: ["certificate", "undergraduate-certificate", "graduate-certificate", "associates-certificate"],
    disabledAOIArray: ["hospitality","retail-management"],
    getDesktopNavHeight: 80,
    getMobileNavHeight:50,
    KEYCODE : {
        DOWN: 40,
        LEFT: 37,
        RIGHT: 39,
        SPACE: 32,
        UP: 38,
        ENTER: 13
    },
    getTypeOfPressedFlag:false,
    
    //flag for additional and top programs 
    programTypeFlag: {
        primary: 0,
        secondary: 0
    },

    //it updates html of the element with response of handlebars 

    updateElementHtml: function(tempalteFilePath, jsonObj, $el) {
        return UopxSearch.templates.execute(tempalteFilePath, jsonObj).done(function(html) {
            $el.html(html);
        });
    },

    getZipCode: function() {
        // check the onload anonymous function on how zip code value is set on input fields
        return $(".zipCodeInputBox").val();
    },

    showZipErrorMsg: function() {
        $('.zipErrorMsg').removeClass("hide");
        $("#singlePageProgramFinder-Carousel").addClass("hide");
        if ($("#pfFilterBoxLocationInputSticky:visible")) {
            $("#pfFilterBoxLocationInputSticky:visible").focus();
        } else {
            $("#pfFilterBoxLocationInput").focus();
        }
    },
    
    //it will build service URLs based on the zip code
    getServiceURL: function(zip) {

        var serviceURL = singlePageProgramFinder.plctServiceUrl + "/programs/availability/fos?postalCode=" + zip;
        
        // check for certificate filter
        if (spfDialogConfig.isCertificateFinder === 'true') {
            serviceURL = serviceURL + "&programType=certificate";
        }
        return serviceURL;
    },
    

    updateZipCode: function(newZipCode) {
        // update the value on both the fields
        $(".zipCodeInputBox").val(newZipCode);
    },

    // get the selected preferred FOS
    getSelectedPreferredFOS: function() {
    	if(singlePageProgramFinder.getDataForBackButton()){
    		return singlePageProgramFinder.getDataForBackButton().fos;
    	}
        return spfDialogConfig && spfDialogConfig.fosFilters;
    },
    // get the selected degree level
    getSelectedDegreeLevel: function() {
    	if(singlePageProgramFinder.getDataForBackButton()){
    		return singlePageProgramFinder.getDataForBackButton().degree;
    	}
        return spfDialogConfig && spfDialogConfig.plFilters;
    },
    // get the selected area of interest
    getSelectedAreaOfInterest: function() {
    	if(singlePageProgramFinder.getDataForBackButton()){
    		return singlePageProgramFinder.getDataForBackButton().aoi;
    	}
        return spfDialogConfig && spfDialogConfig.aoiFilters;
    },
    
    
    storeDataForBackButton: function(buttonvalue,event) {
        //console.log("result"+buttonvalue);
        if(typeof(_satellite) !== "undefined"){
            _satellite.setVar('result', buttonvalue );
            _satellite.track('programFinder-result');
        }
        var selectedFOS = $("#preferedPrograms .progItemSelected > input").val() ? $("#preferedPrograms .progItemSelected > input").val() : "view-all",
                degreeLevel = $("#degreeLevels .progItemSelected > input").val(),
                areaOfInterest = $("#areaOfInterest .progItemSelected > input").val();
    	
    	var stateObj = { 'fos': selectedFOS, 'degree' : degreeLevel, 'aoi':areaOfInterest };
    	// store the values for back button
    	if(history){
        	history.pushState(stateObj, "User Selections");
    	}
    },
	
	adjustResultSectionCtaButton: function(){
		if(window.matchMedia('(min-width: 992px)').matches){
			$('.parentPrograms-icon .parentPrograms-item .prog-body').css('height','');
			$('.parentPrograms-icon').each(function(){
				var mainBlockHeight = $(this).find('.mainResult-block').height();
				var titleHeight = $(this).find('.parentPrograms-item .prog-heading').height();
				var ctaButtonHeight = $(this).find('.parentPrograms-item .prog-ctaButton').height();
				var finalHeight = mainBlockHeight - (titleHeight + ctaButtonHeight);
				$(this).find('.parentPrograms-item .prog-body').css('height',finalHeight+'px');
			});
		}else{
			$('.parentPrograms-icon .parentPrograms-item .prog-body').css('height','');
		}
	},
    
    
    getDataForBackButton: function() {
    	return (history && history.state) ? history.state : undefined; 
    },   
    
    // to reset the history object
    resetBackButtonData: function() {
    	if(history && history.state){
    		history.pushState(undefined, "User Selections");
    	} 
    }, 

    setNextPreviousAttributes: function(currentSection){
        var arrayCheck = [];

        $('.'+currentSection+' .main-block:visible').each(function(){	
            arrayCheck.push(this.id);
        });

        $('.'+currentSection+' .main-block:visible').each(function(index){
            if(index == 0){
                $(this).attr("data-next-element",arrayCheck[index+1]);
                $(this).attr("data-prev-element",arrayCheck[$('.'+currentSection+' .main-block:visible').length -1]);
            }else if($('.'+currentSection+' .main-block:visible').length -1 != index){
                $(this).attr("data-next-element",arrayCheck[index+1]);
                $(this).attr("data-prev-element",arrayCheck[index-1]);
            }else{
                $(this).attr("data-next-element",arrayCheck[0]);
                $(this).attr("data-prev-element",arrayCheck[index-1]);
            }
            
        });
    },

    // function to process JSON data and generate the HTML content for preferred programs through handle bar
    loadDataToFOS: function(fosData) {
        this.updateElementHtml(this.fieldOfStudytemplate, fosData, $(".preferedProgramsItems")).then(function() {
            setTimeout(function() {
                singlePageProgramFinder.setEqualIconHeight("topPrograms");
                singlePageProgramFinder.setEqualIconHeight("secondaryPrograms");
                singlePageProgramFinder.setEqualHeightTiles("topPrograms");
                singlePageProgramFinder.setEqualHeightTiles("secondaryPrograms");
                singlePageProgramFinder.tileRefactor();
                if(singlePageProgramFinder.programTypeFlag.primary === 0){
                    $(".topProgram").hide();
                    $(".topPrograms").hide();
                } else if(singlePageProgramFinder.programTypeFlag.secondary === 0){
                    $(".additionalProgram").hide();
                    $(".secondaryPrograms").hide();
                }
                var selectedFOS = singlePageProgramFinder.getSelectedPreferredFOS();
                // to fix the progress bar issue
                adjustProgressBar();
                if (selectedFOS && selectedFOS != 'Program Finder Results') {
                	// add "autoSelected" class to differentiate user clicks and programmatic clicks (for pre-selected values)
                	$(".preferedProgramsItems .fosValue[value='" + selectedFOS + "']").parent().addClass("autoSelected").trigger('click').addClass("progItemSelected");
                } else if (singlePageProgramFinder.getSelectedDegreeLevel() && singlePageProgramFinder.getSelectedDegreeLevel() != 'Program Finder Results') {
                	// add "autoSelected" class to differentiate user clicks and programmatic clicks (for pre-selected values)
                	$(".preferedProgramsItems .fosValue[value='view-all']").parent().addClass("autoSelected").trigger('click').addClass("progItemSelected");
                }
            }, 1000)
            singlePageProgramFinder.setNextPreviousAttributes("preferedProgramsItems");
        })
    },

    // function to process JSON data and generate the HTML content for degree through handle bar
    loadDataToDegreeLevel: function (degreeData) {
        this.updateElementHtml(this.degreeLeveltemplate, degreeData, $(".degreeLevelItems")).then(function () {
            singlePageProgramFinder.tileRefactor();
            var selectedDegree = singlePageProgramFinder.getSelectedDegreeLevel();
            if (selectedDegree && selectedDegree != 'Program Finder Results') {
            	// add "autoSelected" class to differentiate user clicks and programmatic clicks (for pre-selected values)
                $(".degreeLevelItems .degreeLevelValue[value='" + selectedDegree + "']").parent().addClass("autoSelected").trigger('click').addClass("progItemSelected");
            }
            setTimeout(function() {
            	singlePageProgramFinder.callingEqualHeightBlocks("programsItems");
            }, 500);
            singlePageProgramFinder.setNextPreviousAttributes("degreeLevelItems");
        });
    },

    // function to process JSON data and generate the HTML content for area of interest through handle bar
    loadDataToAreaOfInterest: function (areaOfInterestData) {
        this.updateElementHtml(this.areaOfInteresttemplate, areaOfInterestData, $(".areaOfInterestParentItemsDiv")).then(function () {
            singlePageProgramFinder.tileRefactor();
            var selectedAOI = singlePageProgramFinder.getSelectedAreaOfInterest();
            if (selectedAOI && selectedAOI != 'Program Finder Results') {
            	// add "autoSelected" class to differentiate user clicks and programmatic clicks (for pre-selected values)
            	$(".areaOfInterestItems .aoiValue[value='" + selectedAOI + "']").parent().addClass("autoSelected").trigger('click').addClass("progItemSelected");
            }
            setTimeout(function() {
    			singlePageProgramFinder.callingEqualHeightBlocks("areaOfInterestItems");
            }, 500);
            singlePageProgramFinder.setNextPreviousAttributes("areaOfInterestParentItemsDiv");
        });
    },

    // function to display the final result through handle bar
    loadDataToProgramFinderResult: function(programResultsJSONData) {
        var childProgramFlag = "hide";
        var parentProgramFlag = "hide";
        
        var childProgramArray = programResultsJSONData.programs.filter(function(programResultsObj) {
            return programResultsObj.attributes && !programResultsObj.attributes.isParentProgram;
        });

        // check if there any child programs to display the section 
        if (childProgramArray.length >= 1) {
            // quotes is required for handlebar condition to work
            childProgramFlag = "true";
        }
         // check if there any parent programs to display
        if (programResultsJSONData.programs.length > childProgramArray.length) {
            // quotes is required for handlebar condition to work
            parentProgramFlag = "true";
        }
        
        // add unique id to all the results object to fix ADA issue
        var idCounter = 1000;
        $.map(programResultsJSONData.programs, function(program){
        	program.attributes.adaId = idCounter++;
        	idCounter++;
        });
        
        // update the parent program flag in JSON object
        programResultsJSONData.childProgramFlag = childProgramFlag;
        // update the child program flag in JSON object
        programResultsJSONData.parentProgramFlag = parentProgramFlag;
        
        // add secondary marketing text from author dialog
        programResultsJSONData.secondarymarketingText = spfDialogConfig.secondarymarketingText;
        this.updateElementHtml(this.programFinderResulttemplate, programResultsJSONData, $(".programFinderResultItems")).then(function(){
			setTimeout(function() {			  
				singlePageProgramFinder.adjustResultSectionCtaButton();
			},500);
		});
    },

    // to combine the API data and author dialog configurations
    filterFOSData: function() {

        var programDialogData = spfDialogConfig.fosIconsFinal;
        var preferedProgramsDialog = JSON.parse(programDialogData);

        var zipCodeInputBox = singlePageProgramFinder.getZipCode(),
            fosAPIURL = singlePageProgramFinder.getServiceURL(zipCodeInputBox);

        // call the PLCT API to get the data based on zip code
        singlePageProgramFinder.getJsonResponse(fosAPIURL).then(function(apiResponse) {

            // check if the API response has FOS data
            if (!_.isEmpty(apiResponse.fieldOfStudy)) {
                // store the API response in a global variable (will be accessed in other methods)
                singlePageProgramFinder.jsonResponse = apiResponse;
                
                // get all the program objects and store it in a map as key/value pait
                // the results will be used to include programs based on parent program attribute in child program
                $.map(singlePageProgramFinder.jsonResponse.fieldOfStudy, function(fosObj) {
                    $.map(fosObj.areas, function(areaObj) {
                        $.map(areaObj.levels, function(levelObj) {
                            $.map(levelObj.programs, function(programObj) {
                                // check to pull only parent programs
                                if(programObj.attributes && programObj.attributes.isParentProgram){
                                    singlePageProgramFinder.allProgramsObj[programObj.name] = programObj
                                }
                            });
                                
                        });
                    });
                });
                
                // hide the zip code error message and show the program finder section
                $('.zipErrorMsg').addClass('hide');
                $('#preferedPrograms').removeClass('hide');
 
                // process the response and display FOS data using handle bars
                var fosJson = apiResponse.fieldOfStudy;
                var fosDataForHandleBar = {};
                var fosArrray = [];
                fosDataForHandleBar.fos = fosArrray;
                fosDataForHandleBar.topProgramLabel = spfDialogConfig.topProgramLabel;
                fosDataForHandleBar.additionalProgramLabel = spfDialogConfig.additionalProgramLabel;

                $.each(fosJson, function(key, fos) {

                    // get the matching array from dialog
                    var dialogArray = $.grep(preferedProgramsDialog.fos, function(element, index) {
                        return element.foslist == fos.name;
                    });

                    // create the individual FOS object
                    var fosObject = {};
                    fosObject.foslist = fos.name;

                    if (dialogArray.length > 0) {
                        fosObject.iconImage = dialogArray[0].iconImage;
                        fosObject.iconHeading = dialogArray[0].iconHeading;
                        fosObject.iconSubHeading = dialogArray[0].iconSubHeading;
                        fosObject.programType = dialogArray[0].programType;
                        if(fosObject.programType == "additionalProgram"){

                            singlePageProgramFinder.programTypeFlag.secondary = singlePageProgramFinder.programTypeFlag.secondary + 1;

                        } else if(fosObject.programType == "topProgram"){

                            singlePageProgramFinder.programTypeFlag.primary = singlePageProgramFinder.programTypeFlag.primary + 1;

                        }
                    } else {
                        fosObject.iconImage = "";
                        fosObject.iconHeading = fos.title;
                        fosObject.iconSubHeading = "";
                        fosObject.programType = "additionalProgram";
                    }

                    // add it to the array
                    fosArrray.push(fosObject);

                });

                // add view-all object for degree deep linking
                fosArrray.push({
                    "foslist": "view-all",
                    "iconImage": "",
                    "iconHeading": "",
                    "iconSubHeading": "",
                    "programType": "additionalProgram",
                    "displayFlag": "hide"
                });

                singlePageProgramFinder.loadDataToFOS(fosDataForHandleBar);

            } else {
            	// hide the program finder section and display the error message
                $('.zipErrorMsg').removeClass('hide');
                $('#preferedPrograms').addClass('hide');
            }

        });

    },

    // get degree data based on user's selection
    filterDegreeResults: function(selectedFOS) {

        var degreeIconfinal = spfDialogConfig.degreeLevelIconFinal,
            degreeAreasDialog = JSON.parse(degreeIconfinal);

        var degreeAPIData = singlePageProgramFinder.getDegreeData(singlePageProgramFinder.jsonResponse, selectedFOS);

        // process the response and display Degree data using handle bars
        var degreeDataForHandleBar = {};
        var degreeArrray = [];
        degreeDataForHandleBar.degreeLevel = degreeArrray;

        $.each(degreeAPIData, function(key, degree) {

            // get the matching array from dialog
            var dialogArray = $.grep(degreeAreasDialog.degreeLevel, function(element, index) {
                return element.degreeLevellist == degree.name;
            });

            // create the individual FOS object
            var degreeObject = {};

            if (dialogArray.length > 0) {
                degreeObject.degreeLevellist = dialogArray[0].degreeLevellist;
                degreeObject.iconImage = dialogArray[0].iconImage;
                degreeObject.iconHeading = dialogArray[0].iconHeading;
                degreeObject.iconSubHeading = dialogArray[0].iconSubHeading;

            } else {
                degreeObject.degreeLevellist = degree.name;
                degreeObject.iconImage = "";
                degreeObject.iconHeading = degree.title;
                degreeObject.iconSubHeading = "";
            };

            // add it to the array
            degreeArrray.push(degreeObject);

        });

        singlePageProgramFinder.loadDataToDegreeLevel(degreeDataForHandleBar);

    },

    getDegreeData: function(jsonData, selectedFOS) {

        var fosObjArray = [];

        if (selectedFOS === "view-all") {
            fosObjArray = jsonData.fieldOfStudy;
        } else {
            fosObjArray = $.grep(jsonData.fieldOfStudy, function(element, index) {
                return element.name == selectedFOS;
            });
        }

        // get all the degree levels
        var degreeArray = $.map(fosObjArray, function(fosObj) {
            return $.map(fosObj.areas, function(areasObj) {
                return $.map(areasObj.levels, function(levelObj) {
                    return {
                        "name": levelObj.name,
                        "title": levelObj.title
                    };
                });
            });
        });

        // remove duplicates
        degreeArray = singlePageProgramFinder.removeDuplicates(degreeArray, "name");

        // check for certificate program
        var certArray = $.grep(degreeArray, function(element, index) {
            return element.name.includes("certificate") ? true : false;
        });

        // suppress certificate degrees
        degreeArray = $.grep(degreeArray, function(element, index) {
            return singlePageProgramFinder.certificateArray.indexOf(element.name) == -1;
        });
		
        // suppress non-degree
        degreeArray = $.grep(degreeArray, function(element, index) {
            return ["nondegree"].indexOf(element.name) == -1;
        }); 
		

        // add certificate
        if (certArray.length > 0) {
            degreeArray.push({
                "name": "certificate",
                "title": "Certificate"
            });
        }

        // add view-all
        if(!(window.location.href.indexOf("certificate") > -1)){
            degreeArray.push({
                "name": "view-all",
                "title": "View All"
            });
        }

        // apply sorting
        for(i=0;i<degreeArray.length;i++){
            if(degreeArray[i].hasOwnProperty("name") && degreeArray[i].name == "associates"){
               degreeArray[i].rank = 1;
            } else if(degreeArray[i].hasOwnProperty("name") && degreeArray[i].name == "bachelors"){
                degreeArray[i].rank = 2;
            } else if(degreeArray[i].hasOwnProperty("name") && degreeArray[i].name == "masters"){
                degreeArray[i].rank = 3;
            } else if(degreeArray[i].hasOwnProperty("name") && degreeArray[i].name == "doctoral"){
                degreeArray[i].rank = 4;
            } else if(degreeArray[i].hasOwnProperty("name") && degreeArray[i].name == "certificate"){
                degreeArray[i].rank = 5;
            } else if(degreeArray[i].hasOwnProperty("name") && degreeArray[i].name == "view-all"){
                degreeArray[i].rank = 6;
            }
        }

        degreeArray.sort(function(a,b){return a.rank-b.rank});
        
        return degreeArray;

    },

    removeDuplicates: function(array, propertyName) {
        var distinctArray = [],
            distinctVal = [];

        $.each(array, function(index, element) {
			if(element !== undefined){
                if (distinctVal.indexOf(element[propertyName]) == -1) {
                    distinctVal.push(element[propertyName]);
                    distinctArray.push(element);
                 }
            }
        });

        return distinctArray;
    },

    filterAreasOfInterest: function(preferedPrograms, degreeLevels) {

        var aoiDialogstr = spfDialogConfig.aoiIconFinal,
            aoiDialog = JSON.parse(aoiDialogstr);

        var aoiAPIData = singlePageProgramFinder.getAreasOfInterestData(singlePageProgramFinder.jsonResponse, preferedPrograms, degreeLevels);

        // process the response and display AOI data using handle bars
        var aoiDataForHandleBar = {};
        var aoiArrray = [];
        aoiDataForHandleBar.areaOfInterest = aoiArrray;

        $.each(aoiAPIData, function(key, aoi) {

            // get the matching array from dialog
            var dialogArray = $.grep(aoiDialog.areaOfInterest, function(element, index) {
                return element.aoilist == aoi.name;
            });

            // create the individual FOS object
            var aoiObject = {};

            if (dialogArray.length > 0) {
                aoiObject.aoilist = dialogArray[0].aoilist;
                aoiObject.iconImage = dialogArray[0].iconImage;
                aoiObject.iconHeading = dialogArray[0].iconHeading;
                aoiObject.iconSubHeading = dialogArray[0].iconSubHeading;

            } else {
                aoiObject.aoilist = aoi.name;
                aoiObject.iconImage = "";
                aoiObject.iconHeading = aoi.title;
                aoiObject.iconSubHeading = "";
            };

            // add it to the array
            aoiArrray.push(aoiObject);

        });

        singlePageProgramFinder.loadDataToAreaOfInterest(aoiDataForHandleBar);
    },

    getAreasOfInterestData: function(jsonData, selectedFOS, degreeLevels) {

        var fosObjArray = [];

        if (selectedFOS === "view-all") {
            fosObjArray = jsonData.fieldOfStudy;
        } else {
            fosObjArray = $.grep(jsonData.fieldOfStudy, function(element, index) {
                return element.name == selectedFOS;
            });
        }

        // get all the Area of Interest
        var aoiAllArray = $.map(fosObjArray, function(fosObj) {
            return fosObj.areas
        });

        // degree levels can be view-all, certificate or the acutal degree
        var aoiArray = $.grep(aoiAllArray, function(element, index) {
            // do not show Hospitality and Retail Management
            if (singlePageProgramFinder.disabledAOIArray.indexOf(element.name) > -1){
                return false;
            } else if (degreeLevels == "view-all") {
                return true;
            }else {
                for (var i = 0; i < element.levels.length; i++) {
                    if (degreeLevels == "certificate" && singlePageProgramFinder.certificateArray.indexOf(element.levels[i].name) > -1) {
                        return true;
                    } else if (element.levels[i].name == degreeLevels) {
                        return true;
                    }
                }
                return false;
            }
        });

        // apply sorting
        aoiArray = aoiArray.sort(function(a, b) {
            return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
        });

        return aoiArray;

    },

    filterProgramFinderResults: function(areaOfInterest) {
        var selectedFOS = $("#preferedPrograms .progItemSelected > input").val() ? $("#preferedPrograms .progItemSelected > input").val() : "view-all",
            degreeLevels = $("#degreeLevels .progItemSelected > input").val(),
            programResults = {};

        if(window.location.href.indexOf("certificate") > -1){
            degreeLevels = "certificate";
        }
        var searchResultsData = singlePageProgramFinder.getProgramFinderResultsData(singlePageProgramFinder.jsonResponse, selectedFOS, degreeLevels, areaOfInterest);

        // now check the parent program attribute for all child programs and include them in the results
        $.map(searchResultsData, function(programResultsObj) {
            if(programResultsObj.attributes && !programResultsObj.attributes.isParentProgram && programResultsObj.attributes.parentProgramName){
                searchResultsData.push(singlePageProgramFinder.allProgramsObj[programResultsObj.attributes.parentProgramName]);
            }
        });        
        
        // remove duplicate programs
        searchResultsData = singlePageProgramFinder.removeDuplicates(searchResultsData, "name");

        // apply sorting
        searchResultsData = searchResultsData.sort(function(a, b) {
            return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
        });
        
        // add it to the response so that handle bar can display the results
        programResults.programs = searchResultsData;

        singlePageProgramFinder.loadDataToProgramFinderResult(programResults);

    },

    getProgramFinderResultsData: function(jsonData, selectedFOS, degreeLevels, areaOfInterest) {

        var fosObjArray = [];

        if (selectedFOS === "view-all") {
            fosObjArray = jsonData.fieldOfStudy;
        } else {
            fosObjArray = $.grep(jsonData.fieldOfStudy, function(element, index) {
                return element.name == selectedFOS;
            });
        }

        // get all the Area of Interest
        var aoiAllArray = $.map(fosObjArray, function(fosObj) {
            return fosObj.areas
        });

        var aoiArray = $.grep(aoiAllArray, function(element, index) {
            if (element.name == areaOfInterest) {
                return true;
            } else {
                return false;
            }
        });

        var resultsArray = $.map( aoiArray, function( aoiObj ) {
            return $.map(aoiObj.levels, function( levelObj ) {
                
                // degree levels can be view-all, certificate or the actual degree
                if(degreeLevels == "view-all"){
                    return $.map(levelObj.programs, function( programsObj ) {
                        return programsObj;
                    });
                }
                else{
                    if(degreeLevels == "certificate" && singlePageProgramFinder.certificateArray.indexOf(levelObj.name) > -1){
                        return $.map(levelObj.programs, function( programsObj ) {
                            return programsObj;
                        });
                    }
                    else if(levelObj.name == degreeLevels){
                        return $.map(levelObj.programs, function( programsObj ) {
                            return programsObj;
                        });
                    }
                }
            });
        });

        return resultsArray;
    },
    
    
    getJsonResponse: function(url) {
        return $.ajax({
            type: "GET",
            url: url,
            cache: false,
            headers: {
                Accept: "application/json; charset=utf-8",
                "Content-Type": "application/json; charset=utf-8"
            },
            contentType: "application/json"

        }).done(function(res) {
            return res
        })
    },

    setEqualHeightTiles: function(currentItem) {
        /* for all Items */
        var itemH = 0;
        $('.' + currentItem + ' .prog-block').css('height', '');
        $('.' + currentItem + ' .prog-block').each(function() {
            if (itemH < $(this).height()) {
                itemH = $(this).height();
            }
        });
        $('.' + currentItem + ' .prog-block').height(itemH);
    },

    setEqualIconHeight: function(currentItem) {
        /* for all icon */
        var iconH = 0;
        $('.' + currentItem + ' .prog-block').each(function() {
            var tempIconH = $(this).find('.imgBlock img').height();
            if (iconH < tempIconH) {
                iconH = tempIconH;
            }
        });
        $('.' + currentItem + ' .prog-block .imgBlock').height(iconH);
    },

    callingEqualHeightBlocks: function(catchLevelType) {
        setTimeout(function() {
            singlePageProgramFinder.setEqualIconHeight(catchLevelType);
            singlePageProgramFinder.setEqualHeightTiles(catchLevelType); //"topPrograms" parent div of items
        }, 600);
    },

    tileRefactor: function(){
        if($(window).width() < 414){
            $(".prog-block").removeClass("col-xs-6");$(".prog-block").addClass("col-xs-12");
        } else {
            $(".prog-block").removeClass("col-xs-12");$(".prog-block").addClass("col-xs-6");
        }                  
    },
    setRadioGroupFeature: function(keyCodeValue){
        switch (keyCodeValue) {
            case singlePageProgramFinder.KEYCODE.DOWN:
            case singlePageProgramFinder.KEYCODE.RIGHT: 
                singlePageProgramFinder.getTypeOfPressedFlag = true;
                return true;
                
            case singlePageProgramFinder.KEYCODE.UP:
            case singlePageProgramFinder.KEYCODE.LEFT:
                singlePageProgramFinder.getTypeOfPressedFlag = true;
                return true;

            case singlePageProgramFinder.KEYCODE.SPACE:
            case singlePageProgramFinder.KEYCODE.ENTER:	
                return true;
        }
        return false;
    },

    setProgramValue: function(getNextElementId,parentOfCurrentTarget){
		var _programValue = '';//$('#'+getNextElementId).text().trim();

        switch (parentOfCurrentTarget) {
            case "preferedProgramsItems":
				_programValue = $('#'+getNextElementId).children(".fosValue")[0].value;
                singlePageProgramFinder.oldSelectedFOSTile = _programValue;
				break;
            case "degreeLevelItems":
                _programValue = $('#'+getNextElementId).children(".degreeLevelValue")[0].value;
                singlePageProgramFinder.oldSelectedDegreeLevelTile = _programValue;
                break;
            case "areaOfInterestParentItemsDiv":
                _programValue = $('#'+getNextElementId).children(".aoiValue")[0].value;
            	singlePageProgramFinder.oldSelectedAOITile = _programValue;
                break;
        }
    },

    setNextRadioButton: function(_event,parentOfCurrentTarget){//console.log("next"+$(_event.currentTarget).data('next-element'));
        //if($(_event.currentTarget).parent()[0].nextElementSibling != null){
            var getNextElementId = $(_event.currentTarget).data('next-element');//$(event.currentTarget).parent()[0].nextElementSibling.children[0].id;
            $('#'+getNextElementId).addClass('progItemSelected');
            singlePageProgramFinder.setProgramValue(getNextElementId,parentOfCurrentTarget);
            $('.' + parentOfCurrentTarget + ' .main-block').attr('tabindex','-1');
            $('.' + parentOfCurrentTarget + ' .main-block').attr('aria-checked','false');
            $('#'+getNextElementId).attr('tabindex','0');
            $('#'+getNextElementId).attr('aria-checked','true');
			$('#'+getNextElementId).focus();
        //}
		/*$('.' + parentOfCurrentTarget + ' .main-block:visible').last()
        $(_event.currentTarget).parents('.topPrograms').siblings('.secondaryPrograms').children().length;

        $(_event.currentTarget).parents('.topPrograms').siblings('.secondaryPrograms').children().first().children()[0].id*/
    },
    setPreviousRadioButton: function(_event,parentOfCurrentTarget){//console.log("prev"+$(_event.currentTarget).data('prev-element'));
        //if($(_event.currentTarget).parent()[0].previousElementSibling != null){
			var getNextElementId = $(_event.currentTarget).data('prev-element');//$(event.currentTarget).parent()[0].previousElementSibling.children[0].id;
            $('#'+getNextElementId).addClass('progItemSelected');
            singlePageProgramFinder.setProgramValue(getNextElementId,parentOfCurrentTarget);
            $('.' + parentOfCurrentTarget + ' .main-block').attr('tabindex','-1');
            $('.' + parentOfCurrentTarget + ' .main-block').attr('aria-checked','false');
            $('#'+getNextElementId).attr('tabindex','0');
            $('#'+getNextElementId).attr('aria-checked','true');
			$('#'+getNextElementId).focus();
       // }
    },
	
	setCurrentRadioButton: function(event,parentOfCurrentTarget){
		$('.' + parentOfCurrentTarget + ' .main-block').attr('tabindex','-1');
		$('.' + parentOfCurrentTarget + ' .main-block').attr('aria-checked','false');
		$(event.currentTarget).attr('tabindex','0');
		$(event.currentTarget).attr('aria-checked','true');
		$(event.currentTarget).focus();
    },
	
	 setRadioButtonDirection: function(_event,parentOfCurrentTarget){
         var keyCodeValue = _event.keyCode;
         switch (keyCodeValue) {
             case singlePageProgramFinder.KEYCODE.DOWN:
             case singlePageProgramFinder.KEYCODE.RIGHT: 
                 singlePageProgramFinder.setNextRadioButton(_event,parentOfCurrentTarget);
                 break;
                 
             case singlePageProgramFinder.KEYCODE.UP:
             case singlePageProgramFinder.KEYCODE.LEFT:
                 singlePageProgramFinder.setPreviousRadioButton(_event,parentOfCurrentTarget);
                 break;
         }
     },

    tileClickEvent: function(programvalue, programsItems, nextActiveTab, parentOfCurrentTarget, event) {
        //console.log("programvalue="+programvalue);
        //console.log("programsItems"+programsItems);
        //console.log("nextActiveTab"+nextActiveTab);
        //console.log("parentOfCurrentTarget"+parentOfCurrentTarget);
        //console.log("event"+event);
        var parentOfCurrentTargetVar = "";
        if(parentOfCurrentTarget == "areaOfInterestParentItemsDiv") {
            parentOfCurrentTargetVar = "areaOfInterestItems";
            if(typeof(_satellite) !== "undefined"){
                _satellite.setVar('icon', parentOfCurrentTargetVar+ ':' + programvalue);
            }
            
        }else{
            if(typeof(_satellite) !== "undefined"){
                _satellite.setVar('icon', parentOfCurrentTarget+ ':' + programvalue);
            }
            
        }
        
        
        //console.log("parentOfCurrentTarget"+parentOfCurrentTarget);
        //console.log("programvalue"+programvalue);
        if(typeof(_satellite) !== "undefined"){
            _satellite.track('programFinder-click');
        }
		var getKeyCodeCheck = false;
        singlePageProgramFinder.getTypeOfPressedFlag = false;
        if (event.type == "keydown"){
            getKeyCodeCheck = singlePageProgramFinder.setRadioGroupFeature(event.keyCode);
        }
        /* below code is for make color changes and functionality of progress bar */
		if (event.type == "keydown" && !getKeyCodeCheck){//(event.keyCode != 13 || event.which != 13)) {
            return false;
        }														   
		if((window.location.href.indexOf("certificate") > -1) && nextActiveTab == "degreeLevels"){
			nextActiveTab = 'areaOfInterest';
        }

        $('#' + nextActiveTab).removeClass('hide');
        if (nextActiveTab == "degreeLevels") {
            singlePageProgramFinder.progressBarShowFlag = true;
            $('.singlePageProgramFinder-Carousel .progressBar .carousel-indicators li.degreeLevels').removeClass('done');
            $('.singlePageProgramFinder-Carousel .progressBar .carousel-indicators li.areaOfInterest').removeClass('done');
            $('#areaOfInterest').addClass('hide');
            $('#programsResult').addClass('hide');
        } else if (nextActiveTab == "areaOfInterest") {
            $('.singlePageProgramFinder-Carousel .progressBar .carousel-indicators li.areaOfInterest').removeClass('done');
            $('#programsResult').addClass('hide');
        }
        $('.singlePageProgramFinder-Carousel .progressBar .carousel-indicators .active').addClass('done');
        $('.carousel-wrap .carousel-progress').removeClass('active');
        $('.' + nextActiveTab).removeClass('progress-bar-disable');

        /* making selected item color */
        if (parentOfCurrentTarget == 'preferedProgramsItems') {
            if (singlePageProgramFinder.oldSelectedFOSTile != programvalue && !singlePageProgramFinder.getTypeOfPressedFlag) {//console.log("1");
            	// reset the history object since user has selected a new FOS in the UI
            	if(singlePageProgramFinder.oldSelectedFOSTile != ''){
            		singlePageProgramFinder.resetBackButtonData();
            	}
                singlePageProgramFinder.oldSelectedFOSTile = programvalue;
                singlePageProgramFinder.oldSelectedDegreeLevelTile = '';
                singlePageProgramFinder.oldSelectedAOITile = '';
                $('.' + parentOfCurrentTarget + ' .main-block').removeClass('progItemSelected');
                $('.degreeLevelItems .main-block').removeClass('progItemSelected');
                $('.areaOfInterestParentItemsDiv .main-block').removeClass('progItemSelected');
                $(event.currentTarget).addClass('progItemSelected');
				singlePageProgramFinder.setCurrentRadioButton(event,parentOfCurrentTarget);
                $('.areaOfInterest').addClass('progress-bar-disable');
                $('.programsResult').addClass('progress-bar-disable');
            }else if(getKeyCodeCheck  && singlePageProgramFinder.getTypeOfPressedFlag){
				if(singlePageProgramFinder.oldSelectedFOSTile != ''){
            		singlePageProgramFinder.resetBackButtonData();
            	}

                //singlePageProgramFinder.oldSelectedFOSTile = programvalue;
                singlePageProgramFinder.oldSelectedDegreeLevelTile = '';
                singlePageProgramFinder.oldSelectedAOITile = '';
                $('.' + parentOfCurrentTarget + ' .main-block').removeClass('progItemSelected');
                $('.degreeLevelItems .main-block').removeClass('progItemSelected');
                $('.areaOfInterestParentItemsDiv .main-block').removeClass('progItemSelected');
                //$(event.currentTarget).addClass('progItemSelected');
				singlePageProgramFinder.setRadioButtonDirection(event,parentOfCurrentTarget);
                programvalue = singlePageProgramFinder.oldSelectedFOSTile;
                $('.areaOfInterest').addClass('progress-bar-disable');
                $('.programsResult').addClass('progress-bar-disable');
                //console.log("2");
            }
            if(window.location.href.indexOf("certificate") > -1){
				singlePageProgramFinder.filterAreasOfInterest(programvalue, "certificate");
            }else{
            	singlePageProgramFinder.filterDegreeResults(programvalue);
            }
			//singlePageProgramFinder.callingEqualHeightBlocks(programsItems);
        } else if (parentOfCurrentTarget == 'degreeLevelItems') {
            var preferedPrograms = $("#preferedPrograms .progItemSelected > input").val();
            if (singlePageProgramFinder.oldSelectedDegreeLevelTile != programvalue && !singlePageProgramFinder.getTypeOfPressedFlag) {
            	// reset the history object since user has selected a new Degree in the UI
            	if(singlePageProgramFinder.oldSelectedDegreeLevelTile != ''){
            		singlePageProgramFinder.resetBackButtonData();
            	}
                singlePageProgramFinder.oldSelectedDegreeLevelTile = programvalue;
                singlePageProgramFinder.oldSelectedAOITile = '';
                $('.' + parentOfCurrentTarget + ' .main-block').removeClass('progItemSelected');
                $('.areaOfInterestParentItemsDiv .main-block').removeClass('progItemSelected');
                $(event.currentTarget).addClass('progItemSelected');
				singlePageProgramFinder.setCurrentRadioButton(event,parentOfCurrentTarget);
                $('.programsResult').addClass('progress-bar-disable');
            }else if(getKeyCodeCheck && singlePageProgramFinder.getTypeOfPressedFlag){
				// reset the history object since user has selected a new Degree in the UI
            	if(singlePageProgramFinder.oldSelectedDegreeLevelTile != ''){
            		singlePageProgramFinder.resetBackButtonData();
            	}
                //singlePageProgramFinder.oldSelectedDegreeLevelTile = programvalue;
                singlePageProgramFinder.oldSelectedAOITile = '';
                $('.' + parentOfCurrentTarget + ' .main-block').removeClass('progItemSelected');
                $('.areaOfInterestParentItemsDiv .main-block').removeClass('progItemSelected');

				singlePageProgramFinder.setRadioButtonDirection(event,parentOfCurrentTarget);
                programvalue = singlePageProgramFinder.oldSelectedDegreeLevelTile;

                $('.programsResult').addClass('progress-bar-disable');
            }
            singlePageProgramFinder.filterAreasOfInterest(preferedPrograms, programvalue);
			//singlePageProgramFinder.callingEqualHeightBlocks(programsItems);
        } else {
            if (singlePageProgramFinder.oldSelectedAOITile != programvalue && !singlePageProgramFinder.getTypeOfPressedFlag) {
            	// reset the history object since user has selected a new AOI in the UI
            	if(singlePageProgramFinder.oldSelectedAOITile != ''){
            		singlePageProgramFinder.resetBackButtonData();
            	}
                singlePageProgramFinder.oldSelectedAOITile = programvalue;
                $('.' + parentOfCurrentTarget + ' .main-block').removeClass('progItemSelected');
                $(event.currentTarget).addClass('progItemSelected');
				singlePageProgramFinder.setCurrentRadioButton(event,parentOfCurrentTarget);
            }else if(getKeyCodeCheck && singlePageProgramFinder.getTypeOfPressedFlag){
				// reset the history object since user has selected a new AOI in the UI
            	if(singlePageProgramFinder.oldSelectedAOITile != ''){
            		singlePageProgramFinder.resetBackButtonData();
            	}
                //singlePageProgramFinder.oldSelectedAOITile = programvalue;
                $('.' + parentOfCurrentTarget + ' .main-block').removeClass('progItemSelected');

                singlePageProgramFinder.setRadioButtonDirection(event,parentOfCurrentTarget);
                programvalue = singlePageProgramFinder.oldSelectedAOITile;
            }
            singlePageProgramFinder.filterProgramFinderResults(programvalue);
        }
        
        if(!$(event.target).hasClass("autoSelected")){
        	var winWidth = $(window).width();
            var desktopNavHeight = singlePageProgramFinder.getDesktopNavHeight + 120;
            var mobileNavHeight = singlePageProgramFinder.getMobileNavHeight + 120;
        	var accurateScrollPosition = (winWidth > 767 ? desktopNavHeight : mobileNavHeight);//175);//170 : 140);
    		$('html, body').animate({
    			scrollTop: ($('#' + nextActiveTab).offset().top - accurateScrollPosition)
    		}, 1000);
        }else if(nextActiveTab == "programsResult" && singlePageProgramFinder.getDataForBackButton()){
        	setTimeout(function(){
            	var winWidth = $(window).width();
                var desktopNavHeight = singlePageProgramFinder.getDesktopNavHeight + 120;
                var mobileNavHeight = singlePageProgramFinder.getMobileNavHeight + 120;
            	var accurateScrollPosition = (winWidth > 767 ? desktopNavHeight : mobileNavHeight);//175);//170 : 140);
        		$('html, body').animate({
        			scrollTop: ($('#' + nextActiveTab).offset().top - accurateScrollPosition)
        		}, 2000);
        	}, 400);
        }
        
        // remove the class so that scroll will function as normal for user clicks
        $(event.target).removeClass("autoSelected")
    },

    videoClickEvent: function(e) {

        // BOOTSTRAP 3.0 - Open YouTube Video Dynamically in Modal Window
        // Modal Window for dynamically opening videos        
        if (e.type == "keydown" && (e.keyCode != 13 || e.which != 13)) {
            return false;
        }
        // set the clicked tile
        modal.clickedElement = $(e.currentTarget); //$( this );

        // Store the query string variables and values
        // Uses "jQuery Query Parser" plugin, to allow for various URL formats (could have extra parameters)
        var queryString = $(e.currentTarget).attr('href').slice($(e.currentTarget).attr('href').indexOf('?') + 1);
        var queryVars = $.parseQuery(queryString);

        // if GET variable "v" exists. This is the Youtube Video ID
        if ('v' in queryVars) {
            // Prevent opening of external page
            e.preventDefault();

            // Variables for iFrame code. Width and height from data attributes, else use default.
            var iFrameCode = '<iframe scrolling="no" allowtransparency="true" allowfullscreen="true" src="//www.youtube.com/embed/' + queryVars['v'] + '?rel=0&wmode=transparent&showinfo=0&autoplay=1&modestbranding=1&controls=2&cc_load_policy=1" frameborder="0"></iframe>';

            // Replace Modal HTML with iFrame Embed
            $('#mediaModal .modal-body').append(iFrameCode);
            // Set new width of modal window, based on dynamic video content
            $('#mediaModal').on('show.bs.modal', function() {
                // Add video width to left and right padding, to get new width of modal window
                var modalBody = $(this).find('.modal-body');
                var modalDialog = $(this).find('.modal-dialog');
                var newModalWidth = parseInt(modalBody.css("padding-left")) + parseInt(modalBody.css("padding-right"));
                newModalWidth += parseInt(modalDialog.css("padding-left")) + parseInt(modalDialog.css("padding-right"));
                newModalWidth += 'px';
            });

            // Open Modal
            $('#mediaModal').modal().attr('aria-hidden', 'false');
        }

    },
    timerId: function(){setTimeout(function getZipCodeFromDataMgr() {
            // priority order - UPX.dataMgr, CQ_Analytics.UpxDataMgr otherwise default value of the text field
            var defaultZipCode = UPX.dataMgr.get("postalCode") ? UPX.dataMgr.get("postalCode") : CQ_Analytics.UpxDataMgr.getProperty("postalCode");
            // stop retrying after 10 times. load the default value from input field
            if (defaultZipCode || singlePageProgramFinder.zipcodeCounter >= 9) {
                // if zip code is still empty (load it from the input field) - invoked during retries
                defaultZipCode = defaultZipCode ? defaultZipCode : $(".zipCodeInputBox").val();
                
                // logic for campus finder
                if(spfDialogConfig.isCampusFinder != "true"){
                    // update the default zip code in input fields
                    singlePageProgramFinder.updateZipCode(defaultZipCode);
                    // show the section
                    $(".singlePageProgramFinder-container").removeClass("hide");
                    // load the component immediately (including the API call), do not wait for DOM load
                    singlePageProgramFinder.filterFOSData();
                }else{
                    singlePageProgramFinder.hideElementsForCampusFinder();
                    singlePageProgramFinder.getResultsForLocation().then(function(){
                    singlePageProgramFinder.updateZipCode(singlePageProgramFinder.campusZipCode);
                    // show the section
                    $(".singlePageProgramFinder-container").removeClass("hide");
                    singlePageProgramFinder.filterFOSData();
                    });                 
                }// logic for campus finder
            }else{
                // increment the counter
                singlePageProgramFinder.zipcodeCounter++;
                // if undefined, set another timeout function to check for the value after 500 milliseconds
                timerId = setTimeout(getZipCodeFromDataMgr, singlePageProgramFinder);
            }
          }, singlePageProgramFinder);
        },

    // Bind DOM events for handling changes called inside the handlebars template
    bindEvents: function() {

        $('.singlePageProgramFinder-Carousel .normal-bar .carousel-progress,.singlePageProgramFinder-Carousel .sticky-bar .carousel-progress').on('click keydown',function(e) {
        	
			if((e.keyCode != 9 && e.keyCode !=16) || e.type == "click"){
                var _this = (this.localName == 'li' ? $(this).data('progressLevel') : $(this).parent().data('progressLevel'));
                //console.log("progressLevel="+_this);
                if(typeof(_satellite) !== "undefined"){
                    _satellite.setVar('menu', _this);
                    _satellite.track('programFinder-menu');
                }
                if ($('.' + _this).hasClass('progress-bar-disable')) {
                    return false;
                } 
                $('.carousel-wrap .carousel-progress').removeClass('active');
                $('.' + _this).addClass('active');
                var winWidth = $(window).width();
                var desktopNavHeight = singlePageProgramFinder.getDesktopNavHeight + 120;
                var mobileNavHeight = singlePageProgramFinder.getMobileNavHeight + 120;
                var accurateScrollPosition = (winWidth > 767 ? desktopNavHeight : mobileNavHeight);
                $('html, body').animate({
                    scrollTop: ($('#' + _this).offset().top - accurateScrollPosition)
                }, 900);
                
                if (_this == "degreeLevels") {
                    singlePageProgramFinder.callingEqualHeightBlocks('programsItems');
                } else if (_this == "areaOfInterest") {
                    singlePageProgramFinder.callingEqualHeightBlocks('areaOfInterestItems');
                }
                
                singlePageProgramFinder.progressBarClickedFlag = true;
                singlePageProgramFinder.progressBarClickedItem = _this;
            }
        });

        // calls the filterFOSData to get new fos based on changed zipcode value.
        $(".zipCodeInputBox").change(function() {
            // check the sticky field and pull the value from there 
            // if undefined, pull it from the original field
            var newZipCode = $("#pfFilterBoxLocationInputSticky:visible").length > 0 ? $("#pfFilterBoxLocationInputSticky:visible").val() : $("#pfFilterBoxLocationInput").val();
            // update the new zip code
            singlePageProgramFinder.updateZipCode(newZipCode);

        	// reset the history object irrespective of the old value. User has changed the zip code and everything should be reset
        	singlePageProgramFinder.resetBackButtonData();

        	//Resetting the Old Selected Value On Change Of ZIP CODE. User selection state should not be persisted once zip code is changed
            singlePageProgramFinder.oldSelectedFOSTile= '';
   		    singlePageProgramFinder.oldSelectedDegreeLevelTile= '';
    		singlePageProgramFinder.oldSelectedAOITile= '';

            // to handle NULL condition
            if (!newZipCode || newZipCode == '') {
                singlePageProgramFinder.showZipErrorMsg();
                return;
            }
            // hide the error message
            $('.zipErrorMsg').addClass("hide");
            
            // Make the API call, validate it and dislay new results or error message
            singlePageProgramFinder.getJsonResponse(singlePageProgramFinder.plctValidationUrl + "/address/postalcode/" + newZipCode).then(function(info) {

                if (info.state) {
                    CQ_Analytics.UpxDataMgr.setProperty("state" , info.state);
                    UPX.dataMgr.set('state', info.state);
                }
                if (info.city) {
                    CQ_Analytics.UpxDataMgr.setProperty("city" , info.city);
                    UPX.dataMgr.set('city', info.city);
                }
                if (info.postalCode && info.state && info.city) {
                    CQ_Analytics.UpxDataMgr.setProperty("postalCode" , info.postalCode);
                    UPX.dataMgr.set('postalCode', info.postalCode);
                }

                if (info.state && info.city) {
                
                	// valid zip code. show the section if it is hidden
                	if($("#singlePageProgramFinder-Carousel").hasClass("hide")){
                		$("#singlePageProgramFinder-Carousel").removeClass("hide");
                	}
                
                    // to rest the progress bar and hide child sections when user changes the zip code
                    $(".degreeLevelItems .main-block").removeClass("progItemSelected");
                    $(".areaOfInterestItems .main-block").removeClass("progItemSelected");
                    $(".singlePageProgramFinder-Carousel .progressBar .carousel-indicators li.degreeLevels").removeClass("done");
                    $(".singlePageProgramFinder-Carousel .progressBar .carousel-indicators li.areaOfInterest").removeClass("done");
                    $("#degreeLevels").addClass("hide");
                    $("#areaOfInterest").addClass("hide");
                    $("#programsResult").addClass("hide");
                    singlePageProgramFinder.filterFOSData();
                    var winWidth = $(window).width();
                    var accurateScrollPosition = (winWidth > 767 ? 170 : 140);
                    $('html, body').animate({
                        scrollTop: ($('#preferedPrograms').offset().top - accurateScrollPosition)
                    }, 1000);
                } else {
                    singlePageProgramFinder.showZipErrorMsg();
                }

            });
        });

        $(window).resize(function() {
            singlePageProgramFinder.setEqualHeightTiles("sPFInnerSection .item.active");
            singlePageProgramFinder.tileRefactor();
			singlePageProgramFinder.adjustResultSectionCtaButton();
        });

    },
    
    progressBarClick: function(){
        $("#preferedPrograms-sticky-desktop").click(function(){
            $("#preferedPrograms").css("padding-top","150px");
        });
        $("#degreeLevels-sticky-desktop").click(function(){
            $("#degreeLevels").css("padding-top","150px");
        });
        $("#areaOfInterest-sticky-desktop").click(function(){
            $("#areaOfInterest").css("padding-top","150px");
        });
        $("#programsResult-sticky-desktop").click(function(){
            $("#programsResult").css("padding-top","150px");
        });
        $("#preferedPrograms-sticky-mobile").click(function(){
            $("#preferedPrograms").css("padding-top","114px");
        });
        $("#degreeLevels-sticky-mobile").click(function(){
            $("#degreeLevels").css("padding-top","114px");
        });
        $("#areaOfInterest-sticky-mobile").click(function(){
            $("#areaOfInterest").css("padding-top","114px");
        });
        $("#programsResult-sticky-mobile").click(function(){
            $("#programsResult").css("padding-top","114px");
        });

    },

    checkRequiredData : function(){
        //blank here. overridden in singlepage-campus-finder-population.js
        return true;
    },

    // will call model and bindEvents on page load
    init: function() {
        if(singlePageProgramFinder.checkRequiredData() !== undefined && !singlePageProgramFinder.checkRequiredData()) 
            return false;
        singlePageProgramFinder.timerId();
        singlePageProgramFinder.bindEvents();
        //singlePageProgramFinder.progressBarClick();
    }
};

$(document).ready(function() {
    singlePageProgramFinder.init();
    singlePageProgramFinder.getDesktopNavHeight= $('.navbar-default').height();
    singlePageProgramFinder.getMobileNavHeight= $('.xs-header-bar').height();
});
// to disable Back-Forward Cache for Firefox
window.onunload = function(){};
