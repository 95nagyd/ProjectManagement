@echo off
echo Starting MongoDB database...
start mongod --dbpath %cd%\\appDB\\data
call DatabaseCMD.bat
pause