"use strict";

/**
 * Adds the `hover` event as a DOM-event to event-dom. more about DOM-events:
 * http://www.smashingmagazine.com/2013/11/12/an-introduction-to-dom-events/
 *
 * More about drag and drop: https://dev.opera.com/articles/drag-and-drop/
 *
 *
 * <i>Copyright (c) 2014 ITSA - https://github.com/itsa</i>
 * New BSD License - http://choosealicense.com/licenses/bsd-3-clause/
 *
 * @example
 * Event = require('event-dom/dragdrop.js')(window);
 *
 * or
 *
 * @example
 * Event = require('event-dom')(window);
 * require('event-dom/event-dragdrop.js')(window);
 *
 * @module event
 * @submodule event-dragdrop
 * @class Event
 * @since 0.0.2
*/


var NAME = '[dragdrop]: ',
    DRAGGABLE = 'draggable',
    DD_DRAGGING_CLASS = 'dd-dragging',
    CONSTRAIN_ATTR = 'xy-constrain',
    PROXY = 'proxy',
    MOUSE = 'mouse',
    DATA_KEY = 'dragDrop',
    DD_EFFECT_ALLOWED = 'dd-effect-allowed',
    DD_DROPZONE = 'dd-dropzone',
    NO_TRANS_CLASS = 'el-notrans', // delivered by `dom-ext`
    INVISIBLE_CLASS = 'el-invisible', // delivered by `dom-ext`
    DD_TRANSITION_CLASS = 'dd-transition',
    DD_OPACITY_CLASS = 'dd-opacity',
    HIGH_Z_CLASS = 'dd-high-z',
    DD_DROPACTIVE_CLASS = 'dropactive',
    REGEXP_MOVE = /\bmove\b/i,
    REGEXP_COPY = /\bcopy\b/i,
    REGEXP_NODE_ID = /^#\S+$/,
    REGEXP_ALL = /\ball\b/i,
    REGEXP_COPY = /\bcopy\b/i,
    REGEXP_EMITTER = /\bemitter=(\w+)\b/,
    LATER = require('utils').later;

require('polyfill/polyfill-base.js');
require('js-ext');
require('./css/drag-drop.css');

