"use strict";

/**
 * Provides `drag and drop` functionality with dropzones
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


// Redefine the API for the events `dd`, `dd-drag` and `dd-drop`, for they have more properties:

/**
* Emitted during the drag-cycle of a draggable Element (while it is dragged).
*
* @event *:dd-drag (extended by drag-drop)
* @param e {Object} eventobject including:
* @param e.target {HtmlElement} the HtmlElement that is being dragged
* @param e.dragNode {HtmlElement} The HtmlElement that is being dragged (equals e.target)
* @param [e.sourceNode] {HtmlElement} The original Element. Only when a `copy` is made --> e.dragNode is being moved while
*        e.sourceNode stand at its place.
* @param e.currentTarget {HtmlElement} the HtmlElement that is delegating
* @param e.sourceTarget {HtmlElement} the deepest HtmlElement where the mouse lies upon
* @param [e.dropTarget] {HtmlElement} The dropzone HtmlElement that will be available whenever the draggable gets over a dropzone.
* @param e.dd {Promise} Promise that gets fulfilled when dragging is ended. The fullfilled-callback has no arguments.
* @param [e.dropzone] {Promise} a Promise that will be available whenever the draggable gets over a dropzone.
*        The Promise that gets fulfilled as soon as the draggable is dropped, or outside the dropzone
*        Will fulfill with one argument: `onDropzone` {Boolean} when `true`, the draggable is dropped inside the dropzone, otherwise
*        the draggable got outside the dropzone without beging dropped.
* @param e.ctrlKey {Boolean} Whether the Ctrl/cmd key is pressed
* @param e.isCopied {Boolean} Whether the drag is a copy-drag
* @param e.xMouse {Number} the current x-position in the window-view
* @param e.yMouse {Number} the current y-position in the window-view
* @param e.clientX {Number} the current x-position in the window-view
* @param e.clientY {Number} the current y-position in the window-view
* @param e.xMouseOrigin {Number} the original x-position in the document when drag started (incl. scrollOffset)
* @param e.yMouseOrigin {Number} the original y-position in the document when drag started (incl. scrollOffset)
* @param [e.relatives] {NodeList} an optional list that the user could set in a `before`-subscriber of the `dd`-event
*        to inform which nodes are related to the draggable node and should be dragged as well.
* @param [e.relativeDragNodes] {NodeList} an optional list that holds the HtmlElements that corresponds with
*        the `e.relative` list, but is a list with draggable Elements.

* @since 0.0.1
*/

/**
* Emitted when drag-cycle of a draggable Element is ended.
*
* @event *:dd-drop (extended by drag-drop)
* @param e {Object} eventobject including:
* @param e.target {HtmlElement} the HtmlElement that is being dragged
* @param e.dragNode {HtmlElement} The HtmlElement that is being dragged (equals e.target)
* @param [e.sourceNode] {HtmlElement} The original Element. Only when a `copy` is made --> e.dragNode is being moved while
*        e.sourceNode stand at its place.
* @param e.currentTarget {HtmlElement} the HtmlElement that is delegating
* @param e.sourceTarget {HtmlElement} the deepest HtmlElement where the mouse lies upon
* @param [e.dropTarget] {HtmlElement} The dropzone HtmlElement that will be available whenever the draggable gets over a dropzone.
* @param e.dd {Promise} Promise that gets fulfilled when dragging is ended. The fullfilled-callback has no arguments.
* @param [e.dropzone] {Promise} a Promise that will be available whenever the draggable gets over a dropzone.
*        The Promise that gets fulfilled as soon as the draggable is dropped, or outside the dropzone
*        Will fulfill with one argument: `onDropzone` {Boolean} when `true`, the draggable is dropped inside the dropzone, otherwise
*        the draggable got outside the dropzone without beging dropped.
* @param e.ctrlKey {Boolean} Whether the Ctrl/cmd key is pressed
* @param e.isCopied {Boolean} Whether the drag is a copy-drag
* @param e.xMouse {Number} the current x-position in the window-view
* @param e.yMouse {Number} the current y-position in the window-view
* @param e.clientX {Number} the current x-position in the window-view
* @param e.clientY {Number} the current y-position in the window-view
* @param e.xMouseOrigin {Number} the original x-position in the document when drag started (incl. scrollOffset)
* @param e.yMouseOrigin {Number} the original y-position in the document when drag started (incl. scrollOffset)
* @param [e.relatives] {NodeList} an optional list that the user could set in a `before`-subscriber of the `dd`-event
*        to inform which nodes are related to the draggable node and should be dragged as well.
* @param [e.relativeDragNodes] {NodeList} an optional list that holds the HtmlElements that corresponds with
*        the `e.relative` list, but is a list with draggable Elements.

* @since 0.0.1
*/

