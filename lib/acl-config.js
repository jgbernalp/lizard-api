const ACL = require('acl');

let acl = new ACL(new ACL.memoryBackend());

// Admin
acl.allow('admin', ['users'], '*');

// App
acl.allow('app', 'users', 'create');

// Default
acl.allow('default', 'users', ['read', 'update']);

module.exports = acl;