module.exports = function (window) {
    var Event = require('event-dom')(window),
        NodePlugin = require('dom-ext')(window).Plugins.NodePlugin,
        ctrlPressed = false,
        initialised = false,
        DD, dropEffect, NodeDD, NodeDropzone;

    require('window-ext')(window);

    DD = {
       ddProps: {},
      /**
        * Returns the allowed effects on the dragable-HtmlElement. Is determined by the attribute `dd-effect-allowed`
        * Will be set to "move" when undefined.
        *
        * @method _allowedEffects
        * @param dragableElement {HtmlElement} HtmlElement that is checked for its allowed effects
        * @return {String} allowed effects: "move", "copy" or "all"
        * @private
        * @since 0.0.1
        */
        _allowedEffects: function(dragableElement) {
console.info(NAME, '_allowedEffects');
            var allowedEffects = dragableElement.getAttr(DD_EFFECT_ALLOWED);
            return allowedEffects || 'move';
        },

        /**
        * Default function for the `*:dd-drag`-event
        *
        * @method _defFnDrag
        * @param e {Object} eventobject
        * @private
        * @since 0.0.1
        */
        _defFnDrag: function(e) {
// console.info(NAME, '_defFnDrag: default function dd-drag');
            var ddProps = this.ddProps,
                dragNode = ddProps.dragNode,
                constrainNode = ddProps.constrainNode,
                winConstrained = ddProps.winConstrained;
            // is the drag is finished, there will be no ddProps.defined
            // return then, to prevent any events that stayed behind
            if (!ddProps.defined) {
                return;
            }

            // caution: the user might have put the mouse out of the screen and released the mousebutton!
            // If that is the case, the a mouseup-event should be initiated instead of draggin the element
            if (e.buttons===0) {
                // no more button pressed
                Event.emit(dragNode, 'dd-fake-mouseup');
            }
            else {
// console.info(NAME, '_defFnDrag: dragging:');
                if (constrainNode) {
                    ddProps.constrain.x = ddProps.constrain.xOrig - constrainNode.getScrollLeft();
                    ddProps.constrain.y = ddProps.constrain.yOrig - constrainNode.getScrollTop();
                }
                dragNode.setXY(ddProps.x+e.xMouse+(winConstrained ? ddProps.winScrollLeft : window.getScrollLeft())-e.xMouseOrigin, ddProps.y+e.yMouse+(winConstrained ? ddProps.winScrollTop : window.getScrollTop())-e.yMouseOrigin, ddProps.constrain, true);
                ddProps.winConstrained || dragNode.forceIntoView(true);
                constrainNode && dragNode.forceIntoNodeView(constrainNode);
            }
        },

        /**
         * Default function for the `*:dd-drop`-event
         *
         * @method _defFnDrag
         * @param e {Object} eventobject
         * @param sourceNode {HtmlElement} the original HtmlElement
         * @param dragNode {HtmlElement} the dragged HtmlElement (either original or clone)
         * @param dropzoneSpecified {Boolean} whether the sourceNode had a dropzone specified
         * @param x {Number} x-position in coordinaties relative to `document` (like getX())
         * @param y {Number} y-position in coordinaties relative to `document` (like getX())
         * @private
         * @since 0.0.1
         */
        _defFnDrop: function(e, sourceNode, dragNode, dropzoneSpecified, x, y) {
console.info(NAME, '_defFnDrop: default function dd-drop. dropzoneSpecified: '+dropzoneSpecified);
            // handle drop
            if (dropzoneSpecified) {
                this._handleDrop(e, sourceNode, dragNode, dropzoneSpecified, x, y);
            }
            else {
                dragNode.removeClass(NO_TRANS_CLASS).removeClass(HIGH_Z_CLASS).removeClass(DD_DRAGGING_CLASS);
            }
        },

       /**
         * Default function for the `*:dd-over`-event
         *
         * @method _defFnOver
         * @param e {Object} eventobject
         * @private
         * @since 0.0.1
         */
        _defFnOver: function(e) {
console.info(NAME, '_defFnOver: default function dd-over');
            var dropzone = e.target;
            dropzone.setClass(DD_DROPACTIVE_CLASS);
            e.over.then(
                function() {
                    dropzone.removeClass(DD_DROPACTIVE_CLASS);
                }
            );
        },

        /**
         * Default function for the `UI:dd-start`-event
         *
         * @method _defFnDrag
         * @param e {Object} eventobject
         * @private
         * @since 0.0.1
         */
        _defFnStart: function(e) {
            var instance = this,
                customEvent;
            e.emitterName || (e.emitterName='UI'),
            customEvent = e.emitterName + ':dd-drag';
console.info(NAME, '_defFnStart: default function UI:dd-start. Defining customEvent '+customEvent);
            Event.defineEvent(customEvent).defaultFn(instance._defFnDrag.bind(instance));
            instance._initializeDrag(e);
        },

      /**
        * Defines the definition of the `dd-start` event: the first phase of the drag-eventcycle (dd-start, *:dd-drag, *:dd-drop)
        *
        * @method _defineDDStart
        * @param e {Object} eventobject
        * @private
        * @since 0.0.1
        */
        _defineDDStart: function() {
console.info(NAME, '_defineDDStart');
            var instance = this;
            // by using dd-start before dd-drag, the user can create a `before`-subscriber to dd-start
            // and define e.emitterName and/or e.relatives before going into `dd-drag`
            Event.defineEvent('UI:dd-start')
                .defaultFn(instance._defFnStart.bind(instance))
                .preventedFn(instance._prevFnStart.bind(instance));
        },

        /**
         * Defines the definition of the `dd-drop` event: the last phase of the drag-eventcycle (dd-start, *:dd-drag, *:dd-drop)
         *
         * @method _defineDropEv
         * @param e {Object} eventobject
         * @param sourceNode {HtmlElement} the original HtmlElement
         * @param dragNode {HtmlElement} the dragged HtmlElement (either original or clone)
         * @param dropzoneSpecified {Boolean} whether the sourceNode had a dropzone specified
         * @param x {Number} x-position in coordinaties relative to `document` (like getX())
         * @param y {Number} y-position in coordinaties relative to `document` (like getX())
         * @private
         * @since 0.0.1
         */
        _defineDropEv: function(emitterName, sourceNode, dragNode, dropzoneSpecified, x, y) {
console.info(NAME, '_defineDropEv '+dragNode);
            var instance = this;
            Event.defineEvent(emitterName+':dd-drop')
                .defaultFn(instance._defFnDrop.rbind(instance, sourceNode, dragNode, dropzoneSpecified, x, y))
                .forceAssign(); // need to reassign, because all arguments need to be bound again
        },

        /**
         * Defines the definition of the `dd-over` event.
         * Also sets up listeners to tricker dd-over when the mouse is above an dropzone.
         *
         * @method _defineOverEv
         * @param e {Object} eventobject
         * @private
         * @since 0.0.1
         */
        _defineOverEv: function(e) {
console.info(NAME, '_defineOverEv');
            var instance = this,
                emitterName = e.emitterName,
                ddProps = instance.ddProps,
                dropzones = window.document.getAll('[dropzone]');
            if (dropzones.length>0) {
                Event.defineEvent(emitterName+':dd-over')
                     .defaultFn(instance._defFnOver.bind(instance)); // no need to reassign
                return Event.after(['mousemove', 'dd-fake-mousemove'], function(e2) {
                    var overDropzone = false;
                    ddProps.mouseOverNode = e.target;
                    dropzones.forEach(
                        function(dropzone) {
                            // don't do double:
                            if (dropzone === e.dropTarget) {
                                overDropzone = true;
                                return;
                            }
                            var dropzoneAccept = dropzone.getAttr('dropzone') || '',
                                dropzoneMove = REGEXP_MOVE.test(dropzoneAccept),
                                dropzoneCopy = REGEXP_COPY.test(dropzoneAccept),
                                dragOverPromise, dragOutEvent, allowed, xMouseLast, yMouseLast;

                            if (e2.clientX) {
                                ddProps.xMouseLast = e2.clientX + window.getScrollLeft();
                                ddProps.yMouseLast = e2.clientY + window.getScrollTop();
                            }

                            // check if the mouse is inside the dropzone
                            // also check if the mouse is inside the dragged node: the dragged node might have been constrained
                            // and check if the dragged node is allowed to go into the dropzone
                            xMouseLast = ddProps.xMouseLast;
                            yMouseLast = ddProps.yMouseLast;
                            allowed = (!dropzoneMove && !dropzoneCopy) || (dropzoneCopy && (dropEffect==='copy')) || (dropzoneMove && (dropEffect==='move'));
                            if (dropEffect && allowed && dropzone.insidePos(xMouseLast, yMouseLast) && ddProps.dragNode.insidePos(xMouseLast, yMouseLast)) {
                                overDropzone = true;
                                e.dropTarget = dropzone;
                                // mouse is in area of dropzone
                                dragOverPromise = Promise.manage();
                                e.over = dragOverPromise;
                                dragOutEvent = Event.after(
                                    ['mousemove', 'dd-fake-mousemove'],
                                    function(e3) {
console.info(NAME, 'outside dropzone: fulfilling promise');
                                        dragOverPromise.fulfill(e3.target);
                                    },
                                    function(e3) {
                                        var allowed, dropzoneAccept, dropzoneMove, dropzoneCopy;
                                        if (e3.type==='dd-fake-mousemove') {
                                            dropzoneAccept = dropzone.getAttr('dropzone') || '';
                                            dropzoneMove = REGEXP_MOVE.test(dropzoneAccept);
                                            dropzoneCopy = REGEXP_COPY.test(dropzoneAccept);
                                            allowed = (!dropzoneMove && !dropzoneCopy) || (dropzoneCopy && (dropEffect==='copy')) || (dropzoneMove && (dropEffect==='move'));
                                            return !allowed;
                                        }
                                        return !dropzone.insidePos((e3.clientX || e3.center.x)+window.getScrollLeft(), (e3.clientY || e3.center.y)+window.getScrollTop());
                                    }
                                );
                                dragOverPromise.finally(
                                    function() {
                                        dragOutEvent.detach();
                                        e.dropTarget = null;
                                    }
                                );
                                ddProps.dragOverList.push(dragOverPromise);
console.info(NAME, 'Over dropzone: emitting dd-over event');
                                Event.emit(dropzone, emitterName+':dd-over', e);
                            }
                        }
                    );
                    overDropzone || (e.dropTarget=null);
                });
            }
        },

      /**
        * Sets the draggable node back to its original position
        *
        * @method _setBack
        * @param e {Object} eventobject
        * @param sourceNode {HtmlElement} the original HtmlElement
        * @param dragNode {HtmlElement} the dragged HtmlElement (either original or clone)
        * @param dropzoneSpecified {Boolean} whether the sourceNode had a dropzone specified
        * @param x {Number} x-position in coordinaties relative to `document` (like getX())
        * @param y {Number} y-position in coordinaties relative to `document` (like getX())
        * @private
        * @since 0.0.1
        */
        _handleDrop: function(e, sourceNode, dragNode, dropzoneSpecified, x, y) {
console.info(NAME, '_handleDrop '+dragNode);
            var instance = this,
                dropzoneNode = e.dropTarget,
                constrainRectangle, borderLeft, borderTop, dragNodeX, dragNodeY, match;
            if (dropzoneNode) {
                // reset its position, only now constrain it to the dropzondenode
                // we need to specify exactly the droparea: because we don't want to compare to any
                // scrollWidth/scrollHeight, but exaclty to the visible part of the dropzone
                borderLeft = parseInt(dropzoneNode.getStyle('border-left-width'), 10);
                borderTop = parseInt(dropzoneNode.getStyle('border-top-width'), 10);
                constrainRectangle = {
                    x: dropzoneNode.getX() + borderLeft,
                    y: dropzoneNode.getY() + borderTop,
                    w: dropzoneNode.offsetWidth - borderLeft - parseInt(dropzoneNode.getStyle('border-right-width'), 10),
                    h: dropzoneNode.offsetHeight - borderTop - parseInt(dropzoneNode.getStyle('border-bottom-width'), 10)
                };
                if ((ctrlPressed && instance.allowCopy(dragNode)) || instance.onlyCopy(dragNode)) {
                    // backup x,y before move it into dropzone (which leads to new x,y)
                    dragNodeX = dragNode.getX();
                    dragNodeY = dragNode.getY();
                    // now move the dragNode into dropzone
                    dropzoneNode.append(dragNode);
                    dragNode.removeClass(DD_OPACITY_CLASS).removeClass(DD_TRANSITION_CLASS).removeClass(HIGH_Z_CLASS).removeClass(DD_DRAGGING_CLASS);
                    dragNode.setXY(dragNodeX, dragNodeY, constrainRectangle);
                    // make the new HtmlElement non-copyable: it only can be replaced inside its dropzone
                    dragNode.setAttr('dd-effect-allowed', 'move')
                            .setAttr('dd-copied-node', 'true'); // to make moving inside the dropzone possible without return to its startposition
                }
                else {
                    dropzoneNode.append(sourceNode);
                    sourceNode.setXY(dragNode.getX(), dragNode.getY(), constrainRectangle);
                    sourceNode.removeClass(INVISIBLE_CLASS);
                    dragNode.remove();
                }
            }
            else {
                if (dragNode.hasAttr('dd-copied-node')) {
                    // reset its position, only now constrain it to the dropzondenode
                    // we need to specify exactly the droparea: because we don't want to compare to any
                    // scrollWidth/scrollHeight, but exaclty to the visible part of the dropzone
                    match = false;
                    dropzoneNode = dragNode.parentNode;
                    while (dropzoneNode.matchesSelector && !match) {
                        match = dropzoneNode.matchesSelector('[dropzone]');
                        // if there is a match, then make sure x and y fall within the region
                        match || (dropzoneNode=dropzoneNode.parentNode);
                    }
                    if (match) {
                        borderLeft = parseInt(dropzoneNode.getStyle('border-left-width'), 10);
                        borderTop = parseInt(dropzoneNode.getStyle('border-top-width'), 10);
                        constrainRectangle = {
                            x: dropzoneNode.getX() + borderLeft,
                            y: dropzoneNode.getY() + borderTop,
                            w: dropzoneNode.offsetWidth - borderLeft - parseInt(dropzoneNode.getStyle('border-right-width'), 10),
                            h: dropzoneNode.offsetHeight - borderTop - parseInt(dropzoneNode.getStyle('border-bottom-width'), 10)
                        };
                        dragNode.setXY(dragNode.getX(), dragNode.getY(), constrainRectangle);
                    }
                    dragNode.removeClass(DD_OPACITY_CLASS).removeClass(DD_TRANSITION_CLASS).removeClass(HIGH_Z_CLASS).removeClass(DD_DRAGGING_CLASS);
                }
                else {
                    instance._setBack(e, sourceNode, dragNode, dropzoneSpecified, x, y);
                }
            }
        },

       /**
         * Default function for the `*:dd-drag`-event
         *
         * @method _initializeDrag
         * @param e {Object} eventobject
         * @private
         * @since 0.0.1
         */
        _initializeDrag: function(e) {
console.info(NAME, '_initializeDrag '+e.xMouseOrigin);
            var instance = this,
                sourceNode = e.target,
                dropzoneSpecified = sourceNode.hasAttr(DD_DROPZONE),
                constrain = sourceNode.getAttr(CONSTRAIN_ATTR),
                ddProps = instance.ddProps,
                emitterName = e.emitterName,
                moveEv, dragNode, x, y, byExactId, match, constrainNode, winConstrained, winScrollLeft, winScrollTop,
                inlineLeft, inlineTop, xOrig, yOrig;

            // define ddProps --> internal object with data about the draggable instance
            ddProps.sourceNode = sourceNode;
            ddProps.dragNode = dragNode = dropzoneSpecified ? sourceNode.clone(true) : sourceNode;
            ddProps.x = x = sourceNode.getX();
            ddProps.y = y = sourceNode.getY();
            ddProps.inlineLeft = inlineLeft = sourceNode.getInlineStyle('left');
            ddProps.inlineTop = inlineTop = sourceNode.getInlineStyle('top');
            ddProps.dropzoneSpecified = dropzoneSpecified;
            ddProps.winConstrained = winConstrained = (constrain==='window');
            ddProps.xMouseLast = x;
            ddProps.yMouseLast = y;

            if (constrain) {
                if (ddProps.winConstrained) {
                    ddProps.winScrollLeft = winScrollLeft = window.getScrollLeft();
                    ddProps.winScrollTop = winScrollTop = window.getScrollTop();
                    ddProps.constrain = {
                        x: winScrollLeft,
                        y: winScrollTop,
                        w: window.getWidth(),
                        h: window.getHeight()
                    };
                }
                else {
                    byExactId = REGEXP_NODE_ID.test(constrain);
                    constrainNode = sourceNode.parentNode;
                    while (constrainNode.matchesSelector && !match) {
                        match = byExactId ? (constrainNode.id===constrain.substr(1)) : constrainNode.matchesSelector(constrain);
                        // if there is a match, then make sure x and y fall within the region
                        if (match) {
                            ddProps.constrainNode = constrainNode;
                            xOrig = constrainNode.getX() + parseInt(constrainNode.getStyle('border-left-width'), 10);
                            yOrig = constrainNode.getY() + parseInt(constrainNode.getStyle('border-top-width'), 10);
                            ddProps.constrain = {
                                xOrig: xOrig,
                                yOrig: yOrig,
                                x: xOrig - constrainNode.getScrollLeft(),
                                y: yOrig - constrainNode.getScrollTop(),
                                w: constrainNode.scrollWidth,
                                h: constrainNode.scrollHeight
                            };
                        }
                        else {
                            constrainNode = constrainNode.parentNode;
                        }
                    }
                }
            }

            // create listener for `mousemove` and transform it into the `*:dd:drag`-event
            moveEv = Event.after(MOUSE+'move', function(e2) {
                if (!e2.clientX && !e2.center) {
                    return;
                }
                // move the object
                e.xMouse = e2.clientX || e2.center.x;
                e.yMouse = e2.clientY || e2.center.y;
                Event.emit(sourceNode, emitterName+':dd-drag', e);
                e.drag.callback(e);
            });

            // create a custom over-event that fires exactly when the mouse is over any dropzone
            // we cannot use `hover`, because that event fails when there is an absolute floated element outsize `dropzone`
            // lying on top of the dropzone. -> we need to check by coördinates
            instance.ddProps.dragOverEv = instance._defineOverEv(e);

            instance.ddProps.dragDropEv = instance._defineDropEv(emitterName, sourceNode, dragNode, dropzoneSpecified, inlineLeft, inlineTop);

            dragNode.setClass(NO_TRANS_CLASS).setClass(HIGH_Z_CLASS).setClass(DD_DRAGGING_CLASS);

console.info(NAME, 'setting up mouseup  event');
            Event.onceAfter([MOUSE+'up', 'dd-fake-mouseup'], function(e3) {
console.info(NAME, 'Event '+e3.type+' occured');
                moveEv.detach();
                instance._teardownOverEvent(e);
                instance.ddProps = {};
                Event.emit(sourceNode, emitterName+':dd-drop', e);
                e.drag.fulfill(e);
            });

            if (dropzoneSpecified) {
                dropEffect = (instance.onlyCopy(sourceNode) || (ctrlPressed && instance.allowCopy(sourceNode))) ? 'copy' : 'move';
                (dropEffect==='copy') ? dragNode.setClass(DD_OPACITY_CLASS) : sourceNode.setClass(INVISIBLE_CLASS);
                dragNode.setClass(INVISIBLE_CLASS);
                sourceNode.parentNode.append(dragNode);
                dragNode.setXY(ddProps.xMouseLast, ddProps.yMouseLast, ddProps.constrain, true);
                dragNode.removeClass(INVISIBLE_CLASS);
            }
            else {
                dropEffect = null;
                dragNode.setXY(ddProps.xMouseLast, ddProps.yMouseLast, ddProps.constrain, true);
            }
        },

        /**
         * Prevented function for the `*:dd-start`-event
         *
         * @method _prevFnStart
         * @param e {Object} eventobject
         * @private
         * @since 0.0.1
         */
        _prevFnStart: function(e) {
console.info(NAME, '_prevFnStart');
            e.drag.reject();
        },

      /**
        * Sets the draggable node back to its original position
        *
        * @method _setBack
        * @param e {Object} eventobject
        * @param sourceNode {HtmlElement} the original HtmlElement
        * @param dragNode {HtmlElement} the dragged HtmlElement (either original or clone)
        * @param dropzoneSpecified {Boolean} whether the sourceNode had a dropzone specified
        * @param x {Number} x-position in coordinaties relative to `document` (like getX())
        * @param y {Number} y-position in coordinaties relative to `document` (like getX())
        * @private
        * @since 0.0.1
        */
        _setBack: function(e, sourceNode, dragNode, dropzoneSpecified, x, y) {
console.info(NAME, '_setBack to '+x+', '+y);
            var tearedDown,
                tearDown = function(notransRemoval) {
console.info(NAME, '_setBack -> tearDown');
                    // dragNode might be gone when this method is called for the second time
                    // therefor check its existance:
                    if (!tearedDown) {
                        tearedDown = true;
                        notransRemoval || (dragNode.removeEventListener && dragNode.removeEventListener('transitionend', tearDown, true));
                        if (dropzoneSpecified) {
                            sourceNode.removeClass(INVISIBLE_CLASS);
                            dragNode.remove();
                        }
                        else {
                            dragNode.removeClass(DD_TRANSITION_CLASS).removeClass(HIGH_Z_CLASS).removeClass(DD_DRAGGING_CLASS);
                        }
                    }
                };

            dragNode.removeClass(NO_TRANS_CLASS);

            dragNode.removeClass(DD_DRAGGING_CLASS);
            dragNode.setClass(DD_TRANSITION_CLASS);
            // transitions only work with IE10+, and that browser has addEventListener
            // when it doesn't have, it doesn;t harm to leave the transitionclass on: it would work anyway
            // nevertheless we will remove it with a timeout
            if (dragNode.addEventListener) {
                dragNode.addEventListener('transitionend', tearDown, true);
            }
            // ALWAYS tearDowm after delay --> when there was no repositioning, there never will be a transition-event
            LATER(tearDown, 250);
            dragNode.setInlineStyle('left', x);
            dragNode.setInlineStyle('top', y);
        },

      /**
        * Sets up a `keydown` and `keyup` listener, to monitor whether a `ctrlKey` (windows) or `metaKey` (Mac)
        * is pressed to support the copying of draggable items
        *
        * @method _setupKeyEv
        * @private
        * @since 0.0.1
        */
        _setupKeyEv: function() {
console.info(NAME, '_setupKeyEv');
            var instance = this;
            Event.after(['keydown', 'keyup'], function(e) {
console.info(NAME, 'event '+e.type);
                var ddProps = instance.ddProps,
                    sourceNode = ddProps.sourceNode,
                    dragNode, mouseOverNode;
                ctrlPressed = e.ctrlKey || e.metaKey;
                if (sourceNode && instance.allowSwitch(sourceNode)) {
                    dragNode = ddProps.dragNode;
                    mouseOverNode = ddProps.mouseOverNode;
                    dropEffect = ctrlPressed ? 'copy' : 'move';
                    if (ctrlPressed) {
                        sourceNode.removeClass(INVISIBLE_CLASS);
                        dragNode.setClass(DD_OPACITY_CLASS);
                    }
                    else {
                        sourceNode.setClass(INVISIBLE_CLASS);
                        dragNode.removeClass(DD_OPACITY_CLASS);
                    }
                    // now, it could be that any droptarget should change its appearance (DD_DROPACTIVE_CLASS).
                    // we need to recalculate it for all targets
                    // we do this by emitting a 'dd-fake-mousemove' event
                    mouseOverNode && Event.emit(mouseOverNode, 'UI:dd-fake-mousemove');
                }
            });
        },

      /**
        * Engine behinf the dragdrop-cycle.
        * Sets up a `mousedown` listener to initiate a drag-drop eventcycle. The eventcycle start whenever
        * one of these events happens on a HtmlElement with the attribute `draggable="true"`.
        * The drag-drop eventcycle consists of the events: `dd-start`, `emitterName:dd-drag` and `emitterName:dd-drop`
        *
        *
        * @method _setupMouseEv
        * @private
        * @since 0.0.1
        */
        _setupMouseEv: function() {
            var instance = this;
console.info(NAME, '_setupMouseEv: setting up mousedown event');
            Event.before(MOUSE+'down', function(e) {
                var node = e.target,
                    handle, availableHandles, insideHandle;

                // first check if there is a handle to determine if the drag started here:
                handle = node.getAttr('dd-handle');
                if (handle) {
                    availableHandles = node.getAll(handle);
                    insideHandle = false;
                    availableHandles.some(function(handleNode) {
                        insideHandle = handleNode.contains(e.sourceTarget);
                        return insideHandle;
                    });
                    if (!insideHandle) {
                        return;
                    }
                }

                // initialize ddProps: have to do here, because the event might not start because it wasn't inside the handle when it should be
                instance.ddProps = {
                    defined: true,
                    dragOverList: []
                };

                // prevent the emitter from resetting e.target to e.sourceTarget:
                e._noResetSourceTarget = true;
                // add `drag`-Promise to the eventobject --> this Promise will be resolved once the pointer has released.
                e.drag = Promise.manage();
                // define e.setOnDrag --> users
                e.setOnDrag = function(callbackFn) {
                    e.drag.setCallback(callbackFn);
                };
                // store the orriginal mouseposition:
                e.xMouseOrigin = e.clientX + window.getScrollLeft();
                e.yMouseOrigin = e.clientY + window.getScrollTop();
                // now we can start the eventcycle by emitting UI:dd-start:
                Event.emit(e.target, 'UI:dd-start', e);
            }, '[draggable="true"]');

        },

      /**
        * Cleansup the dragover subscriber and fulfills any dropzone-promise.
        *
        * @method _teardownOverEvent
        * @param e {Object} eventobject
        * @private
        * @since 0.0.1
        */
        _teardownOverEvent: function(e) {
console.info('_teardownOverEvent');
            var ddProps = this.ddProps,
                dragOverEvent = ddProps.dragOverEv;
            if (dragOverEvent) {
                dragOverEvent.detach();
                ddProps.dragOverList.forEach(function(promise) {
                    promise.fulfill(e.dropTarget);
                });
            }
        },

       /**
         * Returns true if the dropzone-HtmlElement accepts copy-dragables.
         * Is determined by the attribute `dd-effect-allowed="copy"` or `dd-effect-allowed="all"`
         *
         * @method allowCopy
         * @param dropzone {HtmlElement} HtmlElement that is checked for its allowed effects
         * @return {Boolean} if copy-dragables are allowed
         * @since 0.0.1
         */
        allowCopy: function(dropzone) {
            var allowedEffects = this._allowedEffects(dropzone);
console.info('allowCopy --> '+REGEXP_ALL.test(allowedEffects) || REGEXP_COPY.test(allowedEffects));
            return REGEXP_ALL.test(allowedEffects) || REGEXP_COPY.test(allowedEffects);
        },

       /**
         * Returns true if the dragable-HtmlElement allowes to switch between `copy` and `move`.
         *
         * @method allowSwitch
         * @param dragableElement {HtmlElement} HtmlElement that is checked for its allowed effects
         * @return {Boolean} if copy-dragables are allowed
         * @since 0.0.1
         */
        allowSwitch: function(dragableElement) {
console.info('allowSwitch --> '+REGEXP_ALL.test(this._allowedEffects(dragableElement));
            return REGEXP_ALL.test(this._allowedEffects(dragableElement));
        },

       /**
         * Returns the emitterName that the dropzone accepts.
         *
         * @method getDropzoneEmitter
         * @param dropzone {HtmlElement} HtmlElement-dropzone that might hold the emitter-definition
         * @return {String|null} the emitterName that is accepted
         * @since 0.0.1
         */
        getDropzoneEmitter: function(dropzone) {
            var extract = dropzone.match(REGEXP_EMITTER);
console.info('getDropzoneEmitter --> '+extract && extract[1]);
            return extract && extract[1];
        },

       /**
         * Initializes dragdrop. Needs to be invoked, otherwise DD won't run.
         *
         * @method init
         * @param dragableElement {HtmlElement} HtmlElement that is checked for its allowed effects
         * @return {Boolean} if copy-dragables are allowed
         * @since 0.0.1
         */
        init: function() {
console.info(NAME, 'init');
            var instance = this;
            if (!instance.initialised) {
                instance._setupKeyEv();
                instance._defineDDStart();
                instance._setupMouseEv(); // engine behind the dragdrop-eventcycle
            }
            instance.initialised = true;
        },

       /**
         * Returns true if the dragable-HtmlElement accepts only copy-dragables (no moveable)
         * Is determined by the attribute `dd-effect-allowed="copy"`
         *
         * @method onlyCopy
         * @param dragableElement {HtmlElement} HtmlElement that is checked for its allowed effects
         * @return {Boolean} if only copy-dragables are allowed
         * @since 0.0.1
         */
        onlyCopy: function(dragableElement) {
console.info('onlyCopy --> '+REGEXP_COPY.test(this._allowedEffects(dragableElement)));
            return REGEXP_COPY.test(this._allowedEffects(dragableElement));
        }
    };

    NodeDD = NodePlugin.subClass(
        function (config) {
            config || (config={});
            this.draggable = true;
            this['dd-dropzone'] = config.dropzone;
            this['xy-constrain'] = config.constrain;
            this['dd-emitter-name'] = config.emitterName;
            this['dd-handle'] = config.handle;
            this['dd-effect-allowed'] = config.effectAllowed;
        }
    );

    NodeDropzone = NodePlugin.subClass(
        function (config) {
            var dropzone = 'true',
                emitterName;
            config || (config={});
            if (config.copy && !config.move) {
                dropzone = 'copy';
            }
            else if (!config.copy && config.move) {
                dropzone = 'move';
            }
            (emitterName=config.emitterName) && (dropzone+=' emitter-name='+emitterName);
            this.dropzone = dropzone;
        }
    );

    return {
        DD: DD,
        Plugins: {
            NodeDD: NodeDD,
            NodeDropzone: NodeDropzone
        }
    };
};