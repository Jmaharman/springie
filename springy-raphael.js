define(['springy', 'raphael-amd'], function(Springy, Raphael) {

/**
 * Originally grabbed from the official RaphaelJS Documentation
 * http://raphaeljs.com/graffle.html
 * Adopted (arrows) and commented by Philipp Strathausen http://blog.ameisenbar.de
 * Licenced under the MIT licence.
 */

/**
 * Usage:
 * connect two shapes
 * parameters:
 *      source shape [or connection for redrawing],
 *      target shape,
 *      style with { fg : linecolor, bg : background color, directed: boolean }
 * returns:
 *      connection { draw = function() }
 */
Raphael.fn.connection = function (obj1, obj2, style) {
    var selfRef = this;
    /* create and return new connection */
    var edge = {/*
        from : obj1,
        to : obj2,
        style : style,*/
        draw : function() {
            /* get bounding boxes of target and source */
            var bb1 = obj1.getBBox();
            var bb2 = obj2.getBBox();
            var off1 = 0;
            var off2 = 0;
            /* coordinates for potential connection coordinates from/to the objects */
            var p = [
                {x: bb1.x + bb1.width / 2, y: bb1.y - off1},              /* NORTH 1 */
                {x: bb1.x + bb1.width / 2, y: bb1.y + bb1.height + off1}, /* SOUTH 1 */
                {x: bb1.x - off1, y: bb1.y + bb1.height / 2},             /* WEST  1 */
                {x: bb1.x + bb1.width + off1, y: bb1.y + bb1.height / 2}, /* EAST  1 */
                {x: bb2.x + bb2.width / 2, y: bb2.y - off2},              /* NORTH 2 */
                {x: bb2.x + bb2.width / 2, y: bb2.y + bb2.height + off2}, /* SOUTH 2 */
                {x: bb2.x - off2, y: bb2.y + bb2.height / 2},             /* WEST  2 */
                {x: bb2.x + bb2.width + off2, y: bb2.y + bb2.height / 2}  /* EAST  2 */
            ];

            /* distances between objects and according coordinates connection */
            var d = {}, dis = [];

            /*
             * find out the best connection coordinates by trying all possible ways
             */
            /* loop the first object's connection coordinates */
            for (var i = 0; i < 4; i++) {
                /* loop the seond object's connection coordinates */
                for (var j = 4; j < 8; j++) {
                    var dx = Math.abs(p[i].x - p[j].x),
                        dy = Math.abs(p[i].y - p[j].y);
                    if ((i == j - 4) || (((i != 3 && j != 6) || p[i].x < p[j].x) && ((i != 2 && j != 7) || p[i].x > p[j].x) && ((i != 0 && j != 5) || p[i].y > p[j].y) && ((i != 1 && j != 4) || p[i].y < p[j].y))) {
                        dis.push(dx + dy);
                        d[dis[dis.length - 1].toFixed(3)] = [i, j];
                    }
                }
            }
            var res = dis.length == 0 ? [0, 4] : d[Math.min.apply(Math, dis).toFixed(3)];
            /* bezier path */
            var x1 = p[res[0]].x,
                y1 = p[res[0]].y,
                x4 = p[res[1]].x,
                y4 = p[res[1]].y,
                dx = Math.max(Math.abs(x1 - x4) / 2, 10),
                dy = Math.max(Math.abs(y1 - y4) / 2, 10),
                x2 = [x1, x1, x1 - dx, x1 + dx][res[0]].toFixed(3),
                y2 = [y1 - dy, y1 + dy, y1, y1][res[0]].toFixed(3),
                x3 = [0, 0, 0, 0, x4, x4, x4 - dx, x4 + dx][res[1]].toFixed(3),
                y3 = [0, 0, 0, 0, y1 + dy, y1 - dy, y4, y4][res[1]].toFixed(3);
            /* assemble path and arrow */
            var path = ["M", x1.toFixed(3), y1.toFixed(3), "C", x2, y2, x3, y3, x4.toFixed(3), y4.toFixed(3)].join(",");
            /* arrow */
            if(style && style.directed) {
                /* magnitude, length of the last path vector */
                var mag = Math.sqrt((y4 - y3) * (y4 - y3) + (x4 - x3) * (x4 - x3));
                /* vector normalisation to specified length  */
                var norm = function(x,l){return (-x*(l||5)/mag);};
                /* calculate array coordinates (two lines orthogonal to the path vector) */
                var arr = [
                    {x:(norm(x4-x3)+norm(y4-y3)+x4).toFixed(3), y:(norm(y4-y3)+norm(x4-x3)+y4).toFixed(3)},
                    {x:(norm(x4-x3)-norm(y4-y3)+x4).toFixed(3), y:(norm(y4-y3)-norm(x4-x3)+y4).toFixed(3)}
                ];
                path = path + ",M"+arr[0].x+","+arr[0].y+",L"+x4+","+y4+",L"+arr[1].x+","+arr[1].y;
            }
            /* function to be used for moving existent path(s), e.g. animate() or attr() */
            var move = "attr";
            /* applying path(s) */
            edge.fg && edge.fg[move]({path:path})
                || (edge.fg = selfRef.path(path).attr({stroke: style && style.stroke || "#000", fill: "none"}).toBack());
            edge.bg && edge.bg[move]({path:path})
                || style && style.fill && (edge.bg = style.fill.split && selfRef.path(path).attr({stroke: style.fill.split("|")[0], fill: "none", "stroke-width": style.fill.split("|")[1] || 3}).toBack());
            /* setting label */
            style && style.label
                && (edge.label && edge.label.attr({x:(x1+x4)/2, y:(y1+y4)/2})
                    || (edge.label = selfRef.text((x1+x4)/2, (y1+y4)/2, style.label).attr({fill: "#000", "font-size": style["font-size"] || "12px"})));
            style && style.label && style["label-style"] && edge.label && edge.label.attr(style["label-style"]);
            style && style.callback && style.callback(edge);
        }
    }
    edge.draw();
    return edge;
};

Raphael.fn.label = function(str) {

    var color = Raphael.getColor();

    this.setStart();

    var shape = this.rect(0, 0, 60, 30, 10);
    shape.attr({fill: '#ffffff', stroke: color, "fill-opacity": 0, "stroke-width": 2, cursor: "move"}).setOffset();

    var text = this.text(30, 15, str).attr({'font-size': 15, cursor: "move"}).setOffset();

    return this.setFinish();

};

Raphael.el.setOffset = function() {
    this.offsetx = this.attr('x');
    this.offsety = this.attr('y');
};

function moveSet(set, x, y) {
    set.forEach(function(item) {
        item.attr({
            x: x + item.offsetx,
            y: y + item.offsety
        });
    });
}

var Layout = Springy.Layout,
	Renderer = Springy.Renderer,
	Vector = Springy.Vector;

function renderGraph(element, canvasWidth, canvasHeight, graph) {
    if (canvasWidth === 0 || canvasHeight === 0 ) alert('Please provide a height and width that are greater than 0.');

    var layout = new Layout.ForceDirected(graph, canvasWidth, canvasHeight, 0.5);

    var r = Raphael(element.id, canvasWidth, canvasHeight);

	// calculate bounding box of graph layout.. with ease-in
	var currentBB = layout.getBoundingBox();
	var targetBB = {bottomleft: new Vector(-2, -2), topright: new Vector(2, 2)};

	// auto adjusting bounding box
	Layout.requestAnimationFrame(function adjust() {
		targetBB = layout.getBoundingBox();
		// current gets 20% closer to target every iteration
		currentBB = {
			bottomleft: currentBB.bottomleft.add( targetBB.bottomleft.subtract(currentBB.bottomleft)
				.divide(10)),
			topright: currentBB.topright.add( targetBB.topright.subtract(currentBB.topright)
				.divide(10))
		};

		Layout.requestAnimationFrame(adjust);
	});

	// convert to/from screen coordinates
	var toScreen = function(p) {
		var size = currentBB.topright.subtract(currentBB.bottomleft);
		var sx = p.subtract(currentBB.bottomleft).divide(size.x).x * r.width;
		var sy = p.subtract(currentBB.bottomleft).divide(size.y).y * r.height;
		return new Vector(sx, sy);
	};

	var fromScreen = function(s) {
		var size = currentBB.topright.subtract(currentBB.bottomleft);
		var px = (s.x / canvasWidth) * size.x + currentBB.bottomleft.x;
		var py = (s.y / canvasHeight) * size.y + currentBB.bottomleft.y;

		return new Vector(px, py);
	};

	var selected = null;
	var nearest = null;
	var dragged = null;

	var dragMove = function(dx, dy, x, y, e) {
		var pos = $(element).offset();
		var p = fromScreen({x: e.pageX - pos.left, y: e.pageY - pos.top});
        var nodePoint = layout.point(this);

		nodePoint.p.x = p.x;
        nodePoint.p.y = p.y;

		renderer.start();
	};

	var dragStart = function(x, y, e) {
		var nodePoint = layout.point(this);
        nodePoint.m = 10000.0;

		renderer.start();
	};

	var dragDummy = function() {};

    var renderer = new Renderer(10, layout,
        function clear() {
            // code to clear screen
        },
        function drawEdge(edge, p1, p2) {
            var connection;

            if (!edge.connection) {

                if (!edge.source.shape || !edge.target.shape)
                    return;

                connection = r.connection(edge.source.shape, edge.target.shape, {stroke: edge.data['color']});
                edge.connection = connection;

            } else {
                edge.connection.draw();
            }

        },
        function drawNode(node, p) {

            var shape;

            if (!node.shape) {
                node.shape = r.label(node.data['label']);
                node.shape.drag(dragMove, dragStart, dragDummy, node, node, node);
                node.shape.node = node;
            }
            shape = node.shape;

            s = toScreen(p);
            moveSet(shape, Math.floor(s.x), Math.floor(s.y));

        });

    renderer.start();

}

return renderGraph;

});