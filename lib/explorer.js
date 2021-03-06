var request = require('request')
  , settings = require('./settings')
  , Address = require('../models/address');

if ( settings.https_site ) {
 var base_url = 'https://' + settings.site_url + '/api/';
 var ext_url = 'https://' + settings.site_url + '/ext/';

}
else {
 var base_url = 'http://' + settings.site_url + '/api/';
 var ext_url = 'http://' + settings.site_url + '/ext/';	
}


// returns coinbase total sent as current coin supply
function coinbase_supply(cb) {
  Address.findOne({a_id: 'coinbase'}, function(err, address) {
    if (address) {
      return cb(address.sent);
    } else {
      return cb();
    }
  });
}

function get_burn1(cb) { 
    	var uri = ext_url + 'getbalance/dMsop93F7hbLSA2d666tSPjB2NXSAfXpeU';
	  request({uri: uri}, function (error, response, body) {
	    if (body.success != true) {
	      return cb('1000000006')
            } else {
              return cb(body);
            }
          });
}

function get_burn2(cb) { 
    	var uri = ext_url + 'getbalance/daigDQ7VxAFwmhh59HstA53KYD5a4q81N5';
	  request({uri: uri}, function (error, response, body) {
	    if (body.success != true) {
	      return cb('1000000006')
            } else {
              return cb(body);
            }
          });
}

function get_burn3(cb) { 
    	var uri = ext_url + 'getbalance/dVibZ11CVyiso4Kw3ZLAHp7Wn77dXuvq1d';
	  request({uri: uri}, function (error, response, body) {
	    if (body.success != true) {
	      return cb('1000000006')
            } else {
              return cb(body);
            }
          });
}

function get_getinfo(cb) {
	var uri = base_url + 'getinfo';
        request({uri: uri, json: true}, function (error, response, body) {
	return cb(body.moneysupply);
});
}
		   
