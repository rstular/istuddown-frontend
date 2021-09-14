const TILES_PER_ROW = 3;

function statusIntToString(statusInt) {
    switch (statusInt) {
        case 0:
            return "Online";
        case 1:
            return "Degraded";
        case 2:
            return "Offline";
        case 3:
            return "Unknown";
        default:
            return "Unknown";
    }
}

function statusIntToClass(statusInt) {
    switch (statusInt) {
        case 0:
            return "is-success";
        case 1:
            return "is-warning";
        case 2:
            return "is-danger";
        case 3:
            return "";
        default:
            return "";

    }
}

function populateElementObject(elementObject, dataObject) {
    elementObject.querySelector(".title").innerText = dataObject.display_name;

    elementObject.querySelector("a").innerText = dataObject.display_url;
    elementObject.querySelector("a").setAttribute("href", dataObject.display_url);

    elementObject.querySelector(".service-description").innerText = dataObject.description;

    elementObject.querySelector(".service-ping").innerText = dataObject.ping === -1 ? "N/A" : dataObject.ping.toFixed(1);

    elementObject.querySelector(".service-status").innerText = statusIntToString(dataObject.status);

    let statusClass = statusIntToClass(dataObject.status);
    if (statusClass.length > 0) {
        elementObject.querySelector("article").classList.add(statusClass);
    }
}

document.addEventListener("DOMContentLoaded", fetchApiData);


