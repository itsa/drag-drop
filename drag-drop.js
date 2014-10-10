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


var NAME = '[event-dragdrop]: ',
    DRAGGABLE = 'draggable',
    DD_DRAGGING_CLASS = 'dd-dragging',
    CONSTRAIN_ATTR = 'xy-constrain',
    PROXY = 'proxy',
    MOUSE = 'mouse',
    DATA_KEY = 'dragDrop',
    DATA_KEY_DROPZONE = 'dropZone',
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
    LATER = require('utils').later;

require('polyfill/polyfill-base.js');
require('js-ext');
require('./css/drag-drop.css');

module.exports = function (window) {
    var Event = require('event-dom')(window),
        NodePlugin = require('dom-ext')(window).NodePlugin,
        dragOverPromiseList = [],
        ddProps = {},
        ctrlPressed = false,
        DD, dropEffect;

    require('window-ext')(window);

    DD = {
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
        _allowedEffects = function(dragableElement) {
            var allowedEffects = dragableElement.getAttr(DD_EFFECT_ALLOWED);
            allowedEffects && (allowedEffects=allowedEffects.toLowerCase());
            return allowedEffects || 'move';
        };


/**
* Default function for the `*:dd-drag`-event
*
* @method _defFnDrag
* @param e {Object} eventobject
* @private
* @since 0.0.1
*/
_defFnDrag= function(e) {
console.info('_defFnDrag '+e.dragNode.id);
    var ddProps = instance.ddProps,
        dragNode;
    // is the drag is finished, there will be no e.sourceNode
    // return then, to prevent any events that stayed behind
    if (e.sourceNode) {
        return;
    }
    dragNode = e.dragNode;
    dragNode.setXY(ddProps.x+e.xMouse+window.getScrollLeft()-ddProps.xMouseOrigin, ddProps.y+e.yMouse+window.getScrollTop()-ddProps.yMouseOrigin, true);

    ddProps.winConstrained || dragNode.forceIntoView(true);
    ddProps.nodeConstrained && dragNode.forceIntoNodeView();

};

      /**
        * Default function for the `*:dd-drag`-event
        *
        * @method _initializeDrag
        * @param e {Object} eventobject
        * @private
        * @since 0.0.1
        */
        _initializeDrag = function(e) {
            var instance = this,
                sourceNode = e.target,
                evtType = (e.type===MOUSE+'down') ? MOUSE : 'pan',
                dropzoneSpecified = sourceNode.hasAttr(DD_DROPZONE),
                constrain = sourceNode.getAttr(CONSTRAIN_ATTR),
                ddProps = instance.ddProps,
                moveEv, dragNode;

            // define ddProps --> internal object with data about the draggable instance
            ddProps.sourceNode = sourceNode;
            ddProps.dragNode = dragNode =dropzoneSpecified ? sourceNode.clone(true) : sourceNode;
            ddProps.x = sourceNode.getX();
            ddProps.y = sourceNode.getY();
            ddProps.inlineLeft: node.getInlineStyle('left');
            ddProps.inlineTop: node.getInlineStyle('top');
            ddProps.xMouseOrigin: e.clientX+window.getScrollLeft();
            ddProps.yMouseOrigin: e.clientY+window.getScrollTop();
            ddProps.dropzoneSpecified: dropzoneSpecified;
            ddProps.constrain: constrain;
            ddProps.winConstrained: (constrained==='window');
            ddProps.nodeConstrained: (constrained!=='window') && constrain;

            // create listener for `mousemove` or `panmove` and transform it into the `*:dd:drag`-event
            moveEv = Event.after(evtType+'move', function(e2) {
                // move the object
                e.xMouse = e2.clientX;
                e.yMouse = e2.clientY;
                Event.emit(sourceNode, e.emitterName+':dd-drag', e);
                e.drag.callback(e);
            });

            // create a custom dragover-event that fires exactly when the mouse is over any dropzone
            // we cannot use `hover`, because that event fails when there is an absolute floated element outsize `dropzone`
            // lying on top of the dropzone. -> we need to check by coördinates
            instance.ddProps.dragOverEv = instance._defineDragOverEv(e);

            Event.onceAfter((evtType===MOUSE) ? MOUSE+'up' : 'panend', function(e2) {
                moveEv.detach();
                // handle drop
                if (dragNode.hasAttr(DD_DROPZONE)) {
                    handleDrop(e, ev, currentNode);
                }
                else {
                    movableNode.removeClass(NO_TRANS_CLASS).removeClass(HIGH_Z_CLASS).removeClass(DD_DRAGGING_CLASS);
                }
                instance._teardownDragOverEvent();
                this.ddProps = {};
                Event.emit(sourceNode, e.emitterName+':dd-drop', e);
                e.drag.fulfill(e);
            });

            dragNode.setClass(NO_TRANS_CLASS).setClass(HIGH_Z_CLASS).setClass(DD_DRAGGING_CLASS);

            if (dropzoneSpecified) {
                dropEffect = (onlyCopy(sourceNode) || (CTRL_PRESSED && allowCopy(sourceNode))) ? 'copy' : 'move';
                (dropEffect==='copy') ? dragNode.setClass(DD_OPACITY_CLASS) : sourceNode.setClass(INVISIBLE_CLASS);
                dragNode.setClass(INVISIBLE_CLASS);
                sourceNode.parentNode.append(dragNode);
                dragNode.setXY(ddProps.x, ddProps.y, true);
                dragNode.removeClass(INVISIBLE_CLASS);
            }
            else {
                dropEffect = null;
                dragNode.setXY(x, y, true);
            }
        };


_teardownDragOverEvent = function(e) {
    var ddProps = this.ddProps,
        dragOverEvent = ddProps.dragOverEv;
    if (dragOverEvent) {
        dragOverEvent.detach();
        ddProps.dragOverList.forEach(function(promise) {
            promise.fulfill(e.lastMouseOver);
        });
    }
};

      /**
        * Defines the `dd-draginit` event: the first phase of the drag-eventcycle (dd-draginit, *:dd-drag, *:dd-drop)
        *
        * @method _defineDragInit
        * @param e {Object} eventobject
        * @private
        * @since 0.0.1
        */
        _defineDragInit = function() {
            var instance = this;
            // by using dd-draginit before dd-drag, the user can create a `before`-subscriber to dd-draginit
            // and define e.emitterName and/or e.relatives before going into `dd-drag`
            Event.defineEvent('UI:dd-draginit')
                .defaultFn(function(e) {
                    var emitterName = e.emitterName || 'UI',
                        customEvent = emitterName + ':dd-drag';
                    instance.ddProps = {};
                    Event.defineEvent(customEvent).defaultFn(instance._defFnDrag);
                    instance._initializeDrag(e);
                })
                .preventedFn(function(e) {
                    e.drag.reject();
                });
            // create the very first before-subscriber to ``dd-draginit` -->
            // by enabling `e.drag` and e.setOnDrag(), these are available at the whole draggable eventcycle:
            Event.before('dd-draginit', function(e) {
                // add `drag`-Promise to the eventobject --> this Promise will be resolved once the pointer has released.
                e.drag = Promise.manage();
                // define e.setOnDrag --> users
                e.setOnDrag = function(callbackFn) {
                    e.drag.setCallback(callbackFn);
                };
            });
        };

        _defineDragOverEv = function(eventobject) {
            var dropzones = window.document.getAll('[dropzone]');
            if (dropzones.length>0) {
                dragOverEvent = Event.after(['mousemove', 'dd-fake-mousemove'], function(e) {
                    if (currentNode) {
                        lastMouseOverNode = e.target;
                        dropzones.forEach(
                            function(dropzone) {
                                if (dropzone.hasData(DATA_KEY_DROPZONE)) {
                                    return;
                                }
                                var dropzoneAccept = dropzone.getAttr('dropzone') || '',
                                    dropzoneMove = REGEXP_MOVE.test(dropzoneAccept),
                                    dropzoneCopy = REGEXP_COPY.test(dropzoneAccept),
                                    dragOverPromise, dragOutEvent, eventobject, allowed;

                                if (e.clientX) {
                                    lastMouseX = e.clientX+window.getScrollLeft();
                                    lastMouseY = e.clientY+window.getScrollTop();
                                }

                                // check if the mouse is inside the dropzone
                                // also check if the mouse is inside the dragged node: the dragged node might have been constrained
                                // and check if the dragged node is allowed to go into the dropzone
                                allowed = (!dropzoneMove && !dropzoneCopy) || (dropzoneCopy && (dropEffect==='copy')) || (dropzoneMove && (dropEffect==='move'));
                                if (dropEffect && allowed && dropzone.insidePos(lastMouseX, lastMouseY) && movableNode.insidePos(lastMouseX, lastMouseY)) {
                                    dropzone.setData(DATA_KEY_DROPZONE, true);
                                    // mouse is in area of dropzone
                                    dragOverPromise = Promise.manage();
                                    eventobject = {
                                        sourceTarget: dropzone,
                                        currentTarget: window.document,
                                        dragover: dragOverPromise
                                    };
                                    dragOutEvent = Event.after(
                                        ['mousemove', 'dd-fake-mousemove'],
                                        function(ev) {
                                            dragOverPromise.fulfill(ev.target);
                                        },
                                        function(ev) {
                                            var allowed, dropzoneAccept, dropzoneMove, dropzoneCopy;
                                            if (ev.type==='dd-fake-mousemove') {
                                                dropzoneAccept = dropzone.getAttr('dropzone') || '';
                                                dropzoneMove = REGEXP_MOVE.test(dropzoneAccept);
                                                dropzoneCopy = REGEXP_COPY.test(dropzoneAccept);
                                                allowed = (!dropzoneMove && !dropzoneCopy) || (dropzoneCopy && (dropEffect==='copy')) || (dropzoneMove && (dropEffect==='move'));
                                                return !allowed;
                                            }
                                            return !dropzone.insidePos(ev.clientX+window.getScrollLeft(), ev.clientY+window.getScrollTop());
                                        }
                                    );
                                    dragOverPromise.finally(
                                        function() {
                                            dragOutEvent.detach();
                                            dropzone.removeData(DATA_KEY_DROPZONE);
                                        }
                                    );
                                    dragOverPromiseList.push(dragOverPromise);
                                    Event.emit(dropzone, 'UI:dd-dragover', eventobject);
                                }
                            }
                        );
                    }
                });
            }
        };

      /**
        * Sets up a `keydown` and `keyup` listener, to monitor whether a `ctrlKey` (windows) or `metaKey` (Mac)
        * is pressed to support the copying of draggable items
        *
        * @method _setupKeyEv
        * @private
        * @since 0.0.1
        */
        _setupKeyEv = function() {
            Event.after(['keydown', 'keyup'], function(e) {
                var sourceNode = ddProps.sourceNode,
                    dragNode, mouseOverNode;
                ctrlPressed = e.ctrlKey || e.metaKey;
                if (sourceNode && allowSwitch(sourceNode)) {
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
        * Sets up a `*:dd-dragover` listener, to toggle the `dropactive` class.
        *
        * @method _setupDragOverEv
        * @private
        * @since 0.0.1
        */
        _setupDragOverEv = function() {
            Event.after('dd-dragover', function(e) {
                console.log(NAME, 'dragged over');
                e.target.setClass(DD_DROPACTIVE_CLASS);
                e.dragover.then(
                    function() {
                        e.target.removeClass(DD_DROPACTIVE_CLASS);
                    }
                );
            });
        },

      /**
        * Sets up a `mousedown` and `panstart` listener to initiate a drag-drop eventcycle. The eventcycle start whenever
        * one of these events happens on a HtmlElement with the attribute `draggable="true"`.
        * The drag-drop eventcycle consists of the events: `dd-draginit`, `emitterName:dd-drag` and `emitterName:dd-drop`
        *
        *
        * @method _setupMouseEv
        * @private
        * @since 0.0.1
        */
        _setupMouseEv = function() {
            Event.before([MOUSE+'down', 'panstart'], function(e) {
                console.log(NAME, '_setupMouseEv: setting up mousedown and panstart event');
                var node = e.target,
                    handle, availableHandles, insideHandle;

                // because we listen to 2 eventypes, but we don't want to setup twice, we need to look
                // whether the eventcycle already started by looking at dProps.sourceNode:
                if (!ddProps.sourceNode) {
                    return;
                }

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

                // now we can start the eventcycle by emitting UI:dd-draginit:
                Event.emit(node, 'UI:dd-draginit')
            }, '[draggable="true"]');

        },

      /**
        * Returns true if the dropzone-HtmlElement accepts copy-dragables.
        * Is determined by the attribute `dd-effect-allowed="copy"` or `dd-effect-allowed="all"`
        *
        * @method _allowedEffects
        * @param dropzone {HtmlElement} HtmlElement that is checked for its allowed effects
        * @return {Boolean} if copy-dragables are allowed
        * @since 0.0.1
        */
        allowCopy = function(dropzone) {
            var allowedEffects = this._allowedEffects(dropzone);
            return (allowedEffects==='all') || (allowedEffects==='copy');
        };

      /**
        * Returns true if the dragable-HtmlElement allowes to switch between `copy` and `move`.
        *
        * @method _allowedEffects
        * @param dragableElement {HtmlElement} HtmlElement that is checked for its allowed effects
        * @return {Boolean} if copy-dragables are allowed
        * @since 0.0.1
        */
        allowSwitch = function(dragableElement) {
            var allowedEffects = this._allowedEffects(dragableElement);
            return (allowedEffects==='all');
        };

        init = function() {
            var instance = this;
            instance._setupKeyEv();
            instance._setupDragOverEv();
            instance._defineDragInit();
            instance._setupMouseEv();
        };

      /**
        * Returns true if the dragable-HtmlElement accepts only copy-dragables (no moveable)
        * Is determined by the attribute `dd-effect-allowed="copy"`
        *
        * @method onlyCopy
        * @param dragableElement {HtmlElement} HtmlElement that is checked for its allowed effects
        * @return {Boolean} if only copy-dragables are allowed
        * @since 0.0.1
        */
        onlyCopy = function(dragableElement) {
            var allowedEffects = this._allowedEffects(dragableElement);
            return (allowedEffects==='copy');
        };
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
        DD: DD
        Plugins: {
            NodeDD: NodeDD,
            NodeDropzone: NodeDropzone
        }
    };
};