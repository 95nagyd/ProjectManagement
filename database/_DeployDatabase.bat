@echo off
echo Deploying MongoDB database...
if not exist %cd%\\appDB\\data\ mkdir %cd%\\appDB\\data
start mongod --dbpath %cd%\\appDB\\data
call InitDatabase.bat
call DatabaseCMD.bat
pause