function fetchApiData() {
    fetch("https://istudelftdown.com/api/v1/healthcheck/latest/")
        .then(response => response.json())
        .then(data => {
            // Get template node
            const cellTemplate = document.getElementById("tile-cell");
            const rowTemplate = document.getElementById("tile-row");

            // Calculate when was the last healthcheck
            let healthcheckTime = new Date(data.timestamp * 1000);
            let lastUpdatedString = getNiceTime(healthcheckTime, new Date(), 1, true);
            // Update text on page
            document.getElementById("text-last-updated").innerText = lastUpdatedString;

            // Log worst encountered status - to change Hero
            let worstStatus = 0;

            // Loop through all monitored services
            let tileElements = [];
            for (const service of data.services) {

                if (worstStatus < 1 && service.status === 1) {
                    worstStatus = 1;
                } else if (worstStatus < 2 && service.status == 2) {
                    worstStatus = 2;
                }

                let clonedCell = cellTemplate.content.cloneNode(true);
                populateElementObject(clonedCell, service);
                tileElements.push(clonedCell);
            }


            const hero = document.getElementById("hero");
            const heroStatus = document.getElementById("title-status");
            if (worstStatus === 0) {
                hero.classList.replace("is-info", "is-success");
                heroStatus.innerText = "No :)";
            } else if (worstStatus === 1) {
                hero.classList.replace("is-info", "is-warning");
                heroStatus.innerText = "Not.. yet :|";
            } else if (worstStatus === 2) {
                hero.classList.replace("is-info", "is-danger");
                heroStatus.innerText = "Yes :(";
            }


            const tileContainer = document.getElementById("tile-container");
            for (let i = 0; i < tileElements.length; i += TILES_PER_ROW) {
                const tilesInRow = tileElements.slice(i, i + TILES_PER_ROW);
                let clonedRow = rowTemplate.content.cloneNode(true);
                for (const tile of tilesInRow) {
                    clonedRow.querySelector("div").appendChild(tile);
                }
                tileContainer.appendChild(clonedRow);
            }
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}


/**
 * Function to print date diffs.
 * 
 * @param {Date} fromDate: The valid start date
 * @param {Date} toDate: The end date. Can be null (if so the function uses "now").
 * @param {Number} levels: The number of details you want to get out (1="in 2 Months",2="in 2 Months, 20 Days",...)
 * @param {Boolean} prefix: adds "in" or "ago" to the return string
 * @return {String} Diffrence between the two dates.
 */
function getNiceTime(fromDate, toDate, levels, prefix) {
    var lang = {
        "date.past": "{0} ago",
        "date.future": "in {0}",
        "date.now": "now",
        "date.year": "{0} year",
        "date.years": "{0} years",
        "date.years.prefixed": "{0} years",
        "date.month": "{0} month",
        "date.months": "{0} months",
        "date.months.prefixed": "{0} months",
        "date.day": "{0} day",
        "date.days": "{0} days",
        "date.days.prefixed": "{0} days",
        "date.hour": "{0} hour",
        "date.hours": "{0} hours",
        "date.hours.prefixed": "{0} hours",
        "date.minute": "{0} minute",
        "date.minutes": "{0} minutes",
        "date.minutes.prefixed": "{0} minutes",
        "date.second": "{0} second",
        "date.seconds": "{0} seconds",
        "date.seconds.prefixed": "{0} seconds",
    },
        langFn = function (id, params) {
            var returnValue = lang[id] || "";
            if (params) {
                for (var i = 0; i < params.length; i++) {
                    returnValue = returnValue.replace("{" + i + "}", params[i]);
                }
            }
            return returnValue;
        },
        toDate = toDate ? toDate : new Date(),
        diff = fromDate - toDate,
        past = diff < 0 ? true : false,
        diff = diff < 0 ? diff * -1 : diff,
        date = new Date(new Date(1970, 0, 1, 0).getTime() + diff),
        returnString = '',
        count = 0,
        years = (date.getFullYear() - 1970);
    if (years > 0) {
        var langSingle = "date.year" + (prefix ? "" : ""),
            langMultiple = "date.years" + (prefix ? ".prefixed" : "");
        returnString += (count > 0 ? ', ' : '') + (years > 1 ? langFn(langMultiple, [years]) : langFn(langSingle, [years]));
        count++;
    }
    var months = date.getMonth();
    if (count < levels && months > 0) {
        var langSingle = "date.month" + (prefix ? "" : ""),
            langMultiple = "date.months" + (prefix ? ".prefixed" : "");
        returnString += (count > 0 ? ', ' : '') + (months > 1 ? langFn(langMultiple, [months]) : langFn(langSingle, [months]));
        count++;
    } else {
        if (count > 0)
            count = 99;
    }
    var days = date.getDate() - 1;
    if (count < levels && days > 0) {
        var langSingle = "date.day" + (prefix ? "" : ""),
            langMultiple = "date.days" + (prefix ? ".prefixed" : "");
        returnString += (count > 0 ? ', ' : '') + (days > 1 ? langFn(langMultiple, [days]) : langFn(langSingle, [days]));
        count++;
    } else {
        if (count > 0)
            count = 99;
    }
    var hours = date.getHours();
    if (count < levels && hours > 0) {
        var langSingle = "date.hour" + (prefix ? "" : ""),
            langMultiple = "date.hours" + (prefix ? ".prefixed" : "");
        returnString += (count > 0 ? ', ' : '') + (hours > 1 ? langFn(langMultiple, [hours]) : langFn(langSingle, [hours]));
        count++;
    } else {
        if (count > 0)
            count = 99;
    }
    var minutes = date.getMinutes();
    if (count < levels && minutes > 0) {
        var langSingle = "date.minute" + (prefix ? "" : ""),
            langMultiple = "date.minutes" + (prefix ? ".prefixed" : "");
        returnString += (count > 0 ? ', ' : '') + (minutes > 1 ? langFn(langMultiple, [minutes]) : langFn(langSingle, [minutes]));
        count++;
    } else {
        if (count > 0)
            count = 99;
    }
    var seconds = date.getSeconds();
    if (count < levels && seconds > 0) {
        var langSingle = "date.second" + (prefix ? "" : ""),
            langMultiple = "date.seconds" + (prefix ? ".prefixed" : "");
        returnString += (count > 0 ? ', ' : '') + (seconds > 1 ? langFn(langMultiple, [seconds]) : langFn(langSingle, [seconds]));
        count++;
    } else {
        if (count > 0)
            count = 99;
    }
    if (prefix) {
        if (returnString == "") {
            returnString = langFn("date.now");
        } else if (past)
            returnString = langFn("date.past", [returnString]);
        else
            returnString = langFn("date.future", [returnString]);
    }
    return returnString;
}