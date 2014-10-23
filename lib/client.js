/**
 * Created by rubinus on 14-10-20.
 */
'use strict';

var Get = require('./get');
var thrift = require('thrift');
var HBase = require('../gen-nodejs/THBaseService');
var HBaseTypes = require('../gen-nodejs/hbase_types');
var _ = require('underscore');

var Client = function(options) {
    if (!options.host || !options.port) {
        callback(true,'host or port is none');
    }
    this.host = options.host || 'master';
    this.port = options.port || '9090';

    var connection = thrift.createConnection(this.host, this.port);
    this.connection = connection;
};

Client.create = function (options) {
    return new Client(options);
};

Client.prototype.getClient = function (callback) {
    var that = this;
    this.connection.on('connect', function () {
        var client = thrift.createClient(HBase, that.connection);
        callback(null,client);
    });

    this.connection.on('error', function(err){
        console.log('getClient error', err);
        callback(true,err);
    });
};

Client.prototype.Get = function(row){
    return new Get(row);
};

Client.prototype.get = function (table,param,callback) {
    var row = param.row;
    if(!row){
        callback(null,'rowKey is null');
    }
    var query = {};
    var maxVersions = param.maxVersions;
    query.row = row;
    var columns = [];
    if(param.familyList && param.familyList.length > 0){
        _.each(param.familyList,function(ele,idx){
            columns.push(new HBaseTypes.TColumn(ele));
        });
        query.columns = columns;
    }

//    console.log(query);

    var that = this;
    that.getClient(function(err,client){
        if(!err){

            var tGet = new HBaseTypes.TGet(query);
            tGet.maxVersions = maxVersions;

            client.get(table, tGet, function (err, data) {

                if (err) {
                    callback(err.message.slice(0,120));
                } else {
                    callback(null,data);
                }
                //close connection for hbase client
                that.connection.end();
            });

        }else{
            callback(null);
        }

    });
};


module.exports = Client;