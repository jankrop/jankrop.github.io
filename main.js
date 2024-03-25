const angle_slider = document.getElementById('angle')
const fov_slider = document.getElementById('fov')
const distance_slider = document.getElementById('distance')
const show_unseen = document.getElementById('show_unseen')

const elementCanvas = document.getElementById('elementCanvas');
const ectx = elementCanvas.getContext('2d');

const viewCanvas = document.getElementById('viewCanvas');
const vctx = viewCanvas.getContext('2d');

elementCanvas.width = window.innerWidth;
elementCanvas.height = window.innerHeight;
viewCanvas.width = window.innerWidth;
viewCanvas.height = window.innerHeight;

let FOV_width_angle = fov_slider.value / 180 * Math.PI;  // Width of field of view (radians)
let view_angle = angle_slider.value / 180 * Math.PI;  // The direction we're looking at (radians)
let view_distance = distance_slider.value;  // The distance we can see

angle_slider.oninput = () => {
    view_angle = angle_slider.value / 180 * Math.PI;
}

fov_slider.oninput = () => {
    FOV_width_angle = fov_slider.value / 180 * Math.PI;
}

distance_slider.oninput = () => {
    view_distance = distance_slider.value;
}

show_unseen.onchange = () => {
    if (show_unseen.checked) {
        viewCanvas.style.opacity = '0.5'
    } else {
        viewCanvas.style.opacity = '1'
    }
}

const objects = [
    { x: 200, y: 200, w: 50, h: 50 },
    { x: 300, y: 300, w: 200, h: 25 },
    { x: 600, y: 250, w: 50, h: 150 },
    { x: 250, y: 500, w: 25, h: 50 }
]

const actor = { x: 100, y: 100 }

document.onmousemove = (e) => {
    actor.x = e.clientX
    actor.y = e.clientY
}

setInterval(() => {
    for (objectData of objects) {
        ectx.beginPath()
        ectx.clearRect(0, 0, ectx.width, ectx.height)
        ectx.rect(objectData.x, objectData.y, objectData.w, objectData.h)
        ectx.fillStyle = 'red'
        ectx.fill()
        ectx.closePath()
    }

    // Draw the darkness
    vctx.beginPath()
    vctx.rect(0, 0, viewCanvas.width, viewCanvas.height)
    vctx.fillStyle = 'black'
    vctx.fill()
    vctx.closePath()

    // Draw the field of view
    vctx.globalCompositeOperation = 'destination-out'
    vctx.beginPath()
    vctx.moveTo(actor.x, actor.y)
    vctx.lineTo(actor.x + view_distance * Math.cos(view_angle + FOV_width_angle / 2), actor.y + view_distance * Math.sin(view_angle + FOV_width_angle / 2))
    vctx.arc(actor.x, actor.y, view_distance, view_angle + FOV_width_angle / 2, view_angle - FOV_width_angle / 2, true)
    vctx.lineTo(actor.x, actor.y)
    vctx.fill()
    vctx.closePath()
    vctx.globalCompositeOperation = 'source-over'

    for (objectData of objects) {
        // Exclude what's behind the object from the field of view
        // For this, we need to find two lines going from the actor to the corners of the object
        // and exclude a trapezoid marked by these lines, a line connecting two corners of the object,
        // and the edge of the field of view
        // I came up with this all by myself, ain't I clever?
        // That's some uni level trig goin' on right there
        // Pretty good for a 10th grader, huh?

        // Find the corners of the object
        let corners = []
        if ((actor.x < objectData.x && actor.y < objectData.y) || (actor.x >= objectData.x + objectData.w && actor.y >= objectData.y + objectData.h)) {
            corners = [
                { x: objectData.x, y: objectData.y + objectData.h },
                { x: objectData.x + objectData.w, y: objectData.y }
            ]
        } else if (actor.x >= objectData.x && actor.x < objectData.x + objectData.w && actor.y < objectData.y) {
            corners = [
                { x: objectData.x, y: objectData.y },
                { x: objectData.x + objectData.w, y: objectData.y }
            ]
        } else if ((actor.x >= objectData.x + objectData.w && actor.y < objectData.y) || (actor.x < objectData.x && actor.y >= objectData.y + objectData.h)) {
            corners = [
                { x: objectData.x, y: objectData.y },
                { x: objectData.x + objectData.w, y: objectData.y + objectData.h }
            ]
        } else if (actor.x >= objectData.x + objectData.w && actor.y >= objectData.y && actor.y < objectData.y + objectData.h) {
            corners = [
                { x: objectData.x + objectData.w, y: objectData.y },
                { x: objectData.x + objectData.w, y: objectData.y + objectData.h }
            ]
        } else if (actor.x >= objectData.x && actor.x < objectData.x + objectData.w && actor.y >= objectData.y + objectData.h) {
            corners = [
                { x: objectData.x, y: objectData.y + objectData.h },
                { x: objectData.x + objectData.w, y: objectData.y + objectData.h }
            ]
        } else if (actor.x < objectData.x && actor.y >= objectData.y && actor.y < objectData.y + objectData.h) {
            corners = [
                { x: objectData.x, y: objectData.y },
                { x: objectData.x, y: objectData.y + objectData.h }
            ]
        }

        // Find the lines
        const angle1 = Math.atan2(corners[0].y - actor.y, corners[0].x - actor.x)
        const angle2 = Math.atan2(corners[1].y - actor.y, corners[1].x - actor.x)

        // Draw the excluded trapezoid
        vctx.beginPath()
        vctx.moveTo(actor.x + view_distance * 2 * Math.cos(angle1), actor.y + view_distance * 2 * Math.sin(angle1))
        vctx.lineTo(corners[0].x, corners[0].y)
        vctx.lineTo(corners[1].x, corners[1].y)
        vctx.lineTo(actor.x + view_distance * 2 * Math.cos(angle2), actor.y + view_distance * 2 * Math.sin(angle2))
        vctx.fillStyle = 'black'
        vctx.fill()
        vctx.closePath()

        // Also exclude the object itself
        vctx.beginPath()
        vctx.rect(objectData.x, objectData.y, objectData.w, objectData.h)
        vctx.fillStyle = 'black'
        vctx.fill()
    }
}, 1000 / 30)
