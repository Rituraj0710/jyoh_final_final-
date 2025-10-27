import Role from '../models/Role.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';

class RoleController {
  // Create a new role
  static createRole = async (req, res) => {
    try {
      const { name, displayName, description, permissions, level } = req.body;
      const adminUser = req.user;

      // Validate required fields
      if (!name || !displayName || !description || !permissions || !level) {
        return res.status(400).json({
          status: "failed",
          message: "All fields are required"
        });
      }

      // Validate permissions
      const validPermissions = ['read', 'write', 'approve', 'lock', 'audit', 'manage_staff', 'verify_stamp', 'verify_trustee', 'verify_land', 'submit', 'assist'];
      const invalidPermissions = permissions.filter(p => !validPermissions.includes(p));
      if (invalidPermissions.length > 0) {
        return res.status(400).json({
          status: "failed",
          message: `Invalid permissions: ${invalidPermissions.join(', ')}`
        });
      }

      // Check if role name already exists
      const existingRole = await Role.findOne({ name: name.toLowerCase() });
      if (existingRole) {
        return res.status(409).json({
          status: "failed",
          message: "Role name already exists"
        });
      }

      // Create new role
      const newRole = await Role.create({
        name: name.toLowerCase(),
        displayName,
        description,
        permissions,
        level: parseInt(level),
        createdBy: adminUser._id
      });

      // Log the action
      await AuditLog.logAction({
        userId: adminUser._id,
        userRole: adminUser.role,
        action: 'role_create',
        resource: 'role',
        resourceId: newRole._id,
        details: {
          roleName: newRole.name,
          displayName: newRole.displayName,
          permissions: newRole.permissions,
          level: newRole.level
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(201).json({
        status: "success",
        message: "Role created successfully",
        role: {
          id: newRole._id,
          name: newRole.name,
          displayName: newRole.displayName,
          description: newRole.description,
          permissions: newRole.permissions,
          level: newRole.level,
          isActive: newRole.isActive
        }
      });

    } catch (error) {
      console.error('Create role error:', error);
      res.status(500).json({
        status: "failed",
        message: "Unable to create role, please try again later"
      });
    }
  };

  // Get all roles
  static getAllRoles = async (req, res) => {
    try {
      const { includeInactive = false } = req.query;
      
      let query = {};
      if (includeInactive !== 'true') {
        query.isActive = true;
      }

      const roles = await Role.find(query)
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
        .sort({ level: 1, name: 1 });

      // Get staff count for each role
      const rolesWithCount = await Promise.all(
        roles.map(async (role) => {
          const staffCount = await User.countDocuments({ 
            role: role.name, 
            isActive: true 
          });
          return {
            ...role.toObject(),
            staffCount
          };
        })
      );

      res.status(200).json({
        status: "success",
        message: "Roles retrieved successfully",
        roles: rolesWithCount
      });

    } catch (error) {
      console.error('Get roles error:', error);
      res.status(500).json({
        status: "failed",
        message: "Unable to retrieve roles, please try again later"
      });
    }
  };

  // Get role by ID
  static getRoleById = async (req, res) => {
    try {
      const { roleId } = req.params;

      const role = await Role.findById(roleId)
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email');

      if (!role) {
        return res.status(404).json({
          status: "failed",
          message: "Role not found"
        });
      }

      // Get staff count
      const staffCount = await User.countDocuments({ 
        role: role.name, 
        isActive: true 
      });

      res.status(200).json({
        status: "success",
        message: "Role details retrieved successfully",
        role: {
          ...role.toObject(),
          staffCount
        }
      });

    } catch (error) {
      console.error('Get role by ID error:', error);
      res.status(500).json({
        status: "failed",
        message: "Unable to retrieve role details, please try again later"
      });
    }
  };

  // Update role
  static updateRole = async (req, res) => {
    try {
      const { roleId } = req.params;
      const { displayName, description, permissions, level, isActive } = req.body;
      const adminUser = req.user;

      const role = await Role.findById(roleId);
      if (!role) {
        return res.status(404).json({
          status: "failed",
          message: "Role not found"
        });
      }

      // Check if role is system role
      if (role.isSystemRole) {
        return res.status(403).json({
          status: "failed",
          message: "Cannot modify system roles"
        });
      }

      // Validate permissions if provided
      if (permissions) {
        const validPermissions = ['read', 'write', 'approve', 'lock', 'audit', 'manage_staff', 'verify_stamp', 'verify_trustee', 'verify_land', 'submit', 'assist'];
        const invalidPermissions = permissions.filter(p => !validPermissions.includes(p));
        if (invalidPermissions.length > 0) {
          return res.status(400).json({
            status: "failed",
            message: `Invalid permissions: ${invalidPermissions.join(', ')}`
          });
        }
      }

      // Update role
      const updateData = {};
      if (displayName) updateData.displayName = displayName;
      if (description) updateData.description = description;
      if (permissions) updateData.permissions = permissions;
      if (level) updateData.level = parseInt(level);
      if (typeof isActive === 'boolean') updateData.isActive = isActive;
      updateData.updatedBy = adminUser._id;

      const updatedRole = await Role.findByIdAndUpdate(
        roleId,
        updateData,
        { new: true, runValidators: true }
      );

      // Log the action
      await AuditLog.logAction({
        userId: adminUser._id,
        userRole: adminUser.role,
        action: 'role_update',
        resource: 'role',
        resourceId: roleId,
        details: {
          updatedFields: Object.keys(updateData),
          roleName: updatedRole.name,
          displayName: updatedRole.displayName
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(200).json({
        status: "success",
        message: "Role updated successfully",
        role: {
          id: updatedRole._id,
          name: updatedRole.name,
          displayName: updatedRole.displayName,
          description: updatedRole.description,
          permissions: updatedRole.permissions,
          level: updatedRole.level,
          isActive: updatedRole.isActive
        }
      });

    } catch (error) {
      console.error('Update role error:', error);
      res.status(500).json({
        status: "failed",
        message: "Unable to update role, please try again later"
      });
    }
  };

  // Delete role
  static deleteRole = async (req, res) => {
    try {
      const { roleId } = req.params;
      const adminUser = req.user;

      const role = await Role.findById(roleId);
      if (!role) {
        return res.status(404).json({
          status: "failed",
          message: "Role not found"
        });
      }

      // Check if role is system role
      if (role.isSystemRole) {
        return res.status(403).json({
          status: "failed",
          message: "Cannot delete system roles"
        });
      }

      // Check if role can be deleted (no users assigned)
      const canDelete = await role.canBeDeleted();
      if (!canDelete) {
        return res.status(409).json({
          status: "failed",
          message: "Cannot delete role. There are users assigned to this role."
        });
      }

      // Delete role
      await Role.findByIdAndDelete(roleId);

      // Log the action
      await AuditLog.logAction({
        userId: adminUser._id,
        userRole: adminUser.role,
        action: 'role_delete',
        resource: 'role',
        resourceId: roleId,
        details: {
          roleName: role.name,
          displayName: role.displayName
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(200).json({
        status: "success",
        message: "Role deleted successfully"
      });

    } catch (error) {
      console.error('Delete role error:', error);
      res.status(500).json({
        status: "failed",
        message: "Unable to delete role, please try again later"
      });
    }
  };

  // Get available permissions
  static getAvailablePermissions = async (req, res) => {
    try {
      const permissions = [
        { key: 'read', description: 'Read access to data' },
        { key: 'write', description: 'Write/modify data' },
        { key: 'submit', description: 'Submit forms and documents' },
        { key: 'assist', description: 'Assist other users' },
        { key: 'verify_stamp', description: 'Verify stamp duty calculations' },
        { key: 'verify_trustee', description: 'Verify trustee details' },
        { key: 'verify_land', description: 'Verify land/plot details' },
        { key: 'approve', description: 'Approve documents and forms' },
        { key: 'lock', description: 'Lock documents and forms' },
        { key: 'audit', description: 'Access audit logs and reports' },
        { key: 'manage_staff', description: 'Manage staff accounts and roles' }
      ];

      res.status(200).json({
        status: "success",
        message: "Available permissions retrieved successfully",
        permissions
      });

    } catch (error) {
      console.error('Get permissions error:', error);
      res.status(500).json({
        status: "failed",
        message: "Unable to retrieve permissions, please try again later"
      });
    }
  };
}

export default RoleController;
