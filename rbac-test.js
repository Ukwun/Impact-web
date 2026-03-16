// Simple RBAC Test
const { getPermissionsByRole, hasPermission } = require('../src/lib/rbac.ts');

console.log('🧪 Testing RBAC System...\n');

// Test permissions for different roles
const roles = ['STUDENT', 'PARENT', 'FACILITATOR', 'ADMIN'];

roles.forEach(role => {
  const permissions = getPermissionsByRole(role);
  console.log('📋 ' + role + ' permissions: ' + permissions.length + ' total');
  console.log('   Sample: ' + permissions.slice(0, 3).join(', ') + (permissions.length > 3 ? '...' : '') + '\n');
});

// Test permission checking
console.log('🔐 Testing Permission Checks:');
console.log('Student can view courses:', hasPermission(['lms.view_courses'], 'lms.view_courses'));
console.log('Student can approve users:', hasPermission(['lms.view_courses'], 'auth.approve_users_all'));
console.log('Admin has all access:', hasPermission(['all.access'], 'lms.view_courses'));
console.log('Parent can view children:', hasPermission(['profile.view_children'], 'profile.view_children'));

console.log('\n✅ RBAC System Test Complete!');