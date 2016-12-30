# Selexus
Selexus is a Google Chrome extension (content script) designed to allow easy web navigation via the keyboard. When you
activate Selexus with its keyboard shortcut (ctrl-shift-s), numbers are assigned to all click-able elements on the 
webpage. You then simply type the number you want to navigate to, and use (ctrl-shift-s) again to go to it.

# Features
## Flexible Activation
Selexus will perform a variety of actions on the elements you select to give you the widest range of options from the
keyboard. For instance, clicking on Amazon's search bar provides more options than simply tabbing over to it. Selexus
will activate this.

## Dynamic Pruning
As you type, Selexus gets a better idea of which element you want to click. Selexus will remove the tags of the other
elements to let you hone in on what you want.

## Dynamic Feature Removal
When you're on a website with a ton of clickable items, some features of Selexus may get very slow. So, if Selexus
detects that you're on a heavy website, it will dynamically remove unnecessary features (like dynamic pruning) from
itself to give you the best performance possible.

# Contributing
This is my first Google Chrome extension, so there are definitely issues with it. If you like the project and happen to
have experience with the Google Chrome ecosystem, send me a pull request! I'm bound to accept anything that is (or even just seems)
like a good idea.

# License
MIT