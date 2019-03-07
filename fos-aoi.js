
var childLengthCount;
var temData;
var allArradata = [];
var childArray = [];
var matchData = [];
var notMatchData = [];
var notMatchuncheckData = [];
var degreeParams = {};
var checkedLength;
var currentChecked = [];
var zipValid;
var selectedProgram;
var selectedAOI = [];
var selectedDegree = [];
var paramsObj ={};
var paramaterObj={};
var   filteredData =[];
var filterData = [];
var finalArr =[];
var filteredDatas=[];
var removeDataArry=[];
var aoiProgram={};
var dataJson;
var fosAoiSearch = {

	// handle bar template file name
	fosAoiSearchTemplate: "/components/fosaoi-search/fosaoi-search.handlebars",
    fosFoeSearchTemplate: "/components/fosaoi-search/fosaoi-degree.handlebars",
    fosProgramTemplate: "/components/fosaoi-search/fosaoi-programs.handlebars",
	zipcodeCounter: 0,
	plctServiceUrl: "/bin/api/plct/3/uopx",
	plctValidationUrl: "/bin/api/validation-service/1/uopx",
	jsonResponse: {},
	allProgramsObj: {},
	selectedFos: '',
	selectedFosJsonResponse: {},
	apiResponse: {},
	degreeAPIData: {},
	certificateArray: ["certificate", "undergraduate-certificate", "graduate-certificate", "associates-certificate"],
	disabledAOIArray: ["hospitality", "retail-management"],
	onlineModality: "",
	onCampusModality: "",
	dropDownData: [],
    degreeData: [{ name: "all", title: "All", isDisabled: false }],
	aoiData: [],
	selectedDegree: [],
	selectedAOI: [],
	init: function () {

		var delay = 50;
		var timerId = setTimeout(function getZipCodeFromDataMgr() {
			// priority order - UPX.dataMgr, CQ_Analytics.UpxDataMgr otherwise default value of the text field
			var defaultZipCode = UPX.dataMgr.get("postalCode") ? UPX.dataMgr.get("postalCode") : CQ_Analytics.UpxDataMgr.getProperty("postalCode");
			// stop retrying after 10 times. load the default value from input field
			if (defaultZipCode || fosAoiSearch.zipcodeCounter >= 9) {
				// if zip code is still empty (load it from the input field) - invoked during retries
				defaultZipCode = defaultZipCode ? defaultZipCode : $(".zipCodeInputBox").val();
				console.log("defaultZipCode ", defaultZipCode);
				// update the default zip code in input fields
				fosAoiSearch.updateZipCode(defaultZipCode);
				//getFOS detail from pageproperties
				fosAoiSearch.selectedFos = fosAoiSeachObj.fos;
				// update the default fos in input fields
				fosAoiSearch.updateFosDropdown(fosAoiSearch.selectedFos);

				$(".custom-checkbox>[type='checkbox'][value='Online']")[0].checked = fosAoiSeachObj.isModalityOnline == "true" ? true : false;
				$(".custom-checkbox>[type='checkbox'][value='On Campus']")[0].checked = fosAoiSeachObj.isModalityCampus == "true" ? true : false;
				// load the component immediately (including the API call)
				fosAoiSearch.populatePageData();
			} else {
				// increment the counter
				fosAoiSearch.zipcodeCounter++;
				// if undefined, set another timeout function to check for the value after 500 milliseconds
				timerId = setTimeout(getZipCodeFromDataMgr, delay);
			}
		}, delay);

		this.bindEvents();
		//this.bindEventsCheckBox();

	$("input[id*='aoi']").click(function () {
		console.log('--', $(this));
	});

	},
	// Bind DOM events for handling changes called inside the handlebars template
	bindEvents: function () {
		// calls the filterFOSData to get new fos based on changed zipcode value.
		$(".zipCodeInputBox").change(function () {
			var newZipCode = $(".zipCodeInputBox").val();
			// to handle NULL condition
			if (!newZipCode || newZipCode == '') {
				var newZipCode = $(".zipCodeInputBox").val();
				console.log('newZipCode', newZipCode);
				if (!newZipCode || newZipCode == '') {
					fosAoiSearch.showZipErrorMsg();
				} else {
					$('span.error_msg').html('');
				}
			}
			// TODO : hide the error message
			fosAoiSearch.showZipErrorMsg();
			debugger;
			// Make the API call, validate it and display new results or error message
			fosAoiSearch.getJsonResponse(fosAoiSearch.plctValidationUrl + "/address/postalcode?postalCode=" + newZipCode).then(function (info) {

				console.log('info', info);
				if (info.state != "") {
					if (info.state) {
						CQ_Analytics.UpxDataMgr.setProperty("state", info.state);
						UPX.dataMgr.set('state', info.state);
					}
					if (info.city) {
						CQ_Analytics.UpxDataMgr.setProperty("city", info.city);
						UPX.dataMgr.set('city', info.city);
					}
					if (info.postalCode && info.state && info.city) {
						CQ_Analytics.UpxDataMgr.setProperty("postalCode", info.postalCode);
						UPX.dataMgr.set('postalCode', info.postalCode);
					}

					if (info.state && info.city) {
						// valid zip code. show the section if it is hidden
						fosAoiSearch.populatePageData();
					}
					zipValid = false;
					$("div.showDataBox").removeClass("boxHidden");
				}
				else {
					// TODO : Show error message
					zipValid = true;
					fosAoiSearch.showZipErrorMsg();
				}

			});
		});

		$(".zipCodeInputBox").focus(function () {
			$('span.error_msg').html('');
			$("span.tooltiptext").removeClass("showTooltip");
		});
		$(".zipCodeInputBox").focusout(function () {
			fosAoiSearch.showZipErrorMsg();
		});

		$(".zipCodeInputBox").keypress(function (event) {
			var charCode = (event.which) ? event.which : event.keyCode;
			return (charCode > 31 && (charCode < 48 || charCode > 57)) ? false : true;
		});
		$('select[name="test"]').on('change', function () {
			var navigateData = JSON.parse(fosAoiSeachObj.fosMapping);
			console.log("navigateData ", navigateData);
            selectedProgram = $(this).val();
			console.log("$(this).val() ", $(this).val());
            fosAoiSearch.populatePageData();
			var selectedItem = $(this).val();
			if (navigateData != undefined) {
				for (var i = 0; i < navigateData.length; i++) {
					console.log("navigateData[i].foslist ", navigateData[i].foslist);
					if (navigateData[i].foslist == selectedItem) {
						var navigateUrl = navigateData[i].pageURL + ".html";
						window.document.location.href = navigateUrl;
					}
				}
			}
		});

        /**
     * Below method call when we click on single check box
     **/

	},
	// to combine the API data and author dialog configurations
	populatePageData: function () {

		var zipCodeInputBox = this.getZipCode(),
			fosAPIURL = this.getServiceURL(zipCodeInputBox);

		// call the PLCT API to get the data based on zip code
		this.getJsonResponse(fosAPIURL).then(function (apiResponse) {
			fosAoiSearch.apiResponse = apiResponse;
			dataJson = fosAoiSearch.apiResponse;
			console.log('dataJson', dataJson);
			// check if the API response has FOS data
			if (!_.isEmpty(apiResponse.fieldOfStudy)) {

				// TODO: filter the API response and pull the FOS data
				// fosAoiSearch.jsonResponse = apiResponse;

				fosAoiSearch.populateResultsSection();

				// get all the program objects and store it in a map as key/value pair
				// the results will be used to include programs based on parent program attribute in child program
				$.map(apiResponse.fieldOfStudy, function (fosObj) {

					if (fosObj.name == fosAoiSearch.selectedFos) {
						fosAoiSearch.selectedFosJsonResponse = fosObj;
					}

					$.map(fosObj.areas, function (areaObj) {
						$.map(areaObj.levels, function (levelObj) {
							$.map(levelObj.programs, function (programObj) {
								// check to pull only parent programs
								if (programObj.attributes && programObj.attributes.isParentProgram) {
									fosAoiSearch.allProgramsObj[programObj.name] = programObj
								}
							});

						});
					});
				});

				//fosAoiSearch.degreeAPIData = fosAoiSearch.getDegreeData(fosAoiSearch.apiResponse, fosAoiSearch.selectedFos);

				var mockedData = fosAoiSearch.getMockJSONData(fosAoiSearch.apiResponse);
				// var mockedData = fosAoiSearch.getRenderingSearchData(fosAoiSearch.apiResponse);

				// TODO: format the api response to populate field of study
				fosAoiSearch.updateElementHtml(fosAoiSearch.fosFoeSearchTemplate, mockedData, $(".degree-class")).then(function () {
					let parent = $(".degree-class")[0];
					parent.click((event) => {
						let target = event.target;
						if (target.checked && selectedDegree.indexOf(target.value) === -1) {
							selectedDegree.push(value);
						} else if (target.checked === false) {
							selectedDegree = selectedDegree.filter((rec) => {
								return rec !== target.value;
							});
						}
						let onlineFlag = $(".custom-checkbox>[type='checkbox'][value='Online']")[0].checked,
							groundFlag = $(".custom-checkbox>[type='checkbox'][value='On Campus']")[0].checked,
							role = $('select[name="test"]').val();
						fosAoiSearch.getFilteredData(onlineFlag, groundFlag, role, selectedDegree, selectedAOI);
						//parent.off("click");
						fosAoiSearch.updateElementHtml(fosAoiSearch.fosAoiSearchTemplate, { aoiData: selectedDegree }, $(".aoi-class"));
					});
				});

				// TODO: format the api response to populate search and results section
				fosAoiSearch.updateElementHtml(fosAoiSearch.fosAoiSearchTemplate, mockedData, $(".aoi-class")).then(function () {
					let parent = $(".aoi-class")[0];	
					

	 var aoiLen = $("input[class*='aoi']").length;
	for(var i =0;i<=aoiLen; i++){
		if($("input[class*='aoi']")[i] !=undefined){
			if($("input[class*='aoi']")[i].value){
				$("input[class*='aoi']")[i].disabled =false;
			}
		}
	}              

/**$("select.selectProgram").change(function() {
	filteredData =[];        
	var selectedProgram = $(this).children("option:selected").val();
	if (selectedProgram) {              
		dataJson.fieldOfStudy.forEach((dat,index) => {
			if(dat.title === selectedProgram){
			   filteredData.push(dat.areas);
			}
		});
		
	}
});**/
$("input[class*='aoi']").click(function () {
	if( $(this)['0'].value !=undefined){   
		if(this.checked){
			if(paramsObj !=undefined){
				for (var key in paramsObj) {
					if (paramsObj.hasOwnProperty(key)) {
						var rr = paramsObj[key];
						var indexd = rr.indexOf($(this)['0'].value);                               
						if(paramaterObj[key] !=undefined  && paramaterObj[key].length>0){
							if (indexd > -1) {
								paramaterObj[key].push($(this)['0'].value);
							}else{
							   // paramaterObj[key].push($(this)['0'].value);
							}
						}else{
							paramaterObj[key] = [];
							if (indexd > -1) {
								paramaterObj[key].push($(this)['0'].value);
							}else{
							   // paramaterObj[key].push($(this)['0'].value);
							}
						}
						updateURL(paramaterObj);
					}
				}
			}
			if(filteredDatas.length>0){
				filteredDatas.forEach((datss,index) => {
					if(datss.name.includes($(this)['0'].value)){
						console.log('datss', datss.levels.name);                             
						if(aoiProgram[datss.levels.name] !=undefined && aoiProgram[datss.levels.name].length>0){
							aoiProgram[datss.levels.name].push(datss);
						}else{
							aoiProgram[datss.levels.name]=[];
							aoiProgram[datss.levels.name].push(datss);
						}
					  }
					});
				}
			}else{
				if(paramaterObj !=undefined){
				for (var key in paramaterObj) {
					if (paramaterObj.hasOwnProperty(key)) {
						var rrs = paramaterObj[key];
						var indexdd = paramaterObj[key].indexOf($(this)['0'].value);                              
						if(paramaterObj[key] !=undefined  && paramaterObj[key].length>0){
							if (indexdd > -1) {
								paramaterObj[key].splice(indexdd, 1);
							}else{
							   // paramaterObj[key].push($(this)['0'].value);
							}
						}
						updateURL(paramaterObj);
					}
				}
			}
		}
	}
});
$("input[class*='degree']").click(function () {
	filteredData =[];        
	var selectedProgram = $("select.selectProgram").children("option:selected").val();
	if (selectedProgram) {              
		dataJson.fieldOfStudy.forEach((dat,index) => {
			if(dat.name === selectedProgram){
			   filteredData.push(dat.areas);
			}
		});
		
	}
	if( $(this)['0'].value !=undefined){                  
			if(this.checked){
			 var obj =$(this)['0'].value;
			  paramsObj[obj] = [];
				if(filteredData['0']!=undefined){
					filteredData['0'].forEach((dat,index) => {
						if(dat.levels !=undefined){
							dat.levels.forEach((datw,index) => {
								if(datw.name.includes(obj)){
									paramsObj[obj].push(dat.name);
									removeDataArry.push(dat);                                           
								}                   
							});   
						  }
						});
						console.log('removeDataArry', removeDataArry);
				 }
				 if(removeDataArry.length>0){
					removeDataArry.forEach((datt,index) => {
						console.log('datt', datt.levels);
						datt.levels.forEach((datwd,index) => {
							if(datwd.name.includes(obj)){                                      
								var ff= {levels: datwd, name: datt.name, title:datt.title, id:datt.id};
								filteredDatas.push(ff);
							}else{
							  
							}
						})
					});  
				}
				console.log('filteredDatas', filteredDatas);               
				}else{
					var deleteobj =$(this)['0'].value;
					delete paramsObj[deleteobj];
				}
				if(paramsObj !=undefined){
                    finalArr = [];
					for (var key in paramsObj) {
						if (paramsObj.hasOwnProperty(key)) {
							var dd = paramsObj[key];
							var ddd = dd.toString().split(",");
							if(ddd.length>0){
								ddd.forEach((datw,index) => {
									var indexs = finalArr.indexOf(datw);
									if (indexs > -1) {
									   
									}else{
										finalArr.push(datw);
									}                                           
								});
							}
						}
					}
				}
		}              
		if(finalArr.length>0){
          	var aoiLen = $("input[class*='aoi']").length;
			console.log('finalArr', finalArr);
			for(var i =0;i<aoiLen; i++){
				//finalArr.forEach((dat,index) => {
				//if($("input[class*='aoi']")[i] !=undefined){
					//if($("input[class*='aoi']")[i].value === dat){
						//$("input[class*='aoi']")[i].disabled = false;
                    //}}
				//})
                if($("input[class*='aoi']")[i].disabled === false){
                    //if(this.checked){
                        if(finalArr.includes($("input[class*='aoi']")[i].value)){
                            $("input[class*='aoi']")[i].disabled = false;
                        }
                        else {
                            $("input[class*='aoi']")[i].disabled = true;
                        }
                   // }
                }else{
                    $("input[class*='aoi']")[i].disabled = false;
                } 
			}                  
        }else{
            var aoiLen = $("input[class*='aoi']").length;
            for(var i =0;i<aoiLen; i++){
				$("input[class*='aoi']")[i].disabled = false;
                $("input[class*='aoi']")[i].checked = false;
            }
        }
	//updateURL(paramaterObj);
   }); 

				});
				} else {
				// TODO : display the error message
				fosAoiSearch.showZipErrorMsg();
			}

		});
	},


	updateSearchSelections: function () {

	},


	populateResultsSection: function () {

	},


	getZipCode: function () {
		// check the onload anonymous function on how zip code value is set on input fields
		return $(".zipCodeInputBox").val();
	},


	updateZipCode: function (newZipCode) {
		// update the value
		$(".zipCodeInputBox").val(newZipCode);
	},
	updateFosDropdown: function (fosval) {
		// update the value
        selectedProgram=fosval;
		$(".selectProgram").val(fosval);
    },


	/**
 * showZipErrorMsg(): this method is use to show and hide tooltip
 */
	showZipErrorMsg: function () {
		$("span.tooltiptext").removeClass("showTooltip");
		$("div.showDataBox").removeClass("boxHidden");

		if ($.trim($(".zipCodeInputBox").val()) == '') {
			removeAllData();
			$('span.error_msg').html("Please Enter Zip code.");
			$("span.tooltiptext").addClass("showTooltip");
			$("div.showDataBox").addClass("boxHidden");
		} else if ($(".zipCodeInputBox").val().length != 5) {
			$('span.error_msg').html("Please Enter 5 digit Zip code number.");
			$("span.tooltiptext").addClass("showTooltip");
			$("div.showDataBox").addClass("boxHidden");
		} else if ($(".zipCodeInputBox").val() !== "" && !$.isNumeric($(".zipCodeInputBox").val())) {
			$('span.error_msg').html("Please Enter numeric digit.");
			$("span.tooltiptext").addClass("showTooltip");
			$("div.showDataBox").addClass("boxHidden");
		} else if (zipValid) {
			$('span.error_msg').html("Please Enter Valid Zip code.");
			$("span.tooltiptext").addClass("showTooltip");
			$("div.showDataBox").addClass("boxHidden");
		}
		else {
			$('span.error_msg').html('');
			$("span.tooltiptext").removeClass("showTooltip");
		}


	},


	//it will build service URLs based on the zip code
	getServiceURL: function (zip) {
		return this.plctServiceUrl + "/programs/availability/fos?postalCode=" + zip;
	},


	//it updates html of the element with response of handlebars
	updateElementHtml: function (tempalteFilePath, jsonObj, $el) {
		return UopxSearch.templates.execute(tempalteFilePath, jsonObj).done(function (html) {
			$el.html(html);
		});
	},


	getJsonResponse: function (url) {
		return $.ajax({
			type: "GET",
			url: url,
			cache: false,
			headers: {
				Accept: "application/json; charset=utf-8",
				"Content-Type": "application/json; charset=utf-8"
			},
			contentType: "application/json"

		}).done(function (res) {
			return res
		})
	},


	getMockJSONData: function (apiResponse) {


		let objects = fosAoiSearch.getRenderingSearchData(apiResponse);
		dropDownData = objects.dropDownData;
		degreeData = objects.degreeData;
		aoiData = objects.aoiData;
        console.log('aoiData', aoiData);


		 //var apiResponseObj = {}, aoiData = [],
		     //fosData = [];
		 //$.each(degreeData, function (key, degree) {
             //var data = {name: degree.name, title: degree.name, id: key}
		 //   fosData.push(data);
		 //});

		 //apiResponseObj.fosData = fosData;
		 //console.log('apiResponseObj--', apiResponseObj);
		// return apiResponseObj;
        return objects;
	},

	filterData: function (array, filterName) {
		let results = array.filter((rec) => {
			return rec.name === filterName;
		})
		return results.length > 0 ? results : null;
	},
    /**
     * Method to be called on load to populate the filter options
     */
	getRenderingSearchData: function (jsonData) {
		let dropDownData = [],
			degreeData = [],
			aoiData = [];
		if (jsonData && jsonData.fieldOfStudy) {
			jsonData.fieldOfStudy.forEach((fieldOfStudyRec) => {
				dropDownData.push({ name: fieldOfStudyRec.name, title: fieldOfStudyRec.title, isDisabled: false });
				fieldOfStudyRec.areas.forEach((area) => {
					if (!fosAoiSearch.filterData(aoiData, area.name)) {
                      if(fieldOfStudyRec.name==selectedProgram){
                            aoiData.push({ name: area.name, title: area.title, isDisabled: false });
                        }

						//aoiData.push({ name: area.name, title: area.title, isDisabled: false });
					}
					let name = null, title = null;
					area.levels.forEach((level) => {
						if (fosAoiSearch.certificateArray.indexOf(level.name) > -1) {
							name = "certificate";
							title = "Certificate";
						} else {
							name = level.name;
							title = level.title;
						}
						if (!fosAoiSearch.filterData(degreeData, name)) {
							degreeData.push({ name: name, title: title, isDisabled: false })
						}
					});
				});
			});
		}
		//Sorting aoi array
		aoiData = aoiData.sort(function (a, b) {
			return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
		});
		return { dropDownData, degreeData, aoiData }
	},
	getFilteredData: function (online = false, ground = false, role, degrees = [], aois = []) {
		filterData = jsonData.fieldOfStudy;
		if (role) {
			filterData = fosAoiSearch.getRoleFilterData(filterData, role);
		}
		if (aois.length > 0) {
			filterData.forEach((filter) => {
				filter.areas = fosAoiSearch.getAOISfilterData(filter.areas, aois);
			});
		}
		if (degrees.length > 0) {
			filterData = fosAoiSearch.getDegreeFilterData(filterData, degrees);
		}
		filterData = fosAoiSearch.getOnlineFlagData(filterData, online, ground);
		let data = fosAoiSearch.getRenderingSearchData({ fieldOfStudy: filterData });
		fosAoiSearch.selectedAOI.forEach(aoi => {
			let temp = data.aoiData.filter(rec => {
				return rec.name === aoi.name;
			});
			if (temp.length > 0) {
				aoi.isDisabled = true;
			} else {
				aoi.isDisabled = false;
			}
		});
	},
	getRoleFilterData: function (array, role) {
		return array.filter((rec) => {
			return rec.name === role;
		})
	},
	getAOISfilterData: function (array, aois) {
		return array.filter((area) => {
			return aois.indexOf(area.name) > -1;
		})
	},
	getDegreeFilterData: function (array, degrees) {
		array.forEach((fos) => {
			fos.areas.forEach((area) => {
				area.levels = area.levels.filter((level) => {
					return degrees.indexOf(level.name) > -1;
				});
			});
		});
		return array;
	},
	getOnlineFlagData: function (array, online, ground) {
		array.forEach((fos) => {
			fos.areas.forEach((area) => {
				area.levels.forEach(level => {
					level.programs = level.programs.filter(program => {
						return program.ground === ground && program.online === online;
					});
				});
			});
		});
		return array;
	}
	
};
$(document).ready(function () {
	fosAoiSearch.init();
});

/*************************************************************************** */
function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}

function updateURL(params) {
            var str = "";
            var keys = Object.keys(params);
            
            for(var i = 0; i < keys.length; i++){
            	if(i < keys.length -1){
            		str = str +  keys[i] + "+";
                }else{
                    str = str + keys[i] + "=";
                }
        	}

			var arrayValues = Object.values(params);
            var selectedArray = [], values = [];
            for(var j = 0; j < arrayValues.length; j++){
				selectedArray = selectedArray.concat(arrayValues[j]); 

                if(j === arrayValues.length-1){
            		//values = values.push(selectedArray);
                    values = selectedArray.sort();
            		values = values.filter( onlyUnique );
            		//values = values.unique();
                }
        	}

                for(var k=0; k < values.length; k++){

                    if(k < values.length -1)
                    	str = str + values[k] + "+"
            		else
                    	str = str + values[k]
                }            


	//var str = (jQuery.param(params)).replace(/%5B%5D/g, "");
	 console.log(',params--', str);

	 if (history.pushState) {
		 var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?' + str;
		 window.history.pushState({
			 path: newurl
		 }, '', newurl);
	 }
 }

// to disable Back-Forward Cache for Firefox
window.onunload = function () { };