module.exports = {

  convert_to_satoshi: function(amount, cb) {
    // fix to 8dp & convert to string
    var fixed = amount.toFixed(8).toString(); 
    // remove decimal (.) and return integer 
    return cb(parseInt(fixed.replace('.', '')));
  },

  get_hashrate: function(cb) {
    if (settings.index.show_hashrate == false) return cb('-');
    if (settings.nethash == 'netmhashps') {
      var uri = base_url + 'getmininginfo';
      request({uri: uri, json: true}, function (error, response, body) { //returned in mhash
        if (body.netmhashps) {
          if (settings.nethash_units == 'K') {
            return cb((body.netmhashps * 1000).toFixed(4));
          } else if (settings.nethash_units == 'G') {
            return cb((body.netmhashps / 1000).toFixed(2));
          } else if (settings.nethash_units == 'H') {
            return cb((body.netmhashps * 1000000).toFixed(4));
          } else if (settings.nethash_units == 'T') {
            return cb((body.netmhashps / 1000000).toFixed(4));
          } else if (settings.nethash_units == 'P') {
            return cb((body.netmhashps / 1000000000).toFixed(4));
          } else {
            return cb(body.netmhashps.toFixed(4));
          }
        } else {
          return cb('-');
        }
      });
    } else {
      var uri = base_url + 'getnetworkhashps';
      request({uri: uri, json: true}, function (error, response, body) {
        if (body == 'There was an error. Check your console.') {
          return cb('-');
        } else {
          if (settings.nethash_units == 'K') {
            return cb((body / 1000).toFixed(4));
          } else if (settings.nethash_units == 'M'){
            return cb((body / 1000000).toFixed(4));
          } else if (settings.nethash_units == 'G') {
            return cb((body / 1000000000).toFixed(4));
          } else if (settings.nethash_units == 'T') {
            return cb((body / 1000000000000).toFixed(4));
          } else if (settings.nethash_units == 'P') {
            return cb((body / 1000000000000000).toFixed(4));
          } else {
            return cb((body).toFixed(4));
          }
        }
      });
    }
  },


  get_difficulty: function(cb) {
    var uri = base_url + 'getinfo';
    request({uri: uri, json: true}, function (error, response, body) {
      return cb(body.difficulty);
    });
  },

  get_connectioncount: function(cb) {
    var uri = base_url + 'getconnectioncount';
    request({uri: uri, json: true}, function (error, response, body) {
      return cb(body);
    });
  },

  get_blockcount: function(cb) {
    var uri = base_url + 'getblockcount';
    request({uri: uri, json: true}, function (error, response, body) {
      return cb(body);
    });
  },
  
    get_masternodecount: function(cb) {
    var uri = base_url + 'masternodelist';
    request({uri: uri}, function (error, response, body) {
    var mncount = body.split(',').length
    return cb(mncount)
});
},
  get_mempoolcount: function(cb) {
    var uri = base_url + 'getrawmempool';
    request({uri: uri}, function (error, response, body) {
    var mpcount = body.split(',').length
    return cb(mpcount)
});
},


  get_masternodelist: function(cb) {
    var uri = base_url + 'masternodelist?mode=full';
    request({uri: uri}, function (error, response, body) {
    body = body.replace(/"/g, '');
    var array = body.split(',');
    var mns = [];
    for (var i = 0; i < array.length; i++) {
      var fullarray = array[i].split(' ')
      var mnall = fullarray.filter(function(el) { return el; });
      if (mnall[8].includes('\n')) {
         mnall[8] = mnall[8].replace(/\n}/g, '')
      }
      var mn = {
                 mn_output: mnall[1],
                 status: mnall[2],
                 protocol: mnall[3],
	         address: mnall[4],              
                 ip: mnall[5],
                 lastseen: mnall[6],
                 activeseconds: mnall[7],
	         timestamp: mnall[8]
              }
     mns.push(mn) 
    }
    return cb(mns)
});
},
  get_mempooltx: function(cb) {
    var uri = base_url + 'getrawmempool';
    request({uri: uri}, function (error, response, body) {
    body = body.replace(/"/g, '');
    body = body.replace('[', '');
    body = body.replace(']', '');
    body = body.replace(/"\n}/g, '');
    body = body.replace(/\}/g, '');
    var array = body.split(',');
    var txs = []
    for (var i = 0; i < array.length; i++) {
    var tx = {tx_id: array[i]}
    txs.push(tx)
}
    return cb(txs)
    });
  },

  get_blockhash: function(height, cb) {
    var uri = base_url + 'getblockhash?height=' + height;
    request({uri: uri, json: true}, function (error, response, body) {
      return cb(body);
    });
  },

  get_block: function(hash, cb) {
    var uri = base_url + 'getblock?hash=' + hash;
    request({uri: uri, json: true}, function (error, response, body) {
      return cb(body);
    });
  },

  get_rawtransaction: function(hash, cb) {
    var uri = base_url + 'getrawtransaction?txid=' + hash + '&decrypt=1';
    request({uri: uri, json: true}, function (error, response, body) {
      return cb(body);
    });
  },

  get_maxmoney: function(cb) {
    var uri = base_url + 'getmaxmoney';
    request({uri: uri, json: true}, function (error, response, body) {
      return cb(body);
    });
  },

  get_maxvote: function(cb) {
    var uri = base_url + 'getmaxvote';
    request({uri: uri, json: true}, function (error, response, body) {
      return cb(body);
    });
  },

  get_vote: function(cb) {
    var uri = base_url + 'getvote';
    request({uri: uri, json: true}, function (error, response, body) {
      return cb(body);
    });
  },

  get_phase: function(cb) {
    var uri = base_url + 'getphase';
    request({uri: uri, json: true}, function (error, response, body) {
      return cb(body);
    });
  },

  get_reward: function(cb) {
    var uri = base_url + 'getreward';
    request({uri: uri, json: true}, function (error, response, body) {
      return cb(body);
    });
  },

  get_estnext: function(cb) {
    var uri = base_url + 'getnextrewardestimate';
    request({uri: uri, json: true}, function (error, response, body) {
      return cb(body);
    });
  },

  get_nextin: function(cb) {
    var uri = base_url + 'getnextrewardwhenstr';
    request({uri: uri, json: true}, function (error, response, body) {
      return cb(body);
    });
  },
  
  // synchonous loop used to interate through an array, 
  // avoid use unless absolutely neccessary
  syncLoop: function(iterations, process, exit){
    var index = 0,
        done = false,
        shouldExit = false;
    var loop = {
      next:function(){
          if(done){
              if(shouldExit && exit){
                  exit(); // Exit if we're done
              }
              return; // Stop the loop if we're done
          }
          // If we're not finished
          if(index < iterations){
              index++; // Increment our index
              if (index % 100 === 0) { //clear stack
                setTimeout(function() {
                  process(loop); // Run our process, pass in the loop
                }, 1);
              } else {
                 process(loop); // Run our process, pass in the loop
              }
          // Otherwise we're done
          } else {
              done = true; // Make sure we say we're done
              if(exit) exit(); // Call the callback on exit
          }
      },
      iteration:function(){
          return index - 1; // Return the loop number we're on
      },
      break:function(end){
          done = true; // End the loop
          shouldExit = end; // Passing end as true means we still call the exit callback
      }
    };
    loop.next();
    return loop;
  },

  balance_supply: function(cb) {
    Address.find({}, 'balance').where('balance').gt(0).exec(function(err, docs) { 
      var count = 0;
      module.exports.syncLoop(docs.length, function (loop) {
        var i = loop.iteration();
        count = count + docs[i].balance;
        loop.next();
      }, function(){
        return cb(count);
      });
    });
  },

  get_supply: function(cb) {
    if ( settings.supply == 'HEAVY' ) {
      var uri = base_url + 'getsupply';
      request({uri: uri, json: true}, function (error, response, body) {
        return cb(body);
      });
    } else if (settings.supply == 'GETINFO') {
       var body1;
       var body2;
       var body3;
       var totalburn;
       get_burn1(function(body1) {
         console.log ('BURN1 ' + body1);
    	 get_burn2(function(body2) {
	   console.log ('BURN2 ' + body2);
	   get_burn3(function(body3) {
	     console.log ('BURN3 ' + body3);
	     get_getinfo(function(supply) {
	       totalburn = parseFloat(body1) + parseFloat(body2) + parseFloat(body3);
               return cb(supply - totalburn);
             });
           });
         });
       });


    } else if (settings.supply == 'BALANCES') {
      module.exports.balance_supply(function(supply) {
        return cb(supply/100000000);
      });
    } else if (settings.supply == 'TXOUTSET') {
      var uri = base_url + 'gettxoutsetinfo';
      request({uri: uri, json: true}, function (error, response, body) {
        return cb(body.total_amount);
      });
    } else {
      coinbase_supply(function(supply) {
        return cb(supply/100000000);
      });
    }
  },

  is_unique: function(array, object, cb) {
    var unique = true;
    var index = null;
    module.exports.syncLoop(array.length, function (loop) {
      var i = loop.iteration();
      if (array[i].addresses == object) {
        unique = false;
        index = i;
        loop.break(true);
        loop.next();
      } else {
        loop.next();
      }
    }, function(){
      return cb(unique, index);
    });
  },

  calculate_total: function(vout, cb) {
    var total = 0;
    module.exports.syncLoop(vout.length, function (loop) {
      var i = loop.iteration();
      //module.exports.convert_to_satoshi(parseFloat(vout[i].amount), function(amount_sat){
        total = total + vout[i].amount;
        loop.next();
      //});
    }, function(){
      return cb(total);
    });
  },

  prepare_vout: function(vout, txid, vin, cb) {
    var arr_vout = [];
    var arr_vin = [];
    arr_vin = vin;
    module.exports.syncLoop(vout.length, function (loop) {
      var i = loop.iteration();
      // make sure vout has an address
      if (vout[i].scriptPubKey.type != 'nonstandard' && vout[i].scriptPubKey.type != 'nulldata') { 
        // check if vout address is unique, if so add it array, if not add its amount to existing index
        //console.log('vout:' + i + ':' + txid);
        module.exports.is_unique(arr_vout, vout[i].scriptPubKey.addresses[0], function(unique, index) {
          if (unique == true) {
            // unique vout
            module.exports.convert_to_satoshi(parseFloat(vout[i].value), function(amount_sat){
              arr_vout.push({addresses: vout[i].scriptPubKey.addresses[0], amount: amount_sat});
              loop.next();
            });
          } else {
            // already exists
            module.exports.convert_to_satoshi(parseFloat(vout[i].value), function(amount_sat){
              arr_vout[index].amount = arr_vout[index].amount + amount_sat;
              loop.next();
            });
          }
        });
      } else {
        // no address, move to next vout
        loop.next();
      }
    }, function(){
      if (vout[0].scriptPubKey.type == 'nonstandard') {
        if ( arr_vin.length > 0 && arr_vout.length > 0 ) {
          if (arr_vin[0].addresses == arr_vout[0].addresses) {
            //PoS
            arr_vout[0].amount = arr_vout[0].amount - arr_vin[0].amount;
            arr_vin.shift();
            return cb(arr_vout, arr_vin);
          } else {
            return cb(arr_vout, arr_vin);
          }
        } else {
          return cb(arr_vout, arr_vin);
        }
      } else {
        return cb(arr_vout, arr_vin);
      }
    });
  },

  get_input_addresses: function(input, vout, cb) {
    var addresses = [];
    if (input.coinbase) {
      var amount = 0;
      module.exports.syncLoop(vout.length, function (loop) {
        var i = loop.iteration();
          amount = amount + parseFloat(vout[i].value);  
          loop.next();
      }, function(){
        addresses.push({hash: 'coinbase', amount: amount});
        return cb(addresses);
      });
    } else {
      module.exports.get_rawtransaction(input.txid, function(tx){
        if (tx) {
          module.exports.syncLoop(tx.vout.length, function (loop) {
            var i = loop.iteration();
            if (tx.vout[i].n == input.vout) {
              //module.exports.convert_to_satoshi(parseFloat(tx.vout[i].value), function(amount_sat){
              if (tx.vout[i].scriptPubKey.addresses) {
                addresses.push({hash: tx.vout[i].scriptPubKey.addresses[0], amount:tx.vout[i].value});  
              }
                loop.break(true);
                loop.next();
              //});
            } else {
              loop.next();
            } 
          }, function(){
            return cb(addresses);
          });
        } else {
          return cb();
        }
      });
    }
  },

  prepare_vin: function(tx, cb) {
    var arr_vin = [];
    module.exports.syncLoop(tx.vin.length, function (loop) {
      var i = loop.iteration();
      module.exports.get_input_addresses(tx.vin[i], tx.vout, function(addresses){
        if (addresses && addresses.length) {
          //console.log('vin');
          module.exports.is_unique(arr_vin, addresses[0].hash, function(unique, index) {
            if (unique == true) {
              module.exports.convert_to_satoshi(parseFloat(addresses[0].amount), function(amount_sat){
                arr_vin.push({addresses:addresses[0].hash, amount:amount_sat});
                loop.next();
              });
            } else {
              module.exports.convert_to_satoshi(parseFloat(addresses[0].amount), function(amount_sat){
                arr_vin[index].amount = arr_vin[index].amount + amount_sat;
                loop.next();
              });
            }
          });
        } else {
          loop.next();
        }
      });
    }, function(){
      return cb(arr_vin);
    });
  }
};
