//import { qs } from "../uiHelpers";

/**
 * @module utils
 * All the helper functions needed in this project
 */

/**
 * @param {String} id Either '#some' or 'some'.
 * @returns {HTMLElement}
 */
export function qi(id) {
  id = id[0] === "#" ? id.substr(1, id.length) : id;
  return document.getElementById(id);
}
/**
 * querySelector wrapper
 *
 * @param {string} selector Selector to query
 * @param {Element} [scope] Optional scope element for the selector
 */
export function qs(selector, scope) {
  return (scope || document).querySelector(selector);
}

/**
 * querySelector wrapper
 *
 * @param {string} selector Selector to queryAll
 * @param {Element} [scope] Optional scope element for the selector
 */
export function qsa(selector, scope) {
  return (scope || document).querySelectorAll(selector);
}

/**
 * addEventListener wrapper
 *
 * @param {Element|Window} target Target Element
 * @param {string} type Event name to bind to
 * @param {Function} callback Event callback
 * @param {boolean} [capture] Capture the event
 */
export function $on(target, type, callback, capture) {
  target.addEventListener(type, callback, !!capture);
}
/**
 * Attach a handler to an event for all elements matching a selector.
 *
 * @param {Element} target Element which the event must bubble to
 * @param {string} selector Selector to match
 * @param {string} type Event name
 * @param {Function} handler Function called when the event bubbles to target
 *                           from an element matching selector
 * @param {boolean} [capture] Capture the event
 */
export function $delegate(target, selector, type, handler, capture) {
  const dispatchEvent = (event) => {
    const targetElement = event.target;
    const potentialElements = target.querySelectorAll(selector);
    let i = potentialElements.length;

    while (i--) {
      if (potentialElements[i] === targetElement) {
        handler.call(targetElement, event);
        break;
      }
    }
  };

  $on(target, type, dispatchEvent, !!capture);
}
/**
 * @param {String|Element} element
 * @returns A DOM object, such as HTMLElement, Window, and Document.
 */
export function evaluate(element) {
  let el;
  switch (this.toType(element)) {
    case "window":
    case "htmldocument":
    case "element":
      el = element;
      break;
    case "string":
      el = this.$(element);
      break;
    default:
      console.warn("Unknown type!");
  }
  this.assert(el, "Can't evaluate: @param " + element);
  return el;
}
/**
 * @param {Object|Element|String} obj
 * @returns {String}
 */
export function toType(obj) {
  if (obj === window && obj.document && obj.location) {
    return "window";
  } else if (obj === document) {
    return "htmldocument";
  } else if (typeof obj === "string") {
    return "string";
  } else if (this.isElement(obj)) {
    return "element";
  }
}
/**
 * @param {Element} el
 * @returns {Boolean}
 */
export function isElement(el) {
  // DOM, Level2
  if ("HTMLElement" in window) {
    return !!el && el instanceof HTMLElement;
  }
  // Older browsers
  return !!el && typeof el === "object" && el.nodeType === 1 && !!el.nodeName;
}
/**
 * @param {String} html
 * @returns {Element}
 */
export function createFragment(html) {
  const frag = document.createDocumentFragment();
  const temp = document.createElement("div");

  temp.innerHTML = html;
  while (temp.firstChild) {
    frag.appendChild(temp.firstChild);
  }
  return frag;
}
/**
 * Checks if the condition evaluates to true.
 * @param {T} condition The condition to check.
 * @param {string=} message Error message in case of failure.
 * @throws {Error} When the condition evaluates to false.
 */
export function assert(condition, message = "Assertion failed") {
  if (!condition) {
    if (typeof Error !== "undefined") {
      throw new Error(message);
    }
    throw message; // Fallback
  }
}

export function randomIntFromInterval(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}
// // /**
// //  * Encode less-than and ampersand characters with entity codes to make user-
// //  * provided text safe to parse as HTML.
// //  *
// //  * @param {string} s String to escape
// //  *
// //  * @returns {string} String with unsafe characters escaped with entity codes
// //  */
export const escapeForHTML = (s) =>
  s.replace(/[&<]/g, (c) => (c === "&" ? "&amp;" : "&lt;"));

