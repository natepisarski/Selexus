import * as $ from "jquery";
class SelexusConstants {
    public static readonly ActivationKeycode: number = 19;
    public static readonly DeactivationKeycode: number = 19;

    public static readonly ElementLimit: number = 9999;
    public static readonly PruneLimit: number = 750;

    public static readonly HintHeight: number = 85;
    public static readonly HintWidth: number = 150;

    public static readonly Tags: string[] = [
        "a",
        "input",
        "button",
        "img"
    ];

    public static readonly Attributes: string[] = [
      "click",
        "keypress",
        "focus"
    ];
}

class PageUtils {
    public static GetCandidateDom(tags: string[], elementLimit: number): HTMLElement[] {
        // Find elements which the user may want to select
        var candidates: HTMLElement[] = [];
        var elementCount: number = 0;

        $.each($("*"), function (index, x) {
            if (elementCount < elementLimit) {
                var clickEvent = x.onclick
                if (PageUtils.Includes<string>(tags, (x.tagName.toLowerCase())) || (clickEvent)) {
                    candidates.push(x);
                    elementCount = elementCount + 1;
                }
            }
        });
        return candidates;
    }

    public static Includes<T>(list: T[], item: T){
        var rVal: boolean = false;
        $.each(list, function(index, it){
           if(it == item) {
               rVal = true;
           } else {
           }
        });

        return rVal;
    }

    public static GeneratePopup(onItem: HTMLElement, index: number): void {
        onItem.insertAdjacentHTML("beforeBegin",
            '<div class="selexus-popup" id="selexus-' +
            index +
            '" ' +
            'style="left: ' + onItem.style.left +
            "; top: " + onItem.style.top + '">' +
            index +
            '</div>');
    }

    public static GenerateEntryField(): void {
        var y = window.outerHeight / 2 + window.scrollY - ( 150); // ScrollY is used in case you're far down a page
        var x = window.outerWidth / 2 + window.screenX - (150);
        $("body").append(
            $('<div class="selexus-entry-field" style="top: '+y+"px"+'; left: ' + x +
                'px; height: 85px; width: 150px;"></div>')
        );
    }
}

class SelexusRuntime {
    public ElementMap = {};
    public ElementCount: number = 0;

    public IsCapturing: boolean = false;
    public CaptureText: string = "";
}

var runtime = new SelexusRuntime();

class SelexusEvents {

    public Activate(): void {

        var elements = PageUtils.GetCandidateDom(
            SelexusConstants.Tags,
            SelexusConstants.ElementLimit
        );

        $.each(elements, function (index: number, item: HTMLElement) {
            PageUtils.GeneratePopup(item, index);
            runtime.ElementMap[index.toString()] = item;
        });

        PageUtils.GenerateEntryField();
    }

    public OnlyKeep(number: number): void {
        if (number == null || isNaN(number)) {
            return;
        }

        $.each($(".selexus-popup"), function (index, item) {
            var safe: boolean = false;

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
    }

    public Deactivate(): void {
        $(".selexus-popup").remove();
        $(".selexus-entry-field").remove();

        runtime = new SelexusRuntime();
    }

    public NavigateTo(elementID: string): void {
        try {
            runtime.ElementMap[elementID].focus();
            runtime.ElementMap[elementID].click();
        } catch (anyError) {
            this.Deactivate();
        }
    }
}
var action: SelexusEvents = new SelexusEvents(); // May be better to have the whole thing be static, it gets the runtime easier now

// Handle keyboard input, either navigating to an element or activating Selexus
function SelexusDispatch(e: KeyboardEvent){

    if(runtime.IsCapturing && e.keyCode == SelexusConstants.DeactivationKeycode) {
        action.NavigateTo(runtime.CaptureText); // Figure this out
        action.Deactivate();
        return;
    }

    if(runtime.IsCapturing) {
        if(runtime.CaptureText.length < SelexusConstants.ElementLimit.toString().length) {
            runtime.CaptureText += String.fromCharCode(e.charCode);
            $(".selexus-entry-field")[0].innerText = runtime.CaptureText; // There will only be one .selexus-entry-field
            if (runtime.ElementCount < SelexusConstants.PruneLimit) {
                action.OnlyKeep(Number(runtime.CaptureText));
            }
        }
    }

    if(!runtime.IsCapturing && e.keyCode == SelexusConstants.ActivationKeycode) {
        action.Activate();
        runtime.IsCapturing = true;
        $("body").focus();
    }

    console.log(e.keyCode.toString());
}
$(document).keypress(SelexusDispatch);