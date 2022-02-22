import RPi.GPIO as GPIO
import time
import socketio 
import signal
import sys 
     
class ptCtrl:

    def __init__(self, config):
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
    def initialize(self):
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
        
#time.sleep(27)
ptObj = ptCtrl(1)

sio = socketio.Client()

@sio.event
def connect():
    print('connected')

@sio.on('setPos', namespace='/pt') 
def setPos(opts):
    print(opts)
    ptObj.setPos(opts['r'], opts['t'])
    print("Setting Position")
   
  
sio.connect('ws://localhost:3000', namespaces=['/pt'])
    
def main():
    print('Pan/Tilt Control Spawned')
    #initialize()

    

def sigint_handler(signal, frame):
    ptObj.panner.stop()
    ptObj.tilter.stop()
    GPIO.cleanup() 
    sys.exit(0)
signal.signal(signal.SIGINT, sigint_handler)
if __name__ == "__main__":
    """ This is executed when run from the command line """
    main()
    #ptObj.panner.stop()
    #ptObj.tilter.stop()
    #GPIO.cleanup()

