const mysql = require('mysql');
const util = require('util')
require('dotenv').config();

const dbConfig = {  
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT) || 10000,
}

// If using just one connection, it can only handle one query at a time.
// If multiple requests come in at once, each must wait for the previous to finish.
// Instead, we should have a pool of connections - multithreaded - and open new connections for each query job 

let connectionPool = mysql.createPool(dbConfig);

// When we want to make a query, the pool.query() method can be used.
// This is a shortcut for the pool.getConnection() -> connection.query() -> connection.release() 
//More efficient use of db connections might do multiple queries on one connection before closing, 
// but this is not super important for small applications.

//For debugging purposes, queryCallback is a wrapper of the query function that adds custom logging.
//Levels of logging will be enabled/disabled based on the .env variables
// It is not as flexible as the original query method, using strictly the 3-arg structure:
//ARGS: 
//  sql is a query string, possibly with '?' for value args and 
//  args is an array of arguments to be escaped and inserted at each '?' or '??' in sql. If none, must be an empty [].
//  callback is a function that takes two params:
//      err: if an error occurs, this will describe the error. Otherwise, is falsy.
//      results: Array of record objects, where each property matches a column 
//  If no callback provided, the query is still made and logging occurs.
parseBoolean = (str) => (str.toLowerCase() == "true");

const LOG_QUERY = parseBoolean(process.env.LOG_QUERY)
const LOG_QUERY_ARGS = parseBoolean(process.env.LOG_QUERY_ARGS)
const LOG_QUERY_SUMMARY = parseBoolean(process.env.LOG_QUERY_SUMMARY)
const LOG_QUERY_RESULTS = parseBoolean(process.env.LOG_QUERY_RESULTS)



connectionPool.queryCallback = function (sql, args = [], callback = ((error, results, fields)=>{})) {    
    let executed_query = connectionPool.query(sql, args, (error, results, fields)=>{
        //Log query results after receiving
        if (LOG_QUERY_SUMMARY){
            if (error)
                console.log(`QUERY ERROR: ${error}`);
            else {
                if (Array.isArray(results)){
                    console.log(`QUERY SUMMARY: ${results.length} results`);
                    if (LOG_QUERY_RESULTS)
                        results.forEach((row, i) => console.log(`\t${i}| ${JSON.stringify(row)}`));
                }
                else {
                    console.log(`QUERY RESULTS:`,results);
                }
            }
        }

    if(LOG_QUERY) {
        console.log(`QUERY @${dbConfig.database}:\n'${executed_query.sql}'`);
        if (LOG_QUERY_ARGS)
            console.log(`ARGS:[${args}]`);
    }

    callback(error, results, fields);

    });
}

// In addition, here are some promise-style wrappers for query() and the logging wrappers. 
// Instead of callbacks, which can sometimes be difficult to use, these methods can be used as follows:

//  connectionPool.queryPromise(...)
//  .then(results => {/* handle results*/}
//  .catch(err => {/* handle err */})

// Or, utilize the async / await syntax, which is even easier.


// connectionPool.queryPromise = util.promisify(connectionPool.query);

connectionPool.queryPromise = util.promisify(connectionPool.queryCallback);

module.exports = connectionPool