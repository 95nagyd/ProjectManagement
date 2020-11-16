@echo off
echo Deploying MongoDB database...
start mongod --dbpath %cd%\\appDB\\data
call InitDatabase.bat
call DatabaseCMD.bat
pause