/**
* Emitted when a draggable Element's drag-cycle starts. You can use a `before`-subscriber to specify
* e.relatives, which should be a nodelist with HtmlElements, that should be dragged togehter with the master
* draggable Element.
*
* @event dd (extended by drag-drop)
* @param e {Object} eventobject including:
* @param e.target {HtmlElement} the HtmlElement that is being dragged
* @param e.dragNode {HtmlElement} The HtmlElement that is being dragged (equals e.target)
* @param [e.sourceNode] {HtmlElement} The original Element. Only when a `copy` is made --> e.dragNode is being moved while
*        e.sourceNode stand at its place.
* @param e.currentTarget {HtmlElement} the HtmlElement that is delegating
* @param e.sourceTarget {HtmlElement} the deepest HtmlElement where the mouse lies upon
* @param e.dd {Promise} Promise that gets fulfilled when dragging is ended. The fullfilled-callback has no arguments.
* @param e.ctrlKey {Boolean} Whether the Ctrl/cmd key is pressed
* @param e.isCopied {Boolean} Whether the drag is a copy-drag
* @param e.xMouse {Number} the current x-position in the window-view
* @param e.yMouse {Number} the current y-position in the window-view
* @param e.clientX {Number} the current x-position in the window-view
* @param e.clientY {Number} the current y-position in the window-view
* @param e.xMouseOrigin {Number} the original x-position in the document when drag started (incl. scrollOffset)
* @param e.yMouseOrigin {Number} the original y-position in the document when drag started (incl. scrollOffset)
* @param [e.relatives] {NodeList} an optional list that the user could set in a `before`-subscriber of the `dd`-event
*        to inform which nodes are related to the draggable node and should be dragged as well.
* @param [e.relativeDragNodes] {NodeList} an optional list that holds the HtmlElements that corresponds with
*        the `e.relative` list, but is a list with draggable Elements.

* @since 0.0.1
*/

/**
 * Objecthash containing all specific information about the particular drag-cycle.
 * It has a structure like this:
 *
 * ddProps = {
 *     sourceNode {HtmlElement} original node (defined by drag-drop)
 *     dragNode {HtmlElement} Element that is dragged
 *     x {Number} absolute x-position of the draggable inside `document` when the drag starts
 *     y {Number} absolute y-position of the draggable inside `document` when the drag starts
 *     inlineLeft {String} inline css of the property `left` when drag starts
 *     inlineTop {String} inline css of the property `top` when drag starts
 *     winConstrained {Boolean} whether the draggable should be constrained to `window`
 *     xMouseLast {Number} absolute x-position of the mouse inside `document` when the drag starts
 *     yMouseLast {Number} absolute y-position of the draggable inside `document` when the drag starts
 *     winScrollLeft {Number} the left-scroll of window when drag starts
 *     winScrollTop {Number} the top-scroll of window when drag starts
 *     constrain = { // constrain-properties when constrained to a HtmlElement
 *         xOrig {Number} x-position in the document, included with left-border-width
 *         yOrig {Number} y-position in the document, included with top-border-width
 *         x {Number} xOrig corrected with scroll-left of the constrained node
 *         y {Number} yOrig corrected with scroll-top of the constrained node
 *         w {Number} scrollWidth
 *         h {Number} scrollHeight
 *     };
 *     dropzoneSpecified {Boolean} whether the draggable has a dropzone specified (either by `dd-dropzone` or by `dd-emitter`) (defined by drag-drop)
 *     dragOverEv {Object} Eventhandler that watches for `mousemove` to detect dropzone-over events (defined by drag-drop)
 *     relatives[{ // Array with objects that represent all draggables that come along with the master-draggable (in case of multiple items), excluded the master draggable itself
 *         sourceNode {HtmlElement} original node (defined by drag-drop)
 *         dragNode {HtmlElement} draggable node
 *         shiftX {Number} the amount of left-pixels that this HtmlElement differs from the dragged element
 *         shiftY {Number} the amount of top-pixels that this HtmlElement differs from the dragged element
 *         inlineLeft {String} inline css of the property `left` when drag starts
 *         inlineTop {String} inline css of the property `top` when drag starts
 *     }]
 *     relativeDragNodes [HtmlElements] Array with all `copyied` Nodes corresponding to `ddProps.relatives`. Only in case of copying multiple items (defined by drag-drop)
 * }
 *
 * @property ddProps (extended by drag-drop)
 * @default {}
 * @type Object
 * @since 0.0.1
*/

