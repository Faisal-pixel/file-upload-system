
import * as http from 'http';
import * as url from 'url';
import * as path from 'path';
import * as fs from 'fs';
import { generateUniqueFilename } from './utils.js';
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

    const __filename = url.fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    

    // Now lets write the routing logic.
    // - if the pathname is upload, it is a post request
    // - we also have to store the metadata of the file in a json file in the path /files/:filename/metadata.json

    // if the pathname starts with /files/, it is a get method

    // if the pathname is /files/:filename/metadata, it is a get method. 

    //if the pathname is /files/:filename/dekete, it is a delete method.

    // if the pathname is /files, it is a get method

    // if the file does not exist, return 404

    // const boundary = "--boundary"// I will extract the boundary from the content-type header
    if(pathname === '/upload' && method === 'POST') {
        // Handle file upload here

        // let body = '';
        const chunks = [];
        // The data event is triggered every single time a data is received. Since nodejs actually receive data in chunks, basically
        // streams, it makes it faster and bit by bit of the data is received instead of waiting for the whole data to be received.
        // That is why we append the data to the body variable.
        req.on('data', (chunk) => {
            // body += chunk.toString();
            chunks.push(chunk); // So I realised my files were curropted, so I am trying to avoid converting it to a string. 
            // Implement file upload here
        });

        // The end event is triggered when the data is completely received. It doesnt run untill all data is received.
        req.on('end', () => {
            // Parsing the body to extract the file data. We are basically splitting it by the boundary since that is multipart/form-data
            // format. The boundary is the string that separates the different parts of the form data.
            // Concatenating the chunks together to form the body. To form a single Buffer.
            const fileBuffer = Buffer.concat(chunks);
            const body = fileBuffer.toString();
            const contentType = req.headers['content-type'];
            const boundary = contentType.split('; ')[1].replace('boundary=', '');
            const parts = body.split(`--${boundary}`)
            // console.log(parts);
            parts.forEach(part => {
                if(part.includes('Content-Disposition')) {
                    // Here I will seperate the headers from the content
                    const [header, content] = part.split('\r\n\r\n');
                    //So because the current part header we are checking could be just a form field and not neccessarily a file, we
                    // have to check if filename is present in the header. If it is, then it is a file.
                    if(header.includes('filename')) {
                        // THis is a regex to extract the filename from the header. It looks for the exact string filename=", then when it sees it,
                        // (.+?) is a capturing group that matches one or more characters. The ? makes it non-greedy. So it will
                        // match the first, ensuring that it stops at the first closing quote.
                        const fileNameMatch = header.match(/filename="(.+?)"/);
                        // So we get back an array which is the fileNameMatch variable. The first element of the array is the whole match, the second
                        // element is the first capturing group. So we are interested in the first capturing group which is the filename.
                        const fileName = fileNameMatch ? fileNameMatch[1] : 'unknown';
                        const uniqueName = generateUniqueFilename(fileName);

                        // We need to trim the content because it has a trailing \r\n-- at the end. We also need to remove the trailing --.
                        const fileContent = content.trim().replace(/\r\n--$/, '');

                        const filePath = path.join(__dirname, 'files', uniqueName)

                        
                            const writeStream = fs.createWriteStream(filePath);

                            // Listen for errors on the write stream
                            writeStream.on('error', (error) => {
                                console.error('Error while saving file:', error);
                                return res.end('Error saving file.');
                            });
                            // console.log("fileBuffer", fileBuffer.toString().split(`--${boundary}`)[1].split('\r\n')[4]);
                            writeStream.write(fileContent, (error) => {
                                if (error) {
                                    console.error('Error while saving file:', error);
                                    return res.end('Error saving file.');
                                }
                                const metadata = {
                                    originalName: fileName,
                                    uniqueName,
                                    mimeType: contentType,
                                    size: fileContent.length,
                                    filePath: filePath,
                                    uploadedAt: new Date().toISOString(),
                                   }
        
                                   fs.readFile(path.join(__dirname, 'metadata.json'), 'utf8', (err, data) => {
                                         if(err) {
                                              fs.writeFile(path.join(__dirname, 'metadata.json'), JSON.stringify([metadata]), (err) => {
                                                if(err) {
                                                     console.log(err);
                                                }
                                              })
                                         } else {
                                              const metadataArray = JSON.parse(data);
                                              metadataArray.push(metadata);
                                              fs.writeFile(path.join(__dirname, 'metadata.json'), JSON.stringify(metadataArray), (err) => {
                                                if(err) {
                                                     console.log(err);
                                                }
                                              })
                                         }
                                   });
                            });
                           // End the stream and ensure it finishes writing
                           
                            writeStream.end(() => {
                                console.log('File saved successfully to', filePath);
                                res.end('File uploaded successfully!');
                            });
                        
                    }
                    
                }
            })
        })

    } else if (pathname.startsWith("/files") && pathname.endsWith("/metadata") && method === 'GET') {
        //Handle metadata retrieval
        console.log("Retrieving metadata");
        const filename = pathname.replace('/files/', '').replace('/metadata', '');
        const metadataPath = path.join(__dirname, 'metadata.json');
        fs.readFile(metadataPath, (err, data) => {
            if (err) {
                res.statusCode = 404;
                return res.end('404 - Error reading metadata');
            }
            const metadataArray = JSON.parse(data);
            const fileMetadata = metadataArray.find((metadata) => metadata.originalName === filename);

            if(!fileMetadata) {
                res.statusCode = 404;
                return res.end('404 - File Not Found');
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(fileMetadata));
        });	

    }
    
    else if (pathname.startsWith('/files/') && method === 'GET') {
        // Handle file retrieval here
        console.log("Retrieving file");
        const filename = pathname.replace('/files/', '');
        let filePath = '';
        fs.promises.readFile("metadata.json", 'utf8').then((metadata) => {
            const metadataArray = JSON.parse(metadata);
            metadataArray.find((metadata) => {
                if(metadata.uniqueName.includes(filename)) {
                    filePath = metadata.filePath;
                }
            });
            return fs.promises.readFile(filePath)
        }).then(fileData => {
            try {
                res.statusCode = 200;
                res.statusMessage = 'OK';
                res.end(fileData);
            } catch (err) {
                return res.end("Error while reading file", err)
            }
        })
    } else if (pathname === '/files' && method === 'GET') {
        //List files
        fs.readdir(path.join(__dirname, 'files'), (err, files) => {
            if(err) {
                res.statusCode = 404;
                return res.end("Error reading files directory");
            }

            let filesObj = {};
            let filesProcessed = 0;

            files.forEach((file) => {
                fs.readFile("metadata.json", 'utf8', (err, data) => {
                    if(err) {
                        res.statusCode = 404;
                        return res.end("Error reading metadata file");
                    }
                    const metadataArray = JSON.parse(data);
                    metadataArray.forEach((metadata, _) => {
                        if(file.includes(metadata.uniqueName)) {
                            filesObj[file] = metadata;
                        }
                    });

                    filesProcessed++;
                    if (filesProcessed === files.length) {
                        // All files have been processed
                        console.log(filesObj);
                        res.write(JSON.stringify(filesObj));
                        res.end("Files listed successfully");
                    }
                });     
            });
        });
    }  else if (pathname.startsWith("/files") && method === 'DELETE') {
        //Handle file deletion
        const filename = pathname.replace('/files/', '').replace('/delete', '');
        let pathToDelete = '';

        // We will need to get the path since we dont whether the filename passed by the user is going to have the extension.
        // For this reason, we will have to loop through the metadata array to get the path of the file to delete.

        fs.readFile("metadata.json", 'utf8', (err, data) => {
            if(err) {
                res.statusCode = 404;
                return res.end("Error reading metadata file");
            }

            const metadataArray = JSON.parse(data);
            metadataArray.forEach((metadata) => {
                if(metadata.uniqueName.includes(filename)) {
                    pathToDelete = metadata.filePath;
                }
            });

            // Loop through the metadata
            // Look for the member that has the uniqeuName match the filename and filter it out, then set it back in the metadata.json file.
            const updatedMetadata = metadataArray.filter((metadata) => !metadata.uniqueName.includes(filename));
            fs.writeFile("metadata.json", JSON.stringify(updatedMetadata), (err) => {
                if(err) {
                    res.statusCode = 500;
                    return res.end("Error deleting file", err);
                }
            });
            // Then delete the file from the file system.

            fs.unlink(pathToDelete, (err) => {
                if(err) {
                    res.statusCode = 404;
                    return res.end("Error deleting file unlink", err);
                }
                res.statusCode = 200;
                res.end("File deleted successfully");
            });

        });
    }
    
    else {
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