const http = require('http');
const url = require('url');
// STEPS
// The http.createServer() function creates the server.
// The server listens for incoming HTTP requests.
// When a request comes in, it runs the function you give it (in this case, it just sends back 'Hello, world!').


// STEP 2: To implement routing.
// Here we use the url module.
// We first need to parse the url. THen we can get the pathname from the parsedUrl.

const server = http.createServer((req, res) => {
    // This function will run whenever it receives a request
    const parsedUrl = url.parse(req.url, true); // the 'true' makes sure that the query string is parsed into an object.
    const pathname = parsedUrl.pathname;
    const method = req.method.toUpperCase();

    // Now lets write the routing logic.
    // - if the pathname is upload, it is a post request
    // - we also have to store the metadata of the file in a json file in the path /files/:filename/metadata.json

    // if the pathname starts with /files/, it is a get method

    // if the pathname is /files/:filename/metadata, it is a get method. 

    //if the pathname is /files/:filename/dekete, it is a delete method.

    // if the pathname is /files, it is a get method

    // if the file does not exist, return 404

    const boundary = "--boundary"// I will extract the boundary from the content-type header
    if(pathname === '/upload' && method === 'POST') {
        // Handle file upload here

        let body = '';
        // The data event is triggered every single time a data is received. Since nodejs actually receive data in chunks, basically
        // streams, it makes it faster and bit by bit of the data is received instead of waiting for the whole data to be received.
        // That is why we append the data to the body variable.
        req.on('data', (chunk) => {
            body += chunk.toString();
            // Implement file upload here
        });


        // The end event is triggered when the data is completely received. It doesnt run untill all data is received.
        req.on('end', () => {
            // Parsing the body to extract the file data. We are basically splitting it by the boundary since that is multipart/form-data
            // format. The boundary is the string that separates the different parts of the form data.
            const parts = body.split(boundary)
            console.log(parts);
        })

        res.end('File uploaded successfully!');

    } else if (pathname.startsWith('/files/') && method === 'GET') {
        // Handle file retrieval here
    } else if (pathname === '/files' && method === 'GET') {
        //List files
    } else {
        switch (method) {
            case 'POST':
                res.end('404 Not Found: Cannot POST ' + pathname);
                break;
            case 'GET':
                res.end('404 Not Found: Cannot GET ' + pathname);
                break;
            case 'DELETE':
                res.end('404 Not Found: Cannot DELETE ' + pathname);
                break;
            default:
                res.end('404 Not Found: ' + pathname);
        }
    }
});

// Below, we have to make the server listen for requests on port 3000

server.listen(3000, () => {
    console.log("Server is listening on port 3000");
})