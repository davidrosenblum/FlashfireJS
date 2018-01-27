# FlashfireJS
JavaScript 2D top down game framework for the HTML5 Canvas using the Canvas API for rendering. 

### Browser Requirements
The target browser for this framework is Google Chrome, support is not garunteed for other browsers.

* HTML5 Canvas
* CanvasRenderingContext2D
* JavaScript ECMA-6 or above

### Importing
Through the HTML script tag:
```html
<script src="https://github.com/davidrosenblum/FlashfireJS/src/flashfire.min.js"></script>
```

Through JavaScript injection:
```javascript
const URL = "https://github.com/davidrosenblum/FlashfireJS/src/flashfire.min.js";

let script = document.createElement("script");
script.setAttribute("src", URL);
script.addEventListener("loaded", evt => {
	// script loaded... do somethhing
});
document.body.appendChild(script);
```
### Examples
Please see the demo directory for an example of how to use this framework. 