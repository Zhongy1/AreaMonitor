from picamera import PiCamera
from time import sleep

camera = PiCamera()
camera.resolution = (1920, 1080)
camera.start_preview()
camera.start_recording('/home/pi/Desktop/video.h264')
camera.wait_recording(5)
camera.stop_recording()
camera.stop_preview()