export const $$ = (function () {
  return {
    removeElementChildNodes: (parent) => {
      while (parent.firstChild) {
        // $(parent.firstChild).fadeOut(1000)
        //removeFadeOut(parent.firstChild, 200);
        parent.removeChild(parent.firstChild);
      }
    },
    removeElements: (selector) => {
      const del = (el) => {
        let parent = el.parentNode;
        if (parent) return parent.removeChild(el);
      };

      if (isElement(selector)) return del(selector);

            if (Array.isArray(selector)) {
        // detect wheter class or Id has pass as for each selector
        return selector.map((sel) => {
          const el = typeof sel === "string"
            ? sel.startsWith(".")
              ? document.querySelector(sel)
              : document.getElementById(sel)
            : sel;
          if (el) {
            del(el);
          }
        });
      } else {
        var el = typeof selector === "string"
          ? selector.startsWith(".")
            ? document.querySelector(selector)
            : document.getElementById(selector)
          : selector;
        //console.log(el)
        if (el.hasOwnProperty("length")) {
          if (el.length !== 0) {
            el.map((e) => {
              if (e.parentNode) {
                del(el);
              }
            });
          }
        } else {
          if (el.parentNode) {
            del(el);
          }
        }
      }
      return el;
    },
    createFragment(html) {
      const frag = document.createDocumentFragment();
      const temp = document.createElement("div");

      temp.innerHTML = html;
      while (temp.firstChild) {
        frag.appendChild(temp.firstChild);
      }
      return frag;
    },
    clickOn(selector) {
      var element = null;
      if (isElement(selector)) element = selector;
      else element = getNode(selector);
      let event = new Event("click");
      element.dispatchEvent(event);
    },
    timer(cb, delay) {
      return new Promise((resolve, reject) => {
        try {
          setTimeout(() => resolve(cb()), delay);
        } catch {
          (error) => console.log(error);
        }
      });
    },
    //const pause =(delay=> $_.timer(null,delay))
    pause: (delay) => {
      return new Promise((resolve, reject) => setTimeout(resolve, delay));
    },
    setTooltipWidth(type) {
      let tooltip = document.querySelector(".hint-tooltip-class");
      //console.log(tooltip)
      if (!tooltip) return;
      if (!tooltip["classList"]) return;
      switch (type) {
        case "slim":
          tooltip.classList.add("hint-tooltip-class__slim");
          break;
        case "wide":
          tooltip.classList.add("hint-tooltip-class__wide");
          break;
        case "xs":
          tooltip.classList.add("hint-tooltip-class__xs");
          break;
        case "slim":
          tooltip.classList.add("hint-tooltip-class__xss");
          break;
      }
    },
    insertAt(array, index, ...elementsArray) {
      return array.slice().splice(index, 0, ...elementsArray);
    },
    hasDuplicates(array) {
      return new Set(array).size !== array.length;
    },
    // isElement: isElement,
    addScope: (s) => `: scope > ${s}`,
    getDomElementWhenReadyFor: (selector, duration = 60, interval = 1000) => {
      return new Promise((resolve, reject) => {
        let counter = 0;
        var getElementInterval = setInterval(function () {
          var element = qs(selector);
          if (isElement(element)) {
            //console.log(element)
            clearInterval(getElementInterval);
            return resolve(element);
          }
          counter += interval / 1000;
          if (counter >= duration) {
            clearInterval(getElementInterval);
            if (isElement(element)) {
              //console.log(element)
              resolve(element);
              return;
            }
            reject();
            return;
          }
        }, interval);
      });
    },
    setValidation: (el, status) => {
      // true : valid | false : invalid
      el.classList.add("uk-text-success");
      if (!status)
        if (!el.classList.contains("uk-form-danger"))
          el.classList.add("uk-form-danger");
        else el.classList.remove("uk-form-danger");
    },
    // Returns selected option from dropdown list passed as sel parameter
    getSelectedOption: (sel) => {
      var opt;
      for (var i = 0, len = sel.options.length; i < len; i++) {
        opt = sel.options[i];
        if (opt.selected === true) {
          break;
        }
      }
      return opt;
    },
    _moveArrayItem: (array, oldIndex, newIndex) => {
      if (newIndex >= array.length) {
        newIndex = array.length - 1;
      }
      array.splice(newIndex, 0, array.splice(oldIndex, 1)[0]);
      return array;
    },
    move: (arr, fromIndex, toIndex) => {
      const [itemToMove] = arr.splice(fromIndex, 1); //take next item from the iterator
      arr.splice(toIndex, 0, itemToMove);

      //iterate and adjust indexes
      let index = toIndex;
      while (index !== fromIndex) {
        let nextIndex =
          fromIndex < toIndex
            ? index - 1 //descending
            : index + 1; //ascending

        const current = arr[index];
        const next = arr[nextIndex];

        //swap the questionNumber parameters
        [current.questionNumber, next.questionNumber] = [
          next.questionNumber,
          current.questionNumber,
        ];

        //go to the next item
        index = nextIndex;
      }
      return arr || [];
    },
    removeElementFromArray: (arr, item) => {
      const removedArr = [...arr].filter((q) => q !== item);
      return removedArr || [];
    },
    removeElementFromArrayOfOjects: (arr, item, prop = "dataId") => {
      const removedArr = [...arr].filter((q) => q[prop] !== item);
      return removedArr || [];
    },
  };
})();

function addMultipleClasses(el, classList) {
  if (!el) return;

  var list = classList || [];
  return list ? list.map((c) => el.classList.add(c)) : el;
}

//Returns true if it is a DOM node
function isNode(o) {
  return typeof Node === "object"
    ? o instanceof Node
    : o &&
        typeof o === "object" &&
        typeof o.nodeType === "number" &&
        typeof o.nodeName === "string";
}

//Returns true if it is a DOM element
// function isElement(o) {
//   return typeof HTMLElement === "object"
//     ? o instanceof HTMLElement //DOM2
//     : o &&
//         typeof o === "object" &&
//         o !== null &&
//         o.nodeType === 1 &&
//         typeof o.nodeName === "string";
// }

function getNode(selector) {
  if (isElement(selector)) return selector;
  // if (Array.isArray(selector)) {
  //     return selector.map(sel => {
  //         const el = typeof sel === "string" ? sel.startsWith(".") ? document.querySelector(sel) : document.getElementById(sel) : sel;
  //         if (el) {
  //             del(el)
  //         }
  //     });
  // }
  else {
    var el = typeof selector === "string"
      ? selector.startsWith(".")
        ? document.querySelector(selector)
        : document.getElementById(selector)
      : selector;
  }
  return el;
}
