var thrift = require('thrift');
var HBase = require('./gen-nodejs/THBaseService');
var HBaseTypes = require('./gen-nodejs/hbase_types');

var connection = thrift.createConnection('localhost', 9090);

connection.on('connect', function () {
  console.log('connected');
  var client = thrift.createClient(HBase, connection);

  // Please run the command in shell first: put 'users', 'wwzyhao', 'info:gender', 'male'
  var tDelete = new HBaseTypes.TDelete({row: 'TheRealMT',
   columns: [new HBaseTypes.TColumn({family: 'info', qualifier: 'hobbies'})]});
  client.deleteSingle('users', tDelete, function (err) {
    if (err) {
      console.log(err);
      return;
    } else {
      console.log('delete success');
    }
    connection.end();
  });
});

connection.on('error', function(err){
  console.log('error', err);
});