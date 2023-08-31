const path = require('path');
const express = require('express');
const app = express();
const apiRouter = require('./api');
const PORT = 4000;

// Handle parsing request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle requests for static files
app.use(express.static(path.resolve(__dirname, '../assets'))); // TODO: should this be client?

// Define route handlers
app.use('/api', apiRouter);

// Catch-all route handler for any requests to an unknown route
app.use((req, res) => res.status(404).send("This is not the page you're looking for..."));

// Express error handler
app.use((err, req, res, next) => {
    const defaultErr = {
        log: 'Express error handler caught unknown middleware error',
        status: 500,
        message: { err: 'An error occurred' }
    };
    const errorObj = Object.assign({}, defaultErr, err);
    console.log(errorObj.log);
    return res.status(errorObj.status).json(errorObj.message);
});

// Environments
if (process.env.NODE_ENV === 'production') {
    // statically serve everything in the build folder on the route '/build'
    app.use('/build', express.static(path.join(__dirname, '../build')));

    // serve the index.html on a request to the root
    // app.get('/', (req, res) => {
    //     return res.status(200).sendFile(path.join(__dirname, '../index.html'));
    // });
}
console.log('NODE_ENV: ', process.env.NODE_ENV);

// Start Server
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});

module.exports = app;
