import { Joystick } from "./classes/joystick";

let joystick = new Joystick(document.getElementById('joy-1'), {
    sendTo: '/integration/test1',
    debug: true
});
joystick.init();