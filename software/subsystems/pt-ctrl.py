#import RPi.GPIO as GPIO
import pigpio
import time
import threading
import socketio 
import signal
import sys 
     
class ptCtrl:

    def __init__(self, config):
        self.sio = socketio.Client(reconnection_delay=5, reconnection_delay_max=5, handle_sigint=True)
        self.initIO()
        self.connectIO()
        
        self.panServoPin = 17
        self.tiltServoPin = 27
        self.pi = pigpio.pi()
        self.pi.set_mode(self.panServoPin, pigpio.OUTPUT)
        self.pi.set_mode(self.tiltServoPin, pigpio.OUTPUT)
        self.pi.set_PWM_frequency(self.panServoPin, 50)
        self.pi.set_PWM_frequency(self.tiltServoPin, 50)
        self.r = 1500
        self.t = 1500
        self.pi.set_servo_pulsewidth(self.panServoPin, self.r)
        self.pi.set_servo_pulsewidth(self.tiltServoPin, self.t)
        

    # Initialize the servos and pins
    def initIO(self):
        
        @self.sio.on('doOffset', namespace='/pt')
        def on_doOffset(opts):
            self.offsetPos(opts['r'], opts['t'])
        
        @self.sio.on('setPos', namespace='/pt') 
        def on_setPos(opts):
            self.setPos(opts['r'], opts['t'])
        
        return
        
    def connectIO(self):
        while True:
            try:
                self.sio.connect('ws://localhost:3000', namespaces=['/pt'])
                return
            except Exception:
                time.sleep(5)
        
        return

    # Traverse to the desired coordinates at the desired speed
    # (Tim) We can consider exlcuding this function if deemed unnecessary.
    def setPos(self, r, t):
        self.setPanDeg(r)
        self.setTiltDeg(t)
        self.updatePos()
        return

    def offsetPos(self, r, t):
        if(r  > 180):
            r = 180
        elif(r < -180):
            r = -180
        
        if(t > 90):
            t = 90
        elif(t < -90):
            t = -90
        
        offsetR = r*2000/180
        offsetT = t*2000/180
        self.setPan(self.r + offsetR)
        self.setTilt(self.t + offsetT)
        self.updatePos()

    def setPan(self, r):
        if(r  > 70*2000/180 + 1500): # TODO IS WRONG?
            r = 70*2000/180 + 1500
        elif(r < -70*2000/180 + 1500):
            r = -70*2000/180 + 1500
        self.r = r
        self.pi.set_servo_pulsewidth(self.panServoPin, self.r)

    def setPanDeg(self, r):
        if(r  > 70):
            r = 70
        elif(r < -70):
            r = -70
        self.r = r*2000/180 + 1500 
        self.pi.set_servo_pulsewidth(self.panServoPin, self.r)
        

    def setTilt(self, t):
        if(t > 70*2000/180 + 1500):
            t = 70*2000/180 + 1500
        elif(t < 0*2000/180 + 1500):
            t = 0*2000/180 + 1500
        self.t = t
        self.pi.set_servo_pulsewidth(self.tiltServoPin, self.t)

    def setTiltDeg(self, t):
        if(t > 70):
            t = 70
        elif(t < 0):
            t = 0
        self.t = t*2000/180 + 1500
        self.pi.set_servo_pulsewidth(self.tiltServoPin, self.t)

    def updatePos(self):
        self.sio.emit('updatePos', {'r': self.r, 't' : self.t}, namespace='/pt')

def main():
    print('Pan/Tilt Control Spawned')
    
    def sigint_handler(signal, frame):
        try:
            ptObj.sio.disconnect()

        except Exception:
            pass

    
    signal.signal(signal.SIGINT, sigint_handler)
    
    ptObj = ptCtrl(1)
            

if __name__ == "__main__":
    """ This is executed when run from the command line """
    main()

