"use strict";

/**
 * Provides `drag and drop` functionality
 *
 *
 * <i>Copyright (c) 2014 ITSA - https://github.com/itsa</i>
 * New BSD License - http://choosealicense.com/licenses/bsd-3-clause/
 *
 * @example
 * DD = require('drag-drop')(window);
 * DD.init();
 *
 * @module drag-drop
 * @class DD
 * @since 0.0.4
*/

var NAME = '[dragdrop]: ',
    DRAG = 'drag',
    DROP = 'drop',
    DRAGGABLE = DRAG+'gable',
    DEL_DRAGGABLE = 'del-'+DRAGGABLE,
    DD_MINUS = 'dd-',
    DD_DRAGGING_CLASS = DD_MINUS+DRAG+'ging',
    DD_MASTER_CLASS = DD_MINUS+'master',
    DD_HANDLE = DD_MINUS+'handle',
    DD_DROPZONE_MOVABLE = DD_MINUS+'dropzone-movable',
    CONSTRAIN_ATTR = 'xy-constrain',
    PROXY = 'proxy',
    MOUSE = 'mouse',
    DATA_KEY = 'dragDrop',
    DD_EFFECT_ALLOWED = DD_EFFECT_ALLOWED,
    DROPZONE = 'dropzone',
    DROPZONE_DROP = DROPZONE+'-'+DROP,
    DD_DROPZONE = DD_MINUS+DROPZONE,
    NO_TRANS_CLASS = 'el-notrans', // delivered by `dom-ext`
    DD_HIDDEN_SOURCE_CLASS = DD_MINUS+'hidden-source',
    INVISIBLE_CLASS = 'el-invisible', // delivered by `dom-ext`
    DD_TRANSITION_CLASS = DD_MINUS+'transition',
    DD_OPACITY_CLASS = DD_MINUS+'opacity',
    HIGH_Z_CLASS = DD_MINUS+'high-z',
    DD_DROPACTIVE_CLASS = 'dropactive',
    REGEXP_MOVE = /\bmove\b/i,
    REGEXP_COPY = /\bcopy\b/i,
    REGEXP_NODE_ID = /^#\S+$/,
    REGEXP_ALL = /\b(all|true)\b/i,
    REGEXP_COPY = /\bcopy\b/i,
    EMITTERNAME = 'emittername',
    REGEXP_EMITTER = /\bemittername=(\w+)\b/,
    DD_EMITTERNAME = DD_MINUS+EMITTERNAME,
    PX = 'px',
    COPY = 'copy',
    MOVE = 'move',
    DD_DRAG = DD_MINUS+DRAG,
    DROPZONE_OUT = DROPZONE+'-out',
    DD_DROP = DD_MINUS+DROP,
    UI_DD_START = 'UI:dd',
    DD_FAKE = DD_MINUS+'fake-',
    DOWN = 'down',
    UP = 'up',
    KEY = 'key',
    MOUSEUP = MOUSE+UP,
    MOUSEDOWN = MOUSE+DOWN,
    MOUSEMOVE = MOUSE+'move',
    DD_FAKE_MOUSEUP = DD_FAKE+MOUSEUP,
    DD_FAKE_MOUSEMOVE = DD_FAKE+MOUSEMOVE,
    UI = 'UI',
    DROPZONE_BRACKETS = '[' + DROPZONE + ']',
    DD_EFFECT_ALLOWED = DD_MINUS+'effect-allowed',
    BORDER = 'border',
    WIDTH = 'width',
    BORDER_LEFT_WIDTH = BORDER+'-left-'+WIDTH,
    BORDER_RIGHT_WIDTH = BORDER+'-right-'+WIDTH,
    BORDER_TOP_WIDTH = BORDER+'-top-'+WIDTH,
    BORDER_BOTTOM_WIDTH = BORDER+'-bottom-'+WIDTH,
    LEFT = 'left',
    TOP = 'top',
    WINDOW = 'window',
    POSITION = 'position',
    ABSOLUTE = 'absolute',
    TRANS_END = 'transitionend',
    TRUE = 'true',
    DD_MINUSDRAGGABLE = DD_MINUS+DRAGGABLE,
    PLUGIN_ATTRS = [DD_MINUS+DROPZONE, CONSTRAIN_ATTR, DD_EMITTERNAME, DD_HANDLE, DD_EFFECT_ALLOWED, DD_DROPZONE_MOVABLE],
    LATER = require('utils').later;

require('polyfill/polyfill-base.js');
require('js-ext');
require('./css/drag-drop.css');

