# AreaMonitor

# Meeting Times
Sprint Planning: Tuesday of sprint; T 10:00 am - 10:50 am

Weekly Scrum Meetings: R 2:00 pm - 2:50 pm

## Setup Remote Access
Github has removed password authentication in the command line. You will have to set up an ssh key. Follow these steps (skip to 3 if you have a key):
1. Open a terminal or powershell
2. Run `ssh-keygen`. Then press enter through all the promps
3. Run `cd` then `cd .ssh`
4. Run `cat id_rsa.pub` and copy the output
5. Go to https://github.com/settings/keys
6. Click `New SSH Key`
7. Title it with something that you can identify as your machine
8. Paste the public key in the Key field
9. Click `Add SSH Key`

## Clone Repo
First, download git from https://git-scm.com/downloads. After the install, reopen your terminal or powershell and confirm it works be running `git --version`.

Run `git clone git@github.com:Zhongy1/AreaMonitor.git` inside the directory that you want to store the project. Desktop or Documents are reasonable choices. After running the command, it may prompt you, so just type "yes" and hit enter.

Example to navigate to your Desktop directory:
- Run `cd` to jump to your home directory
- Run `cd Desktop` to navigate to your Desktop

## Branches
Everyone will work in their respective exp branches. This will be the way work gets officially saved: 
```
master <-- develop <--> dev/* <-- exp/*
```
The way to get the latest changes:
```
develop --> exp/*
```
```
master
develop - development branch for saving progress
dev/zhong - dev branches for prepping for merge into develop
dev/kalvin
dev/jun
dev/tim
exp/zhong - experimental branches where you do your work
exp/kalvin
exp/jun
exp/tim
```

## Pushing/Pulling Changes
*Important*: Make sure you are only pushing to your branches. If your commands are `git push origin master` or `git push origin develop`, hit ctrl-c to cancel. Because this is a free private project, I can't set permissions to prevent you from accidently overwriting those branches.

Example of pulling new changes from the develop branch to your exp/* branch (best done when your branch is clean/no new modifications):
```
# While on your exp/* branch
git fetch
git pull origin develop
```
Example of saving and pushing your modifications from the exp/* branch to your dev/*
```
# While on your exp/* branch and in the root directory
git add .
git status
# ensure all files highlighted green
git commit -m "<message describing changes>"
git push origin exp/<name>
git checkout dev/<name>
# With the next two commands, it's possible to see your terminal change
# When that happens, type ":q" without the quotes and hit enter
git pull origin exp/*
# If you see merge conflicts arise here, stop and let me know
git pull origin develop
# If you see merge conflicts arise here, stop and let me know
git push origin dev/<name>
# The changes are now in dev/<name> and have no merge conflicts
# Create a pull request on Github
```
Pay attention to the messages that appear. If you see any signs that there's a merge conflict, let me know. These things need to be handled in a case by case basis.


## File/Folder Structure
Important folders/files and descriptions:
```
cad - inventor files 

env - files for setting up the environment of the Pi
  \- nginx.conf          - nginx configuration file

exports - stl/step files for convenient printing

software - the programs to be run on the Pi
  |- services            - Subsystems
  |    |- node-logic.ts  - Node Logic Subsystem
  |    |- pt-ctrl.py     - Pan/tilt Control Subsystem 
  |    |- vid-capt.py    - Video Capture Subsystem
  |    |- vid-proc.py    - Video Processing Subsystem
  |    |- vid-retr.ts    - Video Retrieval Subsystem
  |    \- web-server.ts  - Web Server Subsystem
  |- config.json         - shared configuration for all subsystems
  \- main.ts             - entry program for starting the subsystems
```

