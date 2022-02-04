import RPi.GPIO as GPIO
import time

panServoPin = 11
tiltServoPin = 13
GPIO.setmode(GPIO.BOARD)
GPIO.setup(panServoPin, GPIO.OUT)
GPIO.setup(tiltServoPin, GPIO.OUT)

p1 = GPIO.PWM(panServoPin, 50) # GPIO 11 for PWM with 50Hz
p2 = GPIO.PWM(tiltServoPin, 50) # GPIO 13 for PWM with 50Hz
p1.start(2.5) # Initialization
p2.start(2.5) # Initialization
try:
  while True:
    p1.ChangeDutyCycle(5)
    p2.ChangeDutyCycle(5)
    time.sleep(0.5)
    p1.ChangeDutyCycle(7.5)
    p2.ChangeDutyCycle(7.5)
    time.sleep(0.5)
    p1.ChangeDutyCycle(10)
    p2.ChangeDutyCycle(10)
    time.sleep(0.5)
    p1.ChangeDutyCycle(12.5)
    p2.ChangeDutyCycle(12.5)
    time.sleep(0.5)
    p1.ChangeDutyCycle(10)
    p2.ChangeDutyCycle(10)
    time.sleep(0.5)
    p1.ChangeDutyCycle(7.5)
    p2.ChangeDutyCycle(7.5)
    time.sleep(0.5)
    p1.ChangeDutyCycle(5)
    p2.ChangeDutyCycle(5)
    time.sleep(0.5)
    p1.ChangeDutyCycle(2.5)
    p2.ChangeDutyCycle(2.5)
    time.sleep(0.5)
except KeyboardInterrupt:
  p1.stop()
  p2.stop()
  GPIO.cleanup()