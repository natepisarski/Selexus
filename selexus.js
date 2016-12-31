"use strict";
var SelexusConstants = (function () {
    function SelexusConstants() {
    }
    return SelexusConstants;
}());
SelexusConstants.ActivationKeycode = 19;
SelexusConstants.DeactivationKeycode = 19;
SelexusConstants.ElementLimit = 9999;
SelexusConstants.PruneLimit = 750;
SelexusConstants.HintHeight = 85;
SelexusConstants.HintWidth = 150;
SelexusConstants.Tags = [
    "a",
    "input",
    "button",
    "img"
];
SelexusConstants.Attributes = [
    "click",
    "keypress",
    "focus"
];
var PageUtils = (function () {
    function PageUtils() {
    }
    PageUtils.GetCandidateDom = function (tags, elementLimit) {
        // Find elements which the user may want to select
        var candidates = [];
        var elementCount = 0;
        $.each($("*"), function (index, x) {
            if (elementCount < elementLimit) {
                var clickEvent = x.onclick;
                if (PageUtils.Includes(tags, (x.tagName.toLowerCase())) || (clickEvent)) {
                    candidates.push(x);
                    elementCount = elementCount + 1;
                }
            }
        });
        return candidates;
    };
    PageUtils.Includes = function (list, item) {
        var rVal = false;
        $.each(list, function (index, it) {
            if (it == item) {
                rVal = true;
            }
            else {
            }
        });
        return rVal;
    };
    PageUtils.GeneratePopup = function (onItem, index) {
        onItem.insertAdjacentHTML("beforeBegin", '<div class="selexus-popup" id="selexus-' +
            index +
            '" ' +
            'style="left: ' + onItem.style.left +
            "; top: " + onItem.style.top + '">' +
            index +
            '</div>');
    };
    PageUtils.GenerateEntryField = function () {
        var y = window.outerHeight / 2 + window.scrollY - (150); // ScrollY is used in case you're far down a page
        var x = window.outerWidth / 2 + window.screenX - (150);
        $("body").append($('<div class="selexus-entry-field" style="top: ' + y + "px" + '; left: ' + x +
            'px; height: 85px; width: 150px;"></div>'));
    };
    return PageUtils;
}());
var SelexusRuntime = (function () {
    function SelexusRuntime() {
        this.ElementMap = {};
        this.ElementCount = 0;
        this.IsCapturing = false;
        this.CaptureText = "";
    }
    return SelexusRuntime;
}());
var runtime = new SelexusRuntime();
var SelexusEvents = (function () {
    function SelexusEvents() {
    }
    SelexusEvents.prototype.Activate = function () {
        var elements = PageUtils.GetCandidateDom(SelexusConstants.Tags, SelexusConstants.ElementLimit);
        $.each(elements, function (index, item) {
            PageUtils.GeneratePopup(item, index);
            runtime.ElementMap[index.toString()] = item;
        });
        PageUtils.GenerateEntryField();
    };
    SelexusEvents.prototype.OnlyKeep = function (number) {
        if (number == null || isNaN(number)) {
            return;
        }
        $.each($(".selexus-popup"), function (index, item) {
            var safe = false;
            if (number < Number(item.innerText)) {
                // What's entered is the first part of this element's number (12 and 123)
                if (item.innerText.substring(0, number.toString().length) == number.toString()) {
                    safe = true;
                }
            }
            // Exact match
            if (Number(item.innerText) == number) {
                safe = true;
            }
            if (!safe) {
                item.remove();
            }
        });
    };
    SelexusEvents.prototype.Deactivate = function () {
        $(".selexus-popup").remove();
        $(".selexus-entry-field").remove();
        runtime = new SelexusRuntime();
    };
    SelexusEvents.prototype.NavigateTo = function (elementID) {
        try {
            runtime.ElementMap[elementID].focus();
            runtime.ElementMap[elementID].click();
        }
        catch (anyError) {
            this.Deactivate();
        }
    };
    return SelexusEvents;
}());
var action = new SelexusEvents(); // May be better to have the whole thing be static, it gets the runtime easier now
// Handle keyboard input, either navigating to an element or activating Selexus
function SelexusDispatch(e) {
    if (runtime.IsCapturing && e.keyCode == SelexusConstants.DeactivationKeycode) {
        action.NavigateTo(runtime.CaptureText); // Figure this out
        action.Deactivate();
        return;
    }
    if (runtime.IsCapturing) {
        if (runtime.CaptureText.length < SelexusConstants.ElementLimit.toString().length) {
            runtime.CaptureText += String.fromCharCode(e.charCode);
            $(".selexus-entry-field")[0].innerText = runtime.CaptureText; // There will only be one .selexus-entry-field
            if (runtime.ElementCount < SelexusConstants.PruneLimit) {
                action.OnlyKeep(Number(runtime.CaptureText));
            }
        }
    }
    if (!runtime.IsCapturing && e.keyCode == SelexusConstants.ActivationKeycode) {
        action.Activate();
        runtime.IsCapturing = true;
        $("body").focus();
    }
    console.log(e.keyCode.toString());
}
$(document).keypress(SelexusDispatch);
