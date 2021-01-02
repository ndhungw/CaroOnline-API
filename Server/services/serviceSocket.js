const { isValidObjectId } = require("mongoose");

const serviceSocket = {};

serviceSocket.HandleConnection = (client) => {
    console.log("a new client");

    //Subcribe to rooms representing pages the user is in
    client.on('page-status', (page)=>{
        client.join(page);
    });

    client.on("disconnect", () => console.log("client disconnect"));
}

module.exports = serviceSocket; 