# Will describe later!!!




# NOTE
1. fs.readFile(): The program ass for the file to be read, then moves on to other taks,. When the file is ready, the program will "come back" to it through a function called a "callback."
2. The different ways of deleting a file:
    - fs.unlink(): its an asynchronous method. It removes a file from the file system. Its non-blocking.
    - fs.unlinkSync(): its a synchronous method. Removes a file but its blocking.
3. fs.readdir(): provides a way to interact with the file system. Specifically, it is used to read the contents of a directory and get a list of filenames within that directory.
4. Meaning of the Brackets in Nodejs docs: such as path[, options] is a conventiiion used to indicate optional parameters. If a parameter is listed without brackets, it means that the parameter is required. For example, in fs.readdir(path), path is a required parameter that you must provide. If a parameter is enclosed in brackets, it means that this parameter is optional. In fs.readdir(path[, options]), the options parameter is optional.

# Questions