module.exports = function (window) {
    var Event = require('event-dom')(window),
        NodePlugin = require('dom-ext')(window).Plugins.NodePlugin,
        DragModule = require('drag')(window),
        $superInit = DragModule.Drag.init(),
        ctrlPressed = false,
        initialised = false,
        dropEffect = MOVE,
        DD, NodeDD, NodeDropzone;

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
        _allowedEffects: function(dragableElement) {
            console.log(NAME, '_allowedEffects');
            var allowedEffects = dragableElement.getAttr(DD_EFFECT_ALLOWED);
            return allowedEffects || MOVE;
        },

        /**
         * Default function for the `*:dd-drop`-event. Overrides the definition of the `drag`-module.
         *
         * @method _defFnDrop
         * @param e {Object} eventobject
         * @param sourceNode {HtmlElement} the original HtmlElement
         * @param dragNode {HtmlElement} the dragged HtmlElement (either original or clone)
         * @param dropzoneSpecified {Boolean} whether the sourceNode had a dropzone specified
         * @param relatives {Array} hash with all draggables that are being move togerther with the master draggable
         * @private
         * @since 0.0.1
         */
        _defFnDrop: function(e, sourceNode, dragNode, dropzoneSpecified, relatives) {
            console.log(NAME, '_defFnDrop: default function dd-drop. dropzoneSpecified: '+dropzoneSpecified);
            var instance = this,
                ddProps = instance.ddProps,
                willBeCopied,
                removeClasses = function (node) {
                    node.removeClass([NO_TRANS_CLASS, HIGH_Z_CLASS, DD_DRAGGING_CLASS, DEL_DRAGGABLE]);
                };

            willBeCopied =  (e.dropTarget && ((ctrlPressed && instance.allowCopy(dragNode)) || instance.onlyCopy(dragNode)));
            if (!willBeCopied) {
                e.copyTarget = null;
                e.relativeCopyNodes = null;
            }
            else {
                e.isCopied = true;
            }

            // handle drop
            if (dropzoneSpecified) {
                instance._handleDrop(e, sourceNode, dragNode, relatives);
            }
            else {
                PLUGIN_ATTRS.forEach(function(attribute) {
                    var data = '_del_'+attribute;
                    if (dragNode.getData(data)) {
                        dragNode.removeAttr(attribute);
                        dragNode.removeData(data);
                    }
                });
                removeClasses(dragNode);
                ddProps.relatives && ddProps.relatives.forEach(
                    function(item) {
                        removeClasses(item.dragNode);
                    }
                );
            }
            instance.restoreDraggables = function() {/* NOOP */ return this;};
        },

       /**
         * Default function for the `*:dropzone`-event
         *
         * @method _defFnOver
         * @param e {Object} eventobject
         * @private
         * @since 0.0.1
         */
        _defFnOver: function(e) {
            console.log(NAME, '_defFnOver: default function dropzone');
            var dropzone = e.target;
            dropzone.setClass(DD_DROPACTIVE_CLASS);
            e.dropzone.then(
                function(insideDropTarget) {
                    dropzone.removeClass(DD_DROPACTIVE_CLASS);
                    /**
                    * Fired when the checkbox changes its value<br />
                    * Listen for this event instead of 'checkedChange',
                    * because this event is also fired when the checkbox changes its 'disabled'-state
                    * (switching value null/boolean)
                    *
                    * @event valuechange
                    * @param e {EventFacade} Event Facade including:
                    * @param e.newVal {Boolean|null} New value of the checkbox; will be 'null' when is disabled.
                    * @param e.prevVal {Boolean|null} Previous value of the checkbox; will be 'null' when was disabled.
                    * @since 0.1
                    */
                    insideDropTarget || e._noDDoutEvt || Event.emit(dropzone, e.emitterName+':'+DROPZONE_OUT, e);
                }
            );
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
         * @param inlineLeft {String} inline css `left` for the original sourceNode
         * @param inlineTop {String} inline css `top` for the original sourceNode
         * @param relatives {Array} hash with all draggables that are being move togerther with the master draggable
         * @private
         * @since 0.0.1
         */
        _defineDropEv: function(e, ddProps) {
            console.log(NAME, '_defineDropEv '+ddProps.dragNode);
            var instance = this,
                emitterName = e.emiterName,
                sourceNode = ddProps.sourceNode,
                dragNode = ddProps.dragNode,
                dropzoneSpecified = ddProps.dropzoneSpecified,
                x = ddProps.x,
                y = ddProps.y,
                inlineLeft = ddProps.inlineLeft,
                inlineTop = ddProps.inlineTop,
                relatives = ddProps.relatives;

            instance.restoreDraggables = instance._restoreDraggables.bind(instance, e, sourceNode, dragNode, dropzoneSpecified, x, y, inlineLeft, inlineTop, relatives);
            Event.defineEvent(emitterName+':'+DD_DROP)
                .defaultFn(instance._defFnDrop.rbind(instance, sourceNode, dragNode, dropzoneSpecified, relatives))
                .forceAssign(); // need to reassign, because all arguments need to be bound again and we need to override the definition of the `drag`-module
        },

        /**
         * Defines the definition of the `dropzone` event.
         * Also sets up listeners to tricker dd-over when the mouse is above an dropzone.
         *
         * @method _defineOverEv
         * @param e {Object} eventobject
         * @param dropzones {NodeList} list with dropzonenodes
         * @private
         * @since 0.0.1
         */
        _defineOverEv: function(e, dropzones) {
            console.log(NAME, '_defineOverEv');
            var instance = this,
                emitterName = e.emitterName,
                ddProps = instance.ddProps;
            Event.defineEvent(emitterName+':'+DROPZONE)
                 .defaultFn(instance._defFnOver.bind(instance)); // no need to reassign
            return Event.after([MOUSEMOVE, DD_FAKE_MOUSEMOVE], function(e2) {
                var overDropzone = false;
                ddProps.mouseOverNode = e.target;
                dropzones.forEach(
                    function(dropzone) {
                        // don't do double:
                        if (dropzone === e.dropTarget) {
                            overDropzone = true;
                            return;
                        }
                        var dropzoneAccept = dropzone.getAttr(DROPZONE) || '',
                            dropzoneMove = REGEXP_MOVE.test(dropzoneAccept),
                            dropzoneCopy = REGEXP_COPY.test(dropzoneAccept),
                            dragOverPromise, dragOutEvent, effectAllowed, emitterAllowed, dropzoneEmitter, xMouseLast, yMouseLast;

                        if (e2.clientX) {
                            ddProps.xMouseLast = e2.clientX + window.getScrollLeft();
                            ddProps.yMouseLast = e2.clientY + window.getScrollTop();
                        }

                        // check if the mouse is inside the dropzone
                        // also check if the mouse is inside the dragged node: the dragged node might have been constrained
                        // and check if the dragged node is effectAllowed to go into the dropzone
                        xMouseLast = ddProps.xMouseLast;
                        yMouseLast = ddProps.yMouseLast;

                        if (dropzone.insidePos(xMouseLast, yMouseLast) && ddProps.dragNode.insidePos(xMouseLast, yMouseLast)) {
                            effectAllowed = (!dropzoneMove && !dropzoneCopy) || (dropzoneCopy && (dropEffect===COPY)) || (dropzoneMove && (dropEffect===MOVE));
                            dropzoneEmitter = instance.getDropzoneEmitter(dropzoneAccept);
                            emitterAllowed = !dropzoneEmitter || (dropzoneEmitter===emitterName);
                            if (effectAllowed && emitterAllowed) {
                                overDropzone = true;
                                e.dropTarget = dropzone;
                                // mouse is in area of dropzone
                                dragOverPromise = Promise.manage();
                                e.dropzone = dragOverPromise;
                                dragOutEvent = Event.after(
                                    [MOUSEMOVE, DD_FAKE_MOUSEMOVE],
                                    function(e3) {
                                        dragOverPromise.fulfill(false);
                                    },
                                    function(e3) {
                                        var effectAllowed, dropzoneAccept, dropzoneMove, dropzoneCopy;
                                        if (e3.type===DD_FAKE_MOUSEMOVE) {
                                            dropzoneAccept = dropzone.getAttr(DROPZONE) || '';
                                            dropzoneMove = REGEXP_MOVE.test(dropzoneAccept);
                                            dropzoneCopy = REGEXP_COPY.test(dropzoneAccept);
                                            effectAllowed = (!dropzoneMove && !dropzoneCopy) || (dropzoneCopy && (dropEffect===COPY)) || (dropzoneMove && (dropEffect===MOVE));
                                            return !effectAllowed;
                                        }
                                        return !dropzone.insidePos((e3.clientX || e3.center.x)+window.getScrollLeft(), (e3.clientY || e3.center.y)+window.getScrollTop());
                                    }
                                );
                                dragOverPromise.finally(
                                    function(insideDropzone) {
                                        dragOutEvent.detach();
                                        insideDropzone || (e.dropTarget=null);
                                    }
                                );
                                ddProps.dragOverList.push(dragOverPromise);
                                /**
                                * Fired when the checkbox changes its value<br />
                                * Listen for this event instead of 'checkedChange',
                                * because this event is also fired when the checkbox changes its 'disabled'-state
                                * (switching value null/boolean)
                                *
                                * @event valuechange
                                * @param e {EventFacade} Event Facade including:
                                * @param e.newVal {Boolean|null} New value of the checkbox; will be 'null' when is disabled.
                                * @param e.prevVal {Boolean|null} Previous value of the checkbox; will be 'null' when was disabled.
                                * @since 0.1
                                */
                                Event.emit(dropzone, emitterName+':'+DROPZONE, e);
                            }
                        }
                    }
                );
                overDropzone || (e.dropTarget=null);
            });
        },

      /**
        * Sets the draggable node back to its original position
        *
        * @method _handleDrop
        * @param e {Object} eventobject
        * @param sourceNode {HtmlElement} the original HtmlElement
        * @param dragNode {HtmlElement} the dragged HtmlElement (either original or clone)
        * @param relatives {Array} hash with all draggables that are being move togerther with the master draggable
        * @private
        * @since 0.0.1
        */
        _handleDrop: function(e, sourceNode, dragNode, relatives) {
            console.log(NAME, '_handleDrop '+dragNode);
            var instance = this,
                dropzoneNode = e.dropTarget,
                delegatedDragging = sourceNode.hasClass(DEL_DRAGGABLE),
                constrainRectangle, borderLeft, borderTop, dragNodeX, dragNodeY, match, copyToDropzone, moveToDropzone,
                moveInsideDropzone, isCopied, dropzoneDelegatedDraggable, dropzoneIsDelegated;
            if (dropzoneNode) {
                dropzoneDelegatedDraggable = dropzoneNode.getAttr(DD_MINUSDRAGGABLE);
                dropzoneIsDelegated = dropzoneDelegatedDraggable && (dropzoneNode.getAttr(DD_MINUSDRAGGABLE)!=='true');
                copyToDropzone = function(nodeSource, nodeDrag, shiftX, shiftY) {
                    if (delegatedDragging) {
                        dropzoneIsDelegated || nodeDrag.setAttr(DD_MINUSDRAGGABLE, TRUE);
                        nodeDrag.removeClass(DEL_DRAGGABLE);
                    }
                    PLUGIN_ATTRS.forEach(function(attribute) {
                        var data = '_del_'+attribute,
                            attr = sourceNode.getData(data);
                        if (attr) {
                            if (dropzoneIsDelegated) {
                                nodeDrag.removeAttr(attribute);
                            }
                            else {
                                nodeDrag.setAttr(attribute, attr);
                            }
                            nodeSource.removeAttr(attribute);
                            nodeSource.removeData(data);
                            nodeDrag.removeData(data);
                        }
                    });
                    dropzoneNode.append(nodeDrag);
                    nodeDrag.removeClass([DD_OPACITY_CLASS, DD_TRANSITION_CLASS, HIGH_Z_CLASS, DD_DRAGGING_CLASS, NO_TRANS_CLASS]);
                    nodeDrag.setXY(dragNodeX+shiftX, dragNodeY+shiftY, constrainRectangle);
                    // make the new HtmlElement non-copyable: it only can be replaced inside its dropzone
                    dropzoneIsDelegated || nodeDrag.setAttr(DD_EFFECT_ALLOWED, MOVE).setAttr(DD_DROPZONE_MOVABLE, TRUE); // to make moving inside the dropzone possible without return to its startposition
                };
                moveToDropzone = function(nodeSource, nodeDrag, shiftX, shiftY) {
                    nodeSource.setInlineStyle(POSITION, ABSOLUTE);
                    if (delegatedDragging) {
                        dropzoneIsDelegated || nodeSource.setAttr(DD_MINUSDRAGGABLE, TRUE);
                        nodeSource.removeClass(DEL_DRAGGABLE);
                    }
                    PLUGIN_ATTRS.forEach(function(attribute) {
                        var data = '_del_'+attribute,
                            attr = sourceNode.getData(data);
                        if (attr) {
                            if (dropzoneIsDelegated) {
                                nodeSource.removeAttr(attribute);
                            }
                            else {
                                nodeSource.setAttr(attribute, attr);
                            }
                            nodeSource.removeData(data);
                        }
                    });
                    dropzoneNode.append(nodeSource);
                    nodeSource.setXY(dragNodeX+shiftX, dragNodeY+shiftY, constrainRectangle);
                    // make the new HtmlElement non-copyable: it only can be replaced inside its dropzone
                    dropzoneIsDelegated || nodeSource.setAttr(DD_EFFECT_ALLOWED, MOVE).setAttr(DD_DROPZONE_MOVABLE, TRUE); // to make moving inside the dropzone possible without return to its startposition
                    nodeSource.removeClass(DD_HIDDEN_SOURCE_CLASS);
                    nodeDrag.remove();
                };
                // reset its position, only now constrain it to the dropzondenode
                // we need to specify exactly the droparea: because we don't want to compare to any
                // scrollWidth/scrollHeight, but exaclty to the visible part of the dropzone
                borderLeft = parseInt(dropzoneNode.getStyle(BORDER_LEFT_WIDTH), 10);
                borderTop = parseInt(dropzoneNode.getStyle(BORDER_TOP_WIDTH), 10);
                constrainRectangle = {
                    x: dropzoneNode.getX() + borderLeft,
                    y: dropzoneNode.getY() + borderTop,
                    w: dropzoneNode.offsetWidth - borderLeft - parseInt(dropzoneNode.getStyle(BORDER_RIGHT_WIDTH), 10),
                    h: dropzoneNode.offsetHeight - borderTop - parseInt(dropzoneNode.getStyle(BORDER_BOTTOM_WIDTH), 10)
                };
                isCopied = (ctrlPressed && instance.allowCopy(dragNode)) || instance.onlyCopy(dragNode);
                if (isCopied) {
                    // backup x,y before move it into dropzone (which leads to new x,y)
                    dragNodeX = dragNode.getX();
                    dragNodeY = dragNode.getY();
                    // now move the dragNode into dropzone
                    relatives && relatives.forEach(
                        function(item) {
                            (dragNode!==item.dragNode) && copyToDropzone(item.sourceNode, item.dragNode, item.shiftX, item.shiftY);
                        }
                    );
                    copyToDropzone(sourceNode, dragNode, 0 ,0);
                }
                else {
                    dragNodeX = dragNode.getX();
                    dragNodeY = dragNode.getY();
                    relatives && relatives.forEach(
                        function(item) {
                           (dragNode!==item.dragNode) && moveToDropzone(item.sourceNode, item.dragNode, item.shiftX, item.shiftY);
                        }
                    );
                    moveToDropzone(sourceNode, dragNode, 0, 0);
                }

                sourceNode.removeClass(DEL_DRAGGABLE);
                /**
                * Fired when the checkbox changes its value<br />
                * Listen for this event instead of 'checkedChange',
                * because this event is also fired when the checkbox changes its 'disabled'-state
                * (switching value null/boolean)
                *
                * @event valuechange
                * @param e {EventFacade} Event Facade including:
                * @param e.newVal {Boolean|null} New value of the checkbox; will be 'null' when is disabled.
                * @param e.prevVal {Boolean|null} Previous value of the checkbox; will be 'null' when was disabled.
                * @since 0.1
                */
                Event.emit(e.copyTarget, e.emitterName+':'+DROPZONE_DROP, e);
            }
            else {
                (dragNode.hasAttr(DD_DROPZONE_MOVABLE)) && (dropzoneNode=dragNode.inside(DROPZONE_BRACKETS));
                if (dropzoneNode && dragNode.rectangleInside(dropzoneNode)) {
                    moveInsideDropzone = function(hasMatch, nodeSource, nodeDrag, shiftX, shiftY) {
                        hasMatch && nodeSource.setXY(nodeSource+shiftX, nodeSource+shiftY, constrainRectangle);
                        if (delegatedDragging) {
                            nodeSource.removeClass(DEL_DRAGGABLE);
                        }
                        PLUGIN_ATTRS.forEach(function(attribute) {
                            var data = '_del_'+attribute,
                                attr = dragNode.getData(data);
                            if (attr) {
                                if (dropzoneIsDelegated) {
                                    nodeSource.removeAttr(attribute);
                                }
                                else {
                                    nodeSource.setAttr(attribute, attr);
                                }
                                nodeSource.removeData(data);
                            }
                        });
                        nodeSource.removeClass(DD_HIDDEN_SOURCE_CLASS);
                        nodeDrag.remove();
                    };
                    // reset its position, only now constrain it to the dropzondenode
                    // we need to specify exactly the droparea: because we don't want to compare to any
                    // scrollWidth/scrollHeight, but exaclty to the visible part of the dropzone
                    dropzoneDelegatedDraggable = dropzoneNode.getAttr(DD_MINUSDRAGGABLE);
                    dropzoneIsDelegated = dropzoneDelegatedDraggable && (dropzoneNode.getAttr(DD_MINUSDRAGGABLE)!=='true');
                    borderLeft = parseInt(dropzoneNode.getStyle(BORDER_LEFT_WIDTH), 10);
                    borderTop = parseInt(dropzoneNode.getStyle(BORDER_TOP_WIDTH), 10);
                    constrainRectangle = {
                        x: dropzoneNode.getX() + borderLeft,
                        y: dropzoneNode.getY() + borderTop,
                        w: dropzoneNode.offsetWidth - borderLeft - parseInt(dropzoneNode.getStyle(BORDER_RIGHT_WIDTH), 10),
                        h: dropzoneNode.offsetHeight - borderTop - parseInt(dropzoneNode.getStyle(BORDER_BOTTOM_WIDTH), 10)
                    };
                    dragNodeX = dragNode.getX();
                    dragNodeY = dragNode.getY();
                    relatives && relatives.forEach(
                        function(item) {
                            (sourceNode!==item.sourceNode) && moveInsideDropzone(dropzoneNode, item.sourceNode, item.dragNode, item.shiftX, item.shiftY);
                        }
                    );
                    moveInsideDropzone(dropzoneNode, sourceNode, dragNode, 0, 0);
                }
                else {
                    instance.restoreDraggables();
                }
            }
            sourceNode.removeClass(DD_MASTER_CLASS);
            dragNode.removeClass(DD_MASTER_CLASS);
        },

       /**
         * Sets the draggable items back to their original place. Should only be used when you prevent the default-function of `dd-drop`,
         * so you can choose to do set the draggables back conditionally.
         *
         * @method _restoreDraggables
         * @param e {Object} eventobject
         * @param sourceNode {HtmlElement} the original HtmlElement
         * @param dragNode {HtmlElement} the dragged HtmlElement (either original or clone)
         * @param dropzoneSpecified {Boolean} whether the sourceNode had a dropzone specified
         * @param x {Number} x-position in coordinaties relative to `document` (like getX())
         * @param y {Number} y-position in coordinaties relative to `document` (like getX())
         * @param inlineLeft {String} inline css `left` for the original sourceNode
         * @param inlineTop {String} inline css `top` for the original sourceNode
         * @param relatives {Array} hash with all draggables that are being move togerther with the master draggable
         * @private
         * @since 0.0.1
         */
        _restoreDraggables: function(e, sourceNode, dragNode, dropzoneSpecified, x, y, inlineLeft, inlineTop, relatives) {
            console.log('_restoreDraggables');
            var instance = this;
            instance.restoreDraggables = function() {/* NOOP */ return this;};
            instance._setBack(e, sourceNode, dragNode, dropzoneSpecified, x, y, inlineLeft, inlineTop, e.dropzone);
            relatives && relatives.forEach(
                function(item) {
                    (dragNode!==item.dragNode) && instance._setBack(e, item.sourceNode, item.dragNode, dropzoneSpecified, x+item.shiftX, y+item.shiftY, item.inlineLeft, item.inlineTop);
                }
            );
            return instance;
        },

      /**
        * Sets the draggable node back to its original position
        *
        * @method _setBack
        * @param sourceNode {HtmlElement} the original HtmlElement
        * @param dragNode {HtmlElement} the dragged HtmlElement (either original or clone)
        * @param dropzoneSpecified {Boolean} whether the sourceNode had a dropzone specified
        * @param x {Number} x-position in coordinaties relative to `document` (like getX())
        * @param y {Number} y-position in coordinaties relative to `document` (like getX())
        * @param inlineLeft {String} inline css `left` for the original sourceNode
        * @param inlineTop {String} inline css `top` for the original sourceNode
        * @param [emitDropzoneEvent] {Boolean} whether dropzone-event should be emitted
        * @private
        * @since 0.0.1
        */
        _setBack: function(e, sourceNode, dragNode, dropzoneSpecified, x, y, inlineLeft, inlineTop, emitDropzoneEvent) {
            console.log(NAME, '_setBack to '+x+', '+y);
            var tearedDown,
                winScrollTop,
                winScrollLeft,
                dropzones,
                tearDown = function(notransRemoval) {
                    // dragNode might be gone when this method is called for the second time
                    // therefor check its existance:
                    if (!tearedDown) {
                        tearedDown = true;
                        notransRemoval || (dragNode.removeEventListener && dragNode.removeEventListener(TRANS_END, tearDown, true));
                        if (dropzoneSpecified) {
                            sourceNode.removeClass([DD_HIDDEN_SOURCE_CLASS, DEL_DRAGGABLE]);
                            dragNode.remove();
                        }
                        else {
                            dragNode.removeClass([DD_TRANSITION_CLASS, HIGH_Z_CLASS, DD_DRAGGING_CLASS, DEL_DRAGGABLE]);
                            dragNode.setInlineStyle(LEFT, inlineLeft);
                            dragNode.setInlineStyle(TOP, inlineTop);
                        }
                        PLUGIN_ATTRS.forEach(function(attribute) {
                            var data = '_del_'+attribute;
                            if (sourceNode.getData(data)) {
                                sourceNode.removeAttr(attribute);
                                sourceNode.removeData(data);
                            }
                        });
                    }
                };
            dragNode.removeClass([NO_TRANS_CLASS, DD_DRAGGING_CLASS]);
            dragNode.setClass(DD_TRANSITION_CLASS);
            // transitions only work with IE10+, and that browser has addEventListener
            // when it doesn't have, it doesn;t harm to leave the transitionclass on: it would work anyway
            // nevertheless we will remove it with a timeout
            if (dragNode.addEventListener) {
                dragNode.addEventListener(TRANS_END, tearDown, true);
            }
            // ALWAYS tearDowm after delay --> when there was no repositioning, there never will be a transition-event
            LATER(tearDown, 260);
            dragNode.setXY(x, y);
            // now we might need to fire a last `dropzone` event when the dragged element returns to a dropzone when it wasn't before set it back
            if (emitDropzoneEvent) {
                dropzones = window.document.getAll(DROPZONE_BRACKETS);
                if (dropzones) {
                    winScrollTop = window.getScrollTop();
                    winScrollLeft = window.getScrollLeft();
                    dropzones.forEach(
                        function(dropzone) {
                            if (dropzone.insidePos(x, y) && !dropzone.insidePos(e.xMouse+winScrollLeft, e.yMouse+winScrollTop)) {
                                e.dropTarget = dropzone;
                                e._noDDoutEvt = true;
                                Event.emit(dropzone, e.emitterName+':'+DROPZONE, e);
                            }
                        }
                    );
                }
            }
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
            console.log(NAME, '_setupKeyEv');
            var instance = this,
                changeClasses = function(sourceNode, dragNode) {
                    if (ctrlPressed) {
                        sourceNode.removeClass(DD_HIDDEN_SOURCE_CLASS);
                        dragNode.setClass(DD_OPACITY_CLASS);
                    }
                    else {
                        sourceNode.setClass(DD_HIDDEN_SOURCE_CLASS);
                        dragNode.removeClass(DD_OPACITY_CLASS);
                    }
                };
            Event.after([KEY+DOWN, KEY+UP], function(e) {
                console.log(NAME, 'event '+e.type);
                var ddProps = instance.ddProps,
                    sourceNode = ddProps.sourceNode,
                    dragNode, mouseOverNode;
                ctrlPressed = e.ctrlKey || e.metaKey;
                if (sourceNode && instance.allowSwitch(sourceNode)) {
                    dragNode = ddProps.dragNode;
                    mouseOverNode = ddProps.mouseOverNode;
                    dropEffect = ctrlPressed ? COPY : MOVE;
                    changeClasses(sourceNode, dragNode);
                    ddProps.relatives && ddProps.relatives.forEach(
                        function(item) {
                            changeClasses(item.sourceNode, item.dragNode);
                        }
                    );
                    // now, it could be that any droptarget should change its appearance (DD_DROPACTIVE_CLASS).
                    // we need to recalculate it for all targets
                    // we do this by emitting a DD_FAKE_MOUSEMOVE event
                    /**
                    * Fired when the checkbox changes its value<br />
                    * Listen for this event instead of 'checkedChange',
                    * because this event is also fired when the checkbox changes its 'disabled'-state
                    * (switching value null/boolean)
                    *
                    * @event valuechange
                    * @param e {EventFacade} Event Facade including:
                    * @param e.newVal {Boolean|null} New value of the checkbox; will be 'null' when is disabled.
                    * @param e.prevVal {Boolean|null} Previous value of the checkbox; will be 'null' when was disabled.
                    * @private
                    * @since 0.1
                    */
                    mouseOverNode && Event.emit(mouseOverNode, UI+':'+DD_FAKE_MOUSEMOVE);
                }
            });
        },

      /**
        * Cleansup the dragover subscriber and fulfills any dropzone-promise.
        *
        * @method _teardownOverEvent
        * @param e {Object} eventobject
        * @private
        * @since 0.0.1
        */
        _teardownOverEvent: function(e, ddProps) {
            console.log('_teardownOverEvent');
            var dragOverEvent = ddProps.dragOverEv,
                mouseX = e.xMouse,
                mouseY = e.yMouse,
                winScrollTop, winScrollLeft;
            if (dragOverEvent) {
                dragOverEvent.detach();
                winScrollTop = window.getScrollTop();
                winScrollLeft = window.getScrollLeft();
                ddProps.dragOverList.forEach(function(promise) {
                    promise.fulfill(e.dropTarget && e.dropTarget.insidePos(mouseX+winScrollLeft, mouseY+winScrollTop));
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
            console.log('allowCopy --> '+REGEXP_ALL.test(allowedEffects) || REGEXP_COPY.test(allowedEffects));
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
            console.log('allowSwitch --> '+REGEXP_ALL.test(this._allowedEffects(dragableElement)));
            return REGEXP_ALL.test(this._allowedEffects(dragableElement));
        },

       /**
         * Returns the emitterName that the dropzone accepts.
         *
         * @method getDropzoneEmitter
         * @param dropzone {String} dropzone attribute of the dropzone HtmlElement
         * @return {String|null} the emitterName that is accepted
         * @since 0.0.1
         */
        getDropzoneEmitter: function(dropzone) {
            var extract = dropzone.match(REGEXP_EMITTER);
            console.log('getDropzoneEmitter --> '+(extract && extract[1]));
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
            console.log(NAME, 'init');
            var instance = this;
            if (!instance.initialised) {
                // we will initialize `Drag` --> don;t worry if it was initialised before,
                // Drag.init() will only run once
                $superInit();
                instance._setupKeyEv();

                instance.notify(function(e, ddProps) {
                    var dropzones,
                        sourceNode = ddProps.sourceNode,
                        dropzoneSpecified = ddProps.dropzoneSpecified = sourceNode.hasAttr(DD_DROPZONE) || (e.emitterName!==UI),
                        setupDragnode = function(nodeSource, nodeDrag, shiftX, shiftY) {
                            (dropEffect===COPY) ? nodeDrag.setClass(DD_OPACITY_CLASS) : nodeSource.setClass(DD_HIDDEN_SOURCE_CLASS);
                            nodeDrag.setClass(INVISIBLE_CLASS);

                            nodeDrag.setInlineStyle(POSITION, ABSOLUTE);
                            nodeSource.parentNode.append(nodeDrag, nodeSource);

                            nodeDrag.setXY(ddProps.xMouseLast+shiftX, ddProps.yMouseLast+shiftY, ddProps.constrain, true);
                            nodeDrag.removeClass(INVISIBLE_CLASS);
                        };
                    if (dropzoneSpecified) {
                        ddProps.dragNode = ddProps.sourceNode.clone(true);
                        dropEffect = (instance.onlyCopy(sourceNode) || (ctrlPressed && instance.allowCopy(sourceNode))) ? COPY : MOVE;
                        setupDragnode(sourceNode, ddProps.dragNode, 0, 0);
                        ddProps.relatives && ddProps.relatives.forEach(
                            function(item) {
                                item.dragNode = item.sourceNode.clone(true);
                                setupDragnode(item.sourceNode, item.dragNode, item.shiftX, item.shiftY);
                            }
                        );
                        dropzones = window.document.getAll(DROPZONE_BRACKETS);
                        if (dropzones.length>0) {
                            // create a custom over-event that fires exactly when the mouse is over any dropzone
                            // we cannot use `hover`, because that event fails when there is an absolute floated element outsize `dropzone`
                            // lying on top of the dropzone. -> we need to check by coördinates
                            ddProps.dragOverEv = instance._defineOverEv(e, dropzones);

                        }
                    }
                    ddProps.dragDropEv = instance._defineDropEv(e, ddProps);
                }, instance, true);

                instance.notify(instance._teardownOverEvent, instance);

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
            console.log('onlyCopy --> '+REGEXP_COPY.test(this._allowedEffects(dragableElement)));
            return REGEXP_COPY.test(this._allowedEffects(dragableElement));
        },

       /**
         * Sets the draggable items back to their original place. Should only be used when you prevent the default-function of `dd-drop`,
         * so you can choose to do set the draggables back conditionally.
         *
         * @method restoreDraggables
         * @private
         * @chainable
         * @since 0.0.1
         */
        restoreDraggables: function() {/* NOOP */ return this;}

    };

    NodeDropzone = NodePlugin.subClass(
        function (config) {
            var dropzone = TRUE,
                emitterName;
            config || (config={});
            if (config.copy && !config.move) {
                dropzone = COPY;
            }
            else if (!config.copy && config.move) {
                dropzone = MOVE;
            }
            (emitterName=config.emitterName) && (dropzone+=' '+EMITTERNAME+'='+emitterName);
            this.dropzone = dropzone;
        }
    );

    return {
        DD: DragModule.Drag.merge(DD, true),
        Plugins: {
            NodeDD: DragModule.Plugins.NodeDD,
            NodeDropzone: NodeDropzone
        }
    };
};