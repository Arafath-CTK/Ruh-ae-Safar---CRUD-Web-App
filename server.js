const http = require("http");
const fs = require("fs");
const url = require("url");

const server = http.createServer((req, res) => {
  let route = req.url;
  let method = req.method;

  if (route === "/" || route.toLocaleLowerCase() === "/home") {
    fs.readFile("index.html", (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/html" });
        res.end("Error loading the file");
      } else {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.write(data);
        res.end();
      }
    });
  } else if (route.toLocaleLowerCase() === "/submit" && method === "POST") {
    // we are using this '/submit'route only for the submission of data into the json file. it happens in background.
    let body = ""; //Creating an empty string for storing the incoming value from the client side.
    // in our case, which is already stored in a property called 'body'.
    // the name has no connection with that, taking the same name for easy understandability.

    // req.on is a part of http module, it is used to set up event listeners for specific events
    // like 'data' , 'error' , 'end' , etc.
    req.on("data", (chunk) => {
      // here the incoming value is a data, so we are setting up event listener for data,
      // And data is coming as it split into smaller pieces called chunks.

      body = body + chunk; //the incoming chunks are assigned to the empty string.
    });

    // 'end' event listener is the counter part for the 'data' event. its specifying that,
    // All data is came, and we can proceed to do further operations with the data that has been came.
    req.on("end", () => {
      // We have to do basic error handling, so just wrap the code in 'try' block and later we can add the 'catch' method.
      try {
        // after fully recieving the data, firstly we have to convert the JSON string back into JS object.
        // (it was converted to JSON string while we were passing the data)
        const recievedData = JSON.parse(body); //We use this parse method for that.

        // Now we have to add this object to the main database JSON file. for that,
        // We have to read the main JSON database file and put the existing data in the JSON database into an array,
        // And push the newly recieved data into the same array,
        // Then we write this array into the main JSON database file again.

        fs.readFile("data.json", "utf-8", (err, existingData) => {
          if (err) {
            console.error("Error processing data", err);
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Unexpected error occured while processing data");
          } else {
            let existingDataArray = []; // dummy array created
            existingDataArray = JSON.parse(existingData); //The existing from the database added to the dummy array.
            const newId = existingDataArray.length + 1;
            recievedData.id = newId; // the id property being increased for every user.
            existingDataArray.push(recievedData); // pushed the recieved data to the dummy array.

            // now the dummy array contains all the datas.
            // so we can proceed with writing this to the main database.

            fs.writeFile(
              "data.json",
              JSON.stringify(existingDataArray, null, 2),
              (err) => {
                if (err) {
                  console.error("Error processing data", err);
                  res.writeHead(500, { "Content-Type": "text/plain" });
                  res.end(
                    "Unexpected error occured while updating the database"
                  );
                } else {
                  console.log("Data updated to the database");
                  res.writeHead(200, { "Content-Type": "text/plain" });
                  res.end("Data updated to the database successfully");
                }
              }
            );
          }
        });
      } catch (error) {
        console.error("Error processing data", error);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Unexpected error occured while processing data");
      }
    });
  } else if (
    method === "GET" &&
    route.toLocaleLowerCase() === "/bookingstable"
  ) {
    fs.readFile("table.html", "utf-8", (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/html" });
        res.end("Error loading the table data");
      } else {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.write(data);
        res.end();
      }
    });
  } else if (method === "GET" && route.toLocaleLowerCase() === "/getdata") {
    fs.readFile("data.json", "utf-8", (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/html" });
        res.end("Error loading the data");
      } else {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(data);
      }
    });
  } else if (
    method === "PUT" &&
    route.toLocaleLowerCase().startsWith === `/modifyuser`
  ) {
    const parsedUrl = url.parse(route, true); //parsed url and by specifying "true", it will return an object. easy for further operations.
    const userId = parseInt(parsedUrl.pathname.split("/").pop());

    let body = "";
    req.on("data", (chunk) => {
      body = body + chunk;
    });

    req.on("end", () => {
      try {
        const updatedData = JSON.parse(body);

        fs.readFile("data.json", "utf-8", (err, existingData) => {
          if (err) {
            console.error("Error processing data", err);
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Unexpected error occured while processing data");
          } else {
            let existingDatas = JSON.parse(existingData);

            for (let i = 0; i < existingDatas.length; i++) {
              if (existingDatas[i].id === userId) {
                existingDatas[i] = updatedData;
                break;
              }
            }

            fs.writeFile(
              "data.json",
              JSON.stringify(existingDatas, null, 2),
              (err) => {
                if (err) {
                  console.error("Error processing data", err);
                  res.writeHead(500, { "Content-Type": "text/plain" });
                  res.end(
                    "Unexpected error occured while updating the database"
                  );
                } else {
                  console.log("Data updated to the database");
                  res.writeHead(200, { "Content-Type": "text/plain" });
                  res.end("Data updated to the database successfully");
                }
              }
            );
          }
        });
      } catch (error) {
        console.error("Error processing data", error);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Unexpected error occured while processing data");
      }
    });
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Server not found");
  }
});

const PORT = process.env.PORT || 3000;
server.listen(3000, () => console.log(`Server running on ${PORT}`));
