Digiquidus Explorer - 1.6.1
================

An open source block explorer written in node.js.

### See this fork in action

*  [DigitalNote XDN](https://xdn-explorer.com/)

*note: If you would like your instance mentioned here contact me*

### Updated Prereqs for this fork
* **LetsEncrypt** (if you choose https)
* **[ipstack.com](ipstack.com) - sign up for a free account and get API Key**

### **LetsEncrypt**
Only perform this step if you have a domain name linked and wish to use https (and this is reflected in yout settings file)
```
sudo apt-get -y install aptitude    
sudo aptitude -y install letsencrypt
sudo letsencrypt certonly --standalone --email email@example.com --agree-tos -d example.com -d www.example.com
   ``` 
   **PLEASE NOTE: Requirements for Certificate Auto-Renewal**
   1. Create Acme Challenge folders to serve AFTER you have finished the Explorer installation
   ```
   cd explorer/public
   sudo mkdir -p .well-known/acme-challenge
   sudo chmod 755 .well-known
   sudo chmod 755 .well-known/acme-challenge
   ```
   2. Update your ```/etc/letsencrypt/renewal/<domain>.conf ``` file with the following lines (replace ```"<user>"``` with your username):
   ```
   authenticator = webroot
   webroot_path = /<user>/explorer/public
   ``` 

### Explorer Build

Also check out [Beginners Guide for Iquidus Explorer Setup](https://gist.github.com/samqju/b9fc6c007f083e6429387051e24da1c3)

### Requires

    *  node.js >= 0.10.28
    *  mongodb 2.6.x
    *  *coind

### Install MongoDB
https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/

    sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 0C49F3730359A14518585931BC711F9BA15703C6
    echo "deb [ arch=amd64,arm64 ] http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.4.list
    sudo apt-get update
    sudo apt-get install -y mongodb-org
    sudo service mongod start

cd /var/log/mongodb
tail mongod.log
[initandlisten] waiting for connections on port <port>
Port 27017 by default

### Install Node.js

    sudo apt-get update
    sudo apt-get install nodejs nodejs-legacy -y
    sudo apt-get install npm

### Create database

Enter MongoDB cli:

    $ mongo

Create databse:

    > use explorerdb

Create user with read/write access:

    > db.createUser( { user: "digiquidus", pwd: "3xp!0reR", roles: [ "readWrite" ] } )

note: If you're using mongo shell 2.4.x, use the following to create your user:

    > db.addUser( { user: "username", pwd: "password", roles: [ "readWrite"] })

### Get the source

    git clone https://github.com/CryptoCoderz/digiquidus explorer
    sudo apt-get install libkrb5-dev

### Install node modules

    cd explorer && npm install --production
 
(If using root add:)
    
    --unsafe-perm=true --allow-root

### Configure

    cp ./settings.json.template ./settings.json

*Make required changes in settings.json*

### Start Explorer

    npm start

*note: mongod must be running to start the explorer*

As of version 1.4.0 the explorer defaults to cluster mode, forking an instance of its process to each cpu core. This results in increased performance and stability. Load balancing gets automatically taken care of and any instances that for some reason die, will be restarted automatically. For testing/development (or if you just wish to) a single instance can be launched with

    node --stack-size=10000 bin/instance

To stop the cluster you can use

    npm stop

### Syncing databases with the blockchain

sync.js (located in scripts/) is used for updating the local databases. This script must be called from the explorers root directory.

    Usage: node scripts/sync.js [database] [mode]

    database: (required)
    index [mode] Main index: coin info/stats, transactions & addresses
    market       Market data: summaries, orderbooks, trade history & chartdata

    mode: (required for index database only)
    update       Updates index from last sync to current block
    check        checks index for (and adds) any missing transactions/addresses
    reindex      Clears index then resyncs from genesis to current block

    notes:
    * 'current block' is the latest created block when script is executed.
    * The market database only supports (& defaults to) reindex mode.
    * If check mode finds missing data(ignoring new data since last sync),
      index_timeout in settings.json is set too low.


*It is recommended to have this script launched via a cronjob at 1+ min intervals.*

**crontab**

*Example crontab; update index every minute and market data every 2 minutes*

    */1 * * * * cd /path/to/explorer && /usr/bin/nodejs scripts/sync.js index update > /dev/null 2>&1
    */2 * * * * cd /path/to/explorer && /usr/bin/nodejs scripts/sync.js market > /dev/null 2>&1
    */5 * * * * cd /path/to/explorer && /usr/bin/nodejs scripts/peers.js > /dev/null 2>&1

### Wallet

Digiquidus Explorer is intended to be generic so it can be used with any wallet following the usual standards. The wallet must be running with atleast the following flags

    -daemon -txindex

### Donate

    BTC: 168hdKA3fkccPtkxnX8hBrsxNubvk4udJi
    XDN: JZp9893FMmrm1681bDuJBU7c6w11kyEY7D

### Known Issues

**script is already running.**

If you receive this message when launching the sync script either a) a sync is currently in progress, or b) a previous sync was killed before it completed. If you are certian a sync is not in progress remove the index.pid from the tmp folder in the explorer root directory.

    rm tmp/index.pid
    
I use script (launched by crontab):

```#!/bin/bash
   fname="/root/explorer/tmp/index.pid"
   echo "checking" `date` >> /root/explorer/tmp/scriptran.log 
   if [[ -f "$fname" ]];
   then
        pid=$(</root/explorer/tmp/index.pid)
        echo $pid
        if [ killall -0 $pid ]; then
                echo "script running"  `date` >> /root/explorer/tmp/script.log 
                exit 1	
        else
                rm $fname
		echo "removed" `date` >> /root/explorer/tmp/script.log 
        fi
   fi
   ```

**exceeding stack size**

    RangeError: Maximum call stack size exceeded

Nodes default stack size may be too small to index addresses with many tx's. If you experience the above error while running sync.js the stack size needs to be increased.

To determine the default setting run

    node --v8-options | grep -B0 -A1 stack_size

To run sync.js with a larger stack size launch with

    node --stack-size=[SIZE] scripts/sync.js index update

Where [SIZE] is an integer higher than the default.

*note: SIZE will depend on which blockchain you are using, you may need to play around a bit to find an optimal setting*

### License

Copyright (c) 2015, Digiquidus Technology  
Copyright (c) 2015, Luke Williams  
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of Digiquidus Technology nor the names of its
  contributors may be used to endorse or promote products derived from
  this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
