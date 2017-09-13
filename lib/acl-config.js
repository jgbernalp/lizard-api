const ACL = require('acl');

let acl = new ACL(new ACL.memoryBackend());

// Public access to oauth2
acl.allow('*', 'oauth2', '*');

// Admin
acl.allow('admin', ['users', 'apps'], '*');

// App
acl.allow('apps', 'users', ['login', 'register', 'reset_password', 'recover_password']);

// Default
acl.allow('default', 'users', ['read', 'update']);

module.exports = acl;