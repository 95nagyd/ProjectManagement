@echo off
echo Deploying MongoDB database...
mongod --dbpath %cd%\\appDB\\data
