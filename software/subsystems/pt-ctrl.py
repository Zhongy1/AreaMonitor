import RPi.GPIO as GPIO
import time
     
class ptCtrl:

    def __init__(self, config):

    # Initialize the servos and pins
    def initialize():
    
    # Overwrite the home position with the current position
    def setHome(x, y):

    # Traverse to the home position
    def goHome():

    # Traverse to the desired coordinates at the desired speed
    # (Tim) We can consider exlcuding this function if deemed unnecessary.
    def setPos(x, y, vel):

    def offsetPos(x, y, vel):

    def panLeft(distance):

    def panRight(distance):

    def tiltUp(distance):

    def tiltDown(distance):

def main():
    print('Pan/Tilt Control Spawned')
    initialize()

if __name__ == "__main__":
    """ This is executed when run from the command line """
    main()
