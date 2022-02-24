import RPi.GPIO as GPIO
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
        
        self.panServoPin = 11
        self.tiltServoPin = 13
        GPIO.setmode(GPIO.BOARD)
        GPIO.setup(self.panServoPin, GPIO.OUT)
        GPIO.setup(self.tiltServoPin,GPIO.OUT)

        self.panner = GPIO.PWM(self.panServoPin, 50)
        self.tilter = GPIO.PWM(self.tiltServoPin, 50)
        self.r = 7.5
        self.t = 5.0
        self.panner.start(self.r)
        self.tilter.start(self.t)
        

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
    
    # Overwrite the home position with the current position
    def setHome(self, x, y):
        return

    # Traverse to the home position
    def goHome():
        return

    # Traverse to the desired coordinates at the desired speed
    # (Tim) We can consider exlcuding this function if deemed unnecessary.
    def setPos(self, r, t):
        self.r = r*5/100 + 7.5
        self.t = t*5/100 + 7.5
        self.panner.ChangeDutyCycle(self.r)
        self.tilter.ChangeDutyCycle(self.t)
        return

    def offsetPos(self, x, y):
        return

    def panLeft(self, distance):
        self.panner.ChangeDutyCycle(2.5)

    def panRight(self, distance):
        self.panner.ChangeDutyCycle(12.5)

    def tiltUp(self, distance):
        return

    def tiltDown(self, distance):
        return

def main():
    print('Pan/Tilt Control Spawned')
    
    def sigint_handler(signal, frame):
        try:
            ptObj.sio.disconnect()
            ptObj.panner.stop()
            ptObj.tilter.stop()
        except Exception:
            pass
        GPIO.cleanup()
    
    signal.signal(signal.SIGINT, sigint_handler)
    
    ptObj = ptCtrl(1)
            

if __name__ == "__main__":
    """ This is executed when run from the command line """
    main()