var DRAG = 'drag',
    DROP = 'drop',
    NAME = '['+DRAG+'-'+DROP+']: ',
    createHashMap = require('js-ext/extra/hashmap.js').createMap,
    COPY = 'copy',
    DROPZONE = DROP+'zone',
    SOURCE = 'source',
    DRAGGABLE = DRAG+'gable',
    DEL_DRAGGABLE = 'del-'+DRAGGABLE,
    DD_MINUS = 'dd-',
    DD_DRAGGING_CLASS = DD_MINUS+DRAG+'ging',
    DD_MASTER_CLASS = DD_MINUS+'master',
    DD_HANDLE = DD_MINUS+'handle',
    DD_SOURCE_ISCOPIED_CLASS = DD_MINUS+COPY+SOURCE,
    DD_COPIED_CLASS = DD_MINUS+COPY,
    DD_DROPZONE_MOVABLE = DD_MINUS+DROPZONE+'-movable',
    CONSTRAIN_ATTR = 'constrain-selector',
    MOUSE = 'mouse',
    DROPZONE_OVER = DROPZONE+'-over',
    DROPZONE_DROP = DROPZONE+'-'+DROP,
    DD_DROPZONE = DD_MINUS+DROPZONE,
    NO_TRANS_CLASS = 'el-notrans', // delivered by `vdom`
    DD_HIDDEN_SOURCE_CLASS = DD_MINUS+'hidden-'+SOURCE,
    INVISIBLE_CLASS = 'el-invisible', // delivered by `vdom`
    DD_TRANSITION_CLASS = DD_MINUS+'transition',
    DD_OPACITY_CLASS = DD_MINUS+'opacity',
    HIGH_Z_CLASS = DD_MINUS+'high-z',
    DD_DROPACTIVE_CLASS = DROPZONE+'-awake',
    DD_ABOVE_DROPZONE_CLASS = DD_MINUS+'above'+DROPZONE,
    REGEXP_MOVE = /\bmove\b/i,
    REGEXP_COPY = /\bcopy\b/i,
    REGEXP_ALL = /\b(all|true)\b/i,
    EMITTER = 'emitter',
    REGEXP_EMITTER = /\bemitter=((\w|,)+)\b/,
    DD_EMITTER = DD_MINUS+EMITTER,
    MOVE = 'move',
    DROPZONE_OUT = DROPZONE+'-out',
    DD_DROP = DD_MINUS+DROP,
    DD_FAKE = DD_MINUS+'fake-',
    DOWN = 'down',
    UP = 'up',
    KEY = 'key',
    MOUSEMOVE = MOUSE+MOVE,
    PANMOVE = 'pan'+MOVE,
    DD_FAKE_MOUSEMOVE = DD_FAKE+MOUSEMOVE,
    UI = 'UI',
    DROPZONE_BRACKETS = '[' + DD_DROPZONE + ']',
    DD_EFFECT_ALLOWED = DD_MINUS+'effect-allowed',
    BORDER = 'border',
    WIDTH = 'width',
    BORDER_LEFT_WIDTH = BORDER+'-left-'+WIDTH,
    BORDER_RIGHT_WIDTH = BORDER+'-right-'+WIDTH,
    BORDER_TOP_WIDTH = BORDER+'-top-'+WIDTH,
    BORDER_BOTTOM_WIDTH = BORDER+'-bottom-'+WIDTH,
    LEFT = 'left',
    TOP = 'top',
    POSITION = 'position',
    ABSOLUTE = 'absolute',
    TRUE = 'true',
    DD_MINUSDRAGGABLE = DD_MINUS+DRAGGABLE,
    PLUGIN_ATTRS = [DD_DROPZONE, CONSTRAIN_ATTR, DD_EMITTER, DD_HANDLE, DD_EFFECT_ALLOWED, DD_DROPZONE_MOVABLE];

require('polyfill/polyfill-base.js');
require('js-ext');
require('./css/drag-drop.css');

