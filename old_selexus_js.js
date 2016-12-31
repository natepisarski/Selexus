// Selexus Constants
const SELEXUS_ACTIVATION_KEYCODE = 19;
const SELEXUS_DEACTIVATION_KEYCODE = 19;
const SELEXUS_ELEMENT_LIMIT = 9999;
const SELEXUS_PRUNE_LIMIT = 500;

var selexus_tags = [
    "a",
    "input",
    "button",
    "img"
];

var selexus_attributes = [
    "click",
    "keypress",
    "focus"
];

var selexus_map = {};
var selexus_element_count = 0;

var selexus_capture = false;
var selexus_captureText = "";

var selexus_documentKeypress;

// Find elements which the user may want to select
function selexus_getCandidateDom() {
    var candidates = [];
    $.each($("*"), function (index, x) {
        if(selexus_element_count < SELEXUS_ELEMENT_LIMIT){
            var clickEvent = $._data(x, 'events');
            if (selexus_tags.includes(x.tagName.toLowerCase()) ||
                (clickEvent && clickEvent.click)) {

                candidates.push(x);
                selexus_element_count = selexus_element_count + 1;
            }
        }
    });
    return candidates;
}

// Assign the tooltip to the elements
function selexus_activate() {3
    var elements = selexus_getCandidateDom();
    $.each(elements, function(index, item){

        // <button></button> would turn into
        // <button><div class="selexus-popup" id="selexus-0">0</div>
        item.insertAdjacentHTML("beforeBegin",
            '<div class="selexus-popup" id="selexus-' +
            index +
            '" ' +
            'style="left: ' + item.left +
            "; top: " + item.top + '">' +
            index +
            '</div>');

        selexus_map[index.toString()] = item;
    });

    var y = window.outerHeight / 2 + window.scrollY - ( 150); // ScrollY is used in case you're far down a page
    var x = window.outerWidth / 2 + window.screenX - (150);
    $("body").append(
        $('<div class="selexus-entry-field" style="top: '+y+"px"+'; left: ' + x +
            'px; height: 85px; width: 150px;"></div>')
    );
}

// Removes numbers not matching this number or part of it
function selexus_keep(number) {
    if(number == null || isNaN(number)){
        return;
    }

    $.each($(".selexus-popup"), function(index, item){
        var safe = false;

        if(number < Number(item.innerText)) {
            // What's entered is the first part of this element's number (12 and 123)
            if(item.innerText.substring(0, number.toString().length) == number.toString()) {
                safe = true;
            }
        }

        // Exact match
        if(Number(item.innerText) == number) {
            safe = true;
        }

        if(!safe) {
            item.remove();
        }
    });
}


// Remove the tooltip from the elements
function selexus_deactivate() {
    $(".selexus-popup").remove();
    $(".selexus-entry-field").remove();

    selexus_map = {};
    selexus_captureText = "";
    selexus_capture = false;
    selexus_element_count = 0;
}

// Navigate to an element with the given ID
function selexus_navigateTo(elementID) {
    try {
        selexus_map[elementID].focus();
        selexus_map[elementID].click();
    } catch(anyError){
        selexus_deactivate();
    }
}

// Handle keyboard input, either navigating to an element or activating Selexus
function selexus_dispatch(e){
    if(selexus_capture && e.keyCode == SELEXUS_DEACTIVATION_KEYCODE) {
        selexus_navigateTo(selexus_captureText); // Figure this out
        selexus_deactivate();
        return;
    }

    if(selexus_capture) {
        if(selexus_captureText.length < SELEXUS_ELEMENT_LIMIT.toString().length) {
            selexus_captureText += String.fromCharCode(e.charCode);
            $(".selexus-entry-field")[0].innerText = selexus_captureText;
            if (selexus_element_count < SELEXUS_PRUNE_LIMIT) {
                selexus_keep(selexus_captureText);
            }
        }
    }

    if(!selexus_capture && e.keyCode == SELEXUS_ACTIVATION_KEYCODE) {
        selexus_activate();
        selexus_capture = true;
        $("body").focus();
    }

    console.log(e.keyCode.toString());
}
$(document).keypress(selexus_dispatch);