module.exports = function (window) {

    window._ITSAmodules || Object.protectedProp(window, '_ITSAmodules', createHashMap());

    if (window._ITSAmodules.DragDrop) {
        return window._ITSAmodules.DragDrop; // DragDrop was already created
    }

    var Event = require('event-dom')(window),
        DragModule = require('drag')(window),
        $superInit = DragModule.DD.init,
        ctrlPressed = false,
        dropEffect = MOVE,
        DOCUMENT = window.document,
        isMobile = require('useragent')(window).isMobile,
        supportHammer = !!Event.Hammer,
        mobileEvents = supportHammer && isMobile,
        DD, DD_Object;

    require('vdom')(window);
    require('node-plugin')(window);
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
         * @method _defFnDrop (extended by drag-drop)
         * @param e {Object} eventobject
         * @param sourceNode {HtmlElement} the original HtmlElement
         * @param dragNode {HtmlElement} the dragged HtmlElement (either original or clone)
         * @param dropzoneSpecified {Boolean} whether the sourceNode had a dropzone specified
         * @param relatives {Array} hash with all draggables that are being move togerther with the master draggable
         * @private
         * @since 0.0.1
         */
        _defFnDrop: function(e, ddProps) {
            console.log(NAME, '_defFnDrop: default function dd-drop. dropzoneSpecified: '+ddProps.dropzoneSpecified);
            var instance = this,
                sourceNode = ddProps.sourceNode,
                dragNode = ddProps.dragNode,
                dropzoneSpecified = ddProps.dropzoneSpecified,
                relatives = ddProps.relatives,
                willBeCopied,
                removeClasses = function (node) {
                    node.removeClass([NO_TRANS_CLASS, HIGH_Z_CLASS, DD_DRAGGING_CLASS, DEL_DRAGGABLE, DD_MASTER_CLASS, DD_SOURCE_ISCOPIED_CLASS]);
                };

            willBeCopied =  (e.dropTarget && ((ctrlPressed && instance.allowCopy(dragNode)) || instance.onlyCopy(dragNode)));
            willBeCopied || (e.relativeDragNodes=null);
            e.isCopied = willBeCopied;

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
            e.sourceNode.setClass(DD_ABOVE_DROPZONE_CLASS);
            e.dragNode.setClass(DD_ABOVE_DROPZONE_CLASS);
            e.dropzone.then(
                function(insideDropTarget) {
                    dropzone.removeClass(DD_DROPACTIVE_CLASS);
                    e.sourceNode.removeClass(DD_ABOVE_DROPZONE_CLASS);
                    e.dragNode.removeClass(DD_ABOVE_DROPZONE_CLASS);
                    /**
                    * Emitted when the draggable gets out of the dropzone.
                    *
                    * @event *:dropzone-out
                    * @param e {Object} eventobject including:
                    * @param e.target {HtmlElement} the dropzone
                    * @param e.dragNode {HtmlElement} The HtmlElement that is being dragged
                    * @param e.dropzone {Promise} The Promise that gets fulfilled as soon as the draggable is dropped, or outside the dropzone
                    *        Will fulfill with one argument: `onDropzone` {Boolean} when `true`, the draggable is dropped inside the dropzone, otherwise
                    *        the draggable got outside the dropzone without beging dropped.
                    * @param e.dropTarget {HtmlElement} The dropzone HtmlElement. Equals e.target
                    * @param e.ctrlKey {Boolean} Whether the Ctrl/cmd key is pressed
                    * @param e.isCopied {Boolean} Whether the drag is a copy-drag
                    * @param [e.sourceNode] {HtmlElement} The original Element. Only when a `copy` is made --> e.dragNode is being moved while
                    *        e.sourceNode stand at its place.
                    * @param e.currentTarget {HtmlElement} the HtmlElement that is delegating the draggable
                    * @param e.sourceTarget {HtmlElement} the deepest HtmlElement of the draggable where the mouse lies upon
                    * @param e.dd {Promise} Promise that gets fulfilled when dragging is ended. The fullfilled-callback has no arguments.
                    * @param e.xMouse {Number} the current x-position in the window-view
                    * @param e.yMouse {Number} the current y-position in the window-view
                    * @param e.clientX {Number} the current x-position in the window-view
                    * @param e.clientY {Number} the current y-position in the window-view
                    * @param e.xMouseOrigin {Number} the original x-position in the document when drag started (incl. scrollOffset)
                    * @param e.yMouseOrigin {Number} the original y-position in the document when drag started (incl. scrollOffset)
                    * @param [e.relatives] {NodeList} an optional list that the user could set in a `before`-subscriber of the `dd`-event
                    *        to inform which nodes are related to the draggable node and should be dragged as well.
                    * @param [e.relativeDragNodes] {NodeList} an optional list that holds the HtmlElements that corresponds with
                    *        the `e.relative` list, but is a list with draggable Elements.
                    * @since 0.1
                    */
                    insideDropTarget || e._noDDoutEvt || Event.emit(dropzone, e.emitter+':'+DROPZONE_OUT, e);
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
            var instance = this;
            instance.restoreDraggables = instance._restoreDraggables.bind(instance, e, ddProps);
            Event.defineEvent(e.emitter+':'+DD_DROP)
                .defaultFn(instance._defFnDrop.rbind(instance, ddProps))
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
                emitterName = e.emitter,
                ddProps = instance.ddProps;
            Event.defineEvent(emitterName+':'+DROPZONE_OVER)
                 .defaultFn(instance._defFnOver.bind(instance)); // no need to reassign
            return Event.after([mobileEvents ? PANMOVE : MOUSEMOVE, DD_FAKE_MOUSEMOVE], function(e2) {
                var overDropzone = false,
                    dragNode = ddProps.dragNode;
                if (typeof e2.center==='object') {
                    e2.clientX = e2.center.x;
                    e2.clientY = e2.center.y;
                }
                ddProps.mouseOverNode = e.target;
                if (e2.clientX) {
                    ddProps.xMouseLast = e2.clientX + window.getScrollLeft();
                    ddProps.yMouseLast = e2.clientY + window.getScrollTop();
                }
                dropzones.forEach(
                    function(dropzone) {
                        // don't do double:
                        if (dropzone === e.dropTarget) {
                            overDropzone = true;
                            return;
                        }
                        var dropzoneAccept = dropzone.getAttr(DD_DROPZONE) || '',
                            dropzoneMove = REGEXP_MOVE.test(dropzoneAccept),
                            dropzoneCopy = REGEXP_COPY.test(dropzoneAccept),
                            dropzoneDefDraggable = dragNode.getAttr(DD_DROPZONE),
                            dragOverPromise, dragOutEvent, effectAllowed, emitterAllowed, dropzoneEmitter, xMouseLast, yMouseLast, dropzoneAllowed;

                        // check if the mouse is inside the dropzone
                        // also check if the mouse is inside the dragged node: the dragged node might have been constrained
                        // and check if the dragged node is effectAllowed to go into the dropzone
                        xMouseLast = ddProps.xMouseLast;
                        yMouseLast = ddProps.yMouseLast;

                        if (dropzone.insidePos(xMouseLast, yMouseLast) && dragNode.insidePos(xMouseLast, yMouseLast)) {
                            effectAllowed = (!dropzoneMove && !dropzoneCopy) || (dropzoneCopy && (dropEffect===COPY)) || (dropzoneMove && (dropEffect===MOVE));
                            dropzoneEmitter = instance.getDropzoneEmitter(dropzoneAccept);
                            emitterAllowed = !dropzoneEmitter || (dropzoneEmitter.contains(emitterName));
                            dropzoneAllowed = !dropzoneDefDraggable || ((dropzoneDefDraggable===TRUE) || dropzone.matchesSelector(dropzoneDefDraggable));
                            if (dropzoneAllowed && effectAllowed && emitterAllowed) {
                                overDropzone = true;
                                e.dropTarget = dropzone;
                                // mouse is in area of dropzone
                                dragOverPromise = Promise.manage();
                                e.dropzone = dragOverPromise;
                                dragOutEvent = Event.after(
                                    [mobileEvents ? PANMOVE : MOUSEMOVE, DD_FAKE_MOUSEMOVE],
                                    function() {
                                        dragOverPromise.fulfill(false);
                                    },
                                    function(e3) {
                                        var effectAllowed, dropzoneAccept, dropzoneMove, dropzoneCopy;
                                        if (e3.type===DD_FAKE_MOUSEMOVE) {
                                            dropzoneAccept = dropzone.getAttr(DD_DROPZONE) || '';
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
                                * Emitted when the draggable gets inside a dropzone.
                                *
                                * @event *:dropzone-over
                                * @param e {Object} eventobject including:
                                * @param e.target {HtmlElement} the dropzone
                                * @param e.dragNode {HtmlElement} The HtmlElement that is being dragged
                                * @param e.dropzone {Promise} The Promise that gets fulfilled as soon as the draggable is dropped, or outside the dropzone
                                *        Will fulfill with one argument: `onDropzone` {Boolean} when `true`, the draggable is dropped inside the dropzone, otherwise
                                *        the draggable got outside the dropzone without beging dropped.
                                * @param e.dropTarget {HtmlElement} The dropzone HtmlElement. Equals e.target
                                * @param e.ctrlKey {Boolean} Whether the Ctrl/cmd key is pressed
                                * @param e.isCopied {Boolean} Whether the drag is a copy-drag
                                * @param [e.sourceNode] {HtmlElement} The original Element. Only when a `copy` is made --> e.dragNode is being moved while
                                *        e.sourceNode stand at its place.
                                * @param e.currentTarget {HtmlElement} the HtmlElement that is delegating the draggable
                                * @param e.sourceTarget {HtmlElement} the deepest HtmlElement of the draggable where the mouse lies upon
                                * @param e.dd {Promise} Promise that gets fulfilled when dragging is ended. The fullfilled-callback has no arguments.
                                * @param e.xMouse {Number} the current x-position in the window-view
                                * @param e.yMouse {Number} the current y-position in the window-view
                                * @param e.clientX {Number} the current x-position in the window-view
                                * @param e.clientY {Number} the current y-position in the window-view
                                * @param e.xMouseOrigin {Number} the original x-position in the document when drag started (incl. scrollOffset)
                                * @param e.yMouseOrigin {Number} the original y-position in the document when drag started (incl. scrollOffset)
                                * @param [e.relatives] {NodeList} an optional list that the user could set in a `before`-subscriber of the `dd`-event
                                *        to inform which nodes are related to the draggable node and should be dragged as well.
                                * @param [e.relativeDragNodes] {NodeList} an optional list that holds the HtmlElements that corresponds with
                                *        the `e.relative` list, but is a list with draggable Elements.
                                * @since 0.1
                                */
                                Event.emit(dropzone, emitterName+':'+DROPZONE_OVER, e);
                            }
                        }
                    }
                );
                overDropzone || (e.dropTarget=null);
            });
        },

       /**
         * Emits a dropzone-drop event.
         *
         * @method _emitDropzoneDrop
         * @param e {Object} eventobject to pass arround
         * @private
         * @since 0.0.1
         */
        _emitDropzoneDrop: function(e) {
            /**
            * Emitted when a draggable gets dropped inside a dropzone.
            *
            * @event *:dropzone-drop
            * @param e {Object} eventobject including:
            * @param e.target {HtmlElement} the dropzone
            * @param e.dragNode {HtmlElement} The HtmlElement that is being dragged
            * @param e.dropzone {Promise} The Promise that gets fulfilled as soon as the draggable is dropped, or outside the dropzone
            *        Will fulfill with one argument: `onDropzone` {Boolean} when `true`, the draggable is dropped inside the dropzone, otherwise
            *        the draggable got outside the dropzone without beging dropped.
            * @param e.dropTarget {HtmlElement} The dropzone HtmlElement. Equals e.target
            * @param e.ctrlKey {Boolean} Whether the Ctrl/cmd key is pressed
            * @param e.isCopied {Boolean} Whether the drag is a copy-drag
            * @param [e.sourceNode] {HtmlElement} The original Element. Only when a `copy` is made --> e.dragNode is being moved while
            *        e.sourceNode stand at its place.
            * @param e.currentTarget {HtmlElement} the HtmlElement that is delegating the draggable
            * @param e.sourceTarget {HtmlElement} the deepest HtmlElement of the draggable where the mouse lies upon
            * @param e.dd {Promise} Promise that gets fulfilled when dragging is ended. The fullfilled-callback has no arguments.
            * @param e.xMouse {Number} the current x-position in the window-view
            * @param e.yMouse {Number} the current y-position in the window-view
            * @param e.clientX {Number} the current x-position in the window-view
            * @param e.clientY {Number} the current y-position in the window-view
            * @param e.xMouseOrigin {Number} the original x-position in the document when drag started (incl. scrollOffset)
            * @param e.yMouseOrigin {Number} the original y-position in the document when drag started (incl. scrollOffset)
            * @param [e.relatives] {NodeList} an optional list that the user could set in a `before`-subscriber of the `dd`-event
            *        to inform which nodes are related to the draggable node and should be dragged as well.
            * @param [e.relativeDragNodes] {NodeList} an optional list that holds the HtmlElements that corresponds with
            *        the `e.relative` list, but is a list with draggable Elements.
            * @since 0.1
            */
            Event.emit(e.dropTarget, e.emitter+':'+DROPZONE_DROP, e);
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
                constrainRectangle, borderLeft, borderTop, dragNodeX, dragNodeY, copyToDropzone, moveToDropzone,
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
                    nodeDrag.removeClass([DD_OPACITY_CLASS, DD_TRANSITION_CLASS, HIGH_Z_CLASS, DD_DRAGGING_CLASS, NO_TRANS_CLASS, DD_MASTER_CLASS, DD_COPIED_CLASS]);
                    nodeSource.removeClass(DD_SOURCE_ISCOPIED_CLASS);
                    nodeDrag.setXY(dragNodeX+shiftX, dragNodeY+shiftY, constrainRectangle, true);
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
                    nodeSource.setXY(dragNodeX+shiftX, dragNodeY+shiftY, constrainRectangle, true);
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
                    x: dropzoneNode.left + borderLeft,
                    y: dropzoneNode.top + borderTop,
                    w: dropzoneNode.offsetWidth - borderLeft - parseInt(dropzoneNode.getStyle(BORDER_RIGHT_WIDTH), 10),
                    h: dropzoneNode.offsetHeight - borderTop - parseInt(dropzoneNode.getStyle(BORDER_BOTTOM_WIDTH), 10)
                };
                isCopied = (ctrlPressed && instance.allowCopy(dragNode)) || instance.onlyCopy(dragNode);
                if (isCopied) {
                    // backup x,y before move it into dropzone (which leads to new x,y)
                    dragNodeX = dragNode.left;
                    dragNodeY = dragNode.top;
                    // now move the dragNode into dropzone
                    relatives && relatives.forEach(
                        function(item) {
                            (dragNode!==item.dragNode) && copyToDropzone(item.sourceNode, item.dragNode, item.shiftX, item.shiftY);
                        }
                    );
                    copyToDropzone(sourceNode, dragNode, 0 ,0);
                }
                else {
                    dragNodeX = dragNode.left;
                    dragNodeY = dragNode.top;
                    relatives && relatives.forEach(
                        function(item) {
                           (dragNode!==item.dragNode) && moveToDropzone(item.sourceNode, item.dragNode, item.shiftX, item.shiftY);
                        }
                    );
                    moveToDropzone(sourceNode, dragNode, 0, 0);
                }

                sourceNode.removeClass(DEL_DRAGGABLE);
                instance._emitDropzoneDrop(e);
            }
            else {
                (dragNode.hasAttr(DD_DROPZONE_MOVABLE)) && (dropzoneNode=dragNode.inside(DROPZONE_BRACKETS));
                if (dropzoneNode && dragNode.rectangleInside(dropzoneNode)) {
                    moveInsideDropzone = function(hasMatch, nodeSource, nodeDrag, shiftX, shiftY) {
                        hasMatch && nodeSource.setXY(nodeSource+shiftX, nodeSource+shiftY, constrainRectangle, true);
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
                        x: dropzoneNode.left + borderLeft,
                        y: dropzoneNode.top + borderTop,
                        w: dropzoneNode.offsetWidth - borderLeft - parseInt(dropzoneNode.getStyle(BORDER_RIGHT_WIDTH), 10),
                        h: dropzoneNode.offsetHeight - borderTop - parseInt(dropzoneNode.getStyle(BORDER_BOTTOM_WIDTH), 10)
                    };
                    dragNodeX = dragNode.left;
                    dragNodeY = dragNode.top;
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
        _restoreDraggables: function(e, ddProps) {
            console.log(NAME, '_restoreDraggables');
            var instance = this,
                sourceNode = ddProps.sourceNode,
                dragNode = ddProps.dragNode,
                dropzoneSpecified = ddProps.dropzoneSpecified,
                x = ddProps.x,
                y = ddProps.y,
                inlineLeft = ddProps.inlineLeft,
                inlineTop = ddProps.inlineTop,
                relatives = ddProps.relatives;
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
                tearDown = function() {
                    // dragNode might be gone when this method is called for the second time
                    // therefor check its existance:
                    if (!tearedDown) {
                        tearedDown = true;
// notransRemoval || (dragNode.removeEventListener && dragNode.removeEventListener(TRANS_END, tearDown, true));
                        if (dropzoneSpecified) {
                            sourceNode.removeClass([DD_HIDDEN_SOURCE_CLASS, DEL_DRAGGABLE, DD_MASTER_CLASS, DD_SOURCE_ISCOPIED_CLASS]);
                            dragNode.remove();
                        }
                        else {
                            dragNode.removeClass([DD_TRANSITION_CLASS, HIGH_Z_CLASS, DD_DRAGGING_CLASS, DEL_DRAGGABLE, DD_MASTER_CLASS, DD_SOURCE_ISCOPIED_CLASS]);
                            dragNode.setInlineStyle(LEFT, inlineLeft)
                                    .setInlineStyle(TOP, inlineTop);
                        }
                        PLUGIN_ATTRS.forEach(function(attribute) {
                            var data = '_del_'+attribute;
                            if (sourceNode.getData(data)) {
                                sourceNode.removeAttr(attribute)
                                          .removeData(data);
                            }
                        });
                    }
                };
            dragNode.removeClass([NO_TRANS_CLASS, DD_DRAGGING_CLASS]);
            dragNode.setClass(DD_TRANSITION_CLASS);
            // transitions only work with IE10+, and that browser has addEventListener
            // when it doesn't have, it doesn;t harm to leave the transitionclass on: it would work anyway
            // nevertheless we will remove it with a timeout
// if (dragNode.addEventListener) {
    // dragNode.addEventListener(TRANS_END, tearDown, true);
// }
// ALWAYS tearDowm after delay --> when there was no repositioning, there never will be a transition-event
// LATER(tearDown, 260);
            dragNode.setXY(x, y).finally(tearDown);
            // now we might need to fire a last `dropzone` event when the dragged element returns to a dropzone when it wasn't before set it back
            if (emitDropzoneEvent) {
                dropzones = DOCUMENT.getAll(DROPZONE_BRACKETS);
                if (dropzones) {
                    winScrollTop = window.getScrollTop();
                    winScrollLeft = window.getScrollLeft();
                    dropzones.forEach(
                        function(dropzone) {
                            if (dropzone.insidePos(x, y) && !dropzone.insidePos(e.xMouse+winScrollLeft, e.yMouse+winScrollTop)) {
                                e.dropTarget = dropzone;
                                e._noDDoutEvt = true;
                                Event.emit(dropzone, e.emitter+':'+DROPZONE_OVER, e);
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
                    sourceNode.toggleClass(DD_HIDDEN_SOURCE_CLASS, !ctrlPressed);
                    sourceNode.toggleClass(DD_SOURCE_ISCOPIED_CLASS, ctrlPressed);
                    dragNode.toggleClass([DD_OPACITY_CLASS, DD_COPIED_CLASS], ctrlPressed);
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
                    * Fired when the mouse comes back into the browser-window while dd-drag was busy yet no buttons are pressed.
                    * This is a correction to the fact that the mouseup-event wasn't noticed because the mouse was outside the browser.
                    *
                    * @event dd-fake-mousemove
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
            return extract && (','+extract[1]+',');
        },

       /**
         * Initializes dragdrop. Needs to be invoked, otherwise DD won't run.
         *
         * @method init (extended by drag-drop)
         * @param dragableElement {HtmlElement} HtmlElement that is checked for its allowed effects
         * @return {Boolean} if copy-dragables are allowed
         * @since 0.0.1
         */
        init: function() {
            console.log(NAME, 'init');
            var instance = this;
            if (!instance._ddInited) {
                // we will initialize `Drag` --> don;t worry if it was initialised before,
                // Drag.init() will only run once
                $superInit.call(instance);
                instance._setupKeyEv();

                instance.notify(function(e, ddProps) {
                    var dropzones, sourceNode,
                        dragNode = ddProps.dragNode,
                        dropzoneSpecified = ddProps.dropzoneSpecified = dragNode.hasAttr(DD_DROPZONE) || dragNode.hasAttr(DD_EMITTER) || (e.emitter!==UI),
                        setupDragnode = function(nodeSource, nodeDrag, shiftX, shiftY) {
                            if (dropEffect===COPY) {
                                nodeDrag.setClass([DD_OPACITY_CLASS, DD_COPIED_CLASS]);
                                nodeSource.setClass(DD_SOURCE_ISCOPIED_CLASS);
                            }
                            else {
                                nodeSource.setClass(DD_HIDDEN_SOURCE_CLASS);
                            }
                            nodeDrag.setClass(INVISIBLE_CLASS);
                            nodeDrag.setInlineStyle(POSITION, ABSOLUTE);
                            nodeSource.parentNode.append(nodeDrag, false, nodeSource);
                            nodeDrag.setXY(ddProps.xMouseLast+shiftX, ddProps.yMouseLast+shiftY, ddProps.constrain, true);
                            nodeDrag.removeClass(INVISIBLE_CLASS);
                        };
                    if (dropzoneSpecified) {
                        sourceNode = e.sourceNode = ddProps.sourceNode = ddProps.dragNode;
                        e.dragNode = ddProps.dragNode = ddProps.sourceNode.cloneNode(true);
                        // correct sourceNode class: reset CSS set by `drag`:
                        sourceNode.removeClass([NO_TRANS_CLASS, HIGH_Z_CLASS, DD_DRAGGING_CLASS]);
                        // also correct inline CSS style for `left` and `top` of the sourceNode:
                        sourceNode.setInlineStyle(LEFT, ddProps.inlineLeft);
                        sourceNode.setInlineStyle(TOP, ddProps.inlineTop);

                        dropEffect = (instance.onlyCopy(dragNode) || (ctrlPressed && instance.allowCopy(dragNode))) ? COPY : MOVE;
                        setupDragnode(ddProps.sourceNode, ddProps.dragNode, 0, 0);
                        if (ddProps.relatives) {
                            e.relativeDragNodes = [];
                            ddProps.relatives.forEach(
                                function(item) {
                                    item.sourceNode = item.dragNode;
                                    item.dragNode = item.dragNode.cloneNode(true);
                                    setupDragnode(item.sourceNode, item.dragNode, item.shiftX, item.shiftY);
                                    e.relativeDragNodes.push(item.dragNode);
                                }
                            );
                        }
                        dropzones = DOCUMENT.getAll(DROPZONE_BRACKETS);
                        if (dropzones.length>0) {
                            // create a custom over-event that fires exactly when the mouse is over any dropzone
                            // we cannot use `hover`, because that event fails when there is an absolute floated element outsize `dropzone`
                            // lying on top of the dropzone. -> we need to check by coördinates
                            ddProps.dragOverEv = instance._defineOverEv(e, dropzones);

                        }
                    }
                    else {
                        e.dragNode = ddProps.dragNode;
                    }
                    ddProps.dragDropEv = instance._defineDropEv(e, ddProps);
                }, instance, true);

                instance.notify(instance._teardownOverEvent, instance);

            }
            instance._ddInited = true;
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

    DD_Object = window._ITSAmodules.DragDrop = {
        DD: DragModule.DD.merge(DD, {force: true}),
        Plugins: {
            nodeDD: DragModule.Plugins.nodeDD,
            nodeDropzone: DOCUMENT.definePlugin('dd', null, {
                attrs: {
                    dropzone: 'string'
                },
                defaults: {
                    dropzone: 'true'
                }
            })
        }
    };

    return DD